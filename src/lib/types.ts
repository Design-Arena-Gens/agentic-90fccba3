export type VisaStatus = 'mentioned' | 'relocation_only' | 'not_mentioned';

export interface JobListing {
  id: string;
  source: string;
  title: string;
  company: string;
  country: string;
  city?: string;
  locationLabel: string;
  onsite: boolean;
  visaStatus: VisaStatus;
  visaEvidence?: string;
  relocationSupport: boolean;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  matchReason: string;
  summary: string;
}

