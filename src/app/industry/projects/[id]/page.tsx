"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Users, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Handshake, 
  DollarSign, 
  Clock, 
  FileText,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowLeft
} from "lucide-react";
import { 
  industryService, 
  SupportType, 
  SUPPORT_TYPE_LABELS, 
  IndustrySupportRequest,
  SUPPORT_STATUS_BADGES 
} from "@/services/industryService";
import { 
  ResolvedProject, 
  STAGE_CONFIG, 
  LIFECYCLE_STAGES, 
  ProjectStage 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { impactService } from "@/services/impactService";
import { useAuth } from "@/context/AuthContext";

export default function IndustryProjectDetailPage() {
  const { user } = useAuth();
  const industryId = user?.profile?.industryDetails?.id || "ind-1";

  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [existingRequests, setExistingRequests] = useState<IndustrySupportRequest[]>([]);
  const [industryMatch, setIndustryMatch] = useState<any | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [supportType, setSupportType] = useState<SupportType>("CSR_FUNDING");
  const [description, setDescription] = useState("");
  const [estimatedFunding, setEstimatedFunding] = useState("");
  const [resourcesOffered, setResourcesOffered] = useState("");
  const [expectedDuration, setExpectedDuration] = useState("");
  
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (industryId) {
      loadProjectDetails(industryId);
    }
  }, [projectId, industryId]);

  const loadProjectDetails = (indId: string) => {
    const p = industryService.getEligibleProjectById(projectId);
    if (p) {
      setProject(p);
      const reqs = industryService.getSupportRequestsForProject(projectId).filter((r) => r.industryId === indId);
      setExistingRequests(reqs);

      const match = industryService.getMatchForIndustryAndProject(projectId, indId);
      setIndustryMatch(match || null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-xs text-brandgray-muted font-medium">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center bg-white border border-brandgray-border rounded-md text-brandgray-muted text-sm space-y-3 max-w-md mx-auto my-12">
        <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
        <p className="font-bold text-primary">Project Not Found</p>
        <p className="text-xs">The requested project ID does not exist or has been removed from the platform registry.</p>
        <div className="pt-2">
          <Link href="/industry/projects">
            <Button variant="outline" size="sm">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    try {
      const created = industryService.submitSupportRequest(
        {
          projectId,
          supportType,
          description,
          estimatedFunding: estimatedFunding ? Number(estimatedFunding) : undefined,
          resourcesOffered: resourcesOffered || undefined,
          expectedDuration: expectedDuration || undefined,
        },
        industryId
      );

      setSubmitSuccess(`✓ Support request submitted successfully!\nRequest ID: ${created.id}\nStatus: PENDING`);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess("");
        setDescription("");
        setEstimatedFunding("");
        setResourcesOffered("");
        setExpectedDuration("");
        loadProjectDetails(industryId);
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit interest request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm font-semibold text-primary">Project Not Found</p>
        <p className="text-xs text-brandgray-muted">The requested project ID does not exist or is not eligible for industry participation.</p>
        <Link href="/industry/projects">
          <Button variant="outline" size="sm">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIG[project.stage];
  const profile = industryService.getProfile(industryId);

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/industry/projects" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Project Discovery
        </Link>
        <span className="text-xs text-brandgray-muted">Project ID: <span className="font-bold text-primary">{project.id}</span></span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded">
                {project.id}
              </span>
              <span className="text-xs font-bold text-brandgray-muted uppercase tracking-wider">
                {project.originalProblem.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary">{project.title}</h1>
            <p className="text-xs text-brandgray-muted flex items-center gap-2 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {project.originalProblem.district}, {project.originalProblem.state} · University: <span className="font-bold text-primary">{project.collaboration.university}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-3 py-1 rounded font-bold">
              Stage: {stageConfig?.label || project.stage} ({project.progress}%)
            </span>
            <Button 
              variant="primary" 
              size="sm" 
              className="h-9 px-4 text-xs font-bold flex items-center gap-1.5"
              onClick={() => setIsModalOpen(true)}
            >
              <Handshake className="h-4 w-4" /> Express Industry Interest
            </Button>
          </div>
        </div>

        {/* Existing Industry Support Requests Status Banner */}
        {existingRequests.length > 0 && (
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-lg space-y-2 text-xs">
            <span className="font-bold text-indigo-900 uppercase tracking-wider text-[10.5px] block">
              Your Organization&apos;s Active Support Requests ({existingRequests.length})
            </span>
            <div className="space-y-2">
              {existingRequests.map((req) => (
                <div key={req.id} className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded border border-indigo-150">
                  <div className="space-y-0.5">
                    <span className="font-bold text-primary">{SUPPORT_TYPE_LABELS[req.supportType]}</span>
                    <p className="text-brandgray-muted text-[11px] line-clamp-1">{req.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${SUPPORT_STATUS_BADGES[req.status]}`}>
                      Status: {req.status}
                    </span>
                    <span className="text-[10px] text-brandgray-muted">Submitted: {req.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WHY THIS PROJECT MATCHES YOUR ORGANIZATION */}
      {industryMatch && (
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-primary to-indigo-950 text-white rounded-lg shadow-subtle space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Smart CSR & Capacity Match Recommendation
              </span>
              <h3 className="text-lg font-bold text-white">Why This Project Matches Your Organization</h3>
              <p className="text-xs text-indigo-150 font-medium">
                Calculated based on your CSR focus areas, available resources, and technical capabilities.
              </p>
            </div>

            <div className="text-right bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1.5 rounded-lg shrink-0">
              <span className="text-xl font-black text-amber-300 block">{industryMatch.score}% MATCH</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-100 block">{industryMatch.matchLevel} SUITABILITY</span>
            </div>
          </div>

          {/* Bulleted Reasons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/5 border border-white/10 p-3 rounded-lg">
            {industryMatch.reasons.map((reason: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-indigo-100 font-medium text-[11px]">
                <span className="text-emerald-400 font-extrabold">✓</span>
                <span>{reason.replace("✓ ", "")}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2 pt-1 text-xs">
            <button 
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-amber-300 hover:text-amber-200 font-bold underline text-[11px]"
            >
              {showBreakdown ? "Hide Score Breakdown" : "View Score Breakdown Metrics"}
            </button>

            <Button 
              variant="primary" 
              size="sm" 
              className="h-8 px-4 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-indigo-950 border-none shadow-md flex items-center gap-1.5"
              onClick={() => setIsModalOpen(true)}
            >
              <Handshake className="h-4 w-4" /> Express Industry Interest
            </Button>
          </div>

          {/* Breakdown drawer */}
          {showBreakdown && (
            <div className="bg-white/10 border border-white/15 rounded p-3 text-[11px] space-y-2 text-indigo-100">
              <span className="font-bold text-amber-300 uppercase text-[9.5px] block border-b border-white/10 pb-1">
                Matching Factor Breakdown (Algorithm {industryMatch.algorithmVersion})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10.5px]">
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">CSR Focus:</span>
                  <span className="font-extrabold text-white">{industryMatch.breakdown.csrFocusScore} / 25</span>
                </div>
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">Support Type:</span>
                  <span className="font-extrabold text-white">{industryMatch.breakdown.supportTypeScore} / 20</span>
                </div>
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">Expertise:</span>
                  <span className="font-extrabold text-white">{industryMatch.breakdown.technicalExpertiseScore} / 20</span>
                </div>
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">Org Type:</span>
                  <span className="font-extrabold text-white">{industryMatch.breakdown.organizationTypeScore} / 10</span>
                </div>
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">Domain:</span>
                  <span className="font-extrabold text-white">{industryMatch.breakdown.projectDomainScore} / 10</span>
                </div>
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">Experience:</span>
                  <span className="font-extrabold text-white">{industryMatch.breakdown.previousExperienceScore} / 10</span>
                </div>
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">Location:</span>
                  <span className="font-extrabold text-white">{industryMatch.breakdown.locationScore} / 5</span>
                </div>
                <div>
                  <span className="text-indigo-200 block text-[9.5px]">Total Match:</span>
                  <span className="font-extrabold text-amber-300">{industryMatch.score} / 100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Problem, University/Team, Progress, Impact */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. COMMUNITY PROBLEM CONTEXT */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Community Problem Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-150">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Severity</span>
                  <span className="font-bold text-red-700">{project.originalProblem.severity}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Affected Population</span>
                  <span className="font-bold text-primary">{project.originalProblem.affectedPopulation}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Reported Date</span>
                  <span className="font-medium text-brandgray-text">{project.originalProblem.dateReported}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Validation</span>
                  <span className="font-bold text-emerald-700">✓ VERIFIED</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary">{project.originalProblem.title}</h4>
                <p className="text-xs text-brandgray-text leading-relaxed">
                  {project.originalProblem.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. UNIVERSITY & RESEARCH TEAM */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Academic & Research Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-primary">{project.collaboration.university}</h4>
                  <p className="text-xs text-brandgray-muted">Academic Institution Partner</p>
                </div>
              </div>

              {project.assignedTeam && (
                <div className="p-4 bg-primary-light/30 border border-primary/15 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Assigned Research Team</span>
                      <p className="text-sm font-bold text-primary">{project.assignedTeam.name}</p>
                    </div>
                    <span className="text-xs text-brandgray-muted font-medium">Mentor: <span className="font-bold text-primary">{project.assignedTeam.facultyMentor}</span></span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Domain Capabilities</span>
                    <div className="flex flex-wrap gap-1">
                      {project.assignedTeam.skills.map((skill, i) => (
                        <span key={i} className="text-[10.5px] bg-white border border-brandgray-border px-2 py-0.5 rounded font-medium text-brandgray-text">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VERIFIED PROJECT OUTCOME & IMPACT (FOR INDUSTRY) */}
              {(() => {
                const impact = impactService.getImpactAssessmentForProject(project.id);
                if (!impact || impact.status !== "VERIFIED") return null;

                return (
                  <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                      <span className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" /> Verified Project Outcome & Impact
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                        ✓ Admin Verified ({impact.verifiedAt})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded border border-emerald-150">
                      <div>
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Beneficiaries Reached</span>
                        <span className="font-extrabold text-emerald-950 text-sm">{impact.beneficiariesReached.toLocaleString('en-IN')} people</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Locations Covered</span>
                        <span className="font-bold text-emerald-950">{impact.locationsCovered}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase block">Measurable Community Improvement</span>
                      <p className="text-xs text-emerald-950 bg-white p-2.5 rounded border border-emerald-150 font-medium leading-relaxed">
                        {impact.problemImprovement}
                      </p>
                    </div>

                    {impact.keyOutcomes && impact.keyOutcomes.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase block">Key Outcomes Delivered</span>
                        <ul className="list-disc list-inside space-y-1 text-xs text-emerald-950 bg-white p-2.5 rounded border border-emerald-150 font-medium">
                          {impact.keyOutcomes.map((k, i) => (
                            <li key={i}>{k}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* 3. PROJECT LIFECYCLE PROGRESS */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Lifecycle Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                {LIFECYCLE_STAGES.map((st, idx) => {
                  const isCurrent = project.stage === st;
                  const currentIndex = LIFECYCLE_STAGES.indexOf(project.stage);
                  const isCompleted = idx < currentIndex;
                  const cfg = STAGE_CONFIG[st];

                  return (
                    <div key={st} className="flex items-center gap-3 text-xs">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        isCompleted 
                          ? "bg-emerald-600 text-white" 
                          : isCurrent 
                          ? "bg-primary text-white ring-2 ring-primary/20" 
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <div className="flex-1 flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className={`font-semibold ${isCurrent ? "text-primary font-bold" : isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                          {cfg.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-primary-light text-primary border border-primary/20 px-2 py-0.5 rounded font-bold">
                            CURRENT STAGE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar: Industry Support Needed & Details */}
        <div className="space-y-6">

          {/* Industry Support Needed Card */}
          <Card className="border-primary/30 shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60 bg-slate-50">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Support Opportunities Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                {[
                  { label: "CSR Funding", desc: "Financial sponsorship for materials and deployment" },
                  { label: "Technical Mentorship", desc: "Expert guidance on engineering & scalability" },
                  { label: "Equipment & Resources", desc: "Hardware, filtration units, solar PVs, IoT sensors" },
                  { label: "Deployment Support", desc: "Local logistics & site infrastructure assistance" },
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded text-xs space-y-0.5">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      ✓ {s.label}
                    </span>
                    <p className="text-[11px] text-brandgray-muted">{s.desc}</p>
                  </div>
                ))}
              </div>

              <Button 
                variant="primary" 
                className="w-full h-10 text-xs font-bold flex items-center justify-center gap-2"
                onClick={() => setIsModalOpen(true)}
              >
                <Handshake className="h-4 w-4" /> Express Industry Interest
              </Button>
            </CardContent>
          </Card>

          {/* Key Dates & Location Sidebar */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Project Schedule & Funding
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Start Date</span>
                <span className="font-semibold text-primary">{project.startDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Target Completion</span>
                <span className="font-semibold text-primary">{project.expectedCompletionDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Estimated Budget</span>
                <span className="font-bold text-emerald-800">{project.collaboration.funding}</span>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* EXPRESS INTEREST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-xl border border-brandgray-border">
            <div className="flex justify-between items-center border-b border-brandgray-border pb-3">
              <div>
                <h3 className="font-bold text-primary text-base">Express Industry Interest in Project</h3>
                <p className="text-xs text-brandgray-muted">Submit a CSR or technical participation request for {project.id}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-brandgray-muted hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold whitespace-pre-line">
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleInterestSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Organization Submitting Request</span>
                <p className="font-bold text-primary text-sm">{profile.name}</p>
                <p className="text-brandgray-muted">{profile.representativeName} · {profile.email}</p>
              </div>

              {/* Support Type Dropdown */}
              <div className="space-y-1">
                <label className="font-bold text-primary uppercase tracking-wider text-[11px] block">
                  Support Type *
                </label>
                <select
                  className="w-full text-xs border border-brandgray-border rounded p-2.5 bg-white focus:outline-none focus:border-primary font-medium"
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value as SupportType)}
                >
                  <option value="CSR_FUNDING">CSR Funding</option>
                  <option value="TECHNICAL_MENTORSHIP">Technical Mentorship</option>
                  <option value="EQUIPMENT_RESOURCES">Equipment / Resources</option>
                  <option value="INDUSTRY_EXPERTISE">Industry Expertise</option>
                  <option value="INFRASTRUCTURE_DEPLOYMENT">Infrastructure / Deployment Support</option>
                  <option value="OTHER">Other Partnership Support</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-primary uppercase tracking-wider text-[11px] block">
                  Support Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail how your organization intends to support this project..."
                  className="w-full text-xs border border-brandgray-border rounded p-2.5 focus:outline-none focus:border-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Optional Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-primary text-[11px] block">Estimated Funding Amount (₹ Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                    value={estimatedFunding}
                    onChange={(e) => setEstimatedFunding(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-primary text-[11px] block">Expected Duration (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 months"
                    className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                    value={expectedDuration}
                    onChange={(e) => setExpectedDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-primary text-[11px] block">Resources Offered (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Water filtration tanks, lab testing facilities"
                  className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                  value={resourcesOffered}
                  onChange={(e) => setResourcesOffered(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brandgray-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                  className="font-bold"
                  disabled={isSubmitting}
                >
                  Submit Support Interest
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
