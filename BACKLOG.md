# Contacts DB - Feature Backlog

This document contains the prioritized backlog of deferred and proposed features for the Contacts DB CRM. Features are organized by priority tier based on value to Andrea, who manages founder and investor contacts.

**Value criteria:**
- List comprehensiveness (more contacts, more sources)
- Useful details/attributes about each contact
- Actionable insights

---

## P0 - Next Sprint

These features deliver immediate, high-impact value and should be built first.

### De-duplication Merge Workflow UI
**Description:** Interactive UI to identify, review, and merge duplicate contacts. Show side-by-side comparison of potential duplicates with ability to select which fields to keep from each record.

**Value:** Critical for data quality. As contacts flow in from Gmail, LinkedIn, and future sources, duplicates are inevitable. Clean data is foundational—every other feature depends on accurate, deduplicated contacts.

---

### Bulk Enrichment for Existing Contacts
**Description:** One-click or batch operation to run AI enrichment (via Gemini) on contacts that were imported before enrichment was available, or to refresh stale data.

**Value:** Dramatically increases the depth of information across the entire contact database. Transforms a basic list into a rich, actionable dataset. High leverage—one action improves hundreds of contacts.

---

### Complex Filters (Stage, Industry, Last Contact Date)
**Description:** Advanced filtering UI with multiple criteria: investor stage focus, industry/sector, last interaction date, location, check size, and custom tags. Support for AND/OR logic and saved filter presets.

**Value:** Enables Andrea to quickly surface exactly the right contacts for any situation—"Show me Series A investors in fintech I haven't talked to in 90 days." Transforms the database from a list into a targeting tool.

---

### Tags Management UI (Full CRUD)
**Description:** Complete interface for creating, editing, renaming, merging, and deleting tags. Bulk tag assignment/removal. Tag search and organization.

**Value:** Tags are the primary way Andrea will organize and segment contacts. Full CRUD enables flexible, evolving categorization as her mental model of relationships develops.

---

## P1 - Soon

High-value features that build on the foundation.

### Founder-Investor Matching
**Description:** AI-powered suggestions for potential introductions between founders and investors in the database. Match based on stage focus, sector alignment, check size, and geographic preferences. Show match score and reasoning.

**Value:** This is the killer feature for someone managing both founders and investors. Proactively surfaces introduction opportunities that would otherwise require manual mental matching. Directly enables Andrea's core job of connecting the right people.

---

### Interaction History / Meeting Notes
**Description:** Log of all interactions with each contact—meetings, calls, emails, intros made. Rich text notes with timestamps. Search across all notes.

**Value:** Context is everything in relationship management. "What did we discuss last time?" is a constant question. Historical record prevents awkward re-introductions and enables more meaningful follow-ups.

---

### Reminders to Follow Up
**Description:** Set reminders on contacts for follow-up. Snooze options. Daily/weekly digest of due follow-ups. Smart suggestions based on last contact date.

**Value:** Relationships decay without nurturing. Automated reminders ensure no important contact falls through the cracks. Converts passive database into active relationship management system.

---

### Google Sheets Export (One-Click)
**Description:** Direct export to Google Sheets with one click. Option to create new sheet or update existing one. Maintain formatting and structure.

**Value:** Google Sheets is often the "operating system" for sharing and collaboration. One-click export removes friction for sharing subsets of contacts, creating mail merge lists, or collaborating with team members who don't have CRM access.

---

### Generic CSV Import with Column Mapping
**Description:** Import contacts from any CSV source with interactive column mapping UI. Preview data before import. Handle various date formats and field types.

**Value:** Unlocks importing contacts from any source—conference attendee lists, other CRMs, exported databases, event lists. Major contributor to list comprehensiveness.

---

### Luma Integration
**Description:** Sync contacts from Luma events. Import attendee lists from hosted events. Track which events contacts have attended.

**Value:** Events are a primary source of new contacts for networkers. Automated Luma sync captures contacts from events without manual data entry. Event attendance is valuable context for relationships.

---

## P2 - Later

Valuable features that extend capabilities significantly.

