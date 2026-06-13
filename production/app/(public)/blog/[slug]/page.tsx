import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/db';
import Markdown from '@/components/Markdown';

export const revalidate = 3600; // ISR

type Props = { params: { slug: string } };

// SSG — pre-render every published post at build time
export async function generateStaticParams() {
  const posts = await db.blogPost.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

// Server-side meta — real SEO, rendered in initial HTML
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  });
  if (!post) return {};

  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  return {
    title: post.metaTitle ?? `${post.title} | Emran Hossain`,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `${base}/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.fullName],
      // opengraph-image.tsx in this folder generates the dynamic OG image
    },
    twitter: { card: 'summary_large_image', title: post.title },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug, status: 'published' },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  });
  if (!post) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL!;

  // Structured data — Google rich results (Article)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.fullName,
      url: base,
    },
    publisher: { '@type': 'Person', name: 'Emran Hossain' },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
    keywords: post.tags.map((t) => t.tag.name).join(', '),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-sm text-emerald-400">{post.category?.name}</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight text-white">{post.title}</h1>
      <p className="mt-4 text-sm text-slate-400">
        By {post.author.fullName} ·{' '}
        {post.publishedAt?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      {post.featuredImage && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}
      <Markdown
        content={post.content}
        className="prose prose-invert prose-emerald mt-10 max-w-none"
      />
      <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-800 pt-6">
        {post.tags.map(({ tag }) => (
          <span key={tag.id} className="rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300">
            #{tag.name}
          </span>
        ))}
      </div>
    </article>
  );
}
