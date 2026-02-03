export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string | null;
  company: string | null;
  job_title: string | null;
  linkedin_url: string | null;
  phone: string | null;
  photo_url: string | null;
  source: 'manual' | 'gmail' | 'linkedin_csv';
  tags: string[];
  user_id: string;
}

export interface GoogleTokens {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  email: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export interface UserPreferences {
  user_id: string;
  sort_column: 'full_name' | 'company' | 'tags' | 'source';
  sort_direction: 'asc' | 'desc';
  rows_per_page: 50 | 100 | 1000 | -1; // -1 means "all"
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'user_id'> = {
  sort_column: 'tags',
  sort_direction: 'desc',
  rows_per_page: 50,
};

export const DEFAULT_TAGS = [
  'Founder',
  'Investor',
] as const;
