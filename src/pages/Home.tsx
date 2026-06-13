import { Link } from 'react-router-dom';
import { projects, services, siteInfo } from '../data/site';
import { Badge, SectionHeading } from '../components/ui';

export default function Home() {
  const featured = projects.filter((p) => p.isFeatured);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pb-20 pt-36">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <Badge>👋 Available for projects & consulting</Badge>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hi, I'm <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Emran Hossain</span>
            </h1>
            <p className="mt-4 text-xl font-medium text-slate-300">{siteInfo.tagline}</p>
            <p className="mt-4 max-w-xl leading-relaxed text-slate-400">
              I build high-performance web applications, scale businesses with data-driven marketing,
              and run ventures across SaaS, e-commerce and consulting — all from Dhaka, Bangladesh 🇧🇩.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/portfolio"
                className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              >
                View Portfolio
              </Link>
              <Link
                to="/contact"
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-emerald-500/60 hover:text-emerald-400"
              >
                Contact Me
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                ['8+', 'Years Experience'],
                ['200+', 'Projects Done'],
                ['5', 'Active Ventures'],
              ].map(([num, label]) => (
                <div key={label}>
                  <p className="text-3xl font-bold text-emerald-400">{num}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-cyan-500/20 blur-2xl" />
            <img
              src="/images/emran-profile.jpg"
              alt="Emran Hossain"
              className="relative w-full rounded-3xl border border-slate-700/60 object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="border-t border-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="What I Do"
            title="Services"
            subtitle="Three disciplines, one goal — building things that grow."
            center
          />
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.title}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <span className="text-4xl">{s.icon}</span>
                <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Preview ── */}
      <section className="border-t border-slate-800 bg-slate-900/40 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="About Me"
              title="Developer by craft, entrepreneur by heart"
            />
            <p className="leading-relaxed text-slate-400">
              From freelancing on Upwork in 2017 to founding DevCraft Agency and co-founding TaskFlow SaaS,
              my journey has been about one thing — turning ideas into products that people actually use.
              Today I lead a team of 12, run 5 ventures, and still write code every single day.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-400 transition hover:gap-3"
            >
              Read my full story <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['💻', 'Full Stack', 'React, Next.js, Node, PostgreSQL'],
              ['📈', 'Growth', 'SEO, Paid Ads, CRO, Email'],
              ['🚀', 'Founder', 'Agency, SaaS, E-commerce'],
              ['🤝', 'Mentor', 'Helping young BD founders'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <span className="text-2xl">{icon}</span>
                <p className="mt-3 font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      <section className="border-t border-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Selected Work"
            title="Featured Projects"
            subtitle="A few highlights from my recent web development and marketing work."
            center
          />
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((p) => (
              <Link
                key={p.id}
                to={`/portfolio/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <div className="overflow-hidden">
                  <img
                    src={p.featuredImage}
                    alt={p.title}
                    loading="lazy"
                    className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <Badge>{p.category}</Badge>
                  <h3 className="mt-3 font-semibold text-white group-hover:text-emerald-400">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">{p.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/portfolio"
              className="inline-block rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-emerald-500/60 hover:text-emerald-400"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-slate-800 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Have a project in mind?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Whether it's a web app, a marketing campaign, or business strategy — let's build something great together.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
          >
            Let's Talk →
          </Link>
        </div>
      </section>
    </div>
  );
}
