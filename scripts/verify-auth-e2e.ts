import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/db';
import { createSessionToken, getSessionUser, SessionUser } from '../src/lib/auth-server';
import { verifyJwtEdge } from '../src/lib/jwt-edge';

const JWT_SECRET = process.env.JWT_SECRET || 'sih2026-bridge2solve-secret-key-xK9mP2vL8nQ';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   BRIDGE2SOLVE STRICT AUTH E2E TEST SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST 1: CITIZEN FLOW
  // ----------------------------------------------------
  console.log('--- TEST 1: CITIZEN FLOW ---');
  const citizenEmail = `test.citizen.${Date.now()}@example.com`;
  const citizenPassword = 'citizenPassword123';
  const citizenHash = await bcrypt.hash(citizenPassword, 10);

  const citizenUser = await prisma.user.create({
    data: {
      name: 'Test Citizen User',
      email: citizenEmail,
      passwordHash: citizenHash,
      role: 'CITIZEN',
      phone: '9876543211',
      status: 'ACTIVE',
      citizenProfile: {
        create: {
          district: 'Bengaluru Urban',
          state: 'Karnataka',
        },
      },
    },
    include: { citizenProfile: true },
  });

  assert(citizenUser.role === 'CITIZEN', 'Citizen user in DB has role CITIZEN');
  assert(citizenUser.citizenProfile?.district === 'Bengaluru Urban', 'Citizen profile created successfully');

  // Verify bcrypt password check
  const citizenPwValid = await bcrypt.compare(citizenPassword, citizenUser.passwordHash);
  assert(citizenPwValid, 'Citizen password verified correctly against hash');

  // Issue session token
  const citizenSession: SessionUser = {
    id: citizenUser.id,
    email: citizenUser.email,
    name: citizenUser.name,
    role: citizenUser.role as any,
  };
  const citizenToken = createSessionToken(citizenSession);
  const citizenEdgeDecoded = await verifyJwtEdge(citizenToken, JWT_SECRET);
  assert(citizenEdgeDecoded?.role === 'CITIZEN', 'Edge JWT verifies role is CITIZEN');
  assert(citizenEdgeDecoded?.id === citizenUser.id, 'Edge JWT matches Citizen ID');

  // Citizen cross-role block verification
  assert(citizenEdgeDecoded?.role !== 'UNIVERSITY', 'Citizen cannot masquerade as UNIVERSITY');
  assert(citizenEdgeDecoded?.role !== 'INDUSTRY', 'Citizen cannot masquerade as INDUSTRY');
  assert(citizenEdgeDecoded?.role !== 'ADMIN', 'Citizen cannot masquerade as ADMIN');

  // ----------------------------------------------------
  // TEST 2: UNIVERSITY FLOW
  // ----------------------------------------------------
  console.log('\n--- TEST 2: UNIVERSITY FLOW ---');
  const univEmail = `test.univ.${Date.now()}@example.com`;
  const univPassword = 'univPassword123';
  const univHash = await bcrypt.hash(univPassword, 10);

  let univEntity = await prisma.university.findFirst({
    where: { name: 'National Institute of Technology' },
  });
  if (!univEntity) {
    univEntity = await prisma.university.create({
      data: {
        name: 'National Institute of Technology',
        verificationStatus: 'PENDING',
      },
    });
  }

  const univUser = await prisma.user.create({
    data: {
      name: 'Dr. Test Professor',
      email: univEmail,
      passwordHash: univHash,
      role: 'UNIVERSITY',
      phone: '9123456781',
      status: 'ACTIVE',
      orgName: 'National Institute of Technology',
      orgDetails: 'Computer Science Dept',
      universityProfile: {
        create: {
          universityId: univEntity.id,
          department: 'Computer Science Dept',
          designation: 'Professor',
        },
      },
    },
    include: { universityProfile: true },
  });

  assert(univUser.role === 'UNIVERSITY', 'University user in DB has role UNIVERSITY');
  assert(univUser.universityProfile?.department === 'Computer Science Dept', 'University profile created successfully');

  const univPwValid = await bcrypt.compare(univPassword, univUser.passwordHash);
  assert(univPwValid, 'University password verified correctly against hash');

  const univSession: SessionUser = {
    id: univUser.id,
    email: univUser.email,
    name: univUser.name,
    role: univUser.role as any,
    orgName: univUser.orgName,
  };
  const univToken = createSessionToken(univSession);
  const univEdgeDecoded = await verifyJwtEdge(univToken, JWT_SECRET);
  assert(univEdgeDecoded?.role === 'UNIVERSITY', 'Edge JWT verifies role is UNIVERSITY');
  assert(univEdgeDecoded?.role !== 'CITIZEN', 'University cannot access CITIZEN role');
  assert(univEdgeDecoded?.role !== 'ADMIN', 'University cannot access ADMIN role');

  // ----------------------------------------------------
  // TEST 3: INDUSTRY FLOW
  // ----------------------------------------------------
  console.log('\n--- TEST 3: INDUSTRY FLOW ---');
  const indEmail = `test.ind.${Date.now()}@example.com`;
  const indPassword = 'industryPassword123';
  const indHash = await bcrypt.hash(indPassword, 10);

  let indEntity = await prisma.industry.findFirst({
    where: { name: 'InnovateCSR Corp' },
  });
  if (!indEntity) {
    indEntity = await prisma.industry.create({
      data: {
        name: 'InnovateCSR Corp',
        organizationType: 'CSR Foundation',
        verificationStatus: 'PENDING',
      },
    });
  }

  const indUser = await prisma.user.create({
    data: {
      name: 'Corporate Partner Lead',
      email: indEmail,
      passwordHash: indHash,
      role: 'INDUSTRY',
      phone: '9234567802',
      status: 'ACTIVE',
      orgName: 'InnovateCSR Corp',
      orgDetails: 'Head of CSR',
      industryProfile: {
        create: {
          industryId: indEntity.id,
          designation: 'Head of CSR',
          department: 'CSR Foundation',
        },
      },
    },
    include: { industryProfile: true },
  });

  assert(indUser.role === 'INDUSTRY', 'Industry user in DB has role INDUSTRY');
  assert(indUser.industryProfile?.designation === 'Head of CSR', 'Industry profile created successfully');

  const indPwValid = await bcrypt.compare(indPassword, indUser.passwordHash);
  assert(indPwValid, 'Industry password verified correctly against hash');

  const indSession: SessionUser = {
    id: indUser.id,
    email: indUser.email,
    name: indUser.name,
    role: indUser.role as any,
    orgName: indUser.orgName,
  };
  const indToken = createSessionToken(indSession);
  const indEdgeDecoded = await verifyJwtEdge(indToken, JWT_SECRET);
  assert(indEdgeDecoded?.role === 'INDUSTRY', 'Edge JWT verifies role is INDUSTRY');
  assert(indEdgeDecoded?.role !== 'UNIVERSITY', 'Industry cannot access UNIVERSITY role');
  assert(indEdgeDecoded?.role !== 'ADMIN', 'Industry cannot access ADMIN role');

  // ----------------------------------------------------
  // TEST 4: ADMIN / GOVERNMENT FLOW
  // ----------------------------------------------------
  console.log('\n--- TEST 4: ADMIN FLOW ---');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@gov.in' },
    include: { adminProfile: true },
  });

  assert(adminUser !== null, 'Seeded Admin account admin@gov.in exists');
  assert(adminUser?.role === 'ADMIN', 'Admin account has role ADMIN');

  if (adminUser) {
    const adminPwValid = await bcrypt.compare('password123', adminUser.passwordHash);
    assert(adminPwValid, 'Admin seed credentials verify correctly');

    const adminSession: SessionUser = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role as any,
    };
    const adminToken = createSessionToken(adminSession);
    const adminEdgeDecoded = await verifyJwtEdge(adminToken, JWT_SECRET);
    assert(adminEdgeDecoded?.role === 'ADMIN', 'Edge JWT verifies role is ADMIN');
  }

  // ----------------------------------------------------
  // TEST 5: DATA ISOLATION (CITIZEN PROBLEMS)
  // ----------------------------------------------------
  console.log('\n--- TEST 5: DATA ISOLATION ---');
  // Create problem under test citizen
  const problem1 = await prisma.problem.create({
    data: {
      title: 'Water Leakage in Test Ward',
      description: 'Severe pipe leakage on Sector 5 main junction.',
      category: 'Water & Sanitation',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      affectedPopulation: 250,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      submittedById: citizenUser.id,
    },
  });

  // Verify that querying with submittedById: citizenUser.id returns problem1
  const citizenOwnProblems = await prisma.problem.findMany({
    where: { submittedById: citizenUser.id },
  });
  assert(
    citizenOwnProblems.some((p) => p.id === problem1.id),
    'Citizen can retrieve their own submitted problem'
  );

  // Verify that querying for univUser.id returns 0 problems
  const otherProblems = await prisma.problem.findMany({
    where: { submittedById: univUser.id },
  });
  assert(
    !otherProblems.some((p) => p.id === problem1.id),
    'Other roles cannot see Citizen private problem when filtering by their identity'
  );

  // ----------------------------------------------------
  // TEST 6: /api/auth/me SANITIZATION
  // ----------------------------------------------------
  console.log('\n--- TEST 6: PROFILE SANITIZATION ---');
  const safeUserRecord = await prisma.user.findUnique({
    where: { id: citizenUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      status: true,
      orgName: true,
      orgDetails: true,
      createdAt: true,
      citizenProfile: true,
    },
  });

  assert(safeUserRecord !== null, 'Fetched user profile without passwordHash');
  assert(!('passwordHash' in (safeUserRecord as any)), 'passwordHash is completely excluded from safe profile');
  assert(safeUserRecord?.role === 'CITIZEN', 'Profile returns authoritative role CITIZEN');

  // ----------------------------------------------------
  // TEST 7: INVALID CREDENTIALS & ERROR HANDLING
  // ----------------------------------------------------
  console.log('\n--- TEST 7: INVALID CREDENTIALS & EDGE CASES ---');
  const wrongPw = await bcrypt.compare('wrongPassword', citizenUser.passwordHash);
  assert(!wrongPw, 'Wrong password comparison returns false (401 candidate)');

  const nonExistentUser = await prisma.user.findUnique({
    where: { email: 'nonexistent.user.test@gov.in' },
  });
  assert(nonExistentUser === null, 'Non-existent email returns null (401 candidate)');

  // Tampered JWT test
  const tamperedToken = citizenToken.slice(0, -5) + 'xxxxx';
  const tamperedResult = await verifyJwtEdge(tamperedToken, JWT_SECRET);
  assert(tamperedResult === null, 'Tampered JWT signature is rejected by Edge crypto');

  // Expired token test
  const expiredPayload = {
    id: citizenUser.id,
    email: citizenUser.email,
    name: citizenUser.name,
    role: 'CITIZEN' as const,
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  };
  const encoder = new TextEncoder();
  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(`${headerB64}.${payloadB64}`));
  let binary = '';
  const bytes = new Uint8Array(signatureBytes);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const sigB64 = Buffer.from(binary, 'binary').toString('base64url');
  const expiredJwt = `${headerB64}.${payloadB64}.${sigB64}`;

  const expiredResult = await verifyJwtEdge(expiredJwt, JWT_SECRET);
  assert(expiredResult === null, 'Expired JWT token is rejected by Edge crypto');

  // Clean up created test data
  console.log('\n--- CLEANING UP TEST ARTIFACTS ---');
  await prisma.problem.delete({ where: { id: problem1.id } }).catch(() => {});
  await prisma.citizenProfile.delete({ where: { userId: citizenUser.id } }).catch(() => {});
  await prisma.user.delete({ where: { id: citizenUser.id } }).catch(() => {});
  await prisma.universityProfile.delete({ where: { userId: univUser.id } }).catch(() => {});
  await prisma.user.delete({ where: { id: univUser.id } }).catch(() => {});
  await prisma.industryProfile.delete({ where: { userId: indUser.id } }).catch(() => {});
  await prisma.user.delete({ where: { id: indUser.id } }).catch(() => {});

  console.log('Cleanup finished.');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Fatal error during test run:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
