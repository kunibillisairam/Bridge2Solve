'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Building2, User, Mail, Lock, Phone, Briefcase, AlertCircle, ArrowRight, ArrowLeft, Globe, ShieldCheck, MapPin, Home, CheckSquare, Square } from 'lucide-react';
import { INDIA_STATES_AND_DISTRICTS, getCompanySuggestions, INDIAN_COMPANIES, CSR_FOCUS_AREAS } from '@/lib/registries';

export default function IndustrySignupPage() {
  const { signup } = useAuth();

  // Organization Information
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('CSR Foundation');
  const [website, setWebsite] = useState('');
  const [companyCin, setCompanyCin] = useState('');
  const [csrId, setCsrId] = useState('');

  // Representative Information
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');

  // Contact Information
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Registered Office Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');

  // CSR / Expertise
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [geographicFocus, setGeographicFocus] = useState('');
  const [technicalExpertise, setTechnicalExpertise] = useState('');

  // Security
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Autocomplete & UI states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when name changes
  useEffect(() => {
    if (organizationName.trim().length >= 2) {
      const filtered = getCompanySuggestions(organizationName);
      setSuggestions(filtered);
      
      // Determine if manual
      const match = INDIAN_COMPANIES.find(
        c => c.toLowerCase() === organizationName.toLowerCase().trim()
      );
      setIsManual(!match);
    } else {
      setSuggestions([]);
      setIsManual(true);
    }
  }, [organizationName]);

  // Load districts when state changes
  useEffect(() => {
    if (state) {
      setDistrictsList(INDIA_STATES_AND_DISTRICTS[state] || []);
      setDistrict(''); // Reset district
    } else {
      setDistrictsList([]);
      setDistrict('');
    }
  }, [state]);

  const toggleFocusArea = (area: string) => {
    if (selectedFocusAreas.includes(area)) {
      setSelectedFocusAreas(selectedFocusAreas.filter(a => a !== area));
    } else {
      setSelectedFocusAreas([...selectedFocusAreas, area]);
    }
  };

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

    // Required fields check
    if (
      !organizationName.trim() ||
      !organizationType ||
      !addressLine1.trim() ||
      !state ||
      !district ||
      !pincode.trim() ||
      !name.trim() ||
      !designation.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    // Phone format validation
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Contact Phone.');
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit Pincode.');
      return;
    }

    // State/district combination check
    const validDistricts = INDIA_STATES_AND_DISTRICTS[state] || [];
    if (!validDistricts.includes(district)) {
      setError('Invalid State and District combination selected.');
      return;
    }

    setLoading(true);

    const res = await signup({
      role: 'INDUSTRY',
      organizationName: organizationName.trim(),
      organizationType,
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      designation: designation.trim(),
      phone: cleanPhone,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      state,
      district,
      pincode: pincode.trim(),
      website: website.trim() || undefined,
      companyCin: companyCin.trim() || undefined,
      csrId: csrId.trim() || undefined,
      csrFocusAreas: selectedFocusAreas.length > 0 ? selectedFocusAreas.join(', ') : undefined,
      geographicFocus: geographicFocus.trim() || undefined,
      technicalExpertise: technicalExpertise.trim() || undefined,
      isManualCompany: isManual,
    });

    if (!res.success) {
      setError(res.error || 'Industry registration failed. Please try again.');
      setLoading(false);
    }
  };

  const statesList = Object.keys(INDIA_STATES_AND_DISTRICTS).sort();
  const orgTypes = [
    'CSR Foundation',
    'Private Limited Company',
    'Public Limited Company',
    'Sole Proprietorship',
    'Partnership Firm',
    'LLP (Limited Liability Partnership)',
    'Non-Governmental Organization (NGO)',
    'Other'
  ];

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
            <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Role: Industry / CSR Partner
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                Industry & CSR Partner Registration
              </h1>
            </div>
          </div>
          <p className="text-xs text-brandgray-muted mt-2">
            Register your organization to explore verified community problems, fund solution proposals through CSR, and provide technical mentorship.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Industry Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: Organization Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandgray-muted border-b pb-1">
              1. Organization Information
            </h3>
            
            <div className="relative" ref={autocompleteRef}>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                Organization / Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Type to search e.g. Tata, Infosys..."
                  required
                />
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-brandgray-border rounded-b shadow-lg max-h-48 overflow-y-auto mt-1 text-xs">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setOrganizationName(sug);
                        setShowSuggestions(false);
                        setIsManual(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brandgray-light border-b border-brandgray-border/40 last:border-b-0 font-medium text-brandgray-text"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Manual Entry Warning */}
              {isManual && organizationName.trim().length >= 2 && !showSuggestions && (
                <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                  ⚠️ Not found in registry. Will register as a custom manual entry.
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Organization Type *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted pointer-events-none" />
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                    required
                  >
                    {orgTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Corporate Registration / CIN
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={companyCin}
                    onChange={(e) => setCompanyCin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. U74140MH2018PTC300000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  CSR Registration / Reference ID
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={csrId}
                    onChange={(e) => setCsrId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. CSR00000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Representative Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandgray-muted border-b pb-1">
              2. Representative Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Representative Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Priyesh Patel"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Designation *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. CSR Lead / HR Manager"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandgray-muted border-b pb-1">
              3. Contact Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Official Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="representative@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="10-digit phone number"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Registered Office Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandgray-muted border-b pb-1">
              4. Registered Office Address
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Address Line 1 *
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Unit 3B, Tech Park, Corporate Way"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Address Line 2 (optional)
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Phase 2, Industrial Area"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  State *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted pointer-events-none" />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                    required
                  >
                    <option value="">Select State</option>
                    {statesList.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  District / City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted pointer-events-none" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                    disabled={!state}
                    required
                  >
                    <option value="">Select District</option>
                    {districtsList.map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Pincode *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. 400001"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: CSR & Expertise */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandgray-muted border-b pb-1">
              5. CSR & Expertise Focus
            </h3>

            <div>
              <label className="block text-xs font-bold text-brandgray-text uppercase mb-2">
                CSR Focus Areas (Select all that apply)
              </label>
              <div className="grid sm:grid-cols-2 gap-2 bg-gray-50 p-4 border border-brandgray-border rounded max-h-48 overflow-y-auto">
                {CSR_FOCUS_AREAS.map(area => {
                  const selected = selectedFocusAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleFocusArea(area)}
                      className="flex items-center gap-2 text-left p-1.5 hover:bg-white rounded transition-colors text-xs font-medium text-brandgray-text"
                    >
                      {selected ? (
                        <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-brandgray-muted shrink-0" />
                      )}
                      <span>{area}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Geographic Focus (optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={geographicFocus}
                    onChange={(e) => setGeographicFocus(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Rural Tamil Nadu, North India"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brandgray-text uppercase mb-1">
                  Technical Expertise (optional)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-brandgray-muted" />
                  <input
                    type="text"
                    value={technicalExpertise}
                    onChange={(e) => setTechnicalExpertise(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brandgray-border rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Water filtration, Solar, IoT"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Account Security */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brandgray-muted border-b pb-1">
              6. Account Security
            </h3>

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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded text-sm transition-colors shadow-subtle border border-primary disabled:bg-primary/50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Creating Industry Account...' : 'Complete Industry Registration'}</span>
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
