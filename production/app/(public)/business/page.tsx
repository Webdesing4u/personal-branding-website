import type { Metadata } from 'next';
import Image from 'next/image';
import { db } from '@/lib/db';

export const revalidate = 3600; // ISR

export const metadata: Metadata = {
  title: 'Business Ventures',
  description:
    'Companies founded and built by Emran Hossain — DevCraft Agency, TaskFlow SaaS, and more across agency, SaaS, e-commerce and consulting.',
  alternates: { canonical: '/business' },
};

export default async function BusinessPage() {
  const ventures = await db.businessVenture.findMany({
    orderBy: [{ isFeatured: 'desc' }, { startDate: 'asc' }],
    include: { category: true },
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL!;

  // Organization structured data — one per venture, founder linked to Person schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': ventures.map((v) => ({
      '@type': 'Organization',
      '@id': `${base}/business#${v.slug}`,
      name: v.name,
      description: v.description,
      url: v.websiteUrl || undefined,
      logo: v.logoUrl || undefined,
      foundingDate: v.startDate?.toISOString().slice(0, 10),
      founder: {
        '@type': 'Person',
        name: 'Emran Hossain',
        url: base,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-4xl font-bold text-white">Ventures &amp; Companies</h1>
      <p className="mt-4 max-w-2xl text-slate-400">
        The businesses I&apos;ve founded, co-founded and helped build.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ventures.map((v) => (
          <div
            key={v.id}
            id={v.slug}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7"
          >
            {v.logoUrl ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                <Image src={v.logoUrl} alt={`${v.name} logo`} fill sizes="48px" className="object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-xl font-bold text-emerald-400">
                {v.name.charAt(0)}
              </div>
            )}
            <h2 className="mt-4 text-lg font-semibold text-white">{v.name}</h2>
            <p className="mt-0.5 text-sm text-emerald-400">{v.industry}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{v.description}</p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-sm">
              <span className="text-slate-300">{v.role}</span>
              {v.websiteUrl && (
                <a href={v.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold text-emerald-400">
                  Website ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
