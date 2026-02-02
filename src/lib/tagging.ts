/**
 * Keyword-based tagging for contacts
 * Analyzes job title and company to assign relevant tags
 *
 * Available tags: Founder, Investor
 */

// Keywords in JOB TITLE that indicate someone is a founder
const FOUNDER_TITLE_KEYWORDS = [
  'founder',
  'co-founder',
  'cofounder',
];

// Keywords in COMPANY NAME that indicate investment firm
const INVESTMENT_FIRM_KEYWORDS = [
  'capital',
  'ventures',
  'fund',
];

// Company names/patterns to EXCLUDE from investor detection
// These contain investment keywords but are NOT investment firms
const INVESTOR_COMPANY_EXCLUSIONS = [
  'capital one',        // Bank
  'human capital',      // HR term
  'working capital',    // Finance term
  'capital group',      // Asset management (not VC)
  'capital iq',         // Data provider
  'capital markets',    // Banking division
  'venture for america', // Non-profit
  'joint venture',      // Business term
  'fund accounting',    // Accounting role
  'fund operations',    // Operations role
  'funded',             // Past tense verb (e.g., "Well Funded Startup")
  'funding',            // Noun (e.g., "Series A Funding")
  'fundrise',           // Real estate platform
];

interface TaggableContact {
  job_title?: string | null;
  company?: string | null;
}

function containsKeyword(text: string | null | undefined, keywords: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

function isExcludedCompany(company: string | null | undefined): boolean {
  if (!company) return false;
  const lower = company.toLowerCase();
  return INVESTOR_COMPANY_EXCLUSIONS.some(exclusion => lower.includes(exclusion));
}

/**
 * Infer tags from job title and company
 * Returns an array of tags that should be applied
 */
export function inferTags(contact: TaggableContact): string[] {
  const tags: Set<string> = new Set();
  const { job_title, company } = contact;

  // === FOUNDER ===
  // Check job title for founder keywords
  if (containsKeyword(job_title, FOUNDER_TITLE_KEYWORDS)) {
    tags.add('Founder');
  }

  // === INVESTOR ===
  // Check if company looks like an investment firm (with exclusions)
  if (containsKeyword(company, INVESTMENT_FIRM_KEYWORDS) && !isExcludedCompany(company)) {
    tags.add('Investor');
  }

  // Also check if job title explicitly mentions investor
  if (containsKeyword(job_title, ['investor'])) {
    tags.add('Investor');
  }

  return Array.from(tags);
}
