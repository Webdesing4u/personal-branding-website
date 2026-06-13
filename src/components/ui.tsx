import { ReactNode } from 'react';
import { cn } from '../utils/cn';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn('mb-12', center && 'text-center')}>
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className={cn('mt-4 max-w-2xl text-slate-400', center && 'mx-auto')}>{subtitle}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 pb-16 pt-32">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-slate-400">{subtitle}</p>}
      </div>
    </section>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300',
        className
      )}
    >
      {children}
    </span>
  );
}

export function FilterBar({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-10 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition',
            active === opt
              ? 'bg-emerald-500 text-slate-950'
              : 'border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
