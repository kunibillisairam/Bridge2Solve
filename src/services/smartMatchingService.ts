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
  status?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
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
  teamStatus?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

export interface IndustryProfile {
  id: string;
  name: string;
  orgType: string;
  location: string;
  state: string;
  district: string;
  expertise: string[];
  technologyCapabilities: string[];
  csrFocusAreas: string[];
  resources: string[];
  previousProjects: string[];
  status?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

// ----------------------------------------------------
// Smart Industry / CSR Match Result Structure
// ----------------------------------------------------
export interface IndustryMatchResult {
  industryId: string;
  industryName: string;
  orgType: string;
  score: number;
  matchLevel: "HIGH" | "MEDIUM" | "LOW";
  matchedCSRFocus: string[];
  matchedSupportTypes: string[];
  matchedExpertise: string[];
  matchedResources: string[];
  previousExperience: string[];
  locationMatch: "SAME_DISTRICT" | "SAME_STATE" | "OUT_OF_STATE";
  reasons: string[];
  algorithmVersion: string;
  breakdown: {
    csrFocusScore: number;
    supportTypeScore: number;
    technicalExpertiseScore: number;
    organizationTypeScore: number;
    projectDomainScore: number;
    previousExperienceScore: number;
    locationScore: number;
  };
}

export const INDUSTRY_MATCHING_ALGORITHM_VERSION = "v1";

export const INDUSTRY_MATCH_CONFIG = {
  version: INDUSTRY_MATCHING_ALGORITHM_VERSION,
  thresholds: {
    HIGH: 80,
    MEDIUM: 60,
  },
  weights: {
    csrFocus: 25,
    supportType: 20,
    technicalExpertise: 20,
    organizationType: 10,
    projectDomain: 10,
    previousExperience: 10,
    location: 5,
  }
};

export interface EntityRecommendation {
  entityId: string;
  entityName: string;
  entityType: "UNIVERSITY" | "TEAM" | "INDUSTRY";
  matchScore: number;
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
// Smart University Match Result Structure
// ----------------------------------------------------
export interface UniversityMatchResult {
  universityId: string;
  universityName: string;
  score: number;
  matchLevel: "HIGH" | "MEDIUM" | "LOW";
  matchedCategories: string[];
  matchedDepartments: string[];
  matchedExpertise: string[];
  matchedResearchAreas: string[];
  locationMatch: "SAME_DISTRICT" | "SAME_STATE" | "OUT_OF_STATE";
  previousExperience: string[];
  reasons: string[];
  algorithmVersion: string;
  breakdown: {
    domainScore: number;
    departmentScore: number;
    expertiseScore: number;
    researchFocusScore: number;
    locationScore: number;
    previousExperienceScore: number;
  };
}

// ----------------------------------------------------
// Configurable Thresholds & Scoring Weights
// ----------------------------------------------------
export const MATCHING_ALGORITHM_VERSION = "v1";

export const MATCH_CONFIG = {
  version: MATCHING_ALGORITHM_VERSION,
  thresholds: {
    HIGH: 80,
    MEDIUM: 60,
  },
  weights: {
    domain: 25,
    expertise: 25,
    department: 15,
    researchFocus: 15,
    location: 10,
    previousExperience: 10,
  }
};

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
    status: "ACTIVE"
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
    status: "ACTIVE"
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
    status: "ACTIVE"
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
    status: "ACTIVE"
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
    status: "ACTIVE"
  },
  {
    id: "univ-suspended",
    name: "Suspended State University",
    location: "Gaya, Bihar",
    state: "Bihar",
    district: "Gaya",
    departments: ["Environmental Science"],
    researchAreas: ["Rainwater Harvesting"],
    expertise: ["Groundwater mapping"],
    facilities: ["Basic Lab"],
    previousProjects: [],
    status: "SUSPENDED"
  },
  {
    id: "univ-inactive",
    name: "Inactive Technical Institute",
    location: "Pune, Maharashtra",
    state: "Maharashtra",
    district: "Pune",
    departments: ["Civil Engineering"],
    researchAreas: ["Hydrogeology"],
    expertise: ["Gravity filtration"],
    facilities: ["Closed lab"],
    previousProjects: [],
    status: "INACTIVE"
  }
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
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-available-1",
    name: "Jal-Dhara Research Team",
    universityId: "univ-1",
    universityName: "Indian Institute of Science (IISc)",
    department: "Environmental Science",
    facultyMentor: "Dr. Rajesh Shah",
    skills: ["Water Engineering", "Environmental Science", "Rural Infrastructure", "Water filtration systems", "Gravity filtration", "IoT"],
    status: "Available",
    previousWork: ["Ranchi Sand Filter Deployment", "Village Well Water Quality Audit"],
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-available-2",
    name: "AquaTech Research Group",
    universityId: "univ-1",
    universityName: "Indian Institute of Science (IISc)",
    department: "Civil Engineering",
    facultyMentor: "Dr. Sunita Rao",
    skills: ["Water Management", "IoT", "Environmental Engineering", "Sensors"],
    status: "Available",
    previousWork: ["Urban Water Distribution Retrofit"],
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-available-3",
    name: "Rural Innovation Team",
    universityId: "univ-1",
    universityName: "Indian Institute of Science (IISc)",
    department: "Social Work",
    facultyMentor: "Dr. Amit Verma",
    skills: ["Rural Development", "Water filtration systems", "Community Outreach"],
    status: "Available",
    previousWork: ["Village Sanitation Campaign"],
    teamStatus: "ACTIVE"
  },
  {
    id: "team-iisc-suspended",
    name: "Suspended Hydro-Lab",
    universityId: "univ-1",
    universityName: "Indian Institute of Science (IISc)",
    department: "Environmental Science",
    facultyMentor: "Dr. Broken Link",
    skills: ["Water filtration systems"],
    status: "Available",
    previousWork: [],
    teamStatus: "SUSPENDED"
  },
  {
    id: "team-iisc-inactive",
    name: "Inactive Tech Group",
    universityId: "univ-1",
    universityName: "Indian Institute of Science (IISc)",
    department: "Civil Engineering",
    facultyMentor: "Dr. Sleep Mode",
    skills: ["Gravity filtration"],
    status: "Available",
    previousWork: [],
    teamStatus: "INACTIVE"
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
    teamStatus: "ACTIVE"
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
    teamStatus: "ACTIVE"
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
    teamStatus: "ACTIVE"
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
    teamStatus: "ACTIVE"
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
export function getUniversityRecommendations(
  problem: CommunityProblem,
  analysis?: ProblemAnalysis,
  registeredUniversityIds = new Set<string>(),
  universities = DEMO_UNIVERSITIES
): UniversityMatchResult[] {
  const { weights, thresholds } = MATCH_CONFIG;

  return universities
    .filter((u) => {
      // Rule 10: Exclude suspended/inactive universities
      if (u.status === "SUSPENDED" || u.status === "INACTIVE") return false;
      // Exclude already registered interest
      if (registeredUniversityIds.has(u.id)) return false;
      return true;
    })
    .map((u) => {
      let domainScore = 0;
      let departmentScore = 0;
      let expertiseScore = 0;
      let researchFocusScore = 0;
      let locationScore = 0;
      let previousExperienceScore = 0;

      const reasons: string[] = [];
      const matchedCategories: string[] = [];
      const matchedDepartments: string[] = [];
      const matchedExpertise: string[] = [];
      const matchedResearchAreas: string[] = [];
      const previousExperience: string[] = [];

      // 1. Domain / Category Match (25%)
      const catLower = problem.category.toLowerCase();
      
      const domainKeywords: Record<string, string[]> = {
        "water & sanitation": ["water", "sanitation", "hydro", "environmental", "waste"],
        "agriculture & food tech": ["agri", "food", "soil", "crop", "microb"],
        "waste management": ["waste", "recycle", "sorting", "compost", "mechanical"],
        "renewable energy": ["energy", "solar", "photovoltaic", "battery", "electrical"],
        "education & social impact": ["education", "social", "pedagogy", "literacy", "learning", "linguistics"]
      };

      const keywords = domainKeywords[catLower] || [catLower];
      
      const isDomainAligned = u.departments.some(d => keywords.some(k => d.toLowerCase().includes(k))) ||
                              u.researchAreas.some(r => keywords.some(k => r.toLowerCase().includes(k)));
      
      if (isDomainAligned) {
        domainScore = weights.domain;
        matchedCategories.push(problem.category);
        reasons.push(`✓ Aligned with ${problem.category} domain`);
      }

      // 2. Department Match (15%)
      const matchingDept = u.departments.find(d => {
        const dLower = d.toLowerCase();
        if (catLower.includes("water") && (dLower.includes("environmental") || dLower.includes("civil") || dLower.includes("biotechnology"))) return true;
        if (catLower.includes("agri") && (dLower.includes("agricultural") || dLower.includes("soil") || dLower.includes("agronomy") || dLower.includes("biotechnology"))) return true;
        if (catLower.includes("waste") && (dLower.includes("mechanical") || dLower.includes("civil") || dLower.includes("environmental"))) return true;
        if (catLower.includes("energy") && (dLower.includes("electrical") || dLower.includes("renewable") || dLower.includes("physics"))) return true;
        if (catLower.includes("education") && (dLower.includes("social") || dLower.includes("education") || dLower.includes("linguistics") || dLower.includes("psychology"))) return true;
        return false;
      });

      if (matchingDept) {
        departmentScore = weights.department;
        matchedDepartments.push(matchingDept);
        reasons.push(`✓ Strong ${matchingDept} department`);
      }

      // 3. Required Expertise Match (25%)
      const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];
      if (reqExp.length > 0) {
        let matchedExpCount = 0;
        reqExp.forEach((req) => {
          const hasExpertise = u.expertise.some((exp) => exp.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(exp.toLowerCase()));
          if (hasExpertise) {
            matchedExpCount++;
            matchedExpertise.push(req);
          }
        });
        const expRatio = matchedExpCount / reqExp.length;
        expertiseScore = Math.round(expRatio * weights.expertise);
        if (matchedExpertise.length > 0) {
          reasons.push(`✓ Expertise in ${matchedExpertise.slice(0, 3).join(", ")}`);
        }
      }

      // 4. Research Focus Match (15%)
      const suggestedAreas = analysis?.suggestedDomains || problem.researchAreas || [];
      if (suggestedAreas.length > 0) {
        let matchedAreaCount = 0;
        suggestedAreas.forEach((area) => {
          const hasArea = u.researchAreas.some((ra) => ra.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(ra.toLowerCase()));
          if (hasArea) {
            matchedAreaCount++;
            matchedResearchAreas.push(area);
          }
        });
        const areaRatio = matchedAreaCount / suggestedAreas.length;
        researchFocusScore = Math.round(areaRatio * weights.researchFocus);
        if (matchedResearchAreas.length > 0) {
          reasons.push(`✓ Active research in ${matchedResearchAreas.slice(0, 2).join(", ")}`);
        }
      }

      // 5. Location Relevance (10%)
      let locationMatch: "SAME_DISTRICT" | "SAME_STATE" | "OUT_OF_STATE" = "OUT_OF_STATE";
      if (u.district.toLowerCase() === problem.district.toLowerCase() && u.state.toLowerCase() === problem.state.toLowerCase()) {
        locationScore = weights.location;
        locationMatch = "SAME_DISTRICT";
        reasons.push(`✓ Located in the same district (${u.district})`);
      } else if (u.state.toLowerCase() === problem.state.toLowerCase()) {
        locationScore = Math.round(weights.location * 0.6);
        locationMatch = "SAME_STATE";
        reasons.push(`✓ Located in the same state (${u.state})`);
      } else {
        locationScore = Math.round(weights.location * 0.2);
        locationMatch = "OUT_OF_STATE";
      }

      // 6. Previous Experience (10%)
      const matchingProj = u.previousProjects.find(pProj => 
        keywords.some(k => pProj.toLowerCase().includes(k)) ||
        pProj.toLowerCase().includes(problem.category.toLowerCase())
      );

      if (matchingProj) {
        previousExperienceScore = weights.previousExperience;
        previousExperience.push(matchingProj);
        reasons.push(`✓ Previous relevant experience: ${matchingProj}`);
      }

      const score = domainScore + departmentScore + expertiseScore + researchFocusScore + locationScore + previousExperienceScore;
      const normalizedScore = Math.min(Math.max(score, 0), 100);

      const matchLevel: "HIGH" | "MEDIUM" | "LOW" = normalizedScore >= thresholds.HIGH ? "HIGH" : normalizedScore >= thresholds.MEDIUM ? "MEDIUM" : "LOW";

      return {
        universityId: u.id,
        universityName: u.name,
        score: normalizedScore,
        matchLevel,
        matchedCategories,
        matchedDepartments,
        matchedExpertise,
        matchedResearchAreas,
        locationMatch,
        previousExperience,
        reasons,
        algorithmVersion: MATCHING_ALGORITHM_VERSION,
        breakdown: {
          domainScore,
          departmentScore,
          expertiseScore,
          researchFocusScore,
          locationScore,
          previousExperienceScore
        }
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedExpertise.length !== a.matchedExpertise.length) return b.matchedExpertise.length - a.matchedExpertise.length;
      const locPriority = { SAME_DISTRICT: 3, SAME_STATE: 2, OUT_OF_STATE: 1 };
      if (locPriority[b.locationMatch] !== locPriority[a.locationMatch]) {
        return locPriority[b.locationMatch] - locPriority[a.locationMatch];
      }
      return b.previousExperience.length - a.previousExperience.length;
    });
}

