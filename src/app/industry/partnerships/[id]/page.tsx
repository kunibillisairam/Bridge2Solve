"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, GraduationCap, MapPin, AlertCircle,
  DollarSign, Award, FileText, X, Calendar, Loader2, Layers,
  Building2, Users, Clock, History, ExternalLink, ShieldCheck
} from "lucide-react";
import {
  industryService, IndustryPartnership, SupportDeliveryItem, DeliveryStatus,
  SUPPORT_TYPE_LABELS, IndustryOrganizationProfile
} from "@/services/industryService";
import {
  ResolvedProject, STAGE_CONFIG, LIFECYCLE_STAGES,
  universityMockService, ActivityLog
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const DELIVERY_STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string }> = {
  PLANNED: { label: "Planned", color: "bg-slate-100 text-slate-700 border-slate-300" },
  COMMITTED: { label: "Committed", color: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-250" },
  DELIVERED: { label: "Delivered (Pending Verification)", color: "bg-emerald-50 text-emerald-800 border-emerald-250" },
  VERIFIED: { label: "Verified by Government", color: "bg-indigo-50 text-indigo-800 border-indigo-200" }
};

const UPDATABLE_STATUSES: DeliveryStatus[] = ["IN_PROGRESS", "DELIVERED"];

export default function PartnershipDetailPage() {
  const { user } = useAuth();
  const industryId = user?.profile?.industryDetails?.id || "ind-1";
  const params = useParams();
  const partnershipId = params.id as string;
  const router = useRouter();

  const [partnership, setPartnership] = useState<IndustryPartnership | null>(null);
  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [profile, setProfile] = useState<IndustryOrganizationProfile | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<SupportDeliveryItem | null>(null);
  const [updateStatus, setUpdateStatus] = useState<DeliveryStatus>("IN_PROGRESS");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateEvidence, setUpdateEvidence] = useState("");
  const [updateDeliveryDate, setUpdateDeliveryDate] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => { loadData(); }, [partnershipId, industryId]);

  const loadData = () => {
    const p = industryService.getPartnershipById(partnershipId);
    if (!p) {
      setPartnership(null);
      setIsUnauthorized(false);
      return;
    }
    // Security check: only the owning industry organization can view the partnership details
    if (p.industryId !== industryId) {
      setPartnership(null);
      setIsUnauthorized(true);
      return;
    }
    setIsUnauthorized(false);
    setPartnership(p);
    
    const proj = industryService.getEligibleProjectById(p.projectId, industryId);
    if (proj) setProject(proj);

    const prof = industryService.getProfile(p.industryId);
    if (prof) setProfile(prof);

    // Timeline/Activities
    const allActivities = universityMockService.getActivities();
    const filtered = allActivities.filter(a =>
      a.entityId === p.id ||
      a.entityId === p.projectId ||
      a.entityId === p.requestId
    );
    setActivities(filtered);
  };

  const openUpdateModal = (item: SupportDeliveryItem) => {
    setActiveItemId(item.id);
    setActiveItem(item);
    setUpdateStatus(item.status === "DELIVERED" ? "DELIVERED" : "IN_PROGRESS");
    setUpdateNotes(item.notes || "");
    setUpdateEvidence(item.evidenceRef || "");
    setUpdateDeliveryDate(item.deliveryDate || "");
    setUpdateError(""); setUpdateSuccess("");
  };

  const closeUpdateModal = () => {
    setActiveItemId(null); setActiveItem(null);
    setUpdateNotes(""); setUpdateEvidence(""); setUpdateDeliveryDate("");
    setUpdateError(""); setUpdateSuccess("");
  };

  const handleUpdateItem = () => {
    if (!activeItemId || !partnership) return;
    setUpdateError(""); setUpdateSuccess(""); setIsUpdating(true);
    try {
      const updated = industryService.updateDeliveryItem(
        partnershipId, activeItemId,
        { 
          status: updateStatus, 
          notes: updateNotes || undefined, 
          evidenceRef: updateEvidence || undefined, 
          deliveryDate: updateDeliveryDate || undefined 
        },
        "INDUSTRY"
      );
      setPartnership(updated);
      setUpdateSuccess("Delivery item updated successfully.");
      setTimeout(() => { closeUpdateModal(); loadData(); }, 1500);
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update delivery item.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUnauthorized) {
    return (
      <div className="text-center py-16 space-y-3">
        <AlertCircle className="h-8 w-8 mx-auto text-rose-500" />
        <p className="text-sm font-bold text-primary">Unauthorized Access</p>
        <p className="text-xs text-brandgray-muted">You do not have permission to view this partnership details page.</p>
        <Link href="/industry/partnerships"><Button variant="outline" size="sm" className="mt-3">Back to Partnerships</Button></Link>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="text-center py-16 space-y-3">
        <AlertCircle className="h-8 w-8 mx-auto text-rose-400" />
        <p className="text-sm font-bold text-primary">Partnership Not Found</p>
        <p className="text-xs text-brandgray-muted">This workspace does not exist.</p>
        <Link href="/industry/partnerships"><Button variant="outline" size="sm" className="mt-3">Back to Partnerships</Button></Link>
      </div>
    );
  }

  const req = industryService.getSupportRequestById(partnership.requestId);
  const currentStageIndex = project ? LIFECYCLE_STAGES.indexOf(project.stage as any) : -1;

  return (
    <div className="space-y-8">
      {/* Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/industry/partnerships" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Partnerships
        </Link>
        <div className="flex items-center gap-3">
          {project && (
            <Link href={`/industry/projects/${project.id}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold flex items-center gap-1">
                View Project <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          )}
          <span className="text-xs text-brandgray-muted">Partnership ID: <span className="font-mono font-bold text-primary">{partnership.id}</span></span>
        </div>
      </div>

      {/* Overview Cards & Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/MID MAIN COLUMN (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Target Project Info */}
          {project && (
            <Card className="border-brandgray-border shadow-subtle bg-white">
              <CardHeader className="p-5 border-b border-brandgray-border/60">
                <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary shrink-0" /> Target Project
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2 py-0.5 rounded">Project ID: {project.id}</span>
                    <span className="text-[10px] font-semibold text-brandgray-muted">{project.originalProblem?.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-primary">{project.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-500">University</p>
                      <p className="font-bold text-primary">{project.collaboration.university}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-500">Research Team</p>
                      <p className="font-bold text-primary">{project.assignedTeam?.name || "Pending Assignment"}</p>
                      <p className="text-[11px] text-brandgray-muted">Mentor: {project.assignedTeam?.facultyMentor || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-2 border-t border-brandgray-border/40">
                  <div className="flex justify-between text-[11px] font-bold text-brandgray-muted">
                    <span>PROGRESS PERCENTAGE</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stage Stepper */}
                <div className="pt-3 border-t border-brandgray-border/40 space-y-2">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Current Project Stage</span>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {LIFECYCLE_STAGES.slice(0, 8).map((stage, idx) => {
                      const cfg = STAGE_CONFIG[stage];
                      const isCurrent = idx === currentStageIndex;
                      const isPast = idx < currentStageIndex;
                      return (
                        <React.Fragment key={stage}>
                          <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            isCurrent 
                              ? "bg-primary text-white border-primary" 
                              : isPast 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                                : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}>
                            {cfg?.label || stage}
                          </span>
                          {idx < 7 && <span className="text-slate-300 text-xs">›</span>}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support Commitment Details */}
          {req && (
            <Card className="border-brandgray-border shadow-subtle bg-white">
              <CardHeader className="p-5 border-b border-brandgray-border/60">
                <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary shrink-0" /> Support Commitment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="border border-slate-100 p-3 rounded bg-slate-50">
                    <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Support Type</span>
                    <span className="font-extrabold text-primary">{SUPPORT_TYPE_LABELS[req.supportType] || req.supportType}</span>
                  </div>
                  <div className="border border-slate-100 p-3 rounded bg-slate-50">
                    <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Funding Committed</span>
                    <span className="font-extrabold text-emerald-800">{req.estimatedFunding ? `₹${req.estimatedFunding.toLocaleString("en-IN")}` : "No direct funding"}</span>
                  </div>
                  <div className="border border-slate-100 p-3 rounded bg-slate-50">
                    <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Expected Duration</span>
                    <span className="font-extrabold text-primary">{req.expectedDuration || "Flexible"}</span>
                  </div>
                  <div className="border border-slate-100 p-3 rounded bg-slate-50">
                    <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Resources Offered</span>
                    <span className="font-extrabold text-primary truncate block" title={req.resourcesOffered}>{req.resourcesOffered || "N/A"}</span>
                  </div>
                </div>
                {req.description && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-150 rounded text-xs text-brandgray-text leading-relaxed">
                    <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-1">Support Description</span>
                    <p className="font-medium">{req.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delivery Status and tracking */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-primary shrink-0" /> Delivery Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {partnership.deliveryItems.length === 0 ? (
                <p className="text-xs text-brandgray-muted text-center py-4">No delivery items logged for this partnership.</p>
              ) : (
                partnership.deliveryItems.map((item) => {
                  const statusCfg = DELIVERY_STATUS_CONFIG[item.status];
                  return (
                    <div key={item.id} className="border border-brandgray-border rounded-lg p-4 space-y-3 bg-white hover:border-primary/20 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2 py-0.5 rounded">{item.id.split("-").pop()}</span>
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase border ${statusCfg.color}`}>{statusCfg.label}</span>
                          </div>
                          <h5 className="text-sm font-bold text-primary">{item.name}</h5>
                          <p className="text-xs text-brandgray-text font-medium">Commitment Value: <span className="font-bold">{item.value}</span></p>
                        </div>
                        {item.status !== "VERIFIED" && (
                          <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => openUpdateModal(item)}>
                            Update Status
                          </Button>
                        )}
                      </div>
                      
                      {item.deliveryDate && (
                        <div className="flex items-center gap-1.5 text-xs text-brandgray-muted font-medium">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Delivery Date: <span className="text-primary font-bold">{item.deliveryDate}</span>
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="p-2 bg-slate-50 border border-slate-150 rounded text-xs text-brandgray-text leading-relaxed font-medium">
                          <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Execution Notes (Industry Delivered)</span>
                          {item.notes}
                        </div>
                      )}
                      
                      {item.evidenceRef && (
                        <div className="text-xs text-brandgray-muted flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          Evidence Reference: <span className="font-mono font-bold text-primary">{item.evidenceRef}</span>
                        </div>
                      )}
                      
                      {item.status === "VERIFIED" && item.verifiedBy && (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded text-xs">
                          <p className="font-extrabold text-indigo-800 uppercase text-[9px] mb-0.5 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-indigo-700" /> Government Verified
                          </p>
                          <p className="text-indigo-700 font-semibold">Verified on {item.verifiedDate} by {item.verifiedBy}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDEBAR COLUMN (1/3 width on large screens) */}
        <div className="space-y-6">
          
          {/* Partnership Overview Card */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary shrink-0" /> Partnership Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs font-semibold">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-brandgray-muted">Partnership ID</span>
                  <span className="font-mono text-primary font-bold">{partnership.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-brandgray-muted">Status</span>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase border ${
                    partnership.status === "COMPLETED" 
                      ? "bg-indigo-50 text-indigo-800 border-indigo-200" 
                      : "bg-emerald-50 text-emerald-800 border-emerald-250"
                  }`}>{partnership.status.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-brandgray-muted">Approved Date</span>
                  <span className="text-slate-800">{partnership.approvedDate}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-brandgray-muted">Start Date</span>
                  <span className="text-slate-800">{partnership.startDate}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-brandgray-muted">Expected End Date</span>
                  <span className="text-slate-800">{partnership.endDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Organization Info */}
          {profile && (
            <Card className="border-brandgray-border shadow-subtle bg-white">
              <CardHeader className="p-5 border-b border-brandgray-border/60">
                <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary shrink-0" /> Industry Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5 text-xs font-semibold text-slate-800">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-brandgray-muted uppercase block leading-none">Organization Name</span>
                  <span className="text-primary font-bold text-sm block leading-snug">{profile.name}</span>
                  <span className="text-[10px] text-brandgray-muted font-medium">{profile.orgType}</span>
                </div>
                <div className="space-y-1 border-t border-slate-100 pt-2.5">
                  <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Representative</span>
                  <p className="font-bold text-slate-700">{profile.representativeName}</p>
                  <p className="text-[10.5px] text-brandgray-muted font-medium">{profile.email} · {profile.phone}</p>
                </div>
                {req && (
                  <div className="space-y-1 border-t border-slate-100 pt-2.5">
                    <span className="text-[9px] font-bold text-brandgray-muted uppercase block">Support Type</span>
                    <span className="text-primary font-bold">{SUPPORT_TYPE_LABELS[req.supportType] || req.supportType}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline Card */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4 text-primary shrink-0" /> Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs font-medium text-slate-800">
              {activities.length === 0 ? (
                <p className="text-brandgray-muted text-center py-2">No activity logged for this partnership.</p>
              ) : (
                <div className="relative border-l border-slate-200 pl-3.5 ml-1.5 space-y-4">
                  {activities.map((act) => {
                    const formattedDate = act.timestamp && act.timestamp.includes("T")
                      ? new Date(act.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : act.timestamp;
                    return (
                      <div key={act.id} className="relative">
                        <div className="absolute -left-[19.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-brandgray-muted block leading-none">{formattedDate}</span>
                          <span className="font-bold text-slate-800 block text-[11px] leading-snug">{act.action || "State Update"}</span>
                          <p className="text-[10.5px] text-brandgray-text leading-relaxed font-medium">{act.text}</p>
                          {act.note && (
                            <p className="p-1 bg-slate-50 border-l border-slate-300 italic text-slate-600 text-[10px] mt-1">
                              &quot;{act.note}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Modal */}
      {activeItemId && activeItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full space-y-5 p-6 border border-slate-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-primary">Update Delivery Status</h3>
                <p className="text-xs text-brandgray-muted mt-0.5">{activeItem.name}</p>
              </div>
              <button onClick={closeUpdateModal} className="text-brandgray-muted hover:text-primary"><X className="h-5 w-5" /></button>
            </div>
            
            {updateError && <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-semibold">{updateError}</div>}
            {updateSuccess && <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">{updateSuccess}</div>}
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brandgray-text block uppercase text-[10px]">New Status *</label>
                <select 
                  className="w-full text-xs border border-brandgray-border rounded px-3 py-2 bg-white" 
                  value={updateStatus} 
                  onChange={(e) => setUpdateStatus(e.target.value as DeliveryStatus)}
                >
                  {UPDATABLE_STATUSES.map((s) => <option key={s} value={s}>{DELIVERY_STATUS_CONFIG[s].label}</option>)}
                </select>
                <p className="text-[10px] text-brandgray-muted">Note: Only Government Administrators can verify deliveries.</p>
              </div>
              
              {updateStatus === "DELIVERED" && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-brandgray-text block uppercase text-[10px]">Delivery Date</label>
                    <input type="date" className="w-full text-xs border border-brandgray-border rounded px-3 py-2" value={updateDeliveryDate} onChange={(e) => setUpdateDeliveryDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-brandgray-text block uppercase text-[10px]">Evidence Reference</label>
                    <input type="text" placeholder="e.g. TXN-87612398, Invoice #INV-2026-08" className="w-full text-xs border border-brandgray-border rounded px-3 py-2" value={updateEvidence} onChange={(e) => setUpdateEvidence(e.target.value)} />
                  </div>
                </>
              )}
              
              <div className="space-y-1">
                <label className="font-bold text-brandgray-text block uppercase text-[10px]">Execution Notes</label>
                <textarea rows={3} placeholder="Describe what was delivered..." className="w-full text-xs border border-brandgray-border rounded px-3 py-2 resize-none" value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} />
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={closeUpdateModal} className="flex-1 h-9 text-xs">Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleUpdateItem} disabled={isUpdating} className="flex-1 h-9 text-xs font-bold">
                {isUpdating ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Updating...</> : "Submit Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
