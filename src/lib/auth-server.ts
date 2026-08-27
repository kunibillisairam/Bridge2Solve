import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Cannot start in production.');
  }
  // Development only: warn loudly but allow startup with a local placeholder
  console.warn('[SECURITY WARNING] JWT_SECRET is not set. Using insecure development placeholder. Set JWT_SECRET in .env.local before deploying.');
}
const JWT_SIGNING_SECRET = JWT_SECRET || 'dev-only-insecure-placeholder-do-not-use-in-production';
const COOKIE_NAME = 'sih_session';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'UNIVERSITY' | 'INDUSTRY' | 'ADMIN';
  orgName?: string | null;
  orgDetails?: string | null;
}

export function getSessionUser(req?: NextRequest): SessionUser | null {
  try {
    let token = '';
    if (req) {
      token = req.cookies.get(COOKIE_NAME)?.value || '';
    } else {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value || '';
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, user: SessionUser) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgName: user.orgName,
      orgDetails: user.orgDetails,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
