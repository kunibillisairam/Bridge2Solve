"use client";

import { ProblemAnalysis } from "./aiService";
import { ProblemCluster, DuplicateMatchCandidate } from "./duplicateDetectionService";
import { notificationService } from "./notificationService";
import { 
  matchProblem, 
  ProblemMatchResult, 
  EntityRecommendation, 
  DEMO_UNIVERSITIES, 
  getUniversityRecommendations, 
  UniversityMatchResult,
  getTeamRecommendationsForProblem,
  TeamMatchResult
} from "./smartMatchingService";

export type { 
  ProblemAnalysis, 
  ProblemCluster, 
  DuplicateMatchCandidate, 
  ProblemMatchResult, 
  EntityRecommendation, 
  UniversityMatchResult,
  TeamMatchResult
};

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
  teamStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
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
  actor?: string;
  actorRole?: "CITIZEN" | "UNIVERSITY" | "INDUSTRY" | "ADMIN";
  action?: string;
  entityType?: "PROBLEM" | "PROPOSAL" | "PROJECT" | "TEAM" | "INTEREST" | "SUPPORT_REQUEST" | "IMPACT_ASSESSMENT";
  entityId?: string;
  entityName?: string;
  previousState?: string;
  newState?: string;
  note?: string;
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
  uploadedBy?: string;
  uploadedByRole?: string;
  fileType?: string;
}

export interface ProjectActivityLog {
  text: string;
  performedBy: string;
  date: string;
  time: string;
  type: string;
}

// Stored Project Structure (Normalized Database-style)
export interface ProjectImpactAssessment {
  peopleBenefited?: number;
  villagesCovered?: number;
  schoolsReached?: number;
  farmersSupported?: number;
  problemImprovement?: string;
  outcomes?: string;
  actualResult?: string;
}

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
  impactAssessment?: ProjectImpactAssessment;
}

