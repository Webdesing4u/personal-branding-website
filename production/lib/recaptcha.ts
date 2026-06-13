// Server-side Google reCAPTCHA v3 verification — the real thing.
// The client gets a token via grecaptcha.execute(); we verify it here with the
// SECRET key (never exposed to the browser) and enforce a score threshold.

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = 0.5;

export async function verifyRecaptcha(token: string, expectedAction: string): Promise<boolean> {
  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: token,
    }),
    // Never cache verification calls
    cache: 'no-store',
  });

  if (!res.ok) return false;

  const data: { success: boolean; score?: number; action?: string } = await res.json();
  return data.success === true && (data.score ?? 0) >= MIN_SCORE && data.action === expectedAction;
}
