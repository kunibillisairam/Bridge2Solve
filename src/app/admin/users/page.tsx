"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  X, 
  Building2, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  Building,
  UserCheck
} from "lucide-react";
import { universityMockService } from "@/services/universityMockService";
import { industryService } from "@/services/industryService";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminUsersRegistryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Registry states
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Dynamic context states for counts
  const [mockProblems, setMockProblems] = useState<any[]>([]);
  const [mockProjects, setMockProjects] = useState<any[]>([]);
  const [mockInterests, setMockInterests] = useState<any[]>([]);
  const [mockSupportRequests, setMockSupportRequests] = useState<any[]>([]);
  const [mockPartnerships, setMockPartnerships] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadRegistryData();
  }, []);

  const loadRegistryData = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      } else {
        setErrorMsg(data.error || "Failed to load users database.");
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setErrorMsg("Network error loading users registry.");
    } finally {
      setLoadingUsers(false);
    }

    // Load mock objects to cross-reference counts client-side dynamically
    setMockProblems(universityMockService.getProblems());
    setMockProjects(universityMockService.getProjects());
    setMockInterests(universityMockService.getInterests());
    setMockSupportRequests(industryService.getAllSupportRequests());
    setMockPartnerships(industryService.getAllPartnerships());
  };

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-xs font-semibold text-brandgray-muted">
        Verifying administrator credentials...
      </div>
    );
  }

  // Summary Metrics
  const totalCount = users.length;
  const citizenCount = users.filter(u => u.role === "CITIZEN").length;
  const universityCount = users.filter(u => u.role === "UNIVERSITY").length;
  const industryCount = users.filter(u => u.role === "INDUSTRY").length;
  const adminCount = users.filter(u => u.role === "ADMIN").length;

  // Filtering & Search implementation
  const filteredUsers = users.filter(u => {
    // 1. Role filter
    if (selectedRoleFilter !== "All") {
      if (selectedRoleFilter === "Citizens" && u.role !== "CITIZEN") return false;
      if (selectedRoleFilter === "Universities" && u.role !== "UNIVERSITY") return false;
      if (selectedRoleFilter === "Industry / CSR" && u.role !== "INDUSTRY") return false;
      if (selectedRoleFilter === "Admins" && u.role !== "ADMIN") return false;
    }

    // 2. Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = u.name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      const orgMatch = u.orgName?.toLowerCase().includes(q);
      const stateMatch = u.state?.toLowerCase().includes(q);
      const distMatch = u.district?.toLowerCase().includes(q);
      const locMatch = u.location?.toLowerCase().includes(q);
      const repMatch = u.representative?.toLowerCase().includes(q);

      return nameMatch || emailMatch || orgMatch || stateMatch || distMatch || locMatch || repMatch;
    }

    return true;
  });

  // Calculate dynamic stats for detail view panel
  const getDynamicUserStats = (targetUser: any) => {
    const stats = {
      problemsCount: 0,
      interestsCount: 0,
      activeProjectsCount: 0,
      supportRequestsCount: 0,
      partnershipsCount: 0,
    };

    if (!targetUser) return stats;

    const emailKey = targetUser.email.toLowerCase();
    const idKey = targetUser.id;
    const nameKey = (targetUser.orgName || targetUser.name || "").toLowerCase();

    if (targetUser.role === "CITIZEN") {
      // Problems count matches from database counts or mock problems by email/name
      stats.problemsCount = targetUser.reportedProblemsCount || mockProblems.filter(p => 
        p.submittedByEmail?.toLowerCase() === emailKey || p.submittedBy?.toLowerCase() === emailKey
      ).length;
    } else if (targetUser.role === "UNIVERSITY") {
      // Registered problems / interests count
      stats.interestsCount = mockInterests.filter(i => 
        i.universityId === idKey || i.universityName?.toLowerCase() === nameKey
      ).length;

      // Active projects count
      stats.activeProjectsCount = mockProjects.filter(p => 
        (p.universityId === idKey || p.collaboration?.university?.toLowerCase() === nameKey) && 
        p.stage !== "COMPLETED"
      ).length;
    } else if (targetUser.role === "INDUSTRY") {
      // CSR support requests count
      stats.supportRequestsCount = mockSupportRequests.filter(r => 
        r.industryId === idKey || r.industryName?.toLowerCase() === nameKey
      ).length;

      // Active partnerships count
      stats.partnershipsCount = mockPartnerships.filter(p => 
        (p.industryId === idKey || p.organizationName?.toLowerCase() === nameKey) && 
        p.status === "ACTIVE"
      ).length;
    }

    return stats;
  };

  const selectedUserStats = selectedUser ? getDynamicUserStats(selectedUser) : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brandgray-border/60 pb-5 gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary uppercase tracking-wide flex items-center gap-2">
            <Users className="h-5 w-5 text-primary shrink-0" /> Registered Users & Organizations Registry
          </h1>
          <p className="text-xs text-brandgray-muted mt-1 font-medium">
            Comprehensive repository of all registered citizens, university representatives, corporate CSR partners, and administrators.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded">
          {errorMsg}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Users", value: totalCount, icon: Users, color: "text-primary bg-primary/5 border-primary/10" },
          { label: "Citizens", value: citizenCount, icon: UserCheck, color: "text-blue-700 bg-blue-50 border-blue-150" },
          { label: "Universities", value: universityCount, icon: GraduationCap, color: "text-purple-700 bg-purple-50 border-purple-150" },
          { label: "Industry / CSR", value: industryCount, icon: Building2, color: "text-indigo-700 bg-indigo-50 border-indigo-150" },
          { label: "Admins", value: adminCount, icon: ShieldCheck, color: "text-amber-700 bg-amber-50 border-amber-150" }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="border border-brandgray-border bg-white shadow-subtle flex flex-col justify-between">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold text-brandgray-muted uppercase tracking-wider block truncate">{card.label}</span>
                  <div className={`p-1.5 rounded shrink-0 border ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-primary block leading-none">{card.value}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-brandgray-border bg-white shadow-subtle">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80 h-9">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, organization, state, email..."
              className="text-xs bg-slate-50 border border-brandgray-border pl-9 pr-8 rounded-lg w-full h-9 focus:outline-none focus:ring-1 focus:ring-primary font-medium placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 border border-brandgray-border rounded-lg text-xs w-full md:w-auto h-9 items-center">
            {["All", "Citizens", "Universities", "Industry / CSR", "Admins"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`py-1 px-3 font-bold rounded-md transition-all text-xs h-7 flex items-center ${
                  selectedRoleFilter === role
                    ? "bg-white text-primary shadow-sm border border-brandgray-border/50"
                    : "text-brandgray-muted hover:text-brandgray-text"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Searchable Table */}
      <Card className="border border-brandgray-border bg-white shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          {loadingUsers ? (
            <div className="text-center py-12 text-xs font-semibold text-brandgray-muted">
              Loading users registry...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-xs font-bold text-brandgray-muted space-y-2">
              <Users className="h-8 w-8 mx-auto text-slate-300" />
              <p>No platform participants found matching selection.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-brandgray-border text-[10px] font-bold text-brandgray-muted uppercase tracking-wider">
                  <th className="py-3 px-4 align-middle font-bold">Name / Organization</th>
                  <th className="py-3 px-4 align-middle font-bold">Role</th>
                  <th className="py-3 px-4 align-middle font-bold">Email</th>
                  <th className="py-3 px-4 align-middle font-bold">Location</th>
                  <th className="py-3 px-4 align-middle font-bold">Registration Date</th>
                  <th className="py-3 px-4 align-middle font-bold">Status</th>
                  <th className="py-3 px-4 align-middle text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  const isCitizen = u.role === "CITIZEN";
                  const displayOrg = isCitizen ? "Individual Citizen" : (u.orgName || "Not specified");
                  const displayName = isCitizen ? u.name : `${u.name} (${u.orgDetails?.split(",")[0] || "Representative"})`;
                  
                  // Badges configurations
                  const roleColors: Record<string, string> = {
                    CITIZEN: "bg-blue-50 text-blue-700 border-blue-150",
                    UNIVERSITY: "bg-purple-50 text-purple-700 border-purple-150",
                    INDUSTRY: "bg-indigo-50 text-indigo-700 border-indigo-150",
                    ADMIN: "bg-amber-50 text-amber-800 border-amber-150"
                  };

                  const statusColors: Record<string, string> = {
                    ACTIVE: "bg-emerald-55 text-emerald-800 border-emerald-200",
                    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                    SUSPENDED: "bg-red-50 text-red-700 border-red-200",
                  };

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 align-middle">
                        <span className="font-bold text-primary block leading-snug truncate max-w-[200px]" title={displayOrg}>{displayOrg}</span>
                        <span className="text-[10px] text-brandgray-muted font-semibold block mt-0.5 truncate max-w-[200px]" title={displayName}>{displayName}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold border ${roleColors[u.role] || "bg-slate-50 border-slate-200"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="text-brandgray-text font-semibold select-all truncate max-w-[180px] block" title={u.email}>{u.email}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px] text-brandgray-text block" title={u.location || "Not reported"}>{u.location || "Not reported"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-brandgray-muted font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${statusColors[u.status] || "bg-slate-50 border-slate-200"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10.5px] font-bold inline-flex items-center justify-center"
                          onClick={() => setSelectedUser(u)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* DETAIL MODAL PANEL */}
      {selectedUser && selectedUserStats && (
        <div className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-brandgray-border max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-brandgray-border bg-slate-50 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Participant Identity Sheet</span>
                <h3 className="text-sm font-extrabold text-primary mt-0.5">{selectedUser.orgName || selectedUser.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-slate-450 hover:text-slate-700 bg-white p-1 rounded-full border border-slate-200 transition-colors shadow-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5 text-xs text-brandgray-text overflow-y-auto flex-1">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3.5 bg-slate-50/50 p-4 border border-brandgray-border/60 rounded-lg">
                <div className="bg-primary/5 p-3 rounded-lg text-primary shrink-0">
                  {selectedUser.role === "CITIZEN" && <Users className="h-6 w-6" />}
                  {selectedUser.role === "UNIVERSITY" && <GraduationCap className="h-6 w-6" />}
                  {selectedUser.role === "INDUSTRY" && <Building2 className="h-6 w-6" />}
                  {selectedUser.role === "ADMIN" && <ShieldCheck className="h-6 w-6" />}
                </div>
                <div>
                  <span className="text-[9.5px] font-bold bg-primary text-white px-2 py-0.5 rounded uppercase tracking-wider">
                    {selectedUser.role}
                  </span>
                  <div className="text-[10px] text-brandgray-muted font-bold mt-1.5 uppercase">Representative:</div>
                  <div className="text-xs font-bold text-primary">{selectedUser.name}</div>
                </div>
              </div>

              {/* Specific Field Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-brandgray-muted flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </span>
                  <span className="text-xs font-bold text-primary select-all">{selectedUser.email}</span>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-brandgray-muted flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Contact Phone
                  </span>
                  <span className="text-xs font-bold text-primary select-all">{selectedUser.phone || "Not available"}</span>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-brandgray-muted flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </span>
                  <span className="text-xs font-bold text-primary">{selectedUser.location || "Not reported"}</span>
                </div>

                {/* Registration Date */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-brandgray-muted flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date Registered
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}
                  </span>
                </div>

                {/* Role Specific Additional Fields */}
                {selectedUser.role === "UNIVERSITY" && (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-brandgray-muted">Department</span>
                      <span className="text-xs font-bold text-primary block">{selectedUser.department || "Not reported"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-brandgray-muted">Designation</span>
                      <span className="text-xs font-bold text-primary block">{selectedUser.designation || "Not reported"}</span>
                    </div>
                  </>
                )}

                {selectedUser.role === "INDUSTRY" && (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-brandgray-muted">Corporate Type</span>
                      <span className="text-xs font-bold text-primary block">{selectedUser.organizationType || "Not reported"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-brandgray-muted">Designation</span>
                      <span className="text-xs font-bold text-primary block">{selectedUser.designation || "Not reported"}</span>
                    </div>
                  </>
                )}

                {selectedUser.role === "ADMIN" && (
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10.5px] font-bold text-brandgray-muted">Administrative Designation</span>
                    <span className="text-xs font-bold text-primary block">{selectedUser.designation || "Platform Administrator"}</span>
                  </div>
                )}
              </div>

              {/* Extra Industry Details */}
              {selectedUser.role === "INDUSTRY" && (selectedUser.companyCin || selectedUser.csrId) && (
                <div className="p-4 bg-slate-50 border border-brandgray-border/60 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold text-primary uppercase block">CSR Compliance Credentials</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-brandgray-muted font-semibold block">Company CIN:</span>
                      <span className="font-bold text-primary select-all">{selectedUser.companyCin || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-brandgray-muted font-semibold block">CSR ID:</span>
                      <span className="font-bold text-primary select-all">{selectedUser.csrId || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Location and Tech details for CSR */}
              {selectedUser.role === "INDUSTRY" && (selectedUser.csrFocusAreas || selectedUser.geographicFocus) && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-primary uppercase block">Strategic CSR Focus</span>
                  <div className="space-y-1.5 text-[11.5px]">
                    {selectedUser.csrFocusAreas && (
                      <div>
                        <span className="text-brandgray-muted font-semibold">Focus Areas: </span>
                        <span className="font-bold text-primary">{selectedUser.csrFocusAreas}</span>
                      </div>
                    )}
                    {selectedUser.geographicFocus && (
                      <div>
                        <span className="text-brandgray-muted font-semibold">Geographic Targets: </span>
                        <span className="font-bold text-primary">{selectedUser.geographicFocus}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Dynamic Engagement Metrics */}
              <div className="border-t border-brandgray-border/70 pt-4 space-y-2.5">
                <span className="text-[10.5px] font-bold text-primary uppercase block tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" /> Active Platform Engagement
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  {selectedUser.role === "CITIZEN" && (
                    <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10.5px] font-semibold text-brandgray-muted block">Grievances Reported</span>
                      <span className="text-lg font-extrabold text-primary block mt-1">{selectedUserStats.problemsCount} Problems</span>
                    </div>
                  )}

                  {selectedUser.role === "UNIVERSITY" && (
                    <>
                      <div className="bg-purple-50/20 p-3 rounded-lg border border-purple-100">
                        <span className="text-[10.5px] font-semibold text-purple-950 block">Interested Problems</span>
                        <span className="text-lg font-extrabold text-purple-900 block mt-1">{selectedUserStats.interestsCount} Challenges</span>
                      </div>
                      <div className="bg-emerald-50/20 p-3 rounded-lg border border-emerald-100">
                        <span className="text-[10.5px] font-semibold text-emerald-950 block">Active Research Projects</span>
                        <span className="text-lg font-extrabold text-emerald-900 block mt-1">{selectedUserStats.activeProjectsCount} Projects</span>
                      </div>
                    </>
                  )}

                  {selectedUser.role === "INDUSTRY" && (
                    <>
                      <div className="bg-indigo-50/20 p-3 rounded-lg border border-indigo-100">
                        <span className="text-[10.5px] font-semibold text-indigo-950 block">CSR Funding Requests</span>
                        <span className="text-lg font-extrabold text-indigo-900 block mt-1">{selectedUserStats.supportRequestsCount} Offers</span>
                      </div>
                      <div className="bg-emerald-50/20 p-3 rounded-lg border border-emerald-100">
                        <span className="text-[10.5px] font-semibold text-emerald-950 block">Active CSR Partnerships</span>
                        <span className="text-lg font-extrabold text-emerald-900 block mt-1">{selectedUserStats.partnershipsCount} Workspace</span>
                      </div>
                    </>
                  )}

                  {selectedUser.role === "ADMIN" && (
                    <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100 col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10.5px] font-semibold text-brandgray-muted block">Administrative Actions</span>
                        <span className="text-xs text-brandgray-text font-bold block mt-1">Full System Authority</span>
                      </div>
                      <ShieldCheck className="h-7 w-7 text-amber-500 shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-brandgray-border bg-slate-50 text-right shrink-0">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)} className="font-bold text-xs">
                Dismiss Sheet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
