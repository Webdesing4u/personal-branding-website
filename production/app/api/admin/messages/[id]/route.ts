import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageUpdateSchema } from '@/lib/validations';
import { guardAdmin, validationError } from '@/lib/admin-api';

type Params = { params: { id: string } };

// PATCH /api/admin/messages/:id — toggle read/unread
// No revalidatePath: messages never appear on public pages.
export async function PATCH(req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = messageUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await db.contactMessage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  const message = await db.contactMessage.update({
    where: { id: params.id },
    data: { isRead: parsed.data.isRead },
  });

  return NextResponse.json({ message });
}

// DELETE /api/admin/messages/:id
export async function DELETE(_req: Request, { params }: Params) {
  const guard = await guardAdmin();
  if (!guard.ok) return guard.response;

  const existing = await db.contactMessage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  await db.contactMessage.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
