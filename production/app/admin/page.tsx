// Server Component — middleware already guaranteed a valid admin session,
// but we re-verify here too (defense in depth). All data fetched server-side.

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'; // admin data is always fresh

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    redirect('/admin/login');
  }

  const [posts, projects, ventures, gallery, messages, unread] = await Promise.all([
    db.blogPost.count(),
    db.portfolioProject.count(),
    db.businessVenture.count(),
    db.galleryImage.count(),
    db.contactMessage.count(),
    db.contactMessage.count({ where: { isRead: false } }),
  ]);

  const recentMessages = await db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const stats = [
    ['📝', 'Blog Posts', posts],
    ['💼', 'Projects', projects],
    ['🏢', 'Ventures', ventures],
    ['🖼', 'Gallery', gallery],
    ['📨', 'Messages', messages],
    ['🔔', 'Unread', unread],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-1 text-slate-400">Signed in as {session.user.email}</p>

      {/* Section managers */}
      <div className="mt-6 flex flex-wrap gap-3">
        {[
          ['🖼 Gallery', '/admin/gallery'],
          ['📝 Posts', '/admin/posts'],
          ['💼 Projects', '/admin/projects'],
          ['🏢 Ventures', '/admin/ventures'],
          ['📨 Messages', '/admin/messages'],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-400"
          >
            {label}
          </a>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {stats.map(([icon, label, count]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <span className="text-3xl">{icon}</span>
            <p className="mt-4 text-3xl font-bold text-white">{count}</p>
            <p className="mt-1 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold text-white">Recent Messages</h2>
      <div className="mt-4 space-y-3">
        {recentMessages.length === 0 && <p className="text-slate-400">No messages yet.</p>}
        {recentMessages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">
                {m.subject}
                {!m.isRead && (
                  <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                    New
                  </span>
                )}
              </p>
              <span className="text-xs text-slate-500">{m.createdAt.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {m.name} · {m.email} · IP {m.ipAddress}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-slate-300">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
