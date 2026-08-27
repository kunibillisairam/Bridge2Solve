"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Layers, 
  Handshake, 
  User, 
  LayoutDashboard,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { industryService } from "@/services/industryService";

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const industryId = user?.profile?.industryDetails?.id || "ind-1";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingInterestsCount = mounted ? industryService.getSupportRequestsForIndustry(industryId).filter(
    r => ["PENDING", "CLARIFICATION_REQUESTED"].includes(r.status)
  ).length : 0;
  
  const activePartnershipsCount = mounted ? industryService.getPartnershipsForIndustry(industryId).filter(
    p => p.status === "ACTIVE"
  ).length : 0;

  const navItems = [
    { label: "Dashboard", href: "/industry/dashboard", icon: LayoutDashboard },
    { label: "Project Discovery", href: "/industry/projects", icon: Layers },
    { label: "My Interests", href: "/industry/interests", icon: Handshake, badge: pendingInterestsCount },
    { label: "My Partnerships", href: "/industry/partnerships", icon: Briefcase, badge: activePartnershipsCount },
    { label: "Organization Profile", href: "/industry/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sub-navigation bar for Industry portal */}
      <div className="bg-white border-b border-brandgray-border sticky top-16 z-40 shadow-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-primary shrink-0 mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary mr-4 hidden sm:inline">
                Industry Portal
              </span>
              <nav className="flex items-center gap-1 sm:gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href === "/industry/dashboard" && pathname === "/industry");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`py-1.5 px-3 rounded text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-brandgray-muted hover:text-primary hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
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
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
