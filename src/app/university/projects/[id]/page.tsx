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
  FileSpreadsheet,
  Building,
  ShieldAlert,
  ArrowRight,
  Download,
  Activity,
  Award
} from "lucide-react";
import { 
  universityMockService, 
  UniversityProject 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES = {
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-250",
  ACTIVE: "bg-blue-50 text-blue-700 border-blue-150",
  COMPLETED: "bg-success-light text-success border-success/15",
  PENDING_ACTION: "bg-red-50 text-red-700 border-red-200",
};

const LIFECYCLE_STAGES = [
  "Problem Reported",
  "Validated",
  "University Matched",
  "Team Formed",
  "Proposal Submitted",
  "Proposal Approved",
  "Implementation",
  "Impact Assessment",
  "Completed"
];

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<UniversityProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = universityMockService.getProjectById(id);
      if (data) {
        setProject(data);
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

  // Find index of current stage in lifecycle
  const currentStageIndex = LIFECYCLE_STAGES.indexOf(project.lifecycleStage);

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

      {/* Project Header Card */}
      <Card className="border-brandgray-border shadow-subtle bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                  Project ID: {project.id}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_BADGES[project.status]}`}>
                  {project.status.replace(/_/g, " ")}
                </span>
              </div>
              <h2 className="text-xl font-bold text-primary">{project.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brandgray-muted">
                <span>
                  Team: <span className="font-semibold text-brandgray-text">{project.assignedTeam.name}</span>
                </span>
                <span>
                  Mentor: <span className="font-semibold text-brandgray-text">{project.facultyMentor}</span>
                </span>
              </div>
            </div>

            {/* Progress circle/bar */}
            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brandgray-muted font-medium">Implementation Status</span>
                <span className="font-bold text-primary">{project.progress}% Complete</span>
              </div>
              <div className="w-full bg-brandgray-light border border-brandgray-border/50 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-primary`} 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Project Lifecycle Timeline */}
      <Card className="border-brandgray-border shadow-subtle bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-brandgray-border/60">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
            Project Lifecycle & Execution Stages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {/* Horizontal timeline on Desktop, vertical on Mobile */}
          <div className="hidden lg:flex items-center justify-between w-full relative">
            
            {/* Connecting line */}
            <div className="absolute left-6 right-6 top-4.5 h-0.5 bg-brandgray-border z-0" />
            <div 
              className="absolute left-6 top-4.5 h-0.5 bg-primary z-0 transition-all duration-300"
              style={{ width: `${(Math.max(0, currentStageIndex) / (LIFECYCLE_STAGES.length - 1)) * 92}%` }}
            />

            {LIFECYCLE_STAGES.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              return (
                <div key={stage} className="flex flex-col items-center text-center relative z-10 w-24">
                  {/* Circle indicator */}
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted 
                      ? "bg-success border-success text-white" 
                      : isCurrent
                        ? "bg-white border-primary text-primary font-bold shadow-subtle ring-4 ring-primary-light"
                        : "bg-white border-brandgray-border text-brandgray-muted"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-2.5 leading-tight font-medium ${
                    isCurrent ? "text-primary font-bold" : "text-brandgray-muted"
                  }`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Vertical timeline for Mobile/Tablet */}
          <div className="lg:hidden space-y-4">
            {LIFECYCLE_STAGES.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              return (
                <div key={stage} className="flex items-start gap-3">
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? "bg-success border-success text-white" 
                      : isCurrent
                        ? "bg-white border-primary text-primary font-bold shadow-subtle ring-2 ring-primary-light"
                        : "bg-white border-brandgray-border text-brandgray-muted"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px]">{index + 1}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-xs font-semibold block ${
                      isCurrent ? "text-primary font-bold" : "text-brandgray-text"
                    }`}>
                      {stage}
                    </span>
                    <span className="text-[10px] text-brandgray-muted block leading-none">
                      {isCompleted ? "Completed" : isCurrent ? "Active Stage" : "Pending"}
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
        
        {/* Left Column (Original Problem, Collaboration/Documents) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Original Problem */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <span className="text-[9px] font-bold text-success uppercase tracking-wider block bg-success-light border border-success/15 px-2 py-0.5 rounded w-max mb-1.5">
                Target Problem Source
              </span>
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider block">
                Original Community Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-primary">
                  {project.originalProblem.title}
                </h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed">
                  {project.originalProblem.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brandgray-border/40 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Reporter</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.originalProblem.reporter}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Date Reported</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.originalProblem.dateReported}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Validation Status</span>
                  <span className="font-semibold text-success mt-1.5 block flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {project.originalProblem.validationStatus}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Impact Size / Severity</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">
                    {project.originalProblem.affectedPopulation} ({project.originalProblem.severity} Severity)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-brandgray-light/45 border border-brandgray-border rounded text-[11px] text-brandgray-muted leading-relaxed">
                <strong>Source Notice:</strong> This project was matched, approved, and initiated in direct response to the community-driven challenge submitted at {project.originalProblem.district}, {project.originalProblem.state}.
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">University Partner</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.collaboration.university}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Industry CSR Sponsor</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-brandgray-muted shrink-0" /> {project.collaboration.industryPartner}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Government Partner</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.collaboration.governmentAuthority}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Agreement Status & Type</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">
                    {project.collaboration.agreementStatus} ({project.collaboration.agreementType})
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Project Coordinator</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{project.collaboration.coordinator}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Total Allocation Funding</span>
                  <span className="font-bold text-primary mt-1.5 block text-sm">{project.collaboration.funding}</span>
                </div>
              </div>

              {/* Documents subsection */}
              <div className="pt-4 border-t border-brandgray-border/40 space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Associated Project Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 border border-brandgray-border rounded bg-brandgray-light/20 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-brandgray-muted shrink-0" />
                        <div className="truncate">
                          <span className="font-medium text-brandgray-text block truncate leading-none">{doc.name}</span>
                          <span className="text-[9px] text-brandgray-muted mt-0.5 block">{doc.type} · {doc.size || "Size TBD"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-brandgray-muted bg-brandgray-light border border-brandgray-border/60 px-1.5 rounded">
                          {doc.status}
                        </span>
                        <button className="text-primary hover:text-primary-hover p-1" aria-label="Download Document">
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

        {/* Right Column (Assigned Team, Milestones list, activities) */}
        <div className="space-y-6">
          
          {/* Assigned Research Team */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brandgray-muted" /> Assigned Research Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
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
                  Team Members
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
                  Focus Research Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {project.assignedTeam.skills.map((skill, i) => (
                    <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-150/40">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Progress (Detailed Milestones Checklist) */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-brandgray-muted" /> Milestones & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3.5">
                {project.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {m.status === "Completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : m.status === "Current" ? (
                        <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-brandgray-border bg-transparent" />
                      )}
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${
                          m.status === "Current" ? "text-primary" : "text-brandgray-text"
                        }`}>
                          {m.name}
                        </span>
                        {m.date && (
                          <span className="text-[9.5px] text-brandgray-muted">({m.date})</span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-brandgray-muted mt-0.5 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
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
              {project.activities.map((activity, i) => (
                <div key={i} className="flex gap-2.5 text-[11px] leading-relaxed border-b border-brandgray-light/60 last:border-0 pb-3 last:pb-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-brandgray-text">{activity.text}</p>
                    <span className="text-[9.5px] text-brandgray-muted block font-medium">{activity.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
