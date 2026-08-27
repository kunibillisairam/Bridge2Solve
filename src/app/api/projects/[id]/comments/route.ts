import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const projectId = params.id;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Only Admin, or University/Industry attached to the project can view comments
    if (user.role !== 'ADMIN' && project.universityId !== user.id && project.industryId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not have access to this project.' }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const projectId = params.id;
    
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Only Admin, or University/Industry attached to the project can post comments
    if (user.role !== 'ADMIN' && project.universityId !== user.id && project.industryId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not have access to this project.' }, { status: 403 });
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        projectId,
        content,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
