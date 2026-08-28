"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Users, 
  Filter, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem 
} from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/context/AuthContext";

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
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const { user } = useAuth();
  const universityId = user?.profile?.universityDetails?.id || "univ-1";

  const [activeTab, setActiveTab] = useState<"all" | "recommended" | "my_problems">(
    initialTab === "recommended" ? "recommended" : initialTab === "my_problems" ? "my_problems" : "all"
  );

  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<CommunityProblem[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

  useEffect(() => {
    if (user) {
      if (user.profile?.universityDetails) {
        universityMockService.registerCustomUniversity(user.profile.universityDetails, user.profile);
      }
      loadProblemsData(user.profile?.universityDetails?.id || "univ-1");
    }
  }, [user, activeTab]);

  const loadProblemsData = (univId: string) => {
    const all = universityMockService.getProblems(univId);
    const unregistered = universityMockService.getUnregisteredRecommendedProblems(univId);
    const registered = universityMockService.getRegisteredProblemsForUniversity(univId).map((r) => r.problem);

    if (activeTab === "recommended") {
      setProblems(unregistered);
      setFilteredProblems(unregistered);
    } else if (activeTab === "my_problems") {
      setProblems(registered);
      setFilteredProblems(registered);
    } else {
      setProblems(all);
      setFilteredProblems(all);
    }
  };

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

    setFilteredProblems(result);
  }, [searchQuery, selectedCategory, selectedState, selectedPriority, problems]);

  const categories = ["All", "Water & Sanitation", "Agriculture & Food Tech", "Waste Management", "Renewable Energy", "Education & Social Impact"];
  const states = ["All", "Jharkhand", "Punjab", "Maharashtra", "Bihar", "Odisha", "Kerala"];
  const priorities = ["All", "High", "Medium", "Low"];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedState("All");
    setSelectedPriority("All");
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h2 className="text-xl font-bold text-primary">Community Problems Discovery</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Explore validated community issues requiring academic research and engineering solutions.
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
          All Problems ({universityMockService.getProblems(universityId).length})
        </button>
        <button
          onClick={() => setActiveTab("recommended")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "recommended"
              ? "border-primary text-primary"
              : "border-transparent text-brandgray-muted hover:text-brandgray-text"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Recommended ({universityMockService.getUnregisteredRecommendedProblems(universityId).length})
        </button>
        <button
          onClick={() => setActiveTab("my_problems")}
          className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "my_problems"
              ? "border-primary text-primary"
              : "border-transparent text-brandgray-muted hover:text-brandgray-text"
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-primary" /> My Registered Problems ({universityMockService.getRegisteredProblemsForUniversity(universityId).length})
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-brandgray-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
          <input
            type="text"
            placeholder="Search problems by title, description, or location..."
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

          <select
            className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-medium"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p === "All" ? "All Priorities" : `${p} Priority`}</option>
            ))}
          </select>

          {(searchQuery || selectedCategory !== "All" || selectedState !== "All" || selectedPriority !== "All") && (
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

      {/* Problems Listing */}
      {filteredProblems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-brandgray-border p-6 space-y-3 shadow-subtle max-w-2xl mx-auto">
          <p className="text-sm font-bold text-primary">
            {activeTab === "recommended" 
              ? "No problems matched to your university yet." 
              : activeTab === "my_problems" 
              ? "No problems registered yet." 
              : "No Problems Found"}
          </p>
          <p className="text-xs text-brandgray-muted leading-relaxed">
            {activeTab === "recommended"
              ? "Validated community problems relevant to your academic profile will appear here."
              : activeTab === "my_problems"
              ? "Express interest in a relevant community problem to start a project."
              : "No community problems match your active search combination."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProblems.map((problem) => {
            const interest = universityMockService.getInterestForProblem(problem.id, universityId);
            const isRegistered = !!interest && interest.status !== "WITHDRAWN";
            const rec = universityMockService.getRecommendationForUniversity(problem.id, universityId);
            const matchScore = rec ? rec.score : problem.matchScore;

            return (
              <Card key={problem.id} className="border-brandgray-border shadow-subtle hover:border-primary/30 transition-all bg-white flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                          {problem.category}
                        </span>
                        {isRegistered && (
                          <span className="text-[9.5px] font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                            ✓ REGISTERED
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-primary">{problem.title}</h4>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded font-bold shrink-0">
                      {matchScore}% Match
                    </span>
                  </div>

                  <p className="text-xs text-brandgray-text leading-relaxed line-clamp-2">
                    {problem.description}
                  </p>

                  {rec && (
                    <div className="text-[11px] text-indigo-955 bg-indigo-50/40 p-2.5 rounded border border-indigo-150/60 space-y-0.5">
                      <span className="font-bold uppercase text-[9.5px] block text-indigo-900">Why this matches:</span>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-slate-700">
                        {rec.reasons.slice(0, 3).map((reason, idx) => (
                          <span key={idx} className="flex items-center gap-1 font-medium text-[10.5px]">
                            <span className="text-emerald-600 font-extrabold">✓</span> {reason.replace("✓ ", "")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brandgray-border/40 text-xs">
                    <span className="flex items-center gap-1 text-brandgray-muted">
                      <MapPin className="h-3.5 w-3.5" /> {problem.location}
                    </span>

                    <Link href={`/university/problems/${problem.id}`}>
                      <Button variant={isRegistered ? "outline" : "primary"} size="sm" className="h-8 text-xs font-semibold">
                        {isRegistered ? "View Problem" : "View Details & Apply"}
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
