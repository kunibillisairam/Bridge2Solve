"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, GraduationCap, MapPin, AlertCircle,
  DollarSign, Award, FileText, X, Calendar, Loader2, Layers
} from "lucide-react";
import {
  industryService, IndustryPartnership, SupportDeliveryItem, DeliveryStatus, SUPPORT_TYPE_LABELS
} from "@/services/industryService";
import { ResolvedProject, STAGE_CONFIG, LIFECYCLE_STAGES } from "@/services/universityMockService";
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

  const [partnership, setPartnership] = useState<IndustryPartnership | null>(null);
  const [project, setProject] = useState<ResolvedProject | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<SupportDeliveryItem | null>(null);
  const [updateStatus, setUpdateStatus] = useState<DeliveryStatus>("IN_PROGRESS");
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateEvidence, setUpdateEvidence] = useState("");
  const [updateDeliveryDate, setUpdateDeliveryDate] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => { loadData(); }, [partnershipId]);

  const loadData = () => {
    const p = industryService.getPartnershipById(partnershipId);
    if (p) {
      setPartnership(p);
      const proj = industryService.getEligibleProjectById(p.projectId);
      if (proj) setProject(proj);
    }
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
        { status: updateStatus, notes: updateNotes || undefined, evidenceRef: updateEvidence || undefined, deliveryDate: updateDeliveryDate || undefined },
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
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/industry/partnerships" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Partnerships
        </Link>
        <span className="text-xs text-brandgray-muted">Partnership ID: <span className="font-bold text-primary">{partnership.id}</span></span>
      </div>

      {/* Header */}
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2.5 py-0.5 rounded">{partnership.id}</span>
              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase border ${partnership.status === "COMPLETED" ? "bg-indigo-50 text-indigo-800 border-indigo-200" : "bg-emerald-50 text-emerald-800 border-emerald-250"}`}>
                {partnership.status.replace("_", " ")}
              </span>
            </div>
            <h2 className="text-xl font-bold text-primary">{project ? project.title : `Project ${partnership.projectId}`}</h2>
            {project && (
              <div className="flex items-center gap-1.5 text-xs text-brandgray-muted">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{project.collaboration.university}</span>
                <span className="mx-1">-</span>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{project.originalProblem.district}, {project.originalProblem.state}</span>
              </div>
            )}
          </div>
          <div className="text-right text-xs space-y-1">
            <p className="text-brandgray-muted">Approved: <span className="font-semibold text-primary">{partnership.approvedDate}</span></p>
            <p className="text-brandgray-muted">Duration: <span className="font-semibold text-primary">{partnership.endDate}</span></p>
          </div>
        </div>
      </div>

      {/* Stage Stepper */}
      {project && (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardHeader className="p-5 border-b border-brandgray-border/60">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4" /> Project Implementation Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-1 items-center">
              {LIFECYCLE_STAGES.slice(0, 8).map((stage, idx) => {
                const cfg = STAGE_CONFIG[stage];
                const isCurrent = idx === currentStageIndex;
                const isPast = idx < currentStageIndex;
                return (
                  <React.Fragment key={stage}>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${isCurrent ? "bg-primary text-white border-primary" : isPast ? "bg-emerald-50 text-emerald-700 border-emerald-250" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                      {isCurrent && ">> "}{cfg?.label || stage}
                    </span>
                    {idx < 7 && <span className="text-slate-300 text-xs">›</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commitment Overview */}
      {req && (
        <Card className="border-brandgray-border shadow-subtle bg-white">
          <CardHeader className="p-5 border-b border-brandgray-border/60">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Support Commitment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="border border-slate-100 p-3 rounded bg-slate-50">
                <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Support Type</span>
                <span className="font-bold text-primary">{SUPPORT_TYPE_LABELS[req.supportType]}</span>
              </div>
              <div className="border border-slate-100 p-3 rounded bg-slate-50">
                <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Est. Funding</span>
                <span className="font-bold text-emerald-800">{req.estimatedFunding ? `\u20B9${req.estimatedFunding.toLocaleString("en-IN")}` : "N/A"}</span>
              </div>
              <div className="border border-slate-100 p-3 rounded bg-slate-50">
                <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Duration</span>
                <span className="font-semibold">{req.expectedDuration || "Flexible"}</span>
              </div>
              <div className="border border-slate-100 p-3 rounded bg-slate-50">
                <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Resources</span>
                <span className="font-semibold text-[10.5px]">{req.resourcesOffered || "N/A"}</span>
              </div>
            </div>
            {req.description && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-150 rounded text-xs text-brandgray-text leading-relaxed">
                <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-1">Commitment Details</span>
                {req.description}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Tracking */}
      <Card className="border-brandgray-border shadow-subtle bg-white">
        <CardHeader className="p-5 border-b border-brandgray-border/60">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4" /> Support Delivery Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {partnership.deliveryItems.length === 0 ? (
            <p className="text-xs text-brandgray-muted text-center py-4">No delivery items created.</p>
          ) : (
            partnership.deliveryItems.map((item) => {
              const statusCfg = DELIVERY_STATUS_CONFIG[item.status];
              return (
                <div key={item.id} className="border border-brandgray-border rounded-lg p-4 space-y-2 bg-white hover:border-primary/20 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-primary uppercase bg-primary-light border border-primary/10 px-2 py-0.5 rounded">{item.id.split("-").pop()}</span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase border ${statusCfg.color}`}>{statusCfg.label}</span>
                      </div>
                      <h5 className="text-sm font-bold text-primary">{item.name}</h5>
                      <p className="text-xs text-brandgray-muted">{item.value}</p>
                    </div>
                    {item.status !== "VERIFIED" && (
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => openUpdateModal(item)}>
                        Update Delivery
                      </Button>
                    )}
                  </div>
                  {item.deliveryDate && (
                    <div className="flex items-center gap-1.5 text-xs text-brandgray-muted">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      Delivered: <span className="font-semibold ml-1">{item.deliveryDate}</span>
                    </div>
                  )}
                  {item.notes && (
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded text-xs text-brandgray-text leading-relaxed">
                      <span className="text-[9px] font-bold text-brandgray-muted uppercase block mb-0.5">Execution Notes</span>
                      {item.notes}
                    </div>
                  )}
                  {item.evidenceRef && (
                    <div className="text-xs text-brandgray-muted flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      Evidence: <span className="font-mono font-semibold text-primary ml-1">{item.evidenceRef}</span>
                    </div>
                  )}
                  {item.status === "VERIFIED" && item.verifiedBy && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded text-xs">
                      <p className="font-extrabold text-indigo-800 uppercase text-[9px] mb-0.5">Verified by Government Administration</p>
                      <p className="text-indigo-700 font-medium">Verified on {item.verifiedDate} by {item.verifiedBy}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Update Modal */}
      {activeItemId && activeItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full space-y-5 p-6">
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
                <select className="w-full text-xs border border-brandgray-border rounded px-3 py-2 bg-white" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value as DeliveryStatus)}>
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
