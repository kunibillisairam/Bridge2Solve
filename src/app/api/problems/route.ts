import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter: any = {};

    // Citizens can ONLY view their own submissions.
    if (user.role === 'CITIZEN') {
      filter.submittedById = user.id;
    } else {
      // Other roles (Admin, etc.) can filter by citizenId if requested
      const citizenId = searchParams.get('citizenId');
      if (citizenId) {
        filter.submittedById = citizenId;
      }
      const status = searchParams.get('status');
      if (status) {
        filter.status = status;
      }
    }

    const problems = await prisma.problem.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        aiAnalysis: true,
        submittedBy: user.role === 'ADMIN' || user.role === 'CITIZEN' ? { select: { name: true, email: true } } : false,
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

    // ─── 1. Required Field Checks ───
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }
    if (title.length > 100) {
      return NextResponse.json({ error: 'Title must not exceed 100 characters.' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description is required and must be at least 10 characters long.' }, { status: 400 });
    }
    if (description.length > 2000) {
      return NextResponse.json({ error: 'Description must not exceed 2000 characters.' }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json({ error: 'Location (District, State) is required.' }, { status: 400 });
    }

    // ─── 2. Parse location into district and state ───
    const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) {
      return NextResponse.json(
        { error: 'Location must contain both District and State, separated by a comma (e.g. Pune, Maharashtra)' },
        { status: 400 }
      );
    }
    const state = parts[parts.length - 1];
    const district = parts.slice(0, parts.length - 1).join(', ');

    if (!district || !state) {
      return NextResponse.json({ error: 'Both District and State are required in location.' }, { status: 400 });
    }

    // ─── 3. Parse and validate affected population ───
    if (affectedPopulation === undefined || affectedPopulation === null) {
      return NextResponse.json({ error: 'Affected population is required.' }, { status: 400 });
    }
    const populationNum = parseInt(affectedPopulation, 10);
    if (isNaN(populationNum) || populationNum <= 0) {
      return NextResponse.json(
        { error: 'Affected population must be a valid positive number.' },
        { status: 400 }
      );
    }

    // ─── 4. Create problem record in PostgreSQL ───
    const problem = await prisma.problem.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        district,
        state,
        affectedPopulation: populationNum,
        status: 'SUBMITTED',
        priority: 'MEDIUM',
        submittedById: user.id,
      },
    });

    return NextResponse.json({ problem }, { status: 201 });
  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
