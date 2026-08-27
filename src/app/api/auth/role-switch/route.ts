import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Role switching is disabled in production' }, { status: 403 });
    }

    const { role } = await req.json();

    if (!role || !['CITIZEN', 'UNIVERSITY', 'INDUSTRY', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { role },
    });

    if (!user) {
      return NextResponse.json(
        { error: `No seed user found with role ${role}. Run seed script first.` },
        { status: 404 }
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'CITIZEN' | 'UNIVERSITY' | 'INDUSTRY' | 'ADMIN',
      orgName: user.orgName,
      orgDetails: user.orgDetails,
    };

    const response = NextResponse.json({ user: sessionUser });
    setSessionCookie(response, sessionUser);
    return response;
  } catch (error) {
    console.error('Role switch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
