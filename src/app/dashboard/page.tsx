import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ContactTable } from '@/components/contact-table';
import { Contact } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10000);

  if (error) {
    console.error('Error fetching contacts:', error);
  }

  return (
    <AppShell userEmail={user.email}>
      <ContactTable contacts={(contacts as Contact[]) || []} />
    </AppShell>
  );
}
