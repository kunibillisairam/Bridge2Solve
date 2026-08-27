"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Users, 
  Filter, 
  X, 
  SlidersHorizontal, 
  GraduationCap,
  Building2,
  FolderKanban,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Clock,
  Award,
  HeartHandshake
} from "lucide-react";
import { 
  industryService 
} from "@/services/industryService";
import { 
  universityMockService, 
  ResolvedProject, 
  STAGE_CONFIG,
  getDaysRemainingText,
  getProjectHealth
} from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const HEALTH_COLORS: Record<string, string> = {
  "ON TRACK": "bg-emerald-50 text-emerald-800 border-emerald-300",
  "AT RISK": "bg-amber-50 text-amber-800 border-amber-300 animate-pulse",
  DELAYED: "bg-red-50 text-red-800 border-red-300 ring-2 ring-red-400 font-extrabold",
  "AWAITING VERIFICATION": "bg-blue-50 text-blue-800 border-blue-300 animate-pulse",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-300",
};

function AdminProjectsContent() {
  const searchParams = useSearchParams();
  const initialStage = searchParams.get("stage") || "All";

  const [projects, setProjects] = useState<ResolvedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ResolvedProject[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(initialStage);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const raw = universityMockService.getProjects();
    const resolved: ResolvedProject[] = [];
    for (const p of raw) {
      const res = universityMockService.resolveProject(p);
      if (res) resolved.push(res);
    }
    setProjects(resolved);
    setFilteredProjects(resolved);
  };

  useEffect(() => {
    let result = projects;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.collaboration.university.toLowerCase().includes(q) ||
          p.originalProblem.district.toLowerCase().includes(q) ||
          p.originalProblem.title.toLowerCase().includes(q) ||
          (p.assignedTeam && p.assignedTeam.name.toLowerCase().includes(q))
      );
    }

    if (selectedFilter !== "All") {
      if (selectedFilter === "Active") {
        // Active stages of execution
        result = result.filter((p) => p.stage === "IMPLEMENTATION" || p.stage === "PROPOSAL_APPROVED");
      } else if (selectedFilter === "Pending Action") {
        // Pending setup/approval stages
        result = result.filter((p) => 
          ["PROBLEM_REPORTED", "VALIDATED", "UNIVERSITY_MATCHED", "TEAM_FORMED", "PROPOSAL_SUBMITTED"].includes(p.stage)
        );
      } else if (selectedFilter === "Delayed") {
        result = result.filter((p) => getProjectHealth(p) === "DELAYED");
      } else if (selectedFilter === "Awaiting Verification") {
        result = result.filter((p) => p.stage === "AWAITING_ADMIN_VERIFICATION");
      } else if (selectedFilter === "Completed") {
        result = result.filter((p) => p.stage === "COMPLETED");
      }
    }

    setFilteredProjects(result);
  }, [searchQuery, selectedFilter, projects]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFilter("All");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h1 className="text-xl font-bold text-primary uppercase tracking-wide">
          PROJECTS CONTROL & MONITORING CENTER
        </h1>
        <p className="text-xs text-brandgray-muted mt-1 font-medium">
          Monitor active, pending, verification-ready, and completed community research projects across university partners.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-brandgray-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
          <input
            type="text"
            placeholder="Search by Project ID (e.g. PB-2026-001), title, university, team, or location..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-brandgray-light/60">
          <div className="flex items-center gap-1.5 text-xs text-brandgray-muted font-bold uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
          </div>

          <select
            className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-medium"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="All">All Projects ({projects.length})</option>
            <option value="Active">Active (Under Implementation)</option>
            <option value="Pending Action">Pending Action (Planning / Endorsement)</option>
            <option value="Delayed">Delayed Projects (Overdue)</option>
            <option value="Awaiting Verification">Awaiting Verification</option>
            <option value="Completed">Completed Projects</option>
          </select>

          {(searchQuery || selectedFilter !== "All") && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] font-semibold flex items-center gap-1 text-red-600 hover:text-red-700"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-8 text-center space-y-3 max-w-xl mx-auto">
            <FolderKanban className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-primary">No Projects Found</p>
            <p className="text-xs text-brandgray-muted leading-relaxed">
              No active, pending verification, or completed collaborative research projects match your current search queries or selected status filters.
            </p>
            <p className="text-[11px] font-bold text-primary">
              What next: Click the "Clear Filters" button to reset the view, search for different terms, or visit the approved proposals board to launch new projects.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const stageConfig = STAGE_CONFIG[project.stage];
            const acceptedRequests = industryService.getAcceptedSupportRequestsForProject(project.id);
            const currentMilestone = project.milestones.find((m) => m.status === "Current" || m.status === "Overdue") || project.milestones[project.milestones.length - 1];
            const deadlineInfo = currentMilestone?.dueDate ? getDaysRemainingText(currentMilestone.dueDate) : null;

            const isAwaitingVerification = project.stage === "AWAITING_ADMIN_VERIFICATION";
            const projectHealth = getProjectHealth(project);

            return (
              <Card key={project.id} className={`border shadow-subtle bg-white hover:border-primary/30 transition-all flex flex-col justify-between ${
                isAwaitingVerification ? "border-amber-300 ring-1 ring-amber-200" : "border-brandgray-border"
              }`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                          {project.id}
                        </span>
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                          {project.originalProblem.category}
                        </span>
                        <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded border ${HEALTH_COLORS[projectHealth]}`}>
                          HEALTH: {projectHealth}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-primary">{project.title}</h3>
                    </div>

                    <span className={`text-xs px-2.5 py-0.5 rounded font-bold border uppercase ${
                      isAwaitingVerification
                        ? "bg-amber-100 text-amber-900 border-amber-300 font-extrabold"
                        : project.stage === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-indigo-50 text-indigo-700 border-indigo-150"
                    }`}>
                      {stageConfig?.label || project.stage} ({project.progress}%)
                    </span>
                  </div>

                  <div className="text-xs text-brandgray-muted bg-slate-50 p-2 border border-slate-100 rounded">
                    <span className="text-[9.5px] font-bold uppercase block mb-0.5 text-slate-500">Target Problem ID & Title</span>
                    <span className="font-semibold text-primary">{project.problemId}</span>: {project.originalProblem.title}
                  </div>

                  <p className="text-xs text-brandgray-text leading-relaxed line-clamp-2">
                    {project.originalProblem.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded border border-slate-150 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-primary">
                        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                        <span>{project.collaboration.university}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{project.startDate} — {project.expectedCompletionDate}</span>
                    </div>

                    {project.assignedTeam && (
                      <p className="text-[11px] text-brandgray-muted flex items-center gap-1 pl-5">
                        <Users className="h-3.5 w-3.5 shrink-0" /> Team: <span className="font-semibold text-brandgray-text">{project.assignedTeam.name}</span> ({project.assignedTeam.facultyMentor})
                      </p>
                    )}
                  </div>

                  {acceptedRequests.length > 0 && (
                    <div className="p-2.5 bg-emerald-50/70 text-emerald-900 border border-emerald-250 rounded text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-[10px] uppercase block text-emerald-800">CSR Funding Partner</span>
                        <p className="font-bold text-emerald-950">{acceptedRequests[0].industryName}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                        {acceptedRequests[0].supportType}
                      </span>
                    </div>
                  )}

                  {deadlineInfo && (
                    <div className={`p-2 rounded text-[11px] font-semibold flex items-center gap-1.5 ${
                      deadlineInfo.isOverdue ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700"
                    }`}>
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>Target Milestone: <span className="font-bold">{currentMilestone?.name}</span> ({deadlineInfo.text})</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-brandgray-border/40 text-xs">
                    <span className="flex items-center gap-1 text-brandgray-muted">
                      <MapPin className="h-3.5 w-3.5" /> {project.originalProblem.district}, {project.originalProblem.state}
                    </span>
                    <Link href={`/admin/projects/${project.id}`}>
                      <Button variant="primary" size="sm" className="h-8 text-xs font-bold flex items-center gap-1">
                        {isAwaitingVerification ? (
                          <>
                            <Award className="h-3.5 w-3.5 text-amber-300" /> Verify Project Completion
                          </>
                        ) : (
                          <>
                            View Project Details <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brandgray-muted">Loading Projects Control...</div>}>
      <AdminProjectsContent />
    </Suspense>
  );
}
