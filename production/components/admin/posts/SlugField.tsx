'use client';

// Slug field:
//  - auto-generated from title until manually edited (parent owns that logic)
//  - shows /blog/[slug] live preview
//  - debounced format validation (300ms) — no error flash mid-typing
//  - published posts: locked behind "Change slug" (parent passes locked + onUnlockRequest)
//  - 409 conflict error injected by parent via `conflictError`

import { useEffect, useRef, useState } from 'react';
import { slugify } from '@/lib/slugify';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface Props {
  value: string;
  locked: boolean;
  wasPublished: boolean;
  conflictError?: string; // 409 from server
  basePath?: string;      // URL prefix shown in preview — '/blog' | '/portfolio'
  onChange: (slug: string) => void;
  onUnlockRequest: () => void;
}

export default function SlugField({
  value, locked, wasPublished, conflictError, basePath = '/blog', onChange, onUnlockRequest,
}: Props) {
  const [localError, setLocalError] = useState('');
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced validation — runs 300ms after the last keystroke
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (!value) setLocalError('Slug is required');
      else if (!SLUG_RE.test(value)) setLocalError('Lowercase letters, numbers and hyphens only');
      else setLocalError('');
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [value]);

  const error = conflictError || localError;

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        Slug *
        {wasPublished && (
          <span className="ml-2 normal-case text-amber-400">
            {locked ? '🔒 locked (published)' : '🔓 unlocked — change with care'}
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          className={`w-full rounded-xl border bg-slate-950 px-3 py-2 text-sm text-white outline-none ${
            error ? 'border-red-500/60' : 'border-slate-700 focus:border-emerald-500'
          } ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
          value={value}
          readOnly={locked}
          maxLength={220}
          placeholder="auto-generated-from-title"
          onChange={(e) => onChange(slugify(e.target.value))}
        />
        {locked && (
          <button
            type="button"
            onClick={onUnlockRequest}
            className="shrink-0 rounded-xl border border-amber-500/40 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10"
          >
            Change slug
          </button>
        )}
      </div>
      <p className="mt-1 font-mono text-xs text-slate-600">{basePath}/{value || '…'}</p>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
