"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Layers, 
  Handshake, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  Users, 
  GraduationCap, 
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Bell,
  Clock
} from "lucide-react";
import { 
  industryService, 
  IndustryOrganizationProfile, 
  SUPPORT_TYPE_LABELS 
} from "@/services/industryService";
import { ResolvedProject, STAGE_CONFIG } from "@/services/universityMockService";
import { notificationService, formatRelativeTime } from "@/services/notificationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function IndustryDashboard() {
  const [profile, setProfile] = useState<IndustryOrganizationProfile | null>(null);
  const [projects, setProjects] = useState<ResolvedProject[]>([]);
  const [metrics, setMetrics] = useState({
    availableProjectsCount: 0,
    myInterestsCount: 0,
    supportRequestsCount: 0,
    activePartnershipsCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const prof = industryService.getProfile("ind-1");
    setProfile(prof);

    const eligible = industryService.getEligibleProjects();
    setProjects(eligible);

    const m = industryService.getIndustryMetrics("ind-1");
    setMetrics(m);
  };

  return (
    <div className="space-y-8">
      {/* Workspace Banner */}
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Industry / CSR Workspace
            </span>
          </div>
          <h2 className="text-xl font-bold text-primary">
            Welcome, {profile?.representativeName || "Industry Partner"}
          </h2>
          <p className="text-xs text-brandgray-muted flex items-center gap-1.5 font-medium">
            <Building2 className="h-3.5 w-3.5 text-primary" /> {profile?.name || "Corporate Partner"} · {profile?.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/industry/projects">
            <Button variant="primary" size="sm" className="h-9 text-xs font-semibold flex items-center gap-1.5">
              Browse All Projects <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ACTION REQUIRED & INDUSTRY NOTIFICATIONS */}
      {(() => {
        const indNotifs = notificationService.getNotificationsForUser("ind-1", "INDUSTRY");
        if (indNotifs.length === 0) return null;

        return (
          <Card className="border-indigo-200 bg-indigo-50/40 shadow-subtle">
            <CardHeader className="p-4 border-b border-indigo-150 bg-indigo-100/40 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600 shrink-0" /> Industry Action Center & Support Updates
              </CardTitle>
              <Link href="/notifications" className="text-xs font-bold text-indigo-900 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="space-y-2">
                {indNotifs.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex flex-wrap items-center justify-between p-3 rounded bg-white border border-indigo-150 text-xs gap-2">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded uppercase ${
                          n.priority === "HIGH" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-indigo-50 text-indigo-800 border-indigo-200"
                        }`}>
                          {n.priority}
                        </span>
                        <span className="font-bold text-primary">{n.title}</span>
                      </div>
                      <p className="text-[11px] text-brandgray-text line-clamp-1">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-brandgray-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatRelativeTime(n.createdAt)}
                      </span>
                      <Link href={n.actionUrl}>
                        <Button variant="outline" size="sm" className="h-6 text-[10.5px] font-bold">
                          View Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Available Projects", 
            value: metrics.availableProjectsCount, 
            description: "Active projects seeking industry support",
            icon: Layers, 
            color: "text-primary bg-primary-light border-primary/10" 
          },
          { 
            label: "My Interests", 
            value: metrics.myInterestsCount, 
            description: "Support requests submitted by your org",
            icon: Handshake, 
            color: "text-indigo-700 bg-indigo-50 border-indigo-200" 
          },
          { 
            label: "Support Requests", 
            value: metrics.supportRequestsCount, 
            description: "Pending or under review",
            icon: FileText, 
            color: "text-amber-700 bg-amber-50 border-amber-250" 
          },
          { 
            label: "Active Partnerships", 
            value: metrics.activePartnershipsCount, 
            description: "Confirmed CSR & technical collaborations",
            icon: CheckCircle2, 
            color: "text-emerald-700 bg-emerald-50 border-emerald-250" 
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

      {/* RECOMMENDED PROJECTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brandgray-border/60 pb-2">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" /> Recommended Projects for Your Organization
          </h3>
          <Link 
            href="/industry/projects" 
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All Projects ({projects.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardContent className="p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-primary">No Projects Available</p>
              <p className="text-xs text-brandgray-muted">No active university projects are currently eligible for industry participation.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(() => {
              const rankedProjects = [...projects].map(p => {
                const match = industryService.getMatchForIndustryAndProject(p.id, "ind-1");
                return { project: p, match };
              }).sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));

              return rankedProjects.map(({ project, match }) => {
                const stageConfig = STAGE_CONFIG[project.stage];
                return (
                  <Card key={project.id} className="border-indigo-200 shadow-subtle bg-white hover:border-indigo-400 transition-all flex flex-col justify-between">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                              {project.id}
                            </span>
                            <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                              {project.originalProblem.category}
                            </span>
                            {match && (
                              <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                                {match.score}% MATCH ({match.matchLevel})
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-primary">
                            {project.title}
                          </h4>
                        </div>
                        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-0.5 rounded font-bold">
                          {stageConfig?.label || project.stage} ({project.progress}%)
                        </span>
                      </div>

                      {/* Match Reasons Highlights */}
                      {match && match.reasons.length > 0 && (
                        <div className="p-2.5 bg-indigo-50/40 border border-indigo-150 rounded space-y-1 text-xs">
                          <span className="text-[9.5px] font-extrabold text-indigo-900 uppercase block">Why Recommended:</span>
                          <div className="space-y-0.5">
                            {match.reasons.slice(0, 3).map((r: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10.5px] text-slate-700 font-medium">
                                <span className="text-emerald-600 font-extrabold">✓</span>
                                <span>{r.replace("✓ ", "")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* University & Team Info */}
                      <div className="p-3 bg-slate-50 rounded border border-slate-150 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-primary">
                          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                          <span>{project.collaboration.university}</span>
                        </div>
                        {project.assignedTeam && (
                          <p className="text-[11px] text-brandgray-muted flex items-center gap-1 pl-5">
                            <Users className="h-3.5 w-3.5 shrink-0" /> Team: {project.assignedTeam.name} ({project.assignedTeam.facultyMentor})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-brandgray-border/40 text-xs">
                        <span className="flex items-center gap-1 text-brandgray-muted">
                          <MapPin className="h-3.5 w-3.5" /> {project.originalProblem.district}, {project.originalProblem.state}
                        </span>
                        <Link href={`/industry/projects/${project.id}`}>
                          <Button variant="primary" size="sm" className="h-8 text-xs font-bold">
                            View Project & Support
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
