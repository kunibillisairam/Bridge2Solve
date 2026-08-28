"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  MapPin, 
  GraduationCap, 
  Building2, 
  DollarSign, 
  Award, 
  ArrowRight,
  TrendingUp,
  Activity,
  FileText,
  Search,
  BookOpen
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem, 
  SolutionProposal, 
  UniversityProject, 
  ActivityLog, 
  getProjectHealth 
} from "@/services/universityMockService";
import { industryService, IndustrySupportRequest } from "@/services/industryService";
import { impactService, ImpactAssessment } from "@/services/impactService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminImpactDashboard() {
  const [mounted, setMounted] = useState(false);
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [industryRequests, setIndustryRequests] = useState<IndustrySupportRequest[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [assessments, setAssessments] = useState<ImpactAssessment[]>([]);

  useEffect(() => {
    setMounted(true);
    setProblems(universityMockService.getProblems());
    setProposals(universityMockService.getAllProposalsForAdmin());
    setProjects(universityMockService.getProjects());
    setIndustryRequests(industryService.getAllSupportRequests());
    setActivities(universityMockService.getActivities());
    setAssessments(impactService.getAssessments());
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 1. CALCULATE KPI VALUES
  const totalProblems = problems.length;
  const verifiedProblems = problems.filter((p) => p.status !== "Unassigned" && p.status !== "Rejected").length;
  const activeProjects = projects.filter((p) => !["COMPLETED", "AWAITING_ADMIN_VERIFICATION"].includes(p.stage)).length;
  const completedProjectsCount = projects.filter((p) => p.stage === "COMPLETED").length;
  const projectsAwaitingVerification = projects.filter((p) => p.stage === "AWAITING_ADMIN_VERIFICATION").length;

  // Impact outcomes summing (only submitted / verified)
  let peopleBenefited = 0;
  let villagesCovered = 0;
  let schoolsReached = 0;
  let farmersSupported = 0;

  assessments.forEach((a) => {
    if (a.status === "VERIFIED" || a.status === "SUBMITTED") {
      peopleBenefited += a.beneficiariesReached || 0;
      
      const villageMatch = a.locationsCovered.match(/(\d+)\s+Villages?/i);
      if (villageMatch) {
        villagesCovered += parseInt(villageMatch[1], 10);
      } else {
        const gpMatch = a.locationsCovered.match(/(\d+)\s+Gram\s+Panchayats?/i);
        if (gpMatch) {
          villagesCovered += parseInt(gpMatch[1], 10);
        }
      }

      a.impactMetrics.forEach((m) => {
        const name = m.name.toLowerCase();
        if (name.includes("school")) {
          schoolsReached += m.value;
        } else if (name.includes("farmer")) {
          farmersSupported += m.value;
        } else if (name.includes("village")) {
          villagesCovered += m.value;
        }
      });
    }
  });

  const totalCSRFunding = industryRequests
    .filter((r) => r.status === "ACCEPTED")
    .reduce((sum, r) => sum + (r.estimatedFunding || 0), 0);

  // 2. FUNNEL STAGE COUNTS
  const funnelStages = [
    { label: "Problems Reported", count: totalProblems },
    { label: "Validated", count: verifiedProblems },
    { label: "Univ Interested", count: problems.filter((p) => ["Interested", "Under Review", "Active Project"].includes(p.status)).length },
    { label: "Team Formed", count: problems.filter((p) => universityMockService.getAssignedTeamForProblem(p.id) !== undefined).length },
    { label: "Proposal Submitted", count: proposals.filter((p) => p.status !== "DRAFT").length },
    { label: "Proposal Approved", count: proposals.filter((p) => p.status === "ACCEPTED").length },
    { label: "Implementation", count: projects.filter((pj) => !["COMPLETED", "AWAITING_ADMIN_VERIFICATION"].includes(pj.stage)).length },
    { label: "Impact Assessed", count: assessments.length },
    { label: "Govt Verified", count: assessments.filter((a) => a.status === "VERIFIED").length },
    { label: "Completed", count: completedProjectsCount }
  ];

  // 3. PROJECT HEALTH COUNTS
  const resolvedProjects = projects.map(pj => universityMockService.resolveProject(pj)).filter(Boolean) as any[];
  const healthCounts = {
    "ON TRACK": 0,
    "AT RISK": 0,
    "DELAYED": 0,
    "AWAITING VERIFICATION": 0,
    "COMPLETED": 0
  };
  resolvedProjects.forEach((pj) => {
    const h = getProjectHealth(pj);
    if (healthCounts[h] !== undefined) healthCounts[h]++;
  });

  // Most important projects needing admin attention (Delayed, Awaiting Verification, or At Risk)
  const priorityProjects = resolvedProjects.filter((pj) => 
    ["DELAYED", "AWAITING VERIFICATION", "AT RISK"].includes(getProjectHealth(pj))
  ).slice(0, 5);

  // 4. IMPACT BY CATEGORY
  const categoryCounts: Record<string, number> = {};
  problems.forEach((p) => {
    if (p.status === "Active Project" || p.status === "Interested" || p.status === "Under Review") {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  // 5. CSR BREAKDOWN
  const partnerships = industryService.getAllPartnerships();
  const csrBreakdown = partnerships.map((ptn) => {
    const req = industryService.getSupportRequestById(ptn.requestId);
    const resolvedProj = universityMockService.resolveProject(universityMockService.getProjectById(ptn.projectId) as any);
    return {
      projectTitle: resolvedProj?.title || `Project ${ptn.projectId}`,
      projectId: ptn.projectId,
      partner: req?.industryName || ptn.industryId,
      type: req?.supportType ? req.supportType.replace(/_/g, " ") : "Funding/Support",
      amount: req?.estimatedFunding || 0,
      status: ptn.status
    };
  });

  const activePartnershipsCount = partnerships.filter((p) => p.status === "ACTIVE").length;

  // 6. RECENT ACTIONS (last 8)
  const actionAudit = activities.filter((act) => 
    ["Proposal approved", "Project created", "Impact assessment verified", "Impact assessment revision requested", "CSR support interest submitted", "Support request status updated", "CSR delivery item verified"].some(keyword => act.action?.toLowerCase().includes(keyword.toLowerCase())) ||
    ["PROPOSAL", "PROJECT", "IMPACT_ASSESSMENT", "INDUSTRY_REQUEST"].includes(act.entityType || "")
  ).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h1 className="text-2xl font-extrabold text-primary uppercase tracking-wide flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" /> Impact & Transparency
        </h1>
        <p className="text-xs text-brandgray-muted mt-1 font-semibold">
          Government-level overview of community problems, projects, outcomes and public impact.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Problems", value: totalProblems, sub: "Citizen reports" },
          { label: "Verified Problems", value: verifiedProblems, sub: "Validation passed" },
          { label: "Active Projects", value: activeProjects, sub: "Under way" },
          { label: "Completed Projects", value: completedProjectsCount, sub: "Fully implemented" },
          { label: "Projects Awaiting Verification", value: projectsAwaitingVerification, sub: "Need admin sign-off", highlight: projectsAwaitingVerification > 0 },
          { label: "People Benefited", value: peopleBenefited > 0 ? peopleBenefited.toLocaleString("en-IN") : "—", sub: "Verified outcomes" },
          { label: "Villages Covered", value: villagesCovered > 0 ? villagesCovered : "—", sub: "Rural reach" },
          { label: "Schools Reached", value: schoolsReached > 0 ? schoolsReached : "—", sub: "Educational impact" },
          { label: "Farmers Supported", value: farmersSupported > 0 ? farmersSupported : "—", sub: "Livelihood support" },
          { label: "CSR Committed", value: totalCSRFunding > 0 ? `₹${totalCSRFunding.toLocaleString("en-IN")}` : "—", sub: "Corporate backing" }
        ].map((kpi, idx) => (
          <Card key={idx} className={`border-brandgray-border shadow-subtle bg-white ${kpi.highlight ? "border-amber-250 bg-amber-50/20" : ""}`}>
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-24">
              <span className="text-[10px] font-extrabold text-brandgray-muted uppercase tracking-wider leading-tight">{kpi.label}</span>
              <div className="my-2">
                <span className="text-lg font-extrabold text-primary leading-none">{kpi.value}</span>
              </div>
              <span className="text-[9.5px] text-brandgray-muted font-medium">{kpi.sub}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel Section */}
      <Card className="border-brandgray-border shadow-subtle bg-white">
        <CardHeader className="p-5 border-b border-brandgray-border/60">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Problem-to-Solution Funnel & Stage Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row flex-wrap md:items-center justify-between gap-4">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="flex-1 min-w-[120px] text-center p-3 bg-slate-50 border border-slate-150 rounded-lg relative">
                <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block mb-1">{stage.label}</span>
                <span className="text-base font-extrabold text-primary">{stage.count}</span>
                {idx < funnelStages.length - 1 && (
                  <span className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-lg font-extrabold z-10">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Project Health & Impact outcomes by category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Health Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Project Health Summary
              </CardTitle>
              <div className="flex flex-wrap gap-2 justify-end">
                {Object.entries(healthCounts).map(([status, count]) => (
                  <span key={status} className={`text-[9.5px] font-bold px-2 py-0.5 rounded border uppercase ${
                    status === "COMPLETED" ? "bg-indigo-50 text-indigo-800 border-indigo-200" :
                    status === "AWAITING VERIFICATION" ? "bg-amber-50 text-amber-800 border-amber-250" :
                    status === "DELAYED" ? "bg-rose-50 text-rose-800 border-rose-200" :
                    status === "AT RISK" ? "bg-orange-50 text-orange-800 border-orange-200" :
                    "bg-emerald-50 text-emerald-800 border-emerald-250"
                  }`}>
                    {status.split(" ")[0]}: {count}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Critical Projects Needing Attention</h3>
              {priorityProjects.length === 0 ? (
                <p className="text-xs text-brandgray-muted text-center py-4">All projects are on track or completed.</p>
              ) : (
                <div className="overflow-x-auto border border-brandgray-border rounded-lg">
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-brandgray-border font-bold text-primary uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Project</th>
                        <th className="p-3">University</th>
                        <th className="p-3 text-center">Progress</th>
                        <th className="p-3 text-center">Health</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brandgray-border/60">
                      {priorityProjects.map((pj) => {
                        const h = getProjectHealth(pj);
                        return (
                          <tr key={pj.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3">
                              <p className="font-bold text-primary">{pj.title}</p>
                              <p className="text-[10px] text-brandgray-muted">{pj.id} · {pj.originalProblem.district}, {pj.originalProblem.state}</p>
                            </td>
                            <td className="p-3 text-brandgray-text font-medium">{pj.collaboration.university}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-bold">{pj.customProgress || 45}%</span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border uppercase ${
                                h === "AWAITING VERIFICATION" ? "bg-amber-50 text-amber-800 border-amber-250" :
                                h === "DELAYED" ? "bg-rose-50 text-rose-800 border-rose-200" :
                                h === "AT RISK" ? "bg-orange-50 text-orange-800 border-orange-200" :
                                "bg-emerald-50 text-emerald-800 border-emerald-250"
                              }`}>
                                {h}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <Link href={`/admin/projects/${pj.id}`}>
                                <Button variant="outline" size="sm" className="h-7 text-[10.5px] font-bold px-3">
                                  Review
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Impact outcomes by category column */}
        <div className="space-y-6">
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4" /> Active Solutions by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {Object.keys(categoryCounts).length === 0 ? (
                <p className="text-xs text-brandgray-muted text-center py-4">No active categories found.</p>
              ) : (
                <div className="space-y-3.5">
                  {Object.entries(categoryCounts).map(([cat, val]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-primary">{cat}</span>
                        <span className="text-brandgray-muted">{val} projects</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all" 
                          style={{ width: `${Math.min(100, (val / Math.max(1, activeProjects)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSR Transparency breakdown */}
      <Card className="border-brandgray-border shadow-subtle bg-white">
        <CardHeader className="p-5 border-b border-brandgray-border/60">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4" /> CSR Investment Transparency breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-150">
            <div>
              <span className="text-[10px] font-bold text-brandgray-muted uppercase block mb-0.5">Total committed CSR</span>
              <span className="text-lg font-bold text-emerald-800">₹{totalCSRFunding.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brandgray-muted uppercase block mb-0.5">Accepted requests</span>
              <span className="text-lg font-bold text-primary">{industryRequests.filter((r) => r.status === "ACCEPTED").length}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brandgray-muted uppercase block mb-0.5">Active partnerships</span>
              <span className="text-lg font-bold text-primary">{activePartnershipsCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-brandgray-muted uppercase block mb-0.5">Verified deliveries</span>
              <span className="text-lg font-bold text-primary">
                {partnerships.reduce((sum, ptn) => sum + ptn.deliveryItems.filter(i => i.status === "VERIFIED").length, 0)} items
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-brandgray-border rounded-lg">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-brandgray-border font-bold text-primary uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Project Title</th>
                  <th className="p-3">CSR Partner</th>
                  <th className="p-3">Support Type</th>
                  <th className="p-3">Funding Amount</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brandgray-border/60">
                {csrBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-brandgray-muted">No CSR sponsorships registered.</td>
                  </tr>
                ) : (
                  csrBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-primary">
                        <Link href={`/admin/projects/${row.projectId}`} className="hover:underline">
                          {row.projectTitle}
                        </Link>
                        <span className="text-[9.5px] text-brandgray-muted block font-normal">{row.projectId}</span>
                      </td>
                      <td className="p-3 font-medium text-brandgray-text">{row.partner}</td>
                      <td className="p-3 text-brandgray-text font-medium">{row.type}</td>
                      <td className="p-3 font-bold text-emerald-800">
                        {row.amount > 0 ? `₹${row.amount.toLocaleString("en-IN")}` : "In-Kind / Tech"}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border uppercase ${
                          row.status === "ACTIVE" ? "bg-emerald-50 text-emerald-800 border-emerald-250" : "bg-indigo-50 text-indigo-800 border-indigo-200"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent actions & quick action center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4" /> Recent Government Actions & Auditing
              </CardTitle>
              <Link href="/admin/activity" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                View Full Audit Trail <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                {actionAudit.map((log) => {
                  const formattedTime = log.timestamp && log.timestamp.includes("T")
                    ? new Date(log.timestamp).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                    : log.timestamp;
                  return (
                    <div key={log.id} className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 text-xs">
                      <div className="space-y-0.5 flex-1">
                        <p className="font-semibold text-primary leading-tight">{log.text}</p>
                        <p className="text-[10px] text-brandgray-muted">
                          Actor: <span className="font-bold">{log.actor || "System"}</span> {log.actorRole ? `(${log.actorRole})` : ""} · Action: {log.action || "Audit"}
                        </p>
                      </div>
                      <div className="text-right text-[10.5px] text-brandgray-muted shrink-0 font-medium">
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Center Block */}
        <div className="space-y-6">
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                GOVERNMENT ACTION CENTER
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {[
                { label: "Review Problems Queue", href: "/admin/problems" },
                { label: "Review Solution Proposals", href: "/admin/proposals" },
                { label: "Monitor Projects list", href: "/admin/projects" },
                { label: "Review CSR Support offers", href: "/admin/industry-support" },
                { label: "Verify Impact evidence", href: "/admin/projects" },
                { label: "View Audit Activity trail", href: "/admin/activity" }
              ].map((btn, i) => (
                <Link key={i} href={btn.href} className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9 flex justify-between items-center text-left px-3 hover:bg-slate-50 transition-all">
                    <span>{btn.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}