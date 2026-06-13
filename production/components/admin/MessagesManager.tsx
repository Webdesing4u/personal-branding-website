'use client';

// Messages inbox — viewer only per locked spec.
// Filter tabs (All | Unread) · unread badge · optimistic read toggle ·
// delete confirm · pagination. No reply / edit / resend.

import { useCallback, useEffect, useState } from 'react';
import { adminFetch, RateLimitError } from '@/lib/admin-fetch';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  ipAddress: string | null;
  createdAt: string;
}

interface ListResponse {
  messages: Message[];
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
}

type Filter = 'all' | 'unread';

export default function MessagesManager() {
  const toast = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    (f: Filter, p: number) => {
      setLoading(true);
      adminFetch<ListResponse>(`/api/admin/messages?filter=${f}&page=${p}`)
        .then((d) => {
          setMessages(d.messages);
          setUnreadCount(d.unreadCount);
          setPages(d.pages || 1);
        })
        .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load messages'))
        .finally(() => setLoading(false));
    },
    [toast]
  );

  useEffect(() => {
    load(filter, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  const switchFilter = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  // ── Optimistic read toggle ──
  const toggleRead = async (msg: Message) => {
    const nextRead = !msg.isRead;
    const before = { messages, unreadCount };
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: nextRead } : m)));
    setUnreadCount((c) => c + (nextRead ? -1 : 1));

    try {
      await adminFetch(`/api/admin/messages/${msg.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead: nextRead }),
      });
    } catch (e) {
      setMessages(before.messages);
      setUnreadCount(before.unreadCount);
      toast.error(e instanceof RateLimitError ? e.message : 'Update failed — reverted');
    }
  };

  // Expanding an unread message auto-marks it read
  const expand = (msg: Message) => {
    setExpanded((cur) => (cur === msg.id ? null : msg.id));
    if (!msg.isRead) void toggleRead(msg);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const before = { messages, unreadCount };
    setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    if (!deleteTarget.isRead) setUnreadCount((c) => c - 1);

    try {
      await adminFetch(`/api/admin/messages/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Message deleted');
      setDeleteTarget(null);
    } catch (e) {
      setMessages(before.messages);
      setUnreadCount(before.unreadCount);
      toast.error(e instanceof RateLimitError ? e.message : 'Delete failed — message restored');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Filter tabs with unread badge */}
      <div className="flex items-center gap-2">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => switchFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-emerald-500 text-slate-950'
                : 'border border-slate-700 text-slate-300 hover:border-emerald-500/50'
            }`}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                filter === 'unread' ? 'bg-slate-950/20 text-slate-950' : 'bg-red-500 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          📭 {filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border bg-slate-900/50 transition ${
                m.isRead ? 'border-slate-800' : 'border-emerald-500/40'
              }`}
            >
              {/* Row header — click to expand */}
              <button
                onClick={() => expand(m)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {!m.isRead && (
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                    {m.subject}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-400">
                    {m.name} · {m.email}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-500">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-600">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>

              {/* Expanded body */}
              {expanded === m.id && (
                <div className="border-t border-slate-800 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {m.message}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-600">
                      IP: {m.ipAddress ?? 'unknown'} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500/60 hover:text-emerald-400"
                      >
                        ↩ Reply via email
                      </a>
                      <button
                        onClick={() => void toggleRead(m)}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500/60"
                      >
                        Mark {m.isRead ? 'unread' : 'read'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-500">Page {page} of {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this message?"
        description={`Message from ${deleteTarget?.name} (${deleteTarget?.email}) will be permanently removed.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
