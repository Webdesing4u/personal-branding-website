import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-api';

// GET /api/admin/portfolio-meta — categories for the project editor
export async function GET() {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const categories = await db.portfolioCategory.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}
