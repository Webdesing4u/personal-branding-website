import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminLimiter } from '@/lib/rate-limit';

// ── Cloudinary SIGNED upload (production-grade, no local storage) ──
//
// Flow:
//   1. Admin client asks this route for a signature (session-protected)
//   2. Server signs the upload params with CLOUDINARY_API_SECRET (never exposed)
//   3. Client uploads the file DIRECTLY to Cloudinary — bytes never touch our server
//   4. Client saves the returned secure_url into the DB via the relevant CRUD route
//
// Why signed (not unsigned preset): unsigned presets let anyone who finds the
// preset name upload to your account. Signed uploads require a fresh,
// server-issued signature — and our server only issues them to admins.

export async function POST(req: Request) {
  // Auth — middleware blocks first, this is defense in depth
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit signature minting
  const userId = (session.user as { id: string }).id;
  const { success } = await adminLimiter.limit(`upload:${userId}`);
  if (!success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  // Allow only known folders — prevents arbitrary path writes
  const allowedFolders = ['blog', 'portfolio', 'business', 'gallery'] as const;
  const folder = allowedFolders.includes(body.folder) ? body.folder : 'gallery';

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash('sha1')
    .update(paramsToSign + process.env.CLOUDINARY_API_SECRET!)
    .digest('hex');

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  });
}
