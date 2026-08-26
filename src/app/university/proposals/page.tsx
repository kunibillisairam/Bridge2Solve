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
  Eye
} from "lucide-react";
import { 
  universityMockService, 
  SolutionProposal, 
  CommunityProblem, 
  UniversityTeam 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES = {
  DRAFT: "bg-slate-50 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-150",
  UNDER_REVIEW: "bg-amber-55 text-amber-700 border-amber-250",
  ACCEPTED: "bg-success-light text-success border-success/15",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [teams, setTeams] = useState<UniversityTeam[]>([]);

  // Page Mode: 'list' or 'create' or 'view'
  const [mode, setMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedProposal, setSelectedProposal] = useState<SolutionProposal | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [problemId, setProblemId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [problemUnderstanding, setProblemUnderstanding] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [technologyApproach, setTechnologyApproach] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [requiredResources, setRequiredResources] = useState("");
  const [timeline, setTimeline] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProposals(universityMockService.getProposals());
    setProblems(universityMockService.getProblems());
    setTeams(universityMockService.getTeams());
  };

  const handleCreateProposal = (status: "DRAFT" | "SUBMITTED") => {
    setFormError("");

    if (!title.trim() || !problemId || !teamId) {
      setFormError("Proposal Title, Selected Problem, and Assigned Team are required.");
      return;
    }

    const matchedProblem = problems.find((p) => p.id === problemId);
    const matchedTeam = teams.find((t) => t.id === teamId);

    if (!matchedProblem || !matchedTeam) {
      setFormError("Invalid problem or team selected.");
      return;
    }

    universityMockService.createProposal({
      title: title.trim(),
      problemId,
      problemTitle: matchedProblem.title,
      teamId,
      teamName: matchedTeam.name,
      problemUnderstanding: problemUnderstanding.trim(),
      proposedSolution: proposedSolution.trim(),
      technologyApproach: technologyApproach.trim(),
      expectedImpact: expectedImpact.trim(),
      requiredResources: requiredResources.trim(),
      timeline: timeline.trim(),
      status,
    });

    // Reset Form
    setTitle("");
    setProblemId("");
    setTeamId("");
    setProblemUnderstanding("");
    setProposedSolution("");
    setTechnologyApproach("");
    setExpectedImpact("");
    setRequiredResources("");
    setTimeline("");
    
    // Switch Mode
    setMode("list");
    
    // Reload
    loadData();
  };

  const handleOpenView = (proposal: SolutionProposal) => {
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
            onClick={() => setMode("create")}
            className="flex items-center gap-1.5 font-semibold text-xs h-9"
          >
            <Plus className="h-4 w-4" /> Create Proposal
          </Button>
        )}
      </div>

      {/* Render Modes */}
      {mode === "list" && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="text-center py-16 bg-white border border-brandgray-border rounded-md text-brandgray-muted text-sm space-y-2 shadow-subtle">
              <FileSpreadsheet className="h-8 w-8 mx-auto opacity-30 text-brandgray-muted" />
              <p className="font-semibold text-brandgray-text">No proposals drafted yet</p>
              <p className="text-xs max-w-xs mx-auto">Create a proposal to address any matched community problems.</p>
              <Button variant="outline" size="sm" onClick={() => setMode("create")} className="mt-2 h-8">
                Draft Proposal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="border-brandgray-border shadow-subtle bg-white">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGES[proposal.status]}`}>
                          {proposal.status}
                        </span>
                        <span className="text-[10px] text-brandgray-muted flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Submitted: {proposal.submittedDate}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-primary">
                        {proposal.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brandgray-muted">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> Challenge: <span className="font-semibold text-brandgray-text">{proposal.problemTitle}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Research Team: <span className="font-semibold text-brandgray-text">{proposal.teamName}</span>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-end gap-2.5">
                      <Button 
                        variant="outline" 
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

      {mode === "create" && (
        <Card className="border-brandgray-border shadow-standard bg-white max-w-3xl mx-auto">
          <CardHeader className="p-6 border-b border-brandgray-border/60 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">
                Create Solution Proposal
              </CardTitle>
              <CardDescription className="text-xs text-brandgray-muted">
                Draft research models, funding requirements, and timeline milestones.
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
                    Target Problem Challenge *
                  </label>
                  <select
                    value={problemId}
                    onChange={(e) => setProblemId(e.target.value)}
                    className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                  >
                    <option value="">-- Select Problem --</option>
                    {problems.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Assigned Research Team *
                  </label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                  >
                    <option value="">-- Select Team --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.facultyMentor.split(" ")[1]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Problem Understanding */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Problem Understanding
                </label>
                <textarea
                  value={problemUnderstanding}
                  onChange={(e) => setProblemUnderstanding(e.target.value)}
                  placeholder="Detail your analysis of the community issue..."
                  rows={3}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Proposed Solution */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Proposed Solution
                </label>
                <textarea
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  placeholder="Detail the core mechanics of your proposed solution..."
                  rows={3}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Tech and Approach */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Technology / Approach
                </label>
                <textarea
                  value={technologyApproach}
                  onChange={(e) => setTechnologyApproach(e.target.value)}
                  placeholder="Detail the materials, systems, and tools to be used..."
                  rows={2}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Expected Impact */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Expected Impact
                </label>
                <textarea
                  value={expectedImpact}
                  onChange={(e) => setExpectedImpact(e.target.value)}
                  placeholder="Quantify and describe the social or environmental outcome..."
                  rows={2}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              {/* Resources & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Required Resources
                  </label>
                  <input
                    type="text"
                    value={requiredResources}
                    onChange={(e) => setRequiredResources(e.target.value)}
                    placeholder="e.g. Funding, laboratory equipment..."
                    className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Estimated Timeline
                  </label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 4 months, 1 year..."
                    className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-between gap-3 border-t border-brandgray-border/60">
                <Button variant="outline" size="sm" type="button" onClick={handleBackToList}>
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button" 
                    onClick={() => handleCreateProposal("DRAFT")}
                    className="h-9 font-semibold text-xs border-brandgray-border hover:bg-brandgray-light"
                  >
                    Save Draft
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    type="button" 
                    onClick={() => handleCreateProposal("SUBMITTED")}
                    className="h-9 font-semibold text-xs"
                  >
                    Submit Proposal
                  </Button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {mode === "view" && selectedProposal && (
        <Card className="border-brandgray-border shadow-standard bg-white max-w-3xl mx-auto">
          <CardHeader className="p-6 border-b border-brandgray-border/60 flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGES[selectedProposal.status]}`}>
                  {selectedProposal.status}
                </span>
                <span className="text-[10.5px] text-brandgray-muted">
                  Submitted: {selectedProposal.submittedDate}
                </span>
              </div>
              <CardTitle className="text-base font-bold text-primary">
                {selectedProposal.title}
              </CardTitle>
            </div>
            <button onClick={handleBackToList} className="text-brandgray-muted hover:text-brandgray-text p-1">
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Meta row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-brandgray-border rounded bg-brandgray-light/30">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brandgray-muted shrink-0" />
                <div className="text-xs">
                  <span className="text-brandgray-muted block leading-none">Target Challenge</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{selectedProposal.problemTitle}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brandgray-muted shrink-0" />
                <div className="text-xs">
                  <span className="text-brandgray-muted block leading-none">Assigned Team</span>
                  <span className="font-semibold text-brandgray-text mt-1.5 block">{selectedProposal.teamName}</span>
                </div>
              </div>
            </div>

            {/* Sections */}
            {[
              { label: "Problem Understanding", content: selectedProposal.problemUnderstanding },
              { label: "Proposed Solution", content: selectedProposal.proposedSolution },
              { label: "Technology / Approach", content: selectedProposal.technologyApproach },
              { label: "Expected Impact", content: selectedProposal.expectedImpact },
              { label: "Required Resources", content: selectedProposal.requiredResources },
              { label: "Estimated Timeline", content: selectedProposal.timeline },
            ].map((section) => (
              <div key={section.label} className="space-y-1.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  {section.label}
                </h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed bg-slate-50/50 border border-slate-100 p-3 rounded whitespace-pre-wrap">
                  {section.content || <span className="italic text-brandgray-muted">No content provided</span>}
                </p>
              </div>
            ))}

            <div className="pt-4 border-t border-brandgray-border/60 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleBackToList}>
                Back to Proposals
              </Button>
            </div>

          </CardContent>
        </Card>
      )}

    </div>
  );
}
