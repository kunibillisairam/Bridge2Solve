"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Filter, 
  Check, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  User, 
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  FolderKanban
} from "lucide-react";
import { 
  notificationService, 
  NotificationItem, 
  NotificationRole, 
  formatRelativeTime 
} from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PRIORITY_BADGES = {
  HIGH: "bg-red-50 text-red-800 border-red-300 font-extrabold",
  MEDIUM: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
  LOW: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
};

const ENTITY_ICONS = {
  PROBLEM: Layers,
  PROPOSAL: FileText,
  PROJECT: FolderKanban,
  INDUSTRY_REQUEST: Building2,
  IMPACT_ASSESSMENT: Sparkles,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Role context state (defaults to auth role or ADMIN for evaluation)
  const currentRole: NotificationRole = (user?.role as NotificationRole) || "ADMIN";
  const currentUserId = user?.id || (currentRole === "ADMIN" ? "admin-1" : currentRole === "UNIVERSITY" ? "univ-1" : currentRole === "INDUSTRY" ? "ind-1" : "citizen-1");

  const [activeRoleFilter, setActiveRoleFilter] = useState<NotificationRole>(currentRole);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "action">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [activeRoleFilter]);

  const loadNotifications = () => {
    const roleUserId = activeRoleFilter === "ADMIN" ? "admin-1" : activeRoleFilter === "UNIVERSITY" ? "univ-1" : activeRoleFilter === "INDUSTRY" ? "ind-1" : "citizen-1";
    const data = notificationService.getNotificationsForUser(roleUserId, activeRoleFilter);
    setNotifications(data);
  };

  const handleMarkAsRead = (id: string) => {
    const roleUserId = activeRoleFilter === "ADMIN" ? "admin-1" : activeRoleFilter === "UNIVERSITY" ? "univ-1" : activeRoleFilter === "INDUSTRY" ? "ind-1" : "citizen-1";
    notificationService.markAsRead(id, roleUserId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    const roleUserId = activeRoleFilter === "ADMIN" ? "admin-1" : activeRoleFilter === "UNIVERSITY" ? "univ-1" : activeRoleFilter === "INDUSTRY" ? "ind-1" : "citizen-1";
    notificationService.markAllAsRead(roleUserId, activeRoleFilter);
    loadNotifications();
  };

  // Filtered Notifications
  let filtered = notifications;
  if (activeTab === "unread") {
    filtered = notifications.filter((n) => !n.isRead);
  } else if (activeTab === "action") {
    filtered = notifications.filter((n) => n.isActionRequired);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const actionRequiredCount = notifications.filter((n) => n.isActionRequired && !n.isRead).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-primary uppercase tracking-wide flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-amber-500" /> NOTIFICATIONS & ACTION CENTER
          </h1>
          <p className="text-xs text-brandgray-muted mt-1 font-medium">
            Stay updated on state changes, approvals, project milestones, and pending actions across the ProblemBridge ecosystem.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold flex items-center gap-1.5 border-brandgray-border text-brandgray-text hover:bg-slate-50"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Role Context Selector Bar */}
      <div className="bg-white border border-brandgray-border rounded-lg p-3.5 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Filter className="h-4 w-4 text-primary" />
          <span>Role View Context:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { role: "ADMIN" as const, label: "Platform Admin", icon: ShieldCheck, color: "bg-rose-50 border-rose-200 text-rose-800" },
            { role: "UNIVERSITY" as const, label: "University", icon: GraduationCap, color: "bg-purple-50 border-purple-200 text-purple-800" },
            { role: "INDUSTRY" as const, label: "Industry / CSR", icon: Building2, color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
            { role: "CITIZEN" as const, label: "Citizen", icon: User, color: "bg-blue-50 border-blue-200 text-blue-800" },
          ].map((r) => {
            const Icon = r.icon;
            const isActive = activeRoleFilter === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setActiveRoleFilter(r.role)}
                className={`py-1.5 px-3 rounded border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-subtle"
                    : `${r.color} hover:opacity-90`
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Required High Priority Summary Card */}
      {actionRequiredCount > 0 && (
        <Card className="border-amber-300 bg-amber-50/60 shadow-subtle">
          <CardHeader className="p-4 border-b border-amber-200 bg-amber-100/50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600" /> Action Required Queue ({actionRequiredCount})
            </CardTitle>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded border border-amber-300">
              URGENT TASKS PENDING
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <p className="text-amber-950 font-medium leading-relaxed">
              You have {actionRequiredCount} task{actionRequiredCount > 1 ? "s" : ""} requiring immediate decision or submission.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notification Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-brandgray-border text-xs gap-2">
        <div className="flex gap-2">
          {[
            { key: "all", label: `All Notifications (${notifications.length})` },
            { key: "unread", label: `Unread (${unreadCount})` },
            { key: "action", label: `Action Required (${actionRequiredCount})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`py-2.5 px-4 font-bold border-b-2 transition-all ${
                activeTab === t.key
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-brandgray-muted hover:text-brandgray-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card className="border-brandgray-border bg-white shadow-subtle">
          <CardContent className="p-12 text-center space-y-3">
            <Bell className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-primary">No Notifications Found</p>
            <p className="text-xs text-brandgray-muted">You have no notifications matching this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = ENTITY_ICONS[item.entityType] || Bell;
            const timeFormatted = formatRelativeTime(item.createdAt);

            return (
              <Card
                key={item.id}
                className={`border shadow-subtle transition-all bg-white hover:border-primary/40 ${
                  !item.isRead ? "border-l-4 border-l-primary bg-slate-50/50" : "border-brandgray-border"
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Icon className="h-4 w-4" />
                      </span>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9.5px] px-2 py-0.5 rounded border uppercase ${PRIORITY_BADGES[item.priority]}`}>
                            {item.priority} Priority
                          </span>
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                            {item.entityType.replace("_", " ")}
                          </span>
                          {item.isActionRequired && (
                            <span className="text-[9.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                              ACTION REQUIRED
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-primary leading-tight">{item.title}</h3>
                        <p className="text-xs text-brandgray-text leading-relaxed">{item.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] font-medium text-brandgray-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeFormatted}
                      </span>

                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-brandgray-border/40">
                    <Link href={item.actionUrl}>
                      <Button
                        variant={item.isActionRequired ? "primary" : "outline"}
                        size="sm"
                        className={`h-7 text-xs font-bold flex items-center gap-1.5 ${
                          item.isActionRequired ? "bg-amber-700 hover:bg-amber-800 text-white" : ""
                        }`}
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        {item.isActionRequired ? (
                          <>
                            Take Action <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            View Details <ExternalLink className="h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
