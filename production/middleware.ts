import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Real route protection — runs on the Edge BEFORE any page/API code executes.
// No valid JWT → redirect to /admin/login (pages) or 401 (handled by NextAuth).
// Valid JWT but wrong role → blocked.

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Authenticated but not an admin → block
    if (token && token.role !== 'admin') {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // The login page itself must stay public (avoids redirect loop)
        if (req.nextUrl.pathname === '/admin/login') return true;
        return !!token;
      },
    },
    pages: { signIn: '/admin/login' },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
