// Shared admin API guard — single source of truth for the security pipeline.
// Every /api/admin/* handler calls guardAdmin() first:
//   session check (defense in depth behind middleware) → role check → rate limit
//
// Returns either { session, userId } or a ready-to-return NextResponse error.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { adminLimiter } from './rate-limit';

type GuardResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export async function guardAdmin(options?: { skipRateLimit?: boolean }): Promise<GuardResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const userId = (session.user as { id: string }).id;

  // Mutations are rate limited (60/min/user); reads can skip
  if (!options?.skipRateLimit) {
    const { success } = await adminLimiter.limit(userId);
    if (!success) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Rate limited' }, { status: 429 }),
      };
    }
  }

  return { ok: true, userId };
}

// Standard Zod-failure response shape — identical across all routes
export function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return NextResponse.json({ error: 'Validation failed', fields: fieldErrors }, { status: 400 });
}
