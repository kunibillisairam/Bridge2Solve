'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, ROLE_REDIRECT } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, Building2, User, Landmark, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const target = ROLE_REDIRECT[user.role];
      if (target) {
        router.push(target);
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  const seedUsers = [
    {
      role: 'Citizen',
      email: 'citizen@gov.in',
      pass: 'password123',
      desc: 'Submit and track community issues',
      icon: User,
      color: 'border-blue-200 bg-blue-50 text-blue-800',
    },
    {
      role: 'University',
      email: 'univ@gov.in',
      pass: 'password123',
      desc: 'IISc Bangalore - Build solution proposals',
      icon: Landmark,
      color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    {
      role: 'Industry / CSR',
      email: 'industry@gov.in',
      pass: 'password123',
      desc: 'Tata Trusts - Funding and mentorship',
      icon: Building2,
      color: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
      role: 'Government Admin',
      email: 'admin@gov.in',
      pass: 'password123',
      desc: 'Validate problems and assign matches',
      icon: Shield,
      color: 'border-rose-200 bg-rose-50 text-rose-800',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-brandgray-light">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-lg border border-brandgray-border shadow-standard">
        
        {/* Left Column: Login Form */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-primary uppercase tracking-tight">Portal Login</h1>
            <p className="text-xs text-brandgray-muted mt-1">
              Access the National Societal Innovation Collaboration Platform.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="name@organization.gov.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 rounded text-sm transition-colors shadow-subtle border border-primary disabled:bg-primary/50 flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-brandgray-border text-center text-xs text-brandgray-muted">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Right Column: Seed Credentials Helper */}
        <div className="border-t md:border-t-0 md:border-l border-brandgray-border pt-6 md:pt-0 md:pl-8 flex flex-col justify-between bg-gray-50 -mx-6 -mb-6 p-6 sm:p-8 md:m-0 rounded-b-lg md:rounded-r-lg md:rounded-bl-none">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">
              Evaluator / Seed Credentials
            </h2>
            <p className="text-xs text-brandgray-muted mb-4">
              Select a role below to auto-fill the login fields and explore specific dashboard experiences.
            </p>

            <div className="space-y-3">
              {seedUsers.map((su) => {
                const Icon = su.icon;
                return (
                  <button
                    key={su.email}
                    onClick={() => {
                      setEmail(su.email);
                      setPassword(su.pass);
                    }}
                    className="w-full text-left p-3 border rounded-lg transition-all hover:shadow-subtle flex items-start space-x-3 bg-white hover:border-primary/30"
                  >
                    <div className={`p-1.5 rounded border ${su.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brandgray-text">{su.role}</span>
                        <span className="text-[10px] text-brandgray-muted bg-gray-100 px-1.5 py-0.2 rounded border font-mono">
                          Auto-fill
                        </span>
                      </div>
                      <p className="text-[11px] text-brandgray-text font-medium mt-0.5">{su.email}</p>
                      <p className="text-[10px] text-brandgray-muted mt-0.5 leading-none">{su.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
