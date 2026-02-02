import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { ContactForm } from '@/components/contact-form';
import { Contact } from '@/types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !contact) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Contacts
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            Edit Contact
          </h1>
        </div>

        <ContactForm contact={contact as Contact} mode="edit" />
      </main>
    </div>
  );
}
