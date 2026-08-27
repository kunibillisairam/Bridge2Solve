"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Layers, 
  FileText, 
  FolderKanban, 
  Building2, 
  Activity, 
  RotateCcw,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  ArrowRightCircle
} from "lucide-react";
import { universityMockService, ActivityLog } from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminActivityLogPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedEntityType, setSelectedEntityType] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const data = universityMockService.getActivities();
    setActivities(data);
    setFilteredActivities(data);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("All");
    setSelectedEntityType("All");
    setSelectedAction("All");
  };

  useEffect(() => {
    let result = activities;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (act) =>
          act.text.toLowerCase().includes(q) ||
          act.id.toLowerCase().includes(q) ||
          (act.actor && act.actor.toLowerCase().includes(q)) ||
          (act.action && act.action.toLowerCase().includes(q)) ||
          (act.entityId && act.entityId.toLowerCase().includes(q)) ||
          (act.entityName && act.entityName.toLowerCase().includes(q)) ||
          (act.note && act.note.toLowerCase().includes(q))
      );
    }

    if (selectedRole !== "All") {
      result = result.filter((act) => act.actorRole === selectedRole);
    }

    if (selectedEntityType !== "All") {
      result = result.filter((act) => act.entityType === selectedEntityType);
    }

    if (selectedAction !== "All") {
      result = result.filter((act) => act.action === selectedAction);
    }

    setFilteredActivities(result);
  }, [searchQuery, selectedRole, selectedEntityType, selectedAction, activities]);

  // Unique actions for filters
  const uniqueActions = Array.from(
    new Set(
      activities
        .map((act) => act.action)
        .filter(Boolean)
    )
  ).sort() as string[];

  // Helper to format ISO timestamps
  const formatTime = (ts: string) => {
    if (!ts) return "";
    if (ts.includes("T") && ts.includes("-")) {
      try {
        const d = new Date(ts);
        return d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
      } catch {
        return ts;
      }
    }
    return ts;
  };

  // Helper to return Entity link URL
  const getEntityLink = (type?: string, id?: string) => {
    if (!type || !id) return null;
    switch (type) {
      case "PROBLEM":
        return `/admin/problems/${id}`;
      case "PROPOSAL":
        return `/admin/proposals/${id}`;
      case "PROJECT":
        return `/admin/projects/${id}`;
      case "IMPACT_ASSESSMENT":
        return `/admin/projects/${id}`; // Linked to project details
      case "SUPPORT_REQUEST":
        return `/admin/industry-support/${id}`;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "UNIVERSITY":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "INDUSTRY":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case "CITIZEN":
        return "bg-blue-100 text-blue-900 border-blue-300";
      default:
        return "bg-slate-100 text-slate-900 border-slate-350";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="border-b border-brandgray-border/60 pb-5">
        <h1 className="text-xl font-bold text-primary uppercase tracking-wide flex items-center gap-2.5">
          <Activity className="h-6 w-6 text-amber-500 shrink-0" /> CENTRAL PLATFORM AUDIT TRAIL & SYSTEM ACTIVITY LOG
        </h1>
        <p className="text-xs text-brandgray-muted mt-1 font-medium">
          Comprehensive, immutable record of state transitions, user decisions, submission dates, and evidence attachments across the ProblemBridge lifecycle.
        </p>
      </div>

      {/* Security note / alert banner */}
      <div className="p-3 bg-slate-900 text-white rounded border border-slate-800 text-[11px] flex items-center justify-between gap-3 shadow-md">
        <span className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" /> 
          SECURE REGULATORY CONTROL: THIS LOG ENTRY IS Cryptographically Bound & Immutable. Normal portal users are unauthorized to edit or wipe activity records.
        </span>
        <span className="text-[9px] font-mono tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          SYSTEM STATUS: SECURE
        </span>
      </div>

      {/* Search & Filter section */}
      <Card className="border-brandgray-border bg-white shadow-subtle">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
            <input
              type="text"
              placeholder="Search by event ID (e.g. act-1), actor name, note context, proposal name, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-brandgray-border rounded focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-brandgray-light/60">
            <div className="flex items-center gap-1.5 text-xs text-brandgray-muted font-bold uppercase tracking-wider">
              <Filter className="h-3.5 w-3.5 text-primary" /> Filter Stream:
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-semibold"
            >
              <option value="All">All Roles</option>
              <option value="ADMIN">Government Authority (Admin)</option>
              <option value="UNIVERSITY">Research Institutions</option>
              <option value="INDUSTRY">Industry Partners</option>
              <option value="CITIZEN">Citizens</option>
            </select>

            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-semibold"
            >
              <option value="All">All Entities</option>
              <option value="PROBLEM">Citizen Problems</option>
              <option value="PROPOSAL">Research Proposals</option>
              <option value="PROJECT">Collaboration Projects</option>
              <option value="TEAM">Research Teams</option>
              <option value="SUPPORT_REQUEST">CSR Support Requests</option>
              <option value="IMPACT_ASSESSMENT">Impact Assessments</option>
            </select>

            {uniqueActions.length > 0 && (
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 bg-white text-brandgray-text font-semibold max-w-xs"
              >
                <option value="All">All Action Types</option>
                {uniqueActions.map((act) => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            )}

            {(searchQuery || selectedRole !== "All" || selectedEntityType !== "All" || selectedAction !== "All") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs font-semibold hover:bg-slate-50 border-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activities Feed */}
      <Card className="border-brandgray-border bg-white shadow-subtle">
        <CardHeader className="p-4 border-b border-brandgray-border/60">
          <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
            Chronological System Actions & State Changes ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-xs font-bold text-primary">No Matching Activity Records Found</p>
              <p className="text-[11px] text-brandgray-muted">Try clearing the search query or adjusting the role filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-brandgray-border/60">
              {filteredActivities.map((act) => {
                const entityLink = getEntityLink(act.entityType, act.entityId);
                return (
                  <div key={act.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:bg-slate-50/50 transition-colors">
                    {/* Timestamp */}
                    <div className="sm:w-44 text-[10.5px] text-brandgray-muted flex items-center gap-1.5 shrink-0 pt-0.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{formatTime(act.timestamp)}</span>
                    </div>

                    {/* Content Block */}
                    <div className="flex-1 space-y-2 min-w-0">
                      {/* Top Header metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        {act.actorRole && (
                          <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 border rounded uppercase ${getRoleBadgeColor(act.actorRole)}`}>
                            {act.actorRole}
                          </span>
                        )}
                        {act.actor && (
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" /> {act.actor}
                          </span>
                        )}
                        {act.action && (
                          <span className="text-[11px] font-extrabold text-primary bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {act.action}
                          </span>
                        )}
                      </div>

                      {/* Descriptive Text */}
                      <p className="text-xs text-brandgray-text font-medium leading-relaxed">
                        {act.text}
                      </p>

                      {/* Traceability: Linked Entity ID */}
                      {act.entityType && act.entityId && (
                        <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                          <span className="text-brandgray-muted font-bold uppercase tracking-wider">Target Entity:</span>
                          <span className="font-mono text-slate-500 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded font-bold">{act.entityType}</span>
                          {entityLink ? (
                            <Link href={entityLink} className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
                              {act.entityId} <ArrowRightCircle className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="font-mono text-primary font-semibold">{act.entityId}</span>
                          )}
                          {act.entityName && (
                            <span className="text-brandgray-muted truncate max-w-xs font-medium">({act.entityName})</span>
                          )}
                        </div>
                      )}

                      {/* State Transition Indicator */}
                      {(act.previousState || act.newState) && (
                        <div className="flex items-center gap-2 text-[10px] bg-slate-50 p-1.5 px-2.5 rounded border border-slate-150 max-w-sm">
                          <span className="text-brandgray-muted font-bold uppercase">Transition:</span>
                          <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-slate-600 font-semibold uppercase">{act.previousState || "NONE"}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span className="font-mono bg-white px-1.5 py-0.5 border border-primary/20 rounded text-primary font-bold uppercase">{act.newState || "NONE"}</span>
                        </div>
                      )}

                      {/* Decision Note / Remarks box */}
                      {act.note && (
                        <div className="p-2.5 bg-slate-100 text-slate-800 border-l-2 border-slate-400 rounded-r text-[11px] leading-relaxed max-w-2xl">
                          <span className="font-bold text-slate-700 block uppercase text-[9px] mb-0.5 flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5 text-slate-500" /> Administrative Decision Note:
                          </span>
                          <span className="font-medium font-serif italic text-slate-600">&ldquo;{act.note}&rdquo;</span>
                        </div>
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
  );
}
