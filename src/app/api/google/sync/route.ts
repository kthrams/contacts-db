import { createClient } from '@/lib/supabase/server';
import { fetchGoogleContacts } from '@/lib/google/people';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get stored tokens
  const { data: tokenData, error: tokenError } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (tokenError || !tokenData) {
    return NextResponse.json(
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  try {
    // Fetch contacts from Google
    const googleContacts = await fetchGoogleContacts({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    });

    // Get existing emails to check for duplicates
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email')
      .eq('user_id', user.id);

    const existingEmails = new Set(
      (existingContacts || [])
        .map((c) => c.email?.toLowerCase())
        .filter(Boolean)
    );

    // Filter out duplicates and prepare for insert
    const newContacts = googleContacts
      .filter((contact) => {
        // Skip if no email or email already exists
        if (!contact.email) return true; // Keep contacts without email
        return !existingEmails.has(contact.email.toLowerCase());
      })
      .map((contact) => ({
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        job_title: contact.job_title,
        photo_url: contact.photo_url,
        source: 'gmail',
        tags: [],
        user_id: user.id,
      }));

    let imported = 0;
    let skipped = googleContacts.length - newContacts.length;

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
      total: googleContacts.length,
    });
  } catch (err) {
    console.error('Error syncing Google contacts:', err);
    return NextResponse.json(
      { error: 'Failed to sync contacts' },
      { status: 500 }
    );
  }
}
