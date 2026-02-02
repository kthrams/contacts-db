# Contacts DB

A lightweight CRM for managing founder and investor contacts.

**Live at:** https://contacts-db.thramsy.com/

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres + Auth)
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Key Features

- Magic link authentication (Supabase Auth)
- LinkedIn CSV import with auto-tagging
- Google Contacts sync (People API)
- Contact search and tag filtering
- CSV export

## Auto-Tagging Logic

Located in `src/lib/tagging.ts`. Two tags: **Founder** and **Investor**.

| Tag | Detection |
|-----|-----------|
| Founder | Job title contains: `founder`, `co-founder`, `cofounder` |
| Investor | Company contains: `capital`, `ventures`, `fund` (with exclusions) OR job title contains `investor` |

**Exclusions** (not tagged as Investor): Capital One, Human Capital, Working Capital, etc.

## Architecture Decisions

1. **No AI enrichment currently** - Removed Gemini integration because it lacked web access and returned "other" for most contacts. May add back later with a web-search-enabled model.

2. **Keyword-based tagging** - Chose simple, predictable rules over AI classification for reliability.

3. **Supabase max rows = 10,000** - Configured in Supabase API settings. App queries also use `.limit(10000)`.

## Database Schema

See `supabase/schema.sql`. Key table is `contacts` with fields:
- full_name, email, company, job_title, linkedin_url, phone, photo_url
- tags (text array)
- source ('manual', 'gmail', 'linkedin_csv')
- user_id (references auth.users)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

Note: `GOOGLE_AI_API_KEY` was removed when we removed AI enrichment.

## Future Work

See `BACKLOG.md` for planned features including:
- AI enrichment with web search
- De-duplicate/merge contacts
- Hourly auto-sync for Gmail
