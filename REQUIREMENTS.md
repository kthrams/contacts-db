# Andrea's Contact Database

A lightweight CRM for managing founder and investor contacts, with AI-assisted enrichment.

## Overview

**Client**: Andrea
**Purpose**: Create and maintain a database of professional contacts (primarily founders and investors) aggregated from multiple sources, enriched with contextual information.

---

## Core Features

### 1. Contact Management

**Basic Contact Information**
- Full name
- Email address(es)
- Company name
- Job title / Role
- LinkedIn URL
- Phone number (optional)
- Profile photo (optional)

**Categorization**
- Multiple tags per contact (not mutually exclusive)
- Tag examples: `Founder`, `Investor`, `VC`, `Angel`, `Advisor`, `LP`, `Operator`
- Custom tags can be added

**Interaction History**
- Source of contact (where/how they met)
- First contact date
- Last contact date
- Free-form notes
- Meeting/conversation log

### 2. Contact Enrichment

**For Investors**
- Fund name
- Fund size (if known)
- Typical check size
- Investment stage focus (Pre-seed, Seed, Series A, etc.)
- Industry/sector focus
- Notable portfolio companies
- Investment thesis notes

**For Founders**
- Company name
- Company stage (Idea, Pre-seed, Seed, Series A+, Growth, etc.)
- Industry/sector
- Funding raised to date
- Employee count (approximate)
- Company description

**Enrichment Approach**
- AI-assisted enrichment at time of contact creation (one-time)
- All fields manually editable afterward
- No ongoing automated enrichment (future consideration)

### 3. Data Sources

Contacts can be imported from multiple sources. API access needs to be researched for each:

| Source | Import Method | Status |
|--------|---------------|--------|
| Gmail | OAuth + Google People API | MVP feature |
| LinkedIn | Manual CSV export | MVP feature |
| Luma | TBD - Low priority | Deferred |
| CSV Upload | Manual import | MVP feature |
| Manual Entry | Form input | MVP feature |

**Sync Frequency**: Hourly checks for *new* contacts only (once integrations are built). Existing contacts are not automatically refreshed.

### 4. De-duplication

Since contacts are sourced from multiple systems (Gmail, LinkedIn, Luma, CSV), duplicates are likely.

**Duplicate Detection**
- Primary match: Email address (case-insensitive)
- Secondary match: LinkedIn URL
- Fuzzy match: Name + Company combination (for review)

**Merge Workflow**
- When a potential duplicate is detected during import, prompt user to review
- Show side-by-side comparison of existing vs. new contact
- Allow user to:
  - Merge (combine data from both records)
  - Keep separate (mark as distinct contacts)
  - Skip import (discard the new record)
- When merging, prefer the most recent/complete data for each field

**Periodic Duplicate Scan**
- Manual trigger to scan entire database for potential duplicates
- Surface fuzzy matches for user review

### 5. Gmail Integration (People API)

**Authentication Flow**
1. User clicks "Connect Gmail" → redirected to Google OAuth consent screen
2. User grants the following scopes:
   - `https://www.googleapis.com/auth/contacts.readonly` (read Google Contacts)
   - `https://www.googleapis.com/auth/spreadsheets` (create Google Sheets for export)
3. App receives access token + refresh token, stored in database

**Google Cloud Setup**
- Create Google Cloud project (free)
- Enable People API (for contacts) and Sheets API (for export)
- Configure OAuth consent screen (can stay in "testing" mode for single user)
- Create OAuth 2.0 credentials (client ID + secret)
- Add authorized redirect URI

**Data Extracted from Google Contacts**
- Name
- Email address(es)
- Phone number(s)
- Company / Organization
- Job title
- Photo URL

**Sync Behavior**
- Initial sync: Import all contacts
- Hourly sync: Check for new contacts added since `lastSyncTimestamp`
- Use People API's `syncToken` for efficient incremental sync
- New contacts go through de-duplication before import

**Future Enhancement**: Add Gmail API (`gmail.readonly`) to scan email headers and extract contacts from correspondents not saved in Google Contacts.

### 6. Search & Filter

- Full-text search across all fields
- Filter by tags
- Filter by investor stage focus
- Filter by founder company stage
- Filter by industry/sector
- Filter by last contact date

---

## Future Features (Phase 2)

### Email Management
- Send emails directly from the app
- Email templates
- Track email opens/replies
- Scheduled follow-ups

### Contact Management
- Reminders to reach out
- "Haven't contacted in X days" alerts
- Relationship strength scoring
- Introduction request tracking

---

## Technical Requirements

### Access
- Single user (Andrea only)
- Accessible from any device via web browser
- Simple authentication (password or magic link)

### Hosting & Infrastructure
- Free tier services only
- Suggested stack:
  - **Frontend/Backend**: Next.js on Vercel (free tier)
  - **Database**: Supabase (free tier) or PlanetScale (free tier)
  - **AI Enrichment**: OpenAI API (pay-per-use, minimal cost)

### Data Privacy
- All contact data stored securely
- No sharing with third parties
- Export functionality for data portability

---

## App Structure & UI

### Screens

| Screen | Purpose |
|--------|---------|
| **Login** | Single-user auth (magic link or password) |
| **Dashboard** | Contact list with search/filters (main view) |
| **Contact Detail** | View/edit individual contact, see enrichment data |
| **Import** | Upload CSV, upload LinkedIn export, connect Gmail |
| **Settings** | Manage Gmail connection, export data, find duplicates |

