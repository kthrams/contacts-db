import { createClient } from '@/lib/supabase/server';
import { parseLinkedInCSV } from '@/lib/linkedin/parse';
import { inferTags } from '@/lib/tagging';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const csvContent = await file.text();
    const linkedInContacts = parseLinkedInCSV(csvContent);

    if (linkedInContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts found in CSV' },
        { status: 400 }
      );
    }

    // Get existing emails and LinkedIn URLs to check for duplicates
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email, linkedin_url')
      .eq('user_id', user.id);

    const existingEmails = new Set(
      (existingContacts || [])
        .map((c) => c.email?.toLowerCase())
        .filter(Boolean)
    );

    const existingLinkedInUrls = new Set(
      (existingContacts || [])
        .map((c) => normalizeLinkedInUrl(c.linkedin_url))
        .filter(Boolean)
    );

    // Filter out duplicates
    const newContacts = linkedInContacts
      .filter((contact) => {
        // Check email
        if (contact.email && existingEmails.has(contact.email.toLowerCase())) {
          return false;
        }
        // Check LinkedIn URL
        if (contact.linkedin_url && existingLinkedInUrls.has(normalizeLinkedInUrl(contact.linkedin_url))) {
          return false;
        }
        return true;
      })
      .map((contact) => ({
        full_name: contact.full_name,
        email: contact.email,
        company: contact.company,
        job_title: contact.job_title,
        linkedin_url: contact.linkedin_url,
        source: 'linkedin_csv',
        tags: inferTags({ job_title: contact.job_title, company: contact.company }),
        user_id: user.id,
      }));

    let imported = 0;
    const skipped = linkedInContacts.length - newContacts.length;

    // Insert new contacts in batches
    if (newContacts.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < newContacts.length; i += batchSize) {
        const batch = newContacts.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('contacts')
          .insert(batch);

        if (insertError) {
          console.error('Error inserting contacts:', insertError);
        } else {
          imported += batch.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: linkedInContacts.length,
    });
  } catch (err) {
    console.error('Error importing LinkedIn contacts:', err);
    return NextResponse.json(
      { error: 'Failed to parse CSV file' },
      { status: 500 }
    );
  }
}

function normalizeLinkedInUrl(url: string | null): string | null {
  if (!url) return null;
  // Extract the username from LinkedIn URL
  const match = url.match(/linkedin\.com\/in\/([^/]+)/);
  return match ? match[1].toLowerCase() : null;
}
