import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-api';

// GET /api/admin/messages?page=1&filter=unread|read|all
// No POST here by design — messages are only created via the public
// /api/contact pipeline (rate limit + reCAPTCHA + Zod).
export async function GET(req: Request) {
  const guard = await guardAdmin({ skipRateLimit: true });
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const filter = searchParams.get('filter') ?? 'all';
  const take = 20;

  const where =
    filter === 'unread' ? { isRead: false } : filter === 'read' ? { isRead: true } : {};

  const [messages, total, unreadCount] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
    }),
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { isRead: false } }),
  ]);

  return NextResponse.json({
    messages,
    total,
    unreadCount,
    page,
    pages: Math.ceil(total / take),
  });
}
