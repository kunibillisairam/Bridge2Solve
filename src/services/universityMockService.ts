"use client";

export interface CommunityProblem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  state: string;
  district: string;
  affectedPopulation: string;
  priority: "High" | "Medium" | "Low";
  matchScore: number;
  status: "Unassigned" | "Interested" | "Under Review" | "Active Project";
  departments: string[];
  researchAreas: string[];
  requiredExpertise: string[];
  disciplines: string[];
  submissionDate: string;
}

export interface UniversityTeam {
  id: string;
  name: string;
  facultyMentor: string;
  studentMembers: string[];
  requiredSkills: string[];
  assignedProblemId: string | null;
  assignedProblemTitle: string | null;
  status: "Available" | "Active";
}

export interface SolutionProposal {
  id: string;
  title: string;
  problemId: string;
  problemTitle: string;
  teamId: string;
  teamName: string;
  problemUnderstanding: string;
  proposedSolution: string;
  technologyApproach: string;
  expectedImpact: string;
  requiredResources: string;
  timeline: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  submittedDate: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
}

export interface ProjectMilestone {
  name: string;
  status: "Completed" | "Current" | "Pending";
  date?: string;
  description: string;
}

export interface ProjectCollaboration {
  university: string;
  industryPartner: string;
  governmentAuthority: string;
  agreementStatus: string;
  agreementType: string;
  startDate: string;
  endDate: string;
  funding: string;
  coordinator: string;
}

export interface ProjectDocument {
  name: string;
  type: string;
  status: string;
  size?: string;
}

export interface ProjectActivityLog {
  date: string;
  text: string;
  type: string;
}

export interface UniversityProject {
  id: string;
  title: string;
  originalProblem: {
    title: string;
    description: string;
    category: string;
    district: string;
    state: string;
    dateReported: string;
    reporter: string;
    affectedPopulation: string;
    severity: string;
    validationStatus: string;
  };
  assignedTeam: {
    name: string;
    facultyMentor: string;
    members: Array<{ name: string; degree: string }>;
    departments: string[];
    skills: string[];
  };
  facultyMentor: string;
  status: "UNDER_REVIEW" | "ACTIVE" | "COMPLETED" | "PENDING_ACTION";
  progress: number;
  startDate: string;
  expectedCompletionDate: string;
  lifecycleStage: string;
  milestones: ProjectMilestone[];
  collaboration: ProjectCollaboration;
  documents: ProjectDocument[];
  activities: ProjectActivityLog[];
}

