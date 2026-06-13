'use client';

// Projects Admin Manager — list view + delegates editing to projects/ProjectForm.
// Identical shape to PostsManager (the architecture paying off).

import { useEffect, useState } from 'react';
import { adminFetch, RateLimitError } from '@/lib/admin-fetch';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';
import ProjectForm, {
  type PortfolioCategory,
  type ProjectData,
} from './projects/ProjectForm';

export default function ProjectsManager() {
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<ProjectData | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFetch<{ projects: ProjectData[] }>('/api/admin/projects'),
      adminFetch<{ categories: PortfolioCategory[] }>('/api/admin/portfolio-meta'),
    ])
      .then(([p, meta]) => {
        setProjects(p.projects);
        setCategories(meta.categories);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load projects'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaved = (saved: ProjectData, isNew: boolean) => {
    setProjects((prev) =>
      isNew ? [saved, ...prev] : prev.map((p) => (p.id === saved.id ? saved : p))
    );
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const before = projects;
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    try {
      await adminFetch(`/api/admin/projects/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Project deleted');
      setDeleteTarget(null);
    } catch (e) {
      setProjects(before);
      toast.error(e instanceof RateLimitError ? e.message : 'Delete failed — project restored');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-slate-800/60" />;

  if (editing !== null) {
    return (
      <ProjectForm
        project={editing === 'new' ? null : editing}
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
          Projects <span className="text-sm font-normal text-slate-500">({projects.length})</span>
        </h2>
        <button
          onClick={() => setEditing('new')}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          No projects yet — add your first one.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Project</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Tech</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Featured</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="max-w-xs px-5 py-3.5">
                    <p className="truncate font-medium text-white">{p.title}</p>
                    <p className="truncate font-mono text-xs text-slate-500">/portfolio/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{p.category?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex max-w-[180px] flex-wrap gap-1">
                      {p.techStack.slice(0, 3).map((t) => (
                        <span key={t} className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">
                          {t}
                        </span>
                      ))}
                      {p.techStack.length > 3 && (
                        <span className="text-xs text-slate-500">+{p.techStack.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.isFeatured ? <span title="Featured on home">⭐</span> : <span className="text-slate-700">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setEditing(p)}
                      className="font-semibold text-emerald-400 hover:underline">Edit</button>
                    <button onClick={() => setDeleteTarget(p)}
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
        title="Delete this project?"
        description={`"${deleteTarget?.title}" and its gallery images will be permanently removed. Public portfolio and home page update immediately.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
