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
  Sparkles, 
  Copy, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem 
} from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES: Record<string, string> = {
  Unassigned: "bg-blue-50 text-blue-700 border-blue-150",
  Interested: "bg-yellow-50 text-yellow-700 border-yellow-250",
  "Under Review": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Active Project": "bg-emerald-50 text-emerald-800 border-emerald-300",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

function AdminProblemsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "All";
  const initialDuplicates = searchParams.get("duplicates") === "true";

  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<CommunityProblem[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(initialDuplicates);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = () => {
    const data = universityMockService.getProblems();
    setProblems(data);
    setFilteredProblems(data);
  };

  useEffect(() => {
    let result = problems;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedStatus !== "All") {
      if (selectedStatus === "Analyzed") {
        result = result.filter((p) => p.status !== "Unassigned");
      } else {
        result = result.filter((p) => p.status === selectedStatus);
      }
    }

    if (selectedPriority !== "All") {
      result = result.filter((p) => p.priority === selectedPriority);
    }

    if (showDuplicatesOnly) {
      result = result.filter((p) => p.matchScore >= 85);
    }

    setFilteredProblems(result);
  }, [searchQuery, selectedCategory, selectedStatus, selectedPriority, showDuplicatesOnly, problems]);

  const categories = ["All", "Water & Sanitation", "Agriculture & Food Tech", "Waste Management", "Renewable Energy", "Education & Social Impact"];
  const priorities = ["All", "High", "Medium", "Low"];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSelectedPriority("All");
    setShowDuplicatesOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h1 className="text-xl font-bold text-primary uppercase tracking-wide">
          CENTRAL PROBLEM MANAGEMENT QUEUE
        </h1>
        <p className="text-xs text-brandgray-muted mt-1 font-medium">
          Filter, validate, and manage community problem reports submitted by citizens.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-brandgray-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
          <input
            type="text"
            placeholder="Search by Problem ID (e.g. prob-1), title, description, or location..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-brandgray-border rounded focus:outline-none focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-brandgray-light/60">
          <div className="flex items-center gap-1.5 text-xs text-brandgray-muted font-bold uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
          </div>

          <select
            className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-medium"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Unassigned">Unassigned (Pending Validation)</option>
            <option value="Interested">Interested (University Matched)</option>
            <option value="Under Review">Under Review (Proposal Active)</option>
            <option value="Active Project">Active Project</option>
            <option value="Rejected">Rejected</option>
          </select>

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
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p === "All" ? "All Priorities" : `${p} Priority`}</option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-brandgray-text cursor-pointer bg-slate-100 px-2.5 py-1.5 rounded border border-slate-200">
            <input 
              type="checkbox" 
              checked={showDuplicatesOnly} 
              onChange={(e) => setShowDuplicatesOnly(e.target.checked)} 
            />
            <span>Potential Duplicates Only (&gt;85%)</span>
          </label>

          {(searchQuery || selectedCategory !== "All" || selectedStatus !== "All" || selectedPriority !== "All" || showDuplicatesOnly) && (
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

      {/* Problems Listing Table / Cards */}
      {filteredProblems.length === 0 ? (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-primary">No Problems Found</p>
            <p className="text-xs text-brandgray-muted">No citizen problem reports match your current search or filter criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProblems.map((problem) => (
            <Card key={problem.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded">
                        {problem.id}
                      </span>
                      <span className="text-xs font-bold text-brandgray-muted uppercase tracking-wider">
                        {problem.category}
                      </span>
                      {problem.matchScore >= 85 && (
                        <span className="text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded">
                          POTENTIAL DUPLICATE RISK ({problem.matchScore}%)
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-primary">{problem.title}</h3>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded border uppercase ${STATUS_BADGES[problem.status] || "bg-slate-100 text-slate-700"}`}>
                    {problem.status}
                  </span>
                </div>

                <p className="text-xs text-brandgray-text leading-relaxed line-clamp-2">
                  {problem.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded border border-slate-150">
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Location</span>
                    <span className="font-semibold text-brandgray-text">{problem.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Reported Date</span>
                    <span className="font-medium text-brandgray-text">{problem.submissionDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">AI Match Score</span>
                    <span className="font-extrabold text-indigo-700">{problem.matchScore}% Match</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Priority</span>
                    <span className="font-bold text-red-700">{problem.priority} Priority</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-brandgray-muted">Submitted by: <span className="font-semibold text-brandgray-text">Citizen Field Report</span></span>
                  <Link href={`/admin/problems/${problem.id}`}>
                    <Button variant="primary" size="sm" className="h-8 text-xs font-bold flex items-center gap-1.5">
                      Review & Validate <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminProblemsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brandgray-muted">Loading Problems Queue...</div>}>
      <AdminProblemsContent />
    </Suspense>
  );
}
