'use client';

// Gallery Admin Manager
//  - List from GET /api/admin/gallery
//  - Add: Cloudinary signed upload (ImageUploader) → POST
//  - Edit title/category inline → PATCH
//  - Delete → ConfirmModal → DELETE (with fade-out)
//  - Drag reorder → optimistic UI → debounced (300ms) PUT → rollback on fail
//  - Drag disabled while a reorder request is in flight
//  - Toasts · 401 redirect & 429 toast via adminFetch · no page reloads

import { useEffect, useRef, useState } from 'react';
import { gallerySchema } from '@/lib/validations';
import { adminFetch, RateLimitError, ValidationError } from '@/lib/admin-fetch';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';
import ImageUploader from '../ImageUploader';

interface GalleryItem {
  id: string;
  title: string | null;
  imageUrl: string;
  category: string | null;
  displayOrder: number;
}

type SyncState = 'idle' | 'pending' | 'saving';

export default function GalleryManager() {
  const toast = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editError, setEditError] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null); // fade-out

  // Reorder sync
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [sync, setSync] = useState<SyncState>('idle');
  const syncRef = useRef<SyncState>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedOrder = useRef<GalleryItem[]>([]); // server-confirmed snapshot
  const itemsRef = useRef<GalleryItem[]>([]);
  itemsRef.current = items;

  const setSyncState = (s: SyncState) => {
    syncRef.current = s;
    setSync(s);
  };

  // ── Load ──
  useEffect(() => {
    adminFetch<{ images: GalleryItem[] }>('/api/admin/gallery')
      .then((d) => {
        setItems(d.images);
        lastSyncedOrder.current = d.images;
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load gallery'))
      .finally(() => setLoading(false));
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add ──
  const handleAdd = async () => {
    const payload = {
      title: newTitle.trim() || undefined,
      imageUrl: newUrl,
      category: newCategory.trim() || undefined,
      displayOrder: items.length,
    };
    const parsed = gallerySchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) errs[k] = v[0];
      }
      setAddErrors(errs);
      return;
    }
    setAddErrors({});
    setAdding(true);
    try {
      const { image } = await adminFetch<{ image: GalleryItem }>('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      setItems((prev) => {
        const next = [...prev, image];
        lastSyncedOrder.current = next;
        return next;
      });
      setNewUrl('');
      setNewTitle('');
      setNewCategory('');
      setUploaderKey((k) => k + 1);
      toast.success('Image added to gallery');
    } catch (e) {
      if (e instanceof ValidationError) {
        const errs: Record<string, string> = {};
        for (const [k, v] of Object.entries(e.fields)) if (v?.[0]) errs[k] = v[0];
        setAddErrors(errs);
      } else if (e instanceof RateLimitError) {
        toast.error(e.message);
      } else {
        toast.error(e instanceof Error ? e.message : 'Failed to add image');
      }
    } finally {
      setAdding(false);
    }
  };

  // ── Inline edit ──
  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title ?? '');
    setEditCategory(item.category ?? '');
    setEditError('');
  };

  const saveEdit = async (id: string) => {
    const payload = { title: editTitle.trim() || undefined, category: editCategory.trim() || undefined };
    const parsed = gallerySchema.partial().safeParse(payload);
    if (!parsed.success) {
      setEditError(Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? 'Invalid input');
      return;
    }
    const before = items;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, title: payload.title ?? null, category: payload.category ?? null } : it
      )
    );
    setEditingId(null);
    try {
      await adminFetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(parsed.data),
      });
      toast.success('Image updated');
    } catch (e) {
      setItems(before);
      toast.error(e instanceof RateLimitError ? e.message : 'Update failed — changes reverted');
    }
  };

  // ── Delete (with fade-out polish) ──
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const target = deleteTarget;
    const before = items;

    // Fade the card first (150ms), then remove from layout
    setRemovingId(target.id);
    setDeleteTarget(null);
    await new Promise((r) => setTimeout(r, 150));
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== target.id);
      lastSyncedOrder.current = next;
      return next;
    });
    setRemovingId(null);

    try {
      await adminFetch(`/api/admin/gallery/${target.id}`, { method: 'DELETE' });
      toast.success('Image deleted');
    } catch (e) {
      setItems(before); // rollback (reappears)
      lastSyncedOrder.current = before;
      toast.error(e instanceof RateLimitError ? e.message : 'Delete failed — image restored');
    } finally {
      setDeleting(false);
    }
  };

  // ── Reorder: optimistic + 300ms debounce + in-flight lock + spam guard ──
  const reflushQueued = useRef(false);

  const flushReorder = async () => {
    // Duplicate-PUT guard: if a PUT is already in flight, queue exactly one
    // re-flush instead of firing a parallel request.
    if (syncRef.current === 'saving') {
      reflushQueued.current = true;
      return;
    }
    setSyncState('saving');
    const order = itemsRef.current; // latest order at flush time
    try {
      await adminFetch('/api/admin/gallery', {
        method: 'PUT',
        body: JSON.stringify(order.map((it, i) => ({ id: it.id, displayOrder: i }))),
      });
      lastSyncedOrder.current = order;
      toast.success('Order saved');
    } catch (e) {
      setItems(lastSyncedOrder.current); // rollback to last confirmed order
      toast.error(e instanceof RateLimitError ? e.message : 'Reorder failed — order restored');
    } finally {
      setSyncState('idle');
      if (reflushQueued.current) {
        reflushQueued.current = false;
        void flushReorder(); // order changed while saving → one follow-up PUT
      }
    }
  };

  const handleDrop = (toIdx: number) => {
    const fromIdx = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (fromIdx === null || fromIdx === toIdx) return;
    if (syncRef.current === 'saving') return; // hard guard (drag is also disabled)

    // 1 — Optimistic reorder
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });

    // 2 — Debounce: rapid consecutive drags collapse into one PUT
    setSyncState('pending');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => void flushReorder(), 300);
  };

  const dragDisabled = sync === 'saving';

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-800/60" />
        ))}
      </div>
    );
  }

  const input =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500';

  return (
    <div>
      {/* ── Add new image ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="font-semibold text-white">Add Image</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div>
            <ImageUploader key={uploaderKey} folder="gallery" onUploaded={setNewUrl} />
            {addErrors.imageUrl && <p className="mt-2 text-sm text-red-400">{addErrors.imageUrl}</p>}
          </div>
          <div className="space-y-3">
            <div>
              <input className={input} placeholder="Title (optional)" value={newTitle} maxLength={150}
                onChange={(e) => setNewTitle(e.target.value)} />
              {addErrors.title && <p className="mt-1 text-sm text-red-400">{addErrors.title}</p>}
            </div>
            <div>
              <input className={input} placeholder="Category — e.g. Workspace, Team, Events"
                value={newCategory} maxLength={100} onChange={(e) => setNewCategory(e.target.value)} />
              {addErrors.category && <p className="mt-1 text-sm text-red-400">{addErrors.category}</p>}
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || !newUrl}
              className="w-full rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {adding ? 'Saving…' : newUrl ? 'Add to Gallery' : 'Upload an image first'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid header + sync indicator ── */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-semibold text-white">
          Gallery <span className="text-sm font-normal text-slate-500">({items.length} images)</span>
        </h2>
        <div className="flex items-center gap-3 text-xs">
          {sync !== 'idle' && (
            <span className="flex items-center gap-1.5 text-emerald-400" role="status">
              {sync === 'saving' ? (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              )}
              {sync === 'saving' ? 'Saving order…' : 'Order changed — saving shortly…'}
            </span>
          )}
          <p className="text-slate-500">
            {dragDisabled ? '⏳ Reorder locked while saving' : '↕ Drag cards to reorder'}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          No images yet — upload your first one above.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable={!dragDisabled && editingId !== item.id}
              onDragStart={() => {
                if (!dragDisabled) dragIndex.current = idx;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!dragDisabled) setOverIndex(idx);
              }}
              onDragLeave={() => setOverIndex((o) => (o === idx ? null : o))}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => {
                dragIndex.current = null;
                setOverIndex(null);
              }}
              className={`group overflow-hidden rounded-2xl border bg-slate-900/50 transition-all duration-150 ${
                overIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800'
              } ${
                removingId === item.id ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
              } ${
                dragDisabled
                  ? 'cursor-not-allowed opacity-80'
                  : editingId === item.id
                    ? ''
                    : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title ?? ''} className="h-44 w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  #{idx + 1}
                </span>
              </div>

              <div className="p-4">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <input className={input} value={editTitle} maxLength={150} placeholder="Title"
                      onChange={(e) => setEditTitle(e.target.value)} autoFocus />
                    <input className={input} value={editCategory} maxLength={100} placeholder="Category"
                      onChange={(e) => setEditCategory(e.target.value)} />
                    {editError && <p className="text-sm text-red-400">{editError}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => void saveEdit(item.id)}
                        className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-sm font-medium text-white">
                      {item.title || <span className="text-slate-500">Untitled</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-400">
                      {item.category || <span className="text-slate-600">No category</span>}
                    </p>
                    <div className="mt-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                      <button onClick={() => startEdit(item)}
                        className="flex-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500/60 hover:text-emerald-400">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(item)}
                        className="flex-1 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white">
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this image?"
        description={`"${deleteTarget?.title || 'Untitled'}" will be removed from the gallery. The public page updates immediately. This cannot be undone.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
