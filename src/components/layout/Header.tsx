"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth, ROLE_REDIRECT } from "@/context/AuthContext";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const navigationLinks = [
    { label: "Explore Problems", href: "#" },
    { label: "Universities", href: "#" },
    { label: "Industry", href: "#" },
    { label: "Government", href: "#" },
  ];

  const dashboardUrl = user?.role && ROLE_REDIRECT[user.role] ? ROLE_REDIRECT[user.role] : "/login";

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-brandgray-border shadow-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
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

          {/* Header Action / User Auth State */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardUrl}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-primary/30">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-brandgray-border">
                  <div className="text-right">
                    <span className="text-xs font-bold text-brandgray-text block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-primary bg-primary-light px-1.5 py-0.5 rounded border border-primary/10">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-1.5 text-brandgray-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
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
            {!loading && user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-xs font-bold text-brandgray-text block">{user.name}</span>
                      <span className="text-[10px] uppercase font-bold text-primary">{user.role}</span>
                    </div>
                  </div>
                </div>
                <Link href={dashboardUrl} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full justify-center mb-2">
                    Go to Dashboard
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
