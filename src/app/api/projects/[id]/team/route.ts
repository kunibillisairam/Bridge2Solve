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
    if (project.universityId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You do not own this project.' }, { status: 403 });
    }

    const { facultyMentorName, studentMembers } = await req.json();

    if (!facultyMentorName || !studentMembers || !Array.isArray(studentMembers)) {
      return NextResponse.json({ error: 'Faculty mentor and student members array are required.' }, { status: 400 });
    }

    await prisma.team.deleteMany({
      where: { projectId },
    });

    const team = await prisma.team.create({
      data: {
        projectId,
        facultyMentorName,
        studentMembers: JSON.stringify(studentMembers),
      },
    });

    const firstMilestone = await prisma.milestone.findFirst({
      where: {
        projectId,
        title: { contains: 'Team Formation' },
      },
    });

    if (firstMilestone) {
      await prisma.milestone.update({
        where: { id: firstMilestone.id },
        data: { status: 'COMPLETED' },
      });

      const secondMilestone = await prisma.milestone.findFirst({
        where: {
          projectId,
          title: { contains: 'Solution Proposal' },
        },
      });

      if (secondMilestone) {
        await prisma.milestone.update({
          where: { id: secondMilestone.id },
          data: { status: 'IN_PROGRESS' },
        });
      }
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
