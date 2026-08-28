'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PlusCircle, MapPin, Users, CheckCircle, Clock, CheckCircle2, XCircle, AlertTriangle, Bell, ArrowRight, Brain, AlertOctagon, HelpCircle, Activity, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { analyzeProblem } from '@/services/aiService';
import { universityMockService, STAGE_CONFIG, LIFECYCLE_STAGES } from '@/services/universityMockService';
import { notificationService, formatRelativeTime } from '@/services/notificationService';
import { findSimilarProblems } from '@/services/duplicateDetectionService';
import { impactService } from '@/services/impactService';

interface ProblemWithAI {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  state: string;
  affectedPopulation: number;
  status: string;
  priority: string;
  createdAt: string;
  project?: {
    status: string;
    university: { name: string };
  };
}

const getFriendlyStatus = (prob: ProblemWithAI) => {
  const mockProb = universityMockService.getProblems().find(p => p.id === prob.id || p.title === prob.title);
  const problemId = mockProb ? mockProb.id : prob.id;
  const project = universityMockService.getProjects().find(p => p.problemId === problemId);
  const proposal = universityMockService.getAllProposalsForAdmin().find(pr => pr.problemId === problemId) || null;
  const hasInterest = universityMockService.getInterests().some(i => i.problemId === problemId);
  const hasTeam = project && project.teamId !== null;
  const status = mockProb ? mockProb.status : prob.status;

  if (status === "REJECTED") return "Report Declined";
  if (project) {
    if (project.stage === "COMPLETED") return "Problem Resolved";
    if (project.stage === "AWAITING_ADMIN_VERIFICATION") return "Government Verification";
    if (project.stage === "IMPACT_ASSESSMENT") return "Impact Assessment";
    if (project.stage === "IMPLEMENTATION") return "Solution Being Implemented";
    if (project.stage === "PROPOSAL_APPROVED") return "Solution Approved";
  }
  if (proposal) return "Proposal Under Review";
  if (hasTeam) return "Research Team Formed";
  if (hasInterest) return "University Interested";
  if (status === "VALIDATED") return "Under Administrative Review";
  if (status === "ANALYZED") return "AI Analysis Completed";
  if (status === "UNDER_REVIEW") return "Under Review";
  
  return "Report Submitted";
};

const getWhatIsHappeningNow = (prob: ProblemWithAI) => {
  const mockProb = universityMockService.getProblems().find(p => p.id === prob.id || p.title === prob.title);
  const problemId = mockProb ? mockProb.id : prob.id;
  const project = universityMockService.getProjects().find(p => p.problemId === problemId);
  const proposal = universityMockService.getAllProposalsForAdmin().find(pr => pr.problemId === problemId) || null;
  const hasInterest = universityMockService.getInterests().some(i => i.problemId === problemId);
  const hasTeam = project && project.teamId !== null;
  const status = mockProb ? mockProb.status : prob.status;

  if (status === "REJECTED") {
    return "Administrative evaluation has declined this request. Please review the criteria or submit with more details.";
  }
  if (project) {
    if (project.stage === "COMPLETED") {
      return "Your problem has been resolved and its impact has been verified.";
    }
    if (project.stage === "AWAITING_ADMIN_VERIFICATION") {
      return "Government verification is pending before the project can be marked completed.";
    }
    if (project.stage === "IMPACT_ASSESSMENT") {
      return "The solution has been deployed. An impact assessment is underway to measure its efficacy.";
    }
    if (project.stage === "IMPLEMENTATION") {
      return "Researchers are implementing a solution for this problem.";
    }
  }
  if (proposal) {
    return "A detailed technical proposal is currently being reviewed for approval.";
  }
  if (hasTeam) {
    return "A designated research team has been formed and is formulating the implementation blueprint.";
  }
  if (hasInterest) {
    return "A research institution has expressed interest in this problem and is assigning a technical team.";
  }
  if (status === "VALIDATED") {
    return "Your problem has been validated and is currently being evaluated for university collaboration.";
  }
  
  return "Your grievance has been safely queued and is currently being processed by our AI validation engines.";
};

