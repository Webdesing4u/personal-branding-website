import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/db';
import Markdown from '@/components/Markdown';

export const revalidate = 3600; // ISR

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const projects = await db.portfolioProject.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await db.portfolioProject.findUnique({ where: { slug: params.slug } });
  if (!project) return {};
  return {
    title: `${project.title} | Portfolio | Emran Hossain`,
    description: project.shortDescription ?? undefined,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.shortDescription ?? undefined,
      images: project.featuredImage ? [project.featuredImage] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await db.portfolioProject.findUnique({
    where: { slug: params.slug, status: 'published' },
    include: { category: true, images: { orderBy: { displayOrder: 'asc' } } },
  });
  if (!project) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL!;

  // Structured data — CreativeWork
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.shortDescription,
    image: project.featuredImage,
    url: `${base}/portfolio/${project.slug}`,
    creator: { '@type': 'Person', name: 'Emran Hossain' },
    keywords: project.techStack.join(', '),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-sm text-emerald-400">{project.category?.name}</p>
      <h1 className="mt-3 text-4xl font-bold text-white">{project.title}</h1>
      {project.featuredImage && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            src={project.featuredImage}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}
      <Markdown
        content={project.fullDescription ?? ''}
        className="prose prose-invert prose-emerald mt-8 max-w-none"
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {project.techStack.map((t) => (
          <span key={t} className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-200">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        {project.projectUrl && (
          <a href={project.projectUrl} target="_blank" rel="noreferrer"
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950">
            Visit Live Site
          </a>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white">
            GitHub
          </a>
        )}
      </div>
      {project.images.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {project.images.map((img) => (
            <div key={img.id} className="relative aspect-video overflow-hidden rounded-xl">
              <Image src={img.imageUrl} alt={img.altText ?? project.title} fill sizes="50vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
