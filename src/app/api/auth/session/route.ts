import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ user: null });
  }
}
