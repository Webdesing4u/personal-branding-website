import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

// Dynamic OpenGraph image — generated per post at the edge.
// Shows up automatically when the post is shared on social media.

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Blog post cover';

export default async function OgImage({ params }: { params: { slug: string } }) {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #064e3b 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', color: '#34d399', fontSize: 28, fontWeight: 600 }}>
          {post?.category?.name ?? 'Blog'} · emranhossain.com
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.15, maxWidth: 1000 }}>
          {post?.title ?? 'Emran Hossain — Blog'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 999,
              background: '#10b981',
              color: '#020617',
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            E
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>Emran Hossain</div>
            <div style={{ fontSize: 22, color: '#94a3b8' }}>
              Full Stack Developer · Digital Marketer · Entrepreneur
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