// Initial Demo Data
const INITIAL_PROBLEMS: CommunityProblem[] = [
  {
    id: "prob-1",
    title: "Water Scarcity in Rural Communities",
    description: "During the dry season, ground water levels drop severely in Ranchi rural blocks. Local residents, mostly women and children, walk over 3km daily to fetch drinking water. Contamination in secondary wells is also a major health risk.",
    category: "Water & Sanitation",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    affectedPopulation: "4,500 people",
    priority: "High",
    matchScore: 92,
    status: "Unassigned",
    departments: ["Environmental Science", "Civil Engineering"],
    researchAreas: ["Rainwater Harvesting", "Slow Sand Filtration", "Hydrogeology"],
    requiredExpertise: ["Groundwater mapping", "Gravity filtration", "Community water management"],
    disciplines: ["Civil Engineering", "Hydrogeology", "Environmental Studies"],
    submissionDate: "2026-08-01",
  },
  {
    id: "prob-2",
    title: "Crop Yield Reduction due to Soil Salinity",
    description: "Excessive chemical fertilizer usage and poor irrigation drainage have led to critical soil salinity in the Sangrur district. Crop productivity has dropped by 40% over the last three seasons, impacting farmer livelihoods.",
    category: "Agriculture & Food Tech",
    location: "Sangrur, Punjab",
    state: "Punjab",
    district: "Sangrur",
    affectedPopulation: "12,000 farmers",
    priority: "High",
    matchScore: 88,
    status: "Unassigned",
    departments: ["Agricultural Science", "Biotechnology"],
    researchAreas: ["Soil Bioremediation", "Salt-Tolerant Crops", "Organic Inputs"],
    requiredExpertise: ["Soil chemistry analysis", "Halophilic microbes", "Sustainable farming outreach"],
    disciplines: ["Agricultural Science", "Biotechnology", "Microbiology"],
    submissionDate: "2026-08-05",
  },
  {
    id: "prob-3",
    title: "Inadequate Municipal Waste Sorting at Source",
    description: "Municipal waste is collected mixed, causing landfills to overflow and environmental degradation. The local municipality in Pune seeks automated or smart solutions to encourage source-sorting or automate high-throughput sorting.",
    category: "Waste Management",
    location: "Pune, Maharashtra",
    state: "Maharashtra",
    district: "Pune",
    affectedPopulation: "85,000 residents",
    priority: "Medium",
    matchScore: 78,
    status: "Unassigned",
    departments: ["Mechanical Engineering", "Computer Science"],
    researchAreas: ["Computer Vision Sorting", "Recycling Automation", "Urban Logistics"],
    requiredExpertise: ["Object detection (YOLO)", "Conveyor belt mechanics", "Routing optimization"],
    disciplines: ["Computer Science", "Mechanical Engineering", "Industrial Design"],
    submissionDate: "2026-08-12",
  },
  {
    id: "prob-4",
    title: "Intermittent Electricity in Primary Schools",
    description: "Over 20 schools in rural Gaya experience frequent power cuts lasting 6-8 hours daily. This renders modern e-learning facilities, smart screens, and computer labs unusable, impacting basic educational delivery.",
    category: "Renewable Energy",
    location: "Gaya, Bihar",
    state: "Bihar",
    district: "Gaya",
    affectedPopulation: "3,200 students",
    priority: "High",
    matchScore: 95,
    status: "Interested",
    departments: ["Electrical Engineering", "Renewable Energy Systems"],
    researchAreas: ["Solar Photovoltaics", "Battery Storage Systems", "Microgrids"],
    requiredExpertise: ["Solar panel sizing", "Inverter load calculation", "LiFePO4 battery configuration"],
    disciplines: ["Electrical Engineering", "Energy Engineering"],
    submissionDate: "2026-07-28",
  },
  {
    id: "prob-5",
    title: "High School Dropout Rates in Tribal Districts",
    description: "Language barriers and economic constraints lead to an elevated school dropout rate after grade 8 in tribal villages of Mayurbhanj. Innovative digital learning kits and localized vernacular educational content are needed.",
    category: "Education & Social Impact",
    location: "Mayurbhanj, Odisha",
    state: "Odisha",
    district: "Mayurbhanj",
    affectedPopulation: "1,800 youth annually",
    priority: "Medium",
    matchScore: 84,
    status: "Active Project",
    departments: ["Social Work", "Psychology", "Education"],
    researchAreas: ["Vernacular Pedagogy", "Community Learning Hubs", "E-learning Accessibility"],
    requiredExpertise: ["Curriculum design", "Tribal dialect translation", "Offline learning tablets"],
    disciplines: ["Education", "Social Work", "Development Studies"],
    submissionDate: "2026-08-10",
  },
  {
    id: "prob-6",
    title: "Lack of Cold Storage for Small-Scale Fishermen",
    description: "Fishermen in Alappuzha lose up to 30% of their daily catch due to lack of immediate refrigeration. Commercial cold storage is expensive. A localized, low-cost solar-powered cold room is required at the landing center.",
    category: "Agriculture & Food Tech",
    location: "Alappuzha, Kerala",
    state: "Kerala",
    district: "Alappuzha",
    affectedPopulation: "2,500 fishermen",
    priority: "Medium",
    matchScore: 70,
    status: "Unassigned",
    departments: ["Mechanical Engineering", "Energy Studies"],
    researchAreas: ["Thermal Refrigeration", "Phase Change Materials", "Solar Cooling"],
    requiredExpertise: ["Refrigeration cycles", "Thermal insulation design", "PV integration"],
    disciplines: ["Mechanical Engineering", "Thermal Engineering"],
    submissionDate: "2026-08-15",
  },
];

