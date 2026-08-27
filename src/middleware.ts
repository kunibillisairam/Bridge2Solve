import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtEdge } from '@/lib/jwt-edge';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SIGNING_SECRET = JWT_SECRET || 'dev-only-insecure-placeholder-do-not-use-in-production';
const COOKIE_NAME = 'sih_session';

const ROLE_DASHBOARDS: Record<string, string> = {
  CITIZEN: '/citizen/dashboard',
  UNIVERSITY: '/university/dashboard',
  INDUSTRY: '/industry/dashboard',
  ADMIN: '/admin/dashboard',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value || '';

  const user = token ? await verifyJwtEdge(token, JWT_SIGNING_SECRET) : null;

  // 1. If accessing login or signup while already authenticated -> redirect to role dashboard
  if (pathname === '/login' || pathname.startsWith('/signup')) {
    if (user && user.role && ROLE_DASHBOARDS[user.role]) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[user.role], req.url));
    }
    return NextResponse.next();
  }

  // 2. Protected Role Routes
  const isCitizenRoute = pathname.startsWith('/citizen');
  const isUniversityRoute = pathname.startsWith('/university');
  const isIndustryRoute = pathname.startsWith('/industry');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isCitizenRoute || isUniversityRoute || isIndustryRoute || isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific authorization checks: redirect cross-role access to that user's authorized role dashboard
    if (isCitizenRoute && user.role !== 'CITIZEN') {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[user.role] || '/', req.url));
    }
    if (isUniversityRoute && user.role !== 'UNIVERSITY') {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[user.role] || '/', req.url));
    }
    if (isIndustryRoute && user.role !== 'INDUSTRY') {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[user.role] || '/', req.url));
    }
    if (isAdminRoute && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[user.role] || '/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/citizen',
    '/citizen/:path*',
    '/university',
    '/university/:path*',
    '/industry',
    '/industry/:path*',
    '/admin',
    '/admin/:path*',
    '/login',
    '/signup',
    '/signup/:path*',
  ],
};
