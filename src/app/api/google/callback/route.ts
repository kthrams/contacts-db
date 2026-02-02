import { createClient } from '@/lib/supabase/server';
import { getTokensFromCode } from '@/lib/google/auth';
import { getGoogleUserEmail, fetchGoogleContacts } from '@/lib/google/people';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/import?error=google_auth_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/import?error=no_code`);
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  try {
    const tokens = await getTokensFromCode(code);

    // Get the user's Google email
    const googleEmail = await getGoogleUserEmail({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expiry_date: tokens.expiry_date!,
    });

    // Store tokens in database
    const { error: upsertError } = await supabase
      .from('google_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        email: googleEmail,
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Error storing tokens:', upsertError);
      return NextResponse.redirect(`${origin}/import?error=token_storage`);
    }

    // Auto-sync contacts immediately after connecting
    try {
      const googleContacts = await fetchGoogleContacts({
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
        expiry_date: tokens.expiry_date!,
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

      // Filter out duplicates
      const newContacts = googleContacts
        .filter((contact) => {
          if (!contact.email) return true;
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

      if (newContacts.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < newContacts.length; i += batchSize) {
          const batch = newContacts.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from('contacts')
            .insert(batch);

          if (!insertError) {
            imported += batch.length;
          }
        }
      }

      const skipped = googleContacts.length - newContacts.length;
      return NextResponse.redirect(
        `${origin}/import?success=google_synced&imported=${imported}&skipped=${skipped}`
      );
    } catch (syncErr) {
      console.error('Error auto-syncing contacts:', syncErr);
      // Still redirect as connected, just couldn't auto-sync
      return NextResponse.redirect(`${origin}/import?success=google_connected`);
    }
  } catch (err) {
    console.error('Error exchanging code for tokens:', err);
    return NextResponse.redirect(`${origin}/import?error=token_exchange`);
  }
}
