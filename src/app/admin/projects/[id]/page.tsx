"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Copy, 
  ArrowLeft,
  FileText,
  Layers,
  GraduationCap,
  Building2,
  Check,
  AlertCircle,
  Award,
  Clock,
  FolderKanban,
  FileCheck,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { 
  universityMockService, 
  ResolvedProject, 
  STAGE_CONFIG,
  LIFECYCLE_STAGES,
  getDaysRemainingText
} from "@/services/universityMockService";
import { industryService, IndustrySupportRequest } from "@/services/industryService";
import { 
  impactService, 
  ImpactAssessment 
} from "@/services/impactService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [industryPartners, setIndustryPartners] = useState<IndustrySupportRequest[]>([]);
  const [impact, setImpact] = useState<ImpactAssessment | null>(null);
  const [industryRecs, setIndustryRecs] = useState<any[]>([]);
  const [expandedIndRecId, setExpandedIndRecId] = useState<string | null>(null);
  const [viewingIndustry, setViewingIndustry] = useState<any | null>(null);
  
  // Verification Modal & Action State
  const [verificationNote, setVerificationNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"complete" | "request_evidence">("complete");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  const loadProjectDetails = () => {
    const raw = universityMockService.getProjectById(projectId);
    if (raw) {
      const res = universityMockService.resolveProject(raw);
      if (res) {
        setProject(res);
        const accepted = industryService.getAcceptedSupportRequestsForProject(res.id);
        setIndustryPartners(accepted);

        const recs = industryService.getIndustryRecommendationsForProject(res.id);
        setIndustryRecs(recs);
      }
    }
    const imp = impactService.getImpactAssessmentForProject(projectId);
    if (imp) {
      setImpact(imp);
    }
  };

  const handleVerifyAndComplete = () => {
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      impactService.verifyImpactAssessment(projectId, verificationNote, "ADMIN");
      setActionSuccess("Impact assessment verified and project completion signed off successfully!");
      setIsModalOpen(false);
      setVerificationNote("");
      loadProjectDetails();
    } catch (err: any) {
      setActionError(err.message || "Failed to verify project completion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestEvidence = () => {
    if (!verificationNote.trim()) {
      setActionError("Please provide a note specifying the required revisions or evidence.");
      return;
    }
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      impactService.requestImpactRevision(projectId, verificationNote, "ADMIN");
      setActionSuccess("Requested impact assessment revision. Project returned to Impact Assessment stage.");
      setIsModalOpen(false);
      setVerificationNote("");
      loadProjectDetails();
    } catch (err: any) {
      setActionError(err.message || "Failed to request revision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm font-semibold text-primary">Project Not Found</p>
        <p className="text-xs text-brandgray-muted">The requested project ID does not exist.</p>
        <Link href="/admin/projects">
          <Button variant="outline" size="sm">Back to Projects Control</Button>
        </Link>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIG[project.stage];
  const isAwaitingVerification = project.stage === "AWAITING_ADMIN_VERIFICATION" || impact?.status === "SUBMITTED";
  const isCompleted = project.stage === "COMPLETED" || impact?.status === "VERIFIED";

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/projects" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects Control & Monitoring
        </Link>
        <span className="text-xs text-brandgray-muted">Project ID: <span className="font-mono font-bold text-primary">{project.id}</span></span>
      </div>

      {/* Main Banner */}
      <div className={`bg-white border rounded-lg p-6 shadow-subtle space-y-4 ${
        isAwaitingVerification ? "border-amber-300 ring-2 ring-amber-200" : "border-brandgray-border"
      }`}>
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
            <span className={`text-xs font-bold px-3 py-1 rounded border uppercase ${
              isAwaitingVerification
                ? "bg-amber-100 text-amber-950 border-amber-300 font-extrabold"
                : isCompleted
                ? "bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}>
              {stageConfig?.label || project.stage} ({project.progress}%)
            </span>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
            {actionSuccess}
          </div>
        )}

        {actionError && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
            {actionError}
          </div>
        )}
      </div>

      {/* GOVERNMENT VERIFICATION CONTROL PANEL */}
      {isAwaitingVerification && (
        <Card className="border-amber-400 bg-amber-50/70 shadow-subtle">
          <CardHeader className="p-5 border-b border-amber-300/80 bg-amber-100/60 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-700" /> Government Completion Verification Needed
            </CardTitle>
            <span className="text-xs font-extrabold bg-amber-200 text-amber-950 border border-amber-400 px-3 py-0.5 rounded">
              FINAL SIGN-OFF REQUIRED
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <p className="text-amber-950 leading-relaxed font-medium">
              An impact assessment has been submitted for this project. Review the outcome summary, beneficiary numbers, before/after metrics, and field evidence before granting final verification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button 
                variant="primary" 
                size="sm" 
                className="h-9 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5"
                onClick={() => { setModalMode("complete"); setIsModalOpen(true); }}
              >
                <Check className="h-4 w-4" /> Verify Impact & Complete Project
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs font-bold border-amber-300 text-amber-950 hover:bg-amber-100"
                onClick={() => { setModalMode("request_evidence"); setIsModalOpen(true); }}
              >
                Request Revision / Additional Evidence
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* IMPACT ASSESSMENT DETAILED REVIEW SECTION */}
      {impact && (
        <Card className="border-indigo-200 shadow-subtle bg-white">
          <CardHeader className="p-5 border-b border-indigo-100 bg-indigo-50/40 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-700" /> Impact Assessment Review
            </CardTitle>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase ${
              impact.status === "VERIFIED"
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : impact.status === "REVISION_REQUIRED"
                ? "bg-red-100 text-red-900 border-red-300"
                : "bg-indigo-100 text-indigo-900 border-indigo-300"
            }`}>
              Status: {impact.status.replace("_", " ")}
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/40 p-3 rounded border border-indigo-100">
              <div>
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Submitted By</span>
                <span className="font-bold text-indigo-950">{impact.submittedBy}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Beneficiaries Reached</span>
                <span className="font-extrabold text-emerald-700 text-sm">{impact.beneficiariesReached.toLocaleString('en-IN')} people</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Locations Covered</span>
                <span className="font-bold text-indigo-950">{impact.locationsCovered}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Submitted Date</span>
                <span className="font-medium text-brandgray-text">{impact.submittedAt || impact.createdAt}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Project Outcome Summary</span>
              <p className="text-xs text-brandgray-text bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed font-medium">
                {impact.summary}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Measurable Problem Improvement</span>
              <p className="text-xs text-brandgray-text bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed font-medium">
                {impact.problemImprovement}
              </p>
            </div>

            {/* Before / After Comparison Table */}
            {impact.beforeAfterComparisons && impact.beforeAfterComparisons.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Before vs. After Implementation Comparison</span>
                <div className="overflow-x-auto border border-brandgray-border rounded">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-brandgray-border font-bold text-primary uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Metric</th>
                        <th className="p-2.5">Before Implementation</th>
                        <th className="p-2.5">After Implementation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white">
                      {impact.beforeAfterComparisons.map((c, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-bold text-primary">{c.metricName}</td>
                          <td className="p-2.5 text-red-700 font-semibold">{c.beforeValue}</td>
                          <td className="p-2.5 text-emerald-800 font-bold">{c.afterValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Flexible Impact Metrics */}
            {impact.impactMetrics && impact.impactMetrics.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Impact Metrics</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {impact.impactMetrics.map((m) => (
                    <div key={m.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded space-y-1">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase block">{m.name}</span>
                      <span className="text-lg font-extrabold text-emerald-950 block">{m.value.toLocaleString('en-IN')} {m.unit}</span>
                      {m.description && <p className="text-[10px] text-emerald-800">{m.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Outcomes */}
            {impact.keyOutcomes && impact.keyOutcomes.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Key Outcomes Achieved</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-brandgray-text bg-white p-3 rounded border border-brandgray-border font-medium">
                  {impact.keyOutcomes.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges & Lessons Learned */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {impact.challenges && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Challenges Encountered</span>
                  <p className="text-xs text-brandgray-text bg-white p-2.5 rounded border border-brandgray-border leading-relaxed">
                    {impact.challenges}
                  </p>
                </div>
              )}
              {impact.lessonsLearned && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Lessons Learned</span>
                  <p className="text-xs text-brandgray-text bg-white p-2.5 rounded border border-brandgray-border leading-relaxed">
                    {impact.lessonsLearned}
                  </p>
                </div>
              )}
            </div>

            {/* Evidence Documents */}
            {impact.evidenceDocuments && impact.evidenceDocuments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brandgray-border/60">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Verified Impact Evidence Documents</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {impact.evidenceDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 border border-brandgray-border rounded bg-slate-50 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-brandgray-muted shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-primary block truncate">{doc.name}</span>
                          <span className="text-[9.5px] text-brandgray-muted block">{doc.type} · {doc.size} · Uploaded {doc.uploadedDate}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Initiating secure download for impact evidence: ${doc.name}`)}
                        className="text-xs font-bold text-primary hover:underline shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* Main Grid: Details, Team, CSR, Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Problem, Team, CSR, Milestones */}
        <div className="lg:col-span-2 space-y-6">

          {/* ORIGINAL COMMUNITY PROBLEM */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Target Citizen Problem Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-150">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Problem Title</span>
                  <span className="font-bold text-primary">{project.originalProblem.title}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Location</span>
                  <span className="font-bold text-primary">{project.originalProblem.district}, {project.originalProblem.state}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Affected Population</span>
                  <span className="font-bold text-primary">{project.originalProblem.affectedPopulation}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Full Problem Statement</span>
                <p className="text-xs text-brandgray-text leading-relaxed bg-white p-3 rounded border border-brandgray-border">
                  {project.originalProblem.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* UNIVERSITY & RESEARCH TEAM */}
          <Card className="border-purple-200 shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-purple-100 bg-purple-50/40">
              <CardTitle className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-purple-700" /> University & Assigned Research Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/40 p-3 rounded border border-purple-100">
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase block">University Partner</span>
                  <span className="font-bold text-purple-950">{project.collaboration.university}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-900 uppercase block">Faculty Mentor / Coordinator</span>
                  <span className="font-bold text-purple-950">{project.facultyMentor}</span>
                </div>
              </div>

              {project.assignedTeam ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">{project.assignedTeam.name}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      ACTIVE TEAM
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Student Researchers</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.assignedTeam.members.map((m, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-medium">
                          {m.name} ({m.degree})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-brandgray-muted">No team assigned yet.</p>
              )}
            </CardContent>
          </Card>

          {/* INDUSTRY / CSR PARTNERSHIP DETAILS */}
          <Card className="border-indigo-200 shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-indigo-100 bg-indigo-50/40">
              <CardTitle className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-700" /> Industry & CSR Support Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              {industryPartners.length === 0 ? (
                <p className="text-brandgray-muted text-center py-3">No active CSR partners associated with this project yet.</p>
              ) : (
                <div className="space-y-3">
                  {industryPartners.map((partner) => (
                    <div key={partner.id} className="p-3 bg-indigo-50/40 border border-indigo-150 rounded space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-950">{partner.industryName}</span>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded">
                          {partner.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded border border-indigo-100">
                        <div>
                          <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block">Support Type</span>
                          <span className="font-semibold text-primary">{partner.supportType}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block">Estimated Funding</span>
                          <span className="font-bold text-emerald-700">{partner.estimatedFunding ? `₹${partner.estimatedFunding.toLocaleString('en-IN')}` : "In-Kind / Tech"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMART INDUSTRY / CSR RECOMMENDATIONS */}
          <Card className="border-indigo-200 shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-indigo-100 bg-indigo-50/40">
              <CardTitle className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" /> Smart Industry / CSR Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {industryRecs.length === 0 ? (
                <p className="text-brandgray-muted text-center py-3">No active Industry / CSR organization matches found.</p>
              ) : (
                <div className="space-y-4">
                  {industryRecs.map((rec, idx) => {
                    const isExpanded = expandedIndRecId === rec.industryId;
                    return (
                      <div key={rec.industryId} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary text-sm">{idx + 1}. {rec.industryName}</span>
                            </div>
                            <span className="text-[10px] text-brandgray-muted block font-medium">{rec.orgType}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-extrabold text-indigo-700 block">{rec.score}% Match</span>
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border block mt-0.5 ${
                              rec.matchLevel === "HIGH" 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                : rec.matchLevel === "MEDIUM" 
                                ? "bg-amber-50 text-amber-800 border-amber-200" 
                                : "bg-slate-50 text-slate-800 border-slate-200"
                            }`}>
                              {rec.matchLevel} MATCH
                            </span>
                          </div>
                        </div>

                        {/* Bulleted Reasons */}
                        <div className="space-y-1">
                          {rec.reasons.map((reason: string, rIdx: number) => (
                            <div key={rIdx} className="flex items-center gap-1.5 text-[10.5px] text-slate-700 font-medium">
                              <span className="text-emerald-600 font-extrabold">✓</span>
                              <span>{reason.replace("✓ ", "")}</span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-200/60 justify-between items-center text-[10.5px]">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] font-semibold text-slate-700 px-2.5"
                              onClick={() => {
                                const fullProfile = industryService.getProfile(rec.industryId);
                                setViewingIndustry(fullProfile || rec);
                              }}
                            >
                              View Organization
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] font-semibold text-slate-700 px-2.5"
                              onClick={() => setExpandedIndRecId(isExpanded ? null : rec.industryId)}
                            >
                              {isExpanded ? "Hide Breakdown" : "Score Breakdown"}
                            </Button>
                          </div>
                        </div>

                        {/* Score Breakdown Drawer */}
                        {isExpanded && (
                          <div className="bg-white border border-slate-200 rounded p-3 text-[10.5px] space-y-2 mt-2">
                            <span className="font-bold text-primary uppercase text-[9px] block border-b border-slate-200 pb-1">
                              Industry Matching Breakdown (Algorithm {rec.algorithmVersion})
                            </span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">CSR Focus Alignment:</span>
                                <span className="font-semibold">{rec.breakdown.csrFocusScore} / 25</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Support Type Match:</span>
                                <span className="font-semibold">{rec.breakdown.supportTypeScore} / 20</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Technical Expertise:</span>
                                <span className="font-semibold">{rec.breakdown.technicalExpertiseScore} / 20</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Organization Type:</span>
                                <span className="font-semibold">{rec.breakdown.organizationTypeScore} / 10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Project Domain Match:</span>
                                <span className="font-semibold">{rec.breakdown.projectDomainScore} / 10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Previous Experience:</span>
                                <span className="font-semibold">{rec.breakdown.previousExperienceScore} / 10</span>
                              </div>
                              <div className="flex justify-between col-span-2 border-t border-slate-100 pt-1">
                                <span className="text-brandgray-muted">Geographic Relevance:</span>
                                <span className="font-semibold">{rec.breakdown.locationScore} / 5</span>
                              </div>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-primary">
                              <span>Total Score:</span>
                              <span>{rec.score} / 100</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar: Timeline & Verification Actions */}
        <div className="space-y-6">

          {/* FULL 10-STAGE LIFECYCLE TIMELINE */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Full 10-Stage Lifecycle Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              {LIFECYCLE_STAGES.map((stg, idx) => {
                const config = STAGE_CONFIG[stg];
                const stageIndex = LIFECYCLE_STAGES.indexOf(project.stage);
                const isCurrent = project.stage === stg;
                const isDone = stageIndex > idx || (stageIndex === idx && project.stage === "COMPLETED");

                return (
                  <div key={stg} className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-amber-500 text-white font-extrabold ring-2 ring-amber-300 animate-pulse"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className={`font-semibold block truncate ${isCurrent ? "text-amber-950 font-bold" : isDone ? "text-primary" : "text-slate-400"}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* VERIFICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 border border-brandgray-border">
            <div className="flex justify-between items-center border-b border-brandgray-border pb-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                {modalMode === "complete" ? "Verify Impact & Complete Project" : "Request Impact Assessment Revision"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-brandgray-muted hover:text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-brandgray-text leading-relaxed">
              {modalMode === "complete"
                ? `Confirm that all outcomes, impact metrics, and evidence for project ${project.id} have been verified.`
                : "Specify the revision details or additional evidence required from the university team."}
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-brandgray-muted uppercase block">
                Verification Note / Feedback (Optional for Completion)
              </label>
              <textarea
                className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                rows={3}
                placeholder="Enter verification sign-off notes or required revision details..."
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-brandgray-border">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              {modalMode === "complete" ? (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="bg-emerald-700 hover:bg-emerald-800 text-xs font-bold"
                  onClick={handleVerifyAndComplete}
                  disabled={isSubmitting}
                >
                  Verify Impact & Complete
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="bg-amber-700 hover:bg-amber-800 text-xs font-bold"
                  onClick={handleRequestEvidence}
                  disabled={isSubmitting}
                >
                  Submit Revision Request
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Organization Profile Detail Modal */}
      {viewingIndustry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-primary text-sm uppercase">Industry Organization Profile</h3>
              <button onClick={() => setViewingIndustry(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Organization Name</span>
                <p className="font-extrabold text-sm text-primary">{viewingIndustry.name || viewingIndustry.industryName}</p>
                <p className="text-[11px] text-brandgray-muted font-medium">{viewingIndustry.orgType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                  <p className="font-bold text-slate-700">{viewingIndustry.location || `${viewingIndustry.district}, ${viewingIndustry.state}`}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Representative</span>
                  <p className="font-bold text-slate-700">{viewingIndustry.representativeName || "CSR Grant Manager"}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CSR Focus Areas</span>
                <div className="flex flex-wrap gap-1">
                  {(viewingIndustry.csrFocusAreas || viewingIndustry.matchedCSRFocus || ["Water & Sanitation", "Rural Infrastructure"]).map((fa: string, i: number) => (
                    <span key={i} className="bg-indigo-50 text-indigo-800 border border-indigo-200 rounded px-2 py-0.5 font-medium text-[10.5px]">
                      {fa}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Core Expertise & Capabilities</span>
                <div className="flex flex-wrap gap-1">
                  {(viewingIndustry.expertise || viewingIndustry.matchedExpertise || ["Groundwater infrastructure", "IoT"]).map((exp: string, i: number) => (
                    <span key={i} className="bg-slate-100 text-slate-800 border border-slate-200 rounded px-2 py-0.5 font-medium text-[10.5px]">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Available Resources</span>
                <div className="flex flex-wrap gap-1">
                  {(viewingIndustry.resources || viewingIndustry.matchedResources || ["CSR Funding", "Equipment / Resources"]).map((res: string, i: number) => (
                    <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded px-2 py-0.5 font-medium text-[10.5px]">
                      {res}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Previous Relevant Work</span>
                <div className="mt-1 space-y-1 pl-1 text-[11px] text-slate-700 font-medium">
                  {(viewingIndustry.previousProjects || viewingIndustry.previousExperience || []).length > 0 ? (
                    (viewingIndustry.previousProjects || viewingIndustry.previousExperience).map((proj: string, i: number) => (
                      <div key={i} className="flex items-center gap-1">✓ {proj}</div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No previous projects recorded.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-150 bg-slate-50 text-right">
              <Button variant="outline" size="sm" onClick={() => setViewingIndustry(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
