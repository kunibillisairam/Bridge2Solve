"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  GraduationCap, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Award, 
  ShieldCheck,
  Building2,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Profile Info Banner */}
      <Card className="border-brandgray-border shadow-subtle bg-white overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="h-16 w-16 bg-primary-light text-primary border border-primary/10 rounded-full flex items-center justify-center shrink-0">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-primary">
                {user.orgName || "Institutional Partner"}
              </h2>
              <span className="inline-flex items-center gap-1 bg-success-light text-success border border-success/15 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Partner
              </span>
            </div>
            <p className="text-xs text-brandgray-muted leading-relaxed">
              Partner Node ID: <span className="font-semibold text-brandgray-text">{user.id}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-brandgray-muted pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Ranchi District, Jharkhand
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> www.university-portal.edu.in
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Details & Departments */}
        <div className="md:col-span-2 space-y-6">
          {/* Institutional Contact Details */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Primary Portal Representative
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <span className="text-brandgray-muted block uppercase tracking-wider">Representative Name</span>
                  <span className="font-bold text-brandgray-text block mt-1">{user.name}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-brandgray-muted block uppercase tracking-wider">Assigned Role</span>
                  <span className="font-bold text-brandgray-text block mt-1">{user.role} Coordinator</span>
                </div>
                <div className="space-y-1 text-xs pt-2 sm:pt-0">
                  <span className="text-brandgray-muted block uppercase tracking-wider">Official Email Address</span>
                  <span className="font-medium text-brandgray-text block mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-brandgray-muted" /> {user.email}
                  </span>
                </div>
                <div className="space-y-1 text-xs pt-2 sm:pt-0">
                  <span className="text-brandgray-muted block uppercase tracking-wider">Contact Number</span>
                  <span className="font-medium text-brandgray-text block mt-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-brandgray-muted" /> {user.phone || "+91 94311 08260"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Core Focus Fields */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Departmental Research Hubs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-brandgray-text leading-relaxed">
                The institution coordinates academic project groups and faculty mentors across the following accredited departments. These sectors direct relevance match calculations:
              </p>

              <div className="space-y-3.5">
                {[
                  { name: "Environmental Sciences & Hydrology", lab: "Water Quality & Filtration Lab" },
                  { name: "Civil & Infrastructure Engineering", lab: "Sustainable Construction materials Center" },
                  { name: "Biotechnology & Applied Microbiology", lab: "Bio-Fertilizer Remediation Lab" },
                  { name: "Renewable Energy & Power Systems", lab: "Solar Microgrid Research Hub" },
                ].map((dept, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-brandgray-border/50 rounded bg-brandgray-light/20">
                    <Building2 className="h-4.5 w-4.5 text-primary mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-primary block">{dept.name}</span>
                      <span className="text-[10px] text-brandgray-muted mt-0.5 block">Facility: {dept.lab}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Badges & Info */}
        <div className="space-y-6">
          {/* Institutional Credentials */}
          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                Accreditation & Approvals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <Award className="h-4.5 w-4.5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-brandgray-text">UGC Approved Institute</span>
                    <span className="text-[10px] text-brandgray-muted block">Status active since 2012</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs pt-1">
                  <Award className="h-4.5 w-4.5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-brandgray-text">NAAC A+ Grade</span>
                    <span className="text-[10px] text-brandgray-muted block">Score of 3.65 CGPA</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs pt-1">
                  <Users className="h-4.5 w-4.5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-brandgray-text">Cooperation Node</span>
                    <span className="text-[10px] text-brandgray-muted block">Part of National Synergy Program</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 border border-brandgray-border rounded bg-brandgray-light/35 text-[10px] text-brandgray-muted leading-relaxed">
                <strong className="text-brandgray-text block mb-1">Administrative Notice:</strong>
                Profile details are synchronized with the central academic registration system. Contact the portal administrator to modify institutional affiliation.
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
