# Contacts DB

A lightweight CRM for managing founder and investor contacts with AI-assisted enrichment.

## Features

- **Magic Link Auth** - Simple, passwordless login via email
- **Gmail Sync** - Import contacts from Google Contacts
- **LinkedIn Import** - Upload your LinkedIn connections CSV
- **AI Enrichment** - Automatically enrich contacts with investor/founder data using Google Gemini
- **Contact Management** - View, edit, search, and filter contacts
- **CSV Export** - Export all contacts to CSV

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Google Gemini 1.5 Flash (free tier)
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

### 3. Set up Google Cloud (for Gmail sync)

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **People API**
3. Go to **APIs & Services > Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/google/callback`
6. Copy Client ID and Client Secret

### 4. Set up Google AI (for enrichment)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create an API key (free, no billing required)

### 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (for Gmail sync)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your-gemini-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Update `NEXT_PUBLIC_APP_URL` to your production URL
5. Update Google OAuth redirect URI to `https://your-domain.vercel.app/api/google/callback`

## Usage

### Adding Contacts

1. **Manual**: Click "Add Contact" and fill out the form
2. **Gmail**: Go to Import → Connect Gmail → Sync Now
3. **LinkedIn**: Go to Import → Upload your Connections.csv

### AI Enrichment

When viewing or creating a contact, click "Enrich with AI" to automatically:
- Determine if they're an investor or founder
- Pull fund information (for investors)
- Pull company information (for founders)

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
│   ├── google/             # Google OAuth & People API
│   ├── gemini/             # AI enrichment
│   └── linkedin/           # CSV parser
└── types/                  # TypeScript types
```

## License

MIT
