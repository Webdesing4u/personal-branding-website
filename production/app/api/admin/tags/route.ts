import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { guardAdmin, validationError } from '@/lib/admin-api';
import { slugify } from '@/lib/slugify';

// POST /api/admin/tags — inline tag creation from the post editor.
// Dedupe by slug: typing an existing tag returns the existing row (200),
// a brand-new one is created (201). The editor can't create duplicates.

const tagSchema = z.object({ name: z.string().trim().min(2).max(50) });

export async function POST(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const slug = slugify(parsed.data.name);
  if (!slug) return NextResponse.json({ error: 'Tag name must contain letters or numbers.' }, { status: 400 });

  const existing = await db.blogTag.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ tag: existing, existed: true });

  const tag = await db.blogTag.create({ data: { name: parsed.data.name, slug } });
  return NextResponse.json({ tag, existed: false }, { status: 201 });
}
