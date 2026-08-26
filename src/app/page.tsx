"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldCheck, GraduationCap, Building2, Users } from "lucide-react";
import { PortalAccessModal } from "@/components/ui/PortalAccessModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roles = [
    {
      title: "Citizens",
      description: "Identify and report localized community challenges directly to administrators.",
      icon: Users,
    },
    {
      title: "Universities",
      description: "Analyze community needs and develop practical academic solutions.",
      icon: GraduationCap,
    },
    {
      title: "Industry",
      description: "Fund, develop, and scale viable solutions into operational prototypes.",
      icon: Building2,
    },
    {
      title: "Administrators",
      description: "Manage problems, track resolution stages, and allocate key resources.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-white border-b border-brandgray-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-light text-primary border border-primary/10 mb-6">
            Collaboration Portal
          </div>

          {/* Primary Header */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-6">
            ProblemBridge
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-brandgray-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Connecting Community Problems with the Right People and Resources.
          </p>

          {/* Call-to-action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
              Explore Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 md:py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
            A Multi-Role Ecosystem
          </h2>
          <p className="text-sm md:text-base text-brandgray-muted">
            ProblemBridge acts as a collaborative bridge connecting four essential stakeholder segments to address civic and societal challenges.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.title} className="flex flex-col justify-between">
                <CardHeader className="pb-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary-light text-primary border border-primary/10 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed text-brandgray-text/80">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Info Notice Banner */}
      <section className="bg-white border-t border-brandgray-border py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 border border-brandgray-border rounded-md bg-brandgray-light/35 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-success">
                Technical Foundation Active
              </span>
              <p className="text-sm text-brandgray-text font-medium">
                The core modules, routing structure, database configurations, and UI design systems are fully provisioned.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-success-light border border-success/15 text-success font-medium text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Environment Ready
            </div>
          </div>
        </div>
      </section>

      {/* Portal Access Modal */}
      <PortalAccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
