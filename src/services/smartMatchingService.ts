import { ProblemAnalysis } from "./aiService";
import { CommunityProblem } from "./universityMockService";

export interface UniversityProfile {
  id: string;
  name: string;
  location: string;
  state: string;
  district: string;
  departments: string[];
  researchAreas: string[];
  expertise: string[];
  facilities: string[];
  previousProjects: string[];
}

export interface ResearchTeamProfile {
  id: string;
  name: string;
  universityId: string;
  universityName: string;
  department: string;
  facultyMentor: string;
  skills: string[];
  status: "Available" | "Active";
  previousWork: string[];
}

export interface IndustryProfile {
  id: string;
  name: string;
  orgType: string; // e.g. "Corporate CSR", "CleanTech Enterprise", "AgriTech NGO"
  location: string;
  state: string;
  district: string;
  expertise: string[];
  technologyCapabilities: string[];
  csrFocusAreas: string[];
  resources: string[];
  previousProjects: string[];
}

export interface EntityRecommendation {
  entityId: string;
  entityName: string;
  entityType: "UNIVERSITY" | "TEAM" | "INDUSTRY";
  matchScore: number; // 0 - 100
  matchLevel: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
  matchedExpertise: string[];
  missingCapabilities: string[];
  collaborationStatus?: "RECOMMENDED" | "INTERESTED" | "ACCEPTED" | "DECLINED";
}

export interface ProblemMatchResult {
  problemId: string;
  problemTitle: string;
  universities: EntityRecommendation[];
  teams: EntityRecommendation[];
  industries: EntityRecommendation[];
  generatedAt: string;
}

// ----------------------------------------------------
// Configurable Thresholds & Scoring Weights
// ----------------------------------------------------
export class MatchThresholds {
  static readonly HIGH = 80;
  static readonly MEDIUM = 60;
}

export class MatchWeights {
  static readonly CATEGORY = 25;
  static readonly EXPERTISE = 30;
  static readonly RESEARCH_AREA = 20;
  static readonly LOCATION = 10;
  static readonly PREVIOUS_EXPERIENCE = 10;
  static readonly RESOURCES = 5;
}

