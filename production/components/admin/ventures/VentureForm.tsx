'use client';

// VentureForm — deliberately minimal per locked spec:
// plain textarea description · no markdown · no tags · no publish gating.
// Reuses: SlugField, ImageUploader, useAdminMutation, ConfirmModal pattern.

import { useState } from 'react';
import { ventureSchema } from '@/lib/validations';
import { slugify } from '@/lib/slugify';
import { adminFetch } from '@/lib/admin-fetch';
import { useToast } from '../Toast';
import ImageUploader from '../../ImageUploader';
import { useAdminMutation } from '../useAdminMutation';
import SlugField from '../posts/SlugField';

export interface BusinessCategory { id: string; name: string }

export interface VentureData {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  description: string | null;
  role: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  status: 'active' | 'growing' | 'acquired' | 'exited';
  categoryId: string | null;
  isFeatured: boolean;
  startDate: string | null;
  endDate: string | null;
  updatedAt: string;
  category: BusinessCategory | null;
}

const STATUSES = ['active', 'growing', 'acquired', 'exited'] as const;

interface Props {
  venture: VentureData | null;
  categories: BusinessCategory[];
  onSaved: (venture: VentureData, isNew: boolean) => void;
  onCancel: () => void;
}

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export default function VentureForm({ venture, categories, onSaved, onCancel }: Props) {
  const toast = useToast();
  const { mutate, busy } = useAdminMutation<{ venture: VentureData }>();

  const isNew = venture === null;
  const lastSavedSlug = venture?.slug ?? '';

  const [name, setName] = useState(venture?.name ?? '');
  const [slug, setSlug] = useState(venture?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [industry, setIndustry] = useState(venture?.industry ?? '');
  const [description, setDescription] = useState(venture?.description ?? '');
  const [role, setRole] = useState(venture?.role ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(venture?.websiteUrl ?? '');
  const [logoUrl, setLogoUrl] = useState(venture?.logoUrl ?? '');
  const [status, setStatus] = useState<VentureData['status']>(venture?.status ?? 'active');
  const [categoryId, setCategoryId] = useState(venture?.categoryId ?? '');
  const [isFeatured, setIsFeatured] = useState(venture?.isFeatured ?? false);
  const [startDate, setStartDate] = useState(toDateInput(venture?.startDate ?? null));
  const [endDate, setEndDate] = useState(toDateInput(venture?.endDate ?? null));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugConflict, setSlugConflict] = useState('');

  const onNameChange = (n: string) => {
    setName(n);
    if (!slugTouched) setSlug(slugify(n));
  };

  const handleSave = () => {
    setSlugConflict('');
    const payload = {
      name, slug,
      industry: industry || undefined,
      description: description || undefined,
      role: role || undefined,
      websiteUrl, logoUrl, status,
      categoryId: categoryId || null,
      isFeatured, startDate, endDate,
    };

    const parsed = ventureSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) errs[k] = v[0];
      }
      setErrors(errs);
      toast.error('Fix the highlighted fields');
      return;
    }
    // Cross-field check Zod object schema can't express simply
    if (startDate && endDate && endDate < startDate) {
      setErrors({ endDate: 'End date cannot be before start date' });
      return;
    }
    setErrors({});

    void mutate(
      () =>
        isNew
          ? adminFetch<{ venture: VentureData }>('/api/admin/ventures', {
              method: 'POST', body: JSON.stringify(parsed.data),
            })
          : adminFetch<{ venture: VentureData }>(`/api/admin/ventures/${venture.id}`, {
              method: 'PATCH', body: JSON.stringify(parsed.data),
            }),
      {
        onSuccess: ({ venture: saved }) => {
          toast.success(isNew ? 'Venture added' : 'Venture updated — /business revalidated');
          onSaved(
            { ...saved, category: categories.find((c) => c.id === saved.categoryId) ?? null },
            isNew
          );
        },
        onValidation: (fields) => { setErrors(fields); toast.error('Server rejected some fields'); },
        onConflict: () =>
          setSlugConflict(
            isNew ? 'This slug is already in use.' : `Slug taken. Last saved was "${lastSavedSlug}".`
          ),
        onError: (msg) => toast.error(msg),
      }
    );
  };

  const input =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500';
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500';
  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-red-400">{errors[k]}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">{isNew ? 'New Venture' : 'Edit Venture'}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={busy}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={busy}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className={label}>Name *</label>
            <input className={input} value={name} maxLength={200} placeholder="Venture name"
              onChange={(e) => onNameChange(e.target.value)} />
            {err('name')}
          </div>

          <SlugField
            value={slug}
            locked={false}
            wasPublished={false}
            conflictError={slugConflict}
            basePath="/business#"
            onChange={(s) => { setSlug(s); setSlugTouched(true); setSlugConflict(''); }}
            onUnlockRequest={() => {}}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Industry</label>
              <input className={input} value={industry} maxLength={150} placeholder="e.g. SaaS"
                onChange={(e) => setIndustry(e.target.value)} />
              {err('industry')}
            </div>
            <div>
              <label className={label}>Your Role</label>
              <input className={input} value={role} maxLength={150} placeholder="e.g. Founder & CEO"
                onChange={(e) => setRole(e.target.value)} />
              {err('role')}
            </div>
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea className={input} rows={5} value={description}
              placeholder="What this venture does (plain text)"
              onChange={(e) => setDescription(e.target.value)} />
            {err('description')}
          </div>

          <div>
            <label className={label}>Website URL</label>
            <input className={input} type="url" value={websiteUrl} placeholder="https://…"
              onChange={(e) => setWebsiteUrl(e.target.value)} />
            {err('websiteUrl')}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <label className={label}>Logo</label>
            <ImageUploader folder="business" onUploaded={setLogoUrl} />
            {logoUrl && (
              <button type="button" onClick={() => setLogoUrl('')}
                className="mt-2 text-xs text-red-400 hover:underline">Remove logo</button>
            )}
            {err('logoUrl')}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Status</label>
              <select className={input} value={status}
                onChange={(e) => setStatus(e.target.value as VentureData['status'])}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Category</label>
              <select className={input} value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Start Date</label>
              <input className={input} type="date" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} />
              {err('startDate')}
            </div>
            <div>
              <label className={label}>End Date</label>
              <input className={input} type="date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} />
              <p className="mt-1 text-xs text-slate-600">Leave empty if ongoing</p>
              {err('endDate')}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div>
              <p className="text-sm font-medium text-white">Featured</p>
              <p className="mt-0.5 text-xs text-slate-500">Pinned to the top of /business</p>
            </div>
            <button type="button" role="switch" aria-checked={isFeatured}
              onClick={() => setIsFeatured((f) => !f)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isFeatured ? 'bg-emerald-500' : 'bg-slate-700'
              }`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isFeatured ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
