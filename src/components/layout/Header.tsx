"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <div className="hidden md:flex items-center">
            <Button variant="outline" size="sm">
              Access Portal
            </Button>
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
          <div className="pt-4 border-t border-brandgray-border mt-3 px-3">
            <Button variant="outline" size="md" className="w-full">
              Access Portal
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