// ----------------------------------------------------
// Structured Entity Registries (Mock Database Source)
// ----------------------------------------------------
export const DEMO_UNIVERSITIES: UniversityProfile[] = [
  {
    id: "univ-1",
    name: "Indian Institute of Science (IISc)",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    departments: ["Environmental Science", "Civil Engineering", "Biotechnology", "Electrical Engineering"],
    researchAreas: ["Rainwater Harvesting", "Slow Sand Filtration", "Hydrogeology", "Solar Photovoltaics", "Soil Bioremediation"],
    expertise: ["Groundwater mapping", "Gravity filtration", "Community water management", "Solar microgrid design", "Soil chemistry analysis"],
    facilities: ["Advanced Water Quality Lab", "Solar Microgrid Testbed", "Bio-remediation Cultivation Facility"],
    previousProjects: ["Rural Water Filtration in Chota Nagpur", "Solar Microgrids for Tribal Schools"],
  },
  {
    id: "univ-2",
    name: "Punjab Agricultural University (PAU)",
    location: "Ludhiana, Punjab",
    state: "Punjab",
    district: "Sangrur",
    departments: ["Agricultural Science", "Soil Science & Agronomy", "Biotechnology"],
    researchAreas: ["Soil Bioremediation", "Salt-Tolerant Crops", "Organic Inputs", "Precision Agriculture"],
    expertise: ["Soil chemistry analysis", "Halophilic microbes", "Sustainable farming outreach", "Salinity mapping"],
    facilities: ["Soil Salinity Testing Lab", "Crop Genetic Research Farm"],
    previousProjects: ["Sangrur Soil Salinity Recovery Campaign", "Halophilic Bio-fertilizer Deployment"],
  },
  {
    id: "univ-3",
    name: "College of Engineering Pune (COEP)",
    location: "Pune, Maharashtra",
    state: "Maharashtra",
    district: "Pune",
    departments: ["Mechanical Engineering", "Computer Science", "Robotics"],
    researchAreas: ["Computer Vision Sorting", "Recycling Automation", "Urban Logistics", "AI/YOLO Sorting"],
    expertise: ["Object detection (YOLO)", "Conveyor belt mechanics", "Routing optimization", "Automated waste sorting"],
    facilities: ["Computer Vision Lab", "Automated Sorting Prototype Conveyor"],
    previousProjects: ["Pune Municipal Waste Sorting Pilot", "Automated Material Recovery Center"],
  },
  {
    id: "univ-4",
    name: "National Institute of Technology Patna (NITP)",
    location: "Patna, Bihar",
    state: "Bihar",
    district: "Gaya",
    departments: ["Electrical Engineering", "Renewable Energy Systems", "Computer Science"],
    researchAreas: ["Solar Photovoltaics", "Battery Storage Systems", "Microgrids", "E-learning Hardware"],
    expertise: ["Solar panel sizing", "Inverter load calculation", "LiFePO4 battery configuration", "Microgrid controllers"],
    facilities: ["Solar PV Characterization Lab", "Battery Energy Storage Testbed"],
    previousProjects: ["Gaya Rural Electrification Initiative", "Solar Powering Bihar Secondary Schools"],
  },
  {
    id: "univ-5",
    name: "Utkal University",
    location: "Bhubaneswar, Odisha",
    state: "Odisha",
    district: "Mayurbhanj",
    departments: ["Social Work", "Psychology", "Education", "Vernacular Linguistics"],
    researchAreas: ["Vernacular Pedagogy", "Community Learning Hubs", "E-learning Accessibility", "Tribal Outreach"],
    expertise: ["Curriculum design", "Tribal dialect translation", "Offline learning tablets", "Community facilitation"],
    facilities: ["Vernacular Content Studio", "Tribal Community Resource Center"],
    previousProjects: ["Mayurbhanj Tribal Literacy Drive", "Offline Digital Tablet Pilot"],
  },
];

export const DEMO_RESEARCH_TEAMS: ResearchTeamProfile[] = [
  {
    id: "team-1",
    name: "Team Jal-Dhara",
    universityId: "univ-1",
    universityName: "Indian Institute of Science (IISc)",
    department: "Environmental Science",
    facultyMentor: "Dr. Ramesh Kumar",
    skills: ["Groundwater hydrology", "Water filtration systems", "Piping design", "Groundwater mapping", "Gravity filtration"],
    status: "Active",
    previousWork: ["Ranchi Sand Filter Deployment", "Village Well Water Quality Audit"],
  },
  {
    id: "team-2",
    name: "SolarEdu Scholars",
    universityId: "univ-4",
    universityName: "National Institute of Technology Patna (NITP)",
    department: "Electrical Engineering",
    facultyMentor: "Prof. Anjali Devi",
    skills: ["Solar microgrid design", "Battery management", "Load analysis", "Solar panel sizing", "LiFePO4 battery configuration"],
    status: "Available",
    previousWork: ["Gaya Primary School Solar Rooftop Installation"],
  },
  {
    id: "team-3",
    name: "Soil Remediation Taskforce",
    universityId: "univ-2",
    universityName: "Punjab Agricultural University (PAU)",
    department: "Biotechnology",
    facultyMentor: "Dr. Sanjay Dutt",
    skills: ["Bio-remediation", "Soil chemical analysis", "Microbial culture", "Halophilic microbes", "Soil chemistry analysis"],
    status: "Active",
    previousWork: ["Sangrur Bio-fertilizer Field Trial"],
  },
  {
    id: "team-4",
    name: "Tribal Education Hub",
    universityId: "univ-5",
    universityName: "Utkal University",
    department: "Social Work",
    facultyMentor: "Dr. Priyadarshini Mohanty",
    skills: ["Vernacular Pedagogy", "Community Outreach", "Tablet Config", "Tribal dialect translation", "Curriculum design"],
    status: "Active",
    previousWork: ["Mayurbhanj Offline Tablet Deployment"],
  },
  {
    id: "team-5",
    name: "CleanSort Automators",
    universityId: "univ-3",
    universityName: "College of Engineering Pune (COEP)",
    department: "Mechanical Engineering",
    facultyMentor: "Prof. Vinay Deshmukh",
    skills: ["Object detection (YOLO)", "Conveyor belt mechanics", "Routing optimization", "Waste sorting automation"],
    status: "Available",
    previousWork: ["Pune Municipal Bin Sensor System"],
  },
];

