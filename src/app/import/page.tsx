import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { LinkedInUpload } from '@/components/linkedin-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Import Contacts</h1>
          <p className="text-gray-500 mt-1">
            Import contacts from LinkedIn
          </p>
        </div>

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
      </main>
    </div>
  );
}