function scoreUniversity(problem: CommunityProblem, uni: UniversityProfile, analysis?: ProblemAnalysis): EntityRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const matchedExpertise: string[] = [];
  const missingCapabilities: string[] = [];

  const textLower = `${problem.title} ${problem.description} ${problem.category}`.toLowerCase();
  const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];
  const reqDomains = analysis?.suggestedDomains || problem.researchAreas || [];

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

  const matchedAreas = uni.researchAreas.filter((ra) => 
    reqDomains.some((rd) => rd.toLowerCase().includes(ra.toLowerCase()) || ra.toLowerCase().includes(rd.toLowerCase())) ||
    textLower.includes(ra.toLowerCase())
  );

  if (matchedAreas.length > 0) {
    const areaScore = Math.min(matchedAreas.length * 10, MatchWeights.RESEARCH_AREA);
    score += areaScore;
    reasons.push(`Active research focus areas in ${matchedAreas.slice(0, 2).join(", ")}`);
  }

  if (uni.district.toLowerCase() === problem.district.toLowerCase() && uni.state.toLowerCase() === problem.state.toLowerCase()) {
    score += MatchWeights.LOCATION;
    reasons.push(`Local campus in target district (${uni.district}, ${uni.state})`);
  } else if (uni.state.toLowerCase() === problem.state.toLowerCase()) {
    score += 6;
    reasons.push(`Regional state presence in ${uni.state}`);
  } else {
    missingCapabilities.push(`Out-of-state campus (${uni.location})`);
  }

  if (uni.previousProjects.length > 0) {
    score += MatchWeights.PREVIOUS_EXPERIENCE;
    reasons.push(`Proven track record in ${uni.previousProjects[0]}`);
  }

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