export const DEMO_INDUSTRIES: IndustryProfile[] = [
  {
    id: "ind-1",
    name: "Tata Steel CSR Foundation",
    orgType: "Corporate CSR",
    location: "Jamshedpur, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    expertise: ["Groundwater infrastructure", "Community water tanks", "Sanitation engineering"],
    technologyCapabilities: ["Gravity filtration units", "Solar pump integration", "Pipeline layout"],
    csrFocusAreas: ["Water & Sanitation", "Rural Infrastructure", "Public Health"],
    resources: ["CSR Grants (up to ₹15 Lakhs)", "Civil Construction Engineers", "Heavy Earth Equipment"],
    previousProjects: ["Jharkhand Rural Clean Drinking Water MoU", "Subarnarekha Riverbank Filtration"],
  },
  {
    id: "ind-2",
    name: "IFFCO AgriTech CSR Division",
    orgType: "Agri-Enterprise",
    location: "New Delhi, Delhi",
    state: "Punjab",
    district: "Sangrur",
    expertise: ["Soil testing labs", "Bio-fertilizer supply chain", "Farmer training programs"],
    technologyCapabilities: ["Nano-fertilizer sprays", "Soil moisture sensor kits", "Halophilic inoculants"],
    csrFocusAreas: ["Agriculture & Food Tech", "Soil Health", "Farmer Livelihoods"],
    resources: ["Free Soil Testing Kits", "Microbial Supply Grants", "Agronomist Network"],
    previousProjects: ["Sangrur Green Soil Reclamation", "Punjab Organic Agriculture Drive"],
  },
  {
    id: "ind-3",
    name: "ReNew Power Social Impact Division",
    orgType: "CleanTech Enterprise",
    location: "Gurugram, Haryana",
    state: "Bihar",
    district: "Gaya",
    expertise: ["Solar PV microgrids", "Lithium battery storage", "Remote inverter monitoring"],
    technologyCapabilities: ["Off-grid solar kits (5kW)", "IoT energy meters", "Smart charge controllers"],
    csrFocusAreas: ["Renewable Energy", "Education & Energy Access", "Rural Electrification"],
    resources: ["5kW Solar PV Hardware Grants", "Maintenance Engineers", "Remote Monitoring Dashboard"],
    previousProjects: ["Solarizing Bihar Rural Schools", "Village Solar Streetlight Grid"],
  },
  {
    id: "ind-4",
    name: "Vedanta Foundation CSR",
    orgType: "Corporate CSR Foundation",
    location: "Bhubaneswar, Odisha",
    state: "Odisha",
    district: "Mayurbhanj",
    expertise: ["Digital literacy kits", "Vernacular app deployment", "School infrastructure upgrading"],
    technologyCapabilities: ["Rugged offline learning tablets", "Vernacular LMS software", "Solar charger cases"],
    csrFocusAreas: ["Education & Social Impact", "Tribal Development", "Youth Employability"],
    resources: ["Tablet Hardware Sponsorship", "Vernacular Software Licenses", "Field Facilitator Team"],
    previousProjects: ["Mayurbhanj Digital Classroom Project", "Odisha Tribal E-Learning Hub"],
  },
  {
    id: "ind-5",
    name: "Prajs CleanTech Solutions",
    orgType: "Environmental Tech Enterprise",
    location: "Pune, Maharashtra",
    state: "Maharashtra",
    district: "Pune",
    expertise: ["Automated waste sorting", "Composting plants", "Recycling machinery"],
    technologyCapabilities: ["High-speed conveyor belts", "Optical waste sorters", "Biogas digesters"],
    csrFocusAreas: ["Waste Management", "Urban Environmental Engineering", "Circular Economy"],
    resources: ["Sorting Conveyor Prototypes", "Robotic Arm Integrators", "Waste Auditing Engineers"],
    previousProjects: ["Pune Material Recovery Facility Automation", "Swachh Bharat Industrial Waste MoU"],
  },
];

