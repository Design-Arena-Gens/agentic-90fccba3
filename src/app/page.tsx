import { Suspense } from 'react';
import Link from 'next/link';
import { fetchCuratedJobs } from '@/lib/jobs';
import { JobCard } from '@/components/job-card';

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`loading-card-${index}`} className="h-40 animate-pulse rounded-2xl bg-white/60 shadow-sm dark:bg-slate-800/60" />
      ))}
    </div>
  );
}

export default async function Home() {
  const jobs = await fetchCuratedJobs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 sm:pt-20 lg:px-10">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-xl backdrop-blur-xl sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Marwen Slimen • Visa Ready</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Curated on-site marketing roles with visa sponsorship potential
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-200/80 sm:text-lg">
                Live opportunities aligned with your 1.5+ years across digital marketing, content, social media, video
                production, WordPress, and SEO. Prioritized for the UK, Netherlands, Belgium, Ireland, and Italy — with
                relocation or visa signals surfaced up-front.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/20 bg-slate-900/40 px-6 py-5 text-sm">
              <span className="text-xs uppercase tracking-wide text-slate-400">Snapshot</span>
              <div className="text-3xl font-semibold text-emerald-300">{jobs.length}</div>
              <p className="text-slate-300">matching roles</p>
              <Link
                href="https://landing.jobs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-300/20"
              >
                Data source ↗
              </Link>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Priority Listings</h2>
            <p className="text-sm text-slate-300/80">
              Roles ranked by visa visibility, marketing focus, and alignment with your portfolio strengths.
            </p>
          </div>
          <Suspense fallback={<LoadingState />}>
            <div className="grid gap-6 md:grid-cols-2">
              {jobs.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-slate-200 sm:col-span-2">
                  No suitable roles surfaced right now. Try again later today — sources refresh hourly.
                </div>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </Suspense>
        </section>

        <footer className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/40 p-8 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-100">Next move</p>
            <p className="text-slate-300/80">
              Apply directly via the links above and reference your portfolio (insert your portfolio link) in outreach.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://landing.jobs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-300/10"
            >
              Refresh sources ↗
            </a>
            <a
              href="https://cal.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
            >
              Schedule outreach prep ↗
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
