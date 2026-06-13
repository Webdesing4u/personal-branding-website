import { useCallback, useEffect, useState } from 'react';
import { galleryImages } from '../data/site';
import { FilterBar, PageHero } from '../components/ui';

const categories = ['All', ...Array.from(new Set(galleryImages.map((g) => g.category)))];

export default function Gallery() {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === 'All' ? galleryImages : galleryImages.filter((g) => g.category === filter);

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length]
  );
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, close, next, prev]);

  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="Moments & Milestones"
        subtitle="A visual journal of my work, team and journey — click any image to view full size."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FilterBar options={categories} active={filter} onChange={setFilter} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox(i)}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  loading="lazy"
                  className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                  <div className="p-5 text-left">
                    <p className="font-semibold text-white">{img.title}</p>
                    <p className="text-sm text-emerald-400">{img.category}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            className="absolute right-5 top-5 rounded-full bg-slate-800 p-3 text-white transition hover:bg-slate-700"
            onClick={close}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/80 p-3 text-white transition hover:bg-slate-700 sm:left-6"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
          >
            ←
          </button>
          <div className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightbox].imageUrl}
              alt={filtered[lightbox].title}
              className="max-h-[75vh] w-auto rounded-xl object-contain"
            />
            <div className="mt-4 text-center">
              <p className="font-semibold text-white">{filtered[lightbox].title}</p>
              <p className="text-sm text-slate-400">
                {filtered[lightbox].category} · {lightbox + 1} / {filtered.length}
              </p>
            </div>
          </div>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-800/80 p-3 text-white transition hover:bg-slate-700 sm:right-6"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
