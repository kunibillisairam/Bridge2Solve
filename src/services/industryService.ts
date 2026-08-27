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
    return getStoredData<IndustryOrganizationProfile>(`ind_profile_${industryId}`, INITIAL_INDUSTRY_PROFILE);
  },

  saveProfile(profile: IndustryOrganizationProfile): void {
    setStoredData(`ind_profile_${profile.id}`, profile);
    universityMockService.addActivity(`Industry profile for "${profile.name}" updated.`);
  },

  // ----------------------------------------------------
  // Eligible Projects API
  // ----------------------------------------------------
  getEligibleProjects(): ResolvedProject[] {
    const rawProjects = universityMockService.getProjects();
    const resolved: ResolvedProject[] = [];

    for (const proj of rawProjects) {
      const res = universityMockService.resolveProject(proj);
      if (res) {
        resolved.push(res);
      }
    }

    return resolved;
  },

  getEligibleProjectById(projectId: string): ResolvedProject | undefined {
    const raw = universityMockService.getProjectById(projectId);
    if (!raw) return undefined;
    return universityMockService.resolveProject(raw);
  },

  // ----------------------------------------------------
  // Smart Industry Matching API
  // ----------------------------------------------------
  getIndustryRecommendationsForProject(projectId: string): IndustryMatchResult[] {
    const project = this.getEligibleProjectById(projectId);
    if (!project) return [];

    const problemAnalysis = universityMockService.getProblemAnalysis(project.originalProblem.id);
    const activeRequests = this.getSupportRequestsForProject(projectId);

    return getIndustryRecommendationsForProject(project, problemAnalysis, activeRequests);
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
      `Industry support interest submitted by "${profile.name}" (${SUPPORT_TYPE_LABELS[input.supportType]}) for project "${project.title}".`
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
      universityMockService.addActivity(
        `CSR support from "${req.industryName}" (${SUPPORT_TYPE_LABELS[req.supportType]}) accepted for "${projectTitle}".`
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
        `CSR support request from "${req.industryName}" rejected for "${projectTitle}".`
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
          `Clarification requested from "${req.industryName}" for "${projectTitle}": ${notes.clarificationNote}`
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
          `Admin started review of CSR support request from "${req.industryName}" for "${projectTitle}".`
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
  }
};