// ----------------------------------------------------
// Smart Matching Engine Logic
// ----------------------------------------------------

/**
 * Calculates a transparent, explainable match score for a University profile against a problem.
 */
function scoreUniversity(problem: CommunityProblem, uni: UniversityProfile, analysis?: ProblemAnalysis): EntityRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const matchedExpertise: string[] = [];
  const missingCapabilities: string[] = [];

  const textLower = `${problem.title} ${problem.description} ${problem.category}`.toLowerCase();
  const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];
  const reqDomains = analysis?.suggestedDomains || problem.researchAreas || [];

  // A. Category Match (25 Points)
  const categoryMatch = uni.departments.some((d) => 
    problem.category.toLowerCase().includes(d.toLowerCase()) || 
    d.toLowerCase().includes(problem.category.toLowerCase()) ||
    (problem.category.includes("Water") && d.includes("Environmental")) ||
    (problem.category.includes("Agriculture") && d.includes("Agricultural")) ||
    (problem.category.includes("Education") && d.includes("Social"))
  );

  if (categoryMatch) {
    score += MatchWeights.CATEGORY;
    reasons.push(`Relevant Department match (${uni.departments.filter(d => problem.category.toLowerCase().includes(d.toLowerCase()) || d.includes("Environmental") || d.includes("Agricultural") || d.includes("Social")).join(", ") || uni.departments[0]})`);
  } else {
    missingCapabilities.push(`Direct ${problem.category} department alignment is limited`);
  }

  // B. Expertise Match (30 Points)
  let expCount = 0;
  reqExp.forEach((req) => {
    const matched = uni.expertise.some((e) => e.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(e.toLowerCase()));
    if (matched) {
      expCount++;
      matchedExpertise.push(req);
    }
  });

  if (reqExp.length > 0) {
    const expRatio = Math.min(expCount / reqExp.length, 1);
    const expScore = Math.round(expRatio * MatchWeights.EXPERTISE);
    score += expScore;
    if (expScore > 10) {
      reasons.push(`Strong faculty expertise in ${matchedExpertise.slice(0, 3).join(", ")}`);
    }
  }

  const unMatchedExp = reqExp.filter((e) => !matchedExpertise.includes(e));
  if (unMatchedExp.length > 0) {
    missingCapabilities.push(`Lacks direct lab coverage for: ${unMatchedExp.slice(0, 2).join(", ")}`);
  }

  // C. Research Area Match (20 Points)
  const matchedAreas = uni.researchAreas.filter((ra) => 
    reqDomains.some((rd) => rd.toLowerCase().includes(ra.toLowerCase()) || ra.toLowerCase().includes(rd.toLowerCase())) ||
    textLower.includes(ra.toLowerCase())
  );

  if (matchedAreas.length > 0) {
    const areaScore = Math.min(matchedAreas.length * 10, MatchWeights.RESEARCH_AREA);
    score += areaScore;
    reasons.push(`Active research focus areas in ${matchedAreas.slice(0, 2).join(", ")}`);
  }

  // D. Location Relevance (10 Points)
  if (uni.district.toLowerCase() === problem.district.toLowerCase() && uni.state.toLowerCase() === problem.state.toLowerCase()) {
    score += MatchWeights.LOCATION;
    reasons.push(`Local campus in target district (${uni.district}, ${uni.state})`);
  } else if (uni.state.toLowerCase() === problem.state.toLowerCase()) {
    score += 6;
    reasons.push(`Regional state presence in ${uni.state}`);
  } else {
    missingCapabilities.push(`Out-of-state campus (${uni.location})`);
  }

  // E. Previous Experience (10 Points)
  if (uni.previousProjects.length > 0) {
    score += MatchWeights.PREVIOUS_EXPERIENCE;
    reasons.push(`Proven track record in ${uni.previousProjects[0]}`);
  }

  // F. Facilities (5 Points)
  if (uni.facilities.length > 0) {
    score += MatchWeights.RESOURCES;
    reasons.push(`Equipped with ${uni.facilities[0]}`);
  }

  const matchScore = Math.min(Math.max(score, 0), 100);
  const matchLevel = matchScore >= MatchThresholds.HIGH ? "HIGH" : matchScore >= MatchThresholds.MEDIUM ? "MEDIUM" : "LOW";

  return {
    entityId: uni.id,
    entityName: uni.name,
    entityType: "UNIVERSITY",
    matchScore,
    matchLevel,
    reasons,
    matchedExpertise: Array.from(new Set(matchedExpertise)),
    missingCapabilities,
  };
}

