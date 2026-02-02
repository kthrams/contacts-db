import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/header';
import { ContactForm } from '@/components/contact-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function NewContactPage() {
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
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Contacts
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            Add New Contact
          </h1>
        </div>

        <ContactForm mode="create" />
      </main>
    </div>
  );
}
