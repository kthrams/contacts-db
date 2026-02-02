import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { GmailConnect } from '@/components/gmail-connect';
import { LinkedInUpload } from '@/components/linkedin-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if Google is connected
  const { data: googleTokens } = await supabase
    .from('google_tokens')
    .select('email')
    .eq('user_id', user.id)
    .single();

  // Consider connected if we have tokens OR if we just successfully connected
  const isGoogleConnected = !!googleTokens?.email ||
    params.success === 'google_synced' ||
    params.success === 'google_connected';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Import Contacts</h1>
          <p className="text-gray-500 mt-1">
            Import contacts from Gmail or LinkedIn
          </p>
        </div>

        {params.success === 'google_synced' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <p className="font-medium">Google account connected and contacts imported!</p>
            <p className="text-sm mt-1">
              {params.imported || 0} contacts imported
              {params.skipped && parseInt(params.skipped) > 0 && `, ${params.skipped} duplicates skipped`}
            </p>
          </div>
        )}

        {params.success === 'google_connected' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Google account connected successfully! Click &quot;Sync Now&quot; to import your contacts.
          </div>
        )}

        {params.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {params.error === 'google_auth_denied'
              ? 'Google authorization was denied. Please try again.'
              : 'An error occurred. Please try again.'}
          </div>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📧</span>
                Google Contacts
              </CardTitle>
              <CardDescription>
                Sync contacts from your Google account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GmailConnect
                isConnected={isGoogleConnected}
                connectedEmail={googleTokens?.email || null}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">💼</span>
                LinkedIn Export
              </CardTitle>
              <CardDescription>
                Upload your LinkedIn connections CSV export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LinkedInUpload />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
