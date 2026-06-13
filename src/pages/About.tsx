import { skillCategories } from '../data/site';
import { PageHero, SectionHeading } from '../components/ui';

const journey = [
  { year: '2017', title: 'Started Freelancing', desc: 'Began on Upwork & Fiverr — 150+ projects in 2 years with 5-star ratings.' },
  { year: '2019', title: 'Senior Developer', desc: 'Joined TechVision Ltd. to build enterprise web applications and lead juniors.' },
  { year: '2021', title: 'Founded DevCraft Agency', desc: 'Went all-in on entrepreneurship — now a 12-person team serving 3 countries.' },
  { year: '2022', title: 'Launched TaskFlow & BD Style House', desc: 'Co-founded a SaaS product and a D2C fashion brand the same year.' },
  { year: '2024', title: 'LaunchPad BD', desc: 'Started an incubator to give back — mentoring the next generation of BD founders.' },
];

export default function About() {
  return (
    <div>
      <PageHero
        eyebrow="About Me"
        title="The story behind the work"
        subtitle="Developer, marketer, founder — and a firm believer that Bangladesh can build for the world."
      />

      {/* Description */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <img
              src="/images/emran-profile.jpg"
              alt="Emran Hossain"
              className="w-full rounded-3xl border border-slate-800 object-cover shadow-2xl"
            />
          </div>
          <div className="space-y-5 leading-relaxed text-slate-300 lg:col-span-3">
            <h2 className="text-2xl font-bold text-white">Hello! I'm Emran 👋</h2>
            <p>
              I'm a full stack developer and entrepreneur based in Dhaka, Bangladesh. Over the past 8+ years
              I've gone from freelancing late nights after university classes to founding and running multiple
              ventures — a development agency, a bootstrapped SaaS, an e-commerce brand and a startup incubator.
            </p>
            <p>
              My superpower is sitting at the intersection of <span className="text-emerald-400">code</span>,{' '}
              <span className="text-emerald-400">marketing</span> and <span className="text-emerald-400">business</span>.
              I don't just build products — I build products that find customers and make money.
            </p>
            <p>
              When I'm not shipping features or reviewing campaigns, you'll find me mentoring young founders at
              LaunchPad BD, writing on my blog, or exploring the next big idea over a cup of cha.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {['Problem Solver', 'Team Builder', 'Lifelong Learner', 'Community First'].map((t) => (
                <span key={t} className="rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="border-t border-slate-800 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading eyebrow="My Journey" title="From freelancer to founder" center />
          <div className="relative border-l-2 border-slate-800 pl-8">
            {journey.map((j) => (
              <div key={j.year} className="relative mb-10 last:mb-0">
                <span className="absolute -left-[2.6rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-500 bg-slate-950">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-sm font-bold text-emerald-400">{j.year}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{j.title}</h3>
                <p className="mt-1 text-slate-400">{j.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-t border-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Skills"
            title="What I bring to the table"
            subtitle="Four skill categories, sharpened across hundreds of real projects."
            center
          />
          <div className="grid gap-6 md:grid-cols-2">
            {skillCategories.map((cat) => (
              <div key={cat.name} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <h3 className="text-xl font-semibold text-white">{cat.name}</h3>
                </div>
                <div className="mt-6 space-y-5">
                  {cat.skills.map((s) => (
                    <div key={s.name}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-slate-300">{s.name}</span>
                        <span className="text-emerald-400">{s.level}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                          style={{ width: `${s.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
