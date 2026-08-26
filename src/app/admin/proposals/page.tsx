"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Layers, 
  Search, 
  Eye, 
  Briefcase, 
  Users, 
  Calendar,
  Building,
  GraduationCap,
  ArrowRight
} from "lucide-react";
import { 
  universityMockService, 
  ResolvedProposal, 
  ProposalStatus 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES: Record<ProposalStatus, string> = {
  DRAFT: "bg-slate-50 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-150",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-250",
  ACCEPTED: "bg-success-light text-success border-success/15",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<ResolvedProposal[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [metrics, setMetrics] = useState({
    pendingCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    projectsCreatedCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const rawProposals = universityMockService.getAllProposalsForAdmin();
    // Exclude drafts from Admin review board unless specifically needed
    const nonDrafts = rawProposals.filter((p) => p.status !== "DRAFT");
    const resolved = nonDrafts.map((p) => universityMockService.resolveProposal(p));
    
    setProposals(resolved);
    setMetrics(universityMockService.getAdminProposalMetrics());
  };

  const filteredProposals = proposals.filter((p) => {
    // Status Filter
    if (filter === "UNDER_REVIEW") {
      if (p.status !== "SUBMITTED" && p.status !== "UNDER_REVIEW") return false;
    } else if (filter === "ACCEPTED") {
      if (p.status !== "ACCEPTED") return false;
    } else if (filter === "REJECTED") {
      if (p.status !== "REJECTED") return false;
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(q);
      const idMatch = p.id.toLowerCase().includes(q);
      const probMatch = p.problem?.title.toLowerCase().includes(q) || false;
      const teamMatch = p.team?.name.toLowerCase().includes(q) || false;
      return titleMatch || idMatch || probMatch || teamMatch;
    }

    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded">
              Administration Portal
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary mt-1">
            Admin Proposal Review
          </h1>
          <p className="text-xs text-brandgray-muted mt-0.5">
            Evaluate submitted university research proposals, approve project endorsements, or request clarifications.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold text-brandgray-muted uppercase block">Pending Reviews</span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{metrics.pendingCount}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold text-brandgray-muted uppercase block">Accepted Proposals</span>
              <span className="text-2xl font-extrabold text-success mt-1 block">{metrics.acceptedCount}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-success-light text-success border border-success/15 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold text-brandgray-muted uppercase block">Rejected Proposals</span>
              <span className="text-2xl font-extrabold text-red-700 mt-1 block">{metrics.rejectedCount}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold text-brandgray-muted uppercase block">Projects Created</span>
              <span className="text-2xl font-extrabold text-primary mt-1 block">{metrics.projectsCreatedCount}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-light text-primary border border-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-brandgray-border rounded-md shadow-subtle">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "All Proposals" },
            { key: "UNDER_REVIEW", label: `Under Review (${metrics.pendingCount})` },
            { key: "ACCEPTED", label: `Accepted (${metrics.acceptedCount})` },
            { key: "REJECTED", label: `Rejected (${metrics.rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? "bg-primary text-white"
                  : "bg-brandgray-light/60 text-brandgray-text hover:bg-brandgray-light"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-brandgray-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposal ID, title, problem..."
            className="w-full bg-brandgray-light/30 border border-brandgray-border rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
          />
        </div>

      </div>

      {/* Proposals Deck */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-16 bg-white border border-brandgray-border rounded-md text-brandgray-muted text-sm space-y-2 shadow-subtle">
          <FileText className="h-8 w-8 mx-auto opacity-30 text-brandgray-muted" />
          <p className="font-semibold text-brandgray-text">No proposals match the filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProposals.map((proposal) => {
            const isPendingAction = proposal.status === "SUBMITTED" || proposal.status === "UNDER_REVIEW";

            return (
              <Card key={proposal.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/20 transition-all duration-150">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold text-brandgray-muted tracking-wider uppercase">
                        {proposal.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGES[proposal.status]}`}>
                        {proposal.status === "SUBMITTED" ? "Submitted for Review" : proposal.status}
                      </span>
                      <span className="text-[10px] text-brandgray-muted flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Submitted: {proposal.submittedAt || proposal.createdAt}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-primary">
                      {proposal.title}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-brandgray-muted pt-1">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Problem: <strong className="text-brandgray-text">{proposal.problem ? proposal.problem.title : "Community Challenge"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">University: <strong className="text-brandgray-text">Indian Institute of Science</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Team: <strong className="text-brandgray-text">{proposal.team ? proposal.team.name : "Research Taskforce"}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link href={`/admin/proposals/${proposal.id}`}>
                      <Button 
                        variant={isPendingAction ? "primary" : "outline"}
                        size="sm" 
                        className="h-9 font-semibold text-xs flex items-center gap-1.5 px-4"
                      >
                        <Eye className="h-3.5 w-3.5" /> {isPendingAction ? "Review Proposal" : "View Details"}
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
