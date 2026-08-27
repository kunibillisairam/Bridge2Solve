"use client";

import React, { useState } from "react";
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
  Activity
} from "lucide-react";
import { universityMockService } from "@/services/universityMockService";
import { industryService } from "@/services/industryService";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Problems Queue", href: "/admin/problems", icon: Layers },
    { label: "Proposals Review", href: "/admin/proposals", icon: FileText },
    { label: "Projects Control", href: "/admin/projects", icon: FolderKanban },
    { label: "Industry / CSR Support", href: "/admin/industry-support", icon: Building2 },
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
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Admin Header */}
      <div className="bg-primary text-white sticky top-16 z-40 shadow-subtle border-b border-primary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 py-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-white hidden sm:inline border-r border-white/20 pr-3">
                Admin Control Center
              </span>
              <nav className="flex items-center gap-1 sm:gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`py-1.5 px-3 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-primary font-bold shadow-subtle"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
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
