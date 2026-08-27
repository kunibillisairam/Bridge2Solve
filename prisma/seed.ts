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
  console.log('🌱 Starting comprehensive data seed...');

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  // 1. SAFE DELETION IN CORRECT RELATION ORDER
  console.log('🧹 Cleaning existing tables...');
  await prisma.comment.deleteMany({});
  await prisma.impactReport.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.aiAnalysis.deleteMany({});
  await prisma.problem.deleteMany({});
  await prisma.citizenProfile.deleteMany({});
  await prisma.universityProfile.deleteMany({});
  await prisma.industryProfile.deleteMany({});
  await prisma.adminProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.university.deleteMany({});
  await prisma.industry.deleteMany({});

  console.log('✨ Tables cleaned. Seeding new data...');

  // ─── 2. SEED ADMIN USER ────────────────────────────────────────────────────
  const adminUser = await prisma.user.create({
    data: {
      name: 'Sunita Rao',
      email: 'admin@gov.in',
      passwordHash: hash,
      role: 'ADMIN',
      phone: '9345678012',
      status: 'ACTIVE',
      adminProfile: { create: { designation: 'Platform Administrator' } },
    },
  });

  // ─── 3. SEED CITIZENS (8 Users) ────────────────────────────────────────────
  const citizensData = [
    { name: 'Ravi Kumar', email: 'citizen@gov.in', phone: '9876543210', district: 'Ranchi', state: 'Jharkhand' },
    { name: 'Sunita Devi', email: 'sunita.devi@demo.in', phone: '9876543211', district: 'Gaya', state: 'Bihar' },
    { name: 'Baldev Singh', email: 'baldev.singh@demo.in', phone: '9876543212', district: 'Sangrur', state: 'Punjab' },
    { name: 'Meera Bai', email: 'meera.bai@demo.in', phone: '9876543213', district: 'Pune', state: 'Maharashtra' },
    { name: 'Gagan Mohanty', email: 'gagan.mohanty@demo.in', phone: '9876543214', district: 'Mayurbhanj', state: 'Odisha' },
    { name: 'Ankit Sharma', email: 'ankit.sharma@demo.in', phone: '9876543215', district: 'Alappuzha', state: 'Kerala' },
    { name: 'Lakshmi K.', email: 'lakshmi.k@demo.in', phone: '9876543216', district: 'Coimbatore', state: 'Tamil Nadu' },
    { name: 'Suresh Mahto', email: 'suresh.mahto@demo.in', phone: '9876543217', district: 'Ranchi', state: 'Jharkhand' },
  ];

  const citizens: Record<string, any> = {};
  for (const c of citizensData) {
    const created = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        passwordHash: hash,
        role: 'CITIZEN',
        phone: c.phone,
        status: 'ACTIVE',
        citizenProfile: { create: { district: c.district, state: c.state } },
      },
    });
    citizens[c.email] = created;
  }

  // ─── 4. SEED UNIVERSITIES (5 Institutions) ───────────────────────────────
  const universitiesData = [
    {
      id: 'univ-1',
      name: 'Indian Institute of Science (IISc)',
      description: 'Premier research institute focused on science, environmental engineering, and sustainable technology.',
      location: 'Bengaluru, Karnataka',
      website: 'https://www.iisc.ac.in',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'univ-2',
      name: 'Punjab Agricultural University (PAU)',
      description: 'Leading agricultural institution specializing in soil science, agronomy, and sustainable agricultural systems.',
      location: 'Ludhiana, Punjab',
      website: 'https://www.pau.edu',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'univ-3',
      name: 'College of Engineering Pune (COEP)',
      description: 'Historic engineering college with expertise in mechanical automation, robotics, and urban waste systems.',
      location: 'Pune, Maharashtra',
      website: 'https://www.coep.org.in',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'univ-4',
      name: 'National Institute of Technology Patna (NITP)',
      description: 'National institute of technology focused on renewable energy, battery storage, and smart electrical microgrids.',
      location: 'Patna, Bihar',
      website: 'https://www.nitp.ac.in',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'univ-5',
      name: 'Utkal University',
      description: 'Public state university with specialized research wings in tribal education, social work, and rural pedagogy.',
      location: 'Bhubaneswar, Odisha',
      website: 'https://utkaluniversity.ac.in',
      verificationStatus: 'VERIFIED',
    },
  ];

  for (const u of universitiesData) {
    await prisma.university.create({ data: u });
  }

  // ─── 5. SEED UNIVERSITY USERS ──────────────────────────────────────────────
  const universityUsersData = [
    { name: 'Dr. Priya Sharma', email: 'univ@gov.in', universityId: 'univ-1', department: 'Centre for Sustainable Technologies', designation: 'Associate Professor' },
    { name: 'Prof. Devinder Singh', email: 'univ-pau@gov.in', universityId: 'univ-2', department: 'Soil Science & Agronomy', designation: 'Professor & Head' },
    { name: 'Dr. Sanjay Patil', email: 'univ-coep@gov.in', universityId: 'univ-3', department: 'Mechanical Engineering', designation: 'Department Head' },
    { name: 'Prof. Rakesh Ranjan', email: 'univ-nitp@gov.in', universityId: 'univ-4', department: 'Electrical Engineering', designation: 'Associate Professor' },
    { name: 'Dr. Minati Das', email: 'univ-utkal@gov.in', universityId: 'univ-5', department: 'Social Work & Education', designation: 'Professor' },
  ];

  const universityUsers: Record<string, any> = {};
  for (const uu of universityUsersData) {
    const created = await prisma.user.create({
      data: {
        name: uu.name,
        email: uu.email,
        passwordHash: hash,
        role: 'UNIVERSITY',
        phone: '9123456780',
        status: 'ACTIVE',
        orgName: uu.name,
        orgDetails: `${uu.designation}, ${uu.department}`,
        universityProfile: {
          create: { universityId: uu.universityId, department: uu.department, designation: uu.designation },
        },
      },
    });
    universityUsers[uu.email] = created;
  }

  // ─── 6. SEED INDUSTRY ORGANIZATIONS (5 CSR wings) ──────────────────────────
  const industriesData = [
    {
      id: 'ind-1',
      name: 'Tata Steel CSR Foundation',
      organizationType: 'CSR',
      description: "Promoting groundwater infrastructure, public health, and rural sanitation networks across East India.",
      location: 'Jamshedpur, Jharkhand',
      website: 'https://www.tatasteel.com/csr',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'ind-2',
      name: 'IFFCO AgriTech CSR Division',
      organizationType: 'CSR',
      description: 'Specializing in soil reclamation, nano-fertilizers, and sustainable farming inputs across farming clusters.',
      location: 'New Delhi, Delhi',
      website: 'https://www.iffco.in',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'ind-3',
      name: 'ReNew Power Social Impact Division',
      organizationType: 'CSR',
      description: 'Focused on rural solar electrification, microgrids, and off-grid solutions for community centers.',
      location: 'Gurugram, Haryana',
      website: 'https://renewpower.in',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'ind-4',
      name: 'Vedanta Foundation CSR',
      organizationType: 'CSR',
      description: 'Promoting digital literacy, vernacular e-learning systems, and primary school enhancements in tribal belts.',
      location: 'Bhubaneswar, Odisha',
      website: 'https://www.vedantafoundation.org',
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'ind-5',
      name: 'Prajs CleanTech Solutions',
      organizationType: 'Corporate',
      description: 'Pioneers in circular economy, waste segregation mechanics, and bioremediation technology support.',
      location: 'Pune, Maharashtra',
      website: 'https://www.praj.net',
      verificationStatus: 'VERIFIED',
    },
  ];

  for (const i of industriesData) {
    await prisma.industry.create({ data: i });
  }

  // ─── 7. SEED INDUSTRY USERS ────────────────────────────────────────────────
  const industryUsersData = [
    { name: 'Arjun Mehta', email: 'industry@gov.in', industryId: 'ind-1', designation: 'Program Manager', department: 'Societal Innovation' },
    { name: 'Dr. Harpreet Gill', email: 'industry-iffco@gov.in', industryId: 'ind-2', designation: 'Soil Health Lead', department: 'CSR Division' },
    { name: 'Shalini Bose', email: 'industry-renew@gov.in', industryId: 'ind-3', designation: 'Director', department: 'Rural Energy Access' },
    { name: 'Manoj Mishra', email: 'industry-vedanta@gov.in', industryId: 'ind-4', designation: 'Education Program Head', department: 'CSR Foundation' },
    { name: 'Milind Deshpande', email: 'industry-praj@gov.in', industryId: 'ind-5', designation: 'VP', department: 'Environmental Technologies' },
  ];

  const industryUsers: Record<string, any> = {};
  for (const iu of industryUsersData) {
    const created = await prisma.user.create({
      data: {
        name: iu.name,
        email: iu.email,
        passwordHash: hash,
        role: 'INDUSTRY',
        phone: '9234567801',
        status: 'ACTIVE',
        orgName: iu.name,
        orgDetails: `${iu.designation}, ${iu.department}`,
        industryProfile: {
          create: { industryId: iu.industryId, designation: iu.designation, department: iu.department },
        },
      },
    });
    industryUsers[iu.email] = created;
  }

  // ─── 8. SEED COMMUNITY PROBLEMS (15 Problems) ─────────────────────────────
  const problemsData = [
    {
      id: 'prob-1',
      title: 'Drinking Water Scarcity and Contamination in Ranchi Rural Blocks',
      description: 'During the dry season, groundwater levels drop severely in Ranchi rural blocks. Local residents, mostly women and children, walk over 3km daily to fetch drinking water. Contamination in secondary wells is also a major health risk.',
      category: 'Water & Sanitation',
      district: 'Ranchi',
      state: 'Jharkhand',
      affectedPopulation: 4500,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      submittedByEmail: 'citizen@gov.in',
      ai: {
        category: 'Water & Sanitation',
        priority: 'HIGH',
        priorityScore: 92,
        duplicateIds: ['prob-7', 'prob-8', 'prob-9'],
        requiredExpertise: ['Groundwater mapping', 'Gravity filtration', 'Community water management'],
        matchingScore: 92,
        matchedInstitutions: ['univ-1'],
        matchedIndustries: ['ind-1'],
      }
    },
    {
      id: 'prob-2',
      title: 'Crop Yield Reduction due to Soil Salinity in Sangrur agricultural belt',
      description: 'Excessive chemical fertilizer usage and poor irrigation drainage have led to critical soil salinity in the Sangrur district. Crop productivity has dropped by 40% over the last three seasons, impacting farmer livelihoods.',
      category: 'Agriculture & Food Tech',
      district: 'Sangrur',
      state: 'Punjab',
      affectedPopulation: 12000,
      status: 'RESOLVED',
      priority: 'HIGH',
      submittedByEmail: 'baldev.singh@demo.in',
      ai: {
        category: 'Agriculture & Food Tech',
        priority: 'HIGH',
        priorityScore: 88,
        duplicateIds: ['prob-13'],
        requiredExpertise: ['Soil chemistry analysis', 'Halophilic microbes', 'Sustainable farming outreach'],
        matchingScore: 88,
        matchedInstitutions: ['univ-2'],
        matchedIndustries: ['ind-2'],
      }
    },
    {
      id: 'prob-3',
      title: 'Inadequate Municipal Waste Sorting at Source in Pune City',
      description: 'Municipal waste is collected mixed, causing landfills to overflow and environmental degradation. The local municipality in Pune seeks automated or smart solutions to encourage source-sorting or automate high-throughput sorting.',
      category: 'Waste Management',
      district: 'Pune',
      state: 'Maharashtra',
      affectedPopulation: 85000,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      submittedByEmail: 'meera.bai@demo.in',
      ai: {
        category: 'Waste Management',
        priority: 'MEDIUM',
        priorityScore: 78,
        duplicateIds: [],
        requiredExpertise: ['Object detection (YOLO)', 'Conveyor belt mechanics', 'Routing optimization'],
        matchingScore: 78,
        matchedInstitutions: ['univ-3'],
        matchedIndustries: ['ind-5'],
      }
    },
    {
      id: 'prob-4',
      title: 'Intermittent Electricity Supply in Rural Gaya Primary Schools',
      description: 'Over 20 schools in rural Gaya experience frequent power cuts lasting 6-8 hours daily. This renders modern e-learning facilities, smart screens, and computer labs unusable, impacting basic educational delivery.',
      category: 'Renewable Energy',
      district: 'Gaya',
      state: 'Bihar',
      affectedPopulation: 3200,
      status: 'ANALYZED',
      priority: 'HIGH',
      submittedByEmail: 'sunita.devi@demo.in',
      ai: {
        category: 'Renewable Energy',
        priority: 'HIGH',
        priorityScore: 95,
        duplicateIds: [],
        requiredExpertise: ['Solar panel sizing', 'Inverter load calculation', 'LiFePO4 battery configuration'],
        matchingScore: 95,
        matchedInstitutions: ['univ-4'],
        matchedIndustries: ['ind-3'],
      }
    },
    {
      id: 'prob-5',
      title: 'High School Dropout Rates in Tribal Districts of Mayurbhanj',
      description: 'Language barriers and economic constraints lead to an elevated school dropout rate after grade 8 in tribal villages of Mayurbhanj. Innovative digital learning kits and localized vernacular educational content are needed.',
      category: 'Education & Social Impact',
      district: 'Mayurbhanj',
      state: 'Odisha',
      affectedPopulation: 1800,
      status: 'RESOLVED',
      priority: 'MEDIUM',
      submittedByEmail: 'gagan.mohanty@demo.in',
      ai: {
        category: 'Education & Social Impact',
        priority: 'MEDIUM',
        priorityScore: 84,
        duplicateIds: [],
        requiredExpertise: ['Curriculum design', 'Tribal dialect translation', 'Offline learning tablets'],
        matchingScore: 84,
        matchedInstitutions: ['univ-5'],
        matchedIndustries: ['ind-4'],
      }
    },
    {
      id: 'prob-6',
      title: 'Lack of Cold Storage for Small-Scale Fishermen in Alappuzha',
      description: 'Fishermen in Alappuzha lose up to 30% of their daily catch due to lack of immediate refrigeration. Commercial cold storage is expensive. A localized, low-cost solar-powered cold room is required at the landing center.',
      category: 'Agriculture & Food Tech',
      district: 'Alappuzha',
      state: 'Kerala',
      affectedPopulation: 2500,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      submittedByEmail: 'ankit.sharma@demo.in',
      ai: {
        category: 'Agriculture & Food Tech',
        priority: 'MEDIUM',
        priorityScore: 70,
        duplicateIds: [],
        requiredExpertise: ['Refrigeration cycles', 'Thermal insulation design', 'PV integration'],
        matchingScore: 70,
        matchedInstitutions: ['univ-4'],
        matchedIndustries: ['ind-3'],
      }
    },
    {
      id: 'prob-7',
      title: 'Severe Drinking Water Shortage in Village Alpha of Ranchi Rural',
      description: 'Residents of Village Alpha are facing a critical drinking water crisis this summer. The local borehole has run dry, and the tanker service is irregular.',
      category: 'Water & Sanitation',
      district: 'Ranchi',
      state: 'Jharkhand',
      affectedPopulation: 1200,
      status: 'SUBMITTED',
      priority: 'HIGH',
      submittedByEmail: 'suresh.mahto@demo.in',
      ai: {
        category: 'Water & Sanitation',
        priority: 'HIGH',
        priorityScore: 90,
        duplicateIds: ['prob-1', 'prob-8', 'prob-9'],
        requiredExpertise: ['Groundwater mapping', 'Gravity filtration'],
        matchingScore: 90,
        matchedInstitutions: ['univ-1'],
        matchedIndustries: ['ind-1'],
      }
    },
    {
      id: 'prob-8',
      title: 'Residents of Village Alpha Lack Reliable Water Source',
      description: 'There is no drinking water supply pipeline in Village Alpha. The community is forced to fetch water from a contaminated pond 2km away.',
      category: 'Water & Sanitation',
      district: 'Ranchi',
      state: 'Jharkhand',
      affectedPopulation: 1500,
      status: 'SUBMITTED',
      priority: 'HIGH',
      submittedByEmail: 'suresh.mahto@demo.in',
      ai: {
        category: 'Water & Sanitation',
        priority: 'HIGH',
        priorityScore: 89,
        duplicateIds: ['prob-1', 'prob-7', 'prob-9'],
        requiredExpertise: ['Groundwater mapping', 'Community water management'],
        matchingScore: 89,
        matchedInstitutions: ['univ-1'],
        matchedIndustries: ['ind-1'],
      }
    },
    {
      id: 'prob-9',
      title: 'Borewell Failure Causing Severe Water Shortage in Village Alpha',
      description: 'Both major community borewells in Village Alpha have suffered mechanical failure, leaving 200 families without access to safe drinking water.',
      category: 'Water & Sanitation',
      district: 'Ranchi',
      state: 'Jharkhand',
      affectedPopulation: 1000,
      status: 'SUBMITTED',
      priority: 'HIGH',
      submittedByEmail: 'suresh.mahto@demo.in',
      ai: {
        category: 'Water & Sanitation',
        priority: 'HIGH',
        priorityScore: 91,
        duplicateIds: ['prob-1', 'prob-7', 'prob-8'],
        requiredExpertise: ['Gravity filtration', 'Community water management'],
        matchingScore: 91,
        matchedInstitutions: ['univ-1'],
        matchedIndustries: ['ind-1'],
      }
    },
    {
      id: 'prob-10',
      title: 'Inadequate Cold Chain for Vaccines in Rural Gaya Health Centers',
      description: 'Due to power fluctuations, vaccine storage at rural primary health centers in Gaya is frequently compromised, affecting infant immunizations.',
      category: 'Healthcare & Sanitation',
      district: 'Gaya',
      state: 'Bihar',
      affectedPopulation: 8000,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      submittedByEmail: 'sunita.devi@demo.in',
      ai: {
        category: 'Healthcare & Sanitation',
        priority: 'HIGH',
        priorityScore: 94,
        duplicateIds: [],
        requiredExpertise: ['Solar panel sizing', 'Inverter load calculation'],
        matchingScore: 94,
        matchedInstitutions: ['univ-4'],
        matchedIndustries: ['ind-3'],
      }
    },
    {
      id: 'prob-11',
      title: 'Frequent Night Accidents on Coimbatore-Pollachi Rural Junction',
      description: 'Poor lighting and lack of reflective indicators on a critical blind curve on the Coimbatore-Pollachi rural road lead to over 15 serious accidents annually.',
      category: 'Infrastructure & Urban Development',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      affectedPopulation: 15000,
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      submittedByEmail: 'lakshmi.k@demo.in',
      ai: {
        category: 'Infrastructure & Urban Development',
        priority: 'HIGH',
        priorityScore: 82,
        duplicateIds: [],
        requiredExpertise: ['Traffic engineering', 'Reflective indicator layout'],
        matchingScore: 82,
        matchedInstitutions: ['univ-3'],
        matchedIndustries: ['ind-1'],
      }
    },
    {
      id: 'prob-12',
      title: 'High Fluoride Concentration in Drinking Water of Ranchi Blocks',
      description: 'Groundwater testing shows fluoride levels exceeding 3.0 mg/L in several Ranchi villages, causing skeletal and dental fluorosis among children.',
      category: 'Water & Sanitation',
      district: 'Ranchi',
      state: 'Jharkhand',
      affectedPopulation: 6000,
      status: 'ANALYZED',
      priority: 'HIGH',
      submittedByEmail: 'citizen@gov.in',
      ai: {
        category: 'Water & Sanitation',
        priority: 'HIGH',
        priorityScore: 93,
        duplicateIds: [],
        requiredExpertise: ['Fluoride mapping', 'Activated alumina filtration'],
        matchingScore: 93,
        matchedInstitutions: ['univ-1'],
        matchedIndustries: ['ind-1'],
      }
    },
    {
      id: 'prob-13',
      title: 'Alkaline Soil Degradation in Ludhiana Farming Cluster',
      description: 'Waterlogging and high water table have caused white salt encrustation on fertile wheat fields, reducing soil aeration and nutrient uptake.',
      category: 'Agriculture & Food Tech',
      district: 'Ludhiana',
      state: 'Punjab',
      affectedPopulation: 5000,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      submittedByEmail: 'baldev.singh@demo.in',
      ai: {
        category: 'Agriculture & Food Tech',
        priority: 'MEDIUM',
        priorityScore: 75,
        duplicateIds: ['prob-2'],
        requiredExpertise: ['Soil chemistry analysis', 'Salinity mapping'],
        matchingScore: 75,
        matchedInstitutions: ['univ-2'],
        matchedIndustries: ['ind-2'],
      }
    },
    {
      id: 'prob-14',
      title: 'Crop Residue Management and Stubble Burning in Sangrur',
      description: 'Lack of affordable stubble clearing machinery forces farmers in Sangrur to burn paddy straw, causing critical air quality drop and soil nutrient loss.',
      category: 'Waste Management',
      district: 'Sangrur',
      state: 'Punjab',
      affectedPopulation: 25000,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      submittedByEmail: 'baldev.singh@demo.in',
      ai: {
        category: 'Waste Management',
        priority: 'HIGH',
        priorityScore: 89,
        duplicateIds: [],
        requiredExpertise: ['Biomass conversion', 'Residue collection mechanics'],
        matchingScore: 89,
        matchedInstitutions: ['univ-2'],
        matchedIndustries: ['ind-2'],
      }
    },
    {
      id: 'prob-15',
      title: 'Inefficient Traditional Cardamom Drying Methods in Alappuzha',
      description: 'Smallholder cardamom growers rely on firewood-based cardamom curing which leads to uneven quality, high smoke pollution, and deforestation.',
      category: 'Renewable Energy',
      district: 'Alappuzha',
      state: 'Kerala',
      affectedPopulation: 1100,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      submittedByEmail: 'ankit.sharma@demo.in',
      ai: {
        category: 'Renewable Energy',
        priority: 'MEDIUM',
        priorityScore: 71,
        duplicateIds: [],
        requiredExpertise: ['Solar collector design', 'Temperature regulation'],
        matchingScore: 71,
        matchedInstitutions: ['univ-4'],
        matchedIndustries: ['ind-3'],
      }
    }
  ];

  for (const p of problemsData) {
    const user = citizens[p.submittedByEmail];
    await prisma.problem.create({
      data: {
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        district: p.district,
        state: p.state,
        affectedPopulation: p.affectedPopulation,
        status: p.status as any,
        priority: p.priority as any,
        submittedById: user.id,
        aiAnalysis: {
          create: {
            category: p.ai.category,
            priority: p.ai.priority,
            priorityScore: p.ai.priorityScore,
            duplicateIds: JSON.stringify(p.ai.duplicateIds),
            requiredExpertise: JSON.stringify(p.ai.requiredExpertise),
            matchingScore: p.ai.matchingScore,
            matchedInstitutions: JSON.stringify(p.ai.matchedInstitutions),
            matchedIndustries: JSON.stringify(p.ai.matchedIndustries),
            reviewStatus: 'APPROVED',
            reviewedByAdminId: adminUser.id,
          }
        }
      }
    });
  }

  // ─── 9. SEED ACTIVE PROJECTS & DETAILS ─────────────────────────────────────
  const projectsData = [
    {
      id: 'PB-2026-001',
      problemId: 'prob-1',
      universityUserEmail: 'univ@gov.in',
      industryUserEmail: 'industry@gov.in',
      status: 'IMPLEMENTATION',
      proposal: {
        title: 'Community-Led Water Security (Jal-Dhara)',
        description: 'Build low-cost gravity-fed sand filter systems and rain harvesting reservoirs managed by local village panchayats.',
        budget: 750000.00,
        timeline: '4 months',
        status: 'ACCEPTED',
      },
      team: {
        facultyMentorName: 'Dr. Ramesh Kumar (Environmental Science)',
        studentMembers: JSON.stringify(['Amit Sharma (MTech)', 'Pooja Patel (BTech)', 'Vikram Singh (PhD)']),
      },
      milestones: [
        { title: 'Problem Validation', description: 'Problem validated by administrative field surveyor.', status: 'Completed', offsetDays: -15 },
        { title: 'Team Formation', description: 'Research team registered and assigned to the project.', status: 'Completed', offsetDays: -10 },
        { title: 'Proposal Approved', description: 'Technical and budget proposal submitted and evaluated.', status: 'Completed', offsetDays: -5 },
        { title: 'Excavation & Placement', description: 'Excavation and filtration bed placement active at rural site.', status: 'Current', offsetDays: 15 },
      ]
    },
    {
      id: 'PB-2026-002',
      problemId: 'prob-2',
      universityUserEmail: 'univ-pau@gov.in',
      industryUserEmail: 'industry-iffco@gov.in',
      status: 'AWAITING_ADMIN_VERIFICATION',
      proposal: {
        title: 'Biotechnology for Soil Salinity Remediation',
        description: 'Deploy halophilic bio-fertilizers and salt-tolerant organic soil conditioners to restore soil microbiota.',
        budget: 600000.00,
        timeline: '6 months',
        status: 'ACCEPTED',
      },
      team: {
        facultyMentorName: 'Dr. Sanjay Dutt (Biotechnology)',
        studentMembers: JSON.stringify(['Nikhil Gupta (MSc)', 'Kriti Sen (BTech)']),
      },
      milestones: [
        { title: 'Design phase', description: 'Formulation of microbial conditioners.', status: 'Completed', offsetDays: -40 },
        { title: 'Field trial deployment', description: 'Application across 50 test plots in Sangrur.', status: 'Completed', offsetDays: -10 },
        { title: 'Impact survey', description: 'End-line salinity measurement and crop yield calculation.', status: 'Completed', offsetDays: -2 },
      ],
      impact: {
        metrics: JSON.stringify({ farmersSupported: 1200, villagesCovered: 5 }),
        description: 'Halophilic bio-fertilizers successfully applied across 50 test plots. Crop yield increased by 22% and soil salinity dropped by 40% in trial farming fields.',
      }
    },
    {
      id: 'PB-2026-003',
      problemId: 'prob-10',
      universityUserEmail: 'univ-nitp@gov.in',
      industryUserEmail: 'industry-renew@gov.in',
      status: 'IMPACT_ASSESSMENT',
      proposal: {
        title: 'Solar-Powered Cold Chain for Vaccine Preservation',
        description: 'Design and deploy off-grid solar refrigeration kits with backup storage at rural clinics.',
        budget: 950000.00,
        timeline: '5 months',
        status: 'ACCEPTED',
      },
      team: {
        facultyMentorName: 'Prof. Anjali Devi (Electrical Engineering)',
        studentMembers: JSON.stringify(['Rahul Mehta (BTech)', 'Sneha Roy (BTech)']),
      },
      milestones: [
        { title: 'Hardware design', description: 'Sizing solar panel array and LiFePO4 battery storage.', status: 'Completed', offsetDays: -30 },
        { title: 'Installation', description: 'Mounting panels and connecting smart charge controllers.', status: 'Completed', offsetDays: -12 },
        { title: 'Monitoring & Review', description: 'Measuring cooling temperature stability and voltage.', status: 'Current', offsetDays: 14 },
      ]
    },
    {
      id: 'PB-2026-004',
      problemId: 'prob-5',
      universityUserEmail: 'univ-utkal@gov.in',
      industryUserEmail: 'industry-vedanta@gov.in',
      status: 'COMPLETED',
      proposal: {
        title: 'Vernacular E-Learning Kits for Tribal Youth',
        description: 'Deploy offline digital classrooms and learning tablets mapped to localized vernacular pedagogy.',
        budget: 500000.00,
        timeline: '10 months',
        status: 'ACCEPTED',
      },
      team: {
        facultyMentorName: 'Dr. Priyadarshini Mohanty (Social Work & Education)',
        studentMembers: JSON.stringify(['Rashmi Naik (MA)', 'Alok Das (PhD)']),
      },
      milestones: [
        { title: 'Syllabus design', description: 'Translating tribal dialects and curriculum coding.', status: 'Completed', offsetDays: -90 },
        { title: 'Tablet distribution', description: 'Provisioning 150 offline learning tablets in Mayurbhanj.', status: 'Completed', offsetDays: -30 },
        { title: 'Completion review', description: 'Verification by District Collector Office.', status: 'Completed', offsetDays: -2 },
      ],
      impact: {
        metrics: JSON.stringify({ peopleBenefited: 1800, schoolsReached: 20 }),
        description: '150 offline learning tablets deployed across rural Mayurbhanj schools. Tribal high school dropout rates reduced by 25% over one academic year.',
      }
    },
    {
      id: 'PB-2026-005',
      problemId: 'prob-14',
      universityUserEmail: 'univ-pau@gov.in',
      industryUserEmail: 'industry-iffco@gov.in',
      status: 'IMPLEMENTATION',
      proposal: {
        title: 'Biomass Gasification for Crop Straw',
        description: 'Design community gasifiers to process straw into biochar, eliminating stubble burning.',
        budget: 820000.00,
        timeline: '6 months',
        status: 'ACCEPTED',
      },
      team: {
        facultyMentorName: 'Dr. Gurbaksh Singh (Renewable Energy Systems)',
        studentMembers: JSON.stringify(['Balpreet Kaur (MTech)', 'Gurmeet Singh (BTech)']),
      },
      milestones: [
        { title: 'Gasifier specs', description: 'Thermal design and draft approvals.', status: 'Completed', offsetDays: -15 },
        { title: 'Fabrication', description: 'Metal works and gas flow validation.', status: 'Current', offsetDays: 20 },
      ]
    }
  ];

  for (const proj of projectsData) {
    const univ = universityUsers[proj.universityUserEmail];
    const ind = proj.industryUserEmail ? industryUsers[proj.industryUserEmail] : null;

    const createdProj = await prisma.project.create({
      data: {
        id: proj.id,
        problemId: proj.problemId,
        universityId: univ.id,
        industryId: ind ? ind.id : null,
        status: proj.status,
      }
    });

    // Seed proposal
    await prisma.proposal.create({
      data: {
        projectId: createdProj.id,
        title: proj.proposal.title,
        description: proj.proposal.description,
        budget: proj.proposal.budget,
        timeline: proj.proposal.timeline,
        status: proj.proposal.status,
      }
    });

    // Seed team
    await prisma.team.create({
      data: {
        projectId: createdProj.id,
        facultyMentorName: proj.team.facultyMentorName,
        studentMembers: proj.team.studentMembers,
      }
    });

    // Seed milestones
    const today = new Date();
    for (const m of proj.milestones) {
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + m.offsetDays);
      await prisma.milestone.create({
        data: {
          projectId: createdProj.id,
          title: m.title,
          description: m.description,
          dueDate,
          status: m.status,
        }
      });
    }

    // Seed impact report if completed / awaiting validation
    if (proj.impact) {
      await prisma.impactReport.create({
        data: {
          projectId: createdProj.id,
          metrics: proj.impact.metrics,
          description: proj.impact.description,
        }
      });
    }

    // Seed comment logs for storyline realism
    await prisma.comment.create({
      data: {
        projectId: createdProj.id,
        content: `MOU drafted and initial project guidelines shared. Seeking CSR matching coordination.`,
        senderId: univ.id,
        senderName: univ.name,
        senderRole: 'UNIVERSITY',
      }
    });

    if (ind) {
      await prisma.comment.create({
        data: {
          projectId: createdProj.id,
          content: `Tata Steel CSR approves partnership support for this project. Funding allocated.`,
          senderId: ind.id,
          senderName: ind.name,
          senderRole: 'INDUSTRY',
        }
      });
    }
  }

  console.log('✅ Comprehensive database seed complete!');
  console.log('\n  Demo Accounts:');
  console.log('  Admin      → admin@gov.in (password123)');
  console.log('  University → univ@gov.in (password123)');
  console.log('  Industry   → industry@gov.in (password123)');
  console.log('  Citizen    → citizen@gov.in (password123)');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
