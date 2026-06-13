import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { blogPostSchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

type Params = { params: { id: string } };

// PATCH /api/admin/posts/:id — partial update
export async function PATCH(req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = blogPostSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await db.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflict = await db.blogPost.findUnique({ where: { slug: parsed.data.slug } });
    if (conflict) return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });
  }

  const { tagIds, ...data } = parsed.data;

  const post = await db.blogPost.update({
    where: { id: params.id },
    data: {
      ...data,
      featuredImage: data.featuredImage === '' ? null : data.featuredImage,
      // Set publishedAt on first publish only
      publishedAt:
        data.status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt,
      ...(tagIds && {
        tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) },
      }),
    },
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${existing.slug}`);
  if (post.slug !== existing.slug) revalidatePath(`/blog/${post.slug}`);

  return NextResponse.json({ post });
}

// DELETE /api/admin/posts/:id — cascade removes blog_post_tags
export async function DELETE(_req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const existing = await db.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  await db.blogPost.delete({ where: { id: params.id } });

  revalidatePath('/blog');
  revalidatePath(`/blog/${existing.slug}`);

  return NextResponse.json({ ok: true });
}
