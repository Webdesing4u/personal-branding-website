import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { blogPostSchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

// GET /api/admin/posts — paginated list
export async function GET(req: Request) {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const take = 20;

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
      include: { category: true, tags: { include: { tag: true } } },
    }),
    db.blogPost.count(),
  ]);

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / take) });
}

// POST /api/admin/posts — create
export async function POST(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const { tagIds, ...data } = parsed.data;

  const exists = await db.blogPost.findUnique({ where: { slug: data.slug } });
  if (exists) return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });

  const post = await db.blogPost.create({
    data: {
      ...data,
      featuredImage: data.featuredImage || null,
      authorId: guard.userId,
      publishedAt: data.status === 'published' ? new Date() : null,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });

  revalidatePath('/blog');

  return NextResponse.json({ post }, { status: 201 });
}
