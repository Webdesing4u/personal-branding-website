import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/site';
import { Badge, FilterBar, PageHero } from '../components/ui';

const categories = ['All', 'Web Development', 'Digital Marketing'];

export default function Portfolio() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <div>
      <PageHero
        eyebrow="Portfolio"
        title="Projects & Case Studies"
        subtitle="Web applications I've built and marketing campaigns I've scaled — with real results."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FilterBar options={categories} active={filter} onChange={setFilter} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <Link to={`/portfolio/${p.slug}`} className="overflow-hidden">
                  <img
                    src={p.featuredImage}
                    alt={p.title}
                    loading="lazy"
                    className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between">
                    <Badge>{p.category}</Badge>
                    <span className="text-xs text-slate-500">{p.status}</span>
                  </div>
                  <Link to={`/portfolio/${p.slug}`}>
                    <h3 className="mt-3 font-semibold text-white transition group-hover:text-emerald-400">
                      {p.title}
                    </h3>
                  </Link>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{p.shortDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                        {t}
                      </span>
                    ))}
                    {p.techStack.length > 4 && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
                        +{p.techStack.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-center gap-4 border-t border-slate-800 pt-4 text-sm">
                    <Link to={`/portfolio/${p.slug}`} className="font-semibold text-emerald-400 hover:text-emerald-300">
                      Details →
                    </Link>
                    <a href={p.projectUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                      Live ↗
                    </a>
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
