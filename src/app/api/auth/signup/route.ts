import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { setSessionCookie, SessionUser } from '@/lib/auth-server';
import { INDIA_STATES_AND_DISTRICTS } from '@/lib/registries';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role } = body;

    // 1. Validate role
    if (!role) {
      return NextResponse.json({ error: 'Role is required.' }, { status: 400 });
    }

    if (role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Public registration for Admin accounts is not permitted.' },
        { status: 403 }
      );
    }

    if (!['CITIZEN', 'UNIVERSITY', 'INDUSTRY'].includes(role)) {
      return NextResponse.json({ error: 'Invalid registration role.' }, { status: 400 });
    }

    const { email, password, confirmPassword } = body;

    // 2. Validate email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validate passwords
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password and Confirm Password do not match.' },
        { status: 400 }
      );
    }

    // 4. Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 5. Role-specific validation and creation
    const passwordHash = await bcrypt.hash(password, 10);
    let sessionUser: SessionUser;

    if (role === 'CITIZEN') {
      const { name, phone, state, district, addressLine1, pincode } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Full Name is required.' }, { status: 400 });
      }
      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
      }
      if (!state || typeof state !== 'string' || !state.trim()) {
        return NextResponse.json({ error: 'State is required.' }, { status: 400 });
      }
      if (!district || typeof district !== 'string' || !district.trim()) {
        return NextResponse.json({ error: 'District is required.' }, { status: 400 });
      }

      // Phone format validation (10 digits)
      const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
      }

      // State and District combination validation
      const validDistricts = INDIA_STATES_AND_DISTRICTS[state] || [];
      if (!validDistricts.includes(district)) {
        return NextResponse.json({ error: 'Invalid State and District combination.' }, { status: 400 });
      }

      // Pincode validation (optional)
      if (pincode && !/^\d{6}$/.test(String(pincode).trim())) {
        return NextResponse.json({ error: 'Please enter a valid 6-digit Pincode.' }, { status: 400 });
      }

      const created = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: 'CITIZEN',
          phone: cleanPhone,
          status: 'ACTIVE',
          citizenProfile: {
            create: {
              addressLine1: addressLine1 ? String(addressLine1).trim() : null,
              district: district.trim(),
              state: state.trim(),
              pincode: pincode ? String(pincode).trim() : null,
            },
          },
        },
      });

      sessionUser = {
        id: created.id,
        email: created.email,
        name: created.name,
        role: 'CITIZEN',
        orgName: null,
        orgDetails: null,
      };
    } else if (role === 'UNIVERSITY') {
      const { 
        universityName, name, department, designation, phone, 
        institutionType, addressLine1, addressLine2, state, district, pincode, website, accreditationId, isManualUniversity 
      } = body;

      if (!universityName || typeof universityName !== 'string' || !universityName.trim()) {
        return NextResponse.json({ error: 'University Name is required.' }, { status: 400 });
      }
      if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Representative Name is required.' }, { status: 400 });
      }
      if (!department || typeof department !== 'string' || !department.trim()) {
        return NextResponse.json({ error: 'Department is required.' }, { status: 400 });
      }
      if (!designation || typeof designation !== 'string' || !designation.trim()) {
        return NextResponse.json({ error: 'Designation is required.' }, { status: 400 });
      }
      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        return NextResponse.json({ error: 'Contact Phone is required.' }, { status: 400 });
      }
      if (!institutionType || typeof institutionType !== 'string' || !institutionType.trim()) {
        return NextResponse.json({ error: 'Institution Type is required.' }, { status: 400 });
      }
      if (!addressLine1 || typeof addressLine1 !== 'string' || !addressLine1.trim()) {
        return NextResponse.json({ error: 'Address Line 1 is required.' }, { status: 400 });
      }
      if (!state || typeof state !== 'string' || !state.trim()) {
        return NextResponse.json({ error: 'State is required.' }, { status: 400 });
      }
      if (!district || typeof district !== 'string' || !district.trim()) {
        return NextResponse.json({ error: 'District is required.' }, { status: 400 });
      }
      if (!pincode || typeof pincode !== 'string' || !pincode.trim()) {
        return NextResponse.json({ error: 'Pincode is required.' }, { status: 400 });
      }

      // Phone format validation
      const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
      }

      // Pincode validation
      if (!/^\d{6}$/.test(pincode.trim())) {
        return NextResponse.json({ error: 'Please enter a valid 6-digit Pincode.' }, { status: 400 });
      }

      // State and District combination validation
      const validDistricts = INDIA_STATES_AND_DISTRICTS[state] || [];
      if (!validDistricts.includes(district)) {
        return NextResponse.json({ error: 'Invalid State and District combination.' }, { status: 400 });
      }

      // Upsert/find university entity
      let univ = await prisma.university.findFirst({
        where: { name: { equals: universityName.trim(), mode: 'insensitive' } },
      });

      if (!univ) {
        univ = await prisma.university.create({
          data: {
            name: universityName.trim(),
            institutionType: institutionType.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2 ? addressLine2.trim() : null,
            state: state.trim(),
            district: district.trim(),
            pincode: pincode.trim(),
            website: website ? website.trim() : null,
            accreditationId: accreditationId ? accreditationId.trim() : null,
            verificationStatus: isManualUniversity ? 'MANUAL_PENDING' : 'PENDING',
          },
        });
      } else {
        // Update existing with address/additional fields if missing
        await prisma.university.update({
          where: { id: univ.id },
          data: {
            institutionType: univ.institutionType || institutionType.trim(),
            addressLine1: univ.addressLine1 || addressLine1.trim(),
            addressLine2: univ.addressLine2 || (addressLine2 ? addressLine2.trim() : null),
            state: univ.state || state.trim(),
            district: univ.district || district.trim(),
            pincode: univ.pincode || pincode.trim(),
            website: univ.website || (website ? website.trim() : null),
            accreditationId: univ.accreditationId || (accreditationId ? accreditationId.trim() : null),
          }
        });
      }

      const created = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: 'UNIVERSITY',
          phone: cleanPhone,
          status: 'ACTIVE',
          orgName: universityName.trim(),
          orgDetails: department.trim(),
          universityProfile: {
            create: {
              universityId: univ.id,
              department: department.trim(),
              designation: designation.trim(),
            },
          },
        },
      });

      sessionUser = {
        id: created.id,
        email: created.email,
        name: created.name,
        role: 'UNIVERSITY',
        orgName: created.orgName,
        orgDetails: created.orgDetails,
      };
    } else {
      // INDUSTRY
      const { 
        organizationName, name, organizationType, designation, phone,
        addressLine1, addressLine2, state, district, pincode, website, companyCin, csrId, csrFocusAreas, geographicFocus, technicalExpertise, isManualCompany 
      } = body;

      if (!organizationName || typeof organizationName !== 'string' || !organizationName.trim()) {
        return NextResponse.json({ error: 'Organization Name is required.' }, { status: 400 });
      }
      if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Representative Name is required.' }, { status: 400 });
      }
      if (!organizationType || typeof organizationType !== 'string' || !organizationType.trim()) {
        return NextResponse.json({ error: 'Organization Type is required.' }, { status: 400 });
      }
      if (!designation || typeof designation !== 'string' || !designation.trim()) {
        return NextResponse.json({ error: 'Designation is required.' }, { status: 400 });
      }
      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        return NextResponse.json({ error: 'Contact Phone is required.' }, { status: 400 });
      }
      if (!addressLine1 || typeof addressLine1 !== 'string' || !addressLine1.trim()) {
        return NextResponse.json({ error: 'Address Line 1 is required.' }, { status: 400 });
      }
      if (!state || typeof state !== 'string' || !state.trim()) {
        return NextResponse.json({ error: 'State is required.' }, { status: 400 });
      }
      if (!district || typeof district !== 'string' || !district.trim()) {
        return NextResponse.json({ error: 'District is required.' }, { status: 400 });
      }
      if (!pincode || typeof pincode !== 'string' || !pincode.trim()) {
        return NextResponse.json({ error: 'Pincode is required.' }, { status: 400 });
      }

      // Phone format validation
      const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
      }

      // Pincode validation
      if (!/^\d{6}$/.test(pincode.trim())) {
        return NextResponse.json({ error: 'Please enter a valid 6-digit Pincode.' }, { status: 400 });
      }

      // State and District combination validation
      const validDistricts = INDIA_STATES_AND_DISTRICTS[state] || [];
      if (!validDistricts.includes(district)) {
        return NextResponse.json({ error: 'Invalid State and District combination.' }, { status: 400 });
      }

      // Upsert/find industry entity
      let ind = await prisma.industry.findFirst({
        where: { name: { equals: organizationName.trim(), mode: 'insensitive' } },
      });

      if (!ind) {
        ind = await prisma.industry.create({
          data: {
            name: organizationName.trim(),
            organizationType: organizationType.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2 ? addressLine2.trim() : null,
            state: state.trim(),
            district: district.trim(),
            pincode: pincode.trim(),
            companyCin: companyCin ? companyCin.trim() : null,
            csrId: csrId ? csrId.trim() : null,
            csrFocusAreas: csrFocusAreas ? csrFocusAreas.trim() : null,
            geographicFocus: geographicFocus ? geographicFocus.trim() : null,
            technicalExpertise: technicalExpertise ? technicalExpertise.trim() : null,
            website: website ? website.trim() : null,
            verificationStatus: isManualCompany ? 'MANUAL_PENDING' : 'PENDING',
          },
        });
      } else {
        // Update existing with address/additional fields if missing
        await prisma.industry.update({
          where: { id: ind.id },
          data: {
            organizationType: ind.organizationType || organizationType.trim(),
            addressLine1: ind.addressLine1 || addressLine1.trim(),
            addressLine2: ind.addressLine2 || (addressLine2 ? addressLine2.trim() : null),
            state: ind.state || state.trim(),
            district: ind.district || district.trim(),
            pincode: ind.pincode || pincode.trim(),
            companyCin: ind.companyCin || (companyCin ? companyCin.trim() : null),
            csrId: ind.csrId || (csrId ? csrId.trim() : null),
            csrFocusAreas: ind.csrFocusAreas || (csrFocusAreas ? csrFocusAreas.trim() : null),
            geographicFocus: ind.geographicFocus || (geographicFocus ? geographicFocus.trim() : null),
            technicalExpertise: ind.technicalExpertise || (technicalExpertise ? technicalExpertise.trim() : null),
            website: ind.website || (website ? website.trim() : null),
          }
        });
      }

      const created = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: 'INDUSTRY',
          phone: cleanPhone,
          status: 'ACTIVE',
          orgName: organizationName.trim(),
          orgDetails: designation.trim(),
          industryProfile: {
            create: {
              industryId: ind.id,
              designation: designation.trim(),
              department: organizationType.trim(),
            },
          },
        },
      });

      sessionUser = {
        id: created.id,
        email: created.email,
        name: created.name,
        role: 'INDUSTRY',
        orgName: created.orgName,
        orgDetails: created.orgDetails,
      };
    }

    const response = NextResponse.json(
      { success: true, user: sessionUser },
      { status: 201 }
    );
    setSessionCookie(response, sessionUser);
    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
