import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { ventureSchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

type Params = { params: { id: string } };

// PATCH /api/admin/ventures/:id — partial update
export async function PATCH(req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = ventureSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await db.businessVenture.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Venture not found' }, { status: 404 });

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflict = await db.businessVenture.findUnique({ where: { slug: parsed.data.slug } });
    if (conflict) return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });
  }

  const data = parsed.data;
  const venture = await db.businessVenture.update({
    where: { id: params.id },
    data: {
      ...data,
      websiteUrl: data.websiteUrl === '' ? null : data.websiteUrl,
      logoUrl: data.logoUrl === '' ? null : data.logoUrl,
      startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
      endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
    },
  });

  revalidatePath('/business');

  return NextResponse.json({ venture });
}

// DELETE /api/admin/ventures/:id
export async function DELETE(_req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const existing = await db.businessVenture.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Venture not found' }, { status: 404 });

  await db.businessVenture.delete({ where: { id: params.id } });
  revalidatePath('/business');

  return NextResponse.json({ ok: true });
}