const getTimelineStages = (prob: ProblemWithAI): Array<{ label: string; status: string; date?: string }> => {
  const mockProb = universityMockService.getProblems().find(p => p.id === prob.id || p.title === prob.title);
  const problemId = mockProb ? mockProb.id : prob.id;

  const aiAnalysis = mockProb ? universityMockService.getProblemAnalysis(problemId) : null;
  const project = universityMockService.getProjects().find(p => p.problemId === problemId);
  const proposal = universityMockService.getAllProposalsForAdmin().find(pr => pr.problemId === problemId) || null;
  const hasInterest = universityMockService.getInterests().some(i => i.problemId === problemId);
  const hasTeam = project && project.teamId !== null;
  
  const impact = project ? impactService.getImpactAssessmentForProject(project.id) : null;
  const isImpactVerified = impact && impact.status === "VERIFIED";

  const status = mockProb ? mockProb.status : prob.status;

  interface TimelineStage {
    label: string;
    status: string;
    date?: string;
  }

  const reported: TimelineStage = { label: "Reported", status: "COMPLETED", date: prob.createdAt ? new Date(prob.createdAt).toLocaleDateString() : undefined };

  const aiAnalyzedStatus = aiAnalysis ? "COMPLETED" : (status === "SUBMITTED" ? "CURRENT" : "PENDING");
  const aiAnalyzed: TimelineStage = { label: "AI Analyzed", status: aiAnalyzedStatus };

  const validatedStatus = (status !== "SUBMITTED" && status !== "REJECTED" && status !== "UNDER_REVIEW") 
    ? "COMPLETED" 
    : (status === "UNDER_REVIEW" ? "CURRENT" : "PENDING");
  const validated: TimelineStage = { label: "Validated", status: validatedStatus };

  const duplicateStatus = (status !== "SUBMITTED" && status !== "UNDER_REVIEW") 
    ? "COMPLETED" 
    : (aiAnalysis ? "CURRENT" : "PENDING");
  const duplicate: TimelineStage = { label: "Duplicate Screening", status: duplicateStatus };

  const interestStatus = (hasInterest || project) 
    ? "COMPLETED" 
    : (status === "VALIDATED" || status === "MATCHED" ? "CURRENT" : "PENDING");
  const universityInterest: TimelineStage = { label: "University Interest", status: interestStatus };

  const teamStatus = hasTeam 
    ? "COMPLETED" 
    : (hasInterest && !project ? "CURRENT" : "PENDING");
  const teamFormed: TimelineStage = { label: "Team Formed", status: teamStatus };

  const proposalStatus = (proposal || (project && project.stage !== "TEAM_FORMED")) 
    ? "COMPLETED" 
    : (hasTeam ? "CURRENT" : "PENDING");
  const proposalStage: TimelineStage = { label: "Proposal", status: proposalStatus };

  const projectStatus = project 
    ? "COMPLETED" 
    : (proposal && proposal.status === "ACCEPTED" ? "CURRENT" : "PENDING");
  const projectStage: TimelineStage = { label: "Project", status: projectStatus };

  const implCompleted = project && (project.stage === "IMPLEMENTATION" || project.stage === "IMPACT_ASSESSMENT" || project.stage === "AWAITING_ADMIN_VERIFICATION" || project.stage === "COMPLETED");
  const implStatus = implCompleted 
    ? "COMPLETED" 
    : (project && project.stage === "PROPOSAL_APPROVED" ? "CURRENT" : "PENDING");
  const implementation: TimelineStage = { label: "Implementation", status: implStatus };

  const impactStatus = isImpactVerified 
    ? "COMPLETED" 
    : (project && (project.stage === "IMPACT_ASSESSMENT" || project.stage === "AWAITING_ADMIN_VERIFICATION") ? "CURRENT" : "PENDING");
  const impactVerified: TimelineStage = { label: "Impact Verified", status: impactStatus };

  const completedCompleted = project && project.stage === "COMPLETED";
  const completedStatus = completedCompleted 
    ? "COMPLETED" 
    : (isImpactVerified ? "CURRENT" : "PENDING");
  const completed: TimelineStage = { label: "Completed", status: completedStatus };

  return [
    reported,
    aiAnalyzed,
    validated,
    duplicate,
    universityInterest,
    teamFormed,
    proposalStage,
    projectStage,
    implementation,
    impactVerified,
    completed
  ] as Array<{ label: string; status: string; date?: string }>;
};

const getRelatedReports = (prob: ProblemWithAI) => {
  const mockProb = universityMockService.getProblems().find(p => p.id === prob.id || p.title === prob.title);
  if (!mockProb) return [];
  const cluster = universityMockService.getClusterForProblem(mockProb.id);
  
  let relatedIds: string[] = [];
  if (cluster) {
    relatedIds = [cluster.primaryProblemId, ...cluster.memberProblemIds].filter(id => id !== mockProb.id);
  } else {
    const allProbs = universityMockService.getProblems();
    const candidates = findSimilarProblems(mockProb, allProbs, id => universityMockService.getProblemAnalysis(id));
    relatedIds = candidates
      .filter(c => c.similarityScore >= 60 && !universityMockService.isMarkedIndependent(mockProb.id, c.candidateId))
      .map(c => c.candidateId);
  }
  
  return relatedIds
    .map(id => universityMockService.getProblems().find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);
};

