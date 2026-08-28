"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Layers, 
  FileText, 
  FolderKanban, 
  Building2, 
  Search, 
  LayoutDashboard,
  X,
  ChevronRight,
  Sparkles,
  Activity,
  BarChart3,
  Users
} from "lucide-react";
import { universityMockService } from "@/services/universityMockService";
import { industryService } from "@/services/industryService";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-brandgray-muted">Verifying portal access...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const pendingProblemsCount = mounted ? universityMockService.getProblems().filter((p) => p.status === "Unassigned").length : 0;
  const pendingProposalsCount = mounted ? universityMockService.getAllProposalsForAdmin().filter((pr) => pr.status === "SUBMITTED").length : 0;
  const awaitingVerificationProjectsCount = mounted ? universityMockService.getProjects().filter((pj) => pj.stage === "AWAITING_ADMIN_VERIFICATION").length : 0;
  const pendingCSRCount = mounted ? industryService.getAllSupportRequests().filter((r) => r.status === "PENDING").length : 0;

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Impact & Transparency", href: "/admin/impact", icon: BarChart3 },
    { label: "Problems Queue", href: "/admin/problems", icon: Layers, badge: pendingProblemsCount },
    { label: "Proposals Review", href: "/admin/proposals", icon: FileText, badge: pendingProposalsCount },
    { label: "Projects Control", href: "/admin/projects", icon: FolderKanban, badge: awaitingVerificationProjectsCount },
    { label: "Industry / CSR Support", href: "/admin/industry-support", icon: Building2, badge: pendingCSRCount },
    { label: "Users Registry", href: "/admin/users", icon: Users },
    { label: "Audit Trail", href: "/admin/activity", icon: Activity },
  ];

  // Global Admin Search Results
  const q = searchQuery.toLowerCase().trim();
  const searchResults = q ? {
    problems: universityMockService.getProblems().filter(
      (p) => p.id.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    ).slice(0, 3),
    proposals: universityMockService.getAllProposalsForAdmin().filter(
      (pr) => pr.id.toLowerCase().includes(q) || pr.title.toLowerCase().includes(q) || pr.universityId.toLowerCase().includes(q)
    ).slice(0, 3),
    projects: universityMockService.getProjects().filter(
      (pj) => pj.id.toLowerCase().includes(q) || pj.title.toLowerCase().includes(q) || pj.collaboration.university.toLowerCase().includes(q)
    ).slice(0, 3),
    industryRequests: industryService.getAllSupportRequests().filter(
      (r) => r.id.toLowerCase().includes(q) || r.industryName.toLowerCase().includes(q) || r.projectId.toLowerCase().includes(q)
    ).slice(0, 3),
  } : null;

  const totalResults = searchResults 
    ? searchResults.problems.length + searchResults.proposals.length + searchResults.projects.length + searchResults.industryRequests.length 
    : 0;

  return (
    <div className="min-h-screen bg-brandgray-light">
      {/* Sticky Admin Header */}
      <div className="bg-primary text-white sticky top-16 z-40 shadow-subtle border-b border-primary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 py-2 gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-white hidden sm:inline border-r border-white/20 pr-3 shrink-0">
                Admin Control Center
              </span>
              <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1 min-w-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`py-1.5 px-3 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? "bg-white text-primary font-bold shadow-subtle"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 text-[9.5px] font-extrabold rounded-full ${
                          isActive ? "bg-primary text-white border border-primary-light" : "bg-amber-400 text-primary"
                        } leading-none`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Global Search Input Trigger */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Global search ID, Title, Univ..."
                  className="text-xs bg-white text-primary pl-8 pr-3 py-1.5 rounded w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(""); setIsSearchOpen(false); }}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Live Search Results Modal Dropdown */}
              {isSearchOpen && searchQuery.trim() !== "" && searchResults && (
                <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-brandgray-border z-50 p-4 text-xs text-brandgray-text space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-brandgray-border pb-2">
                    <span className="font-bold text-primary text-xs uppercase tracking-wider">
                      Search Results ({totalResults})
                    </span>
                    <button onClick={() => setIsSearchOpen(false)} className="text-brandgray-muted hover:text-primary">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {totalResults === 0 ? (
                    <p className="text-brandgray-muted text-center py-4">No matching entities found.</p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.problems.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Problems</span>
                          {searchResults.problems.map((p) => (
                            <Link key={p.id} href={`/admin/problems/${p.id}`} onClick={() => setIsSearchOpen(false)} className="block p-2 hover:bg-slate-50 rounded border border-slate-100 space-y-0.5">
                              <p className="font-bold text-primary truncate">{p.title}</p>
                              <p className="text-[10px] text-brandgray-muted">ID: {p.id} · {p.location}</p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.proposals.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Proposals</span>
                          {searchResults.proposals.map((pr) => (
                            <Link key={pr.id} href={`/admin/proposals/${pr.id}`} onClick={() => setIsSearchOpen(false)} className="block p-2 hover:bg-purple-50/50 rounded border border-purple-100 space-y-0.5">
                              <p className="font-bold text-purple-900 truncate">{pr.title}</p>
                              <p className="text-[10px] text-brandgray-muted">ID: {pr.id} · Status: {pr.status}</p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.projects.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Projects</span>
                          {searchResults.projects.map((pj) => (
                            <Link key={pj.id} href={`/admin/projects/${pj.id}`} onClick={() => setIsSearchOpen(false)} className="block p-2 hover:bg-emerald-50/50 rounded border border-emerald-100 space-y-0.5">
                              <p className="font-bold text-emerald-900 truncate">{pj.title}</p>
                              <p className="text-[10px] text-brandgray-muted">ID: {pj.id} · Univ: {pj.collaboration.university}</p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.industryRequests.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Industry Requests</span>
                          {searchResults.industryRequests.map((r) => (
                            <Link key={r.id} href={`/admin/industry-support/${r.id}`} onClick={() => setIsSearchOpen(false)} className="block p-2 hover:bg-indigo-50/50 rounded border border-indigo-100 space-y-0.5">
                              <p className="font-bold text-indigo-900 truncate">{r.industryName}</p>
                              <p className="text-[10px] text-brandgray-muted">ID: {r.id} · Status: {r.status}</p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
