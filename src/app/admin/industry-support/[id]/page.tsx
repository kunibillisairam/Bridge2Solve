"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Users, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Handshake, 
  DollarSign, 
  Clock, 
  FileText,
  ArrowLeft,
  MessageSquare,
  XCircle,
  HelpCircle
} from "lucide-react";
import { 
  industryService, 
  IndustrySupportRequest, 
  SupportStatus, 
  SUPPORT_TYPE_LABELS, 
  SUPPORT_STATUS_BADGES 
} from "@/services/industryService";
import { ResolvedProject, STAGE_CONFIG } from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminSupportRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<IndustrySupportRequest | null>(null);
  const [project, setProject] = useState<ResolvedProject | null>(null);

  // Modal States
  const [activeModal, setActiveModal] = useState<"ACCEPT" | "REJECT" | "CLARIFICATION" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [clarificationNote, setClarificationNote] = useState("");
  
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRequestDetails();
  }, [requestId]);

  const loadRequestDetails = () => {
    const r = industryService.getSupportRequestById(requestId);
    if (r) {
      setRequest(r);
      const p = industryService.getEligibleProjectById(r.projectId);
      if (p) setProject(p);
    }
  };

  const handleUpdateStatus = (
    status: SupportStatus, 
    notes?: { rejectionReason?: string; clarificationNote?: string }
  ) => {
    setStatusError("");
    setStatusSuccess("");
    setIsSubmitting(true);

    try {
      // Server-side role check: passes "ADMIN"
      const updated = industryService.updateSupportRequestStatus(requestId, status, notes, "ADMIN");
      setRequest(updated);

      const statusLabels: Record<SupportStatus, string> = {
        PENDING: "PENDING",
        UNDER_REVIEW: notes?.clarificationNote ? "UNDER REVIEW (Clarification Requested)" : "UNDER REVIEW",
        ACCEPTED: "ACCEPTED",
        REJECTED: "REJECTED",
        WITHDRAWN: "WITHDRAWN",
      };

      setStatusSuccess(`Support request updated to ${statusLabels[status]}!`);
      setActiveModal(null);
      setRejectionReason("");
      setClarificationNote("");
      loadRequestDetails();
    } catch (err: any) {
      setStatusError(err.message || "Failed to update support request status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm font-semibold text-primary">Support Request Not Found</p>
        <p className="text-xs text-brandgray-muted">The requested support request ID does not exist.</p>
        <Link href="/admin/industry-support">
          <Button variant="outline" size="sm">Back to Support Requests</Button>
        </Link>
      </div>
    );
  }

  const profile = industryService.getProfile(request.industryId);

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/industry-support" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Industry Support Requests
        </Link>
        <span className="text-xs text-brandgray-muted">Request ID: <span className="font-mono font-bold text-primary">{request.id}</span></span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded">
                {request.id}
              </span>
              <span className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                {SUPPORT_TYPE_LABELS[request.supportType]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary">{request.industryName}</h1>
            <p className="text-xs text-brandgray-muted flex items-center gap-2 font-medium">
              Target Project: <span className="font-bold text-primary">{project ? project.title : request.projectId}</span> · Submitted: <span className="font-medium text-brandgray-text">{request.createdAt}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded border ${SUPPORT_STATUS_BADGES[request.status]}`}>
              Status: {request.status === "ACCEPTED" ? "Approved" : request.status === "UNDER_REVIEW" ? "Under Review" : request.status === "PENDING" ? "Pending" : "Rejected"}
            </span>
          </div>
        </div>

        {/* Status Feedback Banners */}
        {statusSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
            {statusSuccess}
          </div>
        )}

        {statusError && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
            {statusError}
          </div>
        )}

        {/* Existing Notes Display */}
        {request.clarificationNote && (
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded text-xs space-y-1">
            <span className="font-bold text-indigo-900 uppercase text-[10.5px] block">Clarification Note Requested</span>
            <p className="text-indigo-950 font-medium">{request.clarificationNote}</p>
          </div>
        )}

        {request.rejectionReason && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded text-xs space-y-1">
            <span className="font-bold text-red-800 uppercase text-[10.5px] block">Rejection Reason Provided</span>
            <p className="text-red-900 font-medium">{request.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* ADMIN ACTION CONTROLS */}
      <Card className="border-primary/20 shadow-subtle bg-slate-50">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Administrative Decision Controls</h3>
            <p className="text-[11px] text-brandgray-muted">Review support details and execute official decision.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {request.status === "PENDING" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs font-bold text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                disabled={isSubmitting}
              >
                <Clock className="h-3.5 w-3.5 mr-1" /> Mark Under Review
              </Button>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs font-bold text-amber-800 hover:bg-amber-50 border-amber-300"
              onClick={() => setActiveModal("CLARIFICATION")}
              disabled={isSubmitting}
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1" /> Request Clarification
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs font-bold text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => setActiveModal("REJECT")}
              disabled={isSubmitting || request.status === "REJECTED"}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Support
            </Button>

            <Button 
              variant="primary" 
              size="sm" 
              className="h-9 text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
              onClick={() => setActiveModal("ACCEPT")}
              disabled={isSubmitting || request.status === "ACCEPTED"}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Support Offer & Industry Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. SUPPORT OFFER DETAILS */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Handshake className="h-4 w-4 text-primary" /> Proposed Support Offer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-150">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Support Category</span>
                  <span className="font-bold text-primary">{SUPPORT_TYPE_LABELS[request.supportType]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Estimated Funding</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {request.estimatedFunding ? `₹${request.estimatedFunding.toLocaleString()}` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Expected Duration</span>
                  <span className="font-semibold text-brandgray-text">{request.expectedDuration || "Flexible"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">Support Description</span>
                <p className="text-xs text-brandgray-text leading-relaxed bg-white p-3 rounded border border-brandgray-border">
                  {request.description}
                </p>
              </div>

              {request.resourcesOffered && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">Equipment & Resources Offered</span>
                  <p className="text-xs text-brandgray-text leading-relaxed bg-white p-3 rounded border border-brandgray-border">
                    {request.resourcesOffered}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. INDUSTRY ORGANIZATION INFORMATION */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Organization Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Organization Name</span>
                  <span className="font-bold text-primary">{profile.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Organization Type</span>
                  <span className="font-semibold text-primary">{profile.orgType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Representative</span>
                  <span className="font-semibold text-brandgray-text">{profile.representativeName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Email & Phone</span>
                  <span className="font-medium text-brandgray-text">{profile.email} · {profile.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">HQ Location</span>
                  <span className="font-medium text-brandgray-text">{profile.location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Website</span>
                  <a href={profile.website} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{profile.website}</a>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-150">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">CSR Focus Areas</span>
                <div className="flex flex-wrap gap-1">
                  {profile.csrFocusAreas.map((area, i) => (
                    <span key={i} className="text-[10.5px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                      ✓ {area}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. TARGET PROJECT & PROBLEM CONTEXT */}
          {project && (
            <Card className="border-brandgray-border shadow-subtle bg-white">
              <CardHeader className="p-5 border-b border-brandgray-border/60">
                <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Target Project & Community Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase bg-primary-light px-2 py-0.5 rounded">
                      {project.id}
                    </span>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase">
                      {project.originalProblem.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-primary">{project.title}</h4>
                  <p className="text-brandgray-text leading-relaxed">{project.originalProblem.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded border border-slate-150">
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">University</span>
                    <span className="font-semibold text-primary">{project.collaboration.university}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Research Team</span>
                    <span className="font-semibold text-primary">{project.assignedTeam ? project.assignedTeam.name : "Team Pending"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Current Stage</span>
                    <span className="font-bold text-indigo-900">{STAGE_CONFIG[project.stage]?.label || project.stage}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Sidebar: Timeline & Verification */}
        <div className="space-y-6">
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Review Metadata & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Submitted Date</span>
                <span className="font-semibold text-primary">{request.createdAt}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Last Reviewed</span>
                <span className="font-semibold text-primary">{request.reviewedAt || "Not Reviewed"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-brandgray-muted">Assigned Reviewer</span>
                <span className="font-semibold text-primary">{request.adminReviewerId || "Platform Admin"}</span>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded space-y-1 pt-2">
                <span className="font-bold text-[10px] uppercase block">Security & Validation</span>
                <p className="text-[11px] leading-relaxed">
                  ✓ Verified Corporate Entity<br />
                  ✓ Valid Active Target Project<br />
                  ✓ Unique Active Request
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ACCEPT MODAL */}
      {activeModal === "ACCEPT" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-brandgray-border text-xs">
            <div className="flex justify-between items-center border-b border-brandgray-border pb-3">
              <h3 className="font-bold text-primary text-base">Accept Industry Support?</h3>
              <button onClick={() => setActiveModal(null)} className="text-brandgray-muted hover:text-primary"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded space-y-1">
              <p className="font-bold text-emerald-900 text-xs">Organization: {request.industryName}</p>
              <p className="text-emerald-800">Target Project: {project ? project.title : request.projectId}</p>
              <p className="text-emerald-800">Support Type: {SUPPORT_TYPE_LABELS[request.supportType]}</p>
              {request.estimatedFunding && (
                <p className="font-bold text-emerald-900">Funding: ₹{request.estimatedFunding.toLocaleString()}</p>
              )}
            </div>

            <p className="text-brandgray-muted leading-relaxed">
              Accepting this request associates the industry support with the target project and updates the status to ACCEPTED. This does NOT alter the project&apos;s lifecycle stage.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-brandgray-border">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>Cancel</Button>
              <Button variant="primary" size="sm" className="font-bold bg-emerald-700 hover:bg-emerald-800" onClick={() => handleUpdateStatus("ACCEPTED")} disabled={isSubmitting}>
                Confirm Acceptance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {activeModal === "REJECT" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-brandgray-border text-xs">
            <div className="flex justify-between items-center border-b border-brandgray-border pb-3">
              <h3 className="font-bold text-primary text-base">Reject Industry Support Request</h3>
              <button onClick={() => setActiveModal(null)} className="text-brandgray-muted hover:text-primary"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-primary block">Rejection Reason (Optional)</label>
              <textarea 
                rows={3}
                placeholder="Explain why this support request was rejected..."
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <p className="text-brandgray-muted leading-relaxed">
              Rejecting this request updates its status to REJECTED. The record will remain preserved in the organization&apos;s history.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-brandgray-border">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>Cancel</Button>
              <Button 
                variant="primary" 
                size="sm" 
                className="font-bold bg-red-700 hover:bg-red-800"
                onClick={() => handleUpdateStatus("REJECTED", { rejectionReason })}
                disabled={isSubmitting}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CLARIFICATION MODAL */}
      {activeModal === "CLARIFICATION" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-brandgray-border text-xs">
            <div className="flex justify-between items-center border-b border-brandgray-border pb-3">
              <h3 className="font-bold text-primary text-base">Request Clarification</h3>
              <button onClick={() => setActiveModal(null)} className="text-brandgray-muted hover:text-primary"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-primary block">Clarification Note *</label>
              <textarea 
                rows={3}
                placeholder="e.g. Please provide additional details about the proposed equipment deployment schedule..."
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={clarificationNote}
                onChange={(e) => setClarificationNote(e.target.value)}
                required
              />
            </div>

            <p className="text-brandgray-muted leading-relaxed">
              Requesting clarification sets the request status to UNDER REVIEW and notifies the industry representative.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-brandgray-border">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>Cancel</Button>
              <Button 
                variant="primary" 
                size="sm" 
                className="font-bold"
                onClick={() => handleUpdateStatus("UNDER_REVIEW", { clarificationNote })}
                disabled={isSubmitting || !clarificationNote.trim()}
              >
                Send Clarification Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
