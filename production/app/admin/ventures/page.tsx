import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { ToastProvider } from '@/components/admin/Toast';
import VenturesManager from '@/components/admin/VenturesManager';

export const metadata = { title: 'Ventures Manager' };
export const dynamic = 'force-dynamic';

export default async function AdminVenturesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    redirect('/admin/login?callbackUrl=/admin/ventures');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/admin" className="hover:text-emerald-400">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Ventures</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold text-white">Ventures Manager</h1>
      <p className="mt-1 text-slate-400">Manage business ventures shown on /business.</p>

      <div className="mt-10">
        <ToastProvider>
          <VenturesManager />
        </ToastProvider>
      </div>
    </div>
  );
}
