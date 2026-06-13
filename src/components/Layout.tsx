import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { siteInfo } from '../data/site';
import { cn } from '../utils/cn';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/cv', label: 'CV' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/business', label: 'Business' },
  { to: '/blog', label: 'Blog' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* ── Navbar ── */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold tracking-tight">
            <span className="text-emerald-400">E</span>mran<span className="text-emerald-400">.</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/admin"
              className="ml-3 rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950"
            >
              Admin
            </Link>
          </nav>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-md p-2 text-slate-300 hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {open && (
          <nav className="border-t border-slate-800 bg-slate-950/95 px-4 pb-4 backdrop-blur-md lg:hidden">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium',
                    isActive ? 'text-emerald-400' : 'text-slate-300'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/admin" className="mt-2 block rounded-md px-3 py-2.5 text-sm font-semibold text-emerald-400">
              Admin Panel
            </Link>
          </nav>
        )}
      </header>

      <main className="pt-0">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="text-xl font-bold">
                <span className="text-emerald-400">E</span>mran Hossain
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
                {siteInfo.tagline}. Building digital products and helping businesses grow from Dhaka, Bangladesh.
              </p>
              <div className="mt-4 flex gap-3">
                {Object.entries(siteInfo.socials).map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-medium capitalize text-slate-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Quick Links</p>
              <ul className="mt-3 space-y-2 text-sm">
                {navLinks.slice(0, 5).map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-slate-400 transition hover:text-emerald-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Contact</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>{siteInfo.email}</li>
                <li>{siteInfo.phone}</li>
                <li>{siteInfo.location}</li>
              </ul>
            </div>
          </div>
          <p className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Emran Hossain. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
