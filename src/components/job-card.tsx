import { formatDistanceToNow } from 'date-fns';
import { JobListing } from '@/lib/types';

type Props = {
  job: JobListing;
};

function formatRelative(dateString?: string): string | null {
  if (!dateString) return null;
  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) return null;
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function JobCard({ job }: Props) {
  const published = formatRelative(job.publishedAt);
  const updated = formatRelative(job.updatedAt);
  const visaLabel =
    job.visaStatus === 'mentioned'
      ? 'Visa sponsorship mentioned'
      : job.visaStatus === 'relocation_only'
        ? 'Relocation support noted'
        : 'Visa sponsorship not mentioned';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white/85 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900/70">
      <div className="flex flex-col gap-4 p-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{job.title}</h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{job.company}</p>
            </div>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Apply
              <span aria-hidden>↗</span>
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>{job.locationLabel}</span>
            <span>On-site</span>
            <span>{job.source}</span>
          </div>
        </header>

        <section className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-medium text-slate-700 dark:text-slate-200">{visaLabel}</p>
          {job.visaEvidence && <p className="text-xs italic text-slate-500 dark:text-slate-400">“{job.visaEvidence}”</p>}
          <p>{job.matchReason}</p>
        </section>

        <footer className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          {published && <span>Posted {published}</span>}
          {!published && updated && <span>Updated {updated}</span>}
          {job.relocationSupport && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Relocation support</span>}
        </footer>
      </div>
    </article>
  );
}

