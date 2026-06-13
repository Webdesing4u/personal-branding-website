import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';

// ISR — page is statically generated, revalidated every hour.
// Admin mutations also trigger instant revalidatePath('/blog').
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog | Emran Hossain',
  description:
    'Lessons from building products, growing businesses and shipping code — by Emran Hossain.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Emran Hossain',
    description: 'Lessons from building products, growing businesses and shipping code.',
    type: 'website',
  },
};

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    include: { category: true },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <h1 className="text-4xl font-bold text-white">Writing &amp; Insights</h1>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-emerald-500/40"
          >
            {post.featuredImage && (
              <div className="relative h-56 w-full overflow-hidden">
                {/* next/image — automatic optimization, lazy loading, AVIF/WebP */}
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-7">
              <p className="text-xs text-emerald-400">{post.category?.name}</p>
              <h2 className="mt-2 text-xl font-bold text-white group-hover:text-emerald-400">
                {post.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-slate-400">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
