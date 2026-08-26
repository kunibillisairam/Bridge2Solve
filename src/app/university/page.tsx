'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { GraduationCap, RefreshCw, Users, FileText, CheckCircle, Clock, ChevronRight, Layers } from 'lucide-react';

interface Project {
  id: string;
  status: string;
  createdAt: string;
  problem: {
    title: string;
    description: string;
    category: string;
    location: string;
    aiAnalysis?: { priority: string; priorityScore: number; requiredExpertise: string } | null;
  };
  team?: { facultyMentorName: string; studentMembers: string } | null;
  proposal?: { title: string; budget: number; status: string } | null;
  milestones?: { id: string; title: string; status: string; dueDate: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  TEAM_FORMATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROPOSAL_SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function UniversityDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [msg, setMsg] = useState('');
  const [teamForm, setTeamForm] = useState({ facultyMentorName: '', studentMembers: '' });
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', budget: '', timeline: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'team' | 'proposal' | 'milestones'>('team');

  const fetchProjects = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/projects?role=UNIVERSITY');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setMsg('Failed to load projects.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'UNIVERSITY')) { router.push('/login'); return; }
    if (!loading && user) fetchProjects();
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitTeam = async () => {
    if (!selected || !teamForm.facultyMentorName || !teamForm.studentMembers) { setMsg('Please fill all team fields.'); return; }
    setSubmitting(true); setMsg('');
    try {
      const res = await fetch(`/api/projects/${selected.id}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'Failed to submit team.'); return; }
      setMsg('Team registered successfully!');
      fetchProjects();
    } catch { setMsg('Network error.'); }
    finally { setSubmitting(false); }
  };

  const submitProposal = async () => {
    if (!selected || !proposalForm.title || !proposalForm.description || !proposalForm.budget) { setMsg('Please fill all proposal fields.'); return; }
    setSubmitting(true); setMsg('');
    try {
      const res = await fetch(`/api/projects/${selected.id}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...proposalForm, budget: parseFloat(proposalForm.budget) }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'Failed to submit proposal.'); return; }
      setMsg('Proposal submitted successfully!');
      fetchProjects();
    } catch { setMsg('Network error.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-brandgray-muted">Loading...</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <GraduationCap className="h-6 w-6" /> University Research Portal
          </h1>
          <p className="text-sm text-brandgray-muted mt-1">
            {user?.orgName || 'University'} — Manage matched projects, form teams, and submit solution proposals.
          </p>
        </div>
        <button onClick={fetchProjects} className="flex items-center gap-1.5 text-sm text-primary border border-primary/20 px-3 py-1.5 rounded hover:bg-primary-light transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded text-sm border ${msg.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{msg}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Matched Projects', count: projects.length, icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Team Formation', count: projects.filter(p => p.status === 'TEAM_FORMATION').length, icon: Users, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Proposals Sent', count: projects.filter(p => p.proposal).length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'In Progress', count: projects.filter(p => p.status === 'IN_PROGRESS').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-brandgray-border p-4 flex items-center gap-3 shadow-subtle">
            <div className={`p-2 rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
            <div><div className="text-xl font-bold text-brandgray-text">{count}</div><div className="text-xs text-brandgray-muted">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-brandgray-muted uppercase tracking-wide mb-2">Matched Problems</h2>
          {fetching ? <div className="text-sm text-brandgray-muted">Loading...</div> :
            projects.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border border-brandgray-border text-brandgray-muted text-sm">No projects assigned yet.</div>
            ) : projects.map(p => (
              <div
                key={p.id}
                onClick={() => { setSelected(p); setMsg(''); setActiveTab('team'); }}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all shadow-subtle hover:shadow-standard ${selected?.id === p.id ? 'border-primary ring-1 ring-primary/20' : 'border-brandgray-border'}`}
              >
                <p className="text-sm font-semibold text-brandgray-text line-clamp-2">{p.problem.title}</p>
                <p className="text-xs text-brandgray-muted mt-0.5">{p.problem.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {p.status.replace(/_/g, ' ')}
                  </span>
                  {p.problem.aiAnalysis && (
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                      {p.problem.aiAnalysis.priority} priority
                    </span>
                  )}
                </div>
              </div>
            ))
          }
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white border border-brandgray-border rounded-lg shadow-subtle">
              <div className="p-5 border-b border-brandgray-border">
                <h3 className="font-bold text-primary">{selected.problem.title}</h3>
                <p className="text-xs text-brandgray-muted mt-1">{selected.problem.category} · {selected.problem.location}</p>
                <p className="text-sm text-brandgray-text mt-2">{selected.problem.description}</p>
                {selected.problem.aiAnalysis && (
                  <div className="mt-3 bg-purple-50 rounded p-3 text-xs border border-purple-100">
                    <p className="font-semibold text-purple-700 mb-1">🤖 Required Expertise</p>
                    <p className="text-brandgray-text">{(() => { try { return JSON.parse(selected.problem.aiAnalysis!.requiredExpertise).join(', '); } catch { return selected.problem.aiAnalysis!.requiredExpertise; } })()}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-brandgray-border">
                {(['team', 'proposal', 'milestones'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs font-semibold capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-brandgray-muted hover:text-brandgray-text'}`}>
                    {tab === 'team' ? '👥 Team' : tab === 'proposal' ? '📄 Proposal' : '📌 Milestones'}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'team' && (
                  selected.team ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-green-700 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Team Registered</p>
                      <div className="text-sm"><span className="text-brandgray-muted">Faculty Mentor:</span> <span className="font-medium">{selected.team.facultyMentorName}</span></div>
                      <div className="text-sm"><span className="text-brandgray-muted">Students:</span> <span className="font-medium">{selected.team.studentMembers}</span></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-brandgray-text">Register Your Research Team</p>
                      <div>
                        <label className="text-xs font-semibold text-brandgray-muted uppercase tracking-wide">Faculty Mentor Name</label>
                        <input value={teamForm.facultyMentorName} onChange={e => setTeamForm(f => ({ ...f, facultyMentorName: e.target.value }))}
                          className="mt-1 w-full border border-brandgray-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Prof. Anand Kumar" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-brandgray-muted uppercase tracking-wide">Student Members (comma-separated)</label>
                        <textarea value={teamForm.studentMembers} onChange={e => setTeamForm(f => ({ ...f, studentMembers: e.target.value }))}
                          rows={3} className="mt-1 w-full border border-brandgray-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Shreya B. (MTech), Karan M. (BTech)" />
                      </div>
                      <button onClick={submitTeam} disabled={submitting}
                        className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-60">
                        {submitting ? 'Submitting...' : 'Register Team'}
                      </button>
                    </div>
                  )
                )}

                {activeTab === 'proposal' && (
                  selected.proposal ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-blue-700 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Proposal Submitted</p>
                      <div className="text-sm"><span className="text-brandgray-muted">Title:</span> <span className="font-medium">{selected.proposal.title}</span></div>
                      <div className="text-sm"><span className="text-brandgray-muted">Budget:</span> <span className="font-medium">₹{selected.proposal.budget.toLocaleString('en-IN')}</span></div>
                      <div className="text-sm"><span className="text-brandgray-muted">Status:</span> <span className="font-medium">{selected.proposal.status}</span></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-brandgray-text">Submit Solution Proposal</p>
                      {['title', 'description', 'budget', 'timeline'].map(field => (
                        <div key={field}>
                          <label className="text-xs font-semibold text-brandgray-muted uppercase tracking-wide capitalize">{field === 'budget' ? 'Budget (₹)' : field}</label>
                          {field === 'description' ? (
                            <textarea value={(proposalForm as any)[field]} onChange={e => setProposalForm(f => ({ ...f, [field]: e.target.value }))}
                              rows={3} className="mt-1 w-full border border-brandgray-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          ) : (
                            <input type={field === 'budget' ? 'number' : 'text'} value={(proposalForm as any)[field]} onChange={e => setProposalForm(f => ({ ...f, [field]: e.target.value }))}
                              className="mt-1 w-full border border-brandgray-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                              placeholder={field === 'budget' ? 'e.g. 500000' : field === 'timeline' ? 'e.g. 6 months' : ''} />
                          )}
                        </div>
                      ))}
                      <button onClick={submitProposal} disabled={submitting}
                        className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-60">
                        {submitting ? 'Submitting...' : 'Submit Proposal'}
                      </button>
                    </div>
                  )
                )}

                {activeTab === 'milestones' && (
                  <div>
                    {!selected.milestones || selected.milestones.length === 0 ? (
                      <div className="text-center py-8 text-brandgray-muted text-sm"><Clock className="h-6 w-6 mx-auto mb-2 opacity-30" />No milestones assigned yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {selected.milestones.map(m => (
                          <div key={m.id} className="flex items-start gap-3 p-3 border border-brandgray-border rounded-lg">
                            <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${m.status === 'COMPLETED' ? 'bg-green-500' : m.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brandgray-text">{m.title}</p>
                              <p className="text-xs text-brandgray-muted">Due: {new Date(m.dueDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-brandgray-muted">{m.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-brandgray-border rounded-lg p-12 text-center text-brandgray-muted">
              <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a project to manage team and proposal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