const INITIAL_TEAMS: UniversityTeam[] = [
  {
    id: "team-1",
    name: "Team Jal-Dhara",
    facultyMentor: "Dr. Ramesh Kumar (Environmental Science)",
    studentMembers: ["Amit Sharma (MTech)", "Pooja Patel (BTech)", "Vikram Singh (PhD)"],
    requiredSkills: ["Groundwater hydrology", "Water filtration systems", "Piping design"],
    assignedProblemId: "prob-1",
    assignedProblemTitle: "Water Scarcity in Rural Communities",
    status: "Active",
  },
  {
    id: "team-2",
    name: "SolarEdu Scholars",
    facultyMentor: "Prof. Anjali Devi (Electrical Engineering)",
    studentMembers: ["Rahul Mehta (BTech)", "Sneha Roy (BTech)"],
    requiredSkills: ["Solar microgrid design", "Battery management", "Load analysis"],
    assignedProblemId: "prob-4",
    assignedProblemTitle: "Intermittent Electricity in Primary Schools",
    status: "Active",
  },
  {
    id: "team-3",
    name: "Soil Remediation Taskforce",
    facultyMentor: "Dr. Sanjay Dutt (Biotechnology)",
    studentMembers: ["Nikhil Gupta (MSc)", "Kriti Sen (BTech)"],
    requiredSkills: ["Bio-remediation", "Soil chemical analysis", "Microbial culture"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
  },
];

const INITIAL_PROPOSALS: SolutionProposal[] = [
  {
    id: "prop-1",
    title: "Solar Powering Rural Primary Schools",
    problemId: "prob-4",
    problemTitle: "Intermittent Electricity in Primary Schools",
    teamId: "team-2",
    teamName: "SolarEdu Scholars",
    problemUnderstanding: "Primary schools in Gaya suffer from 6-8 hours of daily power outages, disrupting educational activities and preventing the use of computers.",
    proposedSolution: "Install 3kW rooftop solar PV systems with lithium-iron-phosphate battery backup to ensure uninterruptible power for classrooms and labs.",
    technologyApproach: "Monocrystalline solar panels, MPPT charge controllers, LiFePO4 batteries.",
    expectedImpact: "Uninterrupted education for over 3,000 students, enabling digital classrooms.",
    requiredResources: "Solar panels, inverter, battery bank, mounting structures, electrical installation team.",
    timeline: "3 months",
    status: "SUBMITTED",
    submittedDate: "2026-08-15",
  },
  {
    id: "prop-2",
    title: "Biotechnology for Soil Salinity Remediation",
    problemId: "prob-2",
    problemTitle: "Crop Yield Reduction due to Soil Salinity",
    teamId: "team-3",
    teamName: "Soil Remediation Taskforce",
    problemUnderstanding: "Soil salinity has reduced wheat yields in Sangrur by 40%.",
    proposedSolution: "Deploy halophilic bio-fertilizers and salt-tolerant organic soil conditioners to restore soil microbiota.",
    technologyApproach: "Halophilic microbial consortia, organic compost formulations.",
    expectedImpact: "Increase crop yield by 20% in the first season, reduce reliance on chemical inputs.",
    requiredResources: "Microbial strains, lab cultivation equipment, field trial materials.",
    timeline: "6 months",
    status: "DRAFT",
    submittedDate: "2026-08-25",
  },
  {
    id: "prop-3",
    title: "Community-Led Water Security (Jal-Dhara)",
    problemId: "prob-1",
    problemTitle: "Water Scarcity in Rural Communities",
    teamId: "team-1",
    teamName: "Team Jal-Dhara",
    problemUnderstanding: "Rural areas in Ranchi experience severe dry seasons with dry wells, forcing long travel for drinking water.",
    proposedSolution: "Build low-cost gravity-fed sand filter systems and rain harvesting reservoirs managed by local village panchayats.",
    technologyApproach: "Slow sand filtration, rainwater harvesting tanks, IoT level sensors.",
    expectedImpact: "Safe year-round drinking water for 4,500 people, reducing waterborne diseases.",
    requiredResources: "Filtration media, storage tanks, local construction labor.",
    timeline: "4 months",
    status: "ACCEPTED",
    submittedDate: "2026-08-10",
  },
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: "act-1",
    text: "Soil Salinity in Sangrur matched with Biotechnology Department",
    timestamp: "2 hours ago",
  },
  {
    id: "act-2",
    text: "Community-Led Water Security (Jal-Dhara) status changed to ACCEPTED",
    timestamp: "1 day ago",
  },
  {
    id: "act-3",
    text: "Soil Remediation Taskforce successfully registered under Dr. Sanjay Dutt",
    timestamp: "2 days ago",
  },
  {
    id: "act-4",
    text: "Solar Powering Rural Primary Schools submitted for evaluation",
    timestamp: "3 days ago",
  },
];

