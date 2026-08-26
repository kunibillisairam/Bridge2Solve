import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';
import { runSimulatedAiAnalysis } from '@/lib/ai-processor';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const citizenId = searchParams.get('citizenId');
    const status = searchParams.get('status');

    const filter: any = {};
    if (citizenId) filter.citizenId = citizenId;
    if (status) filter.status = status;

    const problems = await prisma.problem.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        aiAnalysis: true,
        project: {
          include: {
            university: { select: { name: true } },
            industry: { select: { name: true } },
          }
        }
      }
    });

    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user || user.role !== 'CITIZEN') {
      return NextResponse.json({ error: 'Unauthorized. Citizen login required.' }, { status: 401 });
    }

    const { title, description, category, location, affectedPopulation } = await req.json();

    if (!title || !description || !category || !location || !affectedPopulation) {
      return NextResponse.json(
        { error: 'Title, description, category, location, and affected population are required' },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        category,
        location,
        affectedPopulation,
        status: 'PENDING_VALIDATION',
        citizenId: user.id,
      },
    });

    const aiAnalysis = await runSimulatedAiAnalysis(problem.id);

    return NextResponse.json({ problem, aiAnalysis }, { status: 201 });
  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
