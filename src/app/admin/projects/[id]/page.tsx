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
  FileCheck
} from "lucide-react";
import { 
  universityMockService, 
  ResolvedProject, 
  STAGE_CONFIG,
  LIFECYCLE_STAGES,
  getDaysRemainingText
} from "@/services/universityMockService";
import { industryService, IndustrySupportRequest } from "@/services/industryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [industryPartners, setIndustryPartners] = useState<IndustrySupportRequest[]>([]);
  
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
      }
    }
  };

  const handleVerifyAndComplete = () => {
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      universityMockService.verifyProjectCompletion(projectId, verificationNote, "ADMIN");
      setActionSuccess("Project completion successfully verified and signed off by Platform Administration!");
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
      setActionError("Please provide a note specifying the additional evidence required.");
      return;
    }
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      universityMockService.requestVerificationEvidence(projectId, verificationNote, "ADMIN");
      setActionSuccess("Requested additional verification evidence. Project stage returned to Impact Assessment.");
      setIsModalOpen(false);
      setVerificationNote("");
      loadProjectDetails();
    } catch (err: any) {
      setActionError(err.message || "Failed to request evidence.");
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
  const isAwaitingVerification = project.stage === "AWAITING_ADMIN_VERIFICATION";
  const isCompleted = project.stage === "COMPLETED";

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

      {/* GOVERNMENT VERIFICATION CONTROL PANEL (High Importance) */}
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
              The research team and university have submitted final impact evidence and requested project completion. As the central platform administration, review the outcomes and grant final verification.
            </p>

            {project.completionVerificationNote && (
              <div className="p-3 bg-white border border-amber-200 rounded text-xs space-y-1">
                <span className="font-bold text-amber-900 uppercase text-[10px] block">Submitted Evidence Note</span>
                <p className="text-brandgray-text italic">&quot;{project.completionVerificationNote}&quot;</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button 
                variant="primary" 
                size="sm" 
                className="h-9 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5"
                onClick={() => { setModalMode("complete"); setIsModalOpen(true); }}
              >
                <Check className="h-4 w-4" /> Verify & Grant Completion Sign-Off
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs font-bold border-amber-300 text-amber-950 hover:bg-amber-100"
                onClick={() => { setModalMode("request_evidence"); setIsModalOpen(true); }}
              >
                Request Additional Evidence / Revision
              </Button>
            </div>
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

          {/* PROJECT MILESTONES TRACKER */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" /> Implementation Milestones Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="space-y-2.5">
                {project.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded border bg-slate-50/70 border-slate-150">
                    <div className="space-y-0.5">
                      <span className="font-bold text-primary block">{m.name}</span>
                      <p className="text-[11px] text-brandgray-muted">{m.description}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase shrink-0 ${
                      m.status === "Completed"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : m.status === "Current"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
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

          {/* PROJECT METADATA */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Project Schedule & Status
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
                <span className="text-brandgray-muted">Allocated Funding</span>
                <span className="font-bold text-emerald-700">{project.collaboration.funding}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Agreement Status</span>
                <span className="font-semibold text-primary">{project.collaboration.agreementStatus}</span>
              </div>
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
                {modalMode === "complete" ? "Verify & Complete Project" : "Request Additional Evidence"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-brandgray-muted hover:text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-brandgray-text leading-relaxed">
              {modalMode === "complete"
                ? `Confirm that all outcomes, impact metrics, and deliverables for project ${project.id} have been verified.`
                : "Specify the additional impact metrics or evidence documents required before completion can be granted."}
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
                  Verify & Complete
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="bg-amber-700 hover:bg-amber-800 text-xs font-bold"
                  onClick={handleRequestEvidence}
                  disabled={isSubmitting}
                >
                  Submit Evidence Request
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