// Resolved project for UI display
export interface ResolvedProject extends UniversityProject {
  originalProblem: {
    id: string;
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
    label: "Awaiting Verification",
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
    title: "Drinking Water Scarcity and Contamination in Ranchi Rural Blocks",
    description: "During the dry season, groundwater levels drop severely in Ranchi rural blocks. Local residents, mostly women and children, walk over 3km daily to fetch drinking water. Contamination in secondary wells is also a major health risk.",
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
    title: "Crop Yield Reduction due to Soil Salinity in Sangrur agricultural belt",
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
    title: "Inadequate Municipal Waste Sorting at Source in Pune City",
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
    title: "Intermittent Electricity Supply in Rural Gaya Primary Schools",
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
    title: "High School Dropout Rates in Tribal Districts of Mayurbhanj",
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
    title: "Lack of Cold Storage for Small-Scale Fishermen in Alappuzha",
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
  {
    id: "prob-7",
    title: "Severe Drinking Water Shortage in Village Alpha of Ranchi Rural",
    description: "Residents of Village Alpha are facing a critical drinking water crisis this summer. The local borehole has run dry, and the tanker service is irregular.",
    category: "Water & Sanitation",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    affectedPopulation: "1,200 people",
    priority: "High",
    matchScore: 90,
    status: "Unassigned",
    departments: ["Environmental Science", "Civil Engineering"],
    researchAreas: ["Rainwater Harvesting", "Slow Sand Filtration"],
    requiredExpertise: ["Groundwater mapping", "Gravity filtration"],
    disciplines: ["Civil Engineering", "Hydrogeology"],
    submissionDate: "2026-08-18",
  },
  {
    id: "prob-8",
    title: "Residents of Village Alpha Lack Reliable Water Source",
    description: "There is no drinking water supply pipeline in Village Alpha. The community is forced to fetch water from a contaminated pond 2km away.",
    category: "Water & Sanitation",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    affectedPopulation: "1,500 people",
    priority: "High",
    matchScore: 89,
    status: "Unassigned",
    departments: ["Environmental Science", "Civil Engineering"],
    researchAreas: ["Rainwater Harvesting", "Gravity Filtration"],
    requiredExpertise: ["Groundwater mapping", "Community water management"],
    disciplines: ["Civil Engineering", "Environmental Studies"],
    submissionDate: "2026-08-19",
  },
  {
    id: "prob-9",
    title: "Borewell Failure Causing Severe Water Shortage in Village Alpha",
    description: "Both major community borewells in Village Alpha have suffered mechanical failure, leaving 200 families without access to safe drinking water.",
    category: "Water & Sanitation",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    affectedPopulation: "1,000 people",
    priority: "High",
    matchScore: 91,
    status: "Unassigned",
    departments: ["Environmental Science", "Civil Engineering"],
    researchAreas: ["Rainwater Harvesting", "Slow Sand Filtration"],
    requiredExpertise: ["Gravity filtration", "Community water management"],
    disciplines: ["Civil Engineering", "Hydrogeology"],
    submissionDate: "2026-08-20",
  },
  {
    id: "prob-10",
    title: "Inadequate Cold Chain for Vaccines in Rural Gaya Health Centers",
    description: "Due to power fluctuations, vaccine storage at rural primary health centers in Gaya is frequently compromised, affecting infant immunizations.",
    category: "Healthcare & Sanitation",
    location: "Gaya, Bihar",
    state: "Bihar",
    district: "Gaya",
    affectedPopulation: "8,000 infants",
    priority: "High",
    matchScore: 94,
    status: "Active Project",
    departments: ["Electrical Engineering", "Renewable Energy Systems"],
    researchAreas: ["Solar Photovoltaics", "Battery Storage Systems"],
    requiredExpertise: ["Solar panel sizing", "Inverter load calculation"],
    disciplines: ["Electrical Engineering", "Healthcare Technology"],
    submissionDate: "2026-08-02",
  },
  {
    id: "prob-11",
    title: "Frequent Night Accidents on Coimbatore-Pollachi Rural Junction",
    description: "Poor lighting and lack of reflective indicators on a critical blind curve on the Coimbatore-Pollachi rural road lead to over 15 serious accidents annually.",
    category: "Infrastructure & Urban Development",
    location: "Coimbatore, Tamil Nadu",
    state: "Tamil Nadu",
    district: "Coimbatore",
    affectedPopulation: "15,000 commuters",
    priority: "High",
    matchScore: 82,
    status: "Under Review",
    departments: ["Civil Engineering", "Mechanical Engineering"],
    researchAreas: ["Road Safety Analysis", "Solar Lighting Solutions"],
    requiredExpertise: ["Traffic engineering", "Reflective indicator layout"],
    disciplines: ["Civil Engineering", "Safety Engineering"],
    submissionDate: "2026-08-08",
  },
  {
    id: "prob-12",
    title: "High Fluoride Concentration in Drinking Water of Ranchi Blocks",
    description: "Groundwater testing shows fluoride levels exceeding 3.0 mg/L in several Ranchi villages, causing skeletal and dental fluorosis among children.",
    category: "Water & Sanitation",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    affectedPopulation: "6,000 residents",
    priority: "High",
    matchScore: 93,
    status: "Interested",
    departments: ["Environmental Science", "Civil Engineering"],
    researchAreas: ["Adsorption filtration", "Water quality testing"],
    requiredExpertise: ["Fluoride mapping", "Activated alumina filtration"],
    disciplines: ["Environmental Science", "Chemical Engineering"],
    submissionDate: "2026-08-10",
  },
  {
    id: "prob-13",
    title: "Alkaline Soil Degradation in Ludhiana Farming Cluster",
    description: "Waterlogging and high water table have caused white salt encrustation on fertile wheat fields, reducing soil aeration and nutrient uptake.",
    category: "Agriculture & Food Tech",
    location: "Ludhiana, Punjab",
    state: "Punjab",
    district: "Ludhiana",
    affectedPopulation: "5,000 farmers",
    priority: "Medium",
    matchScore: 75,
    status: "Unassigned",
    departments: ["Agricultural Science", "Soil Agronomy"],
    researchAreas: ["Salinity Management", "Soil Biology"],
    requiredExpertise: ["Soil chemistry analysis", "Salinity mapping"],
    disciplines: ["Agricultural Science", "Agronomy"],
    submissionDate: "2026-08-14",
  },
  {
    id: "prob-14",
    title: "Crop Residue Management and Stubble Burning in Sangrur",
    description: "Lack of affordable stubble clearing machinery forces farmers in Sangrur to burn paddy straw, causing critical air quality drop and soil nutrient loss.",
    category: "Waste Management",
    location: "Sangrur, Punjab",
    state: "Punjab",
    district: "Sangrur",
    affectedPopulation: "25,000 residents",
    priority: "High",
    matchScore: 89,
    status: "Active Project",
    departments: ["Agricultural Science", "Renewable Energy Systems"],
    researchAreas: ["Biomass gasification", "Stubble management"],
    requiredExpertise: ["Biomass conversion", "Residue collection mechanics"],
    disciplines: ["Agricultural Engineering", "Energy Systems"],
    submissionDate: "2026-08-04",
  },
  {
    id: "prob-15",
    title: "Inefficient Traditional Cardamom Drying Methods in Alappuzha",
    description: "Smallholder cardamom growers rely on firewood-based cardamom curing which leads to uneven quality, high smoke pollution, and deforestation.",
    category: "Renewable Energy",
    location: "Alappuzha, Kerala",
    state: "Kerala",
    district: "Alappuzha",
    affectedPopulation: "1,100 growers",
    priority: "Medium",
    matchScore: 71,
    status: "Unassigned",
    departments: ["Mechanical Engineering", "Renewable Energy"],
    researchAreas: ["Solar thermal drying", "Cardamom curing"],
    requiredExpertise: ["Solar collector design", "Temperature regulation"],
    disciplines: ["Mechanical Engineering", "Thermal Engineering"],
    submissionDate: "2026-08-20",
  }
];

const INITIAL_CLUSTERS: ProblemCluster[] = [
  {
    id: "cluster-1",
    primaryProblemId: "prob-1",
    primaryTitle: "Drinking Water Scarcity and Contamination in Ranchi Rural Blocks",
    category: "Water & Sanitation",
    district: "Ranchi",
    state: "Jharkhand",
    memberProblemIds: ["prob-1", "prob-7", "prob-8", "prob-9"],
    status: "ACTIVE",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-20",
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
    requiredExpertise: ["Soil chemistry analysis", "Halophilic microbes", "Sustainable farming outreach"],
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
  {
    problemId: "prob-7",
    category: "Water & Sanitation",
    subcategory: "Rural Drinking Water Scarcity",
    summary: "Village Alpha residents walk 2km to a contaminated pond due to borewell failure.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Groundwater mapping", "Gravity filtration"],
    suggestedDomains: ["Rainwater Harvesting", "Slow Sand Filtration"],
    analyzedAt: "2026-08-18",
    reviewStatus: "PENDING",
  },
  {
    problemId: "prob-8",
    category: "Water & Sanitation",
    subcategory: "Community Water Access",
    summary: "Complete lack of water pipeline in Village Alpha forces ingestion of pond water.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Groundwater mapping", "Community water management"],
    suggestedDomains: ["Rainwater Harvesting", "Gravity Filtration"],
    analyzedAt: "2026-08-19",
    reviewStatus: "PENDING",
  },
  {
    problemId: "prob-9",
    category: "Water & Sanitation",
    subcategory: "Community Borewell Failure",
    summary: "200 families without drinking water due to mechanical failure of Ranchi borewells.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Gravity filtration", "Community water management"],
    suggestedDomains: ["Rainwater Harvesting", "Slow Sand Filtration"],
    analyzedAt: "2026-08-20",
    reviewStatus: "PENDING",
  },
  {
    problemId: "prob-10",
    category: "Healthcare & Sanitation",
    subcategory: "Vaccine Preservation Cold Chain",
    summary: "Unstable power causing temperature compromise for child immunizations in Gaya.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "CRITICAL",
    requiredExpertise: ["Solar panel sizing", "Inverter load calculation"],
    suggestedDomains: ["Solar Photovoltaics", "Battery Storage Systems"],
    analyzedAt: "2026-08-02",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-11",
    category: "Infrastructure & Urban Development",
    subcategory: "Traffic Safety Blind Junctions",
    summary: "Coimbatore-Pollachi rural junction blind curve causing 15 night accidents yearly.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Traffic engineering", "Reflective indicator layout"],
    suggestedDomains: ["Road Safety Analysis", "Solar Lighting Solutions"],
    analyzedAt: "2026-08-08",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-12",
    category: "Water & Sanitation",
    subcategory: "Groundwater Fluoride Contamination",
    summary: "Groundwater fluoride exceeding 3mg/L in Ranchi villages causing fluorosis.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "HIGH",
    requiredExpertise: ["Fluoride mapping", "Activated alumina filtration"],
    suggestedDomains: ["Adsorption filtration", "Water quality testing"],
    analyzedAt: "2026-08-10",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-13",
    category: "Agriculture & Food Tech",
    subcategory: "Alkaline Soil Remediation",
    summary: "Waterlogging caused salt encrustation on Ludhiana fields reducing aeration.",
    severity: "MEDIUM",
    affectedArea: "RURAL",
    impactLevel: "MEDIUM",
    requiredExpertise: ["Soil chemistry analysis", "Salinity mapping"],
    suggestedDomains: ["Salinity Management", "Soil Biology"],
    analyzedAt: "2026-08-14",
    reviewStatus: "PENDING",
  },
  {
    problemId: "prob-14",
    category: "Waste Management",
    subcategory: "Crop Stubble Burning",
    summary: "Stubble burning in Sangrur causing severe air quality drop and soil damage.",
    severity: "HIGH",
    affectedArea: "RURAL",
    impactLevel: "CRITICAL",
    requiredExpertise: ["Biomass conversion", "Residue collection mechanics"],
    suggestedDomains: ["Biomass gasification", "Stubble management"],
    analyzedAt: "2026-08-04",
    reviewStatus: "ACCEPTED",
  },
  {
    problemId: "prob-15",
    category: "Renewable Energy",
    subcategory: "Solar Agri Dryers",
    summary: "Traditional wood curing of cardamom causing smoke pollution in Alappuzha.",
    severity: "MEDIUM",
    affectedArea: "RURAL",
    impactLevel: "MEDIUM",
    requiredExpertise: ["Solar collector design", "Temperature regulation"],
    suggestedDomains: ["Solar thermal drying", "Cardamom curing"],
    analyzedAt: "2026-08-20",
    reviewStatus: "PENDING",
  }
];

