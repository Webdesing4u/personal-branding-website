// Scoped 404 for blog posts — fires when notFound() is called in the
// [slug] page (unpublished / deleted / renamed slug). Offers contextual
// recovery instead of the generic global 404.

import Link from 'next/link';

export default function BlogPostNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl">📝</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Post not found</h1>
      <p className="mt-2 text-slate-400">
        This article may have been unpublished, or its URL may have changed.
      </p>
      <Link
        href="/blog"
        className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
      >
        ← All articles
      </Link>
    </div>
  );
}
