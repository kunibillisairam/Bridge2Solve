import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser(req);
    if (!user || user.role !== 'INDUSTRY') {
      return NextResponse.json({ error: 'Unauthorized. Industry login required.' }, { status: 401 });
    }

    const projectId = params.id;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        industryId: user.id,
      },
    });

    await prisma.comment.create({
      data: {
        projectId,
        content: `System Alert: ${user.name} has signed on as the official Industry & CSR Partner for this project. Resource and mentorship channels are now active.`,
        senderId: 'SYSTEM',
        senderName: 'National Portal',
        senderRole: 'ADMIN',
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error pledging support:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
