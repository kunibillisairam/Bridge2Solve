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
  Filter
} from "lucide-react";
import { 
  industryService, 
  IndustryOrganizationProfile, 
  SUPPORT_TYPE_LABELS 
} from "@/services/industryService";
import { ResolvedProject, STAGE_CONFIG } from "@/services/universityMockService";
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

      {/* AVAILABLE PROJECTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brandgray-border/60 pb-2">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Available Collaborative Projects
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
            {projects.map((project) => {
              const stageConfig = STAGE_CONFIG[project.stage];
              return (
                <Card key={project.id} className="border-brandgray-border shadow-subtle bg-white hover:border-primary/30 transition-all flex flex-col justify-between">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-primary-light border border-primary/10 px-2 py-0.5 rounded">
                            {project.id}
                          </span>
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                            {project.originalProblem.category}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-primary">
                          {project.title}
                        </h4>
                      </div>
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-0.5 rounded font-bold">
                        {stageConfig?.label || project.stage} ({project.progress}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-brandgray-muted font-medium">
                        <span>Started: {project.startDate}</span>
                        <span>Target: {project.expectedCompletionDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-brandgray-text leading-relaxed line-clamp-2">
                      {project.originalProblem.description}
                    </p>

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

                    {/* Support Needed Tags */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                        Industry Support Opportunities:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10.5px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          CSR Funding
                        </span>
                        <span className="text-[10.5px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-medium">
                          Technical Mentorship
                        </span>
                        <span className="text-[10.5px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          Equipment & Resources
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-brandgray-border/40 text-xs">
                      <span className="flex items-center gap-1 text-brandgray-muted">
                        <MapPin className="h-3.5 w-3.5" /> {project.originalProblem.district}, {project.originalProblem.state}
                      </span>
                      <Link href={`/industry/projects/${project.id}`}>
                        <Button variant="primary" size="sm" className="h-8 text-xs font-semibold">
                          View Project & Support
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
    </div>
  );
}
