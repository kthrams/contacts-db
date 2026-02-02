import { parse } from 'csv-parse/sync';

interface LinkedInContact {
  full_name: string;
  email: string | null;
  company: string | null;
  job_title: string | null;
  linkedin_url: string | null;
}

type CSVRow = Record<string, string>;

export function parseLinkedInCSV(csvContent: string): LinkedInContact[] {
  // LinkedIn exports have a "Notes" section at the top before the actual CSV data
  // We need to find the header row which starts with "First Name"
  const lines = csvContent.split('\n');
  let headerIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('First Name')) {
      headerIndex = i;
      break;
    }
  }

  // Rejoin from the header row onwards
  const cleanedCSV = lines.slice(headerIndex).join('\n');

  const records = parse(cleanedCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[];

  const contacts: LinkedInContact[] = [];

  for (const row of records) {
    const firstName = row['First Name'] || '';
    const lastName = row['Last Name'] || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Skip if no name
    if (!fullName) continue;

    contacts.push({
      full_name: fullName,
      email: row['Email Address'] || null,
      company: row['Company'] || null,
      job_title: row['Position'] || null,
      linkedin_url: row['URL'] || null,
    });
  }

  return contacts;
}
