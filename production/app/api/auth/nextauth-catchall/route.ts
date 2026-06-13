// ⚠️ RENAME THIS FOLDER when copying into your Next.js project:
//    app/api/auth/nextauth-catchall/  →  app/api/auth/[...nextauth]/
// (This sandbox cannot create folder names containing "..")

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
