import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. No active session found.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    // Role-specific profile extraction
    let profileData: Record<string, any> = {};

    if (user.role === 'CITIZEN' && user.citizenProfile) {
      profileData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        state: user.citizenProfile.state,
        district: user.citizenProfile.district,
      };
    } else if (user.role === 'UNIVERSITY' && user.universityProfile) {
      profileData = {
        universityName: user.universityProfile.university?.name || user.orgName,
        representativeName: user.name,
        email: user.email,
        phone: user.phone,
        department: user.universityProfile.department,
        designation: user.universityProfile.designation,
        universityDetails: user.universityProfile.university
          ? {
              id: user.universityProfile.university.id,
              name: user.universityProfile.university.name,
              location: user.universityProfile.university.location,
              website: user.universityProfile.university.website,
              verificationStatus: user.universityProfile.university.verificationStatus,
            }
          : null,
      };
    } else if (user.role === 'INDUSTRY' && user.industryProfile) {
      profileData = {
        organizationName: user.industryProfile.industry?.name || user.orgName,
        representativeName: user.name,
        email: user.email,
        phone: user.phone,
        organizationType: user.industryProfile.industry?.organizationType || user.industryProfile.department,
        designation: user.industryProfile.designation,
        industryDetails: user.industryProfile.industry
          ? {
              id: user.industryProfile.industry.id,
              name: user.industryProfile.industry.name,
              organizationType: user.industryProfile.industry.organizationType,
              location: user.industryProfile.industry.location,
              website: user.industryProfile.industry.website,
              verificationStatus: user.industryProfile.industry.verificationStatus,
            }
          : null,
      };
    } else if (user.role === 'ADMIN' && user.adminProfile) {
      profileData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.adminProfile.designation,
      };
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      orgName: user.orgName,
      orgDetails: user.orgDetails,
      createdAt: user.createdAt,
      profile: profileData,
    };

    return NextResponse.json({ user: safeUser });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
