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
  Search,
  Award,
  Bell
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem, 
  ActivityLog, 
  SolutionProposal, 
  UniversityProject,
  getProjectHealth
} from "@/services/universityMockService";
import { industryService, IndustrySupportRequest } from "@/services/industryService";
import { findSimilarProblems } from "@/services/duplicateDetectionService";
import { notificationService, NotificationItem, formatRelativeTime } from "@/services/notificationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

  // Resolve projects for monitoring
  const resolvedProjects = projects.map(pj => universityMockService.resolveProject(pj)).filter(Boolean) as any[];

  // 1. PROBLEMS METRICS
  const totalProblemsCount = problems.length;
  const pendingValidationCount = problems.filter((p) => p.status === "Unassigned").length;
  const aiAnalyzedCount = problems.filter((p) => p.status !== "Unassigned" && p.status !== "Rejected").length;
  const potentialDuplicatesCount = problems.filter((p) => {
    const candidates = findSimilarProblems(p, problems, (id) => universityMockService.getProblemAnalysis(id));
    return candidates.length > 0;
  }).length;
  const verifiedProblemsCount = problems.filter((p) => ["Interested", "Under Review", "Active Project"].includes(p.status)).length;
  const rejectedProblemsCount = problems.filter((p) => p.status === "Rejected").length;

  // 2. UNIVERSITIES PIPELINE METRICS
  const registeredInterestsCount = universityMockService.getInterests().length;
  const awaitingTeamAssignmentCount = problems.filter((p) => p.status === "Interested").length;
  const proposalsUnderReviewCount = proposals.filter((pr) => pr.status === "SUBMITTED" || pr.status === "UNDER_REVIEW").length;
  const approvedProposalsCount = proposals.filter((pr) => pr.status === "ACCEPTED").length;

  // 3. PROJECTS METRICS
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter((pj) => !["COMPLETED", "AWAITING_ADMIN_VERIFICATION"].includes(pj.stage)).length;
  const projectsPendingActionCount = projects.filter((pj) => 
    ["PROBLEM_REPORTED", "VALIDATED", "UNIVERSITY_MATCHED", "TEAM_FORMED", "PROPOSAL_SUBMITTED"].includes(pj.stage)
  ).length;
  const delayedProjectsCount = resolvedProjects.filter((pj) => getProjectHealth(pj) === "DELAYED").length;
  const projectsAwaitingVerificationCount = projects.filter((pj) => pj.stage === "AWAITING_ADMIN_VERIFICATION").length;
  const completedProjectsCount = projects.filter((pj) => pj.stage === "COMPLETED").length;

  // 4. INDUSTRY / CSR METRICS
  const pendingIndustryRequestsCount = industryRequests.filter((r) => r.status === "PENDING").length;
  const industryUnderReviewCount = industryRequests.filter((r) => r.status === "UNDER_REVIEW").length;
  const acceptedIndustryRequestsCount = industryRequests.filter((r) => r.status === "ACCEPTED").length;
  const activePartnershipsCount = industryRequests.filter((r) => r.status === "ACCEPTED").length;

  // Filtered Validation Queue problems
  let queueProblems = problems;
  if (activeTab === "pending") {
    queueProblems = problems.filter((p) => p.status === "Unassigned");
  } else if (activeTab === "analyzed") {
    queueProblems = problems.filter((p) => p.status !== "Unassigned" && p.status !== "Rejected");
  } else if (activeTab === "duplicates") {
    queueProblems = problems.filter((p) => {
      const candidates = findSimilarProblems(p, problems, (id) => universityMockService.getProblemAnalysis(id));
      return candidates.length > 0;
    });
  } else if (activeTab === "approved") {
    queueProblems = problems.filter((p) => p.status === "Active Project");
  } else if (activeTab === "rejected") {
    queueProblems = problems.filter((p) => p.status === "Rejected");
  }

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div>
          <h1 className="text-xl font-bold text-primary uppercase tracking-wide flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-amber-500 shrink-0" /> ADMIN VALIDATION DASHBOARD & CONTROL CENTER
          </h1>
          <p className="text-xs text-brandgray-muted mt-1 font-medium">
            Monitor, validate, approve, coordinate, and verify completion across the complete ProblemBridge ecosystem.
          </p>
        </div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
            onClick={() => {
              if (confirm("Are you sure you want to reset all mock demonstration data in your browser? This will restore original seeded problems, projects, and matching configurations.")) {
                universityMockService.resetDemoData();
              }
            }}
          >
            Reset Browser Demo Data
          </Button>
        </div>
      </div>

      {/* DOMAIN 1: PROBLEM MANAGEMENT STATISTICS */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
          PROBLEM MANAGEMENT
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Problems", value: totalProblemsCount, href: "/admin/problems", color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Pending Validation", value: pendingValidationCount, href: "/admin/problems?status=Unassigned", color: "bg-amber-50 text-amber-800 border-amber-300" },
            { label: "AI Analyzed", value: aiAnalyzedCount, href: "/admin/problems?status=Analyzed", color: "bg-purple-50 text-purple-800 border-purple-200" },
            { label: "Potential Duplicates", value: potentialDuplicatesCount, href: "/admin/problems?duplicates=true", color: "bg-rose-50 text-rose-800 border-rose-200" },
            { label: "Verified Problems", value: verifiedProblemsCount, href: "/admin/problems", color: "bg-emerald-50 text-emerald-800 border-emerald-250" },
            { label: "Rejected Problems", value: rejectedProblemsCount, href: "/admin/problems?status=Rejected", color: "bg-slate-100 text-slate-700 border-slate-300" },
          ].map((stat, i) => (
            <Link key={i} href={stat.href} className="block group">
              <Card className="border border-brandgray-border shadow-subtle hover:border-primary transition-all bg-white p-3 space-y-1">
                <span className="text-xl font-extrabold text-primary block leading-none">{stat.value}</span>
                <span className="text-[11px] font-bold text-brandgray-text block truncate">{stat.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* DOMAIN 2: UNIVERSITY PIPELINE STATISTICS */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider block">
          UNIVERSITY PIPELINE
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Registered Interests", value: registeredInterestsCount, href: "/admin/problems" },
            { label: "Awaiting Team Assignment", value: awaitingTeamAssignmentCount, href: "/admin/problems" },
            { label: "Proposals Under Review", value: proposalsUnderReviewCount, href: "/admin/proposals" },
            { label: "Approved Proposals", value: approvedProposalsCount, href: "/admin/proposals" },
          ].map((stat, i) => (
            <Link key={i} href={stat.href} className="block group">
              <Card className="border border-purple-150 shadow-subtle hover:border-purple-600 transition-all bg-purple-50/30 p-3 space-y-1">
                <span className="text-xl font-extrabold text-purple-900 block leading-none">{stat.value}</span>
                <span className="text-[11px] font-bold text-purple-950 block truncate">{stat.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* DOMAIN 3: PROJECT MANAGEMENT & VERIFICATION STATISTICS */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
          PROJECT MANAGEMENT & GOVERNMENT VERIFICATION
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Projects", value: totalProjectsCount, href: "/admin/projects" },
            { label: "Active Projects", value: activeProjectsCount, href: "/admin/projects?stage=Active" },
            { label: "Pending Action", value: projectsPendingActionCount, href: "/admin/projects" },
            { label: "Delayed Projects", value: delayedProjectsCount, href: "/admin/projects?stage=Delayed" },
            { label: "Awaiting Verification", value: projectsAwaitingVerificationCount, href: "/admin/projects?stage=AWAITING_ADMIN_VERIFICATION", highlight: true },
            { label: "Completed Projects", value: completedProjectsCount, href: "/admin/projects?stage=COMPLETED" },
          ].map((stat, i) => (
            <Link key={i} href={stat.href} className="block group">
              <Card className={`border shadow-subtle hover:border-emerald-600 transition-all p-3 space-y-1 ${stat.highlight ? "bg-amber-100/75 border-amber-300 ring-1 ring-amber-400" : "bg-emerald-50/30 border-emerald-150"}`}>
                <span className={`text-xl font-extrabold block leading-none ${stat.highlight ? "text-amber-950" : "text-emerald-950"}`}>{stat.value}</span>
                <span className={`text-[11px] font-bold block truncate ${stat.highlight ? "text-amber-950 font-extrabold" : "text-emerald-950"}`}>{stat.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* DOMAIN 4: INDUSTRY / CSR STATISTICS */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider block">
          INDUSTRY / CSR PARTNERSHIPS
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending Support Requests", value: pendingIndustryRequestsCount, href: "/admin/industry-support" },
            { label: "Under Review", value: industryUnderReviewCount, href: "/admin/industry-support" },
            { label: "Accepted Support Requests", value: acceptedIndustryRequestsCount, href: "/admin/industry-support" },
            { label: "Active Partnerships", value: activePartnershipsCount, href: "/admin/industry-support" },
          ].map((stat, i) => (
            <Link key={i} href={stat.href} className="block group">
              <Card className="border border-indigo-150 shadow-subtle hover:border-indigo-600 transition-all bg-indigo-50/30 p-3 space-y-1">
                <span className="text-xl font-extrabold text-indigo-900 block leading-none">{stat.value}</span>
                <span className="text-[11px] font-bold text-indigo-950 block truncate">{stat.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ACTION REQUIRED QUEUE (High Priority Section) */}
      <Card className="border-amber-300 bg-amber-50/40 shadow-subtle">
        <CardHeader className="p-4 border-b border-amber-250 bg-amber-100/40 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" /> Action Required Queue
          </CardTitle>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded">
            Immediate Platform Tasks
          </span>
        </CardHeader>
        <CardContent className="p-4 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                title: "Validation Needed",
                desc: `${pendingValidationCount} problem reports awaiting validation`,
                count: pendingValidationCount,
                href: "/admin/problems?status=Unassigned",
                badge: "HIGH PRIORITY",
                badgeColor: "bg-red-100 text-red-800 border-red-300",
              },
              {
                title: "Potential Duplicates",
                desc: `${potentialDuplicatesCount} clusters awaiting duplication review`,
                count: potentialDuplicatesCount,
                href: "/admin/problems?duplicates=true",
                badge: "REVIEW NEEDED",
                badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
              },
              {
                title: "Proposals Pending",
                desc: `${proposalsUnderReviewCount} research proposals awaiting decision`,
                count: proposalsUnderReviewCount,
                href: "/admin/proposals",
                badge: "DECISION NEEDED",
                badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
              },
              {
                title: "CSR Requests",
                desc: `${pendingIndustryRequestsCount} support requests awaiting approval`,
                count: pendingIndustryRequestsCount,
                href: "/admin/industry-support",
                badge: "APPROVAL NEEDED",
                badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
              },
              {
                title: "Overdue Milestones",
                desc: `${delayedProjectsCount} projects with overdue milestones`,
                count: delayedProjectsCount,
                href: "/admin/projects?stage=Delayed",
                badge: "DELAYED",
                badgeColor: "bg-red-50 text-red-700 border-red-200 font-extrabold",
              },
              {
                title: "Awaiting Verification",
                desc: `${projectsAwaitingVerificationCount} projects awaiting completion sign-off`,
                count: projectsAwaitingVerificationCount,
                href: "/admin/projects?stage=AWAITING_ADMIN_VERIFICATION",
                badge: "VERIFICATION",
                badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded border border-amber-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded uppercase ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-base font-extrabold text-primary">{item.count}</span>
                  </div>
                  <h4 className="text-xs font-bold text-primary">{item.title}</h4>
                  <p className="text-[10px] text-brandgray-muted leading-tight">{item.desc}</p>
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
            { key: "approved", label: `Active Projects (${projects.length})` },
            { key: "rejected", label: `Rejected (${rejectedProblemsCount})` },
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
            <CardContent className="p-8 text-center space-y-3 max-w-xl mx-auto">
              <Layers className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-primary">
                {activeTab === "pending" 
                  ? "No Submissions Awaiting Action" 
                  : activeTab === "approved" 
                  ? "No Active Collaborations" 
                  : activeTab === "analyzed"
                  ? "No AI Analyzed Submissions"
                  : activeTab === "duplicates"
                  ? "No Potential Duplicates"
                  : activeTab === "rejected"
                  ? "No Rejected Submissions"
                  : "No Problems Found"}
              </p>
              <p className="text-xs text-brandgray-muted leading-relaxed">
                {activeTab === "pending"
                  ? "There are currently no community issues reported by citizens awaiting administrative validation or AI analysis verification."
                  : activeTab === "approved"
                  ? "There are no community challenges that have active research teams or CSR partners assigned to them."
                  : activeTab === "analyzed"
                  ? "There are no community challenges with completed AI analysis waiting for team assignment."
                  : activeTab === "duplicates"
                  ? "No localized reports have been clustered as duplicate citizen entries at this time."
                  : activeTab === "rejected"
                  ? "No community problems have been rejected by the platform administrators."
                  : "There are no community problems matching the current filters in the registry."}
              </p>
              <p className="text-[11px] font-bold text-primary">
                {activeTab === "pending"
                  ? "What next: You are all caught up. Check back later when citizens report new localized issues."
                  : activeTab === "approved"
                  ? "What next: Visit the proposals review dashboard to approve pending university drafts and launch projects."
                  : activeTab === "analyzed"
                  ? "What next: Guide universities to search for problems and express interest."
                  : activeTab === "duplicates"
                  ? "What next: All reports are verified as unique. No duplicate verification is required."
                  : activeTab === "rejected"
                  ? "What next: Keep validating submitted problems. Incorrect or duplicate entries will appear here when rejected."
                  : "What next: Try selecting a different filter tab or checking other workflow sections."}
              </p>
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
                      <span className={`font-bold ${problem.matchScore >= 80 ? "text-red-700" : problem.matchScore >= 60 ? "text-amber-700" : "text-emerald-700"}`}>
                        {problem.matchScore >= 80 ? "HIGH" : problem.matchScore >= 60 ? "MEDIUM" : "LOW"}
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

      {/* RECENT ADMIN NOTIFICATIONS & ACTION STREAM */}
      <Card className="border-brandgray-border bg-white shadow-subtle">
        <CardHeader className="p-4 border-b border-brandgray-border/60 flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500 shrink-0" /> Recent Administrative Notifications & Alerts
          </CardTitle>
          <Link href="/notifications" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Open Action Center <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {(() => {
            const adminNotifs = notificationService.getNotificationsForUser("admin-1", "ADMIN").slice(0, 4);
            if (adminNotifs.length === 0) {
              return <div className="text-center py-6 text-xs text-brandgray-muted">No notifications recorded yet.</div>;
            }
            return (
              <div className="space-y-2">
                {adminNotifs.map((n) => (
                  <div key={n.id} className="flex flex-wrap items-center justify-between p-3 rounded bg-slate-50 border border-slate-200 text-xs gap-2">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded uppercase ${
                          n.priority === "HIGH" ? "bg-red-50 text-red-800 border-red-300" : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}>
                          {n.priority}
                        </span>
                        <span className="font-bold text-primary">{n.title}</span>
                      </div>
                      <p className="text-[11px] text-brandgray-text line-clamp-1">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-brandgray-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatRelativeTime(n.createdAt)}
                      </span>
                      <Link href={n.actionUrl}>
                        <Button variant="outline" size="sm" className="h-6 text-[10.5px] font-bold">
                          {n.isActionRequired ? "Take Action" : "View"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* RECENT PLATFORM ACTIVITY STREAM */}
      <Card className="border-brandgray-border bg-white shadow-subtle">
        <CardHeader className="p-4 border-b border-brandgray-border/60 flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary shrink-0" /> Recent Platform Activity Stream
          </CardTitle>
          <span className="text-[10px] text-brandgray-muted font-medium">Real-time system events</span>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-6 space-y-2 max-w-md mx-auto">
              <p className="text-xs font-bold text-primary">No Activity Events Found</p>
              <p className="text-[11px] text-brandgray-muted leading-relaxed">
                There are no recent workflow actions, state changes, or user engagements logged in the system activity log.
              </p>
              <p className="text-[10px] font-semibold text-primary">
                What next: Actions like validating problems, submitting proposals, and updating milestones will automatically record events here.
              </p>
            </div>
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
