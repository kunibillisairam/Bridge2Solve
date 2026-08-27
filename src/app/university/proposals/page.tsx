"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  Plus, 
  X, 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Eye,
  Edit,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Layers
} from "lucide-react";
import { 
  universityMockService, 
  SolutionProposal, 
  ResolvedProposal,
  CommunityProblem, 
  UniversityTeam,
  UniversityProject 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES = {
  DRAFT: "bg-slate-50 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-150",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-250",
  ACCEPTED: "bg-success-light text-success border-success/15",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

interface ProposalWithProject extends ResolvedProposal {
  project?: UniversityProject | null;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalWithProject[]>([]);
  const [eligibleProblems, setEligibleProblems] = useState<CommunityProblem[]>([]);
  const [availableTeams, setAvailableTeams] = useState<UniversityTeam[]>([]);

  // Page Mode: 'list' | 'create' | 'edit' | 'view'
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedProposal, setSelectedProposal] = useState<ProposalWithProject | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [problemId, setProblemId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [problemUnderstanding, setProblemUnderstanding] = useState("");
  const [proposedApproach, setProposedApproach] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [resourceRequirements, setResourceRequirements] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formActionType, setFormActionType] = useState<"draft" | "submit" | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const rawProposals = universityMockService.getProposals("univ-1");
    const resolved = rawProposals.map((p) => {
      const res = universityMockService.resolveProposal(p);
      const proj = universityMockService.getProjectForProposal(p.id);
      return { ...res, project: proj || null };
    });
    setProposals(resolved);

    const eligible = universityMockService.getEligibleProblemsForProposals("univ-1");
    setEligibleProblems(eligible);
  };

  useEffect(() => {
    if (problemId) {
      const teamsForProb = universityMockService.getTeamsForProblem(problemId, "univ-1");
      setAvailableTeams(teamsForProb);
      if (teamsForProb.length > 0 && (!teamId || !teamsForProb.some(t => t.id === teamId))) {
        setTeamId(teamsForProb[0].id);
      }
    } else {
      setAvailableTeams([]);
      setTeamId("");
    }
  }, [problemId]);

  const handleOpenCreate = () => {
    setEditingId(undefined);
    setTitle("");
    setProblemId(eligibleProblems.length > 0 ? eligibleProblems[0].id : "");
    setTeamId("");
    setProblemUnderstanding("");
    setProposedApproach("");
    setExpectedImpact("");
    setResourceRequirements("");
    setFormError("");
    setMode("create");
  };

  const handleOpenEdit = (proposal: ProposalWithProject) => {
    setEditingId(proposal.id);
    setTitle(proposal.title);
    setProblemId(proposal.problemId);
    setTeamId(proposal.teamId);
    setProblemUnderstanding(proposal.problemUnderstanding);
    setProposedApproach(proposal.proposedApproach);
    setExpectedImpact(proposal.expectedImpact);
    setResourceRequirements(proposal.resourceRequirements);
    setFormError("");
    setMode("edit");
  };

  const handleSaveProposal = (isSubmit: boolean) => {
    setFormError("");

    if (!title.trim() || !problemId || !teamId) {
      setFormError("Proposal Title, Target Community Problem, and Research Team are required.");
      return;
    }

    if (isSubmit && (!problemUnderstanding.trim() || !proposedApproach.trim() || !expectedImpact.trim())) {
      setFormError("Please fill out Problem Understanding, Proposed Approach, and Expected Impact before submitting.");
      return;
    }

    setIsFormSubmitting(true);
    setFormActionType(isSubmit ? "submit" : "draft");

    try {
      universityMockService.saveProposal(
        {
          id: editingId,
          problemId,
          teamId,
          title: title.trim(),
          problemUnderstanding: problemUnderstanding.trim(),
          proposedApproach: proposedApproach.trim(),
          expectedImpact: expectedImpact.trim(),
          resourceRequirements: resourceRequirements.trim(),
        },
        isSubmit,
        "univ-1"
      );

      setSuccessMessage(
        isSubmit 
          ? "Proposal submitted successfully! It is now under admin review."
          : "Proposal draft saved successfully."
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      setMode("list");
      setSelectedProposal(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save proposal.");
    } finally {
      setIsFormSubmitting(false);
      setFormActionType(null);
    }
  };

  const handleOpenView = (proposal: ProposalWithProject) => {
    setSelectedProposal(proposal);
    setMode("view");
  };

  const handleBackToList = () => {
    setSelectedProposal(null);
    setMode("list");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold text-primary">Solution Proposals</h2>
          <p className="text-xs text-brandgray-muted mt-1">
            Draft and submit research-backed solution proposals to secure funding and active project endorsements.
          </p>
        </div>
        {mode === "list" && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 font-semibold text-xs h-9"
          >
            <Plus className="h-4 w-4" /> Create Proposal
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-success-light text-success border border-success/15 rounded text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Render Mode: LIST */}
      {mode === "list" && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="text-center py-16 bg-white border border-brandgray-border rounded-md p-6 text-sm space-y-3 shadow-subtle max-w-xl mx-auto">
              <FileSpreadsheet className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-bold text-primary">No Proposals Formulated</p>
              <p className="text-xs text-brandgray-muted leading-relaxed">
                Your university has not drafted or submitted any solution proposals yet. Technical proposals containing budget estimates and research approaches are required before projects can be approved and executed by administrators.
              </p>
              <p className="text-[11px] font-bold text-primary">
                {"What next: Register interest in a community problem first, assign an active research team, and then click 'Draft Proposal' below to start."}
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={handleOpenCreate} className="h-8">
                  Draft Proposal
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/20 transition-all duration-150">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGES[proposal.status]}`}>
                          {proposal.status === "ACCEPTED" ? "Approved" : proposal.status === "UNDER_REVIEW" ? "Under Review" : proposal.status === "SUBMITTED" ? "Submitted" : proposal.status === "REJECTED" ? "Rejected" : "Draft"}
                        </span>

                        {proposal.status === "ACCEPTED" && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            Project Created
                          </span>
                        )}

                        {proposal.status === "REJECTED" && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                            Proposal Rejected
                          </span>
                        )}

                        {(proposal.status === "SUBMITTED" || proposal.status === "UNDER_REVIEW") && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Under Admin Review
                          </span>
                        )}

                        <span className="text-[10px] text-brandgray-muted flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {proposal.submittedAt ? `Submitted: ${proposal.submittedAt}` : `Drafted: ${proposal.createdAt}`}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-primary">
                        {proposal.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brandgray-muted">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> Problem: <span className="font-semibold text-brandgray-text">{proposal.problem ? proposal.problem.title : "Community Challenge"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Research Team: <span className="font-semibold text-brandgray-text">{proposal.team ? proposal.team.name : "Research Taskforce"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-wrap items-center gap-2">
                      {proposal.status === "ACCEPTED" && proposal.project && (
                        <Link href={`/university/projects/${proposal.project.id}`}>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-8 font-semibold text-xs flex items-center gap-1.5"
                          >
                            <Layers className="h-3.5 w-3.5" /> View Project
                          </Button>
                        </Link>
                      )}

                      {proposal.status === "DRAFT" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenEdit(proposal)}
                          className="h-8 font-semibold text-xs flex items-center gap-1 bg-white"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit Draft
                        </Button>
                      )}

                      <Button 
                        variant={proposal.status === "ACCEPTED" && proposal.project ? "outline" : "primary"}
                        size="sm" 
                        onClick={() => handleOpenView(proposal)}
                        className="h-8 font-semibold text-xs flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Proposal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Mode: CREATE / EDIT */}
      {(mode === "create" || mode === "edit") && (
        <Card className="border-brandgray-border shadow-standard bg-white max-w-3xl mx-auto">
          <CardHeader className="p-6 border-b border-brandgray-border/60 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">
                {mode === "edit" ? "Edit Proposal Draft" : "Create Solution Proposal"}
              </CardTitle>
              <CardDescription className="text-xs text-brandgray-muted">
                Draft research models, approach strategies, and funding requirements.
              </CardDescription>
            </div>
            <button onClick={handleBackToList} className="text-brandgray-muted hover:text-brandgray-text p-1">
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gravity Sand Filters for Sustainable Drinking Water"
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Select Problem and Team */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    COMMUNITY PROBLEM *
                  </label>
                  <select
                    value={problemId}
                    onChange={(e) => setProblemId(e.target.value)}
                    className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white font-medium"
                  >
                    <option value="">-- Select Community Problem --</option>
                    {eligibleProblems.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.location})
                      </option>
                    ))}
                  </select>
                  {eligibleProblems.length === 0 && (
                    <p className="text-[10px] text-amber-700 mt-1">
                      No eligible problems available. First express interest and assign a research team to a problem.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    RESEARCH TEAM *
                  </label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    disabled={!problemId || availableTeams.length === 0}
                    className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white font-medium disabled:opacity-50"
                  >
                    <option value="">-- Select Research Team --</option>
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.facultyMentor.split(" ")[0]})
                      </option>
                    ))}
                  </select>
                  {problemId && availableTeams.length === 0 && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">
                      No team assigned to this problem yet. Assign a team to this problem first.
                    </p>
                  )}
                </div>
              </div>

              {/* Problem Understanding */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Problem Understanding *
                </label>
                <textarea
                  value={problemUnderstanding}
                  onChange={(e) => setProblemUnderstanding(e.target.value)}
                  placeholder="Detail your academic analysis and understanding of the community issue..."
                  rows={3}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Proposed Approach */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Proposed Approach *
                </label>
                <textarea
                  value={proposedApproach}
                  onChange={(e) => setProposedApproach(e.target.value)}
                  placeholder="Detail the technical methodology, systems, and implementation strategy..."
                  rows={3}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Expected Impact */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Expected Impact *
                </label>
                <textarea
                  value={expectedImpact}
                  onChange={(e) => setExpectedImpact(e.target.value)}
                  placeholder="Quantify and describe the social, economic, or environmental outcome..."
                  rows={2}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Resource Requirements */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Resource Requirements
                </label>
                <input
                  type="text"
                  value={resourceRequirements}
                  onChange={(e) => setResourceRequirements(e.target.value)}
                  placeholder="e.g. ₹7,50,000 funding, laboratory filtration media, testing kits"
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-between gap-3 border-t border-brandgray-border/60">
                <Button variant="outline" size="sm" type="button" onClick={handleBackToList} disabled={isFormSubmitting}>
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button" 
                    onClick={() => handleSaveProposal(false)}
                    disabled={isFormSubmitting}
                    className="h-9 font-semibold text-xs border-brandgray-border hover:bg-brandgray-light"
                  >
                    {isFormSubmitting && formActionType === "draft" ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    type="button" 
                    onClick={() => handleSaveProposal(true)}
                    disabled={isFormSubmitting}
                    className="h-9 font-semibold text-xs"
                  >
                    {isFormSubmitting && formActionType === "submit" ? "Submitting..." : "Submit Proposal"}
                  </Button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Render Mode: VIEW */}
      {mode === "view" && selectedProposal && (
        <Card className="border-brandgray-border shadow-standard bg-white max-w-3xl mx-auto">
          <CardHeader className="p-6 border-b border-brandgray-border/60 flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGES[selectedProposal.status]}`}>
                  {selectedProposal.status}
                </span>
                <span className="text-[10.5px] text-brandgray-muted">
                  {selectedProposal.submittedAt ? `Submitted: ${selectedProposal.submittedAt}` : `Created: ${selectedProposal.createdAt}`}
                </span>
              </div>
              <CardTitle className="text-base font-bold text-primary">
                {selectedProposal.title}
              </CardTitle>
              <span className="text-[10px] font-bold text-brandgray-muted block">
                Proposal ID: {selectedProposal.id}
              </span>
            </div>
            <button onClick={handleBackToList} className="text-brandgray-muted hover:text-brandgray-text p-1">
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Status Feedback Callouts */}
            {selectedProposal.status === "ACCEPTED" && selectedProposal.project && (
              <div className="p-4 bg-success-light text-success border border-success/15 rounded text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span className="font-semibold">This proposal has been APPROVED by Admin. Project {selectedProposal.project.id} is active!</span>
                </div>
                <Link href={`/university/projects/${selectedProposal.project.id}`}>
                  <Button variant="primary" size="sm" className="h-8 font-semibold text-xs flex items-center gap-1 shrink-0">
                    <Layers className="h-3.5 w-3.5" /> View Project
                  </Button>
                </Link>
              </div>
            )}

            {selectedProposal.status === "DRAFT" && (
              <div className="p-3.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>This proposal is saved as a draft. You can continue editing or submit it for review.</span>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleOpenEdit(selectedProposal)}
                  className="h-7 text-[11px] font-semibold shrink-0"
                >
                  Edit Draft
                </Button>
              </div>
            )}

            {(selectedProposal.status === "SUBMITTED" || selectedProposal.status === "UNDER_REVIEW") && (
              <div className="p-3.5 bg-blue-50 text-blue-900 border border-blue-150 rounded text-xs flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-blue-600" />
                <span>Proposal is currently UNDER ADMIN REVIEW. Outcome will be updated once evaluated.</span>
              </div>
            )}

            {/* Community Problem Section */}
            <div className="p-4 border border-brandgray-border rounded bg-brandgray-light/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  COMMUNITY PROBLEM
                </span>
                <Link href={`/university/problems/${selectedProposal.problemId}`}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] font-semibold flex items-center gap-1 bg-white">
                    View Problem <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              {selectedProposal.problem ? (
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-primary">{selectedProposal.problem.title}</h4>
                  <p className="text-brandgray-text/95 leading-relaxed">{selectedProposal.problem.description}</p>
                  <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-brandgray-muted">
                    <span>Category: <strong className="text-brandgray-text">{selectedProposal.problem.category}</strong></span>
                    <span>Location: <strong className="text-brandgray-text">{selectedProposal.problem.location}</strong></span>
                    <span>Impact: <strong className="text-brandgray-text">{selectedProposal.problem.affectedPopulation}</strong></span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-brandgray-muted italic">Problem record not loaded.</p>
              )}
            </div>

            {/* Research Team Section */}
            <div className="p-4 border border-brandgray-border rounded bg-brandgray-light/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  RESEARCH TEAM
                </span>
                <Link href="/university/teams">
                  <Button variant="outline" size="sm" className="h-7 text-[11px] font-semibold flex items-center gap-1 bg-white">
                    View Team <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              {selectedProposal.team ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <h4 className="font-bold text-primary">{selectedProposal.team.name}</h4>
                    <p className="text-brandgray-muted flex items-center gap-1 mt-0.5">
                      <GraduationCap className="h-3.5 w-3.5" /> Faculty Mentor: <strong className="text-brandgray-text">{selectedProposal.team.facultyMentor}</strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedProposal.team.studentMembers.map((m, i) => (
                      <span key={i} className="text-[10px] bg-white border border-brandgray-border text-brandgray-text px-2 py-0.5 rounded">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-brandgray-muted italic">Team record not loaded.</p>
              )}
            </div>

            {/* Solution Sections */}
            {[
              { label: "Problem Understanding", content: selectedProposal.problemUnderstanding },
              { label: "Proposed Approach", content: selectedProposal.proposedApproach },
              { label: "Expected Impact", content: selectedProposal.expectedImpact },
              { label: "Resource Requirements", content: selectedProposal.resourceRequirements },
            ].map((section) => (
              <div key={section.label} className="space-y-1.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  {section.label}
                </h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed bg-slate-50/50 border border-slate-100 p-3.5 rounded whitespace-pre-wrap">
                  {section.content || <span className="italic text-brandgray-muted">No content provided</span>}
                </p>
              </div>
            ))}

            <div className="pt-4 border-t border-brandgray-border/60 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleBackToList}>
                Back to Proposals List
              </Button>
              {selectedProposal.status === "DRAFT" && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleSaveProposal(true)}
                  className="font-semibold text-xs"
                >
                  Submit Proposal Now
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      )}

    </div>
  );
}
