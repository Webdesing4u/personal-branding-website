import { FormEvent, useState } from 'react';
import { siteInfo } from '../data/site';
import { PageHero } from '../components/ui';
import { saveMessage } from '../utils/storage';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initial: FormData = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [captcha, setCaptcha] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (form.subject.trim().length < 3) e.subject = 'Subject must be at least 3 characters.';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!captcha) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    // Simulate API call + DB store (contact_messages table)
    setTimeout(() => {
      saveMessage({ ...form, createdAt: new Date().toISOString() });
      setStatus('success');
      setForm(initial);
      setCaptcha(false);
    }, 900);
  };

  const field = (name: keyof FormData, label: string, type = 'text', textarea = false) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label} *</label>
      {textarea ? (
        <textarea
          rows={5}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder={`Your ${label.toLowerCase()}...`}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder={`Your ${label.toLowerCase()}...`}
        />
      )}
      {errors[name] && <p className="mt-1 text-sm text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Let's work together"
        subtitle="Have a project, partnership or just want to say hi? Drop me a message — I reply within 24 hours."
      />
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-5">
          {/* Info */}
          <div className="space-y-6 lg:col-span-2">
            {[
              ['📧', 'Email', siteInfo.email],
              ['📱', 'Phone / WhatsApp', siteInfo.phone],
              ['📍', 'Location', siteInfo.location],
              ['⏰', 'Response Time', 'Within 24 hours'],
            ].map(([icon, label, value]) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="font-medium text-white">{value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-sm leading-relaxed text-slate-300">
              💡 <strong className="text-white">Looking for a quote?</strong> Include your project type, timeline and
              budget range — you'll get a detailed proposal faster.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 lg:col-span-3">
            <div className="grid gap-5 sm:grid-cols-2">
              {field('name', 'Name')}
              {field('email', 'Email', 'email')}
            </div>
            {field('subject', 'Subject')}
            {field('message', 'Message', 'text', true)}

            {/* simulated reCAPTCHA */}
            <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-5 py-4">
              <input
                type="checkbox"
                checked={captcha}
                onChange={(e) => setCaptcha(e.target.checked)}
                className="h-5 w-5 accent-emerald-500"
              />
              <span className="text-sm text-slate-300">I'm not a robot</span>
              <span className="ml-3 text-xs text-slate-600">reCAPTCHA</span>
            </label>

            {status === 'success' && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                ✅ Message sent successfully! I'll get back to you within 24 hours.
              </div>
            )}
            {status === 'error' && !captcha && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                ⚠ Please verify that you're not a robot.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message →'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
