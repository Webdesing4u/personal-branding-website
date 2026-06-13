import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
}

export async function sendContactNotification(data: ContactEmailData) {
  const { error } = await resend.emails.send({
    from: `Portfolio Contact <${process.env.CONTACT_FROM_EMAIL}>`,
    to: [process.env.CONTACT_TO_EMAIL!],
    replyTo: data.email,
    subject: `📨 New contact: ${data.subject}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#0f172a;margin:0 0 16px">New Contact Message</h2>
        <table style="width:100%;font-size:14px;color:#334155">
          <tr><td style="padding:6px 0;color:#64748b;width:90px">From</td><td><strong>${escapeHtml(data.name)}</strong> &lt;${escapeHtml(data.email)}&gt;</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Subject</td><td>${escapeHtml(data.subject)}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">IP</td><td>${escapeHtml(data.ip)}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;font-size:14px;color:#0f172a;white-space:pre-wrap">${escapeHtml(data.message)}</div>
        <p style="margin-top:16px;font-size:12px;color:#94a3b8">Reply directly to this email to respond.</p>
      </div>
    `,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendAutoReply(to: string, name: string) {
  // Best-effort — failures here must not fail the request
  try {
    await resend.emails.send({
      from: `Emran Hossain <${process.env.CONTACT_FROM_EMAIL}>`,
      to: [to],
      subject: 'Thanks for reaching out — I got your message ✅',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <p>Hi ${escapeHtml(name)},</p>
          <p>Thanks for your message — it landed safely in my inbox. I personally read every email and will get back to you within <strong>24 hours</strong>.</p>
          <p>— Emran Hossain<br/><span style="color:#64748b;font-size:13px">Full Stack Developer · Digital Marketer · Entrepreneur</span></p>
        </div>
      `,
    });
  } catch {
    /* swallow — notification already sent */
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
