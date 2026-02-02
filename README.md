# Contacts DB

A lightweight CRM for managing founder and investor contacts.

**Live at:** https://contacts-db.thramsy.com/

## Features

- **Magic Link Auth** - Simple, passwordless login via email
- **LinkedIn Import** - Upload your LinkedIn connections CSV with auto-tagging
- **Auto-Tagging** - Automatically tags contacts as Founder or Investor based on job title and company
- **Contact Management** - View, edit, search, and filter contacts
- **CSV Export** - Export all contacts to CSV

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres)
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Supabase Auth (magic link)

## Setup

### 1. Clone and Install

```bash
cd contacts-db
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings > API** and copy your keys

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Update `NEXT_PUBLIC_APP_URL` to your production URL

## Usage

### Adding Contacts

1. **Manual**: Click "Add Contact" and fill out the form
2. **LinkedIn**: Go to Import → Upload your Connections.csv

### Auto-Tagging

When importing from LinkedIn, contacts are automatically tagged:
- **Founder**: Job title contains "founder", "co-founder", or "cofounder"
- **Investor**: Company name contains "capital", "ventures", or "fund" (with exclusions for false positives like "Capital One")

### Exporting

Click "Export CSV" on the dashboard to download all contacts.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── dashboard/          # Main contact list
│   ├── contacts/           # Contact detail/new
│   ├── import/             # Import page
│   └── login/              # Auth page
├── components/             # React components
├── lib/                    # Utility libraries
│   ├── supabase/           # Database client
│   ├── linkedin/           # CSV parser
│   └── tagging.ts          # Auto-tagging logic
└── types/                  # TypeScript types
```

## License

MIT
