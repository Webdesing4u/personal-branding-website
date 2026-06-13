// Rename to next.config.mjs when copying into the Next.js project.

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — admin uploads land here
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Pexels — existing stock imagery
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Security headers (Section 7 of the spec)
  async headers() {
    // CSP notes:
    //  - script-src needs 'unsafe-inline' for Next.js bootstrap + JSON-LD blocks,
    //    and Google domains for reCAPTCHA v3
    //  - frame-src: reCAPTCHA renders a hidden iframe — without it v3 silently fails
    //  - connect-src api.cloudinary.com: the ADMIN browser uploads directly there
    //  - Resend is NOT listed: it's called server-side only, browser CSP irrelevant
    //  - style-src 'unsafe-inline': Tailwind inlines critical styles
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.pexels.com",
      "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https://api.cloudinary.com https://www.google.com",
      "frame-src https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