const INITIAL_PROJECTS: UniversityProject[] = [
  {
    id: "PB-2026-001",
    title: "Water Scarcity in Rural Communities",
    originalProblem: {
      title: "Water Scarcity in Rural Communities",
      description: "During the dry season, ground water levels drop severely in Ranchi rural blocks. Local residents, mostly women and children, walk over 3km daily to fetch drinking water. Contamination in secondary wells is also a major health risk.",
      category: "Water & Sanitation",
      district: "Ranchi",
      state: "Jharkhand",
      dateReported: "2026-08-01",
      reporter: "Suresh Mahto (Citizen)",
      affectedPopulation: "4,500 people",
      severity: "Critical",
      validationStatus: "VERIFIED",
    },
    assignedTeam: {
      name: "Team Jal-Dhara",
      facultyMentor: "Dr. Ramesh Kumar",
      members: [
        { name: "Amit Sharma", degree: "M.Tech" },
        { name: "Pooja Patel", degree: "B.Tech" },
        { name: "Vikram Singh", degree: "PhD" },
      ],
      departments: ["Environmental Science", "Civil Engineering"],
      skills: ["Groundwater Hydrology", "Water Filtration", "Piping Design", "Environmental Engineering"],
    },
    facultyMentor: "Dr. Ramesh Kumar",
    status: "ACTIVE",
    progress: 72,
    startDate: "12 August 2026",
    expectedCompletionDate: "30 November 2026",
    lifecycleStage: "Implementation",
    milestones: [
      { name: "Problem Validation", status: "Completed", date: "12 Aug 2026", description: "Problem validated by administrative field surveyor." },
      { name: "Team Formation", status: "Completed", date: "15 Aug 2026", description: "Team Jal-Dhara registered and assigned to the project." },
      { name: "Proposal", status: "Completed", date: "18 Aug 2026", description: "Technical and budget proposal approved by CSR sponsor." },
      { name: "Prototype Design", status: "Completed", date: "25 Aug 2026", description: "Gravity-fed sand filtration unit prototype verified in lab." },
      { name: "Field Testing", status: "Current", date: "26 Aug 2026", description: "Excavation and filtration bed placement active at rural site." },
      { name: "Pilot Deployment", status: "Pending", description: "Installation of public filtration nodes and clean-water taps." },
      { name: "Impact Assessment", status: "Pending", description: "Measurement of water safety indicators and public health tracking." },
      { name: "Final Completion", status: "Pending", description: "Formal project sign-off and transfer of operations to local panchayat." },
    ],
    collaboration: {
      university: "Ranchi Technical Institute",
      industryPartner: "Tata Steel CSR Division",
      governmentAuthority: "Jharkhand Water Supply & Sanitation Dept",
      agreementStatus: "Signed & Active",
      agreementType: "Tripartite MoU",
      startDate: "12 August 2026",
      endDate: "30 November 2026",
      funding: "₹7,50,000",
      coordinator: "Prof. S. K. Mahapatra",
    },
    documents: [
      { name: "Collaboration Agreement", type: "PDF", status: "Approved", size: "2.4 MB" },
      { name: "Project Proposal", type: "PDF", status: "Approved", size: "1.8 MB" },
      { name: "Funding Approval", type: "PDF", status: "Processed", size: "1.1 MB" },
      { name: "Technical Specification", type: "DOCX", status: "Signed", size: "4.5 MB" },
      { name: "Testing Report", type: "PDF", status: "Draft", size: "850 KB" },
    ],
    activities: [
      { date: "26 Aug 2026", text: "Field testing started at Ranchi rural site", type: "milestone" },
      { date: "25 Aug 2026", text: "Lab prototype of sand filter successfully verified", type: "testing" },
      { date: "18 Aug 2026", text: "Project proposal formally approved by CSR division", type: "proposal" },
      { date: "15 Aug 2026", text: "Team Jal-Dhara formally assigned to target challenge", type: "team" },
      { date: "12 Aug 2026", text: "Tripartite MoU signed with Tata CSR and Jharkhand Water Dept", type: "agreement" },
    ],
  },
  {
    id: "PB-2026-002",
    title: "Solar Powering Rural Primary Schools",
    originalProblem: {
      title: "Intermittent Electricity in Primary Schools",
      description: "Over 20 schools in rural Gaya experience frequent power cuts lasting 6-8 hours daily. This renders modern e-learning facilities, smart screens, and computer labs unusable, impacting basic educational delivery.",
      category: "Renewable Energy",
      district: "Gaya",
      state: "Bihar",
      dateReported: "2026-07-28",
      reporter: "Sunita Kumari (School Principal)",
      affectedPopulation: "3,200 students",
      severity: "High",
      validationStatus: "VERIFIED",
    },
    assignedTeam: {
      name: "SolarEdu Scholars",
      facultyMentor: "Prof. Anjali Devi",
      members: [
        { name: "Rahul Mehta", degree: "B.Tech" },
        { name: "Sneha Roy", degree: "B.Tech" },
      ],
      departments: ["Electrical Engineering", "Renewable Energy Systems"],
      skills: ["Solar microgrid design", "Battery management", "Load analysis"],
    },
    facultyMentor: "Prof. Anjali Devi",
    status: "UNDER_REVIEW",
    progress: 35,
    startDate: "20 August 2026",
    expectedCompletionDate: "15 January 2027",
    lifecycleStage: "Proposal Submitted",
    milestones: [
      { name: "Problem Validation", status: "Completed", date: "20 Aug 2026", description: "Problem validated by block education officer." },
      { name: "Team Formation", status: "Completed", date: "22 Aug 2026", description: "SolarEdu Scholars team registered and assigned." },
      { name: "Proposal", status: "Current", date: "24 Aug 2026", description: "Technical proposal for solar PV mini-grids submitted for review." },
      { name: "Prototype Design", status: "Pending", description: "Circuit modeling and solar layout blueprints." },
      { name: "Field Testing", status: "Pending", description: "Rooftop structure load assessments and sun tracking trials." },
      { name: "Pilot Deployment", status: "Pending", description: "Installation of solar array, battery bank, and smart metering." },
      { name: "Impact Assessment", status: "Pending", description: "Monitoring uninterrupted classroom hours and tech device uptime." },
      { name: "Final Completion", status: "Pending", description: "Project sign-off and handing grid controls to school administration." },
    ],
    collaboration: {
      university: "Gaya Technical Academy",
      industryPartner: "ReNew Power Ltd",
      governmentAuthority: "Bihar Education Department",
      agreementStatus: "Under Draft Review",
      agreementType: "Research Collaboration Agreement",
      startDate: "Pending Approval",
      endDate: "Pending Approval",
      funding: "₹4,20,000 (Requested)",
      coordinator: "Prof. Anjali Devi",
    },
    documents: [
      { name: "Project Proposal", type: "PDF", status: "Under Review", size: "3.2 MB" },
      { name: "Technical Specification", type: "PDF", status: "Draft", size: "2.1 MB" },
    ],
    activities: [
      { date: "24 Aug 2026", text: "Technical proposal uploaded for review", type: "proposal" },
      { date: "23 Aug 2026", text: "Rooftop load and solar exposure survey completed", type: "survey" },
      { date: "22 Aug 2026", text: "SolarEdu Scholars team formed and assigned to school project", type: "team" },
    ],
  },
  {
    id: "PB-2026-003",
    title: "Soil Salinity Bioremediation",
    originalProblem: {
      title: "Crop Yield Reduction due to Soil Salinity",
      description: "Excessive chemical fertilizer usage and poor irrigation drainage have led to critical soil salinity in the Sangrur district. Crop productivity has dropped by 40% over the last three seasons, impacting farmer livelihoods.",
      category: "Agriculture & Food Tech",
      district: "Sangrur",
      state: "Punjab",
      dateReported: "2026-08-05",
      reporter: "Harpreet Singh (Farmer)",
      affectedPopulation: "12,000 farmers",
      severity: "Critical",
      validationStatus: "VERIFIED",
    },
    assignedTeam: {
      name: "Soil Remediation Taskforce",
      facultyMentor: "Dr. Sanjay Dutt",
      members: [
        { name: "Nikhil Gupta", degree: "M.Sc" },
        { name: "Kriti Sen", degree: "B.Tech" },
      ],
      departments: ["Agricultural Science", "Biotechnology"],
      skills: ["Bio-remediation", "Soil chemical analysis", "Microbial culture"],
    },
    facultyMentor: "Dr. Sanjay Dutt",
    status: "PENDING_ACTION",
    progress: 15,
    startDate: "25 August 2026",
    expectedCompletionDate: "30 March 2027",
    lifecycleStage: "University Matched",
    milestones: [
      { name: "Problem Validation", status: "Completed", date: "25 Aug 2026", description: "Soil salinity verified by block agricultural officer." },
      { name: "Team Formation", status: "Current", date: "26 Aug 2026", description: "Finalizing research assistant appointments." },
      { name: "Proposal", status: "Pending", description: "Drafting bio-fertilizer field testing protocol." },
      { name: "Prototype Design", status: "Pending", description: "Inoculating halophilic microbial culture in lab." },
      { name: "Field Testing", status: "Pending", description: "First-round soil treatment testing on local plot." },
      { name: "Pilot Deployment", status: "Pending", description: "Distributing bio-fertilizers to cooperative farms." },
      { name: "Impact Assessment", status: "Pending", description: "Comparing crop growth yields against chemical controls." },
      { name: "Final Completion", status: "Pending", description: "Project sign-off and soil health report publication." },
    ],
    collaboration: {
      university: "Punjab Agri University",
      industryPartner: "IFFCO CSR",
      governmentAuthority: "Punjab Soil Conservation Department",
      agreementStatus: "Initial Dialogue",
      agreementType: "Joint Agri-Research MoU",
      startDate: "Pending MoU",
      endDate: "Pending MoU",
      funding: "₹12,00,000 (Target)",
      coordinator: "Dr. Sanjay Dutt",
    },
    documents: [
      { name: "Initial Research Brief", type: "PDF", status: "Draft", size: "1.2 MB" },
    ],
    activities: [
      { date: "26 Aug 2026", text: "Initial meeting with Punjab Soil Dept representatives", type: "meeting" },
      { date: "25 Aug 2026", text: "University match registered for Sangrur district salinity challenge", type: "match" },
    ],
  },
  {
    id: "PB-2026-004",
    title: "Vernacular E-Learning Kits",
    originalProblem: {
      title: "High School Dropout Rates in Tribal Districts",
      description: "Language barriers and economic constraints lead to an elevated school dropout rate after grade 8 in tribal villages of Mayurbhanj. Innovative digital learning kits and localized vernacular educational content are needed.",
      category: "Education & Social Impact",
      district: "Mayurbhanj",
      state: "Odisha",
      dateReported: "2025-08-10",
      reporter: "Local NGO Director",
      affectedPopulation: "1,800 youth annually",
      severity: "High",
      validationStatus: "VERIFIED",
    },
    assignedTeam: {
      name: "Tribal Education Hub",
      facultyMentor: "Dr. Priyadarshini Mohanty",
      members: [
        { name: "Rashmi Naik", degree: "M.A" },
        { name: "Alok Das", degree: "PhD" },
      ],
      departments: ["Social Work", "Education"],
      skills: ["Vernacular Pedagogy", "Community Outreach", "E-learning tablet configuration"],
    },
    facultyMentor: "Dr. Priyadarshini Mohanty",
    status: "COMPLETED",
    progress: 100,
    startDate: "01 September 2025",
    expectedCompletionDate: "30 June 2026",
    lifecycleStage: "Completed",
    milestones: [
      { name: "Problem Validation", status: "Completed", date: "01 Sep 2025", description: "Problem validated by Mayurbhanj district educational officers." },
      { name: "Team Formation", status: "Completed", date: "05 Sep 2025", description: "Team Tribal Education Hub registered." },
      { name: "Proposal", status: "Completed", date: "15 Sep 2025", description: "Funding proposal for 150 offline learning tablets approved." },
      { name: "Prototype Design", status: "Completed", date: "30 Nov 2025", description: "Vernacular content and offline system design finalized." },
      { name: "Field Testing", status: "Completed", date: "28 Feb 2026", description: "Tested kits in three pilot schools with positive feedback." },
      { name: "Pilot Deployment", status: "Completed", date: "30 Apr 2026", description: "Distributed 150 learning tablets to tribal blocks." },
      { name: "Impact Assessment", status: "Completed", date: "15 Jun 2026", description: "Assessed student engagement and noted 25% drop in dropout rates." },
      { name: "Final Completion", status: "Completed", date: "30 Jun 2026", description: "Official project handover completed successfully." },
    ],
    collaboration: {
      university: "Odisha State University",
      industryPartner: "Vedanta Foundation CSR",
      governmentAuthority: "Mayurbhanj District Education Office",
      agreementStatus: "Completed & Closed",
      agreementType: "Corporate-Academic Partnership",
      startDate: "01 September 2025",
      endDate: "30 June 2026",
      funding: "₹5,00,000",
      coordinator: "Dr. Priyadarshini Mohanty",
    },
    documents: [
      { name: "MOU Agreement", type: "PDF", status: "Signed", size: "2.8 MB" },
      { name: "Project Proposal", type: "PDF", status: "Approved", size: "1.9 MB" },
      { name: "Final Impact Report", type: "PDF", status: "Submitted", size: "5.2 MB" },
      { name: "Completion Certificate", type: "PDF", status: "Issued", size: "850 KB" },
    ],
    activities: [
      { date: "30 Jun 2026", text: "Final completion certificate issued by District Collector Office", type: "completion" },
      { date: "15 Jun 2026", text: "End-line impact assessment survey completed and compiled", type: "survey" },
      { date: "30 Apr 2026", text: "150 offline learning tablets deployed in Mayurbhanj schools", type: "deployment" },
      { date: "28 Feb 2026", text: "First field testing report uploaded with positive feedback", type: "testing" },
    ],
  },
];

