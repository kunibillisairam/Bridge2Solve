"use client";

import React from "react";
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

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/industry/dashboard", icon: LayoutDashboard },
    { label: "Project Discovery", href: "/industry/projects", icon: Layers },
    { label: "My Interests", href: "/industry/interests", icon: Handshake },
    { label: "My Partnerships", href: "/industry/partnerships", icon: Briefcase },
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
