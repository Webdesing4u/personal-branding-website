import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emranhossain.com';

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: 'Emran Hossain | Full Stack Developer & Entrepreneur',
    template: '%s | Emran Hossain',
  },
  description:
    'Emran Hossain — Full Stack Developer, Digital Marketer & Entrepreneur from Dhaka, Bangladesh.',
  openGraph: {
    type: 'website',
    siteName: 'Emran Hossain',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
};

// Person structured data — sitewide
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Emran Hossain',
  url: base,
  jobTitle: 'Full Stack Developer & Entrepreneur',
  address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' },
  sameAs: [
    'https://github.com/emranhossain',
    'https://linkedin.com/in/emranhossain',
    'https://twitter.com/emranhossain',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        {/* reCAPTCHA v3 — loaded once, used by ContactForm */}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
