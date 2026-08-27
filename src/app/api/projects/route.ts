import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const filter: any = {};
    
    if (user && user.role === 'UNIVERSITY') {
      filter.universityId = user.id;
    } else {
      const universityId = searchParams.get('universityId');
      if (universityId) filter.universityId = universityId;
    }

    const industryId = searchParams.get('industryId');
    if (industryId) filter.industryId = industryId;

    const projects = await prisma.project.findMany({
      where: filter,
      orderBy: { updatedAt: 'desc' },
      include: {
        problem: {
          include: {
            aiAnalysis: true,
          }
        },
        university: { select: { id: true, name: true, email: true, orgName: true } },
        industry: { select: { id: true, name: true, email: true, orgName: true } },
        team: true,
        proposal: true,
        milestones: { orderBy: { dueDate: 'asc' } },
        impactReport: true,
      }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    const { problemId, universityId, industryId } = await req.json();

    if (!problemId || !universityId) {
      return NextResponse.json({ error: 'Problem ID and University ID are required.' }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found.' }, { status: 404 });
    }
    if (problem.status === 'MATCHED') {
      return NextResponse.json({ error: 'Problem is already matched to another project.' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        problemId,
        universityId,
        industryId,
        status: 'TEAM_FORMATION',
      },
    });

    await prisma.problem.update({
      where: { id: problemId },
      data: { status: 'MATCHED' },
    });

    const baseDate = new Date();
    const milestonesData = [
      {
        title: 'Team Formation & Faculty Advisor Assignment',
        description: 'Establish student team, allocate roles, and assign a faculty mentor to guide the project.',
        dueDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
      },
      {
        title: 'Solution Proposal & Technical Blueprint Submission',
        description: 'Draft the core architectural approach, materials required, milestones, and estimated budget.',
        dueDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      {
        title: 'Functional Prototype Development',
        description: 'Build and validate the working model/prototype of the proposed solution in lab conditions.',
        dueDate: new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      {
        title: 'Community Field Pilot Testing',
        description: 'Deploy the prototype in the target community location and gather feedback from affected citizens.',
        dueDate: new Date(baseDate.getTime() + 150 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      {
        title: 'Full Deployment and Social Impact Analysis',
        description: 'Complete pilot deployment, verify operational metrics, and publish the final social impact report.',
        dueDate: new Date(baseDate.getTime() + 180 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
    ];

    await Promise.all(
      milestonesData.map((milestone) =>
        prisma.milestone.create({
          data: {
            projectId: project.id,
            title: milestone.title,
            description: milestone.description,
            dueDate: milestone.dueDate,
            status: milestone.status,
          },
        })
      )
    );

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
