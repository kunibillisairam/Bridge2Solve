import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access only.' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      include: {
        citizenProfile: true,
        universityProfile: {
          include: {
            university: true,
          },
        },
        industryProfile: {
          include: {
            industry: true,
          },
        },
        adminProfile: true,
        submittedProblems: {
          select: { id: true }
        },
        assignedProjectsAsUniv: {
          select: { id: true }
        },
        assignedProjectsAsInd: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedUsers = users.map(user => {
      let location = 'Not reported';
      let state = '';
      let district = '';
      let reportedProblemsCount = user.submittedProblems.length;
      let activeProjectsCount = user.assignedProjectsAsUniv.length;
      let activePartnershipsCount = user.assignedProjectsAsInd.length;
      let representative = '';
      let designation = '';
      let department = '';
      let organizationType = '';
      let website = '';
      let companyCin = '';
      let csrId = '';
      let csrFocusAreas = '';
      let geographicFocus = '';
      let technicalExpertise = '';

      if (user.role === 'CITIZEN') {
        if (user.citizenProfile) {
          state = user.citizenProfile.state || '';
          district = user.citizenProfile.district || '';
          if (state || district) {
            location = [district, state].filter(Boolean).join(', ');
          }
        }
      } else if (user.role === 'UNIVERSITY') {
        representative = user.name;
        if (user.universityProfile) {
          designation = user.universityProfile.designation || '';
          department = user.universityProfile.department || '';
          const univ = user.universityProfile.university;
          if (univ) {
            state = univ.state || '';
            district = univ.district || '';
            website = univ.website || '';
            if (univ.location) {
              location = univ.location;
            } else if (state || district) {
              location = [district, state].filter(Boolean).join(', ');
            }
          }
        }
      } else if (user.role === 'INDUSTRY') {
        representative = user.name;
        if (user.industryProfile) {
          designation = user.industryProfile.designation || '';
          department = user.industryProfile.department || '';
          const ind = user.industryProfile.industry;
          if (ind) {
            organizationType = ind.organizationType || '';
            state = ind.state || '';
            district = ind.district || '';
            website = ind.website || '';
            companyCin = ind.companyCin || '';
            csrId = ind.csrId || '';
            csrFocusAreas = ind.csrFocusAreas || '';
            geographicFocus = ind.geographicFocus || '';
            technicalExpertise = ind.technicalExpertise || '';
            if (ind.location) {
              location = ind.location;
            } else if (state || district) {
              location = [district, state].filter(Boolean).join(', ');
            }
          }
        }
      } else if (user.role === 'ADMIN') {
        if (user.adminProfile) {
          designation = user.adminProfile.designation || '';
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        status: user.status,
        orgName: user.orgName || null,
        orgDetails: user.orgDetails || null,
        createdAt: user.createdAt.toISOString(),
        location,
        state,
        district,
        representative,
        designation,
        department,
        organizationType,
        reportedProblemsCount,
        activeProjectsCount,
        activePartnershipsCount,
        website,
        companyCin,
        csrId,
        csrFocusAreas,
        geographicFocus,
        technicalExpertise
      };
    });

    return NextResponse.json({ users: mappedUsers });
  } catch (error: any) {
    console.error('Error fetching registered users:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
