import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { LinkedInUpload } from '@/components/linkedin-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell userEmail={user.email}>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Import Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Import contacts from LinkedIn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
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
    </AppShell>
  );
}
