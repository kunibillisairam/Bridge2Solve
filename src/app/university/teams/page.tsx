"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Plus, 
  X, 
  AlertCircle,
  Briefcase,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { 
  universityMockService, 
  UniversityTeam, 
  CommunityProblem,
  RegisteredProblemDetail
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TeamsPage() {
  const searchParams = useSearchParams();
  const assignProblemIdFromUrl = searchParams.get("assignProblemId");

  const [teams, setTeams] = useState<UniversityTeam[]>([]);
  const [registeredDetails, setRegisteredDetails] = useState<RegisteredProblemDetail[]>([]);
  
  // Modal / Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newFacultyMentor, setNewFacultyMentor] = useState("");
  const [newStudentMembers, setNewStudentMembers] = useState("");
  const [newRequiredSkills, setNewRequiredSkills] = useState("");
  const [newAssignedProblemId, setNewAssignedProblemId] = useState("");
  const [formError, setFormError] = useState("");

  // Assign Team Modal State
  const [assignModalProblem, setAssignModalProblem] = useState<CommunityProblem | null>(null);
  const [selectedTeamIdToAssign, setSelectedTeamIdToAssign] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [expandedRecTeamId, setExpandedRecTeamId] = useState<string | null>(null);

  // Add Member State (Keyed by Team ID)
  const [addMemberName, setAddMemberName] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (assignProblemIdFromUrl) {
      const prob = universityMockService.getProblemById(assignProblemIdFromUrl);
      if (prob) {
        setAssignModalProblem(prob);
      }
    }
  }, [assignProblemIdFromUrl]);

  const loadData = () => {
    const allTeams = universityMockService.getTeams();
    setTeams(allTeams);

    const registered = universityMockService.getRegisteredProblemsForUniversity("univ-1");
    setRegisteredDetails(registered);
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newTeamName.trim() || !newFacultyMentor.trim()) {
      setFormError("Team Name and Faculty Mentor are required.");
      return;
    }

    const students = newStudentMembers
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const skills = newRequiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const created = universityMockService.createTeam({
      name: newTeamName.trim(),
      facultyMentor: newFacultyMentor.trim(),
      studentMembers: students,
      requiredSkills: skills,
    });

    if (newAssignedProblemId) {
      try {
        universityMockService.assignTeamToProblem(created.id, newAssignedProblemId, "univ-1");
      } catch (err: any) {
        console.error(err);
      }
    }

    // Reset Form
    setNewTeamName("");
    setNewFacultyMentor("");
    setNewStudentMembers("");
    setNewRequiredSkills("");
    setNewAssignedProblemId("");
    setIsCreateModalOpen(false);
    loadData();
  };

  const handleAssignTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess("");

    if (!assignModalProblem || !selectedTeamIdToAssign) {
      setAssignError("Please select an available research team.");
      return;
    }

    try {
      universityMockService.assignTeamToProblem(selectedTeamIdToAssign, assignModalProblem.id, "univ-1");
      setAssignSuccess(`Team successfully assigned to "${assignModalProblem.title}"!`);
      setTimeout(() => {
        setAssignModalProblem(null);
        setSelectedTeamIdToAssign("");
        setAssignSuccess("");
        loadData();
      }, 1500);
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign team.");
    }
  };

  const handleAddMember = (teamId: string) => {
    const name = addMemberName[teamId]?.trim();
    if (!name) return;

    universityMockService.addTeamMember(teamId, name);
    setAddMemberName((prev) => ({ ...prev, [teamId]: "" }));
    loadData();
  };

  const problemsNeedingTeams = registeredDetails.filter((r) => !r.team);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold text-primary">Research Taskforces & Team Formation</h2>
          <p className="text-xs text-brandgray-muted mt-1">
            Form multi-disciplinary student research teams and assign them to registered community problems.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          className="h-9 text-xs font-semibold flex items-center gap-1.5"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" /> Create Research Team
        </Button>
      </div>

      {/* SECTION 1: PROBLEMS REQUIRING TEAM ASSIGNMENT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Problems Requiring Team Assignment ({problemsNeedingTeams.length})
          </h3>
        </div>

        {problemsNeedingTeams.length === 0 ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>All registered community problems have research teams assigned.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemsNeedingTeams.map(({ problem }) => (
              <Card key={problem.id} className="border-amber-200 shadow-subtle bg-amber-50/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        {problem.category}
                      </span>
                      <h4 className="text-sm font-bold text-primary">{problem.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                      TEAM NOT ASSIGNED
                    </span>
                  </div>

                  <p className="text-xs text-brandgray-muted line-clamp-2">{problem.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                    <span className="text-[11px] text-brandgray-muted">{problem.location}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-8 text-xs font-semibold"
                      onClick={() => setAssignModalProblem(problem)}
                    >
                      Assign Research Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: EXISTING RESEARCH TEAMS */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" /> Active University Teams ({teams.length})
        </h3>

        {teams.length === 0 ? (
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardContent className="p-8 text-center space-y-3 max-w-xl mx-auto">
              <Users className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-primary">No Active Teams Formed</p>
              <p className="text-xs text-brandgray-muted leading-relaxed">
                Your university has not registered any active academic research taskforces yet. Formed teams are required to coordinate proposals, assign developers, and implement solutions.
              </p>
              <p className="text-[11px] font-bold text-primary">
                What next: Click the "Create Research Team" button above to add a new team specifying a mentor, members, and skill focus.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="border-brandgray-border shadow-subtle bg-white flex flex-col justify-between">
                <div>
                  <CardHeader className="p-5 border-b border-brandgray-border/60 flex flex-row items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold text-primary">
                        {team.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-brandgray-muted flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" /> Mentor: {team.facultyMentor}
                      </CardDescription>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      team.status === "Active" 
                        ? "bg-success-light text-success border-success/15" 
                        : "bg-blue-50 text-blue-700 border-blue-150"
                    }`}>
                      {team.status}
                    </span>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    {/* Assigned Problem Context */}
                    <div className="space-y-1 bg-brandgray-light/50 p-3 rounded border border-brandgray-border/50 text-xs">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase block">
                        Assigned Problem Challenge
                      </span>
                      {team.assignedProblemTitle ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-primary">{team.assignedProblemTitle}</span>
                          {team.assignedProblemId && (
                            <Link href={`/university/problems/${team.assignedProblemId}`}>
                              <span className="text-[10px] text-primary font-bold hover:underline">View</span>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-brandgray-muted italic">Unassigned (Available for new project)</span>
                      )}
                    </div>

                    {/* Student Members */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                        Student Researchers ({team.studentMembers.length})
                      </span>
                      <div className="space-y-1">
                        {team.studentMembers.map((member, i) => (
                          <div key={i} className="text-xs text-brandgray-text flex items-center gap-2 bg-white border border-brandgray-border/60 px-2.5 py-1.5 rounded">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{member}</span>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Member Input */}
                      <div className="flex gap-2 pt-1">
                        <input 
                          type="text"
                          placeholder="Add student name..."
                          className="text-xs border border-brandgray-border rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-primary"
                          value={addMemberName[team.id] || ""}
                          onChange={(e) => setAddMemberName({ ...addMemberName, [team.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddMember(team.id);
                          }}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs font-semibold px-3"
                          onClick={() => handleAddMember(team.id)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                        Domain Capabilities
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {team.requiredSkills.map((skill, i) => (
                          <span key={i} className="text-[10.5px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGN TEAM MODAL */}
      {assignModalProblem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-brandgray-border">
            <div className="flex justify-between items-center border-b border-brandgray-border pb-3">
              <div>
                <h3 className="font-bold text-primary text-base">Assign Research Team</h3>
                <p className="text-xs text-brandgray-muted">Select an available team for this community problem</p>
              </div>
              <button 
                onClick={() => setAssignModalProblem(null)}
                className="text-brandgray-muted hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {assignSuccess && (
              <div className="p-3 bg-success-light text-success border border-success/15 rounded text-xs font-semibold">
                {assignSuccess}
              </div>
            )}

            {assignError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignTeamSubmit} className="space-y-4">
              <div className="p-3 bg-brandgray-light/60 rounded border border-brandgray-border text-xs space-y-1">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Target Problem</span>
                <p className="font-bold text-primary text-sm">{assignModalProblem.title}</p>
                <p className="text-brandgray-muted">{assignModalProblem.category} · {assignModalProblem.location}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider block">
                  Select Matched Team
                </label>
                <div className="space-y-3 max-h-72 overflow-y-auto border border-brandgray-border rounded p-3">
                  {(() => {
                    const teamRecs = universityMockService.getTeamRecommendationsForProblem(assignModalProblem.id, "univ-1");
                    if (teamRecs.length === 0) {
                      return <p className="text-xs text-brandgray-muted text-center py-4">No active available research teams match this problem requirements.</p>;
                    }
                    return teamRecs.map((tr, idx) => {
                      const isSelected = selectedTeamIdToAssign === tr.teamId;
                      const isExpanded = expandedRecTeamId === tr.teamId;
                      
                      return (
                        <div 
                          key={tr.teamId} 
                          className={`p-3 rounded-lg border transition-all space-y-2 ${
                            isSelected 
                              ? "border-indigo-650 bg-indigo-50/20 ring-1 ring-indigo-500/20" 
                              : "border-brandgray-border hover:bg-slate-50"
                          }`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                              type="radio" 
                              name="assignTeam" 
                              value={tr.teamId} 
                              checked={isSelected}
                              onChange={() => setSelectedTeamIdToAssign(tr.teamId)}
                              className="mt-1"
                            />
                            <div className="text-xs space-y-0.5 flex-1">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-primary">{idx + 1}. {tr.teamName}</span>
                                <div className="text-right shrink-0">
                                  <span className="text-[11px] font-extrabold text-indigo-700 block">{tr.score}% Match</span>
                                  <span className="text-[8px] font-bold text-slate-500 uppercase block">{tr.matchLevel} MATCH</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-brandgray-muted">Mentor: {tr.reasons.find(r => r.includes("mentor"))?.replace("✓ ", "") || "Faculty Mentor"}</p>
                            </div>
                          </label>

                          {/* Explanations */}
                          <div className="pl-6 space-y-0.5">
                            {tr.reasons.slice(0, 3).map((reason: string, rIdx: number) => (
                              <div key={rIdx} className="flex items-center gap-1 text-[10px] text-slate-650 font-medium">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{reason.replace("✓ ", "")}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pl-6 flex gap-2">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              className="h-6 text-[9.5px] font-semibold text-slate-700 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setExpandedRecTeamId(isExpanded ? null : tr.teamId);
                              }}
                            >
                              {isExpanded ? "Hide Breakdown" : "Score Breakdown"}
                            </Button>
                          </div>

                          {/* BREAKDOWN */}
                          {isExpanded && (
                            <div className="ml-6 bg-white border border-slate-200 rounded p-2 text-[10px] space-y-1">
                              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                                <div className="flex justify-between">
                                  <span className="text-brandgray-muted">Expertise:</span>
                                  <span className="font-semibold">{tr.breakdown.expertiseScore}/30</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-brandgray-muted">Skills:</span>
                                  <span className="font-semibold">{tr.breakdown.skillsScore}/25</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-brandgray-muted">Focus:</span>
                                  <span className="font-semibold">{tr.breakdown.researchFocusScore}/15</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-brandgray-muted">Domain:</span>
                                  <span className="font-semibold">{tr.breakdown.domainScore}/10</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-brandgray-muted">Dept:</span>
                                  <span className="font-semibold">{tr.breakdown.departmentScore}/10</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-brandgray-muted">Previous Work:</span>
                                  <span className="font-semibold">{tr.breakdown.previousExperienceScore}/5</span>
                                </div>
                                <div className="flex justify-between col-span-2 border-t border-slate-100 pt-0.5">
                                  <span className="text-brandgray-muted">Location:</span>
                                  <span className="font-semibold">{tr.breakdown.locationScore}/5</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-brandgray-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAssignModalProblem(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                  className="font-semibold"
                >
                  Confirm Team Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-brandgray-border">
            <div className="flex justify-between items-center border-b border-brandgray-border pb-3">
              <h3 className="font-bold text-primary text-base">Create Research Team</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-brandgray-muted hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">Team Name *</label>
                <input 
                  type="text"
                  placeholder="e.g. Jal-Dhara Innovations"
                  className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">Faculty Mentor *</label>
                <input 
                  type="text"
                  placeholder="e.g. Dr. Ramesh Kumar (Civil Dept)"
                  className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                  value={newFacultyMentor}
                  onChange={(e) => setNewFacultyMentor(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">Student Members (Comma Separated)</label>
                <input 
                  type="text"
                  placeholder="e.g. Amit Sharma (MTech), Pooja Patel (BTech)"
                  className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                  value={newStudentMembers}
                  onChange={(e) => setNewStudentMembers(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">Domain Capabilities (Comma Separated)</label>
                <input 
                  type="text"
                  placeholder="e.g. Hydrogeology, Filtration Systems, Piping"
                  className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                  value={newRequiredSkills}
                  onChange={(e) => setNewRequiredSkills(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-brandgray-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                  className="font-semibold"
                >
                  Create Team
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
