import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/health — for uptime monitors (UptimeRobot, BetterStack, Vercel checks).
// Public by design. Reveals only connectivity status — no versions, no counts,
// no internals (information disclosure hygiene).

export const dynamic = 'force-dynamic'; // never cached — monitors need truth

export async function GET() {
  try {
    // Cheapest possible DB roundtrip
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'connected' });
  } catch {
    return NextResponse.json(
      { status: 'degraded', db: 'unreachable' },
      { status: 503 }
    );
  }
}