const INITIAL_TEAMS: UniversityTeam[] = [
  {
    id: "team-1",
    universityId: "univ-1",
    name: "Team Jal-Dhara",
    facultyMentor: "Dr. Ramesh Kumar (Environmental Science)",
    studentMembers: ["Amit Sharma (MTech)", "Pooja Patel (BTech)", "Vikram Singh (PhD)"],
    requiredSkills: ["Groundwater hydrology", "Water filtration systems", "Piping design"],
    assignedProblemId: "prob-1",
    assignedProblemTitle: "Drinking Water Scarcity and Contamination in Ranchi Rural Blocks",
    status: "Active",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-available-1",
    universityId: "univ-1",
    name: "Jal-Dhara Research Team",
    facultyMentor: "Dr. Rajesh Shah (Environmental Science)",
    studentMembers: ["Vijay Kumar (MTech)", "Nisha Patel (BTech)"],
    requiredSkills: ["Water Engineering", "Environmental Science", "Rural Infrastructure", "Water filtration systems", "Gravity filtration", "IoT"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-available-2",
    universityId: "univ-1",
    name: "AquaTech Research Group",
    facultyMentor: "Dr. Sunita Rao (Civil Engineering)",
    studentMembers: ["Anil Rao (MTech)", "Meera Nair (PhD)"],
    requiredSkills: ["Water Management", "IoT", "Environmental Engineering", "Sensors"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-available-3",
    universityId: "univ-1",
    name: "Rural Innovation Team",
    facultyMentor: "Dr. Amit Verma (Social Work)",
    studentMembers: ["John Doe (MA)", "Jane Smith (MA)"],
    requiredSkills: ["Rural Development", "Water filtration systems", "Community Outreach"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-suspended",
    universityId: "univ-1",
    name: "Suspended Hydro-Lab",
    facultyMentor: "Dr. Broken Link (Environmental Science)",
    studentMembers: ["Nobody (PhD)"],
    requiredSkills: ["Water filtration systems"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "SUSPENDED"
  },
  {
    id: "team-iisc-inactive",
    universityId: "univ-1",
    name: "Inactive Tech Group",
    facultyMentor: "Dr. Sleep Mode (Civil Engineering)",
    studentMembers: ["Nobody (PhD)"],
    requiredSkills: ["Gravity filtration"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "INACTIVE"
  },
  {
    id: "team-2",
    universityId: "univ-4",
    name: "SolarEdu Scholars",
    facultyMentor: "Prof. Anjali Devi (Electrical Engineering)",
    studentMembers: ["Rahul Mehta (BTech)", "Sneha Roy (BTech)"],
    requiredSkills: ["Solar microgrid design", "Battery management", "Load analysis"],
    assignedProblemId: "prob-10",
    assignedProblemTitle: "Inadequate Cold Chain for Vaccines in Rural Gaya Health Centers",
    status: "Active",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-3",
    universityId: "univ-2",
    name: "Soil Remediation Taskforce",
    facultyMentor: "Dr. Sanjay Dutt (Biotechnology)",
    studentMembers: ["Nikhil Gupta (MSc)", "Kriti Sen (BTech)"],
    requiredSkills: ["Bio-remediation", "Soil chemical analysis", "Microbial culture"],
    assignedProblemId: "prob-2",
    assignedProblemTitle: "Crop Yield Reduction due to Soil Salinity in Sangrur agricultural belt",
    status: "Active",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-4",
    universityId: "univ-5",
    name: "Tribal Education Hub",
    facultyMentor: "Dr. Priyadarshini Mohanty (Social Work)",
    studentMembers: ["Rashmi Naik (MA)", "Alok Das (PhD)"],
    requiredSkills: ["Vernacular Pedagogy", "Community Outreach", "Tablet Config"],
    assignedProblemId: "prob-5",
    assignedProblemTitle: "High School Dropout Rates in Tribal Districts of Mayurbhanj",
    status: "Active",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-5",
    universityId: "univ-3",
    name: "CleanSort Automators",
    facultyMentor: "Prof. Vinay Deshmukh (Mechanical Engineering)",
    studentMembers: ["Amit Kulkarni (BTech)", "Seema Deshpande (BTech)"],
    requiredSkills: ["Object detection (YOLO)", "Conveyor belt mechanics", "Routing optimization"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-6",
    universityId: "univ-2",
    name: "Agri-Bioenergy Group",
    facultyMentor: "Dr. Gurbaksh Singh (Renewable Energy Systems)",
    studentMembers: ["Balpreet Kaur (MTech)", "Gurmeet Singh (BTech)"],
    requiredSkills: ["Biomass conversion", "Gasification", "Agricultural residue management", "Stubble management"],
    assignedProblemId: "prob-14",
    assignedProblemTitle: "Crop Residue Management and Stubble Burning in Sangrur",
    status: "Active",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-7",
    universityId: "univ-3",
    name: "AeroDrone Surveyors",
    facultyMentor: "Dr. Ramesh Patil (Computer Science)",
    studentMembers: ["Amit Patil (MTech)", "Vikram Gadre (BTech)"],
    requiredSkills: ["Computer Vision", "GIS Mapping", "Drone sensor calibration", "Traffic engineering", "Reflective indicator layout"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "ACTIVE"
  },
  {
    id: "team-8",
    universityId: "univ-4",
    name: "Eco-Water Tech Group",
    facultyMentor: "Prof. Manoj Jha (Civil Engineering)",
    studentMembers: ["Shreya Sinha (MTech)", "Ananya Sen (PhD)"],
    requiredSkills: ["Fluoride filtering", "Adsorption materials", "Hydrogeology", "Activated alumina filtration", "Fluoride mapping"],
    assignedProblemId: null,
    assignedProblemTitle: null,
    status: "Available",
    teamStatus: "ACTIVE"
  }
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
    universityId: "univ-2",
    universityName: "Punjab Agricultural University",
    status: "ASSIGNED",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-20",
  },
  {
    id: "int-3",
    problemId: "prob-3",
    universityId: "univ-3",
    universityName: "College of Engineering Pune",
    status: "INTERESTED",
    createdAt: "2026-08-15",
    updatedAt: "2026-08-15",
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
    universityId: "univ-5",
    universityName: "Utkal University",
    status: "ASSIGNED",
    createdAt: "2025-08-10",
    updatedAt: "2025-09-05",
  },
  {
    id: "int-6",
    problemId: "prob-10",
    universityId: "univ-4",
    universityName: "National Institute of Technology Patna",
    status: "ASSIGNED",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05",
  },
  {
    id: "int-7",
    problemId: "prob-11",
    universityId: "univ-3",
    universityName: "College of Engineering Pune",
    status: "ASSIGNED",
    createdAt: "2026-08-10",
    updatedAt: "2026-08-10",
  },
  {
    id: "int-8",
    problemId: "prob-12",
    universityId: "univ-1",
    universityName: "Indian Institute of Science",
    status: "INTERESTED",
    createdAt: "2026-08-12",
    updatedAt: "2026-08-12",
  },
  {
    id: "int-9",
    problemId: "prob-14",
    universityId: "univ-2",
    universityName: "Punjab Agricultural University",
    status: "ASSIGNED",
    createdAt: "2026-08-06",
    updatedAt: "2026-08-06",
  }
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
    universityId: "univ-2",
    problemUnderstanding: "Soil salinity has reduced wheat yields in Sangrur by 40%.",
    proposedApproach: "Deploy halophilic bio-fertilizers and salt-tolerant organic soil conditioners to restore soil microbiota.",
    expectedImpact: "Increase crop yield by 20% in the first season, reduce reliance on chemical inputs.",
    resourceRequirements: "Microbial strains, lab cultivation equipment, field trial materials.",
    timeline: "6 months",
    status: "ACCEPTED",
    createdAt: "2026-08-22",
    updatedAt: "2026-08-25",
    submittedAt: "2026-08-22",
  },
  {
    id: "prop-3",
    title: "Solar-Powered Cold Chain for Vaccine Preservation",
    problemId: "prob-10",
    teamId: "team-2",
    universityId: "univ-4",
    problemUnderstanding: "Power cuts compromise child vaccine efficacy at rural clinics in Gaya.",
    proposedApproach: "Deploy off-grid solar cooling units with LiFePO4 batteries and remote voltage monitoring.",
    expectedImpact: "Ensure 100% cold chain integrity, benefiting rural infant immunizations.",
    resourceRequirements: "Solar modules, battery packs, inverter kits, thermal insulation.",
    timeline: "5 months",
    status: "ACCEPTED",
    createdAt: "2026-08-08",
    updatedAt: "2026-08-10",
    submittedAt: "2026-08-08",
  },
  {
    id: "prop-4",
    title: "Vernacular E-Learning Kits for Tribal Youth",
    problemId: "prob-5",
    teamId: "team-4",
    universityId: "univ-5",
    problemUnderstanding: "High dropouts due to language barriers and economic stress in Mayurbhanj villages.",
    proposedApproach: "Deploy offline digital tablet learning suites coded with local tribal dialects.",
    expectedImpact: "Reduce post-grade 8 dropouts by 25% across Mayurbhanj primary schools.",
    resourceRequirements: "Rugged learning tablets, dialect audio mapping, community guides.",
    timeline: "10 months",
    status: "ACCEPTED",
    createdAt: "2025-08-20",
    updatedAt: "2025-09-01",
    submittedAt: "2025-08-20",
  },
  {
    id: "prop-5",
    title: "Biomass Gasification for Crop Straw",
    problemId: "prob-14",
    teamId: "team-6",
    universityId: "univ-2",
    problemUnderstanding: "Stubble burning in Sangrur triggers hazardous seasonal air pollution and soil damage.",
    proposedApproach: "Design community scale gasifiers to process straw residue into clean syngas and biochar.",
    expectedImpact: "Eliminate crop residue burning across 3 cooperative village farming blocks.",
    resourceRequirements: "Metal sheets, gas filter elements, thermal insulation, blower motors.",
    timeline: "6 months",
    status: "ACCEPTED",
    createdAt: "2026-08-10",
    updatedAt: "2026-08-12",
    submittedAt: "2026-08-10",
  },
  {
    id: "prop-6",
    title: "Reflective and Smart Signage at Blind Curves in Coimbatore",
    problemId: "prob-11",
    teamId: "team-7",
    universityId: "univ-3",
    problemUnderstanding: "High rate of vehicle accidents on Coimbatore-Pollachi rural road at night.",
    proposedApproach: "Deploy retroreflective indicators and motion-activated solar LED blinkers.",
    expectedImpact: "Reduce curve night accidents by 60% with visual feedback warnings.",
    resourceRequirements: "Reflective sheeting, LED sensors, micro solar PV panels.",
    timeline: "3 months",
    status: "UNDER_REVIEW",
    createdAt: "2026-08-20",
    updatedAt: "2026-08-20",
    submittedAt: "2026-08-20",
  },
  {
    id: "prop-7",
    title: "Alumina Adsorption Filters for High Fluoride Groundwater",
    problemId: "prob-12",
    teamId: "team-iisc-available-2",
    universityId: "univ-1",
    problemUnderstanding: "Ranchi block groundwater has high fluoride causing skeletal and dental fluorosis.",
    proposedApproach: "Install community scale activated alumina filter setups in domestic supply tanks.",
    expectedImpact: "Bring fluoride levels below WHO limit of 1.5 mg/L in two target schools.",
    resourceRequirements: "Alumina filter tanks, adsorption media, testing reagents.",
    timeline: "4 months",
    status: "DRAFT",
    createdAt: "2026-08-25",
    updatedAt: "2026-08-25",
  },
  {
    id: "prop-8",
    title: "Full-Scale Robotics Arm Waste Sorter",
    problemId: "prob-3",
    teamId: "team-5",
    universityId: "univ-3",
    problemUnderstanding: "mixed municipal waste in Pune overburdening recycling facilities.",
    proposedApproach: "Implement heavy high-throughput robotic arms with vision AI recognition.",
    expectedImpact: "Segregate solid recyclables at 10 tons per hour.",
    resourceRequirements: "Industrial robotic arms, pneumatic valves, GPU server rack.",
    timeline: "12 months",
    status: "REJECTED",
    createdAt: "2026-08-15",
    updatedAt: "2026-08-18",
    submittedAt: "2026-08-15",
  }
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: "act-1",
    text: "Project PB-2026-004 (Vernacular E-Learning Kits) verified and completed by Platform Administration.",
    timestamp: "Just now",
  },
  {
    id: "act-2",
    text: "Project PB-2026-002 (Biotechnology for Soil Salinity) submitted for final government verification.",
    timestamp: "2 hours ago",
  },
  {
    id: "act-3",
    text: "Tata Steel CSR Foundation accepted funding request for Project PB-2026-001.",
    timestamp: "1 day ago",
  },
  {
    id: "act-4",
    text: "Proposal 'Solar-Powered Cold Chain' submitted by National Institute of Technology Patna.",
    timestamp: "2 days ago",
  },
  {
    id: "act-5",
    text: "Team 'Agri-Bioenergy Group' assigned to Crop Residue Management challenge.",
    timestamp: "3 days ago",
  },
  {
    id: "act-6",
    text: "Problem report 'High School Dropout Rates' validated by field coordinators.",
    timestamp: "5 days ago",
  }
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
      university: "Indian Institute of Science (IISc)",
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
    ],
    activities: [
      { text: "Field excavation started at Ranchi rural site", performedBy: "Team Jal-Dhara", date: "26 Aug 2026", time: "14:20", type: "milestone" },
      { text: "Lab prototype of sand filter verified", performedBy: "Dr. Ramesh Kumar", date: "25 Aug 2026", time: "11:30", type: "testing" },
      { text: "Project proposal approved by CSR division", performedBy: "Tata CSR Board", date: "18 Aug 2026", time: "16:10", type: "proposal" },
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
      university: "Punjab Agricultural University (PAU)",
      industryPartner: "IFFCO AgriTech CSR Division",
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
    impactAssessment: {
      farmersSupported: 1200,
      villagesCovered: 5,
      problemImprovement: "40% reduction in soil salinity in trial plots",
      outcomes: "Halophilic bio-fertilizers successfully applied across 50 test plots",
      actualResult: "Crop yield increased by 22% in trial farming fields."
    },
  },
  {
    id: "PB-2026-003",
    title: "Solar-Powered Cold Chain for Vaccine Preservation",
    problemId: "prob-10",
    teamId: "team-2",
    proposalId: "prop-3",
    stage: "IMPACT_ASSESSMENT",
    customProgress: 90,
    startDate: "10 August 2026",
    expectedCompletionDate: "10 January 2027",
    collaboration: {
      university: "National Institute of Technology Patna (NITP)",
      industryPartner: "ReNew Power Social Impact Division",
      governmentAuthority: "Gaya District Health Office",
      agreementStatus: "Active",
      agreementType: "Tripartite MoU",
      startDate: "10 August 2026",
      endDate: "10 January 2027",
      funding: "₹9,50,000",
      coordinator: "Prof. Anjali Devi",
    },
    documents: [
      { name: "PV Sizing Calculation Report", type: "PDF", status: "Active", size: "1.8 MB", uploadedDate: "10 Aug 2026" },
    ],
    activities: [
      { text: "Smart charge controllers configured", performedBy: "SolarEdu Scholars", date: "22 Aug 2026", time: "12:00", type: "milestone" },
    ]
  },
  {
    id: "PB-2026-004",
    title: "Vernacular E-Learning Kits",
    problemId: "prob-5",
    teamId: "team-4",
    proposalId: "prop-4",
    stage: "COMPLETED",
    customProgress: 100,
    startDate: "01 September 2025",
    expectedCompletionDate: "30 June 2026",
    verificationEvidenceStatus: "VERIFIED",
    collaboration: {
      university: "Utkal University",
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
      { name: "Final Impact Report", type: "PDF", status: "Completed", size: "5.2 MB", uploadedDate: "15 Jun 2026" },
    ],
    activities: [
      { text: "Final completion certificate issued by District Collector Office", performedBy: "District Collector", date: "30 Jun 2026", time: "17:00", type: "completion" },
      { text: "End-line impact assessment survey completed and compiled", performedBy: "Dr. Priyadarshini Mohanty", date: "15 Jun 2026", time: "14:30", type: "survey" },
    ],
    impactAssessment: {
      peopleBenefited: 1800,
      schoolsReached: 20,
      problemImprovement: "Significant increase in school attendance and digital literacy",
      outcomes: "150 offline learning tablets deployed across rural Gaya/Mayurbhanj districts",
      actualResult: "Reduced tribal dropout rates by 25% over one academic year."
    },
  },
  {
    id: "PB-2026-005",
    title: "Biomass Gasification for Crop Straw",
    problemId: "prob-14",
    teamId: "team-6",
    proposalId: "prop-5",
    stage: "IMPLEMENTATION",
    customProgress: 60,
    startDate: "12 August 2026",
    expectedCompletionDate: "12 February 2027",
    collaboration: {
      university: "Punjab Agricultural University (PAU)",
      industryPartner: "IFFCO AgriTech CSR Division",
      governmentAuthority: "Punjab Stubble Pollution Control Board",
      agreementStatus: "Active",
      agreementType: "Research Partnership",
      startDate: "12 August 2026",
      endDate: "12 February 2027",
      funding: "₹8,20,000",
      coordinator: "Dr. Gurbaksh Singh",
    },
    documents: [
      { name: "Gasification blueprint", type: "PDF", status: "Active", size: "3.2 MB", uploadedDate: "12 Aug 2026" },
    ],
    activities: [
      { text: "Draft spec finalized", performedBy: "Dr. Gurbaksh Singh", date: "15 Aug 2026", time: "10:30", type: "milestone" },
    ]
  }
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
      if (m.dueDate) {
        const remaining = getDaysRemainingText(m.dueDate);
        if (remaining && remaining.isOverdue) {
          status = "Overdue";
        }
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

// Deterministic Project Health Utility
export function getProjectHealth(project: ResolvedProject): "ON TRACK" | "AT RISK" | "DELAYED" | "AWAITING VERIFICATION" | "COMPLETED" {
  if (project.stage === "COMPLETED") return "COMPLETED";
  if (project.stage === "AWAITING_ADMIN_VERIFICATION") return "AWAITING VERIFICATION";

  const hasOverdue = project.milestones.some(m => {
    if (m.status === "Completed") return false;
    if (m.dueDate) {
      const remaining = getDaysRemainingText(m.dueDate);
      return remaining?.isOverdue === true;
    }
    return false;
  });

  if (hasOverdue) return "DELAYED";

  const currentMilestone = project.milestones.find(m => m.status === "Current");
  if (currentMilestone && currentMilestone.dueDate) {
    const remaining = getDaysRemainingText(currentMilestone.dueDate);
    if (remaining && !remaining.isOverdue) {
      const current = new Date("2026-08-26");
      const due = new Date(currentMilestone.dueDate);
      const diffTime = due.getTime() - current.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Under 7 days and project progress is low
      if (diffDays >= 0 && diffDays <= 7 && project.progress < 80) {
        return "AT RISK";
      }
    }
  }

  return "ON TRACK";
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

    // 1. Audit Log: Citizen problem submitted
    this.addActivity(`Citizen problem submitted: "${created.title}" (${created.id}) in ${created.location}.`, {
      actor: "Ravi Kumar",
      actorRole: "CITIZEN",
      action: "Citizen problem submitted",
      entityType: "PROBLEM",
      entityId: created.id,
      entityName: created.title,
      newState: "Unassigned"
    });

    // 2. Audit Log: AI analysis completed
    this.addActivity(`AI analysis completed for problem "${created.title}" (${created.id}). Category: ${created.category}, Priority: ${created.priority}.`, {
      actor: "Gemini AI Engine",
      actorRole: "ADMIN",
      action: "AI analysis completed",
      entityType: "PROBLEM",
      entityId: created.id,
      entityName: created.title,
      newState: "Unassigned"
    });

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
    const unregisteredProblems = allProblems.filter((p) => !registeredProblemIds.has(p.id));

    const seedUniversityIds = ["univ-1", "univ-2", "univ-3", "univ-4", "univ-5"];
    if (seedUniversityIds.includes(universityId)) {
      return unregisteredProblems;
    }

    // For newly registered custom universities, filter based on relevance:
    const universities = this.getUniversities();
    const u = universities.find(univ => univ.id === universityId);
    if (!u) {
      return [];
    }

    return unregisteredProblems.filter(p => {
      // Must be validated by admin (which translates to "Interested" status in the mock system)
      if (p.status !== "Interested") {
        return false;
      }
      
      const rec = this.getRecommendationForUniversity(p.id, universityId);
      if (!rec) return false;

      // Geographically relevant (same state or district) AND domain relevant (match score >= 50)
      const sameDistrict = u.district.toLowerCase() === p.district.toLowerCase();
      const sameState = u.state.toLowerCase() === p.state.toLowerCase();
      const score = rec.score;
      const isDomainRelevant = score >= 50;

      return (sameDistrict || sameState) && isDomainRelevant;
    });
  },

  getUniversities(): any[] {
    const custom = getStoredData<any[]>("uni_custom_universities", []);
    const merged = [...DEMO_UNIVERSITIES];
    for (const c of custom) {
      if (!merged.some(u => u.id === c.id)) {
        merged.push(c);
      }
    }
    return merged;
  },

  registerCustomUniversity(details: any, profile: any): void {
    if (!details || !details.id) return;
    const custom = getStoredData<any[]>("uni_custom_universities", []);
    if (!custom.some(u => u.id === details.id)) {
      const parts = (details.location || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      const state = details.state || (parts.length > 1 ? parts[1] : profile.state) || "";
      const district = details.district || (parts.length > 0 ? parts[0] : profile.district) || "";
      const newUniv = {
        id: details.id,
        name: details.name,
        location: details.location || `${district}, ${state}`,
        state: state,
        district: district,
        departments: [profile.department || "General Engineering", "Research & Development"],
        researchAreas: ["Urban Drainage", "Water Treatment", "Renewable Energy", "Environmental Engineering"],
        expertise: ["Sustainable Solutions", "Community Development"],
        facilities: ["Advanced Engineering Labs"],
        previousProjects: [],
        status: "ACTIVE"
      };
      custom.push(newUniv);
      setStoredData("uni_custom_universities", custom);
    }
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

    this.addActivity(`Team "${teams[teamIndex].name}" (${teamId}) assigned to localized problem "${problems[probIndex].title}" (${problemId}).`, {
      actor: team.facultyMentor,
      actorRole: "UNIVERSITY",
      action: "Team assigned",
      entityType: "TEAM",
      entityId: teamId,
      entityName: team.name,
      newState: "Assigned"
    });
  },

  // Smart Matching Recommendations API
  getProblemMatches(problemId: string): ProblemMatchResult | undefined {
    const problem = this.getProblemById(problemId);
    if (!problem) return undefined;

    const analysis = this.getProblemAnalysis(problemId);
    return matchProblem(problem, analysis);
  },

  getUniversityRecommendations(problemId: string): UniversityMatchResult[] {
    const problem = this.getProblemById(problemId);
    if (!problem) return [];

    const analysis = this.getProblemAnalysis(problemId);
    const interests = this.getInterests().filter(
      (i) => i.problemId === problemId && i.status !== "WITHDRAWN"
    );
    const registeredUniversityIds = new Set(interests.map((i) => i.universityId));
    
    return getUniversityRecommendations(problem, analysis, registeredUniversityIds);
  },

  getRecommendationForUniversity(problemId: string, universityId: string): UniversityMatchResult | undefined {
    // We want to calculate the score even if the university has registered interest
    // because why-matches displays for registered problems too.
    // So we call getUniversityRecommendations with an empty set of registeredUniversityIds to bypass filtering
    const problem = this.getProblemById(problemId);
    if (!problem) return undefined;

    const analysis = this.getProblemAnalysis(problemId);
    const recommendations = getUniversityRecommendations(problem, analysis, new Set<string>());
    return recommendations.find(r => r.universityId === universityId);
  },

  getTeamRecommendationsForProblem(problemId: string, universityId: string): TeamMatchResult[] {
    const problem = this.getProblemById(problemId);
    if (!problem) return [];

    const analysis = this.getProblemAnalysis(problemId);
    const allTeams = this.getTeams();
    const universities = DEMO_UNIVERSITIES;

    // Map UniversityTeam to ResearchTeamProfile structure
    const mappedProfiles = allTeams.map((t) => {
      let department = "Environmental Science";
      if (t.facultyMentor.includes("(") && t.facultyMentor.includes(")")) {
        const matches = t.facultyMentor.match(/\(([^)]+)\)/);
        if (matches && matches[1]) {
          department = matches[1];
        }
      }

      const u = universities.find((univ) => univ.id === t.universityId);

      return {
        id: t.id,
        name: t.name,
        universityId: t.universityId || "univ-1",
        universityName: u ? u.name : "Indian Institute of Science",
        department,
        facultyMentor: t.facultyMentor.split(" (")[0],
        skills: t.requiredSkills,
        status: t.status,
        previousWork: t.id === "team-1" || t.id === "team-iisc-available-1"
          ? ["Ranchi Sand Filter Deployment", "Village Well Water Quality Audit"]
          : t.id === "team-iisc-available-2"
          ? ["Urban Water Distribution Retrofit"]
          : t.id === "team-2"
          ? ["Gaya Primary School Solar Rooftop Installation"]
          : t.id === "team-3"
          ? ["Sangrur Bio-fertilizer Field Trial"]
          : t.id === "team-4"
          ? ["Mayurbhanj Offline Tablet Deployment"]
          : t.id === "team-5"
          ? ["Pune Municipal Bin Sensor System"]
          : [],
        teamStatus: t.teamStatus || "ACTIVE"
      };
    });

    // Exclude teams already assigned to ANY OTHER problem
    const availableProfiles = mappedProfiles.filter(profile => {
      const originalTeam = allTeams.find(at => at.id === profile.id);
      return originalTeam && (originalTeam.assignedProblemId === null || originalTeam.assignedProblemId === problemId);
    });

    return getTeamRecommendationsForProblem(problem, analysis, universityId, availableProfiles, universities);
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
      const prevStatus = problems[probIdx].status;
      if (problems[probIdx].status === "Unassigned") {
        problems[probIdx].status = "Interested";
        setStoredData("uni_problems", problems);
      }
      this.addActivity(`University expressed interest in problem: "${problems[probIdx].title}" (${problemId}).`, {
        actor: universityName,
        actorRole: "UNIVERSITY",
        action: "University expressed interest",
        entityType: "PROBLEM",
        entityId: problemId,
        entityName: problems[probIdx].title,
        previousState: prevStatus,
        newState: problems[probIdx].status
      });
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
  getTeams(universityId?: string): UniversityTeam[] {
    const all = getStoredData<UniversityTeam[]>("uni_teams", INITIAL_TEAMS);
    if (universityId) {
      return all.filter(t => t.universityId === universityId);
    }
    return all;
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
  approveProposal(proposalId: string, adminUserId = "admin-1", note?: string): { proposal: SolutionProposal; project: UniversityProject; isNew: boolean } {
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

    // 1. Audit Log: Proposal approved
    this.addActivity(`Proposal "${proposal.title}" (${proposalId}) approved by Administration.${note ? ` Note: ${note}` : ""}`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: "Proposal approved",
      entityType: "PROPOSAL",
      entityId: proposalId,
      entityName: proposal.title,
      previousState: "SUBMITTED",
      newState: "ACCEPTED",
      note: note
    });

    // 2. Audit Log: Project created
    this.addActivity(`Project "${newProject.title}" (${newProjectId}) created from approved proposal.`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: "Project created",
      entityType: "PROJECT",
      entityId: newProjectId,
      entityName: newProject.title,
      newState: "PROPOSAL_APPROVED"
    });

    try {
      notificationService.createNotification({
        userId: proposal.universityId,
        role: "UNIVERSITY",
        type: "PROPOSAL_APPROVED",
        priority: "HIGH",
        title: "Proposal Approved — Project Created",
        message: `Your proposal "${proposal.title}" was approved. Project ${newProjectId} is now active.`,
        entityType: "PROJECT",
        entityId: newProjectId,
        actionUrl: `/university/projects/${newProjectId}`,
        isActionRequired: false,
      });
    } catch (e) { console.error(e); }

    return { proposal: proposals[propIdx], project: newProject, isNew: true };
  },

  rejectProposal(proposalId: string, reason?: string): SolutionProposal {
    const proposals = getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
    const idx = proposals.findIndex((p) => p.id === proposalId);

    if (idx === -1) {
      throw new Error("Proposal not found.");
    }

    const previous = proposals[idx].status;
    proposals[idx].status = "REJECTED";
    proposals[idx].updatedAt = new Date().toISOString().split("T")[0];
    setStoredData("uni_proposals", proposals);

    this.addActivity(`Proposal "${proposals[idx].title}" (${proposalId}) rejected by Administration.${reason ? ` Reason: ${reason}` : ""}`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: "Proposal rejected",
      entityType: "PROPOSAL",
      entityId: proposalId,
      entityName: proposals[idx].title,
      previousState: previous,
      newState: "REJECTED",
      note: reason
    });

    try {
      notificationService.createNotification({
        userId: proposals[idx].universityId,
        role: "UNIVERSITY",
        type: "PROPOSAL_REJECTED",
        priority: "MEDIUM",
        title: "Proposal Not Approved",
        message: `Your proposal "${proposals[idx].title}" was not approved by Administration. You may revise and resubmit.`,
        entityType: "PROPOSAL",
        entityId: proposalId,
        actionUrl: `/university/proposals`,
        isActionRequired: false,
      });
    } catch (e) { console.error(e); }

    return proposals[idx];
  },

  requestProposalClarification(proposalId: string, reason?: string): SolutionProposal {
    const proposals = getStoredData<SolutionProposal[]>("uni_proposals", INITIAL_PROPOSALS);
    const idx = proposals.findIndex((p) => p.id === proposalId);

    if (idx === -1) {
      throw new Error("Proposal not found.");
    }

    const previous = proposals[idx].status;
    proposals[idx].status = "UNDER_REVIEW";
    proposals[idx].updatedAt = new Date().toISOString().split("T")[0];
    setStoredData("uni_proposals", proposals);

    this.addActivity(`Clarification requested for proposal "${proposals[idx].title}" (${proposalId}) by Administration.${reason ? ` Reason: ${reason}` : ""}`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: "Proposal clarification requested",
      entityType: "PROPOSAL",
      entityId: proposalId,
      entityName: proposals[idx].title,
      previousState: previous,
      newState: "UNDER_REVIEW",
      note: reason
    });
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

  addActivity(
    text: string,
    metadata?: {
      actor?: string;
      actorRole?: "CITIZEN" | "UNIVERSITY" | "INDUSTRY" | "ADMIN";
      action?: string;
      entityType?: "PROBLEM" | "PROPOSAL" | "PROJECT" | "TEAM" | "INTEREST" | "SUPPORT_REQUEST" | "IMPACT_ASSESSMENT";
      entityId?: string;
      entityName?: string;
      previousState?: string;
      newState?: string;
      note?: string;
    }
  ): void {
    const activities = this.getActivities();
    const newActivity: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    activities.unshift(newActivity);
    setStoredData("uni_activities", activities.slice(0, 500));
  },

  // Projects API
  getProjects(): UniversityProject[] {
    return getStoredData<UniversityProject[]>("uni_projects", INITIAL_PROJECTS);
  },

  getProjectsForUniversity(universityId = "univ-1"): UniversityProject[] {
    const allProjects = this.getProjects();
    const seedUniversityIds = ["univ-1", "univ-2", "univ-3", "univ-4", "univ-5"];
    if (seedUniversityIds.includes(universityId)) {
      return allProjects;
    }
    
    // For custom universities, filter by checking teamId or proposalId
    const univProposals = this.getAllProposalsForAdmin().filter(p => p.universityId === universityId);
    const univProposalIds = new Set(univProposals.map(p => p.id));
    const univTeams = this.getTeams().filter(t => t.universityId === universityId);
    const univTeamIds = new Set(univTeams.map(t => t.id));

    return allProjects.filter(
      (proj) => 
        (proj.proposalId && univProposalIds.has(proj.proposalId)) || 
        (proj.teamId && univTeamIds.has(proj.teamId))
    );
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
    this.addActivity(`Project "${projects[idx].title}" (${projectId}) verified and completed by Platform Administration.`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: "Project completed",
      entityType: "PROJECT",
      entityId: projectId,
      entityName: projects[idx].title,
      previousState: "AWAITING_ADMIN_VERIFICATION",
      newState: "COMPLETED",
      note: note
    });

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
    this.addActivity(`Additional verification evidence requested for project "${projects[idx].title}" (${projectId}). Note: ${note.trim()}`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: "Verification evidence requested",
      entityType: "PROJECT",
      entityId: projectId,
      entityName: projects[idx].title,
      previousState: "AWAITING_ADMIN_VERIFICATION",
      newState: "IMPACT_ASSESSMENT",
      note: note.trim()
    });

    return projects[idx];
  },

  returnProjectForCorrection(projectId: string, note: string, userRole = "ADMIN"): UniversityProject {
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can return projects for correction.");
    }

    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) {
      throw new Error("Project not found.");
    }

    projects[idx].stage = "IMPLEMENTATION";
    projects[idx].verificationEvidenceStatus = "NEEDS_REVISION";
    projects[idx].completionVerificationNote = note.trim();

    const today = new Date().toISOString().split("T")[0];
    projects[idx].activities.unshift({
      text: `Project returned for correction: ${note.trim()}`,
      performedBy: "Platform Administration",
      date: today,
      time: "12:00",
      type: "verification_revision",
    });

    setStoredData("uni_projects", projects);
    this.addActivity(`Project "${projects[idx].title}" (${projectId}) returned for correction by Platform Administration. Note: ${note.trim()}`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: "Project returned for correction",
      entityType: "PROJECT",
      entityId: projectId,
      entityName: projects[idx].title,
      previousState: "AWAITING_ADMIN_VERIFICATION",
      newState: "IMPLEMENTATION",
      note: note.trim()
    });

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
        id: problem.id,
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

  updateProblemStatus(
    problemId: string,
    status: "Unassigned" | "Interested" | "Under Review" | "Active Project" | "Rejected",
    userRole = "ADMIN",
    note?: string
  ): CommunityProblem {
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can validate or update problem status.");
    }
    const problems = this.getProblems();
    const idx = problems.findIndex((p) => p.id === problemId);
    if (idx === -1) {
      throw new Error("Problem not found.");
    }
    const previous = problems[idx].status;
    problems[idx].status = status as any;
    setStoredData("uni_problems", problems);

    const actionLabel = status === "Rejected" ? "Problem rejected" : "Problem validated";
    this.addActivity(`Admin updated problem "${problems[idx].title}" (${problemId}) status from "${previous}" to "${status}".${note ? ` Note: ${note}` : ""}`, {
      actor: "Sunita Rao",
      actorRole: "ADMIN",
      action: actionLabel,
      entityType: "PROBLEM",
      entityId: problemId,
      entityName: problems[idx].title,
      previousState: previous,
      newState: status,
      note: note
    });

    return problems[idx];
  },

  resetDemoData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("uni_problems");
      localStorage.removeItem("uni_interests");
      localStorage.removeItem("uni_teams");
      localStorage.removeItem("uni_proposals");
      localStorage.removeItem("uni_activities");
      localStorage.removeItem("uni_projects");
      localStorage.removeItem("ind_support_requests");
      localStorage.removeItem("ind_partnerships");
      localStorage.removeItem("pbridge_notifications");
      for (let i = 1; i <= 5; i++) {
        localStorage.removeItem(`ind_profile_ind-${i}`);
      }
      window.location.reload();
    }
  }
};