function scoreResearchTeam(problem: CommunityProblem, team: ResearchTeamProfile, analysis?: ProblemAnalysis): EntityRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const matchedExpertise: string[] = [];
  const missingCapabilities: string[] = [];

  const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];

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

  if (problem.category.toLowerCase().includes(team.department.toLowerCase()) || team.department.includes("Environmental") || team.department.includes("Biotechnology")) {
    score += 25;
    reasons.push(`Guided by mentor ${team.facultyMentor} (${team.department})`);
  } else {
    missingCapabilities.push(`Faculty mentor is outside primary ${problem.category} department`);
  }

  if (team.status === "Available") {
    score += 15;
    reasons.push("Team is currently available for new research projects");
  } else {
    score += 8;
    missingCapabilities.push("Team is currently active on another project");
  }

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

function scoreIndustry(problem: CommunityProblem, ind: IndustryProfile, analysis?: ProblemAnalysis): EntityRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const matchedExpertise: string[] = [];
  const missingCapabilities: string[] = [];

  const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];

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

  if (ind.district.toLowerCase() === problem.district.toLowerCase() && ind.state.toLowerCase() === problem.state.toLowerCase()) {
    score += 20;
    reasons.push(`Local field operations in target district (${ind.district})`);
  } else if (ind.state.toLowerCase() === problem.state.toLowerCase()) {
    score += 12;
    reasons.push(`State-level deployment capability in ${ind.state}`);
  } else {
    missingCapabilities.push(`Remote corporate headquarters (${ind.location})`);
  }

  if (ind.resources.length > 0) {
    score += 15;
    reasons.push(`Resource availability: ${ind.resources[0]}`);
  }

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

