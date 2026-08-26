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

interface ResolvedSupportRequest extends IndustrySupportRequest {
  project: ResolvedProject | undefined;
}

export default function IndustryInterestsPage() {
  const [requests, setRequests] = useState<ResolvedSupportRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const raw = industryService.getSupportRequestsForIndustry("ind-1");
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
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-primary">No Support Requests Submitted</p>
            <p className="text-xs text-brandgray-muted">Your organization has not yet submitted support requests for any community project.</p>
            <Link href="/industry/projects">
              <Button variant="primary" size="sm" className="h-8 text-xs font-semibold">
                Explore Available Projects
              </Button>
            </Link>
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
                      Status: {req.status}
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

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-brandgray-muted">Request ID: <span className="font-mono font-semibold">{req.id}</span></span>
                  <Link href={`/industry/projects/${req.projectId}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                      View Project Details <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
