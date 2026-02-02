import { google } from 'googleapis';
import { getOAuth2Client, setCredentials } from './auth';

interface GoogleContact {
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  photo_url: string | null;
}

export async function fetchGoogleContacts(tokens: {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}): Promise<GoogleContact[]> {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, tokens);

  const people = google.people({ version: 'v1', auth: oauth2Client });

  const contacts: GoogleContact[] = [];
  let nextPageToken: string | undefined;

  do {
    const response = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 1000,
      personFields: 'names,emailAddresses,phoneNumbers,organizations,photos',
      pageToken: nextPageToken,
    });

    const connections = response.data.connections || [];

    for (const person of connections) {
      const name = person.names?.[0];
      const email = person.emailAddresses?.[0];
      const phone = person.phoneNumbers?.[0];
      const org = person.organizations?.[0];
      const photo = person.photos?.[0];

      // Skip contacts without a name
      if (!name?.displayName) continue;

      contacts.push({
        full_name: name.displayName,
        email: email?.value || null,
        phone: phone?.value || null,
        company: org?.name || null,
        job_title: org?.title || null,
        photo_url: photo?.url || null,
      });
    }

    nextPageToken = response.data.nextPageToken || undefined;
  } while (nextPageToken);

  return contacts;
}

export async function getGoogleUserEmail(tokens: {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}): Promise<string | null> {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });

  try {
    const response = await oauth2.userinfo.get();
    return response.data.email || null;
  } catch {
    return null;
  }
}
