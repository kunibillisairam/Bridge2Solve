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
  ArrowRight,
  PlusCircle,
  CheckCircle,
  FolderKanban,
  Bell,
  Clock
} from "lucide-react";
import { 
  universityMockService, 
  CommunityProblem, 
  UniversityTeam, 
  SolutionProposal, 
  ActivityLog,
  RegisteredProblemDetail
} from "@/services/universityMockService";
import { notificationService, formatRelativeTime } from "@/services/notificationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
  const [recommendedProblems, setRecommendedProblems] = useState<CommunityProblem[]>([]);
  const [registeredDetails, setRegisteredDetails] = useState<RegisteredProblemDetail[]>([]);
  const [teams, setTeams] = useState<UniversityTeam[]>([]);
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const recs = universityMockService.getUnregisteredRecommendedProblems("univ-1");
    const registered = universityMockService.getRegisteredProblemsForUniversity("univ-1");

    setRecommendedProblems(recs);
    setRegisteredDetails(registered);
    setTeams(universityMockService.getTeams());
    setProposals(universityMockService.getProposals("univ-1"));
    setActivities(universityMockService.getActivities());
  };

  // Stats derived from normalized relationships
  const registeredCount = registeredDetails.length;
  const teamFormationPendingCount = registeredDetails.filter((r) => !r.team).length;
  const proposalsSubmittedCount = proposals.filter((p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW" || p.status === "ACCEPTED").length;
  const activeProjectsCount = universityMockService.getProjects().length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-xl font-bold text-primary">University Workspace Dashboard</h2>
        <p className="text-xs text-brandgray-muted mt-1">
          Explore recommended challenges, manage registered community problems, and form research taskforces.
        </p>
      </div>

      {/* ACTION REQUIRED & UNIVERSITY NOTIFICATIONS */}
      {(() => {
        const univNotifs = notificationService.getNotificationsForUser("univ-1", "UNIVERSITY");
        const actionRequired = univNotifs.filter((n) => n.isActionRequired);
        if (univNotifs.length === 0) return null;

        return (
          <Card className="border-amber-300 bg-amber-50/40 shadow-subtle">
            <CardHeader className="p-4 border-b border-amber-200 bg-amber-100/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-600 shrink-0" /> University Action Center ({actionRequired.length} Pending Actions)
              </CardTitle>
              <Link href="/notifications" className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="space-y-2">
                {univNotifs.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex flex-wrap items-center justify-between p-3 rounded bg-white border border-amber-200 text-xs gap-2">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded uppercase ${
                          n.priority === "HIGH" ? "bg-red-50 text-red-800 border-red-300" : "bg-amber-50 text-amber-800 border-amber-300"
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
                        <Button variant="primary" size="sm" className="h-6 text-[10.5px] font-bold bg-amber-700 hover:bg-amber-800 text-white">
                          {n.isActionRequired ? "Take Action" : "View"}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Registered Problems", 
            value: registeredCount, 
            description: "Ownership & interest registered",
            icon: Layers, 
            color: "text-primary bg-primary-light border-primary/10" 
          },
          { 
            label: "Team Formation", 
            value: teamFormationPendingCount, 
            description: "Registered problems without team",
            icon: Users, 
            color: "text-amber-700 bg-amber-50 border-amber-250" 
          },
          { 
            label: "Proposals Submitted", 
            value: proposalsSubmittedCount, 
            description: "Under administrative evaluation",
            icon: FileText, 
            color: "text-indigo-700 bg-indigo-50 border-indigo-200" 
          },
          { 
            label: "Active Projects", 
            value: activeProjectsCount, 
            description: "In implementation stage",
            icon: FolderKanban, 
            color: "text-success bg-success-light border-success/15" 
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recommended Problems & Registered Problems */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 1: RECOMMENDED PROBLEMS (Only problems NOT yet registered) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-brandgray-border/60 pb-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Recommended Problems
              </h3>
              <Link 
                href="/university/problems?tab=recommended" 
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Explore All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recommendedProblems.length === 0 ? (
              <Card className="border-brandgray-border shadow-subtle bg-white">
                <CardContent className="p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-primary">You&apos;re all caught up!</p>
                  <p className="text-xs text-brandgray-muted">No new recommended problems currently matching your university.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recommendedProblems.slice(0, 2).map((problem) => {
                  const rec = universityMockService.getRecommendationForUniversity(problem.id, "univ-1");
                  const matchScore = rec ? rec.score : problem.matchScore;

                  return (
                    <Card key={problem.id} className="border-brandgray-border shadow-subtle hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
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
                              {matchScore}% Match
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${PRIORITY_BADGES[problem.priority as "High" | "Medium" | "Low"]}`}>
                              {problem.priority} Priority
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-brandgray-text leading-relaxed line-clamp-2 mb-3">
                          {problem.description}
                        </p>

                        {rec && (
                          <div className="text-[11px] text-indigo-950 bg-indigo-50/40 p-2.5 rounded border border-indigo-150/60 mb-3 space-y-1">
                            <span className="font-bold uppercase text-[9.5px] block text-indigo-900">Why this matches your university:</span>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700">
                              {rec.reasons.slice(0, 3).map((reason, idx) => (
                                <span key={idx} className="flex items-center gap-1 font-medium text-[10.5px]">
                                  <span className="text-emerald-600 font-extrabold">✓</span> {reason.replace("✓ ", "")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-brandgray-border/40">
                          <span className="flex items-center gap-1 text-xs text-brandgray-muted">
                            <MapPin className="h-3.5 w-3.5" /> {problem.location}
                          </span>
                          <Link href={`/university/problems/${problem.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                              View Details & Express Interest
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

          {/* SECTION 2: MY PROBLEMS / REGISTERED PROBLEMS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-brandgray-border/60 pb-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> My Registered Problems
              </h3>
              <span className="text-xs text-brandgray-muted font-medium">
                {registeredDetails.length} active registrations
              </span>
            </div>

            {registeredDetails.length === 0 ? (
              <Card className="border-brandgray-border shadow-subtle bg-white">
                <CardContent className="p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-primary">No Registered Problems</p>
                  <p className="text-xs text-brandgray-muted">You haven&apos;t registered interest in any problems yet. Explore recommended problems to find opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {registeredDetails.map(({ problem, interest, team, proposal, project }) => (
                  <Card key={problem.id} className="border-primary/20 shadow-subtle bg-white">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                              {problem.category}
                            </span>
                            <span className="text-[9.5px] font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                              ✓ INTEREST REGISTERED
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-primary">
                            {problem.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded font-bold">
                            {problem.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-y border-brandgray-light/60 py-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Location</span>
                          <span className="font-semibold text-brandgray-text">{problem.location}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Registered Date</span>
                          <span className="font-semibold text-brandgray-text">{interest.createdAt}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Team Status</span>
                          {team ? (
                            <span className="font-bold text-emerald-700 block">{team.name}</span>
                          ) : (
                            <span className="font-bold text-amber-700 block">TEAM NOT ASSIGNED</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Stage</span>
                          <span className="font-semibold text-indigo-900 capitalize">
                            {project ? "Project Active" : proposal ? proposal.status : team ? "Team Formed" : "Interest Registered"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        {!team ? (
                          <div className="space-y-2.5 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded font-semibold flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Team Assignment Required
                              </span>
                            </div>
                            
                            {(() => {
                              const recs = universityMockService.getTeamRecommendationsForProblem(problem.id, "univ-1");
                              if (recs.length === 0) return null;
                              const best = recs[0];
                              return (
                                <div className="text-[11px] bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-wrap justify-between items-center gap-2 w-full">
                                  <div className="space-y-0.5">
                                    <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Best Recommended Team Match</span>
                                    <span className="font-extrabold text-primary text-xs">{best.teamName}</span>
                                    <span className="text-indigo-700 font-extrabold ml-2">{best.score}% MATCH ({best.matchLevel})</span>
                                  </div>
                                  <Link href={`/university/problems/${problem.id}`}>
                                    <Button variant="primary" size="sm" className="h-7 text-[10px] font-bold flex items-center gap-1">
                                      Review Teams & Assign <ArrowRight className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded font-medium">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Assigned to {team.name} ({team.facultyMentor})
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/university/problems/${problem.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                              View Problem
                            </Button>
                          </Link>
                          {team && (
                            <Link href="/university/teams">
                              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                                View Team
                              </Button>
                            </Link>
                          )}
                          {proposal && (
                            <Link href="/university/proposals">
                              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                                View Proposal
                              </Button>
                            </Link>
                          )}
                          {project && (
                            <Link href={`/university/projects/${project.id}`}>
                              <Button variant="primary" size="sm" className="h-8 text-xs font-semibold">
                                View Project
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar - Recent Activity & Academic Profile */}
        <div className="space-y-6">
          
          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="border-b border-brandgray-border/60 pb-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Recent Activity
              </h3>
            </div>
            
            <Card className="border-brandgray-border shadow-subtle bg-white">
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
                <GraduationCap className="h-4 w-4 text-primary" /> Institution Profile
              </h3>
            </div>

            <Card className="border-brandgray-border shadow-subtle bg-white">
              <CardContent className="p-5 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-primary">Indian Institute of Science (IISc)</h4>
                  <p className="text-xs text-brandgray-muted">Ranchi Campus, Jharkhand</p>
                </div>
                <div className="text-xs space-y-1 border-t border-brandgray-light pt-2 text-brandgray-text">
                  <div><span className="text-brandgray-muted">Key Departments:</span> Environmental Science, Civil Engineering</div>
                  <div><span className="text-brandgray-muted">Research Focus:</span> Hydrogeology, Water Quality, Microgrids</div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
