import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Public routes
        const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/error', '/u/'];
        if (publicRoutes.some(r => pathname.startsWith(r))) return true;
        // Require auth for dashboard routes
        return !!token;
      },
    },
    pages: { signIn: '/auth/login' },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
