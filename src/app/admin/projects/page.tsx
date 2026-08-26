"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  ArrowRight
} from "lucide-react";
import { 
  industryService 
} from "@/services/industryService";
import { 
  universityMockService, 
  ResolvedProject, 
  STAGE_CONFIG 
} from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ResolvedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ResolvedProject[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");

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
          (p.assignedTeam && p.assignedTeam.name.toLowerCase().includes(q))
      );
    }

    if (selectedStage !== "All") {
      result = result.filter((p) => p.stage === selectedStage);
    }

    setFilteredProjects(result);
  }, [searchQuery, selectedStage, projects]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStage("All");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h1 className="text-xl font-bold text-primary uppercase tracking-wide">
          PROJECTS CONTROL CENTER
        </h1>
        <p className="text-xs text-brandgray-muted mt-1 font-medium">
          Monitor all active and completed community research projects across university partners.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-brandgray-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
          <input
            type="text"
            placeholder="Search by Project ID (e.g. PB-2026-001), title, university, team, or location..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-brandgray-border rounded focus:outline-none focus:border-primary"
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
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option value="All">All Stages</option>
            <option value="TEAM_FORMED">Team Formed</option>
            <option value="PROPOSAL_SUBMITTED">Proposal Submitted</option>
            <option value="PROPOSAL_APPROVED">Proposal Approved</option>
            <option value="IMPLEMENTATION">Implementation</option>
            <option value="IMPACT_ASSESSMENT">Impact Assessment</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {(searchQuery || selectedStage !== "All") && (
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
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-primary">No Projects Found</p>
            <p className="text-xs text-brandgray-muted">No projects match your current search or filter criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const stageConfig = STAGE_CONFIG[project.stage];
            const acceptedRequests = industryService.getAcceptedSupportRequestsForProject(project.id);

            return (
              <Card key={project.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                          {project.id}
                        </span>
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                          {project.originalProblem.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-primary">{project.title}</h3>
                    </div>

                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-0.5 rounded font-bold">
                      {stageConfig?.label || project.stage} ({project.progress}%)
                    </span>
                  </div>

                  <p className="text-xs text-brandgray-text leading-relaxed line-clamp-2">
                    {project.originalProblem.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded border border-slate-150 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-primary">
                      <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                      <span>{project.collaboration.university}</span>
                    </div>
                    {project.assignedTeam && (
                      <p className="text-[11px] text-brandgray-muted flex items-center gap-1 pl-5">
                        <Users className="h-3.5 w-3.5 shrink-0" /> Team: {project.assignedTeam.name} ({project.assignedTeam.facultyMentor})
                      </p>
                    )}
                  </div>

                  {acceptedRequests.length > 0 && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-xs space-y-0.5">
                      <span className="font-bold text-[10px] uppercase block text-emerald-800">CSR Industry Partner</span>
                      <p className="font-bold text-emerald-950">{acceptedRequests[0].industryName}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-brandgray-border/40 text-xs">
                    <span className="flex items-center gap-1 text-brandgray-muted">
                      <MapPin className="h-3.5 w-3.5" /> {project.originalProblem.district}, {project.originalProblem.state}
                    </span>
                    <Link href={`/university/projects/${project.id}`}>
                      <Button variant="primary" size="sm" className="h-8 text-xs font-bold">
                        View Project Details <ArrowRight className="h-3.5 w-3.5" />
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
