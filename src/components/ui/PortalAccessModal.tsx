"use client";

import React, { useState } from "react";
import { X, Users, GraduationCap, Building2, ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";

interface PortalAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PortalAccessModal({ isOpen, onClose }: PortalAccessModalProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const roles = [
    {
      name: "Citizen",
      description: "Report local community issues and track progress.",
      icon: Users,
    },
    {
      name: "University",
      description: "Apply academic research and coordinate student project teams.",
      icon: GraduationCap,
    },
    {
      name: "Industry / CSR Partner",
      description: "Review matching proposals and sponsor social impact initiatives.",
      icon: Building2,
    },
    {
      name: "Administrator",
      description: "Govern problem verification, system settings, and matches.",
      icon: ShieldCheck,
    },
  ];

  const handleRoleSelect = (roleName: string) => {
    setSelectedRole(roleName);
  };

  const handleReset = () => {
    setSelectedRole(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div className="bg-white rounded-md border border-brandgray-border shadow-standard w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brandgray-border/60">
          <h3 className="text-lg font-bold text-primary">Access ProblemBridge Portal</h3>
          <button
            onClick={() => {
              onClose();
              handleReset();
            }}
            className="text-brandgray-muted hover:text-brandgray-text transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!selectedRole ? (
            <>
              <p className="text-sm text-brandgray-muted mb-6 leading-relaxed">
                Please select your workspace role below to access the ProblemBridge portal environment.
              </p>
              
              <div className="space-y-3.5">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Card
                      key={role.name}
                      onClick={() => handleRoleSelect(role.name)}
                      className="cursor-pointer hover:border-primary/55 hover:bg-brandgray-light/20 transition-all duration-150 border border-brandgray-border"
                    >
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded bg-primary-light text-primary border border-primary/10">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-primary">{role.name}</h4>
                          <p className="text-xs text-brandgray-muted leading-relaxed">
                            {role.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-6 px-4 space-y-6">
              <div className="h-12 w-12 bg-success-light text-success border border-success/15 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-base font-bold text-primary">
                  {selectedRole} Portal Initialized
                </h4>
                <p className="text-sm text-brandgray-text/90 max-w-sm mx-auto leading-relaxed">
                  The routing configuration and session structures for the <span className="font-semibold">{selectedRole}</span> dashboard are ready.
                </p>
              </div>

              <div className="p-4 border border-brandgray-border rounded bg-brandgray-light/40 text-xs text-brandgray-muted text-left leading-relaxed">
                <strong className="text-brandgray-text block mb-1">Interactivity Notice:</strong>
                Authentication, secure login, and database dashboards will be connected in the subsequent execution phase.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-brandgray-border/60 bg-brandgray-light/30 flex justify-end gap-3">
          {selectedRole && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              Back to Roles
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              handleReset();
            }}
          >
            {selectedRole ? "Done" : "Cancel"}
          </Button>
        </div>

      </div>
    </div>
  );
}
