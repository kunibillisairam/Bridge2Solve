'use client';

import React from 'react';
import Link from 'next/link';
import { User, Landmark, Building2, ArrowRight } from 'lucide-react';

export default function SignupHubPage() {
  const roles = [
    {
      id: 'citizen',
      title: 'Citizen / Resident',
      desc: 'Report community problems, track resolution milestones, and collaborate on local civic solutions.',
      href: '/signup/citizen',
      icon: User,
      color: 'border-blue-200 bg-blue-50 text-blue-800 hover:border-primary',
      badge: 'Civic Grievance Reporter',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'university',
      title: 'University / Institute',
      desc: 'Form student & faculty research taskforces to formulate blueprints and prototype solutions.',
      href: '/signup/university',
      icon: Landmark,
      color: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-600',
      badge: 'Academic Research Hub',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'industry',
      title: 'Industry / CSR',
      desc: 'Discover validated community projects to pledge CSR funding, provide materials, and offer mentorship.',
      href: '/signup/industry',
      icon: Building2,
      color: 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-600',
      badge: 'Funding & CSR Partner',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-brandgray-light">
      <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-lg border border-brandgray-border shadow-standard">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-light text-primary border border-primary/10 mb-3">
            Role-Based Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Create Your ProblemBridge Account
          </h1>
          <p className="text-xs sm:text-sm text-brandgray-muted mt-2 max-w-lg mx-auto leading-relaxed">
            Please select your organization or stakeholder category. Each account is assigned an authoritative role with strict data isolation.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.id}
                href={r.href}
                className={`group p-6 rounded-lg border transition-all flex flex-col justify-between bg-white hover:shadow-standard ${r.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg border bg-white shadow-subtle group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-primary group-hover:text-primary-hover">
                    {r.title}
                  </h2>
                  <p className="text-xs text-brandgray-muted mt-2 leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brandgray-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
                  <span>Register as {r.title.split(' ')[0]}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-brandgray-border text-center text-xs text-brandgray-muted">
          Already registered on ProblemBridge?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign in to your Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
