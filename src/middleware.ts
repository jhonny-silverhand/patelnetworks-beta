import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'patel_networks_secure_jwt_secret_key_32_bytes!';
const JWT_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 1. Admin Command Center Protection (ADR-019)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // If already authenticated as admin, redirect to admin dashboard
      const adminToken = request.cookies.get('pn_admin_session')?.value;
      if (adminToken) {
        try {
          await jwtVerify(adminToken, JWT_KEY);
          return NextResponse.redirect(new URL('/admin', request.url));
        } catch {
          // Token invalid, continue to login page
        }
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Require valid pn_admin_session for all other /admin routes
    const adminToken = request.cookies.get('pn_admin_session')?.value;
    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(adminToken, JWT_KEY);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Customer Account Portal Protection (ADR-003 / ADR-011)
  if (pathname.startsWith('/account') && pathname !== '/account/login') {
    const customerToken = request.cookies.get('pn_session')?.value;
    if (!customerToken) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
    try {
      await jwtVerify(customerToken, JWT_KEY);
    } catch {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
