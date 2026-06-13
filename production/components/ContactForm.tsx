'use client';

// Real contact form:
//  - client validation with the SAME Zod schema the API uses
//  - real reCAPTCHA v3 token via grecaptcha.execute()
//  - POST /api/contact → rate limit → server Zod → reCAPTCHA verify → DB → Resend

import { FormEvent, useState } from 'react';
import { contactSchema } from '@/lib/validations';

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    // 1 — Client-side Zod (same schema as the server, minus the token)
    const parsed = contactSchema.omit({ recaptchaToken: true }).safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) fieldErrors[k] = v[0];
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus('sending');

    try {
      // 2 — Get a real reCAPTCHA v3 token (script loaded in layout.tsx)
      const recaptchaToken = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(SITE_KEY, { action: 'contact_form' }).then(resolve, reject);
        });
      });

      // 3 — Submit to the real API
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, recaptchaToken }),
      });

      if (res.status === 429) {
        setServerError('Too many messages — please wait a few minutes and try again.');
        setStatus('error');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setServerError('Network error. Please try again.');
      setStatus('error');
    }
  };

  const input =
    'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <input className={input} placeholder="Your name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>
        <div>
          <input className={input} type="email" placeholder="Your email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>
      </div>
      <div>
        <input className={input} placeholder="Subject" value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        {errors.subject && <p className="mt-1 text-sm text-red-400">{errors.subject}</p>}
      </div>
      <div>
        <textarea className={input} rows={5} placeholder="Your message" value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
      </div>

      {status === 'success' && (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          ✅ Message sent! Check your inbox for a confirmation.
        </p>
      )}
      {status === 'error' && serverError && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          ⚠ {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message →'}
      </button>

      <p className="text-xs text-slate-500">
        Protected by reCAPTCHA v3 — verified server-side. Rate limited to 5 messages per 10 minutes.
      </p>
    </form>
  );
}
