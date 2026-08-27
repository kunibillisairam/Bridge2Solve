"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Copy, 
  ArrowLeft,
  FileText,
  Layers,
  GraduationCap,
  Building2,
  Check,
  AlertCircle,
  Clock,
  Briefcase,
  History,
  FolderKanban,
  HeartHandshake
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem, 
  ProblemAnalysis,
  ActivityLog,
  SolutionProposal,
  UniversityProject,
  UniversityMatchResult
} from "@/services/universityMockService";
import { industryService, IndustrySupportRequest } from "@/services/industryService";
import { findSimilarProblems } from "@/services/duplicateDetectionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES: Record<string, string> = {
  Unassigned: "bg-blue-50 text-blue-700 border-blue-150",
  Interested: "bg-yellow-50 text-yellow-700 border-yellow-250",
  "Under Review": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Active Project": "bg-emerald-50 text-emerald-800 border-emerald-300",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<CommunityProblem | null>(null);
  const [analysis, setAnalysis] = useState<ProblemAnalysis | undefined>(undefined);
  const [duplicateCandidates, setDuplicateCandidates] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [associatedProposal, setAssociatedProposal] = useState<any | null>(null);
  const [associatedProject, setAssociatedProject] = useState<UniversityProject | null>(null);
  const [industryRequests, setIndustryRequests] = useState<IndustrySupportRequest[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);
  const [recommendations, setRecommendations] = useState<UniversityMatchResult[]>([]);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Action State
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProblemData();
  }, [problemId]);

  const loadProblemData = () => {
    const p = universityMockService.getProblemById(problemId);
    if (p) {
      setProblem(p);
      
      const a = universityMockService.getProblemAnalysis(problemId);
      setAnalysis(a);

      const allProblems = universityMockService.getProblems();
      const candidates = findSimilarProblems(p, allProblems, (id) => universityMockService.getProblemAnalysis(id));
      setDuplicateCandidates(candidates);

      // 5. UNIVERSITY RESPONSE
      const allInterests = universityMockService.getInterests();
      const problemInterests = allInterests.filter((i) => i.problemId === problemId);
      setInterests(problemInterests);

      // 6. PROPOSAL
      const allProposals = universityMockService.getAllProposalsForAdmin();
      const prop = allProposals.find((pr) => pr.problemId === problemId) || null;
      setAssociatedProposal(prop ? universityMockService.resolveProposal(prop) : null);

      // 7. PROJECT
      const allProjects = universityMockService.getProjects();
      const proj = allProjects.find((pj) => pj.problemId === problemId) || null;
      setAssociatedProject(proj);

      // 8. INDUSTRY / CSR
      if (proj) {
        const csrRequests = industryService.getAcceptedSupportRequestsForProject(proj.id);
        setIndustryRequests(csrRequests);
      } else {
        setIndustryRequests([]);
      }

      // 9. ACTIVITY HISTORY
      const allActivities = universityMockService.getActivities();
      const probActivities = allActivities.filter(
        (act) => 
          act.text.toLowerCase().includes(problemId.toLowerCase()) || 
          act.text.toLowerCase().includes(p.title.toLowerCase())
      );
      setActivityHistory(probActivities);

      // Load university recommendations
      const recs = universityMockService.getUniversityRecommendations(problemId);
      setRecommendations(recs);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-xs text-brandgray-muted font-medium">Loading problem details...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-8 text-center bg-white border border-brandgray-border rounded-md text-brandgray-muted text-sm space-y-3 max-w-md mx-auto my-12">
        <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
        <p className="font-bold text-primary">Problem Not Found</p>
        <p className="text-xs">The requested community problem ID does not exist or has been removed from the platform registry.</p>
        <div className="pt-2">
          <Link href="/admin/problems">
            <Button variant="outline" size="sm">Back to Problems Monitoring</Button>
          </Link>
        </div>
      </div>
    );
  }

  const p = problem;

  const handleApproveProblem = () => {
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      universityMockService.updateProblemStatus(problemId, "Interested", "ADMIN");
      setActionSuccess("Problem validated and approved for university matching!");
      loadProblemData();
    } catch (err: any) {
      setActionError(err.message || "Failed to validate problem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectProblem = () => {
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      universityMockService.updateProblemStatus(problemId, "Rejected", "ADMIN");
      setActionSuccess("Problem status updated to Rejected.");
      loadProblemData();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject problem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkSameProblem = (candidateId: string) => {
    setActionError("");
    setActionSuccess("");
    try {
      universityMockService.createCluster(problemId, candidateId);
      setActionSuccess(`Created problem cluster relationship between ${problemId} and ${candidateId}. Both original citizen reports remain intact.`);
      loadProblemData();
    } catch (err: any) {
      setActionError(err.message || "Failed to mark duplicate relationship.");
    }
  };

  const handleMarkIndependent = (candidateId: string) => {
    setActionError("");
    setActionSuccess("");
    try {
      universityMockService.markIndependent(problemId, candidateId);
      setActionSuccess(`Marked reports ${problemId} and ${candidateId} as independent issues.`);
      loadProblemData();
    } catch (err: any) {
      setActionError(err.message || "Failed to mark independent.");
    }
  };

  if (!problem) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm font-semibold text-primary">Problem Report Not Found</p>
        <p className="text-xs text-brandgray-muted">The requested problem ID does not exist.</p>
        <Link href="/admin/problems">
          <Button variant="outline" size="sm">Back to Problems Queue</Button>
        </Link>
      </div>
    );
  }

  // Calculate duplicate risk
  const duplicateRisk = duplicateCandidates.length > 0
    ? (duplicateCandidates.some(c => c.similarityScore >= 80) ? "HIGH" : "MEDIUM")
    : "LOW";

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/problems" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Problem Validation Queue
        </Link>
        <span className="text-xs text-brandgray-muted">Problem ID: <span className="font-mono font-bold text-primary">{problem.id}</span></span>
      </div>

      {/* SECTION 1: PROBLEM OVERVIEW */}
      <div className="bg-white border border-brandgray-border rounded-lg p-5 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded">
                {problem.id}
              </span>
              <span className="text-xs font-bold text-brandgray-muted uppercase tracking-wider">
                {problem.category}
              </span>
            </div>
            <h1 className="text-xl font-bold text-primary">{problem.title}</h1>
            <p className="text-xs text-brandgray-muted flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {problem.location} · Reported Date: <span className="font-medium text-brandgray-text">{problem.submissionDate}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded border uppercase ${STATUS_BADGES[problem.status] || "bg-slate-100 text-slate-700"}`}>
              {problem.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded border border-slate-150">
          <div>
            <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block leading-none mb-1">Affected Population</span>
            <span className="font-bold text-primary">{problem.affectedPopulation}</span>
          </div>
          <div>
            <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block leading-none mb-1">Priority / Severity</span>
            <span className="font-bold text-red-700">{problem.priority} Priority</span>
          </div>
          <div>
            <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block leading-none mb-1">AI Score</span>
            <span className="font-extrabold text-indigo-700">{problem.matchScore}% Match</span>
          </div>
          <div>
            <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block leading-none mb-1">Duplicate Risk</span>
            <span className={`font-bold ${duplicateRisk === "HIGH" ? "text-red-700" : duplicateRisk === "MEDIUM" ? "text-amber-700" : "text-emerald-700"}`}>
              {duplicateRisk}
            </span>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
            {actionSuccess}
          </div>
        )}

        {actionError && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
            {actionError}
          </div>
        )}
      </div>

      {/* SECTION 10: ADMIN DECISION AREA (Top Control Panel) */}
      <Card className="border-primary/20 shadow-subtle bg-slate-50/50">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Admin Validation Decision Panel</h3>
            <p className="text-[11px] text-brandgray-muted font-medium">Verify the legitimacy and details of this report to proceed with matching.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs font-bold text-red-700 border-red-200 hover:bg-red-50"
              onClick={handleRejectProblem}
              disabled={isSubmitting || problem.status === "Rejected"}
            >
              {isSubmitting ? "Rejecting..." : "Reject Report"}
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="h-8 text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
              onClick={handleApproveProblem}
              disabled={isSubmitting || problem.status === "Interested" || problem.status === "Active Project"}
            >
              <Check className="h-4 w-4 mr-1 shrink-0" /> 
              {isSubmitting ? "Validating..." : "Validate & Approve Problem"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Citizen Submission, AI, Duplicates, University, Proposals, Projects */}
        <div className="lg:col-span-2 space-y-6">

          {/* SECTION 2: ORIGINAL CITIZEN SUBMISSION */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary shrink-0" /> Original Citizen Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-150 mb-2">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none mb-1">Location Reported</span>
                  <span className="font-semibold text-brandgray-text">{problem.location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none mb-1">State / District</span>
                  <span className="font-semibold text-brandgray-text">{problem.district}, {problem.state}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Report Title</span>
                <h4 className="text-xs font-bold text-primary">{problem.title}</h4>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Description / Support Information</span>
                <p className="p-3 bg-white border border-brandgray-border rounded text-brandgray-text leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: AI PROBLEM INTELLIGENCE */}
          <Card className="border-purple-200 shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-purple-100 bg-purple-50/40 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-700 shrink-0" /> AI Problem Intelligence
              </CardTitle>
              <span className="text-[9.5px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded">
                AI GENERATED · {analysis?.engineUsed || "Gemini"}
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {analysis ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-purple-50/40 p-3 rounded border border-purple-100">
                    <div>
                      <span className="text-[10px] font-bold text-purple-900 uppercase block">Severity</span>
                      <span className="font-bold text-red-700">{analysis.severity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-900 uppercase block">Impact Level</span>
                      <span className="font-bold text-purple-950">{analysis.impactLevel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-900 uppercase block">Affected Area</span>
                      <span className="font-bold text-purple-950">{analysis.affectedArea}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-900 uppercase block">Review Status</span>
                      <span className="font-bold text-emerald-700">{analysis.reviewStatus}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">AI Summary</span>
                    <p className="p-3 bg-white border border-purple-150 rounded leading-relaxed text-brandgray-text">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block mb-1">Required Expertise</span>
                      <div className="flex flex-wrap gap-1">
                        {analysis.requiredExpertise.map((exp, i) => (
                          <span key={i} className="text-[11px] bg-purple-50 text-purple-900 border border-purple-150 px-2 py-0.5 rounded font-medium">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block mb-1">Research Areas / Domains</span>
                      <div className="flex flex-wrap gap-1">
                        {analysis.suggestedDomains.map((dom, i) => (
                          <span key={i} className="text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-150 px-2 py-0.5 rounded font-medium">
                            {dom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-brandgray-muted text-center py-4">AI Analysis pending or unavailable.</p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 4: DUPLICATE REVIEW */}
          <Card className="border-amber-200 shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-amber-100 bg-amber-50/40 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <Copy className="h-4 w-4 text-amber-700 shrink-0" /> Duplicate Review & Clustering
              </CardTitle>
              <span className="text-[9.5px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                SIMILARITY CHECKING
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {duplicateCandidates.length === 0 ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>No duplicate reports detected for this problem submission. Original report is unique.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {duplicateCandidates.map((cand) => {
                    const isIndependent = universityMockService.isMarkedIndependent(problem.id, cand.candidateId);
                    return (
                      <div key={cand.candidateId} className="p-3 bg-white border border-amber-200 rounded space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-amber-900 uppercase">Match ID: {cand.candidateId}</span>
                            <h4 className="text-xs font-bold text-primary">{cand.candidateTitle}</h4>
                            <p className="text-[10px] text-brandgray-muted">{cand.candidateLocation}</p>
                          </div>
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded shrink-0">
                            {cand.similarityScore}% Match ({cand.confidenceLevel})
                          </span>
                        </div>

                        <div className="bg-amber-50/50 p-2.5 rounded border border-amber-100 text-[10px] space-y-0.5">
                          <span className="font-bold text-amber-900 uppercase text-[9px] block">Matching Signals</span>
                          <p className="text-amber-950 font-medium">{cand.matchReasons.join(" · ")}</p>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                          {isIndependent ? (
                            <span className="font-bold text-slate-600">✓ Marked as Different / Independent Reports</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-[10px] font-bold text-amber-900 border-amber-200 hover:bg-amber-100"
                                onClick={() => handleMarkSameProblem(cand.candidateId)}
                              >
                                Same Problem
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-[10px] font-semibold text-slate-700"
                                onClick={() => handleMarkIndependent(cand.candidateId)}
                              >
                                Different
                              </Button>
                            </div>
                          )}
                          <Link href={`/admin/problems/${cand.candidateId}`}>
                            <Button variant="outline" size="sm" className="h-6 text-[10px]">
                              Review Candidate →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMART UNIVERSITY RECOMMENDATIONS */}
          <Card className="border-indigo-200 shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-indigo-150 bg-indigo-50/40">
              <CardTitle className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-700 shrink-0" /> Smart University Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {recommendations.length === 0 ? (
                <p className="text-brandgray-muted text-center py-3">No recommended active universities meet the criteria for this problem.</p>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => {
                    const isExpanded = expandedRecId === rec.universityId;
                    return (
                      <div key={rec.universityId} className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-primary">{rec.universityName}</h4>
                            <p className="text-[10px] text-brandgray-muted">University ID: <span className="font-mono font-bold text-slate-700">{rec.universityId}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-indigo-700">{rec.score}% Match</span>
                            <span className={`text-[9.5px] font-bold block border px-1.5 py-0.5 rounded mt-1 ${
                              rec.matchLevel === "HIGH" 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                : rec.matchLevel === "MEDIUM" 
                                ? "bg-amber-50 text-amber-800 border-amber-200" 
                                : "bg-slate-50 text-slate-800 border-slate-200"
                            }`}>
                              {rec.matchLevel} MATCH
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-150">
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block mb-0.5">Scoring Explanations</span>
                          {rec.reasons.map((r, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-brandgray-text font-medium">
                              <span className="text-emerald-600 shrink-0 font-extrabold">✓</span>
                              <span>{r.replace("✓ ", "")}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10.5px] font-semibold text-slate-700 flex items-center gap-1"
                            onClick={() => setExpandedRecId(isExpanded ? null : rec.universityId)}
                          >
                            {isExpanded ? "Hide Matching Breakdown" : "View Matching Breakdown"}
                          </Button>
                          
                          <Button variant="outline" size="sm" className="h-7 text-[10.5px] pointer-events-none opacity-50">
                            View Profile
                          </Button>
                        </div>

                        {/* MATCHING BREAKDOWN */}
                        {isExpanded && (
                          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2 mt-2">
                            <span className="font-bold text-primary uppercase text-[9.5px] block border-b border-slate-200 pb-1">
                              Matching Breakdown (Algorithm {rec.algorithmVersion})
                            </span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Domain Match:</span>
                                <span className="font-semibold">{rec.breakdown.domainScore} / 25</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Expertise Match:</span>
                                <span className="font-semibold">{rec.breakdown.expertiseScore} / 25</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Department Match:</span>
                                <span className="font-semibold">{rec.breakdown.departmentScore} / 15</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Research Focus:</span>
                                <span className="font-semibold">{rec.breakdown.researchFocusScore} / 15</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Location Relevance:</span>
                                <span className="font-semibold">{rec.breakdown.locationScore} / 10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-brandgray-muted">Previous Experience:</span>
                                <span className="font-semibold">{rec.breakdown.previousExperienceScore} / 10</span>
                              </div>
                            </div>
                            <div className="flex justify-between border-t border-slate-250 pt-1.5 font-bold text-primary">
                              <span>Total Score:</span>
                              <span>{rec.score} / 100</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 5: UNIVERSITY RESPONSE */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" /> University Pipeline Response
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {interests.length === 0 ? (
                <p className="text-brandgray-muted text-center py-3">No universities have registered interest in this problem report yet.</p>
              ) : (
                <div className="space-y-2">
                  {interests.map((interest, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="font-bold text-primary">{interest.universityId}</span>
                        <p className="text-[10px] text-brandgray-muted">Interest registered on: {interest.updatedAt || "N/A"}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 px-2.5 py-0.5 rounded">
                        INTEREST REGISTERED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 6: PROPOSAL */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary shrink-0" /> Solution Proposal Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {associatedProposal ? (
                <div className="p-3.5 bg-white border border-brandgray-border rounded-lg space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-purple-900 uppercase">Proposal ID: {associatedProposal.id}</span>
                      <h4 className="text-xs font-bold text-primary">{associatedProposal.title}</h4>
                      <p className="text-[10px] text-brandgray-muted">Assigned Team: <span className="font-semibold text-brandgray-text">{associatedProposal.team?.name || "None"}</span> · University: <span className="font-semibold text-brandgray-text">{associatedProposal.universityId}</span></p>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded">
                      {associatedProposal.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-slate-50 p-2.5 rounded border border-slate-150">
                    <div>
                      <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block">Timeline / Duration</span>
                      <span className="font-semibold text-brandgray-text">{associatedProposal.timeline || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-brandgray-muted uppercase block">Resource Requirements</span>
                      <span className="font-semibold text-brandgray-text">{associatedProposal.resourceRequirements}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Proposed Solution Outline</span>
                    <p className="p-2 bg-slate-50 border border-brandgray-border rounded text-[11px] leading-relaxed text-brandgray-text">
                      {associatedProposal.proposedApproach}
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link href={`/admin/proposals/${associatedProposal.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] font-bold">
                        Review Full Proposal →
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-brandgray-muted text-center py-3">No proposal submitted for this problem yet.</p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 7: PROJECT */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary shrink-0" /> Endorsed Collaborative Project
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {associatedProject ? (
                <div className="p-3 bg-white border border-brandgray-border rounded flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Project ID: {associatedProject.id}</span>
                    <h4 className="text-xs font-bold text-primary">{associatedProject.title}</h4>
                    <p className="text-[10px] text-brandgray-muted">University: <span className="font-semibold text-brandgray-text">{associatedProject.collaboration.university}</span> · Target Progress: <span className="font-bold text-emerald-700">{associatedProject.customProgress || 0}%</span></p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded uppercase">
                      {associatedProject.stage}
                    </span>
                    <Link href={`/admin/projects/${associatedProject.id}`}>
                      <Button variant="primary" size="sm" className="h-7 text-[11.5px] font-bold">
                        Manage Project
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-brandgray-muted text-center py-3">No active project created for this problem report yet.</p>
              )}
            </CardContent>
          </Card>

          {/* SECTION 8: INDUSTRY / CSR */}
          <Card className="border-indigo-200 shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-indigo-150 bg-indigo-50/40">
              <CardTitle className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-700 shrink-0" /> Industry / CSR Partnership & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {industryRequests.length === 0 ? (
                <p className="text-brandgray-muted text-center py-3">No active industry or CSR sponsorships registered on this problem&apos;s project.</p>
              ) : (
                <div className="space-y-2">
                  {industryRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-indigo-50/40 border border-indigo-150 rounded flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="font-bold text-indigo-950">{req.industryName}</span>
                        <p className="text-[10px] text-indigo-900">Support: <span className="font-semibold">{req.supportType}</span> {req.estimatedFunding ? `· Funding: ₹${req.estimatedFunding.toLocaleString('en-IN')}` : ""}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded">
                        CSR SUPPORT ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar: Stage progress, metadata, Activity Log */}
        <div className="space-y-6">
          
          {/* Timeline Tracker */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Problem Lifecycle Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {[
                { stage: "PROBLEM_REPORTED", label: "Problem Reported", done: true },
                { stage: "AI_ANALYZED", label: "AI Intelligence Analyzed", done: true },
                { stage: "DUPLICATE_CHECKED", label: "Duplicate Screening Passed", done: true },
                { stage: "ADMIN_VALIDATED", label: "Admin Validated", done: problem.status !== "Unassigned" && problem.status !== "Rejected" },
                { stage: "UNIVERSITY_MATCHED", label: "University Matched", done: problem.status === "Interested" || problem.status === "Under Review" || problem.status === "Active Project" },
                { stage: "PROPOSAL_SUBMITTED", label: "Proposal Submitted", done: problem.status === "Under Review" || problem.status === "Active Project" },
                { stage: "PROJECT_ACTIVE", label: "Project Created & Active", done: problem.status === "Active Project" },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    s.done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}>
                    {s.done ? "✓" : idx + 1}
                  </div>
                  <span className={`font-semibold ${s.done ? "text-primary" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submission Metadata */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Submission Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Priority Score</span>
                <span className="font-bold text-indigo-700">{problem.matchScore}/100</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Priority Level</span>
                <span className="font-bold text-red-700">{problem.priority}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">State / District</span>
                <span className="font-semibold text-primary">{problem.district}, {problem.state}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Affected Population</span>
                <span className="font-bold text-primary">{problem.affectedPopulation}</span>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 9: ACTIVITY HISTORY */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-4 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4 text-primary shrink-0" /> Audit Log History ({activityHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              {activityHistory.length === 0 ? (
                <p className="text-brandgray-muted text-center py-2">No activity events recorded for this problem.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activityHistory.map((act) => (
                    <div key={act.id} className="p-2 bg-slate-50 border border-slate-150 rounded space-y-0.5">
                      <p className="text-brandgray-text leading-tight">{act.text}</p>
                      <span className="text-[9.5px] text-brandgray-muted block">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