export default function CitizenDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemWithAI[]>([]);
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Agriculture & Water Management');
  const [location, setLocation] = useState('');
  const [affectedPopulation, setAffectedPopulation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<ProblemWithAI | null>(null);

  const categories = [
    'Agriculture & Water Management',
    'Waste Management & Environmental Engineering',
    'Education & Skill Development',
    'Healthcare & Sanitation',
    'Renewable Energy & Power',
    'Rural Livelihoods & Infrastructure',
  ];

  const fetchProblems = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/problems?citizenId=${user.id}`);
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (err) {
      console.error('Error loading problems:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProblems();
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          affectedPopulation,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Also register in mock service & trigger AI analysis
        const createdProb = universityMockService.addProblem({
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          state: location.includes(",") ? location.split(",")[1].trim() : "State",
          district: location.includes(",") ? location.split(",")[0].trim() : location.trim(),
          affectedPopulation: affectedPopulation ? `${affectedPopulation} people` : "Community",
          priority: "Medium",
          departments: ["Engineering", "Environmental Science"],
          researchAreas: ["Field Analysis", "Sustainable Solutions"],
          requiredExpertise: ["Project Management", "Community Outreach"],
          disciplines: ["Engineering", "Social Work"],
        });

        // Trigger AI analysis asynchronously
        analyzeProblem(createdProb).then((analysis) => {
          universityMockService.saveProblemAnalysis(analysis);
        });

        setSuccessMsg('Problem submitted successfully. Initial AI analysis completed.');
        setTitle('');
        setDescription('');
        setLocation('');
        setAffectedPopulation('');
        fetchProblems();
      } else {
        setErrorMsg(data.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Error submitting problem:', err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-brandgray-light">
        <div className="text-sm font-semibold text-brandgray-muted">Loading Citizen Console...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle mb-8">
        <h2 className="text-xl font-black text-primary uppercase">Citizen Grievance & Societal Problem Submission Portal</h2>
        <p className="text-xs text-brandgray-muted mt-1 uppercase tracking-wider font-semibold">
          Report local community challenges directly to the National innovation matching queue.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* CITIZEN UPDATES NOTIFICATIONS */}
          {(() => {
            const citNotifs = notificationService.getNotificationsForUser("citizen-1", "CITIZEN");
            if (citNotifs.length === 0) return null;

            return (
              <div className="bg-white rounded-lg border border-blue-200 shadow-subtle p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-600" /> Updates On Your Submitted Problems
                  </span>
                  <a href="/notifications" className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1">
                    All Alerts <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="space-y-2">
                  {citNotifs.slice(0, 3).map((n) => (
                    <div key={n.id} className="p-3 bg-blue-50/50 border border-blue-150 rounded text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">{n.title}</span>
                        <span className="text-[10px] text-brandgray-muted">{formatRelativeTime(n.createdAt)}</span>
                      </div>
                      <p className="text-[11.5px] text-brandgray-text">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="bg-white rounded-lg border border-brandgray-border shadow-subtle overflow-hidden">
            <div className="px-5 py-4 border-b border-brandgray-border bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">My Submitted Problems</span>
              <span className="text-[10px] font-bold bg-primary-light text-primary border border-primary/10 px-2 py-0.5 rounded">
                Total: {problems.length}
              </span>
            </div>

            {problems.length === 0 ? (
              <div className="p-8 text-center text-xs text-brandgray-muted font-medium">
                No problems reported yet. Fill the form on the right to submit a community challenge.
              </div>
            ) : (
              <div className="divide-y divide-brandgray-border">
                {problems.map((prob) => {
                  const mockProb = universityMockService.getProblems().find(p => p.id === prob.id || p.title === prob.title);
                  const problemId = mockProb ? mockProb.id : prob.id;

                  const aiAnalysis = mockProb ? universityMockService.getProblemAnalysis(problemId) : null;
                  const project = universityMockService.getProjects().find(p => p.problemId === problemId);
                  
                  const friendlyStatus = getFriendlyStatus(prob);
                  const statusMessage = getWhatIsHappeningNow(prob);
                  
                  // AI status label
                  const aiStatusLabel = aiAnalysis 
                    ? `AI Analyzed (${aiAnalysis.engineUsed === "Gemini" ? "Gemini" : "Fallback Engine"})` 
                    : "AI Analysis: Pending";

                  // Duplicate status
                  const cluster = mockProb ? universityMockService.getClusterForProblem(mockProb.id) : null;
                  let duplicateLabel = "Independent Issue";
                  if (cluster) {
                    duplicateLabel = "Related to other community reports";
                  } else if (mockProb) {
                    const allProbs = universityMockService.getProblems();
                    const similarityCandidates = findSimilarProblems(mockProb, allProbs, id => universityMockService.getProblemAnalysis(id));
                    const activeSimilar = similarityCandidates.filter(c => c.similarityScore >= 60 && !universityMockService.isMarkedIndependent(mockProb.id, c.candidateId));
                    if (activeSimilar.length > 0) {
                      duplicateLabel = `Related to ${activeSimilar.length} report${activeSimilar.length > 1 ? 's' : ''}`;
                    }
                  }

                  // University/project status label
                  let projectLabel = null;
                  if (project) {
                    const resolvedProject = universityMockService.resolveProject(project);
                    if (resolvedProject) {
                      const stageLabel = STAGE_CONFIG[resolvedProject.stage]?.label || resolvedProject.stage.replace(/_/g, " ");
                      projectLabel = `${resolvedProject.collaboration.university} · ${stageLabel} (${resolvedProject.customProgress || 0}%)`;
                    }
                  } else {
                    const hasInterest = universityMockService.getInterests().some(i => i.problemId === problemId);
                    if (hasInterest) {
                      projectLabel = "University Matching in Progress";
                    }
                  }

                  let priorityColor = 'bg-gray-100 text-gray-800 border-gray-200';
                  if (prob.priority === 'CRITICAL') priorityColor = 'bg-red-100 text-red-800 border-red-200';
                  else if (prob.priority === 'HIGH') priorityColor = 'bg-orange-100 text-orange-800 border-orange-200';
                  else if (prob.priority === 'MEDIUM') priorityColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  else if (prob.priority === 'LOW') priorityColor = 'bg-green-100 text-green-800 border-green-200';

                  return (
                    <div 
                      key={prob.id} 
                      onClick={() => setSelectedProblem(prob)}
                      className="p-5 hover:bg-gray-50 transition-colors cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between space-x-4">
                        <div className="space-y-0.5">
                          <h3 className="text-sm sm:text-base font-bold text-primary hover:underline">{prob.title}</h3>
                          <span className="text-[10px] text-brandgray-muted font-medium">
                            Reported on {new Date(prob.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="inline-flex items-center space-x-1 text-[9px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded uppercase tracking-wider shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{friendlyStatus}</span>
                        </span>
                      </div>

                      <p className="text-xs text-brandgray-muted leading-relaxed line-clamp-2">
                        {prob.description}
                      </p>

                      {/* Dynamic status flags */}
                      <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                          <Brain className="h-3.5 w-3.5 text-indigo-500" /> {aiStatusLabel}
                        </span>
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-amber-500" /> {duplicateLabel}
                        </span>
                        {projectLabel && (
                          <span className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5 text-emerald-600" /> {projectLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-[11px] text-brandgray-muted">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase">
                            {prob.category}
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-semibold text-brandgray-text">{prob.district}, {prob.state}</span>
                          </span>
                          <span className={`inline-flex items-center text-[9px] font-extrabold border px-1.5 py-0.5 rounded uppercase tracking-wider ${priorityColor}`}>
                            {prob.priority} Priority
                          </span>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10.5px] font-bold border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 text-indigo-650"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProblem(prob);
                          }}
                        >
                          Track Progress →
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-brandgray-border shadow-subtle p-5 sticky top-20">
            <h3 className="text-sm font-bold text-primary uppercase border-b border-brandgray-border pb-2.5 mb-4 flex items-center space-x-1.5">
              <PlusCircle className="h-4.5 w-4.5 text-primary" />
              <span>Report Community Issue</span>
            </h3>

            {successMsg && (
              <div className="mb-4 p-3 bg-success-light border border-success/20 rounded text-success text-xs font-semibold">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-semibold flex items-start space-x-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Issue Title / Subject
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Garbage piling on Main Road, Sector 4"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Domain / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Explain the background, severity, and clear issues faced by residents..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Location (District, State)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Pune, Maharashtra"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Estimated Affected Population
                </label>
                <input
                  type="text"
                  value={affectedPopulation}
                  onChange={(e) => setAffectedPopulation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. 500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2 rounded transition-colors shadow-subtle border border-primary disabled:bg-primary/50"
              >
                {submitting ? 'Submitting Grievance...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ─── Problem Details Modal ─── */}
      {selectedProblem && (() => {
        const mockProb = universityMockService.getProblems().find(p => p.id === selectedProblem.id || p.title === selectedProblem.title);
        const problemId = mockProb ? mockProb.id : selectedProblem.id;

        const aiAnalysis = mockProb ? universityMockService.getProblemAnalysis(problemId) : null;
        const project = universityMockService.getProjects().find(p => p.problemId === problemId);
        const resolvedProject = project ? universityMockService.resolveProject(project) : null;
        
        const impact = project ? impactService.getImpactAssessmentForProject(project.id) : null;
        const isImpactVerified = impact && impact.status === "VERIFIED";

        const relatedList = getRelatedReports(selectedProblem);
        const timeline = getTimelineStages(selectedProblem);
        const happeningNow = getWhatIsHappeningNow(selectedProblem);

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-brandgray-border max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
              <div className="px-6 py-4 border-b border-brandgray-border flex justify-between items-center bg-gray-50">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Problem Tracking Console</span>
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="text-brandgray-muted hover:text-brandgray-text font-bold text-sm"
                >
                  ✕ Close
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: WHAT'S HAPPENING & TIMELINE */}
                <div className="space-y-6">
                  {/* What's happening now */}
                  <div className="p-4 bg-indigo-50 border border-indigo-150 rounded space-y-1">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">What&apos;s happening now?</span>
                    <p className="text-xs text-indigo-950 font-bold">{happeningNow}</p>
                  </div>

                  {/* Timeline progress stepper */}
                  <div className="space-y-3.5 border border-brandgray-border bg-white rounded-lg p-5">
                    <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider block flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-primary" /> Track My Problem Status
                    </span>
                    <div className="relative border-l border-slate-200 pl-4 ml-1.5 space-y-3.5">
                      {timeline.map((stage, idx) => (
                        <div key={idx} className="relative flex items-start gap-2.5 text-xs">
                          {stage.status === "COMPLETED" ? (
                            <div className="absolute -left-[22.5px] top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-white ring-4 ring-white">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          ) : stage.status === "CURRENT" ? (
                            <div className="absolute -left-[22.5px] top-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center text-white ring-4 ring-white animate-pulse">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="absolute -left-[22.5px] top-0.5 h-3.5 w-3.5 rounded-full bg-white border border-slate-350 ring-4 ring-white" />
                          )}
                          <div className="space-y-0.5">
                            <span className={`font-bold block leading-none ${stage.status === "COMPLETED" ? "text-emerald-800" : stage.status === "CURRENT" ? "text-amber-700 font-extrabold" : "text-slate-400"}`}>
                              {stage.label}
                            </span>
                            {stage.date && <span className="text-[9.5px] text-brandgray-muted font-medium">{stage.date}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Outcome Section */}
                  {project && resolvedProject ? (
                    <div className="p-4 bg-emerald-50/40 border border-emerald-150 rounded space-y-3">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-emerald-700" /> Active Project Outcome
                      </span>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-slate-800">
                        <div>
                          <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Project ID</span>
                          <span className="font-mono">{resolvedProject.id}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Current Stage</span>
                          <span>{STAGE_CONFIG[resolvedProject.stage]?.label || resolvedProject.stage.replace(/_/g, " ")} ({resolvedProject.progress}%)</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Project Title</span>
                          <span className="text-primary">{resolvedProject.title}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-brandgray-muted uppercase block">University Partners</span>
                          <span>{resolvedProject.collaboration.university}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Research Team</span>
                          <span>{resolvedProject.assignedTeam?.name || "Pending Selection"}</span>
                        </div>
                      </div>

                      <div className="border-t border-emerald-150 pt-2.5 mt-1 text-xs">
                        {isImpactVerified ? (
                          <div className="space-y-2 text-emerald-950">
                            <span className="font-bold text-[9px] uppercase text-emerald-850 block">Verified Impact Indicators:</span>
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 border border-emerald-150 p-2.5 rounded">
                              <div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase block">People Benefited</span>
                                <span>{impact.beneficiariesReached}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase block">Villages Covered</span>
                                <span>{impact.locationsCovered}</span>
                              </div>
                              {impact.impactMetrics.map(m => (
                                <div key={m.id}>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase block">{m.name}</span>
                                  <span>{m.value} {m.unit}</span>
                                </div>
                              ))}
                              <div className="col-span-2 border-t border-emerald-100 pt-1.5">
                                <span className="text-[9px] font-bold text-slate-500 uppercase block">Key Impact Outcome</span>
                                <span className="font-medium block mt-0.5 leading-relaxed">{impact.summary}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-brandgray-muted italic">Impact results will appear after government verification.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-brandgray-muted italic">
                      No active project has been started for this grievance yet. Outcomes will load once university matching completes.
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: ORIGINAL REPORT, AI ANALYSIS, DUPLICATE screening */}
                <div className="space-y-6">
                  
                  {/* Original Report */}
                  <div className="border border-brandgray-border bg-white rounded-lg p-5 space-y-3.5">
                    <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider block">Original Citizen Report</span>
                    <div className="space-y-2 text-xs font-semibold text-slate-800">
                      <div>
                        <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Reported Title</span>
                        <span className="text-primary font-bold text-sm block leading-snug">{selectedProblem.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-150 text-[11px]">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Category</span>
                          <span>{selectedProblem.category}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Location</span>
                          <span>{selectedProblem.district}, {selectedProblem.state}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Affected Area</span>
                          <span>{selectedProblem.affectedPopulation} residents</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Citizen Priority</span>
                          <span className="text-warning-hover uppercase">{selectedProblem.priority}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Description Details</span>
                        <p className="text-xs text-brandgray-text font-medium leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3 border border-brandgray-border rounded">
                          {selectedProblem.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {aiAnalysis ? (
                    <div className="border border-brandgray-border bg-white rounded-lg p-5 space-y-3">
                      <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider block flex items-center gap-1.5">
                        <Brain className="h-4.5 w-4.5 text-indigo-600" /> AI Problem Analysis
                      </span>
                      <div className="space-y-3 text-xs font-semibold text-slate-800">
                        <div>
                          <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Intelligent Summary</span>
                          <p className="text-xs text-brandgray-text font-medium leading-relaxed bg-indigo-50/20 p-2.5 border border-indigo-100 rounded">
                            {aiAnalysis.summary}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[9px] font-bold text-brandgray-muted uppercase block">AI Domain Category</span>
                            <span>{aiAnalysis.category}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-brandgray-muted uppercase block">AI Assigned Severity</span>
                            <span className="text-indigo-900 uppercase font-bold">{aiAnalysis.severity}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Required Experts</span>
                            <span className="text-primary font-bold">{aiAnalysis.requiredExpertise.join(", ")}</span>
                          </div>
                        </div>
                        {aiAnalysis.engineUsed === "Fallback Rule-Based Engine" && (
                          <div className="text-[10px] text-amber-700 bg-amber-50/50 border border-amber-250 p-2 rounded font-bold">
                            Analyzed using fallback intelligence engine
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-brandgray-muted italic">
                      AI diagnostic report is currently generating.
                    </div>
                  )}

                  {/* Related reports list */}
                  <div className="border border-brandgray-border bg-white rounded-lg p-5 space-y-3">
                    <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider block flex items-center gap-1.5">
                      <AlertOctagon className="h-4.5 w-4.5 text-slate-500" /> Related Community Reports
                    </span>
                    {relatedList.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-amber-800 font-semibold bg-amber-50 border border-amber-250 p-2 rounded text-[11px]">
                          This problem may be related to {relatedList.length} other community report{relatedList.length > 1 ? 's' : ''}.
                        </p>
                        <div className="divide-y divide-slate-100 border border-brandgray-border rounded bg-white max-h-40 overflow-y-auto">
                          {relatedList.map(r => (
                            <div key={r.id} className="p-2.5 flex justify-between items-center text-[11px] font-semibold hover:bg-slate-50">
                              <span className="font-bold text-primary truncate max-w-[70%]" title={r.title}>{r.title}</span>
                              <span className="text-[9.5px] font-extrabold text-indigo-750 uppercase bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
                                {getFriendlyStatus(r as any)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-brandgray-muted italic text-[11px] p-3 bg-slate-50/50 border border-brandgray-border rounded">
                        No related reports identified.
                      </p>
                    )}
                  </div>

                </div>

              </div>
              
              <div className="px-6 py-4 border-t border-brandgray-border bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded transition-colors shadow-subtle border border-primary"
                >
                  Close Console View
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
