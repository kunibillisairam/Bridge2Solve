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
  AlertCircle
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem, 
  ProblemAnalysis 
} from "@/services/universityMockService";
import { findSimilarProblems, calculateSimilarity } from "@/services/duplicateDetectionService";
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
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/problems" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Problem Validation Queue
        </Link>
        <span className="text-xs text-brandgray-muted">Problem ID: <span className="font-mono font-bold text-primary">{problem.id}</span></span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded">
                {problem.id}
              </span>
              <span className="text-xs font-bold text-brandgray-muted uppercase tracking-wider">
                {problem.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary">{problem.title}</h1>
            <p className="text-xs text-brandgray-muted flex items-center gap-2 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {problem.location} · Reported Date: <span className="font-medium text-brandgray-text">{problem.submissionDate}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded border uppercase ${STATUS_BADGES[problem.status] || "bg-slate-100 text-slate-700"}`}>
              Status: {problem.status}
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

      {/* SECTION E: ADMIN DECISION AREA (Top Sticky Control) */}
      <Card className="border-primary/30 shadow-subtle bg-slate-50">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Admin Validation Decision</h3>
            <p className="text-[11px] text-brandgray-muted">Validate citizen problem report to enable university department matching.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs font-bold text-red-700 hover:bg-red-50 border-red-200"
              onClick={handleRejectProblem}
              disabled={isSubmitting || problem.status === "Rejected"}
            >
              Reject Report
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="h-9 text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
              onClick={handleApproveProblem}
              disabled={isSubmitting || problem.status === "Interested" || problem.status === "Active Project"}
            >
              <Check className="h-4 w-4 mr-1" /> Validate & Approve Problem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Problem Overview, Original Citizen Submission, AI Intelligence */}
        <div className="lg:col-span-2 space-y-6">

          {/* SECTION B: ORIGINAL CITIZEN SUBMISSION */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Original Citizen Submission (Untouched)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-150">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Submitted Category</span>
                  <span className="font-semibold text-primary">{problem.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Affected Population</span>
                  <span className="font-semibold text-primary">{problem.affectedPopulation}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Location</span>
                  <span className="font-semibold text-primary">{problem.location}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary">{problem.title}</h4>
                <p className="text-xs text-brandgray-text leading-relaxed bg-white p-3 rounded border border-brandgray-border">
                  {problem.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION C: AI PROBLEM INTELLIGENCE */}
          <Card className="border-purple-200 shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-purple-100 bg-purple-50/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-700" /> AI Problem Intelligence
              </CardTitle>
              <span className="text-[9.5px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded">
                AI GENERATED · GEMINI API
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
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
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Structured Summary</span>
                    <p className="text-xs text-brandgray-text leading-relaxed bg-white p-3 rounded border border-purple-150">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Required Faculty & Student Expertise</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.requiredExpertise.map((exp, i) => (
                        <span key={i} className="text-[11px] bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded font-medium">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Suggested Research Domains</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.suggestedDomains.map((dom, i) => (
                        <span key={i} className="text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded font-medium">
                          {dom}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-brandgray-muted text-center py-4">AI Analysis pending or unavailable.</p>
              )}
            </CardContent>
          </Card>

          {/* SECTION D: POTENTIAL DUPLICATES & RELATED PROBLEMS */}
          <Card className="border-amber-200 shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-amber-100 bg-amber-50/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <Copy className="h-4 w-4 text-amber-700" /> Potential Duplicates & Related Problems ({duplicateCandidates.length})
              </CardTitle>
              <span className="text-[9.5px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                SIMILARITY SCORE MATCHING
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {duplicateCandidates.length === 0 ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>No duplicate reports detected for this problem submission.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {duplicateCandidates.map((cand) => {
                    const isIndependent = universityMockService.isMarkedIndependent(problem.id, cand.candidateId);
                    return (
                      <div key={cand.candidateId} className="p-4 bg-white border border-amber-200 rounded-lg space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold text-amber-900 uppercase">
                              Candidate Match ID: {cand.candidateId}
                            </span>
                            <h4 className="text-sm font-bold text-primary">{cand.candidateTitle}</h4>
                            <p className="text-[11px] text-brandgray-muted">{cand.candidateLocation}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded">
                              {cand.similarityScore}% Match ({cand.confidenceLevel})
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 bg-amber-50/50 p-2.5 rounded border border-amber-150 text-[11px]">
                          <span className="font-bold text-amber-900 uppercase text-[9.5px] block">Matching Signals</span>
                          <div className="flex flex-wrap gap-2">
                            {cand.matchReasons.map((r: string, idx: number) => (
                              <span key={idx} className="text-amber-900 font-medium">✓ {r}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          {isIndependent ? (
                            <span className="text-[11px] text-slate-600 font-bold">✓ Marked as Independent Issues</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-[11px] font-bold text-amber-900 border-amber-300 hover:bg-amber-100"
                                onClick={() => handleMarkSameProblem(cand.candidateId)}
                              >
                                Mark Same Problem (Cluster)
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-[11px] font-semibold text-slate-700"
                                onClick={() => handleMarkIndependent(cand.candidateId)}
                              >
                                Mark Different
                              </Button>
                            </div>
                          )}
                          <Link href={`/admin/problems/${cand.candidateId}`}>
                            <Button variant="outline" size="sm" className="h-7 text-[11px]">
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

        </div>

        {/* Right Sidebar: Problem Details & Lifecycle Stage */}
        <div className="space-y-6">

          {/* Lifecycle Status Stepper */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Problem Lifecycle Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
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

          {/* Severity & Affected Population Sidebar */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Submission Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
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

        </div>

      </div>
    </div>
  );
}
