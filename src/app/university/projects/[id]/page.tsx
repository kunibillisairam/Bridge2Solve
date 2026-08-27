"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Briefcase,
  FileText,
  Building,
  Download,
  Activity,
  Award,
  BookOpen,
  Check,
  ExternalLink,
  Sparkles,
  TrendingUp,
  FileCheck,
  Save
} from "lucide-react";
import { 
  universityMockService, 
  ResolvedProject,
  LIFECYCLE_STAGES,
  STAGE_CONFIG,
  getDaysRemainingText,
  ProjectStage
} from "@/services/universityMockService";
import { 
  impactService, 
  ImpactAssessment, 
  BeforeAfterComparison 
} from "@/services/impactService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES = {
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-250",
  ACTIVE: "bg-blue-50 text-blue-700 border-blue-150",
  COMPLETED: "bg-success-light text-success border-success/15",
  PENDING_ACTION: "bg-red-50 text-red-700 border-red-200",
};

const AGREEMENT_STATUS_BADGES = {
  Draft: "bg-brandgray-light text-brandgray-muted border-brandgray-border",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-250",
  Active: "bg-success-light text-success border-success/15",
  Expired: "bg-red-50 text-red-700 border-red-200",
  Completed: "bg-blue-50 text-blue-700 border-blue-150",
};

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [loading, setLoading] = useState(true);

  // Impact Assessment State
  const [impact, setImpact] = useState<ImpactAssessment | null>(null);
  const [isEditingImpact, setIsEditingImpact] = useState(false);
  const [summary, setSummary] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<number>(0);
  const [locations, setLocations] = useState("");
  const [problemImprovement, setProblemImprovement] = useState("");
  const [keyOutcomesText, setKeyOutcomesText] = useState("");
  const [challenges, setChallenges] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");

  const [impactSuccessMsg, setImpactSuccessMsg] = useState("");
  const [impactErrorMsg, setImpactErrorMsg] = useState("");

  useEffect(() => {
    if (id) {
      loadProjectData(id);
    }
  }, [id]);

  const loadProjectData = (projectId: string) => {
    const raw = universityMockService.getProjectById(projectId);
    if (raw) {
      const resolved = universityMockService.resolveProject(raw);
      if (resolved) {
        setProject(resolved);
      }
    }
    const imp = impactService.getImpactAssessmentForProject(projectId);
    if (imp) {
      setImpact(imp);
      setSummary(imp.summary || "");
      setBeneficiaries(imp.beneficiariesReached || 0);
      setLocations(imp.locationsCovered || "");
      setProblemImprovement(imp.problemImprovement || "");
      setKeyOutcomesText((imp.keyOutcomes || []).join("\n"));
      setChallenges(imp.challenges || "");
      setLessonsLearned(imp.lessonsLearned || "");
    }
    setLoading(false);
  };

  const handleSaveImpact = (isSubmit: boolean) => {
    if (!id) return;
    setImpactErrorMsg("");
    setImpactSuccessMsg("");

    if (isSubmit && (!summary.trim() || beneficiaries <= 0 || !problemImprovement.trim())) {
      setImpactErrorMsg("Please fill in the project outcome summary, beneficiaries reached, and measurable problem improvement before submitting.");
      return;
    }

    try {
      const outcomesList = keyOutcomesText.split("\n").filter((line) => line.trim() !== "");
      const updated = impactService.saveImpactAssessment(
        id,
        {
          summary,
          beneficiariesReached: Number(beneficiaries) || 0,
          locationsCovered: locations,
          problemImprovement,
          keyOutcomes: outcomesList,
          challenges,
          lessonsLearned,
          submittedBy: project?.assignedTeam ? `${project.assignedTeam.facultyMentor} (${project.assignedTeam.name})` : "University Research Team",
        },
        isSubmit,
        "UNIVERSITY"
      );

      setImpact(updated);
      setIsEditingImpact(false);

      if (isSubmit) {
        setImpactSuccessMsg("Impact assessment submitted successfully! The project has transitioned to Awaiting Verification.");
      } else {
        setImpactSuccessMsg("Impact assessment draft saved successfully.");
      }

      loadProjectData(id);
    } catch (err: any) {
      setImpactErrorMsg(err.message || "Failed to save impact assessment.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-brandgray-muted space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-xs font-semibold">Loading project data...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-primary">Project Not Found</h2>
        <p className="text-xs text-brandgray-muted">The requested project ID does not exist or has been removed.</p>
        <Link href="/university/projects">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Projects Overview
          </Button>
        </Link>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIG[project.stage];
  const currentMilestone = project.milestones.find(m => m.status === "Current") || project.milestones[project.milestones.length - 1];
  const deadlineInfo = getDaysRemainingText(currentMilestone?.dueDate);

  // Check if impact assessment is enabled (stage >= IMPLEMENTATION)
  const isImpactEnabled = ["IMPLEMENTATION", "IMPACT_ASSESSMENT", "AWAITING_ADMIN_VERIFICATION", "COMPLETED"].includes(project.stage);

  return (
    <div className="space-y-6">
      
      {/* Back Link */}
      <div>
        <Link 
          href="/university/projects" 
          className="inline-flex items-center gap-1.5 text-xs text-brandgray-muted hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects Overview</span>
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                {project.id}
              </span>
              <span className="text-xs font-bold text-brandgray-muted uppercase tracking-wider">
                {project.originalProblem.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary leading-tight">{project.title}</h1>
            <p className="text-xs text-brandgray-muted flex items-center gap-1.5 pt-1">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{project.originalProblem.district}, {project.originalProblem.state}</span>
              <span className="mx-1">·</span>
              <span>Started {project.startDate}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`inline-block text-xs font-bold px-3 py-1 border rounded uppercase ${STATUS_BADGES[project.status as keyof typeof STATUS_BADGES] || "bg-slate-100 text-slate-700"}`}>
              {project.status.replace("_", " ")}
            </span>
            <span className="text-xs text-brandgray-muted font-medium">
              Stage: <strong className="text-primary">{stageConfig?.label || project.stage}</strong>
            </span>
          </div>
        </div>

        {/* Action Required Banner for Overdue items */}
        {deadlineInfo && deadlineInfo.isOverdue && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span><strong>Overdue Milestone:</strong> {currentMilestone?.name} ({deadlineInfo.text})</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline / Stage Stepper */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Lifecycle Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-primary">Current Progress: {stageConfig?.label}</span>
                  <span className="text-primary">{project.progress}%</span>
                </div>
                <div className="w-full bg-brandgray-light/60 h-2.5 rounded-full overflow-hidden border border-brandgray-border/40">
                  <div 
                    className="bg-primary h-full transition-all duration-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Horizontal Stepper */}
              <div className="grid grid-cols-5 gap-1 pt-2">
                {LIFECYCLE_STAGES.slice(4).map((stg, idx) => {
                  const cfg = STAGE_CONFIG[stg];
                  const currentIdx = LIFECYCLE_STAGES.indexOf(project.stage);
                  const thisIdx = LIFECYCLE_STAGES.indexOf(stg);
                  const isDone = currentIdx >= thisIdx;
                  const isCurrent = project.stage === stg;

                  return (
                    <div key={stg} className="text-center space-y-1">
                      <div className={`h-6 w-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? "bg-amber-500 text-white ring-2 ring-amber-300"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}>
                        {isDone ? "✓" : idx + 5}
                      </div>
                      <span className={`text-[10px] block leading-tight font-medium ${isCurrent ? "text-primary font-bold" : "text-brandgray-muted"}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* IMPACT ASSESSMENT SECTION (Core Goal) */}
          <Card className="border-indigo-200 shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-indigo-100 bg-indigo-50/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-700" /> Impact Assessment & Outcome Tracking
              </CardTitle>
              {impact && (
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase ${
                  impact.status === "VERIFIED"
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : impact.status === "REVISION_REQUIRED"
                    ? "bg-red-100 text-red-900 border-red-300"
                    : impact.status === "SUBMITTED"
                    ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                }`}>
                  Status: {impact.status.replace("_", " ")}
                </span>
              )}
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              
              {impactSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold">
                  {impactSuccessMsg}
                </div>
              )}

              {impactErrorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded font-semibold">
                  {impactErrorMsg}
                </div>
              )}

              {/* Revision Required Feedback Banner */}
              {impact?.status === "REVISION_REQUIRED" && impact.adminFeedbackNote && (
                <div className="p-4 bg-red-50 border border-red-300 rounded space-y-1 text-red-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Revision Requested by Platform Administration</span>
                  </div>
                  <p className="text-xs italic pl-5 bg-white/70 p-2 rounded border border-red-200">
                    &quot;{impact.adminFeedbackNote}&quot;
                  </p>
                </div>
              )}

              {/* Verified Outcome Card */}
              {impact?.status === "VERIFIED" && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded space-y-3">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                    <span className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-emerald-700" /> Verified Project Outcome
                    </span>
                    <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
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
                    <span className="text-[10px] font-bold text-emerald-900 uppercase block">Measurable Problem Improvement</span>
                    <p className="text-xs text-emerald-950 bg-white p-2.5 rounded border border-emerald-150 font-medium leading-relaxed">
                      {impact.problemImprovement}
                    </p>
                  </div>
                </div>
              )}

              {/* Early Stage Disabled Notice */}
              {!isImpactEnabled ? (
                <div className="p-4 bg-slate-50 text-slate-700 border border-slate-200 rounded text-center space-y-1">
                  <Clock className="h-5 w-5 mx-auto text-slate-400" />
                  <p className="font-semibold text-xs">Impact assessment will become available after implementation milestones are completed.</p>
                </div>
              ) : !isEditingImpact && impact ? (
                /* Existing Assessment Display with Edit Option */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-150">
                    <div>
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Beneficiaries Reached</span>
                      <span className="font-bold text-primary text-sm">{impact.beneficiariesReached.toLocaleString('en-IN')} people</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Locations Covered</span>
                      <span className="font-bold text-primary">{impact.locationsCovered}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Outcome Summary</span>
                    <p className="text-xs text-brandgray-text bg-white p-3 rounded border border-brandgray-border leading-relaxed">
                      {impact.summary}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Measurable Improvement</span>
                    <p className="text-xs text-brandgray-text bg-white p-3 rounded border border-brandgray-border leading-relaxed font-medium">
                      {impact.problemImprovement}
                    </p>
                  </div>

                  {impact.keyOutcomes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Key Outcomes</span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-brandgray-text bg-white p-3 rounded border border-brandgray-border font-medium">
                        {impact.keyOutcomes.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {impact.status !== "VERIFIED" && impact.status !== "SUBMITTED" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-bold border-indigo-200 text-indigo-900 hover:bg-indigo-50"
                      onClick={() => setIsEditingImpact(true)}
                    >
                      Edit Impact Assessment Form
                    </Button>
                  )}
                </div>
              ) : (
                /* Editable Form */
                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-primary uppercase block">
                      What was implemented? (Project Outcome Summary) *
                    </label>
                    <textarea
                      className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                      rows={3}
                      placeholder="Describe prototype, technology, or intervention deployed..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-primary uppercase block">
                        Beneficiaries Reached (Number) *
                      </label>
                      <input
                        type="number"
                        className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                        placeholder="e.g. 4500"
                        value={beneficiaries}
                        onChange={(e) => setBeneficiaries(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-primary uppercase block">
                        Locations Covered *
                      </label>
                      <input
                        type="text"
                        className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                        placeholder="e.g. 3 Villages in Ranchi Rural Block"
                        value={locations}
                        onChange={(e) => setLocations(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-primary uppercase block">
                      Measurable Problem Improvement *
                    </label>
                    <textarea
                      className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                      rows={2}
                      placeholder="What measurable improvement occurred in the community problem?"
                      value={problemImprovement}
                      onChange={(e) => setProblemImprovement(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-primary uppercase block">
                      Key Outcomes (One per line)
                    </label>
                    <textarea
                      className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                      rows={3}
                      placeholder="e.g. 38% reduction in dropouts&#10;150 tablets deployed"
                      value={keyOutcomesText}
                      onChange={(e) => setKeyOutcomesText(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-primary uppercase block">
                        Challenges Encountered
                      </label>
                      <textarea
                        className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                        rows={2}
                        placeholder="Key field or technical obstacles..."
                        value={challenges}
                        onChange={(e) => setChallenges(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-primary uppercase block">
                        Lessons Learned
                      </label>
                      <textarea
                        className="w-full text-xs p-2.5 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                        rows={2}
                        placeholder="Key insights for future scaling..."
                        value={lessonsLearned}
                        onChange={(e) => setLessonsLearned(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-brandgray-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-bold"
                      onClick={() => handleSaveImpact(false)}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Save Draft
                    </Button>

                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="text-xs font-bold bg-indigo-700 hover:bg-indigo-800"
                      onClick={() => handleSaveImpact(true)}
                    >
                      <FileCheck className="h-3.5 w-3.5 mr-1" /> Submit Impact Assessment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Original Problem Subsection */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Original Community Problem Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-brandgray-text">{project.originalProblem.title}</h4>
                <p className="text-xs text-brandgray-muted leading-relaxed">
                  {project.originalProblem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-brandgray-border/40 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Reporter</span>
                  <span className="font-medium text-brandgray-text">{project.originalProblem.reporter}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Affected Population</span>
                  <span className="font-medium text-brandgray-text">{project.originalProblem.affectedPopulation}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Reported Severity</span>
                  <span className="font-bold text-red-600">{project.originalProblem.severity}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Research Team Card */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Assigned Research Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {project.assignedTeam ? (
                <>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Team Name</span>
                    <span className="font-bold text-primary">{project.assignedTeam.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Faculty Mentor</span>
                    <span className="font-semibold text-brandgray-text">{project.assignedTeam.facultyMentor}</span>
                  </div>
                </>
              ) : (
                <p className="text-brandgray-muted">No team assigned yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Industry Partner Display */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Industry CSR Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">CSR Partner</span>
                <span className="font-bold text-primary">{project.collaboration.industryPartner}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Funding Commitment</span>
                <span className="font-bold text-emerald-700">{project.collaboration.funding}</span>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