export function matchProblem(
  problem: CommunityProblem,
  analysis?: ProblemAnalysis,
  universities = DEMO_UNIVERSITIES,
  teams = DEMO_RESEARCH_TEAMS,
  industries = DEMO_INDUSTRIES
): ProblemMatchResult {
  const uniRecommendations = universities
    .map((u) => scoreUniversity(problem, u, analysis))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const teamRecommendations = teams
    .map((t) => scoreResearchTeam(problem, t, analysis))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

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

export interface TeamMatchResult {
  teamId: string;
  teamName: string;
  universityId: string;
  score: number;
  matchLevel: "HIGH" | "MEDIUM" | "LOW";
  matchedSkills: string[];
  matchedExpertise: string[];
  matchedResearchAreas: string[];
  departmentMatch: boolean;
  domainMatch: boolean;
  previousExperience: string[];
  locationMatch: "SAME_DISTRICT" | "SAME_STATE" | "OUT_OF_STATE";
  reasons: string[];
  breakdown: {
    expertiseScore: number;
    skillsScore: number;
    researchFocusScore: number;
    domainScore: number;
    departmentScore: number;
    previousExperienceScore: number;
    locationScore: number;
  };
  algorithmVersion: string;
}

export const TEAM_MATCHING_ALGORITHM_VERSION = "v1";

export const TEAM_MATCH_CONFIG = {
  version: TEAM_MATCHING_ALGORITHM_VERSION,
  thresholds: {
    HIGH: 80,
    MEDIUM: 60
  },
  weights: {
    expertise: 30,
    skills: 25,
    researchFocus: 15,
    domain: 10,
    department: 10,
    previousExperience: 5,
    location: 5
  }
};

export function getTeamRecommendationsForProblem(
  problem: CommunityProblem,
  analysis: ProblemAnalysis | undefined,
  universityId: string,
  teams = DEMO_RESEARCH_TEAMS,
  universities = DEMO_UNIVERSITIES
): TeamMatchResult[] {
  const { weights, thresholds } = TEAM_MATCH_CONFIG;

  return teams
    .filter((t) => {
      // Rule 9: University Isolation (Enforced in service/server layer)
      if (t.universityId !== universityId) return false;
      // Rule 11: Exclude inactive/suspended research teams
      if (t.teamStatus === "SUSPENDED" || t.teamStatus === "INACTIVE") return false;
      return true;
    })
    .map((t) => {
      const reasons: string[] = [];
      const matchedExpertise: string[] = [];
      const matchedSkills: string[] = [];
      const matchedResearchAreas: string[] = [];
      const previousExperience: string[] = [];
      
      let expertiseScore = 0;
      let skillsScore = 0;
      let researchFocusScore = 0;
      let domainScore = 0;
      let departmentScore = 0;
      let previousExperienceScore = 0;
      let locationScore = 0;

      // 1. Required Expertise Match (30%)
      const reqExp = problem.requiredExpertise || analysis?.requiredExpertise || [];
      if (reqExp.length > 0) {
        reqExp.forEach((req) => {
          const matched = t.skills.some(
            (s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase())
          );
          if (matched) {
            matchedExpertise.push(req);
          }
        });
        expertiseScore = Math.round((matchedExpertise.length / reqExp.length) * weights.expertise);
        if (matchedExpertise.length > 0) {
          reasons.push(`✓ ${matchedExpertise.length}/${reqExp.length} required skills matched`);
        }
      } else {
        expertiseScore = Math.round(0.7 * weights.expertise);
      }

      // 2. Team Skills Match (25%)
      const probText = `${problem.title} ${problem.description}`.toLowerCase();
      const wordRegex = /[a-zA-Z]{4,}/g;
      const probWords = Array.from(new Set(probText.match(wordRegex) || []));
      
      t.skills.forEach((s) => {
        const isMatched = probWords.some(
          (w) => s.toLowerCase().includes(w) || w.includes(s.toLowerCase())
        );
        if (isMatched) {
          matchedSkills.push(s);
        }
      });
      skillsScore = t.skills.length > 0 ? Math.round((matchedSkills.length / t.skills.length) * weights.skills) : Math.round(0.6 * weights.skills);
      if (matchedSkills.length > 0) {
        reasons.push(`✓ Matched ${matchedSkills.length} team skills with problem context`);
      }

      // 3. Research Focus Match (15%)
      const researchAreas = analysis?.suggestedDomains || [];
      if (researchAreas.length > 0) {
        researchAreas.forEach((area) => {
          const isMatched = t.skills.some(
            (s) => s.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(s.toLowerCase())
          ) || t.department.toLowerCase().includes(area.toLowerCase());
          
          if (isMatched) {
            matchedResearchAreas.push(area);
          }
        });
        researchFocusScore = Math.round((matchedResearchAreas.length / researchAreas.length) * weights.researchFocus);
        if (matchedResearchAreas.length > 0) {
          reasons.push(`✓ ${t.department} research focus aligns with ${matchedResearchAreas[0]}`);
        }
      } else {
        researchFocusScore = Math.round(0.6 * weights.researchFocus);
      }

      // 4. Problem Domain Match (10%)
      const domainMatch = t.department.toLowerCase().split(" ").some(word => problem.category.toLowerCase().includes(word)) || t.skills.some(s => s.toLowerCase().includes(problem.category.toLowerCase()));
      domainScore = domainMatch ? weights.domain : Math.round(weights.domain * 0.2);
      if (domainMatch) {
        reasons.push(`✓ Aligned with ${problem.category} domain`);
      }

      // 5. Department Match (10%)
      const categoryDepts: Record<string, string[]> = {
        "water management": ["environmental", "civil", "biotechnology", "mechanical"],
        "water scarcity": ["environmental", "civil", "biotechnology", "mechanical"],
        "agriculture": ["agricultural", "biotechnology", "chemical", "biological"],
        "soil health": ["agricultural", "biotechnology", "chemical", "biological"],
        "renewable energy": ["electrical", "power", "energy", "mechanical"],
        "education": ["social work", "education", "humanities", "computer science"],
        "waste management": ["mechanical", "civil", "environmental", "biotechnology"],
      };

      const key = problem.category.toLowerCase();
      const expectedDepts = categoryDepts[key] || ["science", "engineering", "technology"];
      const departmentMatch = expectedDepts.some((d) => t.department.toLowerCase().includes(d));
      departmentScore = departmentMatch ? weights.department : Math.round(weights.department * 0.6);
      if (departmentMatch) {
        reasons.push(`✓ Relevant ${t.department} department`);
      }

      // 6. Previous Experience (5%)
      const cleanKeywords = [problem.category, ...(problem.requiredExpertise || [])].map((kw) => kw.toLowerCase());
      const matchedPrev = t.previousWork.filter((proj) => 
        cleanKeywords.some((k) => proj.toLowerCase().includes(k)) || 
        proj.toLowerCase().includes("water") && problem.category.toLowerCase().includes("water") ||
        proj.toLowerCase().includes("soil") && problem.category.toLowerCase().includes("soil") ||
        proj.toLowerCase().includes("solar") && problem.category.toLowerCase().includes("solar")
      );
      if (matchedPrev.length > 0) {
        previousExperienceScore = weights.previousExperience;
        previousExperience.push(...matchedPrev);
        reasons.push(`✓ Previous relevant project: ${matchedPrev[0]}`);
      } else {
        previousExperienceScore = 0;
      }

      // 7. Location Relevance (5%)
      const univ = universities.find((u) => u.id === t.universityId);
      let locationMatch: "SAME_DISTRICT" | "SAME_STATE" | "OUT_OF_STATE" = "OUT_OF_STATE";
      if (univ) {
        if (univ.district.toLowerCase() === problem.district.toLowerCase() && univ.state.toLowerCase() === problem.state.toLowerCase()) {
          locationScore = weights.location;
          locationMatch = "SAME_DISTRICT";
          reasons.push(`✓ Located in the same district (${univ.district})`);
        } else if (univ.state.toLowerCase() === problem.state.toLowerCase()) {
          locationScore = Math.round(weights.location * 0.6);
          locationMatch = "SAME_STATE";
          reasons.push(`✓ Located in the same state (${univ.state})`);
        } else {
          locationScore = Math.round(weights.location * 0.2);
          locationMatch = "OUT_OF_STATE";
        }
      } else {
        locationScore = Math.round(weights.location * 0.2);
      }

      const score = expertiseScore + skillsScore + researchFocusScore + domainScore + departmentScore + previousExperienceScore + locationScore;
      const normalizedScore = Math.min(Math.max(score, 0), 100);
      const matchLevel: "HIGH" | "MEDIUM" | "LOW" = normalizedScore >= thresholds.HIGH ? "HIGH" : normalizedScore >= thresholds.MEDIUM ? "MEDIUM" : "LOW";

      return {
        teamId: t.id,
        teamName: t.name,
        universityId: t.universityId,
        score: normalizedScore,
        matchLevel,
        matchedSkills,
        matchedExpertise,
        matchedResearchAreas,
        departmentMatch,
        domainMatch,
        previousExperience,
        locationMatch,
        reasons,
        breakdown: {
          expertiseScore,
          skillsScore,
          researchFocusScore,
          domainScore,
          departmentScore,
          previousExperienceScore,
          locationScore
        },
        algorithmVersion: TEAM_MATCHING_ALGORITHM_VERSION
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ----------------------------------------------------
// Structured Industry Registries (Mock Database Source)
// ----------------------------------------------------
export const DEMO_INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    id: "ind-1",
    name: "Tata Steel CSR Foundation",
    orgType: "Corporate CSR Foundation",
    location: "Jamshedpur, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    expertise: ["Groundwater infrastructure", "Community water tanks", "Sanitation engineering", "Water Infrastructure", "IoT", "Environmental Engineering"],
    technologyCapabilities: ["Water Quality Sensors", "Piping Systems", "Civil Construction"],
    csrFocusAreas: ["Water & Sanitation", "Rural Infrastructure", "Public Health", "Water", "Rural Development"],
    resources: ["CSR Funding", "CSR Grants", "Civil Construction Engineers", "Heavy Earth Equipment", "Infrastructure Deployment"],
    previousProjects: ["Ranchi Rural Sand Filter Deployment", "Water Infrastructure Project", "Chota Nagpur Water Network"],
    status: "ACTIVE"
  },
  {
    id: "ind-2",
    name: "ABC Infrastructure Foundation",
    orgType: "Infrastructure & Engineering CSR",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    expertise: ["Infrastructure Deployment", "Civil Works", "Water Systems", "Solar Installation"],
    technologyCapabilities: ["Concrete Engineering", "Solar Rooftops"],
    csrFocusAreas: ["Infrastructure", "Rural Development", "Water", "Renewable Energy"],
    resources: ["CSR Funding", "Equipment / Resources", "Infrastructure Deployment"],
    previousProjects: ["Rural Drinking Water Station", "School Solar Rooftop Grid"],
    status: "ACTIVE"
  },
  {
    id: "ind-3",
    name: "XYZ Technologies CSR",
    orgType: "Technology & IT Enterprise",
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    district: "Bengaluru",
    expertise: ["IoT", "Software Systems", "Technical Mentorship", "AI/YOLO Sorting", "E-learning Hardware"],
    technologyCapabilities: ["Cloud Systems", "Microcontrollers", "YOLO AI Models"],
    csrFocusAreas: ["Education", "Technology", "Digital Literacy", "Environment"],
    resources: ["Technical Mentorship", "Equipment / Resources", "Software Licenses", "Laptops"],
    previousProjects: ["Mayurbhanj Offline Learning Tablet Deployment", "Smart Garbage Sensor Grid"],
    status: "ACTIVE"
  },
  {
    id: "ind-4",
    name: "EcoSoil Agri-Tech CSR",
    orgType: "Agri-Business Enterprise",
    location: "Ludhiana, Punjab",
    state: "Punjab",
    district: "Sangrur",
    expertise: ["Soil Bioremediation", "Organic Agriculture", "Water Management"],
    technologyCapabilities: ["Soil Sensor Arrays", "Bio-fertilizer Formulations"],
    csrFocusAreas: ["Agriculture", "Environment", "Rural Development", "Soil Health"],
    resources: ["CSR Funding", "Equipment / Resources", "Bio-fertilizers", "Agriculture Experts"],
    previousProjects: ["Sangrur Soil Salinity Recovery Campaign"],
    status: "ACTIVE"
  },
  {
    id: "ind-suspended",
    name: "Suspended Corp CSR",
    orgType: "Corporation",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    district: "Ranchi",
    expertise: ["Water Engineering"],
    technologyCapabilities: ["Basic Piping"],
    csrFocusAreas: ["Water & Sanitation"],
    resources: ["CSR Funding"],
    previousProjects: [],
    status: "SUSPENDED"
  },
  {
    id: "ind-inactive",
    name: "Inactive CSR Group",
    orgType: "Corporation",
    location: "Pune, Maharashtra",
    state: "Maharashtra",
    district: "Pune",
    expertise: ["E-learning"],
    technologyCapabilities: ["Monitors"],
    csrFocusAreas: ["Education"],
    resources: ["Equipment"],
    previousProjects: [],
    status: "INACTIVE"
  }
];

// ----------------------------------------------------
// Smart Industry / CSR Recommendation Algorithm
// ----------------------------------------------------
export function getIndustryRecommendationsForProject(
  project: any,
  analysis?: ProblemAnalysis,
  activeRequests?: any[],
  customProfiles?: IndustryProfile[]
): IndustryMatchResult[] {
  if (!project) return [];

  const profiles = customProfiles || DEMO_INDUSTRY_PROFILES;

  // Rule 19: Exclude INELIGIBLE (SUSPENDED or INACTIVE) Industries
  const activeProfiles = profiles.filter(p => p.status !== "SUSPENDED" && p.status !== "INACTIVE");
  const weights = INDUSTRY_MATCH_CONFIG.weights;
  const thresholds = INDUSTRY_MATCH_CONFIG.thresholds;

  const problemCategory = project.originalProblem?.category || project.category || "";
  const problemDistrict = project.originalProblem?.district || project.district || "";
  const problemState = project.originalProblem?.state || project.state || "";
  const problemDesc = project.originalProblem?.description || project.description || project.title || "";
  const requiredExpertise: string[] = project.requiredExpertise || analysis?.requiredExpertise || project.originalProblem?.requiredExpertise || [];

  return activeProfiles
    .map((ind) => {
      const reasons: string[] = [];
      let csrFocusScore = 0;
      let supportTypeScore = 0;
      let technicalExpertiseScore = 0;
      let organizationTypeScore = 0;
      let projectDomainScore = 0;
      let previousExperienceScore = 0;
      let locationScore = 0;

      const matchedCSRFocus: string[] = [];
      const matchedSupportTypes: string[] = [];
      const matchedExpertise: string[] = [];
      const matchedResources: string[] = [];
      const previousExperience: string[] = [];

      // 1. CSR Focus Match (25%)
      const projectKeywords = [problemCategory, problemDesc, ...requiredExpertise].map(s => String(s).toLowerCase());
      ind.csrFocusAreas.forEach(area => {
        const aLow = area.toLowerCase();
        if (
          projectKeywords.some(kw => kw.includes(aLow) || aLow.includes(kw)) ||
          (aLow.includes("water") && problemCategory.toLowerCase().includes("water")) ||
          (aLow.includes("rural") && problemDesc.toLowerCase().includes("rural")) ||
          (aLow.includes("education") && problemCategory.toLowerCase().includes("education")) ||
          (aLow.includes("agriculture") && problemCategory.toLowerCase().includes("agriculture"))
        ) {
          matchedCSRFocus.push(area);
        }
      });

      if (matchedCSRFocus.length > 0) {
        csrFocusScore = Math.min(weights.csrFocus, Math.round((matchedCSRFocus.length / Math.max(1, ind.csrFocusAreas.length)) * weights.csrFocus) + 12);
        csrFocusScore = Math.min(weights.csrFocus, csrFocusScore);
        reasons.push(`✓ CSR focus matches ${matchedCSRFocus.slice(0, 2).join(" & ")}`);
      } else {
        csrFocusScore = Math.round(weights.csrFocus * 0.3);
      }

      // 2. Support Type Match (20%)
      const resTypes = ind.resources.map(r => r.toLowerCase());
      if (resTypes.some(r => r.includes("funding") || r.includes("grant"))) matchedSupportTypes.push("CSR Funding");
      if (resTypes.some(r => r.includes("infrastructure") || r.includes("equipment") || r.includes("construction"))) matchedSupportTypes.push("Infrastructure Deployment");
      if (resTypes.some(r => r.includes("mentorship") || r.includes("expert") || r.includes("engineer"))) matchedSupportTypes.push("Technical Mentorship");

      if (matchedSupportTypes.length > 0) {
        supportTypeScore = Math.min(weights.supportType, Math.round((matchedSupportTypes.length / 3) * weights.supportType) + 8);
        supportTypeScore = Math.min(weights.supportType, supportTypeScore);
        reasons.push(`✓ Supports ${matchedSupportTypes.slice(0, 2).join(" & ")}`);
      } else {
        supportTypeScore = Math.round(weights.supportType * 0.4);
      }

      // 3. Technical Expertise Match (20%)
      ind.expertise.forEach(exp => {
        const eLow = exp.toLowerCase();
        if (
          projectKeywords.some(kw => kw.includes(eLow) || eLow.includes(kw)) ||
          (eLow.includes("water") && problemCategory.toLowerCase().includes("water")) ||
          (eLow.includes("soil") && problemCategory.toLowerCase().includes("soil")) ||
          (eLow.includes("iot") && problemDesc.toLowerCase().includes("iot"))
        ) {
          matchedExpertise.push(exp);
        }
      });

      if (matchedExpertise.length > 0) {
        technicalExpertiseScore = Math.min(weights.technicalExpertise, Math.round((matchedExpertise.length / Math.max(1, ind.expertise.length)) * weights.technicalExpertise) + 10);
        technicalExpertiseScore = Math.min(weights.technicalExpertise, technicalExpertiseScore);
        reasons.push(`✓ Technical expertise matches project requirements (${matchedExpertise[0]})`);
      } else {
        technicalExpertiseScore = Math.round(weights.technicalExpertise * 0.3);
      }

      // 4. Organization Type Match (10%)
      const otLow = ind.orgType.toLowerCase();
      const catLow = problemCategory.toLowerCase();
      if (
        otLow.includes("foundation") || 
        otLow.includes("csr") || 
        (otLow.includes("tech") && catLow.includes("tech")) || 
        (otLow.includes("infrastructure") && catLow.includes("water"))
      ) {
        organizationTypeScore = weights.organizationType;
        reasons.push(`✓ ${ind.orgType} organization type aligns with project scope`);
      } else {
        organizationTypeScore = Math.round(weights.organizationType * 0.6);
      }

      // 5. Project Domain Match (10%)
      const domainMatch = ind.csrFocusAreas.some(fa => fa.toLowerCase().includes(catLow) || catLow.includes(fa.toLowerCase())) || ind.expertise.some(e => e.toLowerCase().includes(catLow));
      if (domainMatch) {
        projectDomainScore = weights.projectDomain;
        reasons.push(`✓ Aligned with ${problemCategory} domain`);
      } else {
        projectDomainScore = Math.round(weights.projectDomain * 0.4);
      }

      // 6. Previous Experience (10%)
      const cleanKeywords = [problemCategory, problemDesc].map(kw => kw.toLowerCase());
      const matchedPrev = ind.previousProjects.filter(proj => 
        cleanKeywords.some(k => proj.toLowerCase().includes(k)) ||
        (proj.toLowerCase().includes("water") && catLow.includes("water")) ||
        (proj.toLowerCase().includes("soil") && catLow.includes("soil")) ||
        (proj.toLowerCase().includes("tablet") && catLow.includes("education"))
      );
      if (matchedPrev.length > 0) {
        previousExperienceScore = weights.previousExperience;
        previousExperience.push(...matchedPrev);
        reasons.push(`✓ Previous relevant project: ${matchedPrev[0]}`);
      } else {
        previousExperienceScore = 0;
      }

      // 7. Geographic Relevance (5%)
      let locationMatch: "SAME_DISTRICT" | "SAME_STATE" | "OUT_OF_STATE" = "OUT_OF_STATE";
      if (ind.district.toLowerCase() === problemDistrict.toLowerCase() && ind.state.toLowerCase() === problemState.toLowerCase()) {
        locationScore = weights.location;
        locationMatch = "SAME_DISTRICT";
        reasons.push(`✓ Located in the same district (${ind.district})`);
      } else if (ind.state.toLowerCase() === problemState.toLowerCase()) {
        locationScore = Math.round(weights.location * 0.6);
        locationMatch = "SAME_STATE";
        reasons.push(`✓ Located in the same state (${ind.state})`);
      } else {
        locationScore = Math.round(weights.location * 0.2);
        locationMatch = "OUT_OF_STATE";
      }

      // Ensure sum of individual breakdown scores equals the total score
      const score = csrFocusScore + supportTypeScore + technicalExpertiseScore + organizationTypeScore + projectDomainScore + previousExperienceScore + locationScore;
      const normalizedScore = Math.min(Math.max(score, 0), 100);
      const matchLevel: "HIGH" | "MEDIUM" | "LOW" = normalizedScore >= thresholds.HIGH ? "HIGH" : normalizedScore >= thresholds.MEDIUM ? "MEDIUM" : "LOW";

      return {
        industryId: ind.id,
        industryName: ind.name,
        orgType: ind.orgType,
        score: normalizedScore,
        matchLevel,
        matchedCSRFocus,
        matchedSupportTypes,
        matchedExpertise,
        matchedResources: ind.resources,
        previousExperience,
        locationMatch,
        reasons,
        algorithmVersion: INDUSTRY_MATCHING_ALGORITHM_VERSION,
        breakdown: {
          csrFocusScore,
          supportTypeScore,
          technicalExpertiseScore,
          organizationTypeScore,
          projectDomainScore,
          previousExperienceScore,
          locationScore,
        }
      };
    })
    .sort((a, b) => b.score - a.score);
}
