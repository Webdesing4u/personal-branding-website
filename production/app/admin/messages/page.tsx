import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { ToastProvider } from '@/components/admin/Toast';
import MessagesManager from '@/components/admin/MessagesManager';

export const metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    redirect('/admin/login?callbackUrl=/admin/messages');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/admin" className="hover:text-emerald-400">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Messages</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold text-white">Contact Messages</h1>
      <p className="mt-1 text-slate-400">
        Inbox viewer — messages arrive via the public contact form only.
      </p>

      <div className="mt-10">
        <ToastProvider>
          <MessagesManager />
        </ToastProvider>
      </div>
    </div>
  );
}
