import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { projectSchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

// GET /api/admin/projects — paginated list
export async function GET(req: Request) {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const take = 20;

  const [projects, total] = await Promise.all([
    db.portfolioProject.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
      include: { category: true, images: { orderBy: { displayOrder: 'asc' } } },
    }),
    db.portfolioProject.count(),
  ]);

  return NextResponse.json({ projects, total, page, pages: Math.ceil(total / take) });
}

// POST /api/admin/projects — create
export async function POST(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const data = parsed.data;
  const exists = await db.portfolioProject.findUnique({ where: { slug: data.slug } });
  if (exists) return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });

  const project = await db.portfolioProject.create({
    data: {
      ...data,
      featuredImage: data.featuredImage || null,
      projectUrl: data.projectUrl || null,
      githubUrl: data.githubUrl || null,
    },
  });

  revalidatePath('/portfolio');
  revalidatePath('/'); // featured projects on home

  return NextResponse.json({ project }, { status: 201 });
}
