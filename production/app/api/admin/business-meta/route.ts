import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-api';

// GET /api/admin/business-meta — categories for the venture editor
export async function GET() {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const categories = await db.businessCategory.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}
