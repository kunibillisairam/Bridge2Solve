"use client";

import { universityMockService, UniversityProject } from "./universityMockService";
import { notificationService } from "./notificationService";

export type ImpactAssessmentStatus = 
  | "DRAFT" 
  | "SUBMITTED" 
  | "UNDER_REVIEW" 
  | "REVISION_REQUIRED" 
  | "VERIFIED";

export interface ImpactMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  description?: string;
}

export interface BeforeAfterComparison {
  metricName: string;
  beforeValue: string;
  afterValue: string;
  unit?: string;
}

export interface EvidenceDocument {
  name: string;
  type: string;
  uploadedDate: string;
  uploadedBy: string;
  size?: string;
}

export interface ImpactAssessment {
  id: string;
  projectId: string;
  submittedBy: string;
  status: ImpactAssessmentStatus;
  summary: string;
  beneficiariesReached: number;
  locationsCovered: string;
  problemImprovement: string;
  keyOutcomes: string[];
  challenges: string;
  lessonsLearned: string;
  beforeAfterComparisons: BeforeAfterComparison[];
  impactMetrics: ImpactMetric[];
  evidenceDocuments: EvidenceDocument[];
  adminFeedbackNote?: string;
  adminReviewerId?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  verifiedAt?: string;
}

// Initial Demo Data
const INITIAL_ASSESSMENTS: ImpactAssessment[] = [
  {
    id: "impact-PB-2026-004",
    projectId: "PB-2026-004",
    submittedBy: "Dr. Priyadarshini Mohanty (Odisha State University)",
    status: "VERIFIED",
    summary: "Deployed 150 offline vernacular learning tablets and conducted community learning workshops across 20 tribal schools in Mayurbhanj district.",
    beneficiariesReached: 1800,
    locationsCovered: "20 Tribal Schools across 8 Gram Panchayats, Mayurbhanj, Odisha",
    problemImprovement: "School dropout rates after grade 8 decreased by 38% in target schools. Student attendance improved from 62% to 89%.",
    keyOutcomes: [
      "38% reduction in grade 8+ school dropout rates.",
      "150 offline vernacular tablets actively utilized in classrooms.",
      "85 local youth trained as digital learning facilitators."
    ],
    challenges: "Initial resistance to digital tools and lack of local charging infrastructure in 3 remote hamlets.",
    lessonsLearned: "Integrating solar charging stations with tablet kits is essential for sustained remote school deployment.",
    beforeAfterComparisons: [
      { metricName: "Grade 8+ Dropout Rate", beforeValue: "42%", afterValue: "4%", unit: "%" },
      { metricName: "Average Student Attendance", beforeValue: "62%", afterValue: "89%", unit: "%" },
      { metricName: "Offline Tablet Availability", beforeValue: "0", afterValue: "150", unit: "tablets" }
    ],
    impactMetrics: [
      { id: "m1", name: "Students Benefited", value: 1800, unit: "students", description: "Enrolled students across 20 schools" },
      { id: "m2", name: "Schools Covered", value: 20, unit: "schools", description: "Target tribal primary & secondary schools" },
      { id: "m3", name: "Dropout Reduction", value: 38, unit: "%", description: "Reduction in grade 8 dropouts" }
    ],
    evidenceDocuments: [
      { name: "End-line Impact Survey Report", type: "PDF", uploadedDate: "15 Jun 2026", uploadedBy: "Dr. Priyadarshini Mohanty", size: "5.2 MB" },
      { name: "School Attendance Records", type: "XLSX", uploadedDate: "20 Jun 2026", uploadedBy: "District Education Officer", size: "1.4 MB" },
      { name: "Field Deployment Photographs", type: "ZIP", uploadedDate: "22 Jun 2026", uploadedBy: "Alok Das", size: "14.8 MB" }
    ],
    adminFeedbackNote: "Comprehensive field evidence and verified school attendance records confirm successful deployment and outcome.",
    adminReviewerId: "admin-1",
    createdAt: "2026-06-10",
    updatedAt: "2026-06-30",
    submittedAt: "2026-06-15",
    verifiedAt: "2026-06-30"
  },
  {
    id: "impact-PB-2026-002",
    projectId: "PB-2026-002",
    submittedBy: "Dr. Sanjay Dutt (Punjab Agricultural University)",
    status: "SUBMITTED",
    summary: "Applied halophilic microbial soil bio-fertilizers across 50 experimental farm plots in Sangrur district to remediate chemical salinity.",
    beneficiariesReached: 12000,
    locationsCovered: "50 Farm Plots across 12 Villages, Sangrur, Punjab",
    problemImprovement: "Electrical conductivity (EC) of soil reduced from 8.5 dS/m to 4.2 dS/m. Wheat crop yield increased by 22% in trial fields.",
    keyOutcomes: [
      "Soil salinity EC levels reduced by 50% in test plots.",
      "Wheat crop yield restored by 22% in first season.",
      "120 farmers trained on halophilic microbial bio-fertilizers."
    ],
    challenges: "Uneven soil drainage in low-lying fields delayed bio-fertilizer absorption during monsoon rain events.",
    lessonsLearned: "Soil drainage channels must be cleared prior to microbial inoculant application.",
    beforeAfterComparisons: [
      { metricName: "Soil Electrical Conductivity", beforeValue: "8.5 dS/m", afterValue: "4.2 dS/m", unit: "dS/m" },
      { metricName: "Average Wheat Yield", beforeValue: "18 quintals/acre", afterValue: "22 quintals/acre", unit: "q/acre" },
      { metricName: "Farmers Impacted", beforeValue: "0", afterValue: "12,000", unit: "farmers" }
    ],
    impactMetrics: [
      { id: "m4", name: "Farmers Benefited", value: 12000, unit: "farmers", description: "Target farming community in Sangrur" },
      { id: "m5", name: "Trial Plots Treated", value: 50, unit: "plots", description: "Experimental farm plots" },
      { id: "m6", name: "Yield Improvement", value: 22, unit: "%", description: "Wheat crop yield increase" }
    ],
    evidenceDocuments: [
      { name: "Field Trial Soil Analysis Report", type: "PDF", uploadedDate: "26 Aug 2026", uploadedBy: "Dr. Sanjay Dutt", size: "3.1 MB" },
      { name: "Farmer Harvest Receipts", type: "PDF", uploadedDate: "26 Aug 2026", uploadedBy: "Nikhil Gupta", size: "2.1 MB" }
    ],
    createdAt: "2026-08-25",
    updatedAt: "2026-08-26",
    submittedAt: "2026-08-26"
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

export const impactService = {
  getAssessments(): ImpactAssessment[] {
    return getStoredData<ImpactAssessment[]>("pb_impact_assessments", INITIAL_ASSESSMENTS);
  },

  getImpactAssessmentForProject(projectId: string): ImpactAssessment | undefined {
    return this.getAssessments().find((a) => a.projectId === projectId);
  },

  saveImpactAssessment(
    projectId: string,
    data: {
      summary: string;
      beneficiariesReached: number;
      locationsCovered: string;
      problemImprovement: string;
      keyOutcomes: string[];
      challenges: string;
      lessonsLearned: string;
      beforeAfterComparisons?: BeforeAfterComparison[];
      impactMetrics?: ImpactMetric[];
      evidenceDocuments?: EvidenceDocument[];
      submittedBy?: string;
    },
    isSubmit = false,
    userRole = "UNIVERSITY"
  ): ImpactAssessment {
    if (userRole !== "UNIVERSITY" && userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only university teams or platform admins can submit impact assessments.");
    }

    const assessments = this.getAssessments();
    const idx = assessments.findIndex((a) => a.projectId === projectId);
    const today = new Date().toISOString().split("T")[0];

    const project = universityMockService.getProjectById(projectId);
    if (!project) {
      throw new Error("Project not found.");
    }

    let updatedAssessment: ImpactAssessment;

    if (idx !== -1) {
      updatedAssessment = {
        ...assessments[idx],
        summary: data.summary.trim(),
        beneficiariesReached: data.beneficiariesReached,
        locationsCovered: data.locationsCovered.trim(),
        problemImprovement: data.problemImprovement.trim(),
        keyOutcomes: data.keyOutcomes.filter((k) => k.trim() !== ""),
        challenges: data.challenges.trim(),
        lessonsLearned: data.lessonsLearned.trim(),
        beforeAfterComparisons: data.beforeAfterComparisons || assessments[idx].beforeAfterComparisons || [],
        impactMetrics: data.impactMetrics || assessments[idx].impactMetrics || [],
        evidenceDocuments: data.evidenceDocuments || assessments[idx].evidenceDocuments || [],
        submittedBy: data.submittedBy || assessments[idx].submittedBy || "University Research Team",
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        updatedAt: today,
        submittedAt: isSubmit ? today : assessments[idx].submittedAt,
      };
      assessments[idx] = updatedAssessment;
    } else {
      updatedAssessment = {
        id: `impact-${projectId}`,
        projectId,
        submittedBy: data.submittedBy || "University Research Team",
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        summary: data.summary.trim(),
        beneficiariesReached: data.beneficiariesReached,
        locationsCovered: data.locationsCovered.trim(),
        problemImprovement: data.problemImprovement.trim(),
        keyOutcomes: data.keyOutcomes.filter((k) => k.trim() !== ""),
        challenges: data.challenges.trim(),
        lessonsLearned: data.lessonsLearned.trim(),
        beforeAfterComparisons: data.beforeAfterComparisons || [],
        impactMetrics: data.impactMetrics || [],
        evidenceDocuments: data.evidenceDocuments || [],
        createdAt: today,
        updatedAt: today,
        submittedAt: isSubmit ? today : undefined,
      };
      assessments.push(updatedAssessment);
    }

    setStoredData("pb_impact_assessments", assessments);

    if (isSubmit) {
      universityMockService.addActivity(`Impact assessment submitted for project "${project.title}" (${projectId}).`);
      
      // Transition project stage to AWAITING_ADMIN_VERIFICATION
      const projects = universityMockService.getProjects();
      const pIdx = projects.findIndex((p) => p.id === projectId);
      if (pIdx !== -1) {
        projects[pIdx].stage = "AWAITING_ADMIN_VERIFICATION";
        projects[pIdx].verificationEvidenceStatus = "SUBMITTED";
        projects[pIdx].customProgress = 95;
        projects[pIdx].completionVerificationNote = data.summary;
        // Persist the updated projects array to localStorage
        setStoredData("uni_projects", projects);
        universityMockService.addActivity(`Project "${project.title}" (${projectId}) stage set to Awaiting Government Verification.`);
      }

      try {
        notificationService.createNotification({
          userId: "admin-1",
          role: "ADMIN",
          type: "IMPACT_ASSESSMENT_SUBMITTED",
          priority: "HIGH",
          title: "Impact Assessment Awaiting Verification",
          message: `Impact assessment submitted for project "${project.title}" (${projectId}) and requires final verification.`,
          entityType: "IMPACT_ASSESSMENT",
          entityId: projectId,
          actionUrl: `/admin/projects/${projectId}`,
          isActionRequired: true,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      universityMockService.addActivity(`Impact assessment draft saved for project "${project.title}" (${projectId}).`);
    }

    return updatedAssessment;
  },

  requestImpactRevision(projectId: string, note: string, userRole = "ADMIN"): ImpactAssessment {
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can request revisions for impact assessments.");
    }

    const assessments = this.getAssessments();
    const idx = assessments.findIndex((a) => a.projectId === projectId);
    if (idx === -1) {
      throw new Error("Impact assessment not found.");
    }

    const today = new Date().toISOString().split("T")[0];
    assessments[idx].status = "REVISION_REQUIRED";
    assessments[idx].adminFeedbackNote = note.trim();
    assessments[idx].updatedAt = today;

    setStoredData("pb_impact_assessments", assessments);

    // Call universityMockService to update project stage
    universityMockService.requestVerificationEvidence(projectId, note, "ADMIN");
    universityMockService.addActivity(`Admin requested revision for impact assessment of "${projectId}": ${note.trim()}`);

    try {
      notificationService.createNotification({
        userId: "univ-1",
        role: "UNIVERSITY",
        type: "IMPACT_REVISION_REQUIRED",
        priority: "HIGH",
        title: "Impact Assessment Revision Requested",
        message: `Admin requested revision for project ${projectId}: "${note.trim()}"`,
        entityType: "IMPACT_ASSESSMENT",
        entityId: projectId,
        actionUrl: `/university/projects/${projectId}`,
        isActionRequired: true,
      });
    } catch (e) {
      console.error(e);
    }

    return assessments[idx];
  },

  verifyImpactAssessment(projectId: string, note?: string, userRole = "ADMIN"): ImpactAssessment {
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only platform administrators can verify impact assessments and complete projects.");
    }

    const assessments = this.getAssessments();
    const idx = assessments.findIndex((a) => a.projectId === projectId);
    if (idx === -1) {
      throw new Error("Impact assessment not found.");
    }

    const today = new Date().toISOString().split("T")[0];
    assessments[idx].status = "VERIFIED";
    assessments[idx].verifiedAt = today;
    if (note) {
      assessments[idx].adminFeedbackNote = note.trim();
    }
    assessments[idx].updatedAt = today;

    setStoredData("pb_impact_assessments", assessments);

    // Call universityMockService to verify project completion
    universityMockService.verifyProjectCompletion(projectId, note, "ADMIN");
    universityMockService.addActivity(`Admin verified impact assessment and completed project "${projectId}".`);

    try {
      notificationService.createNotification({
        userId: "univ-1",
        role: "UNIVERSITY",
        type: "PROJECT_COMPLETED",
        priority: "HIGH",
        title: "Project Verified & Completed",
        message: `Project ${projectId} has been formally verified and completed by Platform Administration.`,
        entityType: "PROJECT",
        entityId: projectId,
        actionUrl: `/university/projects/${projectId}`,
        isActionRequired: false,
      });

      notificationService.createNotification({
        userId: "ind-1",
        role: "INDUSTRY",
        type: "PROJECT_COMPLETED",
        priority: "MEDIUM",
        title: "Sponsored Project Completed & Verified",
        message: `Project ${projectId} supported by your CSR initiative has achieved 100% completion and government verification.`,
        entityType: "PROJECT",
        entityId: projectId,
        actionUrl: `/industry/projects/${projectId}`,
        isActionRequired: false,
      });
    } catch (e) {
      console.error(e);
    }

    return assessments[idx];
  },

  getAdminImpactMetrics() {
    const assessments = this.getAssessments();
    const pendingCount = assessments.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length;
    const revisionCount = assessments.filter((a) => a.status === "REVISION_REQUIRED").length;
    const verifiedCount = assessments.filter((a) => a.status === "VERIFIED").length;

    return { pendingCount, revisionCount, verifiedCount, totalCount: assessments.length };
  }
};
