import { JobListing, VisaStatus } from './types';

type GreenhouseJobListItem = {
  id: number;
  title: string;
  location: { name: string };
  absolute_url: string;
  updated_at?: string;
  first_published?: string;
  internal_job_id?: number;
};

type GreenhouseJobDetail = {
  id: number;
  content: string;
  location: { name: string };
  absolute_url: string;
  updated_at?: string;
  first_published?: string;
  metadata?: Array<{ name: string; value: string | string[] }>;
  departments?: { name: string }[];
};

type GreenhouseBoardConfig = {
  token: string;
  label: string;
};

const GREENHOUSE_SOURCES: GreenhouseBoardConfig[] = [
  { token: 'stripe', label: 'Stripe' },
  { token: 'intercom', label: 'Intercom' },
  { token: 'adyen', label: 'Adyen' },
  { token: 'bolcom', label: 'bol.com' },
  { token: 'tripadvisor', label: 'Tripadvisor' },
];

const TARGET_COUNTRY_KEYWORDS: Record<string, string[]> = {
  UK: ['united kingdom', 'england', 'london', 'manchester', 'oxford', 'scotland'],
  NL: ['netherlands', 'amsterdam', 'utrecht', 'rotterdam', 'eindhoven'],
  BE: ['belgium', 'brussels', 'antwerp', 'ghent'],
  IE: ['ireland', 'dublin', 'galway'],
  IT: ['italy', 'rome', 'milan', 'turin', 'florence'],
};

const MARKETING_KEYWORDS = [
  /marketing/i,
  /content/i,
  /social/i,
  /campaign/i,
  /growth/i,
  /brand/i,
  /video/i,
  /creative/i,
  /seo/i,
  /communications?/i,
  /partnership/i,
];

const VISA_KEYWORDS = /\bvisa|sponsor|work permit|relocation/i;

function resolveCountry(location: string): string | undefined {
  const lower = location.toLowerCase();
  for (const [country, keywords] of Object.entries(TARGET_COUNTRY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return country;
    }
  }
  return undefined;
}

async function fetchGreenhouseJobs(board: GreenhouseBoardConfig): Promise<GreenhouseJobListItem[]> {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    console.error(`Failed to load board ${board.token}: ${res.status}`);
    return [];
  }

  const data = (await res.json()) as { jobs?: GreenhouseJobListItem[] };
  return data.jobs ?? [];
}

async function fetchGreenhouseJobDetail(board: GreenhouseBoardConfig, jobId: number): Promise<GreenhouseJobDetail | null> {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs/${jobId}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 1800 },
  });
  if (!res.ok) {
    console.error(`Failed to load job detail ${board.token}/${jobId}: ${res.status}`);
    return null;
  }
  return (await res.json()) as GreenhouseJobDetail;
}

function stripHtml(html: string): string {
  return html.replace(/<\/(p|div|li)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectVisaStatus(text: string): { status: VisaStatus; evidence?: string } {
  const match = text.match(VISA_KEYWORDS);
  if (match) {
    const sentence = text.split(/(?<=[.?!])/).find((fragment) => fragment.toLowerCase().includes(match[0].toLowerCase()));
    return {
      status: 'mentioned',
      evidence: sentence?.trim(),
    };
  }
  return { status: 'not_mentioned' };
}

function buildMatchReason(text: string): string {
  if (/wordpress|cms/i.test(text)) return 'Highlights hands-on CMS and WordPress content ownership.';
  if (/social media|community/i.test(text)) return 'Focuses on social media storytelling and community building.';
  if (/video|motion|film|editing/i.test(text)) return 'Requests strong video production and editing skills.';
  if (/seo|organic/i.test(text)) return 'Looks for SEO optimisation and content growth know-how.';
  if (/copy|content/i.test(text)) return 'Centres on content strategy and copy development.';
  if (/campaign|growth|performance/i.test(text)) return 'Focuses on digital campaign execution and performance marketing.';
  if (/creative|design/i.test(text)) return 'Values creative direction and visual storytelling capability.';
  return 'Broad marketing role aligned with your multi-channel experience.';
}

function normalizeTitle(detail: GreenhouseJobDetail, fallbackTitle: string): string {
  const h1Match = detail.content?.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    return stripHtml(h1Match[1]);
  }
  return fallbackTitle;
}

export async function fetchCuratedJobs(): Promise<JobListing[]> {
  const listings: JobListing[] = [];

  for (const board of GREENHOUSE_SOURCES) {
    let jobs: GreenhouseJobListItem[] = [];
    try {
      jobs = await fetchGreenhouseJobs(board);
    } catch (error) {
      console.error(`Board fetch failed for ${board.token}`, error);
      continue;
    }

    const relevant = jobs.filter((job) => {
      const title = job.title ?? '';
      const location = job.location?.name ?? '';

      if (!MARKETING_KEYWORDS.some((kw) => kw.test(title))) {
        return false;
      }

      const country = resolveCountry(location);
      return Boolean(country);
    });

    for (const job of relevant) {
      const country = resolveCountry(job.location.name);
      if (!country) continue;

      let detail: GreenhouseJobDetail | null = null;
      try {
      detail = await fetchGreenhouseJobDetail(board, job.id);
      } catch (error) {
        console.error(`Detail fetch failed for ${board.token}/${job.id}`, error);
      }

      if (!detail) continue;

      const plainText = stripHtml(detail.content ?? '');
      const { status, evidence } = detectVisaStatus(plainText);
      const title = normalizeTitle(detail, job.title);

      listings.push({
        id: `${board.token}-${job.id}`,
        source: board.label,
        title,
        company: board.label,
        country,
        city: job.location.name,
        locationLabel: job.location.name,
        onsite: true,
        visaStatus: status,
        visaEvidence: evidence,
        relocationSupport: /\brelocation\b/i.test(plainText),
        url: detail.absolute_url ?? job.absolute_url,
        publishedAt: detail.first_published ?? job.first_published,
        updatedAt: detail.updated_at ?? job.updated_at,
        matchReason: buildMatchReason(plainText),
        summary: plainText.slice(0, 200),
      });
    }
  }

  return listings.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}
