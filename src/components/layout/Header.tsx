"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth, ROLE_REDIRECT } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const roleUserId = user.role === "ADMIN" ? "admin-1" : user.role === "UNIVERSITY" ? "univ-1" : user.role === "INDUSTRY" ? "ind-1" : "citizen-1";
      setUnreadCount(notificationService.getUnreadCount(roleUserId, user.role as any));
      
      const interval = setInterval(() => {
        setUnreadCount(notificationService.getUnreadCount(roleUserId, user.role as any));
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  const navigationLinks = [
    { label: "Explore Problems", href: "#" },
    { label: "Universities", href: "#" },
    { label: "Industry", href: "#" },
    { label: "Government", href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-brandgray-border shadow-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Professional SVG Logo (Structured Blue Bridge Icon) */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary transition-transform group-hover:scale-105"
              >
                <path
                  d="M4 18V9C4 6.79086 5.79086 5 8 5H16C18.2091 5 20 6.79086 20 9V18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M4 14H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 14V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 14V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xl font-bold tracking-tight text-primary">
                Problem<span className="text-brandgray-text font-semibold">Bridge</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-brandgray-text/90 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Header Action Button */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/notifications" className="relative p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-50 transition-all mr-1 flex items-center justify-center" title="Notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link href={ROLE_REDIRECT[user.role] || "/"}>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Log Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Access Portal
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-brandgray-muted hover:text-brandgray-text hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-brandgray-border px-4 pt-2 pb-4 space-y-1">
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-brandgray-text hover:text-primary hover:bg-gray-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-brandgray-border mt-3 px-3 space-y-2">
            {user ? (
              <>
                <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="relative py-2 px-3 rounded-md text-base font-semibold text-brandgray-text hover:text-primary hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bell className="h-4.5 w-4.5 text-slate-500" /> Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-extrabold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </Link>
                <Link href={ROLE_REDIRECT[user.role] || "/"} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="md" className="w-full" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                  Log Out
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full">
                  Access Portal
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
