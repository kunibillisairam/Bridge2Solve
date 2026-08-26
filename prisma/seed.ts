import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

function createClient() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as any);
}

const prisma = createClient();
const SEED_PASSWORD = 'password123';

async function main() {
  console.log('🌱 Seeding database with demo users...');

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  // ─── 1. Citizen ────────────────────────────────────────────────────────────
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@gov.in' },
    update: {},
    create: {
      name: 'Ravi Kumar',
      email: 'citizen@gov.in',
      passwordHash: hash,
      role: 'CITIZEN',
      phone: '9876543210',
      status: 'ACTIVE',
      citizenProfile: { create: { district: 'Bengaluru Urban', state: 'Karnataka' } },
    },
  });

  // ─── 2. University ─────────────────────────────────────────────────────────
  const iisc = await prisma.university.upsert({
    where: { id: 'univ-iisc-001' },
    update: {},
    create: {
      id: 'univ-iisc-001',
      name: 'Indian Institute of Science, Bengaluru',
      description: 'Premier research institute focused on science and engineering.',
      location: 'Bengaluru, Karnataka',
      website: 'https://www.iisc.ac.in',
      verificationStatus: 'VERIFIED',
    },
  });

  const univUser = await prisma.user.upsert({
    where: { email: 'univ@gov.in' },
    update: {},
    create: {
      name: 'Dr. Priya Sharma',
      email: 'univ@gov.in',
      passwordHash: hash,
      role: 'UNIVERSITY',
      phone: '9123456780',
      status: 'ACTIVE',
      orgName: 'Indian Institute of Science',
      orgDetails: 'Centre for Sustainable Technologies',
      universityProfile: {
        create: { universityId: iisc.id, department: 'Centre for Sustainable Technologies', designation: 'Associate Professor' },
      },
    },
  });

  // ─── 3. Industry / CSR ─────────────────────────────────────────────────────
  const tataTrusts = await prisma.industry.upsert({
    where: { id: 'ind-tata-001' },
    update: {},
    create: {
      id: 'ind-tata-001',
      name: 'Tata Trusts',
      organizationType: 'CSR',
      description: "One of India's oldest philanthropic organisations promoting social impact.",
      location: 'Mumbai, Maharashtra',
      website: 'https://www.tatatrusts.org',
      verificationStatus: 'VERIFIED',
    },
  });

  const industryUser = await prisma.user.upsert({
    where: { email: 'industry@gov.in' },
    update: {},
    create: {
      name: 'Arjun Mehta',
      email: 'industry@gov.in',
      passwordHash: hash,
      role: 'INDUSTRY',
      phone: '9234567801',
      status: 'ACTIVE',
      orgName: 'Tata Trusts',
      orgDetails: 'CSR & Societal Innovation Wing',
      industryProfile: {
        create: { industryId: tataTrusts.id, designation: 'Program Manager', department: 'Societal Innovation' },
      },
    },
  });

  // ─── 4. Admin ──────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gov.in' },
    update: {},
    create: {
      name: 'Sunita Rao',
      email: 'admin@gov.in',
      passwordHash: hash,
      role: 'ADMIN',
      phone: '9345678012',
      status: 'ACTIVE',
      adminProfile: { create: { designation: 'Platform Administrator' } },
    },
  });

  // ─── 5. Demo Problem ───────────────────────────────────────────────────────
  await prisma.problem.upsert({
    where: { id: 'prob-001' },
    update: {},
    create: {
      id: 'prob-001',
      title: 'Waterlogging in Rajajinagar Ward',
      description:
        'Every monsoon season, Rajajinagar Ward 10 experiences severe waterlogging that disrupts ' +
        'traffic, damages property, and creates health hazards for ~5,000 residents.',
      category: 'Infrastructure & Urban Development',
      location: 'Rajajinagar, Bengaluru, Karnataka',
      affectedPopulation: '5000',
      status: 'AI_ANALYZED',
      citizenId: citizen.id,
      aiAnalysis: {
        create: {
          category: 'Infrastructure & Urban Development',
          priority: 'HIGH',
          priorityScore: 85,
          duplicateIds: JSON.stringify([]),
          requiredExpertise: JSON.stringify(['Civil Engineering', 'Urban Planning', 'Hydrology']),
          matchingScore: 92,
          matchedInstitutions: JSON.stringify(['Indian Institute of Science, Bengaluru', 'NITK Surathkal']),
          matchedIndustries: JSON.stringify(['Tata Trusts', 'Larsen & Toubro']),
          reviewStatus: 'APPROVED',
          reviewedByAdminId: adminUser.id,
        },
      },
    },
  });

  void univUser; void industryUser;

  console.log('✅ Seed complete!');
  console.log('\n  Demo Credentials (password: password123)');
  console.log('  Citizen    → citizen@gov.in');
  console.log('  University → univ@gov.in');
  console.log('  Industry   → industry@gov.in');
  console.log('  Admin      → admin@gov.in');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
