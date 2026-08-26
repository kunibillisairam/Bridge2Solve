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
  ChevronRight
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem 
} from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PRIORITY_BADGES = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_BADGES = {
  Unassigned: "bg-blue-50 text-blue-700 border-blue-150",
  Interested: "bg-yellow-50 text-yellow-700 border-yellow-250",
  "Under Review": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Active Project": "bg-success-light text-success border-success/15",
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<CommunityProblem[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    const data = universityMockService.getProblems();
    setProblems(data);
    setFilteredProblems(data);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = problems;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedState !== "All") {
      result = result.filter((p) => p.state === selectedState);
    }

    if (selectedPriority !== "All") {
      result = result.filter((p) => p.priority === selectedPriority);
    }

    if (selectedStatus !== "All") {
      result = result.filter((p) => p.status === selectedStatus);
    }

    setFilteredProblems(result);
  }, [searchQuery, selectedCategory, selectedState, selectedPriority, selectedStatus, problems]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedState("All");
    setSelectedPriority("All");
    setSelectedStatus("All");
  };

  // Get unique lists for filter options
  const categories = ["All", ...Array.from(new Set(problems.map((p) => p.category)))];
  const states = ["All", ...Array.from(new Set(problems.map((p) => p.state)))];
  const priorities = ["All", "High", "Medium", "Low"];
  const statuses = ["All", "Unassigned", "Interested", "Under Review", "Active Project"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary">Discover Community Problems</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Search and filter verified community-submitted problems to match with your department expertise.
        </p>
      </div>

      {/* Main Grid: Filters Sidebar + Problems List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-brandgray-border shadow-subtle bg-white sticky top-48">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-brandgray-border/60 pb-2.5">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-brandgray-text" /> Filters
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-primary hover:underline hover:text-primary-hover"
                >
                  Clear All
                </button>
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Search Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, towns..."
                    className="w-full bg-brandgray-light/40 border border-brandgray-border rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                >
                  {priorities.map((prio) => (
                    <option key={prio} value={prio}>
                      {prio === "All" ? "All Priorities" : `${prio} Priority`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                >
                  {statuses.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat === "All" ? "All Statuses" : stat}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Problems List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-brandgray-muted pb-1.5">
            <span>
              Showing <span className="font-semibold text-brandgray-text">{filteredProblems.length}</span> of {problems.length} problems
            </span>
            {(searchQuery || selectedCategory !== "All" || selectedState !== "All" || selectedPriority !== "All" || selectedStatus !== "All") && (
              <span className="bg-primary-light text-primary border border-primary/10 px-2 py-0.5 rounded font-medium">
                Filters Applied
              </span>
            )}
          </div>

          <div className="space-y-4">
            {filteredProblems.length === 0 ? (
              <div className="text-center py-16 bg-white border border-brandgray-border rounded-md text-brandgray-muted text-sm space-y-2 shadow-subtle">
                <Filter className="h-8 w-8 mx-auto opacity-30 text-brandgray-muted" />
                <p className="font-semibold text-brandgray-text">No matching problems found</p>
                <p className="text-xs max-w-xs mx-auto">{"Try loosening your keyword search or setting filter values back to \"All\"."}</p>
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 h-8">
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredProblems.map((problem) => (
                <Card key={problem.id} className="border-brandgray-border shadow-subtle hover:border-primary/30 transition-all duration-150 bg-white">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                          {problem.category}
                        </span>
                        <h3 className="text-base font-bold text-primary">
                          {problem.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-0.5 rounded font-bold">
                          {problem.matchScore}% Match
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${PRIORITY_BADGES[problem.priority]}`}>
                          {problem.priority} Priority
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-brandgray-text/95 leading-relaxed mb-4">
                      {problem.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-brandgray-border/40">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brandgray-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-brandgray-muted/80" />
                          {problem.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-brandgray-muted/80" />
                          Affected: <span className="font-semibold text-brandgray-text">{problem.affectedPopulation}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${STATUS_BADGES[problem.status]}`}>
                          {problem.status}
                        </span>
                        <Link href={`/university/problems/${problem.id}`}>
                          <Button variant="primary" size="sm" className="h-8 text-xs font-semibold">
                            View Problem
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
