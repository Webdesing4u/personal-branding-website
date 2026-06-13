import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogPosts, galleryImages, projects, skillCategories, ventures } from '../data/site';
import {
  ContactMessage,
  deleteMessage,
  getMessages,
  isAuthenticated,
  login,
  logout,
  markRead,
} from '../utils/storage';
import { cn } from '../utils/cn';

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('admin@emranhossain.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) onSuccess();
    else setError('Invalid email or password.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 pt-20">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="text-center">
          <span className="text-4xl">🔐</span>
          <h1 className="mt-3 text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-400">Protected area — authorized access only</p>
        </div>
        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="w-full rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
            Sign In
          </button>
          <p className="rounded-lg bg-slate-950 px-4 py-3 text-center text-xs text-slate-500">
            Demo credentials: <span className="text-slate-300">admin@emranhossain.com</span> /{' '}
            <span className="text-slate-300">admin123</span>
          </p>
        </div>
      </form>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
const tabs = ['Overview', 'Blog Posts', 'Projects', 'Ventures', 'Gallery', 'Skills', 'Messages'] as const;
type Tab = (typeof tabs)[number];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('Overview');
  const [messages, setMessages] = useState<ContactMessage[]>(getMessages());

  const stats = [
    ['📝', 'Blog Posts', blogPosts.length],
    ['💼', 'Projects', projects.length],
    ['🏢', 'Ventures', ventures.length],
    ['🖼', 'Gallery Images', galleryImages.length],
    ['🛠', 'Skill Categories', skillCategories.length],
    ['📨', 'Messages', messages.length],
  ] as const;

  const Table = ({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) => (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-5 py-3.5 font-semibold">{h}</th>
            ))}
            <th className="px-5 py-3.5 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-900/50">
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-3.5 text-slate-300">{cell}</td>
              ))}
              <td className="px-5 py-3.5">
                <span className="cursor-pointer text-emerald-400 hover:underline">Edit</span>
                <span className="ml-3 cursor-pointer text-red-400 hover:underline">Delete</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-1 text-slate-400">Welcome back, Emran 👋</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition',
                tab === t
                  ? 'bg-emerald-500 text-slate-950'
                  : 'border border-slate-700 text-slate-300 hover:border-emerald-500/50'
              )}
            >
              {t}
              {t === 'Messages' && messages.filter((m) => !m.isRead).length > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {messages.filter((m) => !m.isRead).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === 'Overview' && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map(([icon, label, count]) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <span className="text-3xl">{icon}</span>
                  <p className="mt-4 text-3xl font-bold text-white">{count}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'Blog Posts' && (
            <Table
              headers={['Title', 'Category', 'Published']}
              rows={blogPosts.map((p) => [p.title, p.category, p.publishedAt])}
            />
          )}
          {tab === 'Projects' && (
            <Table
              headers={['Title', 'Category', 'Status']}
              rows={projects.map((p) => [p.title, p.category, p.status])}
            />
          )}
          {tab === 'Ventures' && (
            <Table
              headers={['Name', 'Category', 'Role', 'Status']}
              rows={ventures.map((v) => [v.name, v.category, v.role, v.status])}
            />
          )}
          {tab === 'Gallery' && (
            <Table
              headers={['Title', 'Category']}
              rows={galleryImages.map((g) => [g.title, g.category])}
            />
          )}
          {tab === 'Skills' && (
            <Table
              headers={['Category', 'Skills']}
              rows={skillCategories.map((c) => [c.name, c.skills.map((s) => s.name).join(', ')])}
            />
          )}

          {tab === 'Messages' && (
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center text-slate-400">
                  📭 No messages yet. Messages submitted via the contact form will appear here.
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-2xl border bg-slate-900/50 p-6',
                    m.isRead ? 'border-slate-800' : 'border-emerald-500/40'
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {m.subject}
                        {!m.isRead && (
                          <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                            New
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {m.name} · {m.email} · {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!m.isRead && (
                        <button
                          onClick={() => setMessages(markRead(i))}
                          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500/50"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => setMessages(deleteMessage(i))}
                        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const navigate = useNavigate();

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;

  return (
    <Dashboard
      onLogout={() => {
        logout();
        setAuthed(false);
        navigate('/');
      }}
    />
  );
}
