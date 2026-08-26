import React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerGroups = [
    {
      title: "Solutions",
      links: [
        { label: "For Citizens", href: "#" },
        { label: "For Universities", href: "#" },
        { label: "For Industry Partners", href: "#" },
        { label: "For Administrators", href: "#" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Explore Problems", href: "#" },
        { label: "How it Works", href: "#" },
        { label: "Success Stories", href: "#" },
      ],
    },
    {
      title: "Organization",
      links: [
        { label: "About Us", href: "#" },
        { label: "Contact Support", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-brandgray-light border-t border-brandgray-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Brief Description */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
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
              </svg>
              <span className="text-lg font-bold text-primary">
                Problem<span className="text-brandgray-text font-semibold">Bridge</span>
              </span>
            </div>
            <p className="text-sm text-brandgray-muted max-w-xs leading-relaxed">
              Connecting community and civic challenges with universities, industry partners, and policy administrators to develop practical solutions.
            </p>
          </div>

          {/* Links Columns */}
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wider text-primary uppercase">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-brandgray-muted hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-brandgray-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brandgray-muted">
            &copy; {currentYear} ProblemBridge. All rights reserved.
          </p>
          <p className="text-xs text-brandgray-muted">
            Designed for trustworthiness, accessibility, and public utility.
          </p>
        </div>
      </div>
    </footer>
  );
}
