import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

// Auto-generated sitemap from the database — served at /sitemap.xml
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;

  const [posts, projects, ventures] = await Promise.all([
    db.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    db.portfolioProject.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    db.businessVenture.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    '', '/about', '/cv', '/portfolio', '/business', '/blog', '/gallery', '/contact',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  return [
    ...staticPages,
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${base}/portfolio/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...ventures.map((v) => ({
      url: `${base}/business#${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
