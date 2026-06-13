'use client';

// PostForm — single state owner for the post editor.
//
// Edge cases handled (the "professional" list):
//  1. Slug conflict on rename   → 409 → inline error on slug field only,
//     other fields untouched, slug reverted to last-saved value option shown
//  2. Publish without content   → Zod blocks (content min 50) before any API call
//  3. Rapid double-click Save   → useAdminMutation in-flight ref guard
//  4. Session expired mid-edit  → adminFetch 401 → login redirect w/ callbackUrl
//  5. Tag-create / save race    → Save disabled while TagCombobox is creating

import { useState } from 'react';
import { blogPostSchema } from '@/lib/validations';
import { slugify } from '@/lib/slugify';
import { adminFetch } from '@/lib/admin-fetch';
import { useToast } from '../Toast';
import ConfirmModal from '../ConfirmModal';
import ImageUploader from '../../ImageUploader';
import { useAdminMutation } from '../useAdminMutation';
import PostEditorLayout from './PostEditorLayout';
import MarkdownEditor from './MarkdownEditor';
import TagCombobox, { type Tag } from './TagCombobox';
import SlugField from './SlugField';
import SeoFields from './SeoFields';
import StatusToggle from './StatusToggle';

export interface Category { id: string; name: string }

export interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: 'draft' | 'published';
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  category: Category | null;
  tags: { tag: Tag }[];
}

interface Props {
  post: PostData | null; // null = create
  categories: Category[];
  allTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onSaved: (post: PostData, isNew: boolean) => void;
  onCancel: () => void;
}

export default function PostForm({
  post, categories, allTags, onTagsChange, onSaved, onCancel,
}: Props) {
  const toast = useToast();
  const { mutate, busy } = useAdminMutation<{ post: PostData }>();

  const isNew = post === null;
  const wasPublished = post?.status === 'published';
  const lastSavedSlug = post?.slug ?? '';

  // ── Form state ──
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [slugUnlocked, setSlugUnlocked] = useState(false);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage ?? '');
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft');
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? '');
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? '');
  const [tagIds, setTagIds] = useState<string[]>(post?.tags.map((t) => t.tag.id) ?? []);

  // ── UI state ──
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugConflict, setSlugConflict] = useState('');
  const [tagCreating, setTagCreating] = useState(false);
  const [publishAsk, setPublishAsk] = useState(false);
  const [slugUnlockAsk, setSlugUnlockAsk] = useState(false);

  const slugLocked = wasPublished && !slugUnlocked;

  // Auto-slug from title until manually edited (never for published posts)
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
      excerpt: excerpt || undefined,
      content,
      featuredImage,
      status,
      categoryId: categoryId || undefined, // undefined → required_error fires
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      tagIds,
    };

    // Client-side Zod (same schema as server) — catches "publish without content" etc.
    const parsed = blogPostSchema.safeParse(payload);
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
          ? adminFetch<{ post: PostData }>('/api/admin/posts', {
              method: 'POST',
              body: JSON.stringify(parsed.data),
            })
          : adminFetch<{ post: PostData }>(`/api/admin/posts/${post.id}`, {
              method: 'PATCH',
              body: JSON.stringify(parsed.data),
            }),
      {
        onSuccess: ({ post: saved }) => {
          toast.success(
            isNew
              ? status === 'published' ? 'Post published 🎉' : 'Draft saved'
              : 'Post updated — public page revalidated'
          );
          // Hydrate relations locally (server returns bare row)
          onSaved(
            {
              ...saved,
              category: categories.find((c) => c.id === saved.categoryId) ?? null,
              tags: tagIds
                .map((id) => ({ tag: allTags.find((t) => t.id === id)! }))
                .filter((x) => x.tag),
            },
            isNew
          );
        },
        onValidation: (fields) => {
          setErrors(fields);
          toast.error('Server rejected some fields');
        },
        onConflict: () => {
          // Edge case ①: slug conflict → inline on slug ONLY, rest of form intact
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
        blockSaveReason={tagCreating ? 'Creating tag…' : undefined}
        updatedAt={post?.updatedAt}
        publishedAt={post?.publishedAt}
        onCancel={onCancel}
        onSave={handleSave}
        left={
          <>
            <div>
              <label className={label}>Title *</label>
              <input className={input} value={title} maxLength={200} placeholder="Post title"
                onChange={(e) => onTitleChange(e.target.value)} />
              {err('title')}
            </div>

            <SlugField
              value={slug}
              locked={slugLocked}
              wasPublished={!!wasPublished}
              conflictError={slugConflict}
              onChange={(s) => {
                setSlug(s);
                setSlugTouched(true);
                setSlugConflict('');
              }}
              onUnlockRequest={() => setSlugUnlockAsk(true)}
            />

            <div>
              <label className={label}>Excerpt</label>
              <textarea className={input} rows={2} value={excerpt} maxLength={500}
                placeholder="Short summary for cards & meta fallback"
                onChange={(e) => setExcerpt(e.target.value)} />
              {err('excerpt')}
            </div>

            <div className={card}>
              <label className={label}>Category *</label>
              <select
                className={`${input} ${errors.categoryId ? 'border-red-500/60' : ''}`}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">— Select a category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {err('categoryId')}
            </div>

            <div className={card}>
              <label className={label}>Tags</label>
              <TagCombobox
                allTags={allTags}
                selectedIds={tagIds}
                onTagsChange={onTagsChange}
                onSelectionChange={setTagIds}
                onCreatingChange={setTagCreating}
              />
            </div>

            <div className={card}>
              <label className={label}>Status</label>
              <StatusToggle
                status={status}
                onPublishRequest={() => setPublishAsk(true)}
                onDraft={() => setStatus('draft')}
              />
            </div>

            <div className={card}>
              <label className={label}>Featured Image</label>
              <ImageUploader folder="blog" onUploaded={setFeaturedImage} />
              {featuredImage && (
                <button type="button" onClick={() => setFeaturedImage('')}
                  className="mt-2 text-xs text-red-400 hover:underline">
                  Remove image
                </button>
              )}
              {err('featuredImage')}
            </div>

            <div className={card}>
              <label className={label}>SEO</label>
              <SeoFields
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                errors={errors}
                onChange={(p) => {
                  if (p.metaTitle !== undefined) setMetaTitle(p.metaTitle);
                  if (p.metaDescription !== undefined) setMetaDescription(p.metaDescription);
                }}
              />
            </div>
          </>
        }
        right={
          <MarkdownEditor value={content} error={errors.content} onChange={setContent} />
        }
      />

      {/* Publish confirmation (draft → published only) */}
      <ConfirmModal
        open={publishAsk}
        title="Publish this post?"
        description="This will make the post publicly visible on the blog, the sitemap and RSS. You can switch it back to draft at any time."
        confirmLabel="Publish"
        variant="primary"
        onConfirm={() => {
          setStatus('published');
          setPublishAsk(false);
        }}
        onCancel={() => setPublishAsk(false)}
      />

      {/* Slug unlock warning (published posts) */}
      <ConfirmModal
        open={slugUnlockAsk}
        title="Change a published slug?"
        description={`The current URL /blog/${slug} may be indexed by Google and linked elsewhere. Changing it will make the old URL 404 unless you add a redirect. Both paths revalidate automatically.`}
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
