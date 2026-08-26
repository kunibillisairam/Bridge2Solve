import { universityMockService, UniversityProject, ResolvedProject } from "./universityMockService";

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
  createdAt: string;
  updatedAt: string;
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
    id: "supp-1",
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
  },
  {
    id: "supp-2",
    industryId: "ind-1",
    industryName: "Tata Steel CSR Foundation",
    projectId: "PB-2026-001",
    supportType: "EQUIPMENT_RESOURCES",
    description: "Provision of high-density polyethylene storage tanks and gravity filtration pipes.",
    resourcesOffered: "20 storage tanks and filtration media",
    expectedDuration: "2 months",
    status: "UNDER_REVIEW",
    createdAt: "2026-08-18",
    updatedAt: "2026-08-18",
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
  // Eligible Projects API (Only actual created projects)
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
  // Support Requests API
  // ----------------------------------------------------
  getAllSupportRequests(): IndustrySupportRequest[] {
    return getStoredData<IndustrySupportRequest[]>("ind_support_requests", INITIAL_SUPPORT_REQUESTS);
  },

  getSupportRequestsForIndustry(industryId = "ind-1"): IndustrySupportRequest[] {
    return this.getAllSupportRequests().filter((r) => r.industryId === industryId);
  },

  getSupportRequestsForProject(projectId: string): IndustrySupportRequest[] {
    return this.getAllSupportRequests().filter((r) => r.projectId === projectId);
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

    // Duplicate Check: Industry cannot submit another ACTIVE request for the same project and supportType
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
      id: `supp-${Date.now()}`,
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

    // Create activity event without changing project lifecycle
    universityMockService.addActivity(
      `Industry support interest submitted by "${profile.name}" (${SUPPORT_TYPE_LABELS[input.supportType]}) for project "${project.title}".`
    );

    return newRequest;
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
  }
};
