// Server Component — middleware gates the route; session re-verified here
// (defense in depth). All editing is client-side fetch — no page reloads.

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { ToastProvider } from '@/components/admin/Toast';
import PostsManager from '@/components/admin/PostsManager';

export const metadata = { title: 'Posts Manager' };
export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    redirect('/admin/login?callbackUrl=/admin/posts');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/admin" className="hover:text-emerald-400">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Posts</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold text-white">Posts Manager</h1>
      <p className="mt-1 text-slate-400">
        Write in Markdown, manage tags inline, publish with instant ISR revalidation.
      </p>

      <div className="mt-10">
        <ToastProvider>
          <PostsManager />
        </ToastProvider>
      </div>
    </div>
  );
}
