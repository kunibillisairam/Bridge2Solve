"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Handshake, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  MapPin, 
  GraduationCap, 
  ArrowRight,
  DollarSign,
  FileText
} from "lucide-react";
import { 
  industryService, 
  IndustrySupportRequest, 
  SUPPORT_TYPE_LABELS, 
  SUPPORT_STATUS_BADGES 
} from "@/services/industryService";
import { ResolvedProject } from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface ResolvedSupportRequest extends IndustrySupportRequest {
  project: ResolvedProject | undefined;
}

export default function IndustryInterestsPage() {
  const { user } = useAuth();
  const industryId = user?.profile?.industryDetails?.id || "ind-1";

  const [requests, setRequests] = useState<ResolvedSupportRequest[]>([]);

  useEffect(() => {
    if (industryId) {
      loadRequests(industryId);
    }
  }, [industryId]);

  const loadRequests = (indId: string) => {
    const raw = industryService.getSupportRequestsForIndustry(indId);
    const resolved = raw.map((r) => ({
      ...r,
      project: industryService.getEligibleProjectById(r.projectId),
    }));
    setRequests(resolved);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h2 className="text-xl font-bold text-primary">My Organization&apos;s Support Requests</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Track submitted CSR funding, technical mentorship, and resource support requests.
        </p>
      </div>

      {/* Requests Listing */}
      {requests.length === 0 ? (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-8 text-center space-y-3 max-w-xl mx-auto">
            <Handshake className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-primary">No Support Requests Found</p>
            <p className="text-xs text-brandgray-muted leading-relaxed">
              Your organization has not yet submitted support requests or funding commitments for any active community research project. A request is generated when you pledge resources or request to mentor a project.
            </p>
            <p className="text-[11px] font-bold text-primary">
              What next: Click the button below to browse active projects, review ranked CSR match recommendations, and submit support requests.
            </p>
            <div className="pt-2">
              <Link href="/industry/projects">
                <Button variant="primary" size="sm" className="h-8 text-xs font-semibold">
                  Explore Available Projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                        {req.projectId}
                      </span>
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {SUPPORT_TYPE_LABELS[req.supportType]}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-primary">
                      {req.project ? req.project.title : "Community Project"}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${SUPPORT_STATUS_BADGES[req.status]}`}>
                      Status: {req.status === "ACCEPTED" ? "Approved" : req.status === "UNDER_REVIEW" ? "Under Review" : req.status === "PENDING" ? "Pending" : "Rejected"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-brandgray-text leading-relaxed bg-slate-50 p-3 rounded border border-slate-150">
                  {req.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-y border-brandgray-light/60 py-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">University</span>
                    <span className="font-semibold text-primary">
                      {req.project ? req.project.collaboration.university : "Academic Institution"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Submitted Date</span>
                    <span className="font-medium text-brandgray-text">{req.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Est. Funding</span>
                    <span className="font-bold text-emerald-800">
                      {req.estimatedFunding ? `₹${req.estimatedFunding.toLocaleString()}` : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Duration</span>
                    <span className="font-medium text-brandgray-text">{req.expectedDuration || "Flexible"}</span>
                  </div>
                </div>

                {req.status === "REJECTED" && req.rejectionReason && (
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs">
                    <span className="font-bold block uppercase text-[9.5px] text-rose-900 mb-0.5">Admin Rejection Feedback:</span>
                    <p className="font-medium">{req.rejectionReason}</p>
                  </div>
                )}

                {req.status === "UNDER_REVIEW" && req.clarificationNote && (
                  <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs">
                    <span className="font-bold block uppercase text-[9.5px] text-amber-900 mb-0.5">Clarification Requested by Admin:</span>
                    <p className="font-medium">{req.clarificationNote}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs">
                  <span className="text-[11px] text-brandgray-muted">Request ID: <span className="font-mono font-semibold">{req.id}</span></span>
                  <div className="flex gap-2">
                    {req.status === "ACCEPTED" && (() => {
                      const ptn = industryService.getPartnershipByProjectId(req.projectId);
                      if (ptn) {
                        return (
                          <Link href={`/industry/partnerships/${ptn.id}`}>
                            <Button variant="primary" size="sm" className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                              ✓ Partnership Workspace
                            </Button>
                          </Link>
                        );
                      }
                      return null;
                    })()}
                    <Link href={`/industry/projects/${req.projectId}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                        View Project <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
