import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Contact } from '@/types';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('full_name', { ascending: true })
    .limit(10000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = convertToCSV(contacts as Contact[]);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

function convertToCSV(contacts: Contact[]): string {
  const headers = [
    'Full Name',
    'Email',
    'Company',
    'Job Title',
    'LinkedIn URL',
    'Phone',
    'Tags',
    'Source',
    'Created At',
  ];

  const rows = contacts.map((contact) => {
    return [
      escapeCSV(contact.full_name),
      escapeCSV(contact.email || ''),
      escapeCSV(contact.company || ''),
      escapeCSV(contact.job_title || ''),
      escapeCSV(contact.linkedin_url || ''),
      escapeCSV(contact.phone || ''),
      escapeCSV(contact.tags?.join(', ') || ''),
      escapeCSV(contact.source),
      escapeCSV(contact.created_at),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(value: string): string {
  if (!value) return '';
  // If the value contains a comma, newline, or double quote, wrap it in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
