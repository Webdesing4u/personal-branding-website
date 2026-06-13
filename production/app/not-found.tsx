// Global 404 — App Router renders this for any unmatched route and for
// notFound() calls without a closer not-found boundary.
// Returns a real HTTP 404 status (SEO-correct), with recovery navigation.

import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <p className="text-7xl font-bold text-emerald-500/30">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-md text-slate-400">
        The link may be outdated, or the content may have been moved or unpublished.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          ← Back to Home
        </Link>
        <Link
          href="/blog"
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-emerald-500/60"
        >
          Browse the Blog
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-emerald-500/60"
        >
          Report a broken link
        </Link>
      </div>
    </div>
  );
}
