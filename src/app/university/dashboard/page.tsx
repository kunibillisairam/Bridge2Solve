"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  Users, 
  FileText, 
  Eye, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  GraduationCap,
  ArrowRight
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem, 
  UniversityTeam, 
  SolutionProposal, 
  ActivityLog 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PRIORITY_BADGES = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_BADGES = {
  Unassigned: "bg-blue-50 text-blue-700 border-blue-150",
  Interested: "bg-yellow-50 text-yellow-700 border-yellow-250",
  "Under Review": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Active Project": "bg-success-light text-success border-success/15",
};

export default function DashboardPage() {
  const [problems, setProblems] = useState<CommunityProblem[]>([]);
  const [teams, setTeams] = useState<UniversityTeam[]>([]);
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // Load from mock service
    setProblems(universityMockService.getProblems());
    setTeams(universityMockService.getTeams());
    setProposals(universityMockService.getProposals());
    setActivities(universityMockService.getActivities());
  }, []);

  // Quick stats calculations based on actual relationships
  const interests = universityMockService.getInterests();
  const matchedProblemsCount = interests.length;
  const underReviewCount = proposals.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW").length;
  const totalTeams = teams.length;
  const totalProposals = proposals.filter((p) => p.status === "SUBMITTED" || p.status === "ACCEPTED").length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-xl font-bold text-primary">Overview Dashboard</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Review community-submitted problems and manage collaborative academic proposals.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Matched Problems", 
            value: matchedProblemsCount, 
            description: "Interest registered by university",
            icon: Layers, 
            color: "text-primary bg-primary-light border-primary/10" 
          },
          { 
            label: "Problems Under Review", 
            value: underReviewCount, 
            description: "Interest expressed / submitted",
            icon: Eye, 
            color: "text-amber-700 bg-amber-50 border-amber-250" 
          },
          { 
            label: "Teams Formed", 
            value: totalTeams, 
            description: "Active research taskforces",
            icon: Users, 
            color: "text-success bg-success-light border-success/15" 
          },
          { 
            label: "Proposals Submitted", 
            value: totalProposals, 
            description: "Formally submitted for funding",
            icon: FileText, 
            color: "text-indigo-700 bg-indigo-50 border-indigo-200" 
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-brandgray-border shadow-subtle flex flex-col justify-between">
              <CardContent className="p-5 flex items-center gap-4.5">
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

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Problems */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-brandgray-border/60 pb-2">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Recommended Problems
            </h3>
            <Link 
              href="/university/problems" 
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Explore All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {problems.slice(0, 3).map((problem) => (
              <Card key={problem.id} className="border-brandgray-border shadow-subtle hover:border-primary/30 transition-all duration-150">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                        {problem.category}
                      </span>
                      <h4 className="text-base font-bold text-primary">
                        {problem.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded font-bold">
                        {problem.matchScore}% Match
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${PRIORITY_BADGES[problem.priority]}`}>
                        {problem.priority} Priority
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-brandgray-text/95 leading-relaxed line-clamp-2 mb-4">
                    {problem.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-brandgray-border/40">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brandgray-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-brandgray-muted/80" />
                        {problem.location}
                      </span>
                      <span>
                        Affected: <span className="font-semibold text-brandgray-text">{problem.affectedPopulation}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGES[problem.status]}`}>
                        {problem.status}
                      </span>
                      <Link href={`/university/problems/${problem.id}`}>
                        <Button variant="outline" size="sm" className="h-8">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Recent Activity & Expertise Summary */}
        <div className="space-y-6">
          
          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="border-b border-brandgray-border/60 pb-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Recent Activity
              </h3>
            </div>
            
            <Card className="border-brandgray-border shadow-subtle">
              <CardContent className="p-4 space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-6 text-xs text-brandgray-muted">No recent activity.</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-xs leading-relaxed border-b border-brandgray-light/60 last:border-0 pb-3 last:pb-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-brandgray-text">{activity.text}</p>
                        <span className="text-[10px] text-brandgray-muted block">{activity.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Academic Profile Snapshot */}
          <div className="space-y-4">
            <div className="border-b border-brandgray-border/60 pb-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Academic Profile
              </h3>
            </div>

            <Card className="border-brandgray-border shadow-subtle bg-white">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-brandgray-muted block uppercase tracking-wider">
                    Core Departments
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {["Environmental Science", "Civil Engineering", "Biotechnology", "Electrical Engineering", "Social Work"].map((dept) => (
                      <span key={dept} className="text-[10px] bg-brandgray-light text-brandgray-text px-2 py-0.5 rounded border border-brandgray-border font-medium">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-3 border-t border-brandgray-border/50">
                  <span className="text-xs font-semibold text-brandgray-muted block uppercase tracking-wider">
                    Key Research Fields
                  </span>
                  <p className="text-xs text-brandgray-text leading-relaxed">
                    Water filtration, microgrids, bioremediation, remote pedagogy, community governance, sustainable cooling solutions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
