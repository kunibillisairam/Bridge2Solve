"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Layers, 
  Handshake, 
  CheckCircle2, 
  Clock, 
  Award, 
  DollarSign, 
  ArrowRight,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { 
  industryService, 
  IndustryPartnership, 
  SUPPORT_TYPE_LABELS 
} from "@/services/industryService";
import { ResolvedProject } from "@/services/universityMockService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface ResolvedPartnership extends IndustryPartnership {
  project: ResolvedProject | undefined;
}

export default function IndustryPartnershipsPage() {
  const { user } = useAuth();
  const industryId = user?.profile?.industryDetails?.id || "ind-1";

  const [partnerships, setPartnerships] = useState<ResolvedPartnership[]>([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    pendingCount: 0,
    completedCount: 0,
    totalFunding: 0,
    totalItems: 0,
    verifiedCount: 0
  });

  useEffect(() => {
    if (industryId) {
      loadData(industryId);
    }
  }, [industryId]);

  const loadData = (indId: string) => {
    const rawList = industryService.getPartnershipsForIndustry(indId);
    const resolved = rawList.map(p => ({
      ...p,
      project: industryService.getEligibleProjectById(p.projectId, indId)
    }));
    setPartnerships(resolved);

    let activeCount = 0, pendingCount = 0, completedCount = 0, totalFunding = 0, totalItems = 0, verifiedCount = 0;
    rawList.forEach(p => {
      if (p.status === "ACTIVE") activeCount++;
      if (p.status === "PENDING_ACTIVATION") pendingCount++;
      if (p.status === "COMPLETED") completedCount++;
      p.deliveryItems.forEach(item => {
        totalItems++;
        if (item.status === "VERIFIED") verifiedCount++;
      });
      const req = industryService.getSupportRequestById(p.requestId);
      if (req?.estimatedFunding) totalFunding += req.estimatedFunding;
    });
    setStats({ activeCount, pendingCount, completedCount, totalFunding, totalItems, verifiedCount });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-brandgray-border/60 pb-5">
        <h2 className="text-xl font-bold text-primary">My Partnerships Workspace</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Track CSR deliveries, verify funding transactions, and monitor active project collaborations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Active", value: stats.activeCount, color: "text-emerald-700 bg-emerald-50 border-emerald-250", icon: CheckCircle2 },
          { label: "Pending", value: stats.pendingCount, color: "text-amber-700 bg-amber-50 border-amber-250", icon: Clock },
          { label: "Completed", value: stats.completedCount, color: "text-indigo-700 bg-indigo-50 border-indigo-200", icon: Briefcase },
          { label: "Committed CSR", value: `${stats.totalFunding.toLocaleString("en-IN")}`, color: "text-teal-700 bg-teal-50 border-teal-200", icon: DollarSign },
          { label: "Commitments", value: stats.totalItems, color: "text-blue-700 bg-blue-50 border-blue-200", icon: Layers },
          { label: "Verified", value: stats.verifiedCount, color: "text-purple-700 bg-purple-50 border-purple-200", icon: Award }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border-brandgray-border shadow-subtle bg-white">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-brandgray-muted uppercase tracking-wider">{s.label}</span>
                  <div className={`p-1 rounded shrink-0 border ${s.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <span className="text-base font-extrabold text-primary leading-none block">{s.value}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {partnerships.length === 0 ? (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardContent className="p-8 text-center space-y-3 max-w-xl mx-auto">
            <Briefcase className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-primary">No Active Partnerships</p>
            <p className="text-xs text-brandgray-muted leading-relaxed">
              Accepted support requests are promoted to formal partnerships. Browse projects and express interest to get started.
            </p>
            <div className="pt-2">
              <Link href="/industry/interests">
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                  View My Support Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {partnerships.map((p) => {
              const totalCommitments = p.deliveryItems.length;
              const verifiedCommitments = p.deliveryItems.filter(i => i.status === "VERIFIED").length;
              const deliveredCommitments = p.deliveryItems.filter(i => i.status === "DELIVERED" || i.status === "VERIFIED").length;
              const percentVerified = totalCommitments > 0 ? Math.round((verifiedCommitments / totalCommitments) * 100) : 0;

              return (
                <Card key={p.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all">
                  <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                          {p.id}
                        </span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase border ${
                          p.status === "COMPLETED" 
                            ? "bg-indigo-50 text-indigo-800 border-indigo-200" 
                            : p.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-250"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          {p.status.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-brandgray-muted">Approved: {p.approvedDate}</span>
                      </div>
                      
                      <h4 className="text-base font-bold text-primary">
                        {p.project ? p.project.title : `Project ${p.projectId}`}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-brandgray-muted font-medium">
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span>{p.project ? p.project.collaboration.university : "Academic Institution"}</span>
                      </div>

                      <div className="flex gap-3 text-[10.5px] font-semibold">
                        <span className="text-emerald-700">{verifiedCommitments} Verified</span>
                        <span className="text-amber-700">{deliveredCommitments - verifiedCommitments} Awaiting Verification</span>
                        <span className="text-brandgray-muted">{totalCommitments} Total Items</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end">
                      <div className="space-y-1 w-36">
                        <div className="flex justify-between text-[10px] font-bold text-brandgray-muted">
                          <span>VERIFIED DELIVERY</span>
                          <span>{percentVerified}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200">
                          <div 
                            className="bg-emerald-600 h-1 rounded-full transition-all" 
                            style={{ width: `${percentVerified}%` }}
                          ></div>
                        </div>
                        <p className="text-[9.5px] text-brandgray-muted text-right font-medium">
                          {verifiedCommitments} of {totalCommitments} items verified
                        </p>
                      </div>

                      <Link href={`/industry/partnerships/${p.id}`}>
                        <Button variant="primary" size="sm" className="h-9 text-xs font-bold w-full sm:w-auto">
                          Open Workspace <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
