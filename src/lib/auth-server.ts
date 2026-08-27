import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sih2026-bridge2solve-secret-key-xK9mP2vL8nQ';
export const COOKIE_NAME = 'sih_session';

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

export function createSessionToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgName: user.orgName || null,
      orgDetails: user.orgDetails || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setSessionCookie(res: NextResponse, user: SessionUser) {
  const token = createSessionToken(user);

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
