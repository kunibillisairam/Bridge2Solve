"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Briefcase, 
  Users, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Building, 
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react";
import { 
  universityMockService, 
  ResolvedProposal, 
  UniversityProject 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_BADGES = {
  DRAFT: "bg-slate-50 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-150",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-250",
  ACCEPTED: "bg-success-light text-success border-success/15",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminProposalDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<ResolvedProposal | null>(null);
  const [createdProject, setCreatedProject] = useState<UniversityProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal confirmation states
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "clarify" | null>(null);
  const [decisionReason, setDecisionReason] = useState("");

  const handleSetConfirmAction = (action: "approve" | "reject" | "clarify" | null) => {
    setConfirmAction(action);
    setDecisionReason("");
  };

  useEffect(() => {
    if (id) {
      loadDetails(id);
    }
  }, [id]);

  const loadDetails = (proposalId: string) => {
    const rawProposal = universityMockService.getProposalById(proposalId);
    if (rawProposal) {
      const resolved = universityMockService.resolveProposal(rawProposal);
      setProposal(resolved);

      // Check if project was created for this proposal
      const proj = universityMockService.getProjectForProposal(proposalId);
      setCreatedProject(proj || null);
    }
    setLoading(false);
  };

  const handleApprove = () => {
    if (!proposal) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      // Calls service with duplicate protection
      const result = universityMockService.approveProposal(proposal.id, "admin-1");
      setCreatedProject(result.project);

      setFeedbackMsg({
        type: "success",
        text: result.isNew 
          ? `Proposal approved successfully! Project ${result.project.id} created.` 
          : `Proposal is already approved. Viewing existing Project ${result.project.id}.`,
      });

      // Reload
      loadDetails(proposal.id);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Approval failed." });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleReject = () => {
    if (!proposal) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      universityMockService.rejectProposal(proposal.id, decisionReason);
      setFeedbackMsg({ type: "success", text: "Proposal rejected." });
      loadDetails(proposal.id);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Action failed." });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleClarify = () => {
    if (!proposal) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      universityMockService.requestProposalClarification(proposal.id, decisionReason);
      setFeedbackMsg({ type: "success", text: "Clarification requested from university team." });
      loadDetails(proposal.id);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Action failed." });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-brandgray-muted">Proposal not found.</p>
        <Link href="/admin/proposals">
          <Button variant="outline" size="sm">Back to Admin Proposals</Button>
        </Link>
      </div>
    );
  }

  const isPendingReview = proposal.status === "SUBMITTED" || proposal.status === "UNDER_REVIEW";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Back Link */}
      <div>
        <Link 
          href="/admin/proposals" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brandgray-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Review List
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold text-brandgray-muted tracking-wider uppercase">
              PROPOSAL ID: {proposal.id}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${STATUS_BADGES[proposal.status]}`}>
              {proposal.status === "ACCEPTED" ? "Approved" : proposal.status === "UNDER_REVIEW" ? "Under Review" : proposal.status === "SUBMITTED" ? "Submitted" : proposal.status === "REJECTED" ? "Rejected" : "Draft"}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary">
            {proposal.title}
          </h1>
        </div>

        {createdProject && (
          <Link href={`/admin/projects/${createdProject.id}`}>
            <Button variant="primary" size="sm" className="flex items-center gap-1.5 font-semibold text-xs h-9">
              <Layers className="h-4 w-4" /> View Created Project ({createdProject.id})
            </Button>
          </Link>
        )}
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded text-xs font-semibold flex items-center gap-2 border ${
          feedbackMsg.type === "success" 
            ? "bg-success-light text-success border-success/15" 
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {feedbackMsg.type === "success" ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Admin Decision Action Banner */}
      <Card className="border-brandgray-border shadow-standard bg-white">
        <CardHeader className="p-5 border-b border-brandgray-border/60">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-700" /> Admin Decision & Action Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {isPendingReview ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-primary">Administrative Action Required</h4>
                <p className="text-[11px] text-brandgray-muted">
                  Review solution details below. Approving automatically provisions a project stage record.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSetConfirmAction("clarify")}
                  className="h-9 font-semibold text-xs border-amber-250 text-amber-800 bg-amber-50 hover:bg-amber-100"
                >
                  <HelpCircle className="h-3.5 w-3.5 mr-1" /> Request Clarification
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSetConfirmAction("reject")}
                  className="h-9 font-semibold text-xs border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Proposal
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleSetConfirmAction("approve")}
                  className="h-9 font-semibold text-xs px-4"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve & Create Project
                </Button>
              </div>
            </div>
          ) : proposal.status === "ACCEPTED" ? (
            <div className="p-3.5 bg-success-light text-success border border-success/15 rounded text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span className="font-semibold">This proposal was formally approved by Administration. Project is active.</span>
              </div>
              {createdProject && (
                <Link href={`/admin/projects/${createdProject.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] font-semibold bg-white">
                    View Project ({createdProject.id})
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs flex items-center gap-2 font-semibold">
              <XCircle className="h-4.5 w-4.5 shrink-0" />
              <span>This proposal was rejected during administration review.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Solution Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Solution Breakdown */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Proposed Technical Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Problem Understanding</h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed bg-slate-50/60 border border-slate-100 p-3.5 rounded whitespace-pre-wrap">
                  {proposal.problemUnderstanding}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Proposed Approach & Methodology</h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed bg-slate-50/60 border border-slate-100 p-3.5 rounded whitespace-pre-wrap">
                  {proposal.proposedApproach}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Expected Social / Technical Impact</h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed bg-slate-50/60 border border-slate-100 p-3.5 rounded whitespace-pre-wrap">
                  {proposal.expectedImpact}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Resource & Financial Requirements</h4>
                <p className="text-xs text-brandgray-text/95 leading-relaxed bg-slate-50/60 border border-slate-100 p-3.5 rounded whitespace-pre-wrap">
                  {proposal.resourceRequirements}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Community Problem Info */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-brandgray-muted" /> Target Community Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {proposal.problem ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-primary">{proposal.problem.title}</h3>
                    <span className="text-[10px] font-semibold bg-primary-light text-primary border border-primary/10 px-2 py-0.5 rounded">
                      {proposal.problem.category}
                    </span>
                  </div>
                  <p className="text-xs text-brandgray-text/90 leading-relaxed">
                    {proposal.problem.description}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-brandgray-muted border-t border-brandgray-border/40">
                    <div>Location: <strong className="text-brandgray-text">{proposal.problem.location}</strong></div>
                    <div>Affected: <strong className="text-brandgray-text">{proposal.problem.affectedPopulation}</strong></div>
                    <div>Priority: <strong className="text-brandgray-text">{proposal.problem.priority}</strong></div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-brandgray-muted italic">Problem details not loaded.</p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Meta Sidebar */}
        <div className="space-y-6">
          
          {/* Proposal Meta Card */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Submission Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-brandgray-light pb-2">
                <span className="text-brandgray-muted">Proposal ID</span>
                <span className="font-bold text-primary">{proposal.id}</span>
              </div>
              <div className="flex justify-between border-b border-brandgray-light pb-2">
                <span className="text-brandgray-muted">Created Date</span>
                <span className="font-semibold text-brandgray-text">{proposal.createdAt}</span>
              </div>
              <div className="flex justify-between border-b border-brandgray-light pb-2">
                <span className="text-brandgray-muted">Submitted Date</span>
                <span className="font-semibold text-brandgray-text">{proposal.submittedAt || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brandgray-muted">Estimated Timeline</span>
                <span className="font-semibold text-brandgray-text">{proposal.timeline || "4 months"}</span>
              </div>
            </CardContent>
          </Card>

          {/* University & Research Team */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Building className="h-4 w-4 text-brandgray-muted" /> University & Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">University Institution</span>
                <span className="font-bold text-primary text-sm mt-0.5 block">Indian Institute of Science</span>
                <span className="text-brandgray-muted text-[11px]">Department of Research & Innovation</span>
              </div>

              {proposal.team ? (
                <div className="space-y-2 border-t border-brandgray-border/40 pt-3">
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Assigned Research Team</span>
                    <span className="font-bold text-primary block mt-0.5">{proposal.team.name}</span>
                    <span className="text-brandgray-muted flex items-center gap-1 mt-1 text-[11px]">
                      <GraduationCap className="h-3.5 w-3.5" /> Mentor: <strong className="text-brandgray-text">{proposal.team.facultyMentor}</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block mb-1">Student Members</span>
                    <div className="flex flex-wrap gap-1">
                      {proposal.team.studentMembers.map((m, i) => (
                        <span key={i} className="text-[10px] bg-brandgray-light text-brandgray-text border border-brandgray-border px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-brandgray-muted italic">Team details not loaded.</p>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md border border-brandgray-border shadow-standard w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
              {confirmAction === "approve" && "Confirm Proposal Approval"}
              {confirmAction === "reject" && "Confirm Proposal Rejection"}
              {confirmAction === "clarify" && "Request Clarification"}
            </h3>

            <p className="text-xs text-brandgray-muted leading-relaxed">
              {confirmAction === "approve" && "Approving this proposal will update its status to ACCEPTED and automatically provision a single project record (Stage: PROPOSAL_APPROVED)."}
              {confirmAction === "reject" && "Are you sure you want to reject this proposal? The university team will be notified."}
              {confirmAction === "clarify" && "Request technical clarification from the faculty mentor and research team."}
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brandgray-text uppercase block">
                Decision Note / Remarks {confirmAction === "reject" || confirmAction === "clarify" ? "*" : "(Optional)"}
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder={
                  confirmAction === "reject"
                    ? "e.g. Budget justification insufficient."
                    : confirmAction === "clarify"
                    ? "e.g. Beneficiary measurement methodology requires clarification."
                    : "e.g. Approved for field trial implementation."
                }
                rows={3}
                className="w-full text-xs p-2 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
                required={confirmAction === "reject" || confirmAction === "clarify"}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-brandgray-border/60">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSetConfirmAction(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={confirmAction === "approve" ? "primary" : confirmAction === "reject" ? "outline" : "primary"}
                size="sm"
                onClick={confirmAction === "approve" ? handleApprove : confirmAction === "reject" ? handleReject : handleClarify}
                disabled={actionLoading || ((confirmAction === "reject" || confirmAction === "clarify") && !decisionReason.trim())}
                className={confirmAction === "reject" ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" : ""}
              >
                {actionLoading ? (
                  confirmAction === "approve" ? "Approving..." : confirmAction === "reject" ? "Rejecting..." : "Requesting..."
                ) : (
                  confirmAction === "approve" ? "Approve & Launch Project" : confirmAction === "reject" ? "Reject Proposal" : "Send Request"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
