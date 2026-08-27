'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Building2, RefreshCw, Layers, IndianRupee, CheckCircle, ChevronRight, MessageCircle } from 'lucide-react';

interface Project {
  id: string;
  status: string;
  createdAt: string;
  problem: {
    title: string;
    description: string;
    category: string;
    district: string;
    state: string;
    affectedPopulation: number;
    aiAnalysis?: { priority: string; priorityScore: number } | null;
  };
  university: { name: string };
  proposal?: { title: string; budget: number; description: string; status: string } | null;
  team?: { facultyMentorName: string; studentMembers: string } | null;
  milestones?: { id: string; title: string; status: string; dueDate: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  TEAM_FORMATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROPOSAL_SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function IndustryDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeNote, setPledgeNote] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/projects?role=INDUSTRY');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setMsg('Failed to load projects.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'INDUSTRY')) {
      router.push('/login');
      return;
    }
    if (!loading && user) fetchProjects();
  }, [loading, user, router, fetchProjects]);

  const submitPledge = async () => {
    if (!selected || !pledgeAmount) {
      setMsg('Please enter a pledge amount.');
      return;
    }
    setSubmitting(true);
    setMsg('');
    try {
      const res = await fetch(`/api/projects/${selected.id}/pledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(pledgeAmount), note: pledgeNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Failed to submit pledge.');
        return;
      }
      setMsg('CSR pledge submitted successfully!');
      setPledgeAmount('');
      setPledgeNote('');
      fetchProjects();
    } catch {
      setMsg('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-brandgray-muted">Loading Industry Console...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Building2 className="h-6 w-6" /> Industry / CSR Portal
          </h1>
          <p className="text-sm text-brandgray-muted mt-1">
            {user?.orgName || 'Industry Partner'} — Explore matched community problems and pledge CSR support.
          </p>
        </div>
        <button
          onClick={fetchProjects}
          className="flex items-center gap-1.5 text-sm text-primary border border-primary/20 px-3 py-1.5 rounded hover:bg-primary-light transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded text-sm border ${
            msg.includes('success')
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Available Projects', count: projects.length, icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'With Proposals', count: projects.filter((p) => p.proposal).length, icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Projects', count: projects.filter((p) => p.status === 'IN_PROGRESS').length, icon: Building2, color: 'text-green-600 bg-green-50' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-brandgray-border p-4 flex items-center gap-3 shadow-subtle">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-brandgray-text">{count}</div>
              <div className="text-xs text-brandgray-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-brandgray-muted uppercase tracking-wide mb-2">
            Community Projects
          </h2>
          {fetching ? (
            <div className="text-sm text-brandgray-muted">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-brandgray-border text-brandgray-muted text-sm">
              No projects available yet.
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  setMsg('');
                }}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all shadow-subtle hover:shadow-standard ${
                  selected?.id === p.id ? 'border-primary ring-1 ring-primary/20' : 'border-brandgray-border'
                }`}
              >
                <p className="text-sm font-semibold text-brandgray-text line-clamp-2">{p.problem.title}</p>
                <p className="text-xs text-brandgray-muted mt-0.5">
                  {p.problem.category} · {p.problem.district}, {p.problem.state}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {p.status.replace(/_/g, ' ')}
                  </span>
                  {p.problem.aiAnalysis && (
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                      {p.problem.aiAnalysis.priority} priority
                    </span>
                  )}
                  {p.proposal && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                      Has Proposal
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white border border-brandgray-border rounded-lg shadow-subtle">
              {/* Problem Detail */}
              <div className="p-5 border-b border-brandgray-border">
                <h3 className="font-bold text-primary">{selected.problem.title}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-brandgray-muted">
                  <span>{selected.problem.category}</span>
                  <span>·</span>
                  <span>{selected.problem.district}, {selected.problem.state}</span>
                  <span>·</span>
                  <span>Affects ~{selected.problem.affectedPopulation} people</span>
                </div>
                <p className="text-sm text-brandgray-text mt-3">{selected.problem.description}</p>

                {selected.problem.aiAnalysis && (
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        selected.problem.aiAnalysis.priority === 'HIGH' ||
                        selected.problem.aiAnalysis.priority === 'CRITICAL'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {selected.problem.aiAnalysis.priority} Priority · Score {selected.problem.aiAnalysis.priorityScore}/100
                    </span>
                  </div>
                )}
              </div>

              {/* University Team Info */}
              {selected.team && (
                <div className="px-5 py-4 border-b border-brandgray-border bg-blue-50/40">
                  <p className="text-xs font-semibold text-blue-700 mb-2">
                    🎓 Research Team ({selected.university?.name || 'University'})
                  </p>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-brandgray-muted">Faculty Mentor:</span>{' '}
                      <span className="font-medium ml-1">{selected.team.facultyMentorName}</span>
                    </div>
                    <div>
                      <span className="text-brandgray-muted">Students:</span>{' '}
                      <span className="font-medium ml-1">{selected.team.studentMembers}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Proposal Info */}
              {selected.proposal && (
                <div className="px-5 py-4 border-b border-brandgray-border bg-purple-50/40">
                  <p className="text-xs font-semibold text-purple-700 mb-2">📄 Solution Proposal</p>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{selected.proposal.title}</div>
                    <div className="text-brandgray-muted">{selected.proposal.description}</div>
                    <div className="flex items-center gap-1 text-green-700 font-semibold">
                      <IndianRupee className="h-3.5 w-3.5" />{' '}
                      {selected.proposal.budget.toLocaleString('en-IN')} requested
                    </div>
                  </div>
                </div>
              )}

              {/* Pledge Section */}
              <div className="p-5">
                <p className="text-sm font-semibold text-brandgray-text mb-4 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-success" /> Pledge CSR Funding / Resources
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-brandgray-muted uppercase tracking-wide">
                      Pledge Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                      className="mt-1 w-full border border-brandgray-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="e.g. 500000"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brandgray-muted uppercase tracking-wide">
                      Note / Commitment Details
                    </label>
                    <textarea
                      value={pledgeNote}
                      onChange={(e) => setPledgeNote(e.target.value)}
                      rows={3}
                      className="mt-1 w-full border border-brandgray-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Describe your funding commitment, in-kind resources, mentorship offer, etc."
                    />
                  </div>
                  <button
                    onClick={submitPledge}
                    disabled={submitting}
                    className="bg-success hover:bg-success-hover text-white text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    <IndianRupee className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit CSR Pledge'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-brandgray-border rounded-lg p-12 text-center text-brandgray-muted">
              <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a project to view details and pledge support.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
