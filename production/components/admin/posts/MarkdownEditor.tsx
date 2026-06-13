'use client';

// Markdown editor — locked decision: split preview on desktop, tab toggle
// on mobile. Content stored as plain markdown; this preview is an
// editor-side approximation (public pages render with react-markdown).

import { useMemo, useState } from 'react';

function renderPreview(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let html = esc(md);
  html = html.replace(/```([\s\S]*?)```/g, (_, c) => `<pre>${c.trim()}</pre>`);
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
  return html
    .split(/\n{2,}/)
    .map((b) => (/^<(h\d|ul|pre)/.test(b.trim()) ? b : b.trim() ? `<p>${b.trim()}</p>` : ''))
    .join('\n');
}

interface Props {
  value: string;
  error?: string;
  onChange: (content: string) => void;
}

export default function MarkdownEditor({ value, error, onChange }: Props) {
  // Mobile tab state (desktop always shows split)
  const [mobileTab, setMobileTab] = useState<'write' | 'preview'>('write');
  const previewHtml = useMemo(() => renderPreview(value), [value]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Content (Markdown) *
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">{wordCount} words</span>
          {/* Mobile-only tabs */}
          <div className="flex rounded-lg border border-slate-700 p-0.5 lg:hidden">
            {(['write', 'preview'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMobileTab(t)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                  mobileTab === t ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          className={`min-h-[460px] w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-[13px] leading-relaxed text-white placeholder-slate-500 outline-none ${
            error ? 'border-red-500/60' : 'border-slate-700 focus:border-emerald-500'
          } ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}
          value={value}
          placeholder={'# Heading\n\nWrite in **markdown**…\n\n- list item\n- `inline code`'}
          onChange={(e) => onChange(e.target.value)}
        />
        <div
          className={`prose prose-invert prose-sm min-h-[460px] max-w-none overflow-auto rounded-xl border border-slate-800 bg-slate-900/50 p-4 ${
            mobileTab === 'write' ? 'hidden lg:block' : ''
          }`}
          dangerouslySetInnerHTML={{
            __html: previewHtml || '<p class="text-slate-600">Preview appears here…</p>',
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
