import { education, experience, siteInfo, skillCategories } from '../data/site';
import { PageHero } from '../components/ui';

export default function CV() {
  return (
    <div>
      <PageHero
        eyebrow="Curriculum Vitae"
        title="Resume & Experience"
        subtitle="A snapshot of my professional journey — downloadable as PDF."
      />

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header card */}
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{siteInfo.name}</h2>
              <p className="mt-1 text-emerald-400">{siteInfo.tagline}</p>
              <p className="mt-2 text-sm text-slate-400">
                {siteInfo.email} · {siteInfo.phone} · {siteInfo.location}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="shrink-0 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
            >
              ⬇ Download CV (PDF)
            </button>
          </div>

          {/* Summary */}
          <div className="mt-10">
            <h3 className="flex items-center gap-3 text-xl font-bold text-white">
              <span className="h-px flex-1 bg-slate-800" />
              Professional Summary
              <span className="h-px flex-1 bg-slate-800" />
            </h3>
            <p className="mt-5 leading-relaxed text-slate-300">
              Full stack developer and serial entrepreneur with 8+ years of experience building web applications,
              scaling digital marketing campaigns, and founding profitable ventures. Founder of DevCraft Agency
              (12-person team, clients in 3 countries) and co-founder of TaskFlow SaaS (2,000+ teams, bootstrapped
              to profitability). Passionate about combining engineering excellence with business strategy to ship
              products that grow.
            </p>
          </div>

          {/* Experience */}
          <div className="mt-12">
            <h3 className="flex items-center gap-3 text-xl font-bold text-white">
              <span className="h-px flex-1 bg-slate-800" />
              Experience
              <span className="h-px flex-1 bg-slate-800" />
            </h3>
            <div className="mt-6 space-y-6">
              {experience.map((e) => (
                <div key={e.role + e.company} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-lg font-semibold text-white">{e.role}</h4>
                    <span className="text-sm font-medium text-emerald-400">{e.period}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-400">{e.company}</p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-300">
                    {e.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mt-12">
            <h3 className="flex items-center gap-3 text-xl font-bold text-white">
              <span className="h-px flex-1 bg-slate-800" />
              Education
              <span className="h-px flex-1 bg-slate-800" />
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {education.map((ed) => (
                <div key={ed.degree} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <p className="text-sm font-medium text-emerald-400">{ed.period}</p>
                  <h4 className="mt-2 font-semibold text-white">{ed.degree}</h4>
                  <p className="mt-1 text-sm text-slate-400">{ed.institution}</p>
                  <p className="mt-2 text-sm text-slate-300">{ed.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mt-12">
            <h3 className="flex items-center gap-3 text-xl font-bold text-white">
              <span className="h-px flex-1 bg-slate-800" />
              Skills
              <span className="h-px flex-1 bg-slate-800" />
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {skillCategories.map((cat) => (
                <div key={cat.name} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <p className="font-semibold text-white">
                    {cat.icon} {cat.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cat.skills.map((s) => (
                      <span
                        key={s.name}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