/**
 * Calculates a match score for a Research Team against a problem.
 */
function scoreResearchTeam(problem: CommunityProblem, team: ResearchTeamProfile, analysis?: ProblemAnalysis): EntityRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const matchedExpertise: string[] = [];
  const missingCapabilities: string[] = [];

  const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];

  // A. Skills Match (45 Points)
  let matchedSkillsCount = 0;
  reqExp.forEach((req) => {
    const hasSkill = team.skills.some((s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()));
    if (hasSkill) {
      matchedSkillsCount++;
      matchedExpertise.push(req);
    }
  });

  const skillRatio = reqExp.length > 0 ? Math.min(matchedSkillsCount / reqExp.length, 1) : 0.6;
  const skillScore = Math.round(skillRatio * 45);
  score += skillScore;
  if (matchedExpertise.length > 0) {
    reasons.push(`Team skills directly overlap in ${matchedExpertise.join(", ")}`);
  }

  // B. Department & Mentor Expertise (25 Points)
  if (problem.category.toLowerCase().includes(team.department.toLowerCase()) || team.department.includes("Environmental") || team.department.includes("Biotechnology")) {
    score += 25;
    reasons.push(`Guided by mentor ${team.facultyMentor} (${team.department})`);
  } else {
    missingCapabilities.push(`Faculty mentor is outside primary ${problem.category} department`);
  }

  // C. Team Availability (15 Points)
  if (team.status === "Available") {
    score += 15;
    reasons.push("Team is currently available for new research projects");
  } else {
    score += 8;
    missingCapabilities.push("Team is currently active on another project");
  }

  // D. Previous Work (15 Points)
  if (team.previousWork.length > 0) {
    score += 15;
    reasons.push(`Demonstrated field success in ${team.previousWork[0]}`);
  }

  const matchScore = Math.min(Math.max(score, 0), 100);
  const matchLevel = matchScore >= MatchThresholds.HIGH ? "HIGH" : matchScore >= MatchThresholds.MEDIUM ? "MEDIUM" : "LOW";

  return {
    entityId: team.id,
    entityName: `${team.name} (${team.universityName})`,
    entityType: "TEAM",
    matchScore,
    matchLevel,
    reasons,
    matchedExpertise: Array.from(new Set(matchedExpertise)),
    missingCapabilities,
  };
}

/**
 * Calculates a match score for an Industry Organization against a problem.
 */
