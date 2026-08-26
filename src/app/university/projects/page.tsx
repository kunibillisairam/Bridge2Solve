"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { 
  universityMockService, 
  ResolvedProject,
  STAGE_CONFIG
} from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_CONFIGS = {
  UNDER_REVIEW: { label: "Under Review", badge: "bg-amber-50 text-amber-700 border-amber-250", bar: "bg-amber-500" },
  ACTIVE: { label: "Active", badge: "bg-blue-50 text-blue-700 border-blue-150", bar: "bg-primary" },
  COMPLETED: { label: "Completed", badge: "bg-success-light text-success border-success/15", bar: "bg-success" },
  PENDING_ACTION: { label: "Pending Action", badge: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-500" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ResolvedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ResolvedProject[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "UNDER_REVIEW" | "PENDING_ACTION" | "ACTIVE" | "COMPLETED">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const raw = universityMockService.getProjects();
    const resolved = raw.map(p => universityMockService.resolveProject(p)).filter(Boolean) as ResolvedProject[];
    setProjects(resolved);
    setFilteredProjects(resolved);
  }, []);

  // Filter application
  useEffect(() => {
    let result = projects;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.originalProblem.district.toLowerCase().includes(q) ||
          p.originalProblem.state.toLowerCase().includes(q) ||
          (p.assignedTeam && p.assignedTeam.name.toLowerCase().includes(q)) ||
          p.facultyMentor.toLowerCase().includes(q)
      );
    }

    if (activeTab !== "All") {
      result = result.filter((p) => p.status === activeTab);
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.originalProblem.category === selectedCategory);
    }

    setFilteredProjects(result);
  }, [searchQuery, activeTab, selectedCategory, projects]);

  // Statistics counters
  const totalCount = projects.length;
  const underReviewCount = projects.filter((p) => p.status === "UNDER_REVIEW").length;
  const pendingActionCount = projects.filter((p) => p.status === "PENDING_ACTION").length;
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length;

  // Categories extracted from projects
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.originalProblem.category)))];

  // Helper for empty states text
  const getEmptyStateText = () => {
    if (searchQuery.trim() !== "") {
      return {
        title: "No search results",
        desc: `No projects match "${searchQuery}". Try adjusting your keywords or clearing the query.`,
      };
    }
    if (activeTab !== "All") {
      const statusLabel = STATUS_CONFIGS[activeTab].label.toLowerCase();
      return {
        title: `No ${statusLabel} projects`,
        desc: `You currently have no projects in the ${statusLabel} state.`,
      };
    }
    if (selectedCategory !== "All") {
      return {
        title: "No projects in category",
        desc: `There are no projects matching the "${selectedCategory}" category.`,
      };
    }
    return {
      title: "No projects found",
      desc: "There are currently no projects registered for this university portal.",
    };
  };

  const emptyState = getEmptyStateText();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary">University Projects</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Monitor timelines, research teams, partnership agreements, and deployment progress for all active and archived projects.
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Projects", value: totalCount, description: "All tracked projects", icon: Briefcase, color: "bg-primary-light text-primary border-primary/10" },
          { label: "Under Review", value: underReviewCount, description: "Proposal evaluation", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-250" },
          { label: "Pending Action", value: pendingActionCount, description: "Action required", icon: AlertCircle, color: "bg-red-50 text-red-700 border-red-200" },
          { label: "Active Projects", value: activeCount, description: "Active deployment", icon: TrendingUp, color: "bg-blue-50 text-blue-700 border-blue-150" },
          { label: "Completed", value: completedCount, description: "Formally closed", icon: CheckCircle2, color: "bg-success-light text-success border-success/15" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-brandgray-border shadow-subtle bg-white">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className={`h-9 w-9 shrink-0 rounded flex items-center justify-center border ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-xl font-bold text-primary block leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[10.5px] font-semibold text-brandgray-text mt-1.5 block">
                    {stat.label}
                  </span>
                  <span className="text-[9.5px] text-brandgray-muted mt-0.5 block leading-tight">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter and Search Bar Container */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brandgray-border/60 pb-2">
          
          {/* Navigation/Filtering tabs */}
          <div className="flex overflow-x-auto space-x-1 sm:space-x-2 -mb-2 pb-2 scrollbar-none">
            {[
              { id: "All", label: "All Projects", count: totalCount },
              { id: "UNDER_REVIEW", label: "Under Review", count: underReviewCount },
              { id: "PENDING_ACTION", label: "Pending Action", count: pendingActionCount },
              { id: "ACTIVE", label: "Active", count: activeCount },
              { id: "COMPLETED", label: "Completed", count: completedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                  activeTab === tab.id
                    ? "bg-primary border-primary text-white"
                    : "bg-transparent border-transparent text-brandgray-muted hover:text-brandgray-text hover:bg-brandgray-light"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-brandgray-light border border-brandgray-border text-brandgray-text"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Category Inputs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-44 bg-white border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 appearance-none font-semibold text-brandgray-text"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, title, team, mentor, location..."
                className="w-full bg-white border border-brandgray-border rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Projects List Deck */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-brandgray-border rounded-md text-brandgray-muted text-sm space-y-2 shadow-subtle">
            <Briefcase className="h-8 w-8 mx-auto opacity-30 text-brandgray-muted" />
            <p className="font-semibold text-brandgray-text">{emptyState.title}</p>
            <p className="text-xs max-w-sm mx-auto px-4">{emptyState.desc}</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveTab("All"); setSelectedCategory("All"); }} className="mt-2 h-8">
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const config = STATUS_CONFIGS[project.status];
            const stageLabel = STAGE_CONFIG[project.stage].label;
            return (
              <Card key={project.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/20 transition-all duration-150">
                <CardContent className="p-5">
                  
                  {/* Top line ID + Badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                          Project ID: {project.id}
                        </span>
                        <span className="text-[9px] font-semibold text-brandgray-muted bg-brandgray-light border border-brandgray-border/60 px-1.5 py-0.2 rounded">
                          {stageLabel}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-primary">
                        {project.title}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Mid Row: Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-brandgray-border/40 my-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Original Category</span>
                      <span className="font-medium text-brandgray-text mt-1.5 block">{project.originalProblem.category}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Research Team</span>
                      <span className="font-medium text-brandgray-text mt-1.5 block flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-brandgray-muted shrink-0" /> {project.assignedTeam ? project.assignedTeam.name : "Formation Pending"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Faculty Mentor</span>
                      <span className="font-medium text-brandgray-text mt-1.5 block">{project.facultyMentor}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Timeline</span>
                      <span className="font-medium text-brandgray-text mt-1.5 block flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-brandgray-muted shrink-0" /> {project.startDate} &mdash; {project.expectedCompletionDate}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Line: Progress bar + details link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Progress Bar */}
                    <div className="flex-1 max-w-md space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-brandgray-muted font-medium font-semibold">Stage Progress</span>
                        <span className="font-bold text-primary">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-brandgray-light border border-brandgray-border/50 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${config.bar}`} 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-auto">
                      <span className="flex items-center gap-1 text-brandgray-muted">
                        <MapPin className="h-3.5 w-3.5" /> {project.originalProblem.district}, {project.originalProblem.state}
                      </span>
                      <Link href={`/university/projects/${project.id}`}>
                        <Button variant="primary" size="sm" className="h-8 font-semibold text-xs flex items-center gap-1">
                          View Project <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>

                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
