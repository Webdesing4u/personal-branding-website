import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSchema } from '@/lib/validations';
import { contactLimiter, getClientIp } from '@/lib/rate-limit';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendContactNotification, sendAutoReply } from '@/lib/email';

// POST /api/contact
// Pipeline: rate limit → Zod validation → reCAPTCHA verify → DB insert → email
export async function POST(req: Request) {
  try {
    // 1 — Rate limit by IP (5 / 10 min)
    const ip = getClientIp(req);
    const { success, reset } = await contactLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } }
      );
    }

    // 2 — Server-side Zod validation (never trust the client)
    const body = await req.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, subject, message, recaptchaToken } = parsed.data;

    // 3 — Real reCAPTCHA v3 verification (secret key, score threshold, action match)
    const human = await verifyRecaptcha(recaptchaToken, 'contact_form');
    if (!human) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 });
    }

    // 4 — Persist to contact_messages table
    await db.contactMessage.create({
      data: { name, email, subject, message, ipAddress: ip },
    });

    // 5 — Email notification (must succeed) + auto-reply (best-effort)
    await sendContactNotification({ name, email, subject, message, ip });
    void sendAutoReply(email, name);

    return NextResponse.json({ ok: true, message: 'Message sent successfully.' }, { status: 201 });
  } catch (err) {
    console.error('[contact] error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
