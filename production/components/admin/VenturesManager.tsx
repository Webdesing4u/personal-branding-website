'use client';

// Ventures Admin Manager — list + delegate to ventures/VentureForm.

import { useEffect, useState } from 'react';
import { adminFetch, RateLimitError } from '@/lib/admin-fetch';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';
import VentureForm, { type BusinessCategory, type VentureData } from './ventures/VentureForm';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-300',
  growing: 'bg-cyan-500/15 text-cyan-300',
  acquired: 'bg-violet-500/15 text-violet-300',
  exited: 'bg-slate-700/50 text-slate-400',
};

export default function VenturesManager() {
  const toast = useToast();

  const [ventures, setVentures] = useState<VentureData[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<VentureData | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VentureData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFetch<{ ventures: VentureData[] }>('/api/admin/ventures'),
      adminFetch<{ categories: BusinessCategory[] }>('/api/admin/business-meta'),
    ])
      .then(([v, meta]) => {
        setVentures(v.ventures);
        setCategories(meta.categories);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load ventures'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaved = (saved: VentureData, isNew: boolean) => {
    setVentures((prev) =>
      isNew ? [saved, ...prev] : prev.map((v) => (v.id === saved.id ? saved : v))
    );
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const before = ventures;
    setVentures((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    try {
      await adminFetch(`/api/admin/ventures/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Venture deleted');
      setDeleteTarget(null);
    } catch (e) {
      setVentures(before);
      toast.error(e instanceof RateLimitError ? e.message : 'Delete failed — venture restored');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-slate-800/60" />;

  if (editing !== null) {
    return (
      <VentureForm
        venture={editing === 'new' ? null : editing}
        categories={categories}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">
          Ventures <span className="text-sm font-normal text-slate-500">({ventures.length})</span>
        </h2>
        <button onClick={() => setEditing('new')}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
          + New Venture
        </button>
      </div>

      {ventures.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          No ventures yet — add your first one.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Venture</th>
                <th className="px-5 py-3.5 font-semibold">Industry</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Featured</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ventures.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {v.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-sm font-bold text-emerald-400">
                          {v.name.charAt(0)}
                        </span>
                      )}
                      <p className="font-medium text-white">{v.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{v.industry ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-400">{v.role ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      STATUS_STYLES[v.status] ?? STATUS_STYLES.exited
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {v.isFeatured ? '⭐' : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setEditing(v)}
                      className="font-semibold text-emerald-400 hover:underline">Edit</button>
                    <button onClick={() => setDeleteTarget(v)}
                      className="ml-4 font-semibold text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this venture?"
        description={`"${deleteTarget?.name}" will be permanently removed. The /business page updates immediately.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
