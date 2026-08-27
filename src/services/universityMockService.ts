"use client";

import { ProblemAnalysis } from "./aiService";
import { ProblemCluster, DuplicateMatchCandidate } from "./duplicateDetectionService";
import { matchProblem, ProblemMatchResult, EntityRecommendation, DEMO_UNIVERSITIES } from "./smartMatchingService";

export type { ProblemAnalysis, ProblemCluster, DuplicateMatchCandidate, ProblemMatchResult, EntityRecommendation };

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
  status: "Unassigned" | "Interested" | "Under Review" | "Active Project" | "Rejected";
  departments: string[];
  researchAreas: string[];
  requiredExpertise: string[];
  disciplines: string[];
  submissionDate: string;
}

export interface UniversityTeam {
  id: string;
  universityId?: string;
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

// Resolved Registered Problem for University Dashboard
export interface RegisteredProblemDetail {
  problem: CommunityProblem;
  interest: ProblemInterest;
  team: UniversityTeam | null;
  proposal: SolutionProposal | null;
  project: UniversityProject | null;
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
  | "AWAITING_ADMIN_VERIFICATION"
  | "COMPLETED";

export interface ProjectMilestone {
  name: string;
  status: "Completed" | "Current" | "Upcoming" | "Overdue" | "Blocked";
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
  proposalId?: string | null;
  stage: ProjectStage;
  customProgress?: number;
  startDate: string;
  expectedCompletionDate: string;
  collaboration: ProjectCollaboration;
  documents: ProjectDocument[];
  activities: ProjectActivityLog[];
  completionVerificationNote?: string;
  verificationEvidenceStatus?: "PENDING" | "SUBMITTED" | "VERIFIED" | "NEEDS_REVISION";
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
  "AWAITING_ADMIN_VERIFICATION",
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
    nextAction: "Submit impact report for final government verification",
    actionText: "Submit Impact Report",
  },
  AWAITING_ADMIN_VERIFICATION: {
    label: "Awaiting Government Verification",
    defaultProgress: 95,
    status: "UNDER_REVIEW",
    nextAction: "Awaiting final verification and sign-off by Platform Administration",
    actionText: "Review Verification Evidence",
    actionHref: "/admin/projects",
  },
  COMPLETED: {
    label: "Completed",
    defaultProgress: 100,
    status: "COMPLETED",
    nextAction: "Project verified and closed by administration",
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

const INITIAL_CLUSTERS: ProblemCluster[] = [
  {
    id: "cluster-1",
    primaryProblemId: "prob-1",
    primaryTitle: "Water Scarcity in Rural Communities",
    category: "Water & Sanitation",
    district: "Ranchi",
    state: "Jharkhand",
    memberProblemIds: ["prob-1"],
    status: "ACTIVE",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
  },
];

const INITIAL_ANALYSES: ProblemAnalysis[] = [
  {
    problemId: "prob-1",
    category: "Water & Sanitation",
    subcategory: "Water Availability",
    summary: "Seasonal drinking water shortage in Ranchi rural blocks forcing daily 3km travel.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Groundwater mapping", "Gravity filtration", "Community water management"],
    suggestedDomains: ["Rainwater Harvesting", "Slow Sand Filtration", "Hydrogeology"],
    analyzedAt: "2026-08-01",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-2",
    category: "Agriculture & Food Tech",
    subcategory: "Soil Bioremediation",
    summary: "Critical soil salinity in Sangrur causing a 40% drop in wheat crop yield.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Soil chemistry analysis", "Halophilic microbes", "Sustainable farming"],
    suggestedDomains: ["Soil Bioremediation", "Salt-Tolerant Crops", "Organic Inputs"],
    analyzedAt: "2026-08-05",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-3",
    category: "Waste Management",
    subcategory: "Automated Waste Sorting",
    summary: "Unsegregated municipal waste in Pune overburdening landfills.",
    severity: "MEDIUM",
    affectedArea: "URBAN",
    impactLevel: "MEDIUM",
    requiredExpertise: ["Object detection (YOLO)", "Conveyor belt mechanics", "Routing optimization"],
    suggestedDomains: ["Computer Vision Sorting", "Recycling Automation", "Urban Logistics"],
    analyzedAt: "2026-08-12",
    reviewStatus: "PENDING",
  },
  {
    problemId: "prob-4",
    category: "Renewable Energy",
    subcategory: "Microgrid Solar Power",
    summary: "Frequent 6-8 hour power cuts in rural Gaya primary schools.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Solar panel sizing", "Inverter load calculation", "LiFePO4 battery configuration"],
    suggestedDomains: ["Solar Photovoltaics", "Battery Storage Systems", "Microgrids"],
    analyzedAt: "2026-07-28",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-5",
    category: "Education & Social Impact",
    subcategory: "Vernacular Educational Accessibility",
    summary: "Language barriers and economic constraints causing high dropouts in Mayurbhanj tribal villages.",
    severity: "MEDIUM",
    affectedArea: "TRIBAL",
    impactLevel: "MEDIUM",
    requiredExpertise: ["Curriculum design", "Tribal dialect translation", "Offline learning tablets"],
    suggestedDomains: ["Vernacular Pedagogy", "Community Learning Hubs", "E-learning Accessibility"],
    analyzedAt: "2025-08-10",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-6",
    category: "Agriculture & Food Tech",
    subcategory: "Thermal Refrigeration",
    summary: "Alappuzha fishermen lose 30% of daily catch due to lack of immediate cold storage.",
    severity: "MEDIUM",
    affectedArea: "RURAL",
    impactLevel: "MEDIUM",
    requiredExpertise: ["Refrigeration cycles", "Thermal insulation design", "PV integration"],
    suggestedDomains: ["Thermal Refrigeration", "Phase Change Materials", "Solar Cooling"],
    analyzedAt: "2026-08-15",
    reviewStatus: "PENDING",
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
    status: "ACCEPTED",
    createdAt: "2026-08-25",
    updatedAt: "2026-08-25",
    submittedAt: "2026-08-25",
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
    proposalId: "prop-1",
    stage: "IMPLEMENTATION",
    customProgress: 72,
    startDate: "12 August 2026",
    expectedCompletionDate: "30 November 2026",
    collaboration: {
      university: "Indian Institute of Science",
      industryPartner: "Tata Steel CSR Foundation",
      governmentAuthority: "Jharkhand Water Supply & Sanitation Dept",
      agreementStatus: "Active",
      agreementType: "Tripartite MoU",
      startDate: "12 August 2026",
      endDate: "30 November 2026",
      funding: "₹7,50,000",
      coordinator: "Dr. Ramesh Kumar",
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
    title: "Crop Yield Reduction due to Soil Salinity",
    problemId: "prob-2",
    teamId: "team-3",
    proposalId: "prop-2",
    stage: "AWAITING_ADMIN_VERIFICATION",
    customProgress: 95,
    startDate: "25 August 2026",
    expectedCompletionDate: "30 December 2026",
    completionVerificationNote: "Field trial report and soil microbiota remediation evidence submitted by Soil Remediation Taskforce.",
    verificationEvidenceStatus: "SUBMITTED",
    collaboration: {
      university: "Punjab Agricultural University",
      industryPartner: "IFFCO AgriTech CSR",
      governmentAuthority: "Punjab Dept of Agriculture",
      agreementStatus: "Under Review",
      agreementType: "Research MoU",
      startDate: "25 August 2026",
      endDate: "30 December 2026",
      funding: "₹6,00,000",
      coordinator: "Dr. Sanjay Dutt",
    },
    documents: [
      { name: "Field Trial Impact Report", type: "PDF", status: "Under Review", size: "3.1 MB", uploadedDate: "26 Aug 2026" },
      { name: "Soil Microbe Analysis", type: "PDF", status: "Completed", size: "1.5 MB", uploadedDate: "25 Aug 2026" },
    ],
    activities: [
      { text: "Project submitted for final government verification & sign-off", performedBy: "Dr. Sanjay Dutt", date: "26 Aug 2026", time: "16:45", type: "verification" },
      { text: "Halophilic bio-fertilizer pilot deployed in 50 test plots", performedBy: "Soil Remediation Taskforce", date: "25 Aug 2026", time: "10:00", type: "milestone" },
    ],
  },
  {
    id: "PB-2026-004",
    title: "Vernacular E-Learning Kits",
    problemId: "prob-5",
    teamId: "team-4",
    proposalId: null,
    stage: "COMPLETED",
    customProgress: 100,
    startDate: "01 September 2025",
    expectedCompletionDate: "30 June 2026",
    verificationEvidenceStatus: "VERIFIED",
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

const isClient = typeof window !== "undefined";

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

  const milestonesList: Array<{
    name: string;
    stageLimit: number;
    date?: string;
    dueDate?: string;
    description: string;
  }> = [
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
      stageLimit: 7, // IMPACT_ASSESSMENT
      date: stageIndex >= 8 ? "15 Jun 2026" : undefined,
      dueDate: stageIndex < 8 ? "2026-11-10" : undefined,
      description: "Measurement of water safety indicators and public health tracking.",
    },
    {
      name: "Government Verification",
      stageLimit: 8, // AWAITING_ADMIN_VERIFICATION
      date: stageIndex >= 9 ? "30 Jun 2026" : undefined,
      dueDate: stageIndex < 9 ? "2026-11-20" : undefined,
      description: "Final verification and sign-off by Platform Administration.",
    },
    {
      name: "Final Completion",
      stageLimit: 9, // COMPLETED
      date: stageIndex >= 9 ? "30 Jun 2026" : undefined,
      dueDate: stageIndex < 9 ? "2026-11-30" : undefined,
      description: "Formal project sign-off and transfer of operations to local panchayat.",
    },
  ];

