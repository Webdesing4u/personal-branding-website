import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { gallerySchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

type Params = { params: { id: string } };

// PATCH /api/admin/gallery/:id — edit title/category/order
export async function PATCH(req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = gallerySchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await db.galleryImage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  const image = await db.galleryImage.update({ where: { id: params.id }, data: parsed.data });

  revalidatePath('/gallery');

  return NextResponse.json({ image });
}

// DELETE /api/admin/gallery/:id
// Note: deletes the DB row. The Cloudinary asset can be cleaned up separately
// via Cloudinary's admin API or auto-deletion rules — DB stays the source of truth.
export async function DELETE(_req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const existing = await db.galleryImage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  await db.galleryImage.delete({ where: { id: params.id } });

  revalidatePath('/gallery');

  return NextResponse.json({ ok: true });
}
