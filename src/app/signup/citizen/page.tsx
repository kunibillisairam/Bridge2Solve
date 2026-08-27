'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CitizenSignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!name.trim() || !phone.trim() || !state.trim() || !district.trim()) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    setLoading(true);

    const res = await signup({
      role: 'CITIZEN',
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      phone: phone.trim(),
      state: state.trim(),
      district: district.trim(),
    });

    if (!res.success) {
      setError(res.error || 'Citizen registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-brandgray-light">
      <div className="w-full max-w-2xl bg-white p-6 sm:p-10 rounded-lg border border-brandgray-border shadow-standard">
        
        {/* Navigation Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brandgray-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Role Selection
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-brandgray-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-800">
              <User className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                Role: Citizen
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                Citizen Account Registration
              </h1>
            </div>
          </div>
          <p className="text-xs text-brandgray-muted mt-2">
            Create your account to submit, track, and monitor local civic grievances and community innovation needs.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Citizen Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Ramesh Chandra"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                State *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Karnataka"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                District *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Bengaluru Urban"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="name@domain.com"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Repeat your password"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded text-sm transition-colors shadow-subtle border border-primary disabled:bg-primary/50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Creating Citizen Account...' : 'Complete Citizen Registration'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brandgray-border text-center text-xs text-brandgray-muted">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
