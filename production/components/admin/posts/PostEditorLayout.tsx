'use client';

// Editor shell — header (title, timestamps, actions) + responsive 2-column
// body. Left: meta fields. Right: markdown editor. Stacked on mobile.

import type { ReactNode } from 'react';

interface Props {
  isNew: boolean;
  saving: boolean;
  blockSaveReason?: string;       // e.g. "Creating tag…" during race condition
  updatedAt?: string | null;      // UX rule: show timestamps when editing
  publishedAt?: string | null;
  onCancel: () => void;
  onSave: () => void;
  left: ReactNode;
  right: ReactNode;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function PostEditorLayout({
  isNew, saving, blockSaveReason, updatedAt, publishedAt, onCancel, onSave, left, right,
}: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{isNew ? 'New Post' : 'Edit Post'}</h2>
          {!isNew && (
            <p className="mt-1 text-xs text-slate-500">
              {updatedAt && <>Last updated {formatDateTime(updatedAt)}</>}
              {publishedAt && (
                <span className="ml-3 text-emerald-500/80">
                  · Published {formatDateTime(publishedAt)}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {blockSaveReason && (
            <span className="text-xs text-amber-400">{blockSaveReason}</span>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !!blockSaveReason}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Saving…
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      {/* Body: left meta column + right editor column; stacked on mobile */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">{left}</div>
        <div className="lg:col-span-3">{right}</div>
      </div>
    </div>
  );
}