  return milestonesList.map((m) => {
    let status: "Completed" | "Current" | "Upcoming" | "Overdue" | "Blocked" = "Upcoming";
    
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

  addProblem(newProblem: Omit<CommunityProblem, "id" | "submissionDate" | "status" | "matchScore">): CommunityProblem {
    const problems = this.getProblems();
    const today = new Date().toISOString().split("T")[0];
    const created: CommunityProblem = {
      ...newProblem,
      id: `prob-${Date.now()}`,
      submissionDate: today,
      status: "Unassigned",
      matchScore: 85,
    };
    problems.unshift(created);
    setStoredData("uni_problems", problems);
    return created;
  },

  // ----------------------------------------------------
  // Recommended Problems (Filtered for University Ownership)
  // ----------------------------------------------------
  getUnregisteredRecommendedProblems(universityId = "univ-1"): CommunityProblem[] {
    const interests = this.getInterests().filter(
      (i) => i.universityId === universityId && i.status !== "WITHDRAWN"
    );
    const registeredProblemIds = new Set(interests.map((i) => i.problemId));

    const allProblems = this.getProblems();
    return allProblems.filter((p) => !registeredProblemIds.has(p.id));
  },

  getRegisteredProblemsForUniversity(universityId = "univ-1"): RegisteredProblemDetail[] {
    const interests = this.getInterests().filter(
      (i) => i.universityId === universityId && i.status !== "WITHDRAWN"
    );
    const problems = this.getProblems();
    const teams = this.getTeams();
    const proposals = this.getAllProposalsForAdmin().filter((pr) => pr.universityId === universityId);
    const projects = this.getProjects();

    const registeredDetails: RegisteredProblemDetail[] = [];

    for (const interest of interests) {
      const problem = problems.find((p) => p.id === interest.problemId);
      if (!problem) continue;

      const team = teams.find((t) => t.assignedProblemId === problem.id) || null;
      const proposal = proposals.find((pr) => pr.problemId === problem.id) || null;
      const project = projects.find((pj) => pj.problemId === problem.id) || null;

      registeredDetails.push({
        problem,
        interest,
        team,
        proposal,
        project,
      });
    }

    return registeredDetails;
  },

  // ----------------------------------------------------
  // Server-Validated Team Assignment
  // ----------------------------------------------------
  assignTeamToProblem(teamId: string, problemId: string, universityId = "univ-1"): void {
    const teams = this.getTeams();
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) {
      throw new Error("Team not found.");
    }

    const team = teams[teamIndex];
    if (team.universityId && team.universityId !== universityId) {
      throw new Error("Unauthorized: Cannot assign a team belonging to another university.");
    }

    const interest = this.getInterestForProblem(problemId, universityId);
    if (!interest) {
      throw new Error("Unauthorized: This problem has not been registered by your university.");
    }

    const problems = this.getProblems();
    const probIndex = problems.findIndex((p) => p.id === problemId);
    if (probIndex === -1) {
      throw new Error("Problem not found.");
    }

    teams[teamIndex].assignedProblemId = problemId;
    teams[teamIndex].assignedProblemTitle = problems[probIndex].title;
    teams[teamIndex].status = "Active";
    setStoredData("uni_teams", teams);

    const interests = this.getInterests();
    const intIdx = interests.findIndex((i) => i.problemId === problemId && i.universityId === universityId);
    if (intIdx !== -1) {
      interests[intIdx].status = "ASSIGNED";
      interests[intIdx].updatedAt = new Date().toISOString().split("T")[0];
      setStoredData("uni_interests", interests);
    }

    this.addActivity(`Team "${teams[teamIndex].name}" assigned to "${problems[probIndex].title}".`);
  },

  // Smart Matching Recommendations API
  getProblemMatches(problemId: string): ProblemMatchResult | undefined {
    const problem = this.getProblemById(problemId);
    if (!problem) return undefined;

    const analysis = this.getProblemAnalysis(problemId);
    return matchProblem(problem, analysis);
  },

  saveMatchRecommendationAction(
    problemId: string,
    entityId: string,
    status: "RECOMMENDED" | "INTERESTED" | "ACCEPTED" | "DECLINED"
  ): void {
    const key = `match_rec_${problemId}_${entityId}`;
    setStoredData(key, { status, updatedAt: new Date().toISOString().split("T")[0] });
    this.addActivity(`Registered recommendation status "${status}" for problem "${problemId}" and organization "${entityId}".`);
  },

  getMatchRecommendationAction(problemId: string, entityId: string): "RECOMMENDED" | "INTERESTED" | "ACCEPTED" | "DECLINED" | null {
    const data = getStoredData<{ status: "RECOMMENDED" | "INTERESTED" | "ACCEPTED" | "DECLINED" } | null>(`match_rec_${problemId}_${entityId}`, null);
    return data ? data.status : null;
  },

  // Problem Clusters API
  getClusters(): ProblemCluster[] {
    return getStoredData<ProblemCluster[]>("uni_problem_clusters", INITIAL_CLUSTERS);
  },

  getClusterForProblem(problemId: string): ProblemCluster | undefined {
    return this.getClusters().find((c) => c.memberProblemIds.includes(problemId));
  },

  createCluster(primaryProblemId: string, secondaryProblemId: string): ProblemCluster {
    const clusters = this.getClusters();
    const primary = this.getProblemById(primaryProblemId);

    if (!primary) {
      throw new Error("Primary problem not found.");
    }

    const today = new Date().toISOString().split("T")[0];
    const newCluster: ProblemCluster = {
      id: `cluster-${Date.now()}`,
      primaryProblemId,
      primaryTitle: primary.title,
      category: primary.category,
      district: primary.district,
      state: primary.state,
      memberProblemIds: Array.from(new Set([primaryProblemId, secondaryProblemId])),
      status: "ACTIVE",
      createdAt: today,
      updatedAt: today,
    };

    clusters.push(newCluster);
    setStoredData("uni_problem_clusters", clusters);
    this.addActivity(`Created problem cluster for "${primary.title}" including secondary report "${secondaryProblemId}".`);

    return newCluster;
  },

  addProblemToCluster(clusterId: string, problemId: string): ProblemCluster {
    const clusters = this.getClusters();
    const idx = clusters.findIndex((c) => c.id === clusterId);

    if (idx === -1) {
      throw new Error("Cluster not found.");
    }

    if (!clusters[idx].memberProblemIds.includes(problemId)) {
      clusters[idx].memberProblemIds.push(problemId);
      clusters[idx].updatedAt = new Date().toISOString().split("T")[0];
      setStoredData("uni_problem_clusters", clusters);
      this.addActivity(`Added problem report "${problemId}" to cluster "${clusters[idx].primaryTitle}".`);
    }

    return clusters[idx];
  },

  markIndependent(problemId1: string, problemId2: string): void {
    const independentPairs = getStoredData<string[]>("uni_independent_pairs", []);
    const key = [problemId1, problemId2].sort().join("::");
    if (!independentPairs.includes(key)) {
      independentPairs.push(key);
      setStoredData("uni_independent_pairs", independentPairs);
      this.addActivity(`Marked problem reports "${problemId1}" and "${problemId2}" as independent issues.`);
    }
  },

  isMarkedIndependent(problemId1: string, problemId2: string): boolean {
    const independentPairs = getStoredData<string[]>("uni_independent_pairs", []);
    const key = [problemId1, problemId2].sort().join("::");
    return independentPairs.includes(key);
  },

  // Problem Analysis AI API
  getProblemAnalysis(problemId: string): ProblemAnalysis | undefined {
    const analyses = getStoredData<ProblemAnalysis[]>("uni_problem_analyses", INITIAL_ANALYSES);
    return analyses.find((a) => a.problemId === problemId);
  },

  saveProblemAnalysis(analysis: ProblemAnalysis): void {
    const analyses = getStoredData<ProblemAnalysis[]>("uni_problem_analyses", INITIAL_ANALYSES);
    const idx = analyses.findIndex((a) => a.problemId === analysis.problemId);
    if (idx !== -1) {
      analyses[idx] = { ...analyses[idx], ...analysis };
    } else {
      analyses.push(analysis);
    }
    setStoredData("uni_problem_analyses", analyses);
  },

  updateProblemAnalysis(problemId: string, updates: Partial<ProblemAnalysis>): ProblemAnalysis | undefined {
    const analyses = getStoredData<ProblemAnalysis[]>("uni_problem_analyses", INITIAL_ANALYSES);
    const idx = analyses.findIndex((a) => a.problemId === problemId);
    if (idx !== -1) {
      analyses[idx] = { ...analyses[idx], ...updates, reviewStatus: "MODIFIED" };
      setStoredData("uni_problem_analyses", analyses);
      this.addActivity(`AI analysis for problem "${problemId}" updated by Admin.`);
      return analyses[idx];
    }
    return undefined;
  },

  acceptProblemAnalysis(problemId: string): ProblemAnalysis | undefined {
    const analyses = getStoredData<ProblemAnalysis[]>("uni_problem_analyses", INITIAL_ANALYSES);
    const idx = analyses.findIndex((a) => a.problemId === problemId);
    if (idx !== -1) {
      analyses[idx].reviewStatus = "ACCEPTED";
      setStoredData("uni_problem_analyses", analyses);
      this.addActivity(`AI analysis for problem "${problemId}" accepted by Admin.`);
      return analyses[idx];
    }
    return undefined;
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

  // Proposals API
  getProposals(universityId = "univ-1"): SolutionProposal[] {
    return getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS).filter(
      (p) => p.universityId === universityId
    );
  },

  getAllProposalsForAdmin(): SolutionProposal[] {
    return getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
  },

  getProposalById(id: string, universityId?: string): SolutionProposal | undefined {
    const all = getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
    if (universityId) {
      return all.find((p) => p.id === id && p.universityId === universityId);
    }
    return all.find((p) => p.id === id);
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

  getEligibleProblemsForProposals(universityId = "univ-1"): CommunityProblem[] {
    const interests = this.getInterests().filter((i) => i.universityId === universityId);
    const interestedProblemIds = interests.map((i) => i.problemId);

    const problems = this.getProblems();
    const teams = this.getTeams();

    return problems.filter((p) => {
      if (!interestedProblemIds.includes(p.id)) return false;
      const assignedTeam = teams.find((t) => t.assignedProblemId === p.id);
      return !!assignedTeam;
    });
  },

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

    const eligibleProblems = this.getEligibleProblemsForProposals(universityId);
    const isProblemEligible = eligibleProblems.some((p) => p.id === proposalData.problemId);
    if (!isProblemEligible) {
      throw new Error("Unauthorized: The selected problem is not associated with your university or has no assigned research team.");
    }

    const problemTeams = this.getTeamsForProblem(proposalData.problemId, universityId);
    const isTeamValid = problemTeams.some((t) => t.id === proposalData.teamId);
    if (!isTeamValid) {
      throw new Error("Validation Error: The selected team is not assigned to this community problem.");
    }

    const today = new Date().toISOString().split("T")[0];

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

  // Admin Review & Project Creation
  approveProposal(proposalId: string, adminUserId = "admin-1"): { proposal: SolutionProposal; project: UniversityProject; isNew: boolean } {
    const proposals = getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
    const propIdx = proposals.findIndex((p) => p.id === proposalId);

    if (propIdx === -1) {
      throw new Error("Proposal not found.");
    }

    const proposal = proposals[propIdx];
    if (proposal.status === "DRAFT") {
      throw new Error("Cannot approve a draft proposal.");
    }

    const projects = this.getProjects();

    const existingProject = projects.find(
      (proj) => proj.proposalId === proposalId || (proj.problemId === proposal.problemId && proj.teamId === proposal.teamId)
    );

    if (existingProject) {
      proposals[propIdx].status = "ACCEPTED";
      proposals[propIdx].updatedAt = new Date().toISOString().split("T")[0];
      setStoredData("uni_proposals", proposals);

      return { proposal: proposals[propIdx], project: existingProject, isNew: false };
    }

    const today = new Date().toISOString().split("T")[0];
    proposals[propIdx].status = "ACCEPTED";
    proposals[propIdx].updatedAt = today;
    setStoredData("uni_proposals", proposals);

    const problem = this.getProblemById(proposal.problemId);
    const team = this.getTeams().find((t) => t.id === proposal.teamId);
    const interest = this.getInterestForProblem(proposal.problemId, proposal.universityId);

    const newProjectId = `PB-2026-00${projects.length + 1}`;
    const newProject: UniversityProject = {
      id: newProjectId,
      title: proposal.title,
      problemId: proposal.problemId,
      teamId: proposal.teamId,
      proposalId: proposal.id,
      stage: "PROPOSAL_APPROVED",
      startDate: today,
      expectedCompletionDate: "30 June 2027",
      collaboration: {
        university: interest?.universityName || "Indian Institute of Science",
        industryPartner: "CSR Industry Partner",
        governmentAuthority: problem ? `${problem.district} District Authority` : "Local Authority",
        agreementStatus: "Active",
        agreementType: "Research MoU",
        startDate: today,
        endDate: "30 June 2027",
        funding: proposal.resourceRequirements || "₹7,50,000",
        coordinator: team ? team.facultyMentor.split(" (")[0] : "Faculty Coordinator",
      },
      documents: [
        { name: "Accepted Proposal", type: "PDF", status: "Approved", size: "2.4 MB", uploadedDate: today },
        { name: "Tripartite Agreement Brief", type: "PDF", status: "Active", size: "1.8 MB", uploadedDate: today },
      ],
      activities: [
        {
          text: "Project created from approved proposal",
          performedBy: "Platform Administration",
          date: today,
          time: "10:00",
          type: "creation",
        },
      ],
    };

    projects.push(newProject);
    setStoredData("uni_projects", projects);

    const problems = this.getProblems();
    const probIdx = problems.findIndex((p) => p.id === proposal.problemId);
    if (probIdx !== -1) {
      problems[probIdx].status = "Active Project";
      setStoredData("uni_problems", problems);
    }

    this.addActivity(`Proposal "${proposal.title}" approved by Admin; Project ${newProjectId} created.`);

    return { proposal: proposals[propIdx], project: newProject, isNew: true };
  },

  rejectProposal(proposalId: string): SolutionProposal {
    const proposals = getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
    const idx = proposals.findIndex((p) => p.id === proposalId);

    if (idx === -1) {
      throw new Error("Proposal not found.");
    }

    proposals[idx].status = "REJECTED";
    proposals[idx].updatedAt = new Date().toISOString().split("T")[0];
    setStoredData("uni_proposals", proposals);

    this.addActivity(`Proposal "${proposals[idx].title}" rejected by Admin review.`);
    return proposals[idx];
  },

  requestProposalClarification(proposalId: string): SolutionProposal {
    const proposals = getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
    const idx = proposals.findIndex((p) => p.id === proposalId);

    if (idx === -1) {
      throw new Error("Proposal not found.");
    }

    proposals[idx].status = "UNDER_REVIEW";
    proposals[idx].updatedAt = new Date().toISOString().split("T")[0];
    setStoredData("uni_proposals", proposals);

    this.addActivity(`Clarification requested for proposal "${proposals[idx].title}" by Admin.`);
    return proposals[idx];
  },

  getProjectForProposal(proposalId: string): UniversityProject | undefined {
    return this.getProjects().find((proj) => proj.proposalId === proposalId);
  },

  getAdminProposalMetrics(): { pendingCount: number; acceptedCount: number; rejectedCount: number; projectsCreatedCount: number } {
    const proposals = this.getAllProposalsForAdmin();
    const projects = this.getProjects();

    const pendingCount = proposals.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length;
    const acceptedCount = proposals.filter((p) => p.status === "ACCEPTED").length;
    const rejectedCount = proposals.filter((p) => p.status === "REJECTED").length;
    const projectsCreatedCount = projects.filter((p) => !!p.proposalId).length;

    return { pendingCount, acceptedCount, rejectedCount, projectsCreatedCount };
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
    setStoredData("uni_activities", activities.slice(0, 15));
  },

  // Projects API
  getProjects(): UniversityProject[] {
    return getStoredData<UniversityProject[]>("uni_projects", INITIAL_PROJECTS);
  },

  getProjectById(id: string): UniversityProject | undefined {
    return this.getProjects().find((p) => p.id === id);
  },

  // ----------------------------------------------------
  // Government Completion Verification API (Only Admin)
  // ----------------------------------------------------
  verifyProjectCompletion(projectId: string, note?: string, userRole = "ADMIN"): UniversityProject {
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can verify and complete projects.");
    }

    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) {
      throw new Error("Project not found.");
    }

    projects[idx].stage = "COMPLETED";
    projects[idx].customProgress = 100;
    projects[idx].verificationEvidenceStatus = "VERIFIED";
    if (note) {
      projects[idx].completionVerificationNote = note.trim();
    }

    const today = new Date().toISOString().split("T")[0];
    projects[idx].activities.unshift({
      text: "Project completion verified and signed off by Platform Administration",
      performedBy: "Platform Administration",
      date: today,
      time: "12:00",
      type: "completion",
    });

    setStoredData("uni_projects", projects);
    this.addActivity(`Project "${projects[idx].title}" (${projectId}) verified and completed by Platform Administration.`);

    return projects[idx];
  },

