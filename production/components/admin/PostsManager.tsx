'use client';

// Posts Admin Manager — list view + delegates editing to posts/PostForm.
// All editor logic lives in /components/admin/posts/* per the locked
// component architecture.

import { useEffect, useState } from 'react';
import { adminFetch, RateLimitError } from '@/lib/admin-fetch';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';
import PostForm, { type Category, type PostData } from './posts/PostForm';
import type { Tag } from './posts/TagCombobox';

export default function PostsManager() {
  const toast = useToast();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // null = list view · 'new' = create · PostData = edit
  const [editing, setEditing] = useState<PostData | 'new' | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<PostData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFetch<{ posts: PostData[] }>('/api/admin/posts'),
      adminFetch<{ categories: Category[]; tags: Tag[] }>('/api/admin/blog-meta'),
    ])
      .then(([p, meta]) => {
        setPosts(p.posts);
        setCategories(meta.categories);
        setTags(meta.tags);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load posts'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaved = (saved: PostData, isNew: boolean) => {
    setPosts((prev) =>
      isNew ? [saved, ...prev] : prev.map((p) => (p.id === saved.id ? saved : p))
    );
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const before = posts;
    setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    try {
      await adminFetch(`/api/admin/posts/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Post deleted');
      setDeleteTarget(null);
    } catch (e) {
      setPosts(before);
      toast.error(e instanceof RateLimitError ? e.message : 'Delete failed — post restored');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-slate-800/60" />;

  // ── Editor mode ──
  if (editing !== null) {
    return (
      <PostForm
        post={editing === 'new' ? null : editing}
        categories={categories}
        allTags={tags}
        onTagsChange={setTags}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  // ── List mode ──
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">
          Posts <span className="text-sm font-normal text-slate-500">({posts.length})</span>
        </h2>
        <button
          onClick={() => setEditing('new')}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          + New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          No posts yet — write your first one.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Title</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Published</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="max-w-xs px-5 py-3.5">
                    <p className="truncate font-medium text-white">{p.title}</p>
                    <p className="truncate font-mono text-xs text-slate-500">/blog/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{p.category?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setEditing(p)}
                      className="font-semibold text-emerald-400 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => setDeleteTarget(p)}
                      className="ml-4 font-semibold text-red-400 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this post?"
        description={`"${deleteTarget?.title}" and its tag links will be permanently removed. The public blog updates immediately.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
