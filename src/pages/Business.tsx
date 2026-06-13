import { useState } from 'react';
import { ventures } from '../data/site';
import { Badge, FilterBar, PageHero } from '../components/ui';
import { cn } from '../utils/cn';

const categories = ['All', 'Startup', 'SaaS', 'Agency', 'E-commerce', 'Consulting'];

const statusColor: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Growing: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Acquired: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  Exited: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

export default function Business() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? ventures : ventures.filter((v) => v.category === filter);

  return (
    <div>
      <PageHero
        eyebrow="Business"
        title="Ventures & Companies"
        subtitle="The businesses I've founded, co-founded and helped build — across SaaS, e-commerce, agency and consulting."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FilterBar options={categories} active={filter} onChange={setFilter} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <div
                key={v.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-7 transition hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-xl font-bold text-emerald-400">
                    {v.name.charAt(0)}
                  </div>
                  <span className={cn('rounded-full border px-3 py-1 text-xs font-medium', statusColor[v.status])}>
                    {v.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{v.name}</h3>
                <p className="mt-0.5 text-sm text-emerald-400">{v.industry}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{v.description}</p>
                <div className="mt-5 space-y-1.5 border-t border-slate-800 pt-4 text-sm">
                  <p className="text-slate-400">
                    <span className="text-slate-500">Role:</span> <span className="text-slate-200">{v.role}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">Since:</span> <span className="text-slate-200">{v.startDate}</span>
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge>{v.category}</Badge>
                  <a
                    href={v.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Visit Website ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