function scoreIndustry(problem: CommunityProblem, ind: IndustryProfile, analysis?: ProblemAnalysis): EntityRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const matchedExpertise: string[] = [];
  const missingCapabilities: string[] = [];

  const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];

  // A. CSR Focus Alignment (30 Points)
  const csrMatch = ind.csrFocusAreas.some((csr) => 
    problem.category.toLowerCase().includes(csr.toLowerCase()) || 
    csr.toLowerCase().includes(problem.category.toLowerCase()) ||
    (problem.category.includes("Water") && csr.includes("Water")) ||
    (problem.category.includes("Agriculture") && csr.includes("Agriculture"))
  );

  if (csrMatch) {
    score += MatchWeights.EXPERTISE;
    reasons.push(`Direct CSR focus on ${ind.csrFocusAreas.filter(c => problem.category.toLowerCase().includes(c.toLowerCase()) || c.includes("Water") || c.includes("Agriculture")).join(", ") || ind.csrFocusAreas[0]}`);
  } else {
    missingCapabilities.push(`Primary CSR budget target is outside ${problem.category}`);
  }

  // B. Technology Capabilities (25 Points)
  const matchedTech = ind.technologyCapabilities.filter((tc) => 
    reqExp.some((re) => tc.toLowerCase().includes(re.toLowerCase()) || re.toLowerCase().includes(tc.toLowerCase())) ||
    problem.description.toLowerCase().includes(tc.toLowerCase())
  );

  if (matchedTech.length > 0) {
    score += 25;
    matchedExpertise.push(...matchedTech);
    reasons.push(`Deployment tech capabilities in ${matchedTech.join(", ")}`);
  } else if (ind.technologyCapabilities.length > 0) {
    score += 15;
    reasons.push(`Industrial hardware availability (${ind.technologyCapabilities[0]})`);
  }

  // C. Location Relevance (20 Points)
  if (ind.district.toLowerCase() === problem.district.toLowerCase() && ind.state.toLowerCase() === problem.state.toLowerCase()) {
    score += 20;
    reasons.push(`Local field operations in target district (${ind.district})`);
  } else if (ind.state.toLowerCase() === problem.state.toLowerCase()) {
    score += 12;
    reasons.push(`State-level deployment capability in ${ind.state}`);
  } else {
    missingCapabilities.push(`Remote corporate headquarters (${ind.location})`);
  }

  // D. Resource Commitment (15 Points)
  if (ind.resources.length > 0) {
    score += 15;
    reasons.push(`Resource availability: ${ind.resources[0]}`);
  }

  // E. Previous Projects (10 Points)
  if (ind.previousProjects.length > 0) {
    score += 10;
    reasons.push(`Successful previous implementation: ${ind.previousProjects[0]}`);
  }

  const matchScore = Math.min(Math.max(score, 0), 100);
  const matchLevel = matchScore >= MatchThresholds.HIGH ? "HIGH" : matchScore >= MatchThresholds.MEDIUM ? "MEDIUM" : "LOW";

  return {
    entityId: ind.id,
    entityName: ind.name,
    entityType: "INDUSTRY",
    matchScore,
    matchLevel,
    reasons,
    matchedExpertise: Array.from(new Set(matchedExpertise)),
    missingCapabilities,
  };
}

/**
 * Main Smart Matching Engine Entrypoint.
 * Pre-filters candidates, runs transparent scoring, and returns ranked recommendations.
 */
export function matchProblem(
  problem: CommunityProblem,
  analysis?: ProblemAnalysis,
  universities = DEMO_UNIVERSITIES,
  teams = DEMO_RESEARCH_TEAMS,
  industries = DEMO_INDUSTRIES
): ProblemMatchResult {
  // Pre-filter & Score Universities
  const uniRecommendations = universities
    .map((u) => scoreUniversity(problem, u, analysis))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  // Pre-filter & Score Teams
  const teamRecommendations = teams
    .map((t) => scoreResearchTeam(problem, t, analysis))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  // Pre-filter & Score Industries
  const industryRecommendations = industries
    .map((i) => scoreIndustry(problem, i, analysis))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return {
    problemId: problem.id,
    problemTitle: problem.title,
    universities: uniRecommendations,
    teams: teamRecommendations,
    industries: industryRecommendations,
    generatedAt: new Date().toISOString().split("T")[0],
  };
}
