import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-api';

// GET /api/admin/blog-meta — categories + tags for the post editor (one round-trip)
export async function GET() {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const [categories, tags] = await Promise.all([
    db.blogCategory.findMany({ orderBy: { name: 'asc' } }),
    db.blogTag.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return NextResponse.json({ categories, tags });
}
