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

// ----------------------------------------------------
// Solution Proposal State Model (Normalized)
// ----------------------------------------------------
export type ProposalStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";

export interface SolutionProposal {
  id: string;
  title: string;
  problemId: string;
  teamId: string;
  universityId: string;
  problemUnderstanding: string;
  proposedApproach: string;
  expectedImpact: string;
  resourceRequirements: string;
  timeline?: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

// Resolved Proposal for UI display
export interface ResolvedProposal extends SolutionProposal {
  problem: CommunityProblem | null;
  team: UniversityTeam | null;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
}

// ----------------------------------------------------
// Problem Interest State Model
// ----------------------------------------------------
export type InterestStatus = "INTERESTED" | "WITHDRAWN" | "ASSIGNED" | "COMPLETED";

export interface ProblemInterest {
  id: string;
  problemId: string;
  universityId: string;
  universityName: string;
  status: InterestStatus;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// Project Stage State Model (Source of Truth)
// ----------------------------------------------------
export type ProjectStage = 
  | "PROBLEM_REPORTED"
  | "VALIDATED"
  | "UNIVERSITY_MATCHED"
  | "TEAM_FORMED"
  | "PROPOSAL_SUBMITTED"
  | "PROPOSAL_APPROVED"
  | "IMPLEMENTATION"
  | "IMPACT_ASSESSMENT"
  | "COMPLETED";

export interface ProjectMilestone {
  name: string;
  status: "Completed" | "Current" | "Upcoming";
  date?: string;
  description: string;
  dueDate?: string;
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
  uploadedDate: string;
}

export interface ProjectActivityLog {
  text: string;
  performedBy: string;
  date: string;
  time: string;
  type: string;
}

// Stored Project Structure (Normalized Database-style)
export interface UniversityProject {
  id: string;
  title: string;
  problemId: string;
  teamId: string | null;
  stage: ProjectStage;
  customProgress?: number;
  startDate: string;
  expectedCompletionDate: string;
  collaboration: ProjectCollaboration;
  documents: ProjectDocument[];
  activities: ProjectActivityLog[];
}

// Resolved project for UI display
export interface ResolvedProject extends UniversityProject {
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
  } | null;
  facultyMentor: string;
  status: "UNDER_REVIEW" | "ACTIVE" | "COMPLETED" | "PENDING_ACTION";
  progress: number;
  nextAction: string;
  actionText: string;
  actionHref?: string;
  milestones: ProjectMilestone[];
}

// Timeline Stages list
export const LIFECYCLE_STAGES: ProjectStage[] = [
  "PROBLEM_REPORTED",
  "VALIDATED",
  "UNIVERSITY_MATCHED",
  "TEAM_FORMED",
  "PROPOSAL_SUBMITTED",
  "PROPOSAL_APPROVED",
  "IMPLEMENTATION",
  "IMPACT_ASSESSMENT",
  "COMPLETED"
];

// Stage Config Mapping (Source of Truth)
export const STAGE_CONFIG: Record<ProjectStage, {
  label: string;
  defaultProgress: number;
  status: "UNDER_REVIEW" | "ACTIVE" | "COMPLETED" | "PENDING_ACTION";
  nextAction: string;
  actionText: string;
  actionHref?: string;
}> = {
  PROBLEM_REPORTED: {
    label: "Problem Reported",
    defaultProgress: 10,
    status: "PENDING_ACTION",
    nextAction: "Await validation by field coordinators",
    actionText: "View Problem Source",
  },
  VALIDATED: {
    label: "Validated",
    defaultProgress: 20,
    status: "PENDING_ACTION",
    nextAction: "Match with university departments",
    actionText: "View Problem Source",
  },
  UNIVERSITY_MATCHED: {
    label: "University Matched",
    defaultProgress: 30,
    status: "PENDING_ACTION",
    nextAction: "Form and register research team",
    actionText: "Manage Team",
    actionHref: "/university/teams",
  },
  TEAM_FORMED: {
    label: "Team Formed",
    defaultProgress: 40,
    status: "PENDING_ACTION",
    nextAction: "Prepare and submit solution proposal",
    actionText: "Submit Proposal",
    actionHref: "/university/proposals",
  },
  PROPOSAL_SUBMITTED: {
    label: "Proposal Submitted",
    defaultProgress: 50,
    status: "UNDER_REVIEW",
    nextAction: "Await proposal review and approval",
    actionText: "View Proposal",
    actionHref: "/university/proposals",
  },
  PROPOSAL_APPROVED: {
    label: "Proposal Approved",
    defaultProgress: 60,
    status: "ACTIVE",
    nextAction: "Finalize tripartite agreements and begin pilot",
    actionText: "View Agreement Details",
  },
  IMPLEMENTATION: {
    label: "Implementation",
    defaultProgress: 75,
    status: "ACTIVE",
    nextAction: "Deploy prototype and update milestone progress",
    actionText: "Update Progress",
  },
  IMPACT_ASSESSMENT: {
    label: "Impact Assessment",
    defaultProgress: 90,
    status: "ACTIVE",
    nextAction: "Conduct community survey and upload impact report",
    actionText: "Submit Impact Report",
  },
  COMPLETED: {
    label: "Completed",
    defaultProgress: 100,
    status: "COMPLETED",
    nextAction: "Project finalized and closed by administration",
    actionText: "View Final Report",
  },
};

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
    status: "Active Project",
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
    status: "Active Project",
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
    submissionDate: "2025-08-10",
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
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
  },
  {
    id: "team-3",
    name: "Soil Remediation Taskforce",
    facultyMentor: "Dr. Sanjay Dutt (Biotechnology)",
    studentMembers: ["Nikhil Gupta (MSc)", "Kriti Sen (BTech)"],
    requiredSkills: ["Bio-remediation", "Soil chemical analysis", "Microbial culture"],
    assignedProblemId: "prob-2",
    assignedProblemTitle: "Crop Yield Reduction due to Soil Salinity",
    status: "Active",
  },
  {
    id: "team-4",
    name: "Tribal Education Hub",
    facultyMentor: "Dr. Priyadarshini Mohanty (Social Work)",
    studentMembers: ["Rashmi Naik (MA)", "Alok Das (PhD)"],
    requiredSkills: ["Vernacular Pedagogy", "Community Outreach", "Tablet Config"],
    assignedProblemId: "prob-5",
    assignedProblemTitle: "High School Dropout Rates in Tribal Districts",
    status: "Active",
  },
];

