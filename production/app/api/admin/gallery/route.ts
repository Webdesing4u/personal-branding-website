import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { gallerySchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

// GET /api/admin/gallery — full ordered list (galleries are small; no pagination)
export async function GET() {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const images = await db.galleryImage.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ images });
}

// POST /api/admin/gallery — add image (imageUrl comes from Cloudinary upload)
export async function POST(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = gallerySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const image = await db.galleryImage.create({ data: parsed.data });

  revalidatePath('/gallery');

  return NextResponse.json({ image }, { status: 201 });
}

// PUT /api/admin/gallery — bulk reorder: [{ id, displayOrder }, ...]
const reorderSchema = z
  .array(z.object({ id: z.string().uuid(), displayOrder: z.number().int().min(0) }))
  .min(1)
  .max(200);

export async function PUT(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  // Single transaction — order is never half-applied
  await db.$transaction(
    parsed.data.map(({ id, displayOrder }) =>
      db.galleryImage.update({ where: { id }, data: { displayOrder } })
    )
  );

  revalidatePath('/gallery');

  return NextResponse.json({ ok: true });
}
