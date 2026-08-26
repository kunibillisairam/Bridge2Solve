"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Layers, 
  FileText, 
  FolderKanban, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Users,
  Copy,
  Check,
  Eye,
  ChevronRight,
  Filter,
  Search
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem, 
  ActivityLog, 
  SolutionProposal, 
  UniversityProject 
} from "@/services/universityMockService";
import { industryService, IndustrySupportRequest } from "@/services/industryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PRIORITY_BADGES = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_BADGES: Record<string, string> = {
  Unassigned: "bg-blue-50 text-blue-700 border-blue-150",
  Interested: "bg-yellow-50 text-yellow-700 border-yellow-250",
  "Under Review": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Active Project": "bg-emerald-50 text-emerald-800 border-emerald-300",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminControlCenterPage() {
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [industryRequests, setIndustryRequests] = useState<IndustrySupportRequest[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Validation Queue Tab state
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "analyzed" | "duplicates" | "approved" | "rejected">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProblems(universityMockService.getProblems());
    setProposals(universityMockService.getAllProposalsForAdmin());
    setProjects(universityMockService.getProjects());
    setIndustryRequests(industryService.getAllSupportRequests());
    setActivities(universityMockService.getActivities());
  };

  // Top-Level Dynamic Platform Statistics
  const totalProblemsCount = problems.length;
  const pendingValidationCount = problems.filter((p) => p.status === "Unassigned").length;
  const aiAnalyzedCount = problems.filter((p) => p.status !== "Unassigned").length;
  const potentialDuplicatesCount = problems.filter((p) => p.matchScore >= 85).length;
  const universityRegistrationsCount = universityMockService.getInterests().length;
  const pendingProposalsCount = proposals.filter((pr) => pr.status === "SUBMITTED" || pr.status === "UNDER_REVIEW").length;
  const activeProjectsCount = projects.filter((pj) => pj.stage !== "COMPLETED").length;
  const pendingIndustryRequestsCount = industryRequests.filter((r) => r.status === "PENDING" || r.status === "UNDER_REVIEW").length;
  const completedProjectsCount = projects.filter((pj) => pj.stage === "COMPLETED").length;

  // Filtered Validation Queue problems
  let queueProblems = problems;
  if (activeTab === "pending") {
    queueProblems = problems.filter((p) => p.status === "Unassigned");
  } else if (activeTab === "analyzed") {
    queueProblems = problems.filter((p) => p.status === "Interested" || p.status === "Under Review");
  } else if (activeTab === "duplicates") {
    queueProblems = problems.filter((p) => p.matchScore >= 85);
  } else if (activeTab === "approved") {
    queueProblems = problems.filter((p) => p.status === "Active Project");
  } else if (activeTab === "rejected") {
    queueProblems = problems.filter((p) => p.status === "Rejected");
  }

  return (
    <div className="space-y-8">
      {/* Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-primary uppercase tracking-wide flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-amber-500" /> ADMINISTRATION CONTROL CENTER
          </h1>
          <p className="text-xs text-brandgray-muted mt-1 font-medium">
            Monitor, validate, approve, and coordinate the complete ProblemBridge lifecycle.
          </p>
        </div>
      </div>

      {/* TOP-LEVEL PLATFORM STATISTICS GRID (9 Dynamic Responsive Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[
          { label: "Total Problems", value: totalProblemsCount, href: "/admin/problems", icon: Layers, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Pending Validation", value: pendingValidationCount, href: "/admin/problems?status=Unassigned", icon: Clock, color: "bg-amber-50 text-amber-800 border-amber-250" },
          { label: "AI Analyzed", value: aiAnalyzedCount, href: "/admin/problems?status=Analyzed", icon: Sparkles, color: "bg-purple-50 text-purple-800 border-purple-200" },
          { label: "Potential Duplicates", value: potentialDuplicatesCount, href: "/admin/problems?duplicates=true", icon: Copy, color: "bg-rose-50 text-rose-800 border-rose-200" },
          { label: "Univ Registrations", value: universityRegistrationsCount, href: "/admin/problems", icon: Users, color: "bg-emerald-50 text-emerald-800 border-emerald-250" },
          { label: "Pending Proposals", value: pendingProposalsCount, href: "/admin/proposals", icon: FileText, color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
          { label: "Active Projects", value: activeProjectsCount, href: "/admin/projects", icon: FolderKanban, color: "bg-primary-light text-primary border-primary/20" },
          { label: "Industry Requests", value: pendingIndustryRequestsCount, href: "/admin/industry-support", icon: Building2, color: "bg-amber-50 text-amber-900 border-amber-300" },
          { label: "Completed Projects", value: completedProjectsCount, href: "/admin/projects?stage=COMPLETED", icon: CheckCircle2, color: "bg-slate-100 text-slate-800 border-slate-300" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href} className="block group">
              <Card className={`border shadow-subtle hover:border-primary transition-all bg-white flex flex-col justify-between h-full`}>
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`h-7 w-7 rounded flex items-center justify-center border text-xs ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-brandgray-muted group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-primary block leading-none">
                      {stat.value}
                    </span>
                    <span className="text-[11px] font-bold text-brandgray-text mt-1 block truncate">
                      {stat.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ACTION REQUIRED QUEUE (High Priority Section) */}
      <Card className="border-amber-300 bg-amber-50/40 shadow-subtle">
        <CardHeader className="p-4 border-b border-amber-200/80 bg-amber-100/40 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Action Required Queue
          </CardTitle>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded">
            Immediate Admin Tasks
          </span>
        </CardHeader>
        <CardContent className="p-4 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                title: "Validation Needed",
                desc: `${pendingValidationCount} problem reports awaiting initial validation`,
                count: pendingValidationCount,
                href: "/admin/problems?status=Unassigned",
                badge: "HIGH PRIORITY",
                badgeColor: "bg-red-100 text-red-800 border-red-300",
              },
              {
                title: "Potential Duplicates",
                desc: `${potentialDuplicatesCount} reports with >85% match similarity`,
                count: potentialDuplicatesCount,
                href: "/admin/problems?duplicates=true",
                badge: "REVIEW NEEDED",
                badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
              },
              {
                title: "Proposals Pending",
                desc: `${pendingProposalsCount} academic research proposals awaiting decision`,
                count: pendingProposalsCount,
                href: "/admin/proposals",
                badge: "DECISION NEEDED",
                badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
              },
              {
                title: "Industry CSR Requests",
                desc: `${pendingIndustryRequestsCount} support requests awaiting approval`,
                count: pendingIndustryRequestsCount,
                href: "/admin/industry-support",
                badge: "APPROVAL NEEDED",
                badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded border border-amber-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9.5px] font-extrabold px-2 py-0.5 border rounded uppercase ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-base font-extrabold text-primary">{item.count}</span>
                  </div>
                  <h4 className="text-xs font-bold text-primary">{item.title}</h4>
                  <p className="text-[11px] text-brandgray-muted leading-tight">{item.desc}</p>
                </div>
                <Link href={item.href}>
                  <Button variant="primary" size="sm" className="w-full h-7 text-[11px] font-bold">
                    Review Queue
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PROBLEM VALIDATION QUEUE SECTION */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-brandgray-border/60 pb-3 gap-2">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Problem Validation Queue
          </h3>
          <Link href="/admin/problems" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All Problems <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Validation Filter Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-brandgray-border text-xs">
          {[
            { key: "all", label: `All (${problems.length})` },
            { key: "pending", label: `Pending Validation (${pendingValidationCount})` },
            { key: "analyzed", label: `AI Analyzed (${aiAnalyzedCount})` },
            { key: "duplicates", label: `Potential Duplicates (${potentialDuplicatesCount})` },
            { key: "approved", label: `Approved Projects (${projects.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`py-2 px-3 font-bold border-b-2 transition-all text-xs ${
                activeTab === t.key
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-brandgray-muted hover:text-brandgray-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Queue Cards */}
        {queueProblems.length === 0 ? (
          <Card className="border-brandgray-border bg-white">
            <CardContent className="p-8 text-center text-xs text-brandgray-muted">
              No problems found in this queue tab.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queueProblems.slice(0, 4).map((problem) => (
              <Card key={problem.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                          {problem.id}
                        </span>
                        <span className="text-[10px] font-bold text-brandgray-muted uppercase">
                          {problem.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-primary">{problem.title}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${STATUS_BADGES[problem.status] || "bg-slate-100 text-slate-700"}`}>
                      {problem.status}
                    </span>
                  </div>

                  <p className="text-xs text-brandgray-text line-clamp-2 leading-relaxed">{problem.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-150">
                    <div>
                      <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block">AI Score</span>
                      <span className="font-extrabold text-indigo-700">{problem.matchScore}% Match</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block">AI Priority</span>
                      <span className="font-bold text-red-700">{problem.priority}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block">Duplicate Risk</span>
                      <span className={`font-bold ${problem.matchScore >= 85 ? "text-amber-700" : "text-emerald-700"}`}>
                        {problem.matchScore >= 85 ? "MEDIUM/HIGH" : "LOW"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-brandgray-border/40 text-xs">
                    <span className="text-brandgray-muted text-[11px]">{problem.location}</span>
                    <Link href={`/admin/problems/${problem.id}`}>
                      <Button variant="primary" size="sm" className="h-8 text-xs font-bold">
                        Review Problem
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* THREE INTEGRATED LIFECYCLE PIPELINES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. UNIVERSITY PROPOSAL PIPELINE SUMMARY */}
        <Card className="border-purple-200 bg-white shadow-subtle">
          <CardHeader className="p-4 border-b border-purple-100 bg-purple-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-purple-700" /> Proposal Pipeline
            </CardTitle>
            <Link href="/admin/proposals">
              <span className="text-[10px] font-bold text-purple-800 hover:underline">View All →</span>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-purple-50/40 rounded border border-purple-100">
                <span className="font-medium text-brandgray-text">Pending Reviews</span>
                <span className="font-bold text-purple-900">{pendingProposalsCount}</span>
              </div>
              <div className="flex justify-between p-2 bg-emerald-50/40 rounded border border-emerald-100">
                <span className="font-medium text-brandgray-text">Accepted Proposals</span>
                <span className="font-bold text-emerald-900">{proposals.filter((p) => p.status === "ACCEPTED").length}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-150">
                <span className="font-medium text-brandgray-text">Projects Created</span>
                <span className="font-bold text-primary">{projects.length}</span>
              </div>
            </div>
            <Link href="/admin/proposals" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold border-purple-200 text-purple-900 hover:bg-purple-50">
                Open Proposal Review
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 2. INDUSTRY / CSR PARTNERSHIP PIPELINE SUMMARY */}
        <Card className="border-indigo-200 bg-white shadow-subtle">
          <CardHeader className="p-4 border-b border-indigo-100 bg-indigo-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-700" /> Industry CSR Pipeline
            </CardTitle>
            <Link href="/admin/industry-support">
              <span className="text-[10px] font-bold text-indigo-800 hover:underline">View All →</span>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-amber-50/40 rounded border border-amber-100">
                <span className="font-medium text-brandgray-text">Pending Support Requests</span>
                <span className="font-bold text-amber-900">{pendingIndustryRequestsCount}</span>
              </div>
              <div className="flex justify-between p-2 bg-emerald-50/40 rounded border border-emerald-100">
                <span className="font-medium text-brandgray-text">Accepted CSR Partnerships</span>
                <span className="font-bold text-emerald-900">{industryRequests.filter((r) => r.status === "ACCEPTED").length}</span>
              </div>
              <div className="flex justify-between p-2 bg-indigo-50/40 rounded border border-indigo-100">
                <span className="font-medium text-brandgray-text">Total Requests Received</span>
                <span className="font-bold text-indigo-900">{industryRequests.length}</span>
              </div>
            </div>
            <Link href="/admin/industry-support" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold border-indigo-200 text-indigo-900 hover:bg-indigo-50">
                Review Support Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 3. PROJECT MONITORING SUMMARY */}
        <Card className="border-emerald-200 bg-white shadow-subtle">
          <CardHeader className="p-4 border-b border-emerald-100 bg-emerald-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="h-4 w-4 text-emerald-700" /> Project Execution
            </CardTitle>
            <Link href="/admin/projects">
              <span className="text-[10px] font-bold text-emerald-800 hover:underline">View All →</span>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-emerald-50/40 rounded border border-emerald-100">
                <span className="font-medium text-brandgray-text">Active Implementation</span>
                <span className="font-bold text-emerald-900">{activeProjectsCount}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-150">
                <span className="font-medium text-brandgray-text">Completed Projects</span>
                <span className="font-bold text-slate-800">{completedProjectsCount}</span>
              </div>
              <div className="flex justify-between p-2 bg-primary-light/40 rounded border border-primary/10">
                <span className="font-medium text-brandgray-text">Total Projects Managed</span>
                <span className="font-bold text-primary">{projects.length}</span>
              </div>
            </div>
            <Link href="/admin/projects" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold border-emerald-200 text-emerald-900 hover:bg-emerald-50">
                Open Projects Control
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* RECENT PLATFORM ACTIVITY STREAM */}
      <Card className="border-brandgray-border bg-white shadow-subtle">
        <CardHeader className="p-4 border-b border-brandgray-border/60 flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Recent Platform Activity Stream
          </CardTitle>
          <span className="text-[10px] text-brandgray-muted font-medium">Real-time system events</span>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-xs text-brandgray-muted">No activity events recorded yet.</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-2.5 rounded bg-slate-50 border border-slate-150 text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-brandgray-text font-medium">{act.text}</p>
                    <span className="text-[10px] text-brandgray-muted block">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
