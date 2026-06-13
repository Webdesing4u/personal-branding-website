'use client';

// Tag combobox:
//  - type → filters existing tags (dropdown)
//  - Enter / "Create" → POST /api/admin/tags (server-deduped by slug)
//  - selected tags shown as chips with × remove
//  - exposes `creating` so the parent can block Save during the
//    tag-create ↔ post-save race condition

import { useMemo, useRef, useState } from 'react';
import { adminFetch, RateLimitError } from '@/lib/admin-fetch';
import { useToast } from '../Toast';

export interface Tag { id: string; name: string }

interface Props {
  allTags: Tag[];
  selectedIds: string[];
  onTagsChange: (allTags: Tag[]) => void;     // new tag registered globally
  onSelectionChange: (ids: string[]) => void;
  onCreatingChange: (creating: boolean) => void;
}

export default function TagCombobox({
  allTags, selectedIds, onTagsChange, onSelectionChange, onCreatingChange,
}: Props) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = allTags.filter((t) => selectedIds.includes(t.id));
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTags.filter(
      (t) => !selectedIds.includes(t.id) && (!q || t.name.toLowerCase().includes(q))
    );
  }, [allTags, selectedIds, query]);

  const exactMatch = allTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  const select = (tag: Tag) => {
    onSelectionChange([...selectedIds, tag.id]);
    setQuery('');
    inputRef.current?.focus();
  };

  const remove = (id: string) => onSelectionChange(selectedIds.filter((x) => x !== id));

  const createTag = async () => {
    const name = query.trim();
    if (name.length < 2 || creating) return;
    setCreating(true);
    onCreatingChange(true);
    try {
      const { tag, existed } = await adminFetch<{ tag: Tag; existed: boolean }>(
        '/api/admin/tags',
        { method: 'POST', body: JSON.stringify({ name }) }
      );
      if (!allTags.some((t) => t.id === tag.id)) onTagsChange([...allTags, tag]);
      if (!selectedIds.includes(tag.id)) onSelectionChange([...selectedIds, tag.id]);
      setQuery('');
      toast.success(existed ? `Tag "${tag.name}" attached` : `Tag "${tag.name}" created`);
    } catch (e) {
      toast.error(e instanceof RateLimitError ? e.message : 'Could not create tag');
    } finally {
      setCreating(false);
      onCreatingChange(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enter: select first filtered match, otherwise create new
      if (filtered.length > 0 && query.trim()) select(filtered[0]);
      else if (query.trim().length >= 2 && !exactMatch) void createTag();
    }
    if (e.key === 'Backspace' && !query && selectedIds.length > 0) {
      remove(selectedIds[selectedIds.length - 1]); // backspace removes last chip
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="relative">
      {/* Chips + input share one bordered box */}
      <div
        className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-2 py-1.5 focus-within:border-emerald-500"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((t) => (
          <span
            key={t.id}
            className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300"
          >
            #{t.name}
            <button
              type="button"
              aria-label={`Remove tag ${t.name}`}
              onClick={(e) => { e.stopPropagation(); remove(t.id); }}
              className="text-emerald-400/70 transition hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm text-white placeholder-slate-500 outline-none"
          value={query}
          placeholder={selected.length === 0 ? 'Type to search or create tags…' : ''}
          maxLength={50}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)} // allow option click
          onKeyDown={onKeyDown}
        />
      </div>

      {/* Dropdown */}
      {open && (query.trim() || filtered.length > 0) && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // keep input focus
              onClick={() => select(t)}
              className="block w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
            >
              #{t.name}
            </button>
          ))}
          {query.trim().length >= 2 && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void createTag()}
              disabled={creating}
              className="block w-full border-t border-slate-800 px-3 py-2 text-left text-sm font-semibold text-emerald-400 hover:bg-slate-800 disabled:opacity-50"
            >
              {creating ? 'Creating…' : `+ Create "${query.trim()}"`}
            </button>
          )}
          {filtered.length === 0 && query.trim().length < 2 && (
            <p className="px-3 py-2 text-xs text-slate-500">Type at least 2 characters to create</p>
          )}
        </div>
      )}
    </div>
  );
}