// Helper to check environment
const isClient = typeof window !== "undefined";

// Safe Storage Wrappers
function getStoredData<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key ${key} to localStorage:`, error);
  }
}

export const universityMockService = {
  // Problems API
  getProblems(): CommunityProblem[] {
    return getStoredData<CommunityProblem[]>("uni_problems", INITIAL_PROBLEMS);
  },

  getProblemById(id: string): CommunityProblem | undefined {
    return this.getProblems().find((p) => p.id === id);
  },

  expressInterest(id: string): void {
    const problems = this.getProblems();
    const index = problems.findIndex((p) => p.id === id);
    if (index !== -1) {
      if (problems[index].status === "Unassigned") {
        problems[index].status = "Interested";
        setStoredData("uni_problems", problems);

        // Add activity log
        this.addActivity(`Expressed interest in problem: "${problems[index].title}"`);
      }
    }
  },

  // Teams API
  getTeams(): UniversityTeam[] {
    return getStoredData<UniversityTeam[]>("uni_teams", INITIAL_TEAMS);
  },

  createTeam(teamData: Omit<UniversityTeam, "id" | "status" | "assignedProblemId" | "assignedProblemTitle">): UniversityTeam {
    const teams = this.getTeams();
    const newTeam: UniversityTeam = {
      ...teamData,
      id: `team-${Date.now()}`,
      assignedProblemId: null,
      assignedProblemTitle: null,
      status: "Available",
    };
    teams.push(newTeam);
    setStoredData("uni_teams", teams);

    this.addActivity(`Team "${newTeam.name}" successfully created under ${newTeam.facultyMentor}`);
    return newTeam;
  },

  addTeamMember(teamId: string, memberName: string): void {
    const teams = this.getTeams();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index !== -1) {
      teams[index].studentMembers.push(memberName);
      setStoredData("uni_teams", teams);
      this.addActivity(`Added member "${memberName}" to Team "${teams[index].name}"`);
    }
  },

  assignProblemToTeam(teamId: string, problemId: string): void {
    const teams = this.getTeams();
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    
    const problems = this.getProblems();
    const probIndex = problems.findIndex((p) => p.id === problemId);

    if (teamIndex !== -1 && probIndex !== -1) {
      teams[teamIndex].assignedProblemId = problemId;
      teams[teamIndex].assignedProblemTitle = problems[probIndex].title;
      teams[teamIndex].status = "Active";
      setStoredData("uni_teams", teams);

      problems[probIndex].status = "Active Project";
      setStoredData("uni_problems", problems);

      this.addActivity(`Assigned problem "${problems[probIndex].title}" to Team "${teams[teamIndex].name}"`);
    }
  },

  // Proposals API
  getProposals(): SolutionProposal[] {
    return getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
  },

  createProposal(
    proposalData: Omit<SolutionProposal, "id" | "submittedDate">
  ): SolutionProposal {
    const proposals = this.getProposals();
    const newProposal: SolutionProposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      submittedDate: new Date().toISOString().split("T")[0],
    };
    proposals.push(newProposal);
    setStoredData("uni_proposals", proposals);

    if (newProposal.status === "SUBMITTED") {
      this.addActivity(`Proposal "${newProposal.title}" submitted for review.`);
      
      // Update problem status if not already active
      const problems = this.getProblems();
      const probIndex = problems.findIndex((p) => p.id === newProposal.problemId);
      if (probIndex !== -1 && problems[probIndex].status !== "Active Project") {
        problems[probIndex].status = "Under Review";
        setStoredData("uni_problems", problems);
      }
    } else {
      this.addActivity(`Proposal draft "${newProposal.title}" saved.`);
    }

    return newProposal;
  },

  // Activity Logs API
  getActivities(): ActivityLog[] {
    return getStoredData<ActivityLog[]>("uni_activities", INITIAL_ACTIVITIES);
  },

  addActivity(text: string): void {
    const activities = this.getActivities();
    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      text,
      timestamp: "Just now",
    };
    // Keep only last 10 activities
    activities.unshift(newActivity);
    setStoredData("uni_activities", activities.slice(0, 10));
  },

  // Projects API
  getProjects(): UniversityProject[] {
    return getStoredData<UniversityProject[]>("uni_projects", INITIAL_PROJECTS);
  },

  getProjectById(id: string): UniversityProject | undefined {
    return this.getProjects().find((p) => p.id === id);
  },
};
