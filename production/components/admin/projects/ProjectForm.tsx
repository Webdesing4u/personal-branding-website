'use client';

// ProjectForm — same architecture as PostForm, simplified:
//  - fullDescription uses MarkdownEditor (locked decision)
//  - TechStackInput chips instead of TagCombobox (no backend entity, no race)
//  - URL fields (projectUrl / githubUrl) with Zod URL validation
//  - isFeatured toggle (home page highlight)
//  - Same slug rules: auto-gen → touch lock → published guard → 409 inline
//
// Edge cases inherited from the Posts pattern:
//  double-click save (useAdminMutation ref guard) · 401 mid-edit redirect ·
//  slug conflict isolated to slug field · Zod blocks bad publishes client-side

import { useState } from 'react';
import { projectSchema } from '@/lib/validations';
import { slugify } from '@/lib/slugify';
import { adminFetch } from '@/lib/admin-fetch';
import { useToast } from '../Toast';
import ConfirmModal from '../ConfirmModal';
import ImageUploader from '../../ImageUploader';
import { useAdminMutation } from '../useAdminMutation';
import PostEditorLayout from '../posts/PostEditorLayout';
import MarkdownEditor from '../posts/MarkdownEditor';
import SlugField from '../posts/SlugField';
import TechStackInput from './TechStackInput';

export interface PortfolioCategory { id: string; name: string }

export interface ProjectData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  featuredImage: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  techStack: string[];
  categoryId: string | null;
  isFeatured: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  category: PortfolioCategory | null;
}

