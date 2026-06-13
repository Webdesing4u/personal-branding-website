import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { ventureSchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

// GET /api/admin/ventures — paginated list
export async function GET(req: Request) {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const take = 20;

  const [ventures, total] = await Promise.all([
    db.businessVenture.findMany({
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * take,
      take,
      include: { category: true },
    }),
    db.businessVenture.count(),
  ]);

  return NextResponse.json({ ventures, total, page, pages: Math.ceil(total / take) });
}

// POST /api/admin/ventures — create
export async function POST(req: Request) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = ventureSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const data = parsed.data;
  const exists = await db.businessVenture.findUnique({ where: { slug: data.slug } });
  if (exists) return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });

  const venture = await db.businessVenture.create({
    data: {
      ...data,
      websiteUrl: data.websiteUrl || null,
      logoUrl: data.logoUrl || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });

  revalidatePath('/business'); // also refreshes Organization JSON-LD + sitemap entry

  return NextResponse.json({ venture }, { status: 201 });
}
