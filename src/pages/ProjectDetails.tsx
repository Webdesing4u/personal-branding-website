import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/site';
import { Badge } from '../components/ui';

export default function ProjectDetails() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-24 text-center">
        <p className="text-6xl">🔍</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Project not found</h1>
        <Link to="/portfolio" className="mt-4 font-semibold text-emerald-400">
          ← Back to Portfolio
        </Link>
      </div>
    );
  }

  const related = projects.filter((p) => p.category === project.category && p.id !== project.id).slice(0, 2);

  return (
    <div>
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link to="/portfolio" className="text-sm font-medium text-slate-400 hover:text-emerald-400">
            ← Back to Portfolio
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <Badge>{project.category}</Badge>
            <span className="text-sm text-slate-500">{project.status}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{project.title}</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <img
            src={project.featuredImage}
            alt={project.title}
            className="w-full rounded-2xl border border-slate-800 object-cover shadow-2xl"
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-white">About this project</h2>
              <p className="mt-4 leading-relaxed text-slate-300">{project.fullDescription}</p>
            </div>
            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tech Stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.techStack.map((t) => (
                    <span key={t} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Links</p>
                <div className="mt-3 space-y-2">
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    🌐 Visit Live Site
                  </a>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-slate-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-emerald-500/60"
                    >
                      ⌨ View on GitHub
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <div className="mt-16 border-t border-slate-800 pt-10">
              <h2 className="text-xl font-bold text-white">Related projects</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to={`/portfolio/${p.slug}`}
                    className="group flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-emerald-500/40"
                  >
                    <img src={p.featuredImage} alt={p.title} className="h-20 w-28 rounded-lg object-cover" loading="lazy" />
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-emerald-400">{p.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{p.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
