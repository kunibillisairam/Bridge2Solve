import 'dotenv/config';
import { NextRequest } from 'next/server';
import { POST as signupHandler } from '../src/app/api/auth/signup/route';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { GET as meHandler } from '../src/app/api/auth/me/route';
import { POST as logoutHandler } from '../src/app/api/auth/logout/route';
import { POST as problemPostHandler, GET as problemGetHandler } from '../src/app/api/problems/route';
import { POST as validateProblemHandler } from '../src/app/api/problems/[id]/validate/route';
import { POST as pledgeHandler } from '../src/app/api/projects/[id]/pledge/route';
import { POST as proposalHandler } from '../src/app/api/projects/[id]/proposal/route';
import { POST as teamHandler } from '../src/app/api/projects/[id]/team/route';
import { prisma } from '../src/lib/db';
import { COOKIE_NAME } from '../src/lib/auth-server';

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

function createMockRequest(url: string, method: string, body?: any, cookies?: Record<string, string>): NextRequest {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (cookies) {
    const cookieStr = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    headers.set('cookie', cookieStr);
  }

  const reqInit: RequestInit = {
    method,
    headers,
  };
  if (body) {
    reqInit.body = JSON.stringify(body);
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), reqInit as any);
}

function extractSessionCookie(res: Response): string | undefined {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return undefined;
  const match = setCookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : undefined;
}