### Email Integration (View Email Threads)
**Description:** Display email thread history with each contact directly in their profile. Search emails. Show last email date and whether awaiting response.

**Value:** Email is the primary communication channel. Seeing full email history without leaving the CRM provides essential context. "Awaiting response" status is actionable intelligence.

---

### Introduction Request Tracking
**Description:** Track requests for introductions—who asked, to whom, status (pending, made, declined), and outcomes. Notes on why intro was/wasn't made.

**Value:** Intros are a core activity in Andrea's role. Tracking prevents dropped balls, enables follow-up on made intros, and creates a record of social capital exchanged.

---

### Calendar Integration
**Description:** Sync with Google Calendar. See upcoming meetings with contacts. Auto-log past meetings as interactions. Create meetings directly from contact profile.

**Value:** Calendar is ground truth for interactions. Auto-logging meetings eliminates manual entry. Seeing upcoming meetings surfaces relevant contacts for prep.

---

### Relationship Strength Scoring
**Description:** Algorithmic score (1-10) for relationship strength based on frequency of contact, recency, interaction types, and manual adjustments. Visual indicators on contact list.

**Value:** At scale, it's impossible to remember relationship depth with hundreds of contacts. Scoring surfaces strong relationships to leverage and weak ones to nurture.

---

### Contact Sharing / Export for Intros
**Description:** Generate shareable contact card or profile link for making introductions. Include only appropriate fields. Track when shared and with whom.

**Value:** Streamlines the intro workflow. Professional, consistent format for sharing contacts. Tracking provides accountability.

---

### Automated Hourly Sync
**Description:** Background job that syncs Gmail contacts hourly. Configurable sync frequency. Notification on new contacts added. Sync status dashboard.

**Value:** Ensures database is always current without manual intervention. New contacts appear automatically shortly after connection.

---

### Chrome Extension for Quick Add
**Description:** Browser extension to quickly add contacts from LinkedIn profiles, websites, or email signatures. One-click capture with auto-fill from page data.

**Value:** Reduces friction of adding contacts discovered while browsing. Capture in the moment rather than "I'll add them later" (which never happens).

---

## P3 - Someday

Lower priority or higher complexity features for future consideration.

### Deal/Pipeline Tracking for Investors
**Description:** Track deals in pipeline for investor contacts—stage, amount, company, next steps. Kanban view of deal flow. Associate multiple contacts with deals.

**Value:** Relevant if Andrea tracks investor deal activity. Extends CRM into lightweight deal flow management. May be overkill if separate deal tracking exists.

---

### Portfolio Company Tracking
**Description:** For investor contacts, track their portfolio companies. Link to founder contacts at those companies. Show portfolio overlap between investors.

**Value:** Enriches investor profiles with portfolio data. Surfaces "warm intro" paths through portfolio connections.

---

### Founder Company Milestones Tracking
**Description:** Track key milestones for founder contacts' companies—funding rounds, launches, pivots, exits. Timeline view of company journey.

**Value:** Context on where companies are in their journey. Useful for timing outreach and understanding current needs.

---

### Fund Performance Notes
**Description:** For investor contacts, track notes on fund performance, deployment pace, and investment thesis evolution.

**Value:** Useful context for matching founders to investors. Lower priority as this info is often sensitive/unavailable.

---

### Mobile App
**Description:** Native mobile app (iOS/Android) for on-the-go access. Quick add contacts after meetings. View contact details before calls.

**Value:** Useful but high development cost. Mobile web may suffice for many use cases. Consider after core features are solid.

---

## Future Ideas Parking Lot

Ideas to revisit as the product evolves:

- **AI-powered contact suggestions:** "You should connect with X based on your network"
- **Network graph visualization:** See how contacts are connected to each other
- **Warm intro path finding:** Find connection paths between any two people
- **Email template library:** Quick templates for common outreach types
- **Meeting prep briefs:** AI-generated summaries before meetings with a contact
- **Social media monitoring:** Track contacts' LinkedIn/Twitter activity
- **News alerts:** Notifications when contacts are mentioned in news
- **API access:** Enable integrations with other tools in Andrea's workflow
