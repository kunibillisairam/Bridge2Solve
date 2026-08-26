'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, ChevronRight, Users } from 'lucide-react';
import { universityMockService } from '@/services/universityMockService';

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  state: string;
  affectedPopulation: number;
  status: string;
  priority: string;
  createdAt: string;
  submittedBy: { name: string; email: string };
  aiAnalysis?: {
    category: string;
    priority: string;
    priorityScore: number;
    requiredExpertise: string;
    matchedInstitutions: string;
    matchedIndustries: string;
    reviewStatus: string;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800 border border-amber-200',
  ANALYZED: 'bg-purple-100 text-purple-800 border border-purple-200',
  MATCHED: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  IN_PROGRESS: 'bg-green-100 text-green-800 border border-green-200',
  RESOLVED: 'bg-gray-100 text-gray-700 border border-gray-200',
  REJECTED: 'bg-red-100 text-red-800 border border-red-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-green-500 text-white',
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Problem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProblems = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/problems?role=ADMIN');
      const data = await res.json();
      setProblems(data.problems || []);
    } catch {
      setMsg('Failed to load problems.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    if (!loading && user) fetchProblems();
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleValidate = async (problemId: string, action: 'approve' | 'reject') => {
    setActionLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/problems/${problemId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'Action failed'); return; }
      setMsg(`Problem ${action === 'approve' ? 'approved & AI analysis triggered' : 'rejected'} successfully.`);
      setSelected(null);
      fetchProblems();
    } catch {
      setMsg('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProject = async (problemId: string, universityId: string, industryId?: string) => {
    setActionLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, universityId, industryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Failed to match project');
        return;
      }
      setMsg('Project successfully matched and assigned to University!');
      setSelected(null);
      fetchProblems();
    } catch {
      setMsg('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const [proposalMetrics, setProposalMetrics] = useState({ pendingCount: 0, acceptedCount: 0, rejectedCount: 0, projectsCreatedCount: 0 });

  useEffect(() => {
    setProposalMetrics(universityMockService.getAdminProposalMetrics());
  }, []);

  const pending = problems.filter(p => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW');
  const analyzed = problems.filter(p => p.status === 'ANALYZED' || p.status === 'MATCHED');
  const rest = problems.filter(p => !['SUBMITTED', 'UNDER_REVIEW', 'ANALYZED', 'MATCHED'].includes(p.status));

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-brandgray-muted">Loading...</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" /> Admin Validation Dashboard
          </h1>
          <p className="text-sm text-brandgray-muted mt-1">Review citizen submissions, trigger AI analysis, and manage problem & proposal lifecycle.</p>
        </div>
        <button onClick={fetchProblems} className="flex items-center gap-1.5 text-sm text-primary border border-primary/20 px-3 py-1.5 rounded hover:bg-primary-light transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* University Proposal Review Quick Access Banner */}
      <Link href="/admin/proposals" className="block mb-6">
        <div className="bg-white rounded-lg border border-purple-200 p-4 flex items-center justify-between shadow-subtle hover:border-purple-400 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
              <ShieldCheck className="h-5 w-5 text-purple-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">University Proposal Review Portal</h3>
              <p className="text-xs text-brandgray-muted">Evaluate submitted academic research proposals and approve project creation.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-250 px-2.5 py-1 rounded">
              {proposalMetrics.pendingCount} Pending Review
            </span>
            <ChevronRight className="h-4 w-4 text-brandgray-muted" />
          </div>
        </div>
      </Link>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded text-sm border ${msg.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Review', count: pending.length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'AI Analyzed', count: analyzed.length, icon: RefreshCw, color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Problems', count: problems.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Resolved', count: rest.filter(p => p.status === 'RESOLVED').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-brandgray-border p-4 flex items-center gap-3 shadow-subtle">
            <div className={`p-2 rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
            <div>
              <div className="text-xl font-bold text-brandgray-text">{count}</div>
              <div className="text-xs text-brandgray-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-brandgray-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" /> Awaiting Validation ({pending.length})
              </h2>
              {pending.map(p => (
                <ProblemCard key={p.id} problem={p} selected={selected?.id === p.id} onClick={() => setSelected(p)} />
              ))}
            </div>
          )}

          {/* Analyzed */}
          {analyzed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-brandgray-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-purple-500" /> AI Analyzed / Matched ({analyzed.length})
              </h2>
              {analyzed.map(p => (
                <ProblemCard key={p.id} problem={p} selected={selected?.id === p.id} onClick={() => setSelected(p)} />
              ))}
            </div>
          )}

          {/* Others */}
          {rest.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-brandgray-muted uppercase tracking-wide mb-3">Others ({rest.length})</h2>
              {rest.map(p => (
                <ProblemCard key={p.id} problem={p} selected={selected?.id === p.id} onClick={() => setSelected(p)} />
              ))}
            </div>
          )}

          {!fetching && problems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-brandgray-border text-brandgray-muted">
              No problems submitted yet.
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-white border border-brandgray-border rounded-lg p-5 shadow-subtle sticky top-24">
              <h3 className="font-semibold text-primary text-sm mb-1">{selected.title}</h3>
              <p className="text-xs text-brandgray-muted mb-3">Submitted by {selected.submittedBy?.name || 'Citizen'} · {selected.district}, {selected.state}</p>
              <p className="text-sm text-brandgray-text mb-4">{selected.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs"><span className="text-brandgray-muted">Category</span><span className="font-medium">{selected.category}</span></div>
                <div className="flex justify-between text-xs"><span className="text-brandgray-muted">Affected</span><span className="font-medium">{selected.affectedPopulation} people</span></div>
                <div className="flex justify-between text-xs"><span className="text-brandgray-muted">Status</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status] || ''}`}>{selected.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {(() => {
                const analysis = universityMockService.getProblemAnalysis(selected.id);
                if (!analysis) return null;

                return (
                  <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        🤖 AI-Assisted Analysis
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                        analysis.reviewStatus === "ACCEPTED" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : analysis.reviewStatus === "MODIFIED" 
                          ? "bg-blue-100 text-blue-800 border-blue-200" 
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}>
                        {analysis.reviewStatus || "PENDING REVIEW"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-purple-950">
                      <div><span className="text-brandgray-muted block text-[10px] uppercase font-bold">Category & Subcategory</span><span className="font-semibold">{analysis.category} / {analysis.subcategory}</span></div>
                      <div><span className="text-brandgray-muted block text-[10px] uppercase font-bold">Problem Summary</span><p className="bg-white/80 p-2 rounded border border-purple-100 text-brandgray-text mt-0.5">{analysis.summary}</p></div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div><span className="text-brandgray-muted block text-[10px] uppercase font-bold">Severity</span><span className="font-bold text-red-700">{analysis.severity}</span></div>
                        <div><span className="text-brandgray-muted block text-[10px] uppercase font-bold">Impact Level</span><span className="font-bold text-purple-900">{analysis.impactLevel}</span></div>
                      </div>
                      <div>
                        <span className="text-brandgray-muted block text-[10px] uppercase font-bold mt-1">Required Expertise</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.requiredExpertise.map((exp, i) => (
                            <span key={i} className="text-[10px] bg-white text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded font-medium">{exp}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-brandgray-muted block text-[10px] uppercase font-bold mt-1">Suggested Domains</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.suggestedDomains.map((domain, i) => (
                            <span key={i} className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded font-medium">{domain}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-purple-200/60">
                      <button
                        onClick={() => {
                          universityMockService.acceptProblemAnalysis(selected.id);
                          fetchProblems();
                        }}
                        className="flex-1 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-semibold py-1.5 rounded transition-colors"
                      >
                        Accept Analysis
                      </button>
                      <button
                        onClick={() => {
                          const updated = prompt("Enter updated Category & Subcategory (e.g. Water & Sanitation / Water Quality):", `${analysis.category} / ${analysis.subcategory}`);
                          if (updated) {
                            const parts = updated.split("/");
                            universityMockService.updateProblemAnalysis(selected.id, {
                              category: parts[0]?.trim() || analysis.category,
                              subcategory: parts[1]?.trim() || analysis.subcategory,
                            });
                            fetchProblems();
                          }
                        }}
                        className="flex-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-semibold py-1.5 rounded transition-colors"
                      >
                        Edit Analysis
                      </button>
                    </div>
                  </div>
                );
              })()}

              {(selected.status === 'SUBMITTED' || selected.status === 'UNDER_REVIEW') && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleValidate(selected.id, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-success hover:bg-success-hover text-white text-xs font-semibold py-2 rounded transition-colors disabled:opacity-60"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve & Analyze
                  </button>
                  <button
                    onClick={() => handleValidate(selected.id, 'reject')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded transition-colors disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}

              {selected.status === 'ANALYZED' && selected.aiAnalysis && (
                <div className="mt-4 pt-4 border-t border-brandgray-border">
                  <p className="text-xs font-bold text-brandgray-text uppercase tracking-wider mb-2">
                    Assign Match to University
                  </p>
                  <p className="text-[11px] text-brandgray-muted mb-3">
                    Select a recommended institution to create a collaborative solution project.
                  </p>
                  <div className="space-y-2">
                    {(() => {
                      try {
                        const institutions = JSON.parse(selected.aiAnalysis.matchedInstitutions);
                        const industries = JSON.parse(selected.aiAnalysis.matchedIndustries);
                        const topIndustryId = industries.length > 0 ? industries[0].id : undefined;

                        return institutions.map((inst: { id: string; name: string; score: number }) => (
                          <div key={inst.id} className="p-3 border border-brandgray-border rounded bg-gray-50 flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <p className="text-xs font-semibold text-brandgray-text leading-tight">{inst.name}</p>
                                <p className="text-[10px] text-purple-600 font-medium mt-1">Match Recommendation: {inst.score}%</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCreateProject(selected.id, inst.id, topIndustryId)}
                              disabled={actionLoading}
                              className="w-full text-center bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-1.5 rounded transition-colors disabled:opacity-60"
                            >
                              Confirm Match & Create Project
                            </button>
                          </div>
                        ));
                      } catch (e) {
                        return <p className="text-xs text-red-500">No matched institutions found in AI record.</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-brandgray-border rounded-lg p-8 text-center text-brandgray-muted text-sm">
              <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Select a problem to review details and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProblemCard({ problem, selected, onClick }: { problem: Problem; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-lg p-4 mb-2 cursor-pointer transition-all shadow-subtle hover:shadow-standard ${selected ? 'border-primary ring-1 ring-primary/20' : 'border-brandgray-border'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brandgray-text truncate">{problem.title}</p>
          <p className="text-xs text-brandgray-muted mt-0.5">{problem.district}, {problem.state} · {problem.submittedBy?.name || 'Citizen'}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[problem.status] || 'bg-gray-100 text-gray-700'}`}>
          {problem.status.replace(/_/g, ' ')}
        </span>
      </div>
      {problem.aiAnalysis && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-purple-600 font-medium">
          <span className="bg-purple-100 px-1.5 py-0.5 rounded">AI: {problem.aiAnalysis.priority} priority · Score {problem.aiAnalysis.priorityScore}/100</span>
        </div>
      )}
    </div>
  );
}