  requestVerificationEvidence(projectId: string, note: string, userRole = "ADMIN"): UniversityProject {
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can request verification evidence.");
    }

    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) {
      throw new Error("Project not found.");
    }

    projects[idx].stage = "IMPACT_ASSESSMENT";
    projects[idx].verificationEvidenceStatus = "NEEDS_REVISION";
    projects[idx].completionVerificationNote = note.trim();

    const today = new Date().toISOString().split("T")[0];
    projects[idx].activities.unshift({
      text: `Verification evidence requested: ${note.trim()}`,
      performedBy: "Platform Administration",
      date: today,
      time: "12:00",
      type: "verification_revision",
    });

    setStoredData("uni_projects", projects);
    this.addActivity(`Additional verification evidence requested for project "${projects[idx].title}" (${projectId}).`);

    return projects[idx];
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
  },

  updateProblemStatus(problemId: string, status: "Unassigned" | "Interested" | "Under Review" | "Active Project" | "Rejected", userRole = "ADMIN"): CommunityProblem {
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can validate or update problem status.");
    }
    const problems = this.getProblems();
    const idx = problems.findIndex((p) => p.id === problemId);
    if (idx === -1) {
      throw new Error("Problem not found.");
    }
    problems[idx].status = status as any;
    setStoredData("uni_problems", problems);
    this.addActivity(`Admin updated problem "${problems[idx].title}" status to "${status}".`);
    return problems[idx];
  }
};
