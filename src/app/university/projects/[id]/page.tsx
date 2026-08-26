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
  ExternalLink
} from "lucide-react";
import { 
  universityMockService, 
  ResolvedProject,
  LIFECYCLE_STAGES,
  STAGE_CONFIG,
  getDaysRemainingText,
  ProjectStage
} from "@/services/universityMockService";
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

  useEffect(() => {
    if (id) {
      const raw = universityMockService.getProjectById(id);
      if (raw) {
        const resolved = universityMockService.resolveProject(raw);
        if (resolved) {
          setProject(resolved);
        }
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-brandgray-muted">Project not found.</p>
        <Link href="/university/projects">
          <Button variant="outline" size="sm">
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(project.stage);
  const stageConfig = STAGE_CONFIG[project.stage];

  return (
    <div className="space-y-6">
      
      {/* Back Link */}
      <div>
        <Link 
          href="/university/projects" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brandgray-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects List
        </Link>
      </div>

      {/* Project Details Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Title & Progress Block */}
        <div className="lg:col-span-2">
          <Card className="border-brandgray-border shadow-subtle bg-white h-full flex flex-col justify-between">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                    Project ID: {project.id}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_BADGES[project.status]}`}>
                    {project.status.replace(/_/g, " ")}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-primary">{project.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-brandgray-muted">
                  <div>
                    Research Team: <span className="font-semibold text-brandgray-text">{project.assignedTeam ? project.assignedTeam.name : "Formation Pending"}</span>
                  </div>
                  <div>
                    Faculty Mentor: <span className="font-semibold text-brandgray-text">{project.facultyMentor}</span>
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brandgray-muted font-medium">Overall Progress (Stage-Based)</span>
                  <span className="font-bold text-primary">{project.progress}% Complete</span>
                </div>
                <div className="w-full bg-brandgray-light border border-brandgray-border/50 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Next Action Box */}
        <div>
          <Card className="border-primary/20 shadow-subtle bg-slate-50/50 h-full flex flex-col justify-between">
            <CardHeader className="p-5 pb-2">
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider block leading-none">
                Current Stage
              </span>
              <span className="text-sm font-bold text-brandgray-text mt-1.5 block">
                {stageConfig.label}
              </span>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1 mt-2">
                <span className="text-[9px] font-bold text-brandgray-muted uppercase block leading-none">
                  Next Action
                </span>
                <p className="text-xs text-brandgray-text/90 font-medium leading-relaxed mt-1">
                  {project.nextAction}
                </p>
              </div>

              <div className="pt-2">
                {project.actionHref ? (
                  <Link href={project.actionHref} className="block w-full">
                    <Button variant="primary" size="sm" className="w-full h-9 font-semibold text-xs">
                      {project.actionText}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full h-9 font-semibold text-xs"
                    onClick={() => {
                      alert(`Action triggered: "${project.actionText}" is currently operating in demo status. Updates are registered in the local state.`);
                    }}
                  >
                    {project.actionText}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Project Lifecycle Visual Timeline */}
      <Card className="border-brandgray-border shadow-subtle bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-brandgray-border/60">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
            Project Lifecycle Stages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {/* Horizontal timeline on Large screens */}
          <div className="hidden lg:flex items-center justify-between w-full relative">
            <div className="absolute left-10 right-10 top-4.5 h-0.5 bg-brandgray-border z-0" />
            <div 
              className="absolute left-10 top-4.5 h-0.5 bg-primary z-0 transition-all duration-300"
              style={{ width: `${(Math.max(0, currentStageIndex) / (LIFECYCLE_STAGES.length - 1)) * 90}%` }}
            />

            {LIFECYCLE_STAGES.map((stageName, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const config = STAGE_CONFIG[stageName];

              return (
                <div key={stageName} className="flex flex-col items-center text-center relative z-10 w-24">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted 
                      ? "bg-success border-success text-white" 
                      : isCurrent
                        ? "bg-white border-primary text-primary font-bold shadow-subtle ring-4 ring-primary-light"
                        : "bg-white border-brandgray-border text-brandgray-muted"
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4.5 w-4.5" />
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-[9.5px] mt-2 leading-tight font-semibold block ${
                    isCurrent ? "text-primary font-bold" : "text-brandgray-muted"
                  }`}>
                    {config.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[8px] font-bold text-primary bg-primary-light border border-primary/20 px-1 py-0.2 rounded mt-1 uppercase tracking-wider leading-none scale-90">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vertical timeline for Mobile/Tablet */}
          <div className="lg:hidden space-y-4 relative pl-3 border-l-2 border-brandgray-border">
            {LIFECYCLE_STAGES.map((stageName, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const config = STAGE_CONFIG[stageName];

              return (
                <div key={stageName} className="flex items-start gap-3 relative -left-6.5">
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? "bg-success border-success text-white" 
                      : isCurrent
                        ? "bg-white border-primary text-primary font-bold shadow-subtle ring-2 ring-primary-light"
                        : "bg-white border-brandgray-border text-brandgray-muted"
                  }`}>
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px]">{idx + 1}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        isCurrent ? "text-primary" : "text-brandgray-text"
                      }`}>
                        {config.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] font-bold text-primary bg-primary-light border border-primary/20 px-1.5 rounded uppercase tracking-wider leading-none">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-brandgray-muted block">
                      {isCompleted ? "Completed stage" : isCurrent ? "Active Focus" : "Upcoming phase"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Original Problem */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <span className="text-[9px] font-bold text-brandgray-muted uppercase tracking-wider block">
                PROJECT SOURCE
              </span>
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider block mt-1">
                Original Community Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary">
                  {project.originalProblem.title}
                </h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed">
                  {project.originalProblem.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brandgray-border/40 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Problem ID</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.problemId}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Category</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.originalProblem.category}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Reported Date & By</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">
                    {project.originalProblem.dateReported} by {project.originalProblem.reporter}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Impact Size & Severity</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">
                    {project.originalProblem.affectedPopulation} ({project.originalProblem.severity} Severity)
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Validation Status</span>
                  <span className="font-semibold text-success mt-1.5 block flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {project.originalProblem.validationStatus}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Location Details</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brandgray-muted shrink-0" /> {project.originalProblem.district}, {project.originalProblem.state}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link href={`/university/problems/${project.problemId}`}>
                  <Button variant="outline" size="sm" className="h-8 font-semibold text-xs flex items-center gap-1 bg-white">
                    View Original Problem <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration & Agreement */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">
                Collaboration & Agreement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">University Partner</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.collaboration.university}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Industry / CSR Partner</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-brandgray-muted shrink-0" /> {project.collaboration.industryPartner}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Government Partner</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.collaboration.governmentAuthority}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Project Coordinator</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.collaboration.coordinator}</span>
                </div>
                
                <div className="sm:col-span-2 border-t border-brandgray-border/40 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Agreement Status</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 border rounded mt-1.5 ${AGREEMENT_STATUS_BADGES[project.collaboration.agreementStatus as keyof typeof AGREEMENT_STATUS_BADGES] || AGREEMENT_STATUS_BADGES.Draft}`}>
                      {project.collaboration.agreementStatus}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Agreement Type</span>
                    <span className="font-semibold text-brandgray-text mt-1.5 block">{project.collaboration.agreementType}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Total Funding</span>
                    <span className="font-bold text-primary mt-1.5 block text-sm">{project.collaboration.funding}</span>
                  </div>
                </div>
              </div>

              {/* Industry / CSR Partners Display */}
              <div className="border-t border-brandgray-border/60 pt-4 space-y-2">
                <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider block">
                  INDUSTRY / CSR PARTNERS
                </span>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-950">{project.collaboration.industryPartner}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded">
                      ACCEPTED
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900">CSR Funding & Technical Mentorship</p>
                </div>
              </div>

              {/* Documents subsection */}
              <div className="pt-4 border-t border-brandgray-border/40 space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Associated Project Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 border border-brandgray-border rounded bg-brandgray-light/20 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-brandgray-muted shrink-0" />
                        <div className="truncate">
                          <span className="font-medium text-brandgray-text block truncate leading-none">{doc.name}</span>
                          <span className="text-[9px] text-brandgray-muted mt-0.5 block">{doc.type} · {doc.size || "Size TBD"} · Uploaded {doc.uploadedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-brandgray-muted bg-brandgray-light border border-brandgray-border/60 px-1.5 rounded">
                          {doc.status}
                        </span>
                        <button 
                          className="text-primary hover:text-primary-hover p-1" 
                          aria-label="Download Document"
                          onClick={() => alert(`Initiating secure download: ${doc.name} (${doc.size})`)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Assigned Research Team */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brandgray-muted" /> Assigned Research Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {project.assignedTeam ? (
                <>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-primary">
                      {project.assignedTeam.name}
                    </h4>
                    <p className="text-[11px] text-brandgray-muted">
                      Faculty Mentor: <span className="font-semibold text-brandgray-text">{project.assignedTeam.facultyMentor}</span>
                    </p>
                  </div>

                  {/* Members */}
                  <div className="space-y-1.5 pt-3 border-t border-brandgray-border/40">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block tracking-wider mb-1">
                      Student Members
                    </span>
                    <ul className="space-y-1 text-xs text-brandgray-text">
                      {project.assignedTeam.members.map((member, i) => (
                        <li key={i} className="flex justify-between items-center py-0.5">
                          <span>{member.name}</span>
                          <span className="bg-brandgray-light text-brandgray-muted text-[10px] px-1.5 py-0.2 rounded border border-brandgray-border/50">
                            {member.degree}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Departments */}
                  <div className="space-y-1.5 pt-3 border-t border-brandgray-border/40">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block tracking-wider mb-1">
                      Departments
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.assignedTeam.departments.map((dept, i) => (
                        <span key={i} className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-1.5 pt-3 border-t border-brandgray-border/40">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block tracking-wider mb-1">
                      Research Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.assignedTeam.skills.map((skill, i) => (
                        <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-150/40">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link href="/university/teams">
                      <Button variant="outline" size="sm" className="w-full h-8 font-semibold text-xs">
                        View Team Workspace
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center space-y-3">
                  <div className="text-xs font-bold text-red-600 uppercase bg-red-50 border border-red-200 px-3 py-1 rounded inline-block">
                    TEAM FORMATION PENDING
                  </div>
                  <p className="text-[11px] text-brandgray-muted">
                    No research team is assigned to this project match yet. Assign a team to prepare the solution proposal.
                  </p>
                  <Link href="/university/teams">
                    <Button variant="primary" size="sm" className="w-full h-8 font-semibold text-xs">
                      Manage Team
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones & Progress Tracker */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-brandgray-muted" /> Milestones & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-4">
                {project.milestones.map((m, i) => {
                  const deadlineInfo = getDaysRemainingText(m.dueDate);
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {m.status === "Completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : m.status === "Current" ? (
                          <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center bg-white shadow-sm ring-2 ring-primary-light">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-brandgray-border bg-transparent" />
                        )}
                      </div>
                      <div className="text-xs flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className={`font-bold ${
                            m.status === "Current" ? "text-primary" : "text-brandgray-text"
                          }`}>
                            {m.name}
                          </span>
                          
                          {/* Deadline Badge */}
                          {deadlineInfo && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                              deadlineInfo.isOverdue 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-brandgray-light text-brandgray-muted border-brandgray-border"
                            }`}>
                              {deadlineInfo.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-brandgray-muted mt-0.5">
                          <span className="font-semibold">
                            {m.status === "Completed" ? "Completed" : m.status === "Current" ? "In Progress" : "Upcoming"}
                          </span>
                          {m.date && <span>· {m.date}</span>}
                        </div>
                        <p className="text-[10.5px] text-brandgray-muted mt-1 leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Project Activity Log */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-brandgray-muted" /> Project Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="relative pl-3 border-l border-brandgray-border/60 space-y-4">
                {project.activities.map((activity, i) => (
                  <div key={i} className="relative text-[11px] leading-relaxed">
                    <div className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white ring-2 ring-primary-light" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-brandgray-text">{activity.text}</p>
                      <p className="text-[10px] text-brandgray-muted">
                        by <span className="text-brandgray-text font-medium">{activity.performedBy}</span>
                      </p>
                      <span className="text-[9.5px] text-brandgray-muted block font-medium">
                        {activity.date} · {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* State-Dependent Project Actions bar at bottom */}
      <Card className="border-brandgray-border shadow-subtle bg-white">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-brandgray-muted">
            Actions for <strong className="text-brandgray-text font-bold">{project.id}</strong> in stage <strong className="text-primary font-bold">{stageConfig.label}</strong>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/university/problems/${project.problemId}`}>
              <Button variant="outline" size="sm" className="h-8 font-semibold text-xs bg-white">
                View Original Problem
              </Button>
            </Link>
            {project.assignedTeam && (
              <Link href="/university/teams">
                <Button variant="outline" size="sm" className="h-8 font-semibold text-xs bg-white">
                  View Team
                </Button>
              </Link>
            )}
            
            {/* Conditional action buttons based on Project Stage */}
            {project.stage === "UNIVERSITY_MATCHED" && (
              <Link href="/university/teams">
                <Button variant="primary" size="sm" className="h-8 font-semibold text-xs">
                  Form Research Team
                </Button>
              </Link>
            )}
            {project.stage === "TEAM_FORMED" && (
              <Link href="/university/proposals">
                <Button variant="primary" size="sm" className="h-8 font-semibold text-xs">
                  Create Solution Proposal
                </Button>
              </Link>
            )}
            {project.stage === "PROPOSAL_SUBMITTED" && (
              <Link href="/university/proposals">
                <Button variant="primary" size="sm" className="h-8 font-semibold text-xs">
                  View Active Proposal
                </Button>
              </Link>
            )}
            {project.stage === "IMPLEMENTATION" && (
              <Button 
                variant="primary" 
                size="sm" 
                className="h-8 font-semibold text-xs"
                onClick={() => alert("Open Milestone Progress Update Sheet")}
              >
                Update Progress Milestones
              </Button>
            )}
            {project.stage === "COMPLETED" && (
              <Button 
                variant="primary" 
                size="sm" 
                className="h-8 font-semibold text-xs"
                onClick={() => alert("Open formal closed-out project report")}
              >
                View Final Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
