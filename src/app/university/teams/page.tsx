"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Plus, 
  X, 
  AlertCircle,
  Briefcase
} from "lucide-react";
import { 
  universityMockService, 
  UniversityTeam, 
  CommunityProblem 
} from "@/services/universityMockService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TeamsPage() {
  const [teams, setTeams] = useState<UniversityTeam[]>([]);
  const [interestedProblems, setInterestedProblems] = useState<CommunityProblem[]>([]);
  
  // Modal / Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newFacultyMentor, setNewFacultyMentor] = useState("");
  const [newStudentMembers, setNewStudentMembers] = useState("");
  const [newRequiredSkills, setNewRequiredSkills] = useState("");
  const [newAssignedProblemId, setNewAssignedProblemId] = useState("");
  const [formError, setFormError] = useState("");

  // Add Member State (Keyed by Team ID)
  const [addMemberName, setAddMemberName] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTeams(universityMockService.getTeams());
    // Only fetch problems where current university expressed interest and are available for assignment
    setInterestedProblems(universityMockService.getInterestedProblemsForTeams("univ-1"));
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

    // Create the team
    const created = universityMockService.createTeam({
      name: newTeamName.trim(),
      facultyMentor: newFacultyMentor.trim(),
      studentMembers: students,
      requiredSkills: skills,
    });

    // Assign problem if selected
    if (newAssignedProblemId) {
      universityMockService.assignProblemToTeam(created.id, newAssignedProblemId, "univ-1");
    }

    // Reset Form
    setNewTeamName("");
    setNewFacultyMentor("");
    setNewStudentMembers("");
    setNewRequiredSkills("");
    setNewAssignedProblemId("");
    setIsCreateModalOpen(false);
    
    // Reload
    loadData();
  };

  const handleAddMember = (teamId: string) => {
    const name = addMemberName[teamId]?.trim();
    if (!name) return;

    universityMockService.addTeamMember(teamId, name);
    
    setAddMemberName((prev) => ({ ...prev, [teamId]: "" }));
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">University Research Teams</h2>
          <p className="text-xs text-brandgray-muted mt-1">
            Form student/faculty taskforces and manage their expertise profiles and problem assignments.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 font-semibold text-xs h-9"
        >
          <Plus className="h-4 w-4" /> Create Team
        </Button>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="border-brandgray-border shadow-subtle flex flex-col justify-between bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-primary">{team.name}</h3>
                  <p className="text-[11px] text-brandgray-muted mt-0.5 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" /> Faculty Mentor: <span className="font-semibold text-brandgray-text">{team.facultyMentor}</span>
                  </p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  team.status === "Active" 
                    ? "bg-success-light text-success border-success/15" 
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}>
                  {team.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4.5 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Assigned Problem */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Assigned Challenge
                  </span>
                  {team.assignedProblemId ? (
                    <Link 
                      href={`/university/problems/${team.assignedProblemId}`}
                      className="text-xs font-semibold text-primary hover:underline block leading-relaxed"
                    >
                      {team.assignedProblemTitle}
                    </Link>
                  ) : (
                    <span className="text-xs text-brandgray-muted block italic">
                      No problem assigned
                    </span>
                  )}
                </div>

                {/* Student Members */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Student Members ({team.studentMembers.length})
                  </span>
                  {team.studentMembers.length === 0 ? (
                    <span className="text-xs text-brandgray-muted block italic">No members added yet</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {team.studentMembers.map((member, i) => (
                        <span key={i} className="text-[10.5px] bg-brandgray-light text-brandgray-text px-2 py-0.5 rounded border border-brandgray-border font-medium">
                          {member}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Required Skills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                    Focus Areas / Skills
                  </span>
                  {team.requiredSkills.length === 0 ? (
                    <span className="text-xs text-brandgray-muted block italic">No skills listed</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {team.requiredSkills.map((skill, i) => (
                        <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Member Interactive Form */}
              <div className="pt-4 border-t border-brandgray-border/40 space-y-2">
                <label className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Add Team Member
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addMemberName[team.id] || ""}
                    onChange={(e) => setAddMemberName((prev) => ({ ...prev, [team.id]: e.target.value }))}
                    placeholder="e.g. Anil Kumar (MTech)"
                    className="flex-1 bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddMember(team.id)}
                    className="h-8 shrink-0 flex items-center gap-1 font-semibold text-xs px-2.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Team Overlay Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md border border-brandgray-border shadow-standard w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-brandgray-border/60">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-primary" /> Create New Research Team
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setFormError("");
                }}
                className="text-brandgray-muted hover:text-brandgray-text transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Water Purification Taskforce"
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Faculty Mentor Name & Department *
                </label>
                <input
                  type="text"
                  required
                  value={newFacultyMentor}
                  onChange={(e) => setNewFacultyMentor(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar (Environmental Science)"
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Initial Students (comma-separated)
                </label>
                <textarea
                  value={newStudentMembers}
                  onChange={(e) => setNewStudentMembers(e.target.value)}
                  placeholder="e.g. Amit Sharma (MTech), Pooja Patel (BTech)"
                  rows={2}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  Skills & Focus Areas (comma-separated)
                </label>
                <input
                  type="text"
                  value={newRequiredSkills}
                  onChange={(e) => setNewRequiredSkills(e.target.value)}
                  placeholder="e.g. Water filtration, Piping, Hydrogeology"
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brandgray-muted uppercase tracking-wider block">
                  ASSIGN COMMUNITY PROBLEM
                </label>
                <select
                  value={newAssignedProblemId}
                  onChange={(e) => setNewAssignedProblemId(e.target.value)}
                  className="w-full bg-brandgray-light/40 border border-brandgray-border rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white font-medium"
                >
                  <option value="">-- No Problem Assigned --</option>
                  {interestedProblems.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.location})
                    </option>
                  ))}
                </select>
                {interestedProblems.length === 0 && (
                  <p className="text-[10.5px] text-amber-700 mt-1">
                    No unassigned interested problems available. Express interest in a problem first to assign it here.
                  </p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-brandgray-border/60 bg-brandgray-light/30 flex justify-end gap-3 -mx-6 -mb-6 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
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