### Dashboard (Main View)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Search...]                    [+ Add Contact]  [Import]       │
├─────────────────────────────────────────────────────────────────┤
│  Filters: [Tags ▼] [Stage ▼] [Industry ▼] [Last Contact ▼]     │
├─────────────────────────────────────────────────────────────────┤
│  ☑ Select All                              [Export ▼] [Delete]  │
├─────────────────────────────────────────────────────────────────┤
│  ☐  John Smith     john@acme.co     Founder    Seed    Tech     │
│  ☐  Jane Doe       jane@vc.com      Investor   Series A  ...    │
│  ☐  ...                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Import Screen

Central place for all data imports:

```
┌─────────────────────────────────────────────────────────────────┐
│  Import Contacts                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📧 Google Contacts                                      │   │
│  │                                                         │   │
│  │  Sync contacts from your Google account.                │   │
│  │  Status: ✅ Connected (kevin@gmail.com)                 │   │
│  │  Last sync: Jan 30, 2026 at 2:15 PM                     │   │
│  │                                                         │   │
│  │  [Sync Now]  [Disconnect]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💼 LinkedIn Export                                      │   │
│  │                                                         │   │
│  │  Upload your LinkedIn connections CSV export.           │   │
│  │  (Settings → Data Privacy → Get a copy of your data)    │   │
│  │                                                         │   │
│  │  [Upload CSV]                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📄 Generic CSV                                          │   │
│  │                                                         │   │
│  │  Upload any CSV with contact data.                      │   │
│  │  Map columns to fields after upload.                    │   │
│  │                                                         │   │
│  │  [Upload CSV]                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Google Contacts Flow:**
1. If not connected: Show "Connect Gmail" button
2. Click → OAuth flow → consent screen → redirect back
3. Once connected: Show account email, last sync time, "Sync Now" button
4. Automatic hourly sync runs in background (new contacts only)

**LinkedIn Upload Flow:**
1. User exports connections from LinkedIn (Settings → Data Privacy → Get a copy of your data)
2. User clicks "Upload CSV" and selects the `Connections.csv` file
3. App parses LinkedIn CSV format (known column structure)
4. Preview imported contacts → de-duplication check → confirm import

### Settings Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  Settings                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Connected Accounts                                             │
│  ─────────────────                                              │
│  Google: kevin@gmail.com  [Disconnect]                          │
│                                                                 │
│  Export Data                                                    │
│  ───────────                                                    │
│  [Download CSV]  [Download JSON]  [Export to Google Sheets]     │
│                                                                 │
│  Data Management                                                │
│  ───────────────                                                │
│  [Find Duplicates] - Scan database for potential duplicates     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Export Options

| Option | Description |
|--------|-------------|
| **Download CSV** | Instant download of selected or all contacts |
| **Download JSON** | Full data export for portability |
| **Export to Google Sheets** | One-click: creates new Sheet in user's Google Drive with all contact data, returns link (uses `spreadsheets` scope from initial Google auth) |

### Design System

**Tech Stack**: Tailwind CSS + shadcn/ui
- Tailwind for utility-first styling with consistent spacing/colors
- shadcn/ui for pre-built, accessible React components (buttons, modals, tables, dropdowns, forms)
- Components copied into codebase, fully customizable

**Visual Design**

| Element | Approach |
|---------|----------|
| **Colors** | Neutral gray palette with one accent color (blue or indigo). Dark text on light backgrounds. Subtle borders. |
| **Typography** | Inter or system font stack. 14-16px base size. Clear hierarchy. |
| **Spacing** | Consistent 4px/8px grid. Generous whitespace. Cards with subtle shadows or borders. |
| **Components** | Rounded corners (6-8px). Subtle hover states. No harsh borders. Muted backgrounds for sections. |
| **Tables** | Clean rows with hover highlight. Sticky headers. Minimal gridlines. |
| **Forms** | Clear labels, focus rings, inline validation. |

**Comparable Products** (aesthetic benchmarks):
- **Linear** — gold standard for clean SaaS UI
- **Notion** — clean tables, good whitespace
- **Attio** — modern CRM with clean contact lists
- **Folk** — simple, approachable CRM
- **Vercel Dashboard** — clean settings pages, professional feel

**Vibe**: Linear meets Attio. Clean, minimal, fast-feeling. No gradients, no heavy shadows, no clutter.

**Avoid**: Bright colors everywhere, heavy drop shadows, busy patterns, Bootstrap-default look, cramped layouts, tiny fonts.

---

## MVP Scope

For the initial version, focus on:

1. **Manual contact entry** with full form
2. **CSV import** for bulk upload (generic + LinkedIn format)
3. **Gmail integration** via Google People API
4. **AI enrichment** on contact creation (using OpenAI)
5. **Contact list view** with search and filters
6. **Contact detail view** with edit capability
7. **Tag management**
8. **De-duplication** on import with merge workflow
9. **Export** to CSV, JSON, and Google Sheets
10. **Basic authentication** (single user)

**Out of scope for MVP**:
- Luma integration
- Email sending
- Automated reminders
- Mobile app (web responsive is sufficient)

---

## Open Questions

1. ~~**Email integration**: Which email provider does Andrea use?~~ **Decided**: Gmail (testing with Kevin's account first)

2. ~~**LinkedIn**: LinkedIn's API is restricted.~~ **Decided**: Manual CSV export for MVP

3. ~~**Luma**: Is this a priority?~~ **Decided**: Deferred, low priority unless easy API exists

4. **AI model**: Which LLM for enrichment? OpenAI GPT-4 is capable but has per-token costs. Alternatives exist.

5. ~~**Deduplication**: How to handle duplicate contacts?~~ **Decided**: Match by email (primary), LinkedIn URL (secondary), fuzzy name+company (for review)

---

## Success Metrics

- Andrea can add a new contact in under 2 minutes
- Andrea can find any contact in under 10 seconds
- All contacts have accurate stage and industry information
- System is reliable and accessible 99%+ of the time
