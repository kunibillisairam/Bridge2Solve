'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, ChevronUp, ChevronDown } from 'lucide-react';

export default function DevRoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { label: 'Citizen', value: 'CITIZEN' as const, bg: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
    { label: 'University', value: 'UNIVERSITY' as const, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
    { label: 'Industry / CSR', value: 'INDUSTRY' as const, bg: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
    { label: 'Platform Admin', value: 'ADMIN' as const, bg: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 shadow-standard rounded-lg border border-primary/20 bg-white overflow-hidden max-w-xs transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider"
      >
        <span className="flex items-center space-x-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>Role Switcher (Eval)</span>
        </span>
        {isOpen ? <ChevronDown className="h-4.5 w-4.5" /> : <ChevronUp className="h-4.5 w-4.5" />}
      </button>

      {isOpen && (
        <div className="p-3 space-y-2 border-t border-brandgray-border bg-gray-50">
          <p className="text-[10px] text-brandgray-muted leading-tight mb-2">
            Click to instantly switch user sessions and test role-specific dashboards.
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={async () => {
                  await switchRole(r.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 border text-xs font-semibold rounded transition-colors ${r.bg} ${
                  user?.role === r.value ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
              >
                <span>{r.label}</span>
                {user?.role === r.value && (
                  <span className="text-[9px] uppercase font-extrabold bg-primary text-white px-1 rounded">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
          {user && (
            <div className="pt-2 border-t border-brandgray-border text-[10px] text-brandgray-text mt-1 text-center font-medium">
              Logged in as: <span className="font-bold">{user.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