async function runRouteTests() {
  console.log('====================================================');
  console.log('   BRIDGE2SOLVE API ROUTE AUTHORIZATION TEST SUITE');
  console.log('====================================================\n');

  const uniqueId = Date.now();
  const testCitizenEmail = `api.citizen.${uniqueId}@example.com`;
  const testUnivEmail = `api.univ.${uniqueId}@example.com`;
  const testIndEmail = `api.ind.${uniqueId}@example.com`;
  const testPassword = 'Password123!';

  let citizenCookie = '';
  let univCookie = '';
  let indCookie = '';
  let adminCookie = '';

  // ----------------------------------------------------
  // 1. ADMIN PUBLIC SIGNUP BLOCK TEST
  // ----------------------------------------------------
  console.log('--- 1. ADMIN PUBLIC SIGNUP BLOCK ---');
  const adminSignupReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'ADMIN',
    email: `admin.${uniqueId}@example.com`,
    password: testPassword,
    confirmPassword: testPassword,
    name: 'Malicious Admin Wannabe',
  });
  const adminSignupRes = await signupHandler(adminSignupReq);
  assert(adminSignupRes.status === 403, 'Public Admin registration returns 403 Forbidden');

  // ----------------------------------------------------
  // 2. SIGNUP VALIDATION TESTS (PASSWORD / MATCH / EMAIL)
  // ----------------------------------------------------
  console.log('\n--- 2. SIGNUP INPUT VALIDATIONS ---');
  // Short password (< 6)
  const shortPwReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'CITIZEN',
    email: testCitizenEmail,
    password: '123',
    confirmPassword: '123',
    name: 'Short Pw User',
    phone: '9876543210',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  });
  const shortPwRes = await signupHandler(shortPwReq);
  assert(shortPwRes.status === 400, 'Password < 6 characters returns 400 Bad Request');

  // Password mismatch
  const mismatchReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'CITIZEN',
    email: testCitizenEmail,
    password: testPassword,
    confirmPassword: 'DifferentPassword123!',
    name: 'Mismatch User',
    phone: '9876543210',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  });
  const mismatchRes = await signupHandler(mismatchReq);
  assert(mismatchRes.status === 400, 'Password mismatch returns 400 Bad Request');

  // Missing required name
  const missingNameReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'CITIZEN',
    email: testCitizenEmail,
    password: testPassword,
    confirmPassword: testPassword,
    name: '',
    phone: '9876543210',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  });
  const missingNameRes = await signupHandler(missingNameReq);
  assert(missingNameRes.status === 400, 'Missing required name returns 400 Bad Request');

  // ----------------------------------------------------
  // 3. VALID CITIZEN SIGNUP & DUPLICATE PREVENTION
  // ----------------------------------------------------
  console.log('\n--- 3. CITIZEN SIGNUP & DUPLICATE CHECK ---');
  const validCitizenReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'CITIZEN',
    email: testCitizenEmail,
    password: testPassword,
    confirmPassword: testPassword,
    name: 'Ravi Citizen',
    phone: '9876543210',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  });
  const validCitizenRes = await signupHandler(validCitizenReq);
  assert(validCitizenRes.status === 201, 'Valid Citizen signup returns 201 Created');
  citizenCookie = extractSessionCookie(validCitizenRes) || '';
  assert(citizenCookie.length > 20, 'Citizen signup response sets sih_session cookie');

  // Duplicate email signup
  const duplicateReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'CITIZEN',
    email: testCitizenEmail,
    password: testPassword,
    confirmPassword: testPassword,
    name: 'Duplicate User',
    phone: '9876543210',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
  });
  const duplicateRes = await signupHandler(duplicateReq);
  assert(duplicateRes.status === 409, 'Duplicate email signup returns 409 Conflict');

  // ----------------------------------------------------
  // 4. UNIVERSITY & INDUSTRY SIGNUP
  // ----------------------------------------------------
  console.log('\n--- 4. UNIVERSITY & INDUSTRY SIGNUPS ---');
  const univSignupReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'UNIVERSITY',
    email: testUnivEmail,
    password: testPassword,
    confirmPassword: testPassword,
    universityName: 'Indian Institute of Technology',
    name: 'Prof. Sharma',
    department: 'Civil Eng',
    designation: 'HOD',
  });
  const univSignupRes = await signupHandler(univSignupReq);
  assert(univSignupRes.status === 201, 'Valid University signup returns 201 Created');
  univCookie = extractSessionCookie(univSignupRes) || '';

  const indSignupReq = createMockRequest('http://localhost:3000/api/auth/signup', 'POST', {
    role: 'INDUSTRY',
    email: testIndEmail,
    password: testPassword,
    confirmPassword: testPassword,
    organizationName: 'Global Green CSR',
    name: 'Anil Ambani',
    organizationType: 'CSR Foundation',
    designation: 'Director CSR',
  });
  const indSignupRes = await signupHandler(indSignupReq);
  assert(indSignupRes.status === 201, 'Valid Industry signup returns 201 Created');
  indCookie = extractSessionCookie(indSignupRes) || '';

  // ----------------------------------------------------
  // 5. LOGIN ENDPOINT TESTS
  // ----------------------------------------------------
  console.log('\n--- 5. LOGIN ENDPOINT CHECKS ---');
  // Wrong password
  const wrongPwLoginReq = createMockRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: testCitizenEmail,
    password: 'WrongPassword!',
  });
  const wrongPwLoginRes = await loginHandler(wrongPwLoginReq);
  assert(wrongPwLoginRes.status === 401, 'Login with wrong password returns 401 Unauthorized');

  // Non-existent email
  const nonExistentLoginReq = createMockRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: 'does.not.exist@nowhere.com',
    password: testPassword,
  });
  const nonExistentLoginRes = await loginHandler(nonExistentLoginReq);
  assert(nonExistentLoginRes.status === 401, 'Login with non-existent email returns 401 Unauthorized');

  // Missing fields
  const emptyLoginReq = createMockRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: '',
    password: '',
  });
  const emptyLoginRes = await loginHandler(emptyLoginReq);
  assert(emptyLoginRes.status === 400, 'Login with missing fields returns 400 Bad Request');

  // Valid Citizen Login
  const validCitizenLoginReq = createMockRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: testCitizenEmail,
    password: testPassword,
  });
  const validCitizenLoginRes = await loginHandler(validCitizenLoginReq);
  assert(validCitizenLoginRes.status === 200, 'Valid Citizen login returns 200 OK');
  const citizenLoginJson = await validCitizenLoginRes.json();
  assert(citizenLoginJson.user.role === 'CITIZEN', 'Login response returns database role CITIZEN');

  // Valid Seed Admin Login
  const validAdminLoginReq = createMockRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: 'admin@gov.in',
    password: 'password123',
  });
  const validAdminLoginRes = await loginHandler(validAdminLoginReq);
  assert(validAdminLoginRes.status === 200, 'Valid Admin seed login returns 200 OK');
  adminCookie = extractSessionCookie(validAdminLoginRes) || '';
  const adminLoginJson = await validAdminLoginRes.json();
  assert(adminLoginJson.user.role === 'ADMIN', 'Admin login returns database role ADMIN');

  // ----------------------------------------------------
  // 6. /api/auth/me SECURITY & SANITIZATION
  // ----------------------------------------------------
  console.log('\n--- 6. /api/auth/me USER PROFILE SANITIZATION ---');
  const unauthMeReq = createMockRequest('http://localhost:3000/api/auth/me', 'GET');
  const unauthMeRes = await meHandler(unauthMeReq);
  assert(unauthMeRes.status === 401, 'Unauthenticated /api/auth/me returns 401 Unauthorized');

  const authCitizenMeReq = createMockRequest('http://localhost:3000/api/auth/me', 'GET', undefined, {
    [COOKIE_NAME]: citizenCookie,
  });
  const authCitizenMeRes = await meHandler(authCitizenMeReq);
  assert(authCitizenMeRes.status === 200, 'Authenticated Citizen /api/auth/me returns 200 OK');
  const citizenMeJson = await authCitizenMeRes.json();
  assert(citizenMeJson.user.role === 'CITIZEN', '/api/auth/me returns role CITIZEN');
  assert(citizenMeJson.user.email === testCitizenEmail, '/api/auth/me returns matching email');
  assert(!('passwordHash' in citizenMeJson.user), 'No passwordHash exposed in /api/auth/me response');

  // ----------------------------------------------------
  // 7. /api/auth/logout
  // ----------------------------------------------------
  console.log('\n--- 7. /api/auth/logout ---');
  const logoutReq = createMockRequest('http://localhost:3000/api/auth/logout', 'POST');
  const logoutRes = await logoutHandler(logoutReq);
  assert(logoutRes.status === 200, 'Logout returns 200 OK');
  const logoutCookie = logoutRes.headers.get('set-cookie');
  assert(
    Boolean(logoutCookie?.includes('Max-Age=0') || logoutCookie?.includes('max-age=0')),
    'Logout sets Max-Age=0 on sih_session cookie'
  );

  // ----------------------------------------------------
  // 8. API ROLE AUTHORIZATION (PROBLEMS / VALIDATE / PLEDGE / PROPOSAL / TEAM)
  // ----------------------------------------------------
  console.log('\n--- 8. API ROLE AUTHORIZATION & PERMISSIONS ---');

  // 8.1 POST /api/problems (Citizen only)
  const citizenProblemReq = createMockRequest(
    'http://localhost:3000/api/problems',
    'POST',
    {
      title: 'Water Supply Issue Ward 7',
      description: 'Severe shortage of drinking water in Sector 2.',
      category: 'Agriculture & Water Management',
      location: 'Pune, Maharashtra',
      affectedPopulation: '3000',
    },
    { [COOKIE_NAME]: citizenCookie }
  );
  const citizenProblemRes = await problemPostHandler(citizenProblemReq);
  assert(citizenProblemRes.status === 201, 'Citizen can create problem report (201 Created)');
  const createdProbJson = await citizenProblemRes.json();
  const createdProblemId = createdProbJson.problem?.id;

  // University trying to POST /api/problems -> BLOCKED
  const univProblemReq = createMockRequest(
    'http://localhost:3000/api/problems',
    'POST',
    {
      title: 'Unauthorized Problem',
      description: 'University trying to submit problem directly.',
      category: 'Agriculture & Water Management',
      location: 'Pune, Maharashtra',
      affectedPopulation: '100',
    },
    { [COOKIE_NAME]: univCookie }
  );
  const univProblemRes = await problemPostHandler(univProblemReq);
  assert(univProblemRes.status === 401, 'University blocked from submitting citizen problem (401)');

  // 8.2 POST /api/problems/[id]/validate (Admin only)
  // Citizen trying to validate -> BLOCKED
  const citizenValidateReq = createMockRequest(
    `http://localhost:3000/api/problems/${createdProblemId}/validate`,
    'POST',
    { action: 'approve' },
    { [COOKIE_NAME]: citizenCookie }
  );
  const citizenValidateRes = await validateProblemHandler(citizenValidateReq, { params: { id: createdProblemId } });
  assert(citizenValidateRes.status === 401, 'Citizen blocked from validating problem (401)');

  // Admin validating -> ALLOWED
  const adminValidateReq = createMockRequest(
    `http://localhost:3000/api/problems/${createdProblemId}/validate`,
    'POST',
    { action: 'approve' },
    { [COOKIE_NAME]: adminCookie }
  );
  const adminValidateRes = await validateProblemHandler(adminValidateReq, { params: { id: createdProblemId } });
  assert(adminValidateRes.status === 200, 'Admin can validate problem (200 OK)');

  // 8.3 POST /api/projects/[id]/pledge (Industry only)
  // Citizen trying to pledge -> BLOCKED
  const citizenPledgeReq = createMockRequest(
    'http://localhost:3000/api/projects/dummy-id/pledge',
    'POST',
    { amount: 50000 },
    { [COOKIE_NAME]: citizenCookie }
  );
  const citizenPledgeRes = await pledgeHandler(citizenPledgeReq, { params: { id: 'dummy-id' } });
  assert(citizenPledgeRes.status === 401, 'Citizen blocked from Industry pledge endpoint (401)');

  // 8.4 POST /api/projects/[id]/proposal (University only)
  // Citizen trying to create proposal -> BLOCKED
  const citizenProposalReq = createMockRequest(
    'http://localhost:3000/api/projects/dummy-id/proposal',
    'POST',
    { title: 'Prop', description: 'Desc', budget: 1000, timeline: '2mo' },
    { [COOKIE_NAME]: citizenCookie }
  );
  const citizenProposalRes = await proposalHandler(citizenProposalReq, { params: { id: 'dummy-id' } });
  assert(citizenProposalRes.status === 401, 'Citizen blocked from University proposal endpoint (401)');

  // 8.5 POST /api/projects/[id]/team (University only)
  // Industry trying to create academic team -> BLOCKED
  const indTeamReq = createMockRequest(
    'http://localhost:3000/api/projects/dummy-id/team',
    'POST',
    { facultyMentorName: 'Prof. X', studentMembers: ['Student A'] },
    { [COOKIE_NAME]: indCookie }
  );
  const indTeamRes = await teamHandler(indTeamReq, { params: { id: 'dummy-id' } });
  assert(indTeamRes.status === 401, 'Industry blocked from University team creation endpoint (401)');

  // ----------------------------------------------------
  // CLEANUP TEST USERS & PROBLEMS
  // ----------------------------------------------------
  console.log('\n--- CLEANING UP TEST DATA ---');
  if (createdProblemId) {
    await prisma.problem.delete({ where: { id: createdProblemId } }).catch(() => {});
  }
  const usersToDelete = [testCitizenEmail, testUnivEmail, testIndEmail];
  for (const email of usersToDelete) {
    const u = await prisma.user.findUnique({ where: { email } });
    if (u) {
      await prisma.citizenProfile.deleteMany({ where: { userId: u.id } });
      await prisma.universityProfile.deleteMany({ where: { userId: u.id } });
      await prisma.industryProfile.deleteMany({ where: { userId: u.id } });
      await prisma.user.delete({ where: { id: u.id } });
    }
  }
  console.log('Cleanup complete.');

  console.log('\n====================================================');
  console.log(`API ROUTE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRouteTests()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Fatal test error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
