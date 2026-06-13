import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { projectSchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

type Params = { params: { id: string } };

// PATCH /api/admin/projects/:id — partial update
export async function PATCH(req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await db.portfolioProject.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  // Slug change → uniqueness check against other rows
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflict = await db.portfolioProject.findUnique({ where: { slug: parsed.data.slug } });
    if (conflict) return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });
  }

  const data = parsed.data;
  const project = await db.portfolioProject.update({
    where: { id: params.id },
    data: {
      ...data,
      featuredImage: data.featuredImage === '' ? null : data.featuredImage,
      projectUrl: data.projectUrl === '' ? null : data.projectUrl,
      githubUrl: data.githubUrl === '' ? null : data.githubUrl,
    },
  });

  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${existing.slug}`);
  if (project.slug !== existing.slug) revalidatePath(`/portfolio/${project.slug}`);
  revalidatePath('/');

  return NextResponse.json({ project });
}

// DELETE /api/admin/projects/:id — cascade removes portfolio_images
export async function DELETE(_req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const existing = await db.portfolioProject.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  await db.portfolioProject.delete({ where: { id: params.id } });

  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${existing.slug}`);
  revalidatePath('/');

  return NextResponse.json({ ok: true });
}
