// Server Component — middleware already gated this route; we re-verify the
// session anyway (defense in depth), then hand off to the client manager.
// All subsequent interactions are fetch-based: zero full-page reloads.

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { ToastProvider } from '@/components/admin/Toast';
import GalleryManager from '@/components/admin/GalleryManager';

export const metadata = { title: 'Gallery Manager' };
export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    redirect('/admin/login?callbackUrl=/admin/gallery');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/admin" className="hover:text-emerald-400">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Gallery</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold text-white">Gallery Manager</h1>
      <p className="mt-1 text-slate-400">
        Upload, edit, reorder and delete gallery images. Changes go live instantly via ISR revalidation.
      </p>

      <div className="mt-10">
        <ToastProvider>
          <GalleryManager />
        </ToastProvider>
      </div>
    </div>
  );
}
