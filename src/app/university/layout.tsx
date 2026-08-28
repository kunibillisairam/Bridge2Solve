"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Search, 
  Briefcase,
  Users, 
  FileSpreadsheet, 
  UserCircle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { universityMockService } from "@/services/universityMockService";

export default function UniversityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== "UNIVERSITY")) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

  if (!user || user.role !== "UNIVERSITY") {
    return null; // Will redirect in useEffect
  }

  const universityId = user?.profile?.universityDetails?.id || "univ-1";

  const teamFormationPendingCount = mounted
    ? universityMockService.getRegisteredProblemsForUniversity(universityId).filter(
        (r) => !r.team
      ).length
    : 0;

  const draftProposalsCount = mounted
    ? universityMockService.getProposals(universityId).filter((p) => p.status === "DRAFT").length
    : 0;

  const navItems = [
    {
      label: "Dashboard",
      href: "/university/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Problems",
      href: "/university/problems",
      icon: Search,
    },
    {
      label: "Projects",
      href: "/university/projects",
      icon: Briefcase,
    },
    {
      label: "Teams",
      href: "/university/teams",
      icon: Users,
      badge: teamFormationPendingCount,
    },
    {
      label: "Proposals",
      href: "/university/proposals",
      icon: FileSpreadsheet,
      badge: draftProposalsCount,
    },
    {
      label: "Profile",
      href: "/university/profile",
      icon: UserCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-brandgray-light flex flex-col">
      {/* Portal Secondary Sub-Header / Org Display */}
      <div className="bg-primary text-white border-b border-primary/20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white/10 rounded flex items-center justify-center border border-white/10">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold block leading-none">
                  University Workspace
                </span>
                <span className="text-sm font-bold block mt-0.5">
                  {user.orgName || "Institutional Partner"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="hidden sm:inline-block text-slate-300 bg-white/5 px-2.5 py-1 rounded border border-white/5 font-medium">
                Role: {user.name} ({user.role})
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors bg-transparent border-0 font-medium py-1 px-2 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="bg-white border-b border-brandgray-border sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary-light text-primary"
                      : "border-transparent text-brandgray-muted hover:text-brandgray-text hover:bg-brandgray-light/60"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 text-[9.5px] font-extrabold rounded-full ${
                      isActive ? "bg-white text-primary" : "bg-primary text-white"
                    } leading-none`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Portal Page Body Content */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
