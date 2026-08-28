import { universityMockService, UniversityProject, ResolvedProject } from "./universityMockService";
import { notificationService } from "./notificationService";
import { 
  getIndustryRecommendationsForProject, 
  IndustryMatchResult 
} from "./smartMatchingService";

export type SupportType = 
  | "CSR_FUNDING"
  | "TECHNICAL_MENTORSHIP"
  | "EQUIPMENT_RESOURCES"
  | "INDUSTRY_EXPERTISE"
  | "INFRASTRUCTURE_DEPLOYMENT"
  | "OTHER";

export type SupportStatus = 
  | "PENDING"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface IndustrySupportRequest {
  id: string;
  industryId: string;
  industryName: string;
  projectId: string;
  supportType: SupportType;
  description: string;
  estimatedFunding?: number;
  resourcesOffered?: string;
  expectedDuration?: string;
  status: SupportStatus;
  rejectionReason?: string;
  clarificationNote?: string;
  adminReviewerId?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

export interface IndustryOrganizationProfile {
  id: string;
  name: string;
  orgType: string;
  representativeName: string;
  email: string;
  phone: string;
  location: string;
  state: string;
  district: string;
  website: string;
  csrFocusAreas: string[];
  expertise: string[];
  availableResources: string[];
}

export type DeliveryStatus = 
  | "PLANNED"
  | "COMMITTED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "VERIFIED";

export interface SupportDeliveryItem {
  id: string;
  name: string;
  value: string;
  status: DeliveryStatus;
  deliveryDate?: string;
  evidenceRef?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface IndustryPartnership {
  id: string;
  requestId: string;
  industryId: string;
  projectId: string;
  status: "ACTIVE" | "PENDING_ACTIVATION" | "COMPLETED";
  startDate: string;
  endDate: string;
  approvedDate: string;
  deliveryItems: SupportDeliveryItem[];
}


export const SUPPORT_TYPE_LABELS: Record<SupportType, string> = {
  CSR_FUNDING: "CSR Funding",
  TECHNICAL_MENTORSHIP: "Technical Mentorship",
  EQUIPMENT_RESOURCES: "Equipment / Resources",
  INDUSTRY_EXPERTISE: "Industry Expertise",
  INFRASTRUCTURE_DEPLOYMENT: "Infrastructure / Deployment Support",
  OTHER: "Other Partnership Support",
};

export const SUPPORT_STATUS_BADGES: Record<SupportStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-800 border-yellow-250",
  UNDER_REVIEW: "bg-indigo-50 text-indigo-800 border-indigo-200",
  ACCEPTED: "bg-emerald-50 text-emerald-800 border-emerald-300",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  WITHDRAWN: "bg-slate-50 text-slate-700 border-slate-200",
};

const INITIAL_INDUSTRY_PROFILE: IndustryOrganizationProfile = {
  id: "ind-1",
  name: "Tata Steel CSR Foundation",
  orgType: "Corporate CSR Foundation",
  representativeName: "Vikram Sengupta (CSR Director)",
  email: "csr.grants@tatasteel.com",
  phone: "+91 657 243 1111",
  location: "Jamshedpur, Jharkhand",
  state: "Jharkhand",
  district: "Ranchi",
  website: "https://www.tatasteel.com/csr",
  csrFocusAreas: ["Water & Sanitation", "Rural Infrastructure", "Public Health"],
  expertise: ["Groundwater infrastructure", "Community water tanks", "Sanitation engineering"],
  availableResources: ["CSR Grants (up to ₹15 Lakhs)", "Civil Construction Engineers", "Heavy Earth Equipment"],
};

const INITIAL_SUPPORT_REQUESTS: IndustrySupportRequest[] = [
  {
    id: "CSR-2026-001",
    industryId: "ind-1",
    industryName: "Tata Steel CSR Foundation",
    projectId: "PB-2026-001",
    supportType: "CSR_FUNDING",
    description: "CSR grant allocation of ₹7,50,000 for sand filter excavation and community water nodes in Ranchi rural blocks.",
    estimatedFunding: 750000,
    resourcesOffered: "Civil engineering inspection team and tank materials",
    expectedDuration: "4 months",
    status: "ACCEPTED",
    createdAt: "2026-08-12",
    updatedAt: "2026-08-14",
    reviewedAt: "2026-08-14",
    adminReviewerId: "admin-1",
  },
  {
    id: "CSR-2026-002",
    industryId: "ind-1",
    industryName: "Tata Steel CSR Foundation",
    projectId: "PB-2026-001",
    supportType: "EQUIPMENT_RESOURCES",
    description: "Provision of high-density HDPE storage tanks and gravity filtration pipes.",
    estimatedFunding: 250000,
    resourcesOffered: "20 storage tanks and filtration media",
    expectedDuration: "2 months",
    status: "UNDER_REVIEW",
    createdAt: "2026-08-18",
    updatedAt: "2026-08-18",
  },
  {
    id: "CSR-2026-003",
    industryId: "ind-2",
    industryName: "IFFCO AgriTech CSR Division",
    projectId: "PB-2026-002",
    supportType: "CSR_FUNDING",
    description: "CSR funding of ₹6,00,000 to deploy halophilic organic microbial soil conditioners in Sangrur fields.",
    estimatedFunding: 600000,
    resourcesOffered: "Halophilic strain kits and agronomy team access",
    expectedDuration: "6 months",
    status: "ACCEPTED",
    createdAt: "2026-08-25",
    updatedAt: "2026-08-26",
    reviewedAt: "2026-08-26",
    adminReviewerId: "admin-1",
  },
  {
    id: "CSR-2026-004",
    industryId: "ind-3",
    industryName: "ReNew Power Social Impact Division",
    projectId: "PB-2026-003",
    supportType: "CSR_FUNDING",
    description: "CSR backing of ₹9,50,000 for off-grid PV panels and LiFePO4 battery preservation kits at Gaya Blocks.",
    estimatedFunding: 950000,
    resourcesOffered: "10 solar modules and installation engineers",
    expectedDuration: "5 months",
    status: "ACCEPTED",
    createdAt: "2026-08-10",
    updatedAt: "2026-08-12",
    reviewedAt: "2026-08-12",
    adminReviewerId: "admin-1",
  },
  {
    id: "CSR-2026-005",
    industryId: "ind-4",
    industryName: "Vedanta Foundation CSR",
    projectId: "PB-2026-004",
    supportType: "CSR_FUNDING",
    description: "Education sponsorship of ₹5,00,000 to deploy 150 offline learning tablets in Mayurbhanj district.",
    estimatedFunding: 500000,
    resourcesOffered: "150 rugged e-learning tablets",
    expectedDuration: "10 months",
    status: "ACCEPTED",
    createdAt: "2025-09-01",
    updatedAt: "2025-09-05",
    reviewedAt: "2025-09-05",
    adminReviewerId: "admin-1",
  },
  {
    id: "CSR-2026-006",
    industryId: "ind-5",
    industryName: "Prajs CleanTech Solutions",
    projectId: "PB-2026-001",
    supportType: "TECHNICAL_MENTORSHIP",
    description: "Technical mentorship request to inspect gravity pipe pressure parameters.",
    resourcesOffered: "2 consulting fluid engineers",
    expectedDuration: "1 month",
    status: "PENDING",
    createdAt: "2026-08-26",
    updatedAt: "2026-08-26",
  },
  {
    id: "CSR-2026-007",
    industryId: "ind-3",
    industryName: "ReNew Power Social Impact Division",
    projectId: "PB-2026-002",
    supportType: "CSR_FUNDING",
    description: "Request for solar powered irrigation funding.",
    estimatedFunding: 400000,
    status: "REJECTED",
    rejectionReason: "Proposed scope does not match our current focus on solarizing school infrastructure.",
    createdAt: "2026-08-24",
    updatedAt: "2026-08-25",
    reviewedAt: "2026-08-25",
    adminReviewerId: "admin-1",
  },
  {
    id: "CSR-2026-008",
    industryId: "ind-1",
    industryName: "Tata Steel CSR Foundation",
    projectId: "PB-2026-003",
    supportType: "EQUIPMENT_RESOURCES",
    description: "Provision of backup diesel generators for health centers during monsoon season.",
    resourcesOffered: "3 backup generators",
    expectedDuration: "3 months",
    status: "UNDER_REVIEW",
    createdAt: "2026-08-27",
    updatedAt: "2026-08-27",
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

export const industryService = {
  // ----------------------------------------------------
  // Profile API
  // ----------------------------------------------------
  getProfile(industryId = "ind-1"): IndustryOrganizationProfile {
    const seededIds = ["ind-1", "ind-2", "ind-3", "ind-4", "ind-5", "ind-suspended"];
    if (!seededIds.includes(industryId)) {
      const stored = typeof window !== "undefined" ? localStorage.getItem(`ind_profile_${industryId}`) : null;
      if (stored) {
        return JSON.parse(stored);
      }
      return {
        id: industryId,
        name: "New Corporate CSR Partner",
        orgType: "Corporate CSR",
        representativeName: "Representative",
        email: "",
        phone: "",
        location: "Chennai, Tamil Nadu",
        state: "Tamil Nadu",
        district: "Chennai",
        website: "",
        csrFocusAreas: [],
        expertise: [],
        availableResources: []
      };
    }
    return getStoredData<IndustryOrganizationProfile>(`ind_profile_${industryId}`, INITIAL_INDUSTRY_PROFILE);
  },

  saveProfile(profile: IndustryOrganizationProfile): void {
    setStoredData(`ind_profile_${profile.id}`, profile);
    universityMockService.addActivity(`Industry profile for "${profile.name}" updated.`);
  },

  // ----------------------------------------------------
  // Eligible Projects API
  // ----------------------------------------------------
  getEligibleProjects(industryId = "ind-1"): ResolvedProject[] {
    const rawProjects = universityMockService.getProjects();
    const resolved: ResolvedProject[] = [];

    const seededIds = ["ind-1", "ind-2", "ind-3", "ind-4", "ind-5", "ind-suspended"];
    const isNewIndustry = !seededIds.includes(industryId);

    for (const proj of rawProjects) {
      // Exclude seeded projects for new industry organizations
      if (isNewIndustry && ["PB-2026-001", "PB-2026-002", "PB-2026-003", "PB-2026-004", "PB-2026-005"].includes(proj.id)) {
        continue;
      }
      const res = universityMockService.resolveProject(proj);
      if (res) {
        resolved.push(res);
      }
    }

    return resolved;
  },

  getEligibleProjectById(projectId: string, industryId = "ind-1"): ResolvedProject | undefined {
    const seededIds = ["ind-1", "ind-2", "ind-3", "ind-4", "ind-5", "ind-suspended"];
    const isNewIndustry = !seededIds.includes(industryId);

    if (isNewIndustry && ["PB-2026-001", "PB-2026-002", "PB-2026-003", "PB-2026-004", "PB-2026-005"].includes(projectId)) {
      return undefined;
    }

    const raw = universityMockService.getProjectById(projectId);
    if (!raw) return undefined;
    return universityMockService.resolveProject(raw);
  },

  // ----------------------------------------------------
  // Smart Industry Matching API
  // ----------------------------------------------------
  getAllIndustryProfilesForMatching(): any[] {
    const baseline = [
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
        technologyCapabilities: [],
        csrFocusAreas: ["Water"],
        resources: ["Other"],
        previousProjects: [],
        status: "SUSPENDED"
      }
    ];

    if (typeof window === "undefined") return baseline;

    const keys = Object.keys(localStorage);
    const dynamic: any[] = [];
    keys.forEach(k => {
      if (k.startsWith("ind_profile_")) {
        const id = k.replace("ind_profile_", "");
        if (!["ind-1", "ind-2", "ind-3", "ind-4", "ind-5", "ind-suspended"].includes(id)) {
          try {
            const data = JSON.parse(localStorage.getItem(k) || "{}");
            if (data && data.id) {
              dynamic.push({
                id: data.id,
                name: data.name,
                orgType: data.orgType || "Corporate CSR",
                location: data.location || "",
                state: data.state || "",
                district: data.district || "",
                expertise: data.expertise || [],
                technologyCapabilities: data.availableResources || [],
                csrFocusAreas: data.csrFocusAreas || [],
                resources: data.availableResources || [],
                previousProjects: [],
                status: "ACTIVE"
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    });

    return [...baseline, ...dynamic];
  },

  getIndustryRecommendationsForProject(projectId: string): IndustryMatchResult[] {
    const project = this.getEligibleProjectById(projectId);
    if (!project) return [];

    const problemAnalysis = universityMockService.getProblemAnalysis(project.originalProblem.id);
    const activeRequests = this.getSupportRequestsForProject(projectId);
    const profiles = this.getAllIndustryProfilesForMatching();

    return getIndustryRecommendationsForProject(project, problemAnalysis, activeRequests, profiles);
  },

  getMatchForIndustryAndProject(projectId: string, industryId = "ind-1"): IndustryMatchResult | undefined {
    const recs = this.getIndustryRecommendationsForProject(projectId);
    return recs.find(r => r.industryId === industryId);
  },

  // ----------------------------------------------------
  // Support Requests API
  // ----------------------------------------------------
  getAllSupportRequests(): IndustrySupportRequest[] {
    return getStoredData<IndustrySupportRequest[]>("ind_support_requests", INITIAL_SUPPORT_REQUESTS);
  },

  getSupportRequestById(id: string): IndustrySupportRequest | undefined {
    return this.getAllSupportRequests().find((r) => r.id === id);
  },

  getSupportRequestsForIndustry(industryId = "ind-1"): IndustrySupportRequest[] {
    return this.getAllSupportRequests().filter((r) => r.industryId === industryId);
  },

  getSupportRequestsForProject(projectId: string): IndustrySupportRequest[] {
    return this.getAllSupportRequests().filter((r) => r.projectId === projectId);
  },

  getAcceptedSupportRequestsForProject(projectId: string): IndustrySupportRequest[] {
    return this.getSupportRequestsForProject(projectId).filter((r) => r.status === "ACCEPTED");
  },

  // Server-Side Duplicate Check & Request Submission
  submitSupportRequest(
    input: {
      projectId: string;
      supportType: SupportType;
      description: string;
      estimatedFunding?: number;
      resourcesOffered?: string;
      expectedDuration?: string;
    },
    industryId = "ind-1"
  ): IndustrySupportRequest {
    const profile = this.getProfile(industryId);
    const project = this.getEligibleProjectById(input.projectId);

    if (!project) {
      throw new Error("Invalid request: Target project does not exist or is not eligible for industry participation.");
    }

    if (!input.description.trim()) {
      throw new Error("Validation Error: Support description is required.");
    }

    const requests = this.getAllSupportRequests();

    // Duplicate Check: Cannot submit active request for same (industryId, projectId, supportType)
    const existingActive = requests.find(
      (r) =>
        r.industryId === industryId &&
        r.projectId === input.projectId &&
        r.supportType === input.supportType &&
        (r.status === "PENDING" || r.status === "UNDER_REVIEW" || r.status === "ACCEPTED")
    );

    if (existingActive) {
      throw new Error(`Duplicate Request: An active "${SUPPORT_TYPE_LABELS[input.supportType]}" request already exists for this project (${existingActive.status}).`);
    }

    const today = new Date().toISOString().split("T")[0];
    const newRequest: IndustrySupportRequest = {
      id: `CSR-2026-00${requests.length + 1}`,
      industryId,
      industryName: profile.name,
      projectId: input.projectId,
      supportType: input.supportType,
      description: input.description.trim(),
      estimatedFunding: input.estimatedFunding ? Number(input.estimatedFunding) : undefined,
      resourcesOffered: input.resourcesOffered ? input.resourcesOffered.trim() : undefined,
      expectedDuration: input.expectedDuration ? input.expectedDuration.trim() : undefined,
      status: "PENDING",
      createdAt: today,
      updatedAt: today,
    };

    requests.push(newRequest);
    setStoredData("ind_support_requests", requests);

    universityMockService.addActivity(
      `Industry support interest submitted by "${profile.name}" (${SUPPORT_TYPE_LABELS[input.supportType]}) for project "${project.title}".`,
      {
        actor: profile.name,
        actorRole: "INDUSTRY",
        action: "Industry support requested",
        entityType: "SUPPORT_REQUEST",
        entityId: newRequest.id,
        entityName: `${profile.name} - ${SUPPORT_TYPE_LABELS[input.supportType]}`,
        newState: "PENDING"
      }
    );

    try {
      notificationService.createNotification({
        userId: "admin-1",
        role: "ADMIN",
        type: "INDUSTRY_SUPPORT_SUBMITTED",
        priority: "MEDIUM",
        title: "New CSR Support Request Received",
        message: `Industry partner "${profile.name}" submitted support interest (${SUPPORT_TYPE_LABELS[input.supportType]}) for project "${project.title}".`,
        entityType: "INDUSTRY_REQUEST",
        entityId: newRequest.id,
        actionUrl: `/admin/industry-support/${newRequest.id}`,
        isActionRequired: true,
      });
    } catch (e) {
      console.error(e);
    }

    return newRequest;
  },

  // ----------------------------------------------------
  // ADMIN REVIEW API (Server-side Role Check)
  // ----------------------------------------------------
  updateSupportRequestStatus(
    requestId: string,
    status: SupportStatus,
    notes?: { rejectionReason?: string; clarificationNote?: string },
    userRole = "ADMIN"
  ): IndustrySupportRequest {
    // 1. Server-side role enforcement
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can review and change industry support requests.");
    }

    const requests = this.getAllSupportRequests();
    const idx = requests.findIndex((r) => r.id === requestId);

    if (idx === -1) {
      throw new Error("Support request not found.");
    }

    const req = requests[idx];
    const today = new Date().toISOString().split("T")[0];
    const project = this.getEligibleProjectById(req.projectId);
    const projectTitle = project ? project.title : req.projectId;

    requests[idx].status = status;
    requests[idx].updatedAt = today;
    requests[idx].reviewedAt = today;
    requests[idx].adminReviewerId = "admin-1";

    if (notes?.rejectionReason) {
      requests[idx].rejectionReason = notes.rejectionReason.trim();
    }
    if (notes?.clarificationNote) {
      requests[idx].clarificationNote = notes.clarificationNote.trim();
    }

    setStoredData("ind_support_requests", requests);

    // Create activity event without changing project lifecycle stage
    if (status === "ACCEPTED") {
      this.createPartnership(requests[idx]);
      universityMockService.addActivity(
        `CSR support from "${req.industryName}" (${SUPPORT_TYPE_LABELS[req.supportType]}) accepted for "${projectTitle}".`,
        {
          actor: "Sunita Rao",
          actorRole: "ADMIN",
          action: "Industry support approved",
          entityType: "SUPPORT_REQUEST",
          entityId: requestId,
          entityName: `${req.industryName} - ${SUPPORT_TYPE_LABELS[req.supportType]}`,
          previousState: "PENDING",
          newState: "ACCEPTED"
        }
      );
      try {
        notificationService.createNotification({
          userId: req.industryId,
          role: "INDUSTRY",
          type: "INDUSTRY_SUPPORT_ACCEPTED",
          priority: "HIGH",
          title: "CSR Support Request Approved",
          message: `Your ${SUPPORT_TYPE_LABELS[req.supportType]} support for project "${projectTitle}" has been formally approved by Administration.`,
          entityType: "INDUSTRY_REQUEST",
          entityId: requestId,
          actionUrl: `/industry/projects/${req.projectId}`,
          isActionRequired: false,
        });
      } catch (e) { console.error(e); }
    } else if (status === "REJECTED") {
      universityMockService.addActivity(
        `CSR support request from "${req.industryName}" rejected for "${projectTitle}".${notes?.rejectionReason ? ` Reason: ${notes.rejectionReason}` : ""}`,
        {
          actor: "Sunita Rao",
          actorRole: "ADMIN",
          action: "Industry support rejected",
          entityType: "SUPPORT_REQUEST",
          entityId: requestId,
          entityName: `${req.industryName} - ${SUPPORT_TYPE_LABELS[req.supportType]}`,
          previousState: "PENDING",
          newState: "REJECTED",
          note: notes?.rejectionReason
        }
      );
      try {
        notificationService.createNotification({
          userId: req.industryId,
          role: "INDUSTRY",
          type: "INDUSTRY_SUPPORT_REJECTED",
          priority: "MEDIUM",
          title: "CSR Support Request Declined",
          message: `Your ${SUPPORT_TYPE_LABELS[req.supportType]} support request for project "${projectTitle}" was not approved.${notes?.rejectionReason ? ` Reason: ${notes.rejectionReason}` : ""}`,
          entityType: "INDUSTRY_REQUEST",
          entityId: requestId,
          actionUrl: `/industry/interests`,
          isActionRequired: false,
        });
      } catch (e) { console.error(e); }
    } else if (status === "UNDER_REVIEW") {
      if (notes?.clarificationNote) {
        universityMockService.addActivity(
          `Clarification requested from "${req.industryName}" for "${projectTitle}": ${notes.clarificationNote}`,
          {
            actor: "Sunita Rao",
            actorRole: "ADMIN",
            action: "Industry support clarification requested",
            entityType: "SUPPORT_REQUEST",
            entityId: requestId,
            entityName: `${req.industryName} - ${SUPPORT_TYPE_LABELS[req.supportType]}`,
            previousState: "PENDING",
            newState: "UNDER_REVIEW",
            note: notes.clarificationNote
          }
        );
        try {
          notificationService.createNotification({
            userId: req.industryId,
            role: "INDUSTRY",
            type: "INDUSTRY_SUPPORT_CLARIFICATION",
            priority: "MEDIUM",
            title: "Clarification Requested on CSR Support",
            message: `Admin requested clarification on your support for "${projectTitle}": "${notes.clarificationNote}"`,
            entityType: "INDUSTRY_REQUEST",
            entityId: requestId,
            actionUrl: `/industry/interests`,
            isActionRequired: true,
          });
        } catch (e) { console.error(e); }
      } else {
        universityMockService.addActivity(
          `Admin started review of CSR support request from "${req.industryName}" for "${projectTitle}".`,
          {
            actor: "Sunita Rao",
            actorRole: "ADMIN",
            action: "Industry support review started",
            entityType: "SUPPORT_REQUEST",
            entityId: requestId,
            entityName: `${req.industryName} - ${SUPPORT_TYPE_LABELS[req.supportType]}`,
            previousState: "PENDING",
            newState: "UNDER_REVIEW"
          }
        );
      }
    }

    return requests[idx];
  },

  // ----------------------------------------------------
  // Dynamic Dashboard Metrics API
  // ----------------------------------------------------
  getIndustryMetrics(industryId = "ind-1"): {
    availableProjectsCount: number;
    myInterestsCount: number;
    supportRequestsCount: number;
    activePartnershipsCount: number;
  } {
    const availableProjectsCount = this.getEligibleProjects().length;
    const myRequests = this.getSupportRequestsForIndustry(industryId);

    const myInterestsCount = myRequests.length;
    const supportRequestsCount = myRequests.filter((r) => r.status === "PENDING" || r.status === "UNDER_REVIEW").length;
    const activePartnershipsCount = myRequests.filter((r) => r.status === "ACCEPTED").length;

    return {
      availableProjectsCount,
      myInterestsCount,
      supportRequestsCount,
      activePartnershipsCount,
    };
  },

  getAdminSupportMetrics(): {
    pendingCount: number;
    underReviewCount: number;
    acceptedCount: number;
    rejectedCount: number;
    totalRequestsCount: number;
    activePartnershipsCount: number;
  } {
    const all = this.getAllSupportRequests();
    return {
      pendingCount: all.filter((r) => r.status === "PENDING").length,
      underReviewCount: all.filter((r) => r.status === "UNDER_REVIEW").length,
      acceptedCount: all.filter((r) => r.status === "ACCEPTED").length,
      rejectedCount: all.filter((r) => r.status === "REJECTED").length,
      totalRequestsCount: all.length,
      activePartnershipsCount: all.filter((r) => r.status === "ACCEPTED").length,
    };
  },

  // ----------------------------------------------------
  // Industry Partnerships API
  // ----------------------------------------------------
  getAllPartnerships(): IndustryPartnership[] {
    const saved = getStoredData<IndustryPartnership[]>("ind_partnerships", []);
    if (saved && saved.length > 0) {
      return saved;
    }

    // Seeding default partnerships from accepted requests
    const requests = this.getAllSupportRequests();
    const accepted = requests.filter(r => r.status === "ACCEPTED");
    const list: IndustryPartnership[] = [];

    accepted.forEach((req, idx) => {
      const deliveryItems: SupportDeliveryItem[] = [];
      if (req.supportType === "CSR_FUNDING") {
        deliveryItems.push({
          id: `${req.id}-item-1`,
          name: "CSR Funding",
          value: req.estimatedFunding ? `₹${req.estimatedFunding.toLocaleString('en-IN')}` : "Not available",
          status: req.id === "CSR-2026-001" ? "VERIFIED" : "COMMITTED",
          deliveryDate: req.id === "CSR-2026-001" ? "2026-08-14" : undefined,
          evidenceRef: req.id === "CSR-2026-001" ? "TXN-87612398" : undefined,
          notes: req.id === "CSR-2026-001" ? "First installment of ₹7,50,000 wired to Ranchi University research account." : undefined,
          verifiedBy: req.id === "CSR-2026-001" ? "Government Administration" : undefined,
          verifiedDate: req.id === "CSR-2026-001" ? "2026-08-15" : undefined
        });
      } else {
        deliveryItems.push({
          id: `${req.id}-item-1`,
          name: SUPPORT_TYPE_LABELS[req.supportType],
          value: req.resourcesOffered || "Standard Partnership Support",
          status: "COMMITTED"
        });
      }

      if (req.resourcesOffered && req.supportType === "CSR_FUNDING") {
        deliveryItems.push({
          id: `${req.id}-item-2`,
          name: "Material Resources",
          value: req.resourcesOffered,
          status: req.id === "CSR-2026-001" ? "IN_PROGRESS" : "PLANNED"
        });
      }

      const project = universityMockService.getProjectById(req.projectId);
      list.push({
        id: `PTN-2026-00${idx + 1}`,
        requestId: req.id,
        industryId: req.industryId,
        projectId: req.projectId,
        status: (project && project.stage === "COMPLETED") ? "COMPLETED" : "ACTIVE",
        startDate: req.createdAt,
        endDate: req.expectedDuration || "12 months",
        approvedDate: req.reviewedAt || req.updatedAt,
        deliveryItems
      });
    });

    if (isClient) {
      setStoredData("ind_partnerships", list);
    }
    return list;
  },

  getPartnershipById(id: string): IndustryPartnership | undefined {
    return this.getAllPartnerships().find(p => p.id === id);
  },

  getPartnershipByProjectId(projectId: string): IndustryPartnership | undefined {
    return this.getAllPartnerships().find(p => p.projectId === projectId);
  },

  getPartnershipsForIndustry(industryId = "ind-1"): IndustryPartnership[] {
    return this.getAllPartnerships().filter(p => p.industryId === industryId);
  },

  createPartnership(req: IndustrySupportRequest): IndustryPartnership {
    const partnerships = this.getAllPartnerships();
    const existing = partnerships.find(p => p.requestId === req.id);
    if (existing) return existing;

    const today = new Date().toISOString().split("T")[0];
    const project = this.getEligibleProjectById(req.projectId);

    const deliveryItems: SupportDeliveryItem[] = [];
    if (req.supportType === "CSR_FUNDING") {
      deliveryItems.push({
        id: `${req.id}-item-1`,
        name: "CSR Funding",
        value: req.estimatedFunding ? `₹${req.estimatedFunding.toLocaleString('en-IN')}` : "Not available",
        status: "COMMITTED"
      });
    } else {
      deliveryItems.push({
        id: `${req.id}-item-1`,
        name: SUPPORT_TYPE_LABELS[req.supportType],
        value: req.resourcesOffered || "Standard Partnership Support",
        status: "COMMITTED"
      });
    }

    if (req.resourcesOffered && req.supportType === "CSR_FUNDING") {
      deliveryItems.push({
        id: `${req.id}-item-2`,
        name: "Material Resources",
        value: req.resourcesOffered,
        status: "PLANNED"
      });
    }

    const newPartnership: IndustryPartnership = {
      id: `PTN-2026-00${partnerships.length + 1}`,
      requestId: req.id,
      industryId: req.industryId,
      projectId: req.projectId,
      status: (project && project.stage === "COMPLETED") ? "COMPLETED" : "ACTIVE",
      startDate: req.createdAt,
      endDate: req.expectedDuration || "12 months",
      approvedDate: today,
      deliveryItems
    };

    partnerships.push(newPartnership);
    setStoredData("ind_partnerships", partnerships);

    // Track activity timeline
    universityMockService.addActivity(
      `CSR partnership formally created under ID "${newPartnership.id}" for project "${project?.title || req.projectId}".`,
      {
        actor: "Sunita Rao",
        actorRole: "ADMIN",
        action: "Partnership created",
        entityType: "PROJECT",
        entityId: req.projectId,
        entityName: project?.title || req.projectId,
        newState: "ACTIVE"
      }
    );

    return newPartnership;
  },

  updateDeliveryItem(
    partnershipId: string,
    itemId: string,
    input: {
      status: DeliveryStatus;
      details?: string;
      deliveryDate?: string;
      evidenceRef?: string;
      notes?: string;
    },
    userRole = "INDUSTRY"
  ): IndustryPartnership {
    const partnerships = this.getAllPartnerships();
    const idx = partnerships.findIndex(p => p.id === partnershipId);
    if (idx === -1) throw new Error("Partnership not found.");

    const ptn = partnerships[idx];
    const itemIdx = ptn.deliveryItems.findIndex(i => i.id === itemId);
    if (itemIdx === -1) throw new Error("Delivery item not found.");

    const item = ptn.deliveryItems[itemIdx];

    // Security check: only ADMIN can VERIFY
    if (userRole !== "ADMIN" && input.status === "VERIFIED") {
      throw new Error("Unauthorized: Only Government Administrators can verify support deliveries.");
    }

    item.status = input.status;
    if (input.details) item.value = input.details;
    if (input.deliveryDate) item.deliveryDate = input.deliveryDate;
    if (input.evidenceRef) item.evidenceRef = input.evidenceRef;
    if (input.notes) item.notes = input.notes;

    if (userRole === "ADMIN" && input.status === "VERIFIED") {
      item.verifiedBy = "Government Administration";
      item.verifiedDate = new Date().toISOString().split("T")[0];
    }

    ptn.deliveryItems[itemIdx] = item;
    partnerships[idx] = ptn;
    setStoredData("ind_partnerships", partnerships);

    const profile = this.getProfile(ptn.industryId);
    const project = this.getEligibleProjectById(ptn.projectId);
    const projectTitle = project ? project.title : ptn.projectId;

    // Log Activity Log
    universityMockService.addActivity(
      userRole === "ADMIN" 
        ? `Government verified CSR delivery of "${item.name}" under partnership "${partnershipId}".` 
        : `CSR support delivery update for "${item.name}" submitted under partnership "${partnershipId}" (Status: ${input.status}).`,
      {
        actor: userRole === "ADMIN" ? "Sunita Rao" : profile.name,
        actorRole: userRole === "ADMIN" ? "ADMIN" : "INDUSTRY",
        action: userRole === "ADMIN" ? "Support delivery verified" : "Support delivery updated",
        entityType: "PROJECT",
        entityId: ptn.projectId,
        entityName: projectTitle,
        newState: input.status,
        note: input.notes
      }
    );

    return ptn;
  },

  // ----------------------------------------------------
  // Dynamic Dashboard Metrics API (Improved)
  // ----------------------------------------------------
  getIndustryDashboardMetrics(industryId = "ind-1"): {
    availableProjectsCount: number;
    recommendedProjectsCount: number;
    mySupportRequestsCount: number;
    pendingRequestsCount: number;
    activePartnershipsCount: number;
    totalCommittedFunding: number;
    supportDeliveredCount: number;
    supportAwaitingVerificationCount: number;
  } {
    const available = this.getEligibleProjects();
    const recommendations = available.filter(p => {
      const match = this.getMatchForIndustryAndProject(p.id, industryId);
      return match && match.score > 0;
    });

    const myRequests = this.getSupportRequestsForIndustry(industryId);
    const pending = myRequests.filter(r => r.status === "PENDING" || r.status === "UNDER_REVIEW");

    const partnerships = this.getAllPartnerships().filter(p => p.industryId === industryId);
    const active = partnerships.filter(p => p.status === "ACTIVE");

    const totalCommittedFunding = partnerships.reduce((sum, ptn) => {
      const req = myRequests.find(r => r.id === ptn.requestId);
      return sum + (req?.estimatedFunding || 0);
    }, 0);

    let supportDeliveredCount = 0;
    let supportAwaitingVerificationCount = 0;

    partnerships.forEach(ptn => {
      ptn.deliveryItems.forEach(item => {
        if (item.status === "DELIVERED" || item.status === "VERIFIED") {
          supportDeliveredCount++;
        }
        if (item.status === "DELIVERED") {
          supportAwaitingVerificationCount++;
        }
      });
    });

    return {
      availableProjectsCount: available.length,
      recommendedProjectsCount: recommendations.length,
      mySupportRequestsCount: myRequests.length,
      pendingRequestsCount: pending.length,
      activePartnershipsCount: active.length,
      totalCommittedFunding,
      supportDeliveredCount,
      supportAwaitingVerificationCount
    };
  }
};
