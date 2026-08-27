import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser(req);
    if (!user || user.role !== 'UNIVERSITY') {
      return NextResponse.json({ error: 'Unauthorized. University login required.' }, { status: 401 });
    }

    const projectId = params.id;
    
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }
    if (project.universityId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this project.' }, { status: 403 });
    }

    const { title, description, budget, timeline } = await req.json();

    if (!title || !description || !budget || !timeline) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        projectId,
        title,
        description,
        budget: Number(budget),
        timeline,
        status: 'PENDING',
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'PROPOSAL' },
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
