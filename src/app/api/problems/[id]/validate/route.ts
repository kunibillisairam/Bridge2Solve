import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    const body = await req.json();
    let status = body.status;
    const { category, priority, priorityScore, action } = body;

    if (!status && action) {
      status = action === 'approve' ? 'AI_ANALYZED' : 'REJECTED';
    }

    if (!status || !['VALIDATED', 'REJECTED', 'AI_ANALYZED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid validation status.' }, { status: 400 });
    }

    const problemId = params.id;

    const problem = await prisma.problem.update({
      where: { id: problemId },
      data: { status },
    });

    const aiAnalysis = await prisma.aiAnalysis.findUnique({
      where: { problemId },
    });

    let updatedAi = null;
    if (aiAnalysis) {
      updatedAi = await prisma.aiAnalysis.update({
        where: { problemId },
        data: {
          category: category || aiAnalysis.category,
          priority: priority || aiAnalysis.priority,
          priorityScore: priorityScore !== undefined ? Number(priorityScore) : aiAnalysis.priorityScore,
          reviewStatus: 'APPROVED',
          reviewedByAdminId: user.id,
        },
      });
    }

    return NextResponse.json({ problem, aiAnalysis: updatedAi });
  } catch (error) {
    console.error('Error validating problem:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
