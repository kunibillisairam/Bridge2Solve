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
  Sparkles,
  Building2,
  Handshake,
  Layers
} from "lucide-react";
import { 
  industryService, 
  SUPPORT_TYPE_LABELS 
} from "@/services/industryService";
import { ResolvedProject, STAGE_CONFIG } from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function IndustryProjectsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "seeking" | "my_interests">("all");
  const [projects, setProjects] = useState<ResolvedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ResolvedProject[]>([]);
  const [myInterestProjectIds, setMyInterestProjectIds] = useState<Set<string>>(new Set());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    const eligible = industryService.getEligibleProjects();
    const myRequests = industryService.getSupportRequestsForIndustry("ind-1");
    const interestIds = new Set(myRequests.map((r) => r.projectId));
    setMyInterestProjectIds(interestIds);

    let list = eligible;
    if (activeTab === "active") {
      list = eligible.filter((p) => p.status === "ACTIVE" || p.stage === "IMPLEMENTATION");
    } else if (activeTab === "seeking") {
      list = eligible.filter((p) => p.stage !== "COMPLETED");
    } else if (activeTab === "my_interests") {
      list = eligible.filter((p) => interestIds.has(p.id));
    }

    setProjects(list);
    setFilteredProblems(list);
  };

  const setFilteredProblems = (list: ResolvedProject[]) => {
    let result = list;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.collaboration.university.toLowerCase().includes(q) ||
          p.originalProblem.district.toLowerCase().includes(q) ||
          p.originalProblem.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.originalProblem.category === selectedCategory);
    }

    if (selectedState !== "All") {
      result = result.filter((p) => p.originalProblem.state === selectedState);
    }

    setFilteredProjects(result);
  };

  useEffect(() => {
    setFilteredProblems(projects);
  }, [searchQuery, selectedCategory, selectedState, projects]);

  const categories = ["All", "Water & Sanitation", "Agriculture & Food Tech", "Waste Management", "Renewable Energy", "Education & Social Impact"];
  const states = ["All", "Jharkhand", "Punjab", "Maharashtra", "Bihar", "Odisha", "Kerala"];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedState("All");
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h2 className="text-xl font-bold text-primary">Industry Project Discovery</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Explore approved university research projects eligible for CSR funding, technical mentorship, and resource sponsorship.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brandgray-border">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-brandgray-muted hover:text-brandgray-text"
          }`}
        >
          All Eligible Projects ({industryService.getEligibleProjects().length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-brandgray-muted hover:text-brandgray-text"
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-primary" /> Active Implementation
        </button>
        <button
          onClick={() => setActiveTab("seeking")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "seeking"
              ? "border-primary text-primary"
              : "border-transparent text-brandgray-muted hover:text-brandgray-text"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Seeking Support
        </button>
        <button
          onClick={() => setActiveTab("my_interests")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "my_interests"
              ? "border-primary text-primary"
              : "border-transparent text-brandgray-muted hover:text-brandgray-text"
          }`}
        >
          <Handshake className="h-3.5 w-3.5 text-primary" /> My Organization Interests ({myInterestProjectIds.size})
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-brandgray-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
          <input
            type="text"
            placeholder="Search by project title, ID (e.g. PB-2026-001), university, or location..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-brandgray-border rounded focus:outline-none focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-brandgray-light/60">
          <div className="flex items-center gap-1.5 text-xs text-brandgray-muted font-bold uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
          </div>

          <select
            className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-medium"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>

          <select
            className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-medium"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {states.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All States" : s}</option>
            ))}
          </select>

          {(searchQuery || selectedCategory !== "All" || selectedState !== "All") && (
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

      {filteredProjects.length === 0 ? (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-8 text-center space-y-3 max-w-xl mx-auto">
            <FolderKanban className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-primary">No Projects Found</p>
            <p className="text-xs text-brandgray-muted leading-relaxed">
              No collaborative research projects currently match your active search terms, category filters, or match suitability preferences.
            </p>
            <p className="text-[11px] font-bold text-primary">
              What next: Click the "Clear Filters" button to reset the search parameters, choose "All Categories", or browse all projects to see upcoming CSR collaboration opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const stageConfig = STAGE_CONFIG[project.stage];
            const hasMyInterest = myInterestProjectIds.has(project.id);
            const indMatch = industryService.getMatchForIndustryAndProject(project.id, "ind-1");

            return (
              <Card key={project.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                          {project.id}
                        </span>
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                          {project.originalProblem.category}
                        </span>
                        {indMatch && (
                          <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                            {indMatch.score}% MATCH
                          </span>
                        )}
                        {hasMyInterest && (
                          <span className="text-[9.5px] font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                            ✓ INTEREST SUBMITTED
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-primary">
                        {project.title}
                      </h4>
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

                  <div className="flex items-center justify-between pt-3 border-t border-brandgray-border/40 text-xs">
                    <span className="flex items-center gap-1 text-brandgray-muted">
                      <MapPin className="h-3.5 w-3.5" /> {project.originalProblem.district}, {project.originalProblem.state}
                    </span>
                    <Link href={`/industry/projects/${project.id}`}>
                      <Button variant="primary" size="sm" className="h-8 text-xs font-semibold">
                        View Details & Participate
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
