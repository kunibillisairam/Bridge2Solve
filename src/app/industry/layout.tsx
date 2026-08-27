'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, LogOut } from 'lucide-react';

export default function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'INDUSTRY')) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-brandgray-muted">Verifying portal access...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'INDUSTRY') {
    return null;
  }

  return (
    <div className="min-h-screen bg-brandgray-light flex flex-col">
      {/* Sub-Header / Industry Workspace Display */}
      <div className="bg-primary text-white border-b border-primary/20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white/10 rounded flex items-center justify-center border border-white/10">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold block leading-none">
                  Industry & CSR Workspace
                </span>
                <span className="text-sm font-bold block mt-0.5">
                  {user.orgName || 'Industry Partner'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="hidden sm:inline-block text-slate-300 bg-white/5 px-2.5 py-1 rounded border border-white/5 font-medium">
                Role: {user.name} (CSR Partner)
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors bg-transparent border-0 font-medium py-1 px-2 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
