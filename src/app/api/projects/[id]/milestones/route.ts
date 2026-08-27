import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { milestoneId, status, feedback } = await req.json();

    if (!milestoneId || !status) {
      return NextResponse.json({ error: 'Milestone ID and status are required.' }, { status: 400 });
    }

    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        projectId: params.id,
      },
      include: { project: true }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found.' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && (user.role !== 'UNIVERSITY' || milestone.project.universityId !== user.id)) {
      return NextResponse.json({ error: 'Forbidden. You do not own this project.' }, { status: 403 });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status,
        feedback: feedback !== undefined ? feedback : milestone.feedback,
      },
    });

    if (status === 'COMPLETED') {
      const project = await prisma.project.findUnique({
        where: { id: params.id },
        include: { milestones: { orderBy: { dueDate: 'asc' } } }
      });

      if (project) {
        const completedCount = project.milestones.filter(m => m.status === 'COMPLETED' || m.id === milestoneId).length;
        
        let newProjectStatus = project.status;
        
        if (completedCount === 1) newProjectStatus = 'PROPOSAL';
        else if (completedCount === 2) newProjectStatus = 'PROTOTYPE';
        else if (completedCount === 3) newProjectStatus = 'PILOT';
        else if (completedCount === 4) newProjectStatus = 'DEPLOYMENT';
        else if (completedCount === 5) newProjectStatus = 'IMPACT_MEASUREMENT';

        await prisma.project.update({
          where: { id: project.id },
          data: {
            status: newProjectStatus,
            currentMilestoneIndex: completedCount,
          },
        });

        const nextMilestone = project.milestones.find(
          (m, idx) => idx === completedCount && m.id !== milestoneId && m.status === 'PENDING'
        );

        if (nextMilestone) {
          await prisma.milestone.update({
            where: { id: nextMilestone.id },
            data: { status: 'IN_PROGRESS' },
          });
        }
      }
    }

    return NextResponse.json({ milestone: updatedMilestone });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