const INITIAL_INTERESTS: ProblemInterest[] = [
  {
    id: "int-1",
    problemId: "prob-1",
    universityId: "univ-1",
    universityName: "Indian Institute of Science",
    status: "ASSIGNED",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-12",
  },
  {
    id: "int-2",
    problemId: "prob-2",
    universityId: "univ-1",
    universityName: "Indian Institute of Science",
    status: "ASSIGNED",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-20",
  },
  {
    id: "int-4",
    problemId: "prob-4",
    universityId: "univ-1",
    universityName: "Indian Institute of Science",
    status: "INTERESTED",
    createdAt: "2026-08-20",
    updatedAt: "2026-08-20",
  },
  {
    id: "int-5",
    problemId: "prob-5",
    universityId: "univ-1",
    universityName: "Indian Institute of Science",
    status: "ASSIGNED",
    createdAt: "2025-08-10",
    updatedAt: "2025-09-05",
  },
];

const INITIAL_PROPOSALS: SolutionProposal[] = [
  {
    id: "prop-1",
    title: "Community-Led Water Security (Jal-Dhara)",
    problemId: "prob-1",
    teamId: "team-1",
    universityId: "univ-1",
    problemUnderstanding: "Rural areas in Ranchi experience severe dry seasons with dry wells, forcing long travel for drinking water.",
    proposedApproach: "Build low-cost gravity-fed sand filter systems and rain harvesting reservoirs managed by local village panchayats.",
    expectedImpact: "Safe year-round drinking water for 4,500 people, reducing waterborne diseases.",
    resourceRequirements: "Filtration media, storage tanks, local construction labor.",
    timeline: "4 months",
    status: "ACCEPTED",
    createdAt: "2026-08-10",
    updatedAt: "2026-08-12",
    submittedAt: "2026-08-10",
  },
  {
    id: "prop-2",
    title: "Biotechnology for Soil Salinity Remediation",
    problemId: "prob-2",
    teamId: "team-3",
    universityId: "univ-1",
    problemUnderstanding: "Soil salinity has reduced wheat yields in Sangrur by 40%.",
    proposedApproach: "Deploy halophilic bio-fertilizers and salt-tolerant organic soil conditioners to restore soil microbiota.",
    expectedImpact: "Increase crop yield by 20% in the first season, reduce reliance on chemical inputs.",
    resourceRequirements: "Microbial strains, lab cultivation equipment, field trial materials.",
    timeline: "6 months",
    status: "DRAFT",
    createdAt: "2026-08-25",
    updatedAt: "2026-08-25",
    submittedAt: undefined,
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
    problemId: "prob-1",
    teamId: "team-1",
    stage: "IMPLEMENTATION",
    customProgress: 72,
    startDate: "12 August 2026",
    expectedCompletionDate: "30 November 2026",
    collaboration: {
      university: "Ranchi Technical Institute",
      industryPartner: "Tata Steel CSR Division",
      governmentAuthority: "Jharkhand Water Supply & Sanitation Dept",
      agreementStatus: "Active",
      agreementType: "Tripartite MoU",
      startDate: "12 August 2026",
      endDate: "30 November 2026",
      funding: "₹7,50,000",
      coordinator: "Prof. S. K. Mahapatra",
    },
    documents: [
      { name: "Collaboration Agreement", type: "PDF", status: "Active", size: "2.4 MB", uploadedDate: "12 Aug 2026" },
      { name: "Project Proposal", type: "PDF", status: "Completed", size: "1.8 MB", uploadedDate: "10 Aug 2026" },
      { name: "Funding Approval", type: "PDF", status: "Active", size: "1.1 MB", uploadedDate: "14 Aug 2026" },
      { name: "Technical Specification", type: "DOCX", status: "Active", size: "4.5 MB", uploadedDate: "15 Aug 2026" },
    ],
    activities: [
      { text: "Field testing started at Ranchi rural site", performedBy: "Team Jal-Dhara", date: "26 Aug 2026", time: "14:20", type: "milestone" },
      { text: "Lab prototype of sand filter successfully verified", performedBy: "Dr. Ramesh Kumar", date: "25 Aug 2026", time: "11:30", type: "testing" },
      { text: "Project proposal formally approved by CSR division", performedBy: "Tata CSR Board", date: "18 Aug 2026", time: "16:10", type: "proposal" },
      { text: "Team Jal-Dhara formally assigned to target challenge", performedBy: "Ranchi Tech Admin", date: "15 Aug 2026", time: "10:00", type: "team" },
      { text: "Tripartite MoU signed with Tata CSR and Jharkhand Water Dept", performedBy: "Coordination Office", date: "12 Aug 2026", time: "14:00", type: "agreement" },
    ],
  },
  {
    id: "PB-2026-002",
    title: "Solar Powering Rural Primary Schools",
    problemId: "prob-4",
    teamId: null,
    stage: "PROPOSAL_SUBMITTED",
    startDate: "20 August 2026",
    expectedCompletionDate: "15 January 2027",
    collaboration: {
      university: "Gaya Technical Academy",
      industryPartner: "ReNew Power Ltd",
      governmentAuthority: "Bihar Education Department",
      agreementStatus: "Under Review",
      agreementType: "Research Collaboration Agreement",
      startDate: "Pending Approval",
      endDate: "Pending Approval",
      funding: "₹4,20,000 (Requested)",
      coordinator: "Prof. Anjali Devi",
    },
    documents: [
      { name: "Project Proposal", type: "PDF", status: "Under Review", size: "3.2 MB", uploadedDate: "20 Aug 2026" },
      { name: "Technical Specification", type: "PDF", status: "Draft", size: "2.1 MB", uploadedDate: "18 Aug 2026" },
    ],
    activities: [
      { text: "Technical proposal uploaded for review", performedBy: "Prof. Anjali Devi", date: "24 Aug 2026", time: "12:15", type: "proposal" },
      { text: "Rooftop load and solar exposure survey completed", performedBy: "SolarEdu Scholars", date: "23 Aug 2026", time: "10:30", type: "survey" },
      { text: "SolarEdu Scholars team formed and assigned to school project", performedBy: "Gaya Tech Registry", date: "22 Aug 2026", time: "09:00", type: "team" },
    ],
  },
  {
    id: "PB-2026-003",
    title: "Soil Salinity Bioremediation",
    problemId: "prob-2",
    teamId: "team-3",
    stage: "UNIVERSITY_MATCHED",
    startDate: "25 August 2026",
    expectedCompletionDate: "30 March 2027",
    collaboration: {
      university: "Punjab Agri University",
      industryPartner: "IFFCO CSR",
      governmentAuthority: "Punjab Soil Conservation Department",
      agreementStatus: "Draft",
      agreementType: "Joint Agri-Research MoU",
      startDate: "Pending MoU",
      endDate: "Pending MoU",
      funding: "₹12,00,000 (Target)",
      coordinator: "Dr. Sanjay Dutt",
    },
    documents: [
      { name: "Initial Research Brief", type: "PDF", status: "Draft", size: "1.2 MB", uploadedDate: "25 Aug 2026" },
    ],
    activities: [
      { text: "Initial meeting with Punjab Soil Dept representatives", performedBy: "Dr. Sanjay Dutt", date: "26 Aug 2026", time: "15:30", type: "meeting" },
      { text: "University match registered for Sangrur district salinity challenge", performedBy: "PAU Admin", date: "25 Aug 2026", time: "10:15", type: "match" },
    ],
  },
  {
    id: "PB-2026-004",
    title: "Vernacular E-Learning Kits",
    problemId: "prob-5",
    teamId: "team-4",
    stage: "COMPLETED",
    startDate: "01 September 2025",
    expectedCompletionDate: "30 June 2026",
    collaboration: {
      university: "Odisha State University",
      industryPartner: "Vedanta Foundation CSR",
      governmentAuthority: "Mayurbhanj District Education Office",
      agreementStatus: "Completed",
      agreementType: "Corporate-Academic Partnership",
      startDate: "01 September 2025",
      endDate: "30 June 2026",
      funding: "₹5,00,000",
      coordinator: "Dr. Priyadarshini Mohanty",
    },
    documents: [
      { name: "MOU Agreement", type: "PDF", status: "Completed", size: "2.8 MB", uploadedDate: "01 Sep 2025" },
      { name: "Project Proposal", type: "PDF", status: "Completed", size: "1.9 MB", uploadedDate: "05 Sep 2025" },
      { name: "Final Impact Report", type: "PDF", status: "Completed", size: "5.2 MB", uploadedDate: "15 Jun 2026" },
      { name: "Completion Certificate", type: "PDF", status: "Completed", size: "850 KB", uploadedDate: "30 Jun 2026" },
    ],
    activities: [
      { text: "Final completion certificate issued by District Collector Office", performedBy: "District Collector", date: "30 Jun 2026", time: "17:00", type: "completion" },
      { text: "End-line impact assessment survey completed and compiled", performedBy: "Dr. Priyadarshini Mohanty", date: "15 Jun 2026", time: "14:30", type: "survey" },
      { text: "150 offline learning tablets deployed in Mayurbhanj schools", performedBy: "Tribal Education Hub", date: "30 Apr 2026", time: "11:00", type: "deployment" },
      { text: "First field testing report uploaded with positive feedback", performedBy: "Alok Das", date: "28 Feb 2026", time: "10:15", type: "testing" },
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

// ----------------------------------------------------
// Milestone Generator (Source of Truth)
// ----------------------------------------------------
export function getProjectMilestones(stage: ProjectStage, projectStartDate: string): ProjectMilestone[] {
  const stageIndex = LIFECYCLE_STAGES.indexOf(stage);

  const milestonesList = [
    {
      name: "Problem Validation",
      stageLimit: 1, // VALIDATED
      date: "12 Aug 2026",
      description: "Problem validated by administrative field surveyor.",
    },
    {
      name: "Team Formation",
      stageLimit: 3, // TEAM_FORMED
      date: stageIndex >= 3 ? "15 Aug 2026" : undefined,
      dueDate: stageIndex < 3 ? "2026-08-23" : undefined,
      description: "Research team registered and assigned to the project.",
    },
    {
      name: "Proposal",
      stageLimit: 4, // PROPOSAL_SUBMITTED
      date: stageIndex >= 4 ? "18 Aug 2026" : undefined,
      dueDate: stageIndex < 4 ? "2026-09-05" : undefined,
      description: "Technical and budget proposal submitted and evaluated.",
    },
    {
      name: "Prototype Design",
      stageLimit: 5, // PROPOSAL_APPROVED
      date: stageIndex >= 5 ? "25 Aug 2026" : undefined,
      dueDate: stageIndex < 5 ? "2026-09-15" : undefined,
      description: "Gravity-fed sand filtration unit prototype verified in lab.",
    },
    {
      name: "Field Testing",
      stageLimit: 6, // IMPLEMENTATION
      date: stageIndex >= 7 ? "26 Aug 2026" : undefined,
      dueDate: stageIndex === 6 ? "2026-09-22" : stageIndex < 6 ? "2026-09-30" : undefined,
      description: "Excavation and filtration bed placement active at rural site.",
    },
    {
      name: "Pilot Deployment",
      stageLimit: 7, // IMPACT_ASSESSMENT
      date: stageIndex >= 8 ? "30 Apr 2026" : undefined,
      dueDate: stageIndex < 7 ? "2026-10-15" : undefined,
      description: "Installation of public filtration nodes and clean-water taps.",
    },
    {
      name: "Impact Assessment",
      stageLimit: 8, // COMPLETED
      date: stageIndex >= 8 ? "15 Jun 2026" : undefined,
      dueDate: stageIndex === 7 ? "2026-09-10" : stageIndex < 7 ? "2026-11-10" : undefined,
      description: "Measurement of water safety indicators and public health tracking.",
    },
    {
      name: "Final Completion",
      stageLimit: 8, // COMPLETED
      date: stageIndex >= 8 ? "30 Jun 2026" : undefined,
      dueDate: stageIndex < 8 ? "2026-11-30" : undefined,
      description: "Formal project sign-off and transfer of operations to local panchayat.",
    },
  ];

  return milestonesList.map((m) => {
    let status: "Completed" | "Current" | "Upcoming" = "Upcoming";
    
    if (stageIndex >= m.stageLimit) {
      status = "Completed";
    } else {
      const firstUncompletedIndex = milestonesList.findIndex(ml => stageIndex < ml.stageLimit);
      if (milestonesList[firstUncompletedIndex]?.name === m.name) {
        status = "Current";
      }
    }

    return {
      name: m.name,
      status,
      date: m.date,
      description: m.description,
      dueDate: m.dueDate,
    };
  });
}

// Deadline calculation utility
export function getDaysRemainingText(dueDateString?: string): { text: string; isOverdue: boolean } | null {
  if (!dueDateString) return null;
  const current = new Date("2026-08-26");
  const due = new Date(dueDateString);
  
  const diffTime = due.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return { text: `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`, isOverdue: false };
  } else if (diffDays === 0) {
    return { text: "Due today", isOverdue: false };
  } else {
    const overdueDays = Math.abs(diffDays);
    return { text: `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`, isOverdue: true };
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

  // Problem Interest API
  getInterests(): ProblemInterest[] {
    return getStoredData<ProblemInterest[]>("uni_interests", INITIAL_INTERESTS);
  },

  getInterestForProblem(problemId: string, universityId = "univ-1"): ProblemInterest | undefined {
    return this.getInterests().find(
      (i) => i.problemId === problemId && i.universityId === universityId
    );
  },

  expressInterest(problemId: string, universityId = "univ-1", universityName = "Indian Institute of Science"): ProblemInterest {
    const interests = this.getInterests();
    const existing = interests.find(
      (i) => i.problemId === problemId && i.universityId === universityId
    );

    if (existing) {
      return existing;
    }

    const today = new Date().toISOString().split("T")[0];
    const newInterest: ProblemInterest = {
      id: `int-${Date.now()}`,
      problemId,
      universityId,
      universityName,
      status: "INTERESTED",
      createdAt: today,
      updatedAt: today,
    };

    interests.push(newInterest);
    setStoredData("uni_interests", interests);

    const problems = this.getProblems();
    const probIdx = problems.findIndex((p) => p.id === problemId);
    if (probIdx !== -1) {
      if (problems[probIdx].status === "Unassigned") {
        problems[probIdx].status = "Interested";
        setStoredData("uni_problems", problems);
      }
      this.addActivity(`Expressed interest in problem: "${problems[probIdx].title}"`);
    }

    return newInterest;
  },

  getInterestedProblemsForTeams(universityId = "univ-1"): CommunityProblem[] {
    const interests = this.getInterests().filter(
      (i) => i.universityId === universityId && (i.status === "INTERESTED" || i.status === "ASSIGNED")
    );
    const interestedProblemIds = interests.map((i) => i.problemId);
    
    const problems = this.getProblems();
    const teams = this.getTeams();

    return problems.filter((p) => {
      if (!interestedProblemIds.includes(p.id)) return false;
      const assignedTeam = teams.find((t) => t.assignedProblemId === p.id);
      return !assignedTeam;
    });
  },

  getAssignedTeamForProblem(problemId: string): UniversityTeam | undefined {
    return this.getTeams().find((t) => t.assignedProblemId === problemId);
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

  assignProblemToTeam(teamId: string, problemId: string, universityId = "univ-1"): void {
    const teams = this.getTeams();
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    
    const problems = this.getProblems();
    const probIndex = problems.findIndex((p) => p.id === problemId);

    if (teamIndex !== -1 && probIndex !== -1) {
      const interests = this.getInterests();
      const interestIdx = interests.findIndex(
        (i) => i.problemId === problemId && i.universityId === universityId
      );

      if (interestIdx === -1) {
        const today = new Date().toISOString().split("T")[0];
        interests.push({
          id: `int-${Date.now()}`,
          problemId,
          universityId,
          universityName: "Indian Institute of Science",
          status: "ASSIGNED",
          createdAt: today,
          updatedAt: today,
        });
      } else {
        interests[interestIdx].status = "ASSIGNED";
        interests[interestIdx].updatedAt = new Date().toISOString().split("T")[0];
      }
      setStoredData("uni_interests", interests);

      teams[teamIndex].assignedProblemId = problemId;
      teams[teamIndex].assignedProblemTitle = problems[probIndex].title;
      teams[teamIndex].status = "Active";
      setStoredData("uni_teams", teams);

      problems[probIndex].status = "Active Project";
      setStoredData("uni_problems", problems);

      this.addActivity(`Assigned problem "${problems[probIndex].title}" to Team "${teams[teamIndex].name}"`);
    }
  },

  // ----------------------------------------------------
  // Proposals API & Authorization Controls
  // ----------------------------------------------------
  getProposals(universityId = "univ-1"): SolutionProposal[] {
    return getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS).filter(
      (p) => p.universityId === universityId
    );
  },

  getProposalById(id: string, universityId = "univ-1"): SolutionProposal | undefined {
    return this.getProposals(universityId).find((p) => p.id === id);
  },

  resolveProposal(proposal: SolutionProposal): ResolvedProposal {
    const problems = this.getProblems();
    const teams = this.getTeams();
    return {
      ...proposal,
      problem: problems.find((p) => p.id === proposal.problemId) || null,
      team: teams.find((t) => t.id === proposal.teamId) || null,
    };
  },

  // Query problems that have registered interest AND an assigned team
  getEligibleProblemsForProposals(universityId = "univ-1"): CommunityProblem[] {
    const interests = this.getInterests().filter((i) => i.universityId === universityId);
    const interestedProblemIds = interests.map((i) => i.problemId);

    const problems = this.getProblems();
    const teams = this.getTeams();

    return problems.filter((p) => {
      // Must be interested by this university
      if (!interestedProblemIds.includes(p.id)) return false;
      // Must have an assigned team
      const assignedTeam = teams.find((t) => t.assignedProblemId === p.id);
      return !!assignedTeam;
    });
  },

  // Query teams assigned to a specific problem
  getTeamsForProblem(problemId: string, universityId = "univ-1"): UniversityTeam[] {
    const teams = this.getTeams();
    return teams.filter((t) => t.assignedProblemId === problemId);
  },

  saveProposal(
    proposalData: {
      id?: string;
      problemId: string;
      teamId: string;
      title: string;
      problemUnderstanding: string;
      proposedApproach: string;
      expectedImpact: string;
      resourceRequirements: string;
      timeline?: string;
    },
    isSubmit = false,
    universityId = "univ-1"
  ): SolutionProposal {
    const proposals = getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);

    // Authorization & Validation Check 1: Verify problem accessibility
    const eligibleProblems = this.getEligibleProblemsForProposals(universityId);
    const isProblemEligible = eligibleProblems.some((p) => p.id === proposalData.problemId);
    if (!isProblemEligible) {
      throw new Error("Unauthorized: The selected problem is not associated with your university or has no assigned research team.");
    }

    // Authorization & Validation Check 2: Verify team belongs to problem
    const problemTeams = this.getTeamsForProblem(proposalData.problemId, universityId);
    const isTeamValid = problemTeams.some((t) => t.id === proposalData.teamId);
    if (!isTeamValid) {
      throw new Error("Validation Error: The selected team is not assigned to this community problem.");
    }

    const today = new Date().toISOString().split("T")[0];

    // Case 1: Editing Existing Proposal Draft
    if (proposalData.id) {
      const idx = proposals.findIndex((p) => p.id === proposalData.id && p.universityId === universityId);
      if (idx === -1) {
        throw new Error("Proposal not found or unauthorized.");
      }

      proposals[idx] = {
        ...proposals[idx],
        problemId: proposalData.problemId,
        teamId: proposalData.teamId,
        title: proposalData.title.trim(),
        problemUnderstanding: proposalData.problemUnderstanding.trim(),
        proposedApproach: proposalData.proposedApproach.trim(),
        expectedImpact: proposalData.expectedImpact.trim(),
        resourceRequirements: proposalData.resourceRequirements.trim(),
        timeline: proposalData.timeline ? proposalData.timeline.trim() : proposals[idx].timeline,
        updatedAt: today,
        status: isSubmit ? "SUBMITTED" : proposals[idx].status,
        submittedAt: isSubmit ? today : proposals[idx].submittedAt,
      };

      setStoredData("uni_proposals", proposals);

      if (isSubmit) {
        this.addActivity(`Proposal "${proposals[idx].title}" submitted for review.`);
        
        // Update problem status to Under Review
        const problems = this.getProblems();
        const probIdx = problems.findIndex((p) => p.id === proposalData.problemId);
        if (probIdx !== -1 && problems[probIdx].status !== "Active Project") {
          problems[probIdx].status = "Under Review";
          setStoredData("uni_problems", problems);
        }
      } else {
        this.addActivity(`Proposal draft "${proposals[idx].title}" updated.`);
      }

      return proposals[idx];
    }

    // Case 2: Creating New Proposal
    const newProposal: SolutionProposal = {
      id: `prop-${Date.now()}`,
      universityId,
      problemId: proposalData.problemId,
      teamId: proposalData.teamId,
      title: proposalData.title.trim(),
      problemUnderstanding: proposalData.problemUnderstanding.trim(),
      proposedApproach: proposalData.proposedApproach.trim(),
      expectedImpact: proposalData.expectedImpact.trim(),
      resourceRequirements: proposalData.resourceRequirements.trim(),
      timeline: proposalData.timeline ? proposalData.timeline.trim() : "4 months",
      status: isSubmit ? "SUBMITTED" : "DRAFT",
      createdAt: today,
      updatedAt: today,
      submittedAt: isSubmit ? today : undefined,
    };

    proposals.push(newProposal);
    setStoredData("uni_proposals", proposals);

    if (isSubmit) {
      this.addActivity(`Proposal "${newProposal.title}" submitted for review.`);
      
      const problems = this.getProblems();
      const probIdx = problems.findIndex((p) => p.id === proposalData.problemId);
      if (probIdx !== -1 && problems[probIdx].status !== "Active Project") {
        problems[probIdx].status = "Under Review";
        setStoredData("uni_problems", problems);
      }
    } else {
      this.addActivity(`Proposal draft "${newProposal.title}" created.`);
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

  resolveProject(project: UniversityProject): ResolvedProject | undefined {
    const problems = this.getProblems();
    const teams = this.getTeams();
    
    const problem = problems.find((p) => p.id === project.problemId);
    if (!problem) return undefined;

    const team = project.teamId ? teams.find((t) => t.id === project.teamId) || null : null;
    
    const config = STAGE_CONFIG[project.stage];
    const progress = project.customProgress ?? config.defaultProgress;
    const milestones = getProjectMilestones(project.stage, project.startDate);

    return {
      ...project,
      originalProblem: {
        title: problem.title,
        description: problem.description,
        category: problem.category,
        district: problem.district,
        state: problem.state,
        dateReported: problem.submissionDate,
        reporter: project.id === "PB-2026-004" ? "Local NGO Director" : "Suresh Mahto (Citizen)", 
        affectedPopulation: problem.affectedPopulation,
        severity: problem.priority === "High" ? "Critical" : "High",
        validationStatus: "VERIFIED",
      },
      assignedTeam: team ? {
        name: team.name,
        facultyMentor: team.facultyMentor.split(" (")[0],
        members: team.studentMembers.map((m) => {
          const parts = m.split(" (");
          return { name: parts[0], degree: parts[1]?.replace(")", "") || "Student" };
        }),
        departments: [team.facultyMentor.split(" (")[1]?.replace(")", "") || "Engineering"],
        skills: team.requiredSkills,
      } : null,
      facultyMentor: team ? team.facultyMentor.split(" (")[0] : "Coordinator Pending",
      status: config.status,
      progress,
      nextAction: config.nextAction,
      actionText: config.actionText,
      actionHref: config.actionHref,
      milestones,
    };
  }
};
