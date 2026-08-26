"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  SlidersHorizontal, 
  X, 
  Handshake, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  GraduationCap,
  Layers,
  DollarSign
} from "lucide-react";
import { 
  industryService, 
  IndustrySupportRequest, 
  SupportType, 
  SupportStatus, 
  SUPPORT_TYPE_LABELS, 
  SUPPORT_STATUS_BADGES 
} from "@/services/industryService";
import { ResolvedProject } from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ResolvedAdminRequest extends IndustrySupportRequest {
  project: ResolvedProject | undefined;
}

export default function AdminIndustrySupportPage() {
  const [requests, setRequests] = useState<ResolvedAdminRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ResolvedAdminRequest[]>([]);
  const [metrics, setMetrics] = useState({
    pendingCount: 0,
    underReviewCount: 0,
    acceptedCount: 0,
    activePartnershipsCount: 0,
    totalRequestsCount: 0,
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSupportType, setSelectedSupportType] = useState<string>("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const raw = industryService.getAllSupportRequests();
    const resolved = raw.map((r) => ({
      ...r,
      project: industryService.getEligibleProjectById(r.projectId),
    }));
    setRequests(resolved);
    setFilteredRequests(resolved);
    setMetrics(industryService.getAdminSupportMetrics());
  };

  useEffect(() => {
    let result = requests;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.industryName.toLowerCase().includes(q) ||
          r.projectId.toLowerCase().includes(q) ||
          (r.project && r.project.title.toLowerCase().includes(q)) ||
          (r.project && r.project.collaboration.university.toLowerCase().includes(q)) ||
          (r.project && r.project.originalProblem.district.toLowerCase().includes(q))
      );
    }

    if (selectedStatus !== "All") {
      result = result.filter((r) => r.status === selectedStatus);
    }

    if (selectedSupportType !== "All") {
      result = result.filter((r) => r.supportType === selectedSupportType);
    }

    setFilteredRequests(result);
  }, [searchQuery, selectedStatus, selectedSupportType, requests]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedSupportType("All");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h1 className="text-xl font-bold text-primary uppercase tracking-wide">
          INDUSTRY / CSR SUPPORT REQUESTS
        </h1>
        <p className="text-xs text-brandgray-muted mt-1 font-medium">
          Review and manage industry participation in active community projects.
        </p>
      </div>

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Requests",
            value: metrics.pendingCount,
            description: "Awaiting initial administrative review",
            icon: Clock,
            color: "text-amber-700 bg-amber-50 border-amber-250",
          },
          {
            label: "Under Review",
            value: metrics.underReviewCount,
            description: "Clarification or review in progress",
            icon: Handshake,
            color: "text-indigo-700 bg-indigo-50 border-indigo-200",
          },
          {
            label: "Accepted",
            value: metrics.acceptedCount,
            description: "Formally approved CSR partnerships",
            icon: CheckCircle2,
            color: "text-emerald-700 bg-emerald-50 border-emerald-250",
          },
          {
            label: "Active Partnerships",
            value: metrics.activePartnershipsCount,
            description: "Confirmed active CSR & tech support",
            icon: Building2,
            color: "text-primary bg-primary-light border-primary/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-brandgray-border shadow-subtle flex flex-col justify-between bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-10 w-10 shrink-0 rounded flex items-center justify-center border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-primary block leading-none">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-brandgray-text mt-1.5 block">
                    {stat.label}
                  </span>
                  <span className="text-[10px] text-brandgray-muted mt-0.5 block">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-brandgray-border rounded-lg p-4 shadow-subtle space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
          <input
            type="text"
            placeholder="Search by Request ID (e.g. CSR-2026-001), industry name, project title, or university..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-brandgray-border rounded focus:outline-none focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-brandgray-light/60">
          <div className="flex items-center gap-1.5 text-xs text-brandgray-muted font-bold uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
          </div>

          {/* Status Filter */}
          <select
            className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-medium"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>

          {/* Support Type Filter */}
          <select
            className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-medium"
            value={selectedSupportType}
            onChange={(e) => setSelectedSupportType(e.target.value)}
          >
            <option value="All">All Support Types</option>
            <option value="CSR_FUNDING">CSR Funding</option>
            <option value="TECHNICAL_MENTORSHIP">Technical Mentorship</option>
            <option value="EQUIPMENT_RESOURCES">Equipment / Resources</option>
            <option value="INDUSTRY_EXPERTISE">Industry Expertise</option>
            <option value="INFRASTRUCTURE_DEPLOYMENT">Infrastructure / Deployment</option>
            <option value="OTHER">Other</option>
          </select>

          {(searchQuery || selectedStatus !== "All" || selectedSupportType !== "All") && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] font-semibold flex items-center gap-1 text-red-600 hover:text-red-700"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Requests Listing */}
      {filteredRequests.length === 0 ? (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-primary">No Support Requests Found</p>
            <p className="text-xs text-brandgray-muted">No industry support requests match your search or filter criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded">
                        {req.id}
                      </span>
                      <span className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                        {SUPPORT_TYPE_LABELS[req.supportType]}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-primary">
                      {req.industryName}
                    </h3>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded border ${SUPPORT_STATUS_BADGES[req.status]}`}>
                    Status: {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-150">
                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Target Project</span>
                    <span className="font-bold text-primary block truncate">
                      {req.project ? req.project.title : req.projectId}
                    </span>
                    <span className="text-[10px] text-brandgray-muted">ID: {req.projectId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">University Partner</span>
                    <span className="font-semibold text-brandgray-text flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                      {req.project ? req.project.collaboration.university : "Academic Institution"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Estimated Funding</span>
                    <span className="font-bold text-emerald-800 text-sm block">
                      {req.estimatedFunding ? `₹${req.estimatedFunding.toLocaleString()}` : "N/A"}
                    </span>
                    <span className="text-[10px] text-brandgray-muted">Submitted: {req.createdAt}</span>
                  </div>
                </div>

                <p className="text-xs text-brandgray-text leading-relaxed line-clamp-2">
                  {req.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-brandgray-border/40 text-xs">
                  <span className="text-[11px] text-brandgray-muted">
                    {req.reviewedAt ? `Last reviewed on ${req.reviewedAt}` : `Submitted on ${req.createdAt}`}
                  </span>
                  <Link href={`/admin/industry-support/${req.id}`}>
                    <Button variant="primary" size="sm" className="h-8 text-xs font-bold flex items-center gap-1.5">
                      Review Request <ArrowRight className="h-3.5 w-3.5" />
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
