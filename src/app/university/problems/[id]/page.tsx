"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  Award, 
  CheckCircle,
  Clock,
  BookOpen,
  ArrowRight,
  GraduationCap,
  PlusCircle,
  Building,
  BrainCircuit,
  AlertTriangle
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem,
  ProblemInterest,
  UniversityTeam,
  ProblemAnalysis
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function ProblemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [problem, setProblem] = useState<CommunityProblem | null>(null);
  const [interest, setInterest] = useState<ProblemInterest | null>(null);
  const [assignedTeam, setAssignedTeam] = useState<UniversityTeam | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ProblemAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestSuccess, setInterestSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadProblemDetails(id);
    }
  }, [id]);

  const loadProblemDetails = (problemId: string) => {
    const probData = universityMockService.getProblemById(problemId);
    if (probData) {
      setProblem(probData);
      
      const interestData = universityMockService.getInterestForProblem(problemId);
      setInterest(interestData || null);

      const teamData = universityMockService.getAssignedTeamForProblem(problemId);
      setAssignedTeam(teamData || null);

      const analysisData = universityMockService.getProblemAnalysis(problemId);
      setAiAnalysis(analysisData || null);
    }
    setLoading(false);
  };

  const handleExpressInterest = () => {
    if (!problem) return;
    const newInterest = universityMockService.expressInterest(problem.id);
    
    setInterest(newInterest);
    const updated = universityMockService.getProblemById(problem.id);
    if (updated) {
      setProblem(updated);
    }
    
    setInterestSuccess(true);
    setTimeout(() => setInterestSuccess(false), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-brandgray-muted">Problem not found.</p>
        <Link href="/university/problems">
          <Button variant="outline" size="sm">
            Back to Problems
          </Button>
        </Link>
      </div>
    );
  }

  const isInterestedOrAssigned = !!interest || problem.status !== "Unassigned";

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link 
          href="/university/problems" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brandgray-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Problems Discovery
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-primary-light text-primary border border-primary/10 px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider">
              {problem.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGES[problem.status]}`}>
              {problem.status}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-primary">
            {problem.title}
          </h2>
        </div>
        <div className="bg-indigo-50 border border-indigo-150 px-4 py-2.5 rounded text-center shrink-0">
          <span className="text-xs text-indigo-700 font-semibold uppercase tracking-wider block">
            Academic Match
          </span>
          <span className="text-xl font-bold text-indigo-900 block mt-0.5">
            {problem.matchScore}% Relevance
          </span>
        </div>
      </div>

      {interestSuccess && (
        <div className="p-4 bg-success-light text-success border border-success/15 rounded text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>Interest expressed successfully! Your university interest relationship has been recorded.</span>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">
                Problem Statement & Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-brandgray-text/95 leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-brandgray-border/40">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-brandgray-muted" />
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Location</span>
                    <span className="text-xs text-brandgray-text mt-1 block font-medium">{problem.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-4.5 w-4.5 text-brandgray-muted" />
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Impact Size</span>
                    <span className="text-xs text-brandgray-text mt-1 block font-medium">{problem.affectedPopulation}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-brandgray-muted" />
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block leading-none">Submitted</span>
                    <span className="text-xs text-brandgray-text mt-1 block font-medium">{problem.submissionDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI-Assisted Intelligence Section */}
          {aiAnalysis && (
            <Card className="border-purple-200 shadow-subtle bg-purple-50/30">
              <CardHeader className="p-5 border-b border-purple-200/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-purple-700" />
                  <CardTitle className="text-sm font-bold text-purple-900 uppercase tracking-wider">
                    AI-Assisted Problem Intelligence
                  </CardTitle>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                  {aiAnalysis.reviewStatus === "ACCEPTED" ? "Verified Analysis" : "Automated Insights"}
                </span>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-xs text-purple-950/90 leading-relaxed font-medium bg-white/70 p-3 rounded border border-purple-100">
                  {aiAnalysis.summary}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Category</span>
                    <span className="font-semibold text-purple-900 block mt-0.5">{aiAnalysis.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Subcategory</span>
                    <span className="font-semibold text-purple-900 block mt-0.5">{aiAnalysis.subcategory}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Severity</span>
                    <span className="font-bold text-red-700 block mt-0.5">{aiAnalysis.severity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Impact Zone</span>
                    <span className="font-semibold text-purple-900 block mt-0.5">{aiAnalysis.affectedArea}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-purple-200/50">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Recommended Technical Expertise
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.requiredExpertise.map((exp, i) => (
                      <span key={i} className="text-[11px] bg-white text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Suggested Solution Domains
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.suggestedDomains.map((domain, i) => (
                      <span key={i} className="text-[11px] bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded font-medium">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Why this problem matches our university (Smart Match Engine) */}
          {(() => {
            const matchResult = universityMockService.getProblemMatches(problem.id);
            const uniRec = matchResult?.universities.find((u) => u.entityId === "univ-1") || matchResult?.universities[0];
            const topTeam = matchResult?.teams[0];

            if (!uniRec) return null;

            return (
              <Card className="border-emerald-200 shadow-subtle bg-emerald-50/20">
                <CardHeader className="p-5 border-b border-emerald-200/60 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-700" />
                    <CardTitle className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                      Why this problem matches our university
                    </CardTitle>
                  </div>
                  <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded">
                    {uniRec.matchScore}% MATCH ({uniRec.matchLevel})
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Strong Academic Overlap:
                    </h4>
                    <ul className="space-y-1">
                      {uniRec.reasons.map((r, i) => (
                        <li key={i} className="text-xs text-brandgray-text flex items-start gap-1.5 font-medium">
                          <span className="text-emerald-600 font-bold">✓</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {uniRec.matchedExpertise.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-emerald-200/50">
                      <h4 className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                        Matched Department Expertise
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {uniRec.matchedExpertise.map((e, i) => (
                          <span key={i} className="text-[11px] bg-white text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {topTeam && (
                    <div className="p-3 bg-white rounded border border-emerald-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Recommended Research Team Match</span>
                      <p className="font-bold text-primary">{topTeam.entityName}</p>
                      <p className="text-[11px] text-brandgray-muted">Match Alignment: {topTeam.matchScore}% match score</p>
                    </div>
                  )}

                  {uniRec.missingCapabilities.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-emerald-200/50">
                      <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Potential Gaps & Resource Requirements
                      </h4>
                      <ul className="space-y-0.5 text-brandgray-muted">
                        {uniRec.missingCapabilities.map((g, i) => (
                          <li key={i} className="text-[11px] flex items-center gap-1">
                            <span className="text-amber-600 font-bold">•</span> {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </CardContent>
              </Card>
            );
          })()}

        </div>

        {/* Right Column - Action sidebar */}
        <div className="space-y-6">
          
          {/* Portal Actions Card */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">
                Portal Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-brandgray-light pb-2">
                  <span className="text-brandgray-muted">Priority</span>
                  <span className={`font-semibold px-2 py-0.5 rounded border ${PRIORITY_BADGES[problem.priority]}`}>
                    {problem.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-brandgray-light pb-2">
                  <span className="text-brandgray-muted">Problem Status</span>
                  <span className="font-semibold text-brandgray-text">{problem.status}</span>
                </div>
              </div>

              {!isInterestedOrAssigned ? (
                <Button 
                  variant="primary" 
                  className="w-full h-10 text-xs font-semibold"
                  onClick={handleExpressInterest}
                >
                  Express Interest
                </Button>
              ) : (
                <div className="p-3.5 bg-yellow-50/80 text-yellow-900 border border-yellow-200 rounded text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-yellow-800 uppercase tracking-wider text-[11px]">
                    <Clock className="h-4 w-4 shrink-0 text-yellow-600" />
                    <span>Interest Registered</span>
                  </div>
                  <div className="space-y-1 text-[11px] border-t border-yellow-200/60 pt-2 text-yellow-950">
                    <div className="flex justify-between">
                      <span className="text-yellow-700">University:</span>
                      <span className="font-bold">{interest ? interest.universityName : "Indian Institute of Science"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-700">Interest Status:</span>
                      <span className="font-semibold capitalize">{interest ? interest.status.toLowerCase() : "Interested"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-700">Date:</span>
                      <span className="font-medium">{interest ? interest.createdAt : problem.submissionDate}</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[10.5px] text-brandgray-muted leading-relaxed">
                Expressing interest connects this problem with your university workspace. It enables team creation and proposal submissions.
              </p>

            </CardContent>
          </Card>

          {/* Research Team Assignment Block */}
          {isInterestedOrAssigned && (
            <Card className="border-brandgray-border shadow-subtle bg-white">
              <CardHeader className="p-5 border-b border-brandgray-border/60">
                <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-brandgray-muted" /> Research Team Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {assignedTeam ? (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider block bg-success-light border border-success/15 px-2 py-0.5 rounded w-max">
                      ASSIGNED RESEARCH TEAM
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-primary">{assignedTeam.name}</h4>
                      <p className="text-xs text-brandgray-muted flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {assignedTeam.facultyMentor}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link href="/university/teams">
                        <Button variant="outline" size="sm" className="w-full h-8 font-semibold text-xs flex items-center justify-center gap-1">
                          View Team <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block bg-amber-50 border border-amber-200 px-2 py-0.5 rounded w-max">
                      TEAM FORMATION PENDING
                    </span>
                    <p className="text-xs text-brandgray-muted leading-relaxed">
                      Interest is registered, but no university research team has been formed/assigned to this challenge yet.
                    </p>
                    <div className="pt-1">
                      <Link href={`/university/teams?assignProblemId=${problem.id}`}>
                        <Button variant="primary" size="sm" className="w-full h-9 font-semibold text-xs flex items-center justify-center gap-1.5">
                          <PlusCircle className="h-4 w-4" /> Assign Research Team
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