interface Props {
  project: ProjectData | null; // null = create
  categories: PortfolioCategory[];
  onSaved: (project: ProjectData, isNew: boolean) => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, categories, onSaved, onCancel }: Props) {
  const toast = useToast();
  const { mutate, busy } = useAdminMutation<{ project: ProjectData }>();

  const isNew = project === null;
  const wasPublished = project?.status === 'published';
  const lastSavedSlug = project?.slug ?? '';

  // ── Form state ──
  const [title, setTitle] = useState(project?.title ?? '');
  const [slug, setSlug] = useState(project?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [slugUnlocked, setSlugUnlocked] = useState(false);
  const [shortDescription, setShortDescription] = useState(project?.shortDescription ?? '');
  const [fullDescription, setFullDescription] = useState(project?.fullDescription ?? '');
  const [featuredImage, setFeaturedImage] = useState(project?.featuredImage ?? '');
  const [projectUrl, setProjectUrl] = useState(project?.projectUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '');
  const [techStack, setTechStack] = useState<string[]>(project?.techStack ?? []);
  const [categoryId, setCategoryId] = useState(project?.categoryId ?? '');
  const [isFeatured, setIsFeatured] = useState(project?.isFeatured ?? false);
  const [status, setStatus] = useState<'draft' | 'published'>(project?.status ?? 'draft');

  // ── UI state ──
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugConflict, setSlugConflict] = useState('');
  const [publishAsk, setPublishAsk] = useState(false);
  const [slugUnlockAsk, setSlugUnlockAsk] = useState(false);

  const slugLocked = wasPublished && !slugUnlocked;

  const onTitleChange = (t: string) => {
    setTitle(t);
    if (!slugTouched && !wasPublished) setSlug(slugify(t));
  };

  // ── Save ──
  const handleSave = () => {
    setSlugConflict('');
    const payload = {
      title,
      slug,
      shortDescription: shortDescription || undefined,
      fullDescription: fullDescription || undefined,
      featuredImage,
      projectUrl,
      githubUrl,
      techStack,
      categoryId: categoryId || null,
      isFeatured,
      status,
    };

    const parsed = projectSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) errs[k] = v[0];
      }
      setErrors(errs);
      toast.error('Fix the highlighted fields');
      return;
    }
    setErrors({});

    void mutate(
      () =>
        isNew
          ? adminFetch<{ project: ProjectData }>('/api/admin/projects', {
              method: 'POST',
              body: JSON.stringify(parsed.data),
            })
          : adminFetch<{ project: ProjectData }>(`/api/admin/projects/${project.id}`, {
              method: 'PATCH',
              body: JSON.stringify(parsed.data),
            }),
      {
        onSuccess: ({ project: saved }) => {
          toast.success(
            isNew
              ? status === 'published' ? 'Project published 🎉' : 'Draft saved'
              : 'Project updated — public pages revalidated'
          );
          onSaved(
            { ...saved, category: categories.find((c) => c.id === saved.categoryId) ?? null },
            isNew
          );
        },
        onValidation: (fields) => {
          setErrors(fields);
          toast.error('Server rejected some fields');
        },
        onConflict: () => {
          setSlugConflict(
            isNew
              ? 'This slug is already in use — pick another.'
              : `This slug is taken. Last saved slug was "${lastSavedSlug}".`
          );
        },
        onError: (msg) => toast.error(msg),
      }
    );
  };

  const input =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500';
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500';
  const card = 'rounded-2xl border border-slate-800 bg-slate-900/50 p-5';
  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-red-400">{errors[k]}</p>;

  return (
    <>
      <PostEditorLayout
        isNew={isNew}
        saving={busy}
        updatedAt={project?.updatedAt}
        publishedAt={null}
        onCancel={onCancel}
        onSave={handleSave}
        left={
          <>
            <div>
              <label className={label}>Title *</label>
              <input className={input} value={title} maxLength={200} placeholder="Project title"
                onChange={(e) => onTitleChange(e.target.value)} />
              {err('title')}
            </div>

            <SlugField
              value={slug}
              locked={slugLocked}
              wasPublished={!!wasPublished}
              conflictError={slugConflict}
              basePath="/portfolio"
              onChange={(s) => {
                setSlug(s);
                setSlugTouched(true);
                setSlugConflict('');
              }}
              onUnlockRequest={() => setSlugUnlockAsk(true)}
            />

            <div>
              <label className={label}>Short Description</label>
              <textarea className={input} rows={3} value={shortDescription} maxLength={500}
                placeholder="One-liner for cards & meta description"
                onChange={(e) => setShortDescription(e.target.value)} />
              {err('shortDescription')}
            </div>

            <div className={card}>
              <label className={label}>Category</label>
              <select className={input} value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {err('categoryId')}
            </div>

            <div className={card}>
              <label className={label}>Tech Stack</label>
              <TechStackInput value={techStack} error={errors.techStack} onChange={setTechStack} />
            </div>

            <div className={card}>
              <label className={label}>Links</label>
              <input className={input} type="url" value={projectUrl}
                placeholder="https://live-site.com"
                onChange={(e) => setProjectUrl(e.target.value)} />
              {err('projectUrl')}
              <input className={`${input} mt-2`} type="url" value={githubUrl}
                placeholder="https://github.com/user/repo"
                onChange={(e) => setGithubUrl(e.target.value)} />
              {err('githubUrl')}
            </div>

            <div className={card}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Featured on Home</p>
                  <p className="mt-0.5 text-xs text-slate-500">Shows in the homepage highlight grid</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFeatured}
                  onClick={() => setIsFeatured((f) => !f)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    isFeatured ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isFeatured ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div className={card}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {status === 'published' ? 'Published' : 'Draft'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={status === 'published'}
                  onClick={() =>
                    status === 'published' ? setStatus('draft') : setPublishAsk(true)
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    status === 'published' ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    status === 'published' ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div className={card}>
              <label className={label}>Featured Image</label>
              <ImageUploader folder="portfolio" onUploaded={setFeaturedImage} />
              {featuredImage && (
                <button type="button" onClick={() => setFeaturedImage('')}
                  className="mt-2 text-xs text-red-400 hover:underline">
                  Remove image
                </button>
              )}
              {err('featuredImage')}
            </div>
          </>
        }
        right={
          <MarkdownEditor
            value={fullDescription}
            error={errors.fullDescription}
            onChange={setFullDescription}
          />
        }
      />

      <ConfirmModal
        open={publishAsk}
        title="Publish this project?"
        description="This will make the project publicly visible in the portfolio, the sitemap and (if featured) on the home page."
        confirmLabel="Publish"
        variant="primary"
        onConfirm={() => {
          setStatus('published');
          setPublishAsk(false);
        }}
        onCancel={() => setPublishAsk(false)}
      />

      <ConfirmModal
        open={slugUnlockAsk}
        title="Change a published slug?"
        description={`The current URL /portfolio/${slug} may be indexed and linked elsewhere. Changing it will make the old URL 404 unless you add a redirect. Both paths revalidate automatically.`}
        confirmLabel="I understand — unlock"
        variant="primary"
        onConfirm={() => {
          setSlugUnlocked(true);
          setSlugUnlockAsk(false);
        }}
        onCancel={() => setSlugUnlockAsk(false)}
      />
    </>
  );
}
