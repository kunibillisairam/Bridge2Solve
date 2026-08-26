import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
