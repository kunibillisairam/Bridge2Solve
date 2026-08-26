'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PlusCircle, MapPin, Users, CheckCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface ProblemWithAI {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  affectedPopulation: string;
  status: string;
  createdAt: string;
  project?: {
    status: string;
    university: { name: string };
  };
}

export default function CitizenDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemWithAI[]>([]);
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Agriculture & Water Management');
  const [location, setLocation] = useState('');
  const [affectedPopulation, setAffectedPopulation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const categories = [
    'Agriculture & Water Management',
    'Waste Management & Environmental Engineering',
    'Education & Skill Development',
    'Healthcare & Sanitation',
    'Renewable Energy & Power',
    'Rural Livelihoods & Infrastructure',
  ];

  const fetchProblems = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/problems?citizenId=${user.id}`);
      const data = await res.json();
      setProblems(data.problems || []);
    } catch (err) {
      console.error('Error loading problems:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProblems();
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          affectedPopulation,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Your problem has been submitted successfully and has queued for AI analysis and admin validation.');
        setTitle('');
        setDescription('');
        setLocation('');
        setAffectedPopulation('');
        fetchProblems();
      } else {
        const data = await res.json();
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Error submitting problem:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-brandgray-light">
        <div className="text-sm font-semibold text-brandgray-muted">Loading Citizen Console...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-brandgray-border rounded-lg p-6 shadow-subtle mb-8">
        <h2 className="text-xl font-black text-primary uppercase">Citizen Grievance & Societal Problem Submission Portal</h2>
        <p className="text-xs text-brandgray-muted mt-1 uppercase tracking-wider font-semibold">
          Report local community challenges directly to the National innovation matching queue.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-brandgray-border shadow-subtle overflow-hidden">
            <div className="px-5 py-4 border-b border-brandgray-border bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">My Submitted Problems</span>
              <span className="text-[10px] font-bold bg-primary-light text-primary border border-primary/10 px-2 py-0.5 rounded">
                Total: {problems.length}
              </span>
            </div>

            {problems.length === 0 ? (
              <div className="p-8 text-center text-xs text-brandgray-muted font-medium">
                No problems reported yet. Fill the form on the right to submit a community challenge.
              </div>
            ) : (
              <div className="divide-y divide-brandgray-border">
                {problems.map((prob) => {
                  let statusBadge = (
                    <span className="inline-flex items-center space-x-1 text-[9px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      <Clock className="h-3 w-3" />
                      <span>Pending Validation</span>
                    </span>
                  );

                  if (prob.status === 'VALIDATED') {
                    statusBadge = (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wider">
                        <Clock className="h-3 w-3" />
                        <span>Validated & Matching</span>
                      </span>
                    );
                  } else if (prob.status === 'MATCHED') {
                    statusBadge = (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Matched & Projects Active</span>
                      </span>
                    );
                  } else if (prob.status === 'REJECTED') {
                    statusBadge = (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-bold bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider">
                        <XCircle className="h-3 w-3" />
                        <span>Rejected</span>
                      </span>
                    );
                  }

                  return (
                    <div key={prob.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between space-x-4 mb-2">
                        <h3 className="text-sm sm:text-base font-bold text-primary">{prob.title}</h3>
                        <div className="shrink-0">{statusBadge}</div>
                      </div>
                      <p className="text-xs text-brandgray-muted leading-relaxed line-clamp-2">
                        {prob.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100 text-[11px] text-brandgray-muted">
                        <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase">
                          {prob.category}
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-semibold text-brandgray-text">{prob.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span>Affected: <strong className="text-brandgray-text">{prob.affectedPopulation}</strong></span>
                        </span>
                      </div>

                      {prob.project && (
                        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded text-[11px] text-emerald-800 flex items-start space-x-1.5 font-medium">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                          <div>
                            Assigned to <span className="font-bold">{prob.project.university.name}</span>. 
                            Project stage: <span className="font-bold uppercase">{prob.project.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-brandgray-border shadow-subtle p-5 sticky top-20">
            <h3 className="text-sm font-bold text-primary uppercase border-b border-brandgray-border pb-2.5 mb-4 flex items-center space-x-1.5">
              <PlusCircle className="h-4.5 w-4.5 text-primary" />
              <span>Report Community Issue</span>
            </h3>

            {successMsg && (
              <div className="mb-4 p-3 bg-success-light border border-success/20 rounded text-success text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Issue Title / Subject
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Garbage piling on Main Road, Sector 4"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Domain / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Explain the background, severity, and clear issues faced by residents..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Location (District, State)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Pune, Maharashtra"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brandgray-text uppercase mb-1">
                  Estimated Affected Population
                </label>
                <input
                  type="text"
                  value={affectedPopulation}
                  onChange={(e) => setAffectedPopulation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. 500+ residents, 20 villages"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2 rounded transition-colors shadow-subtle border border-primary disabled:bg-primary/50"
              >
                {submitting ? 'Submitting Grievance...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
