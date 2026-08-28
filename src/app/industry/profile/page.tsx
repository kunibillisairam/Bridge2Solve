"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Award, 
  CheckCircle2, 
  Save, 
  Sparkles 
} from "lucide-react";
import { 
  industryService, 
  IndustryOrganizationProfile 
} from "@/services/industryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function IndustryProfilePage() {
  const { user } = useAuth();
  const industryId = user?.profile?.industryDetails?.id || "ind-1";

  const [profile, setProfile] = useState<IndustryOrganizationProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [csrFocusAreas, setCsrFocusAreas] = useState("");
  const [expertise, setExpertise] = useState("");
  const [availableResources, setAvailableResources] = useState("");

  const [savedSuccess, setSavedSuccess] = useState("");

  useEffect(() => {
    if (industryId) {
      loadProfile(industryId);
    }
  }, [industryId]);

  const loadProfile = (indId: string) => {
    const p = industryService.getProfile(indId);
    setProfile(p);
    setName(p.name);
    setRepresentativeName(p.representativeName);
    setEmail(p.email);
    setPhone(p.phone);
    setLocation(p.location);
    setWebsite(p.website);
    setCsrFocusAreas(p.csrFocusAreas.join(", "));
    setExpertise(p.expertise.join(", "));
    setAvailableResources(p.availableResources.join(", "));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updated: IndustryOrganizationProfile = {
      ...profile,
      name,
      representativeName,
      email,
      phone,
      location,
      website,
      csrFocusAreas: csrFocusAreas.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
      expertise: expertise.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
      availableResources: availableResources.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
    };

    industryService.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    setSavedSuccess("Profile updated successfully!");
    setTimeout(() => setSavedSuccess(""), 2000);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brandgray-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold text-primary">Industry Profile & CSR Configuration</h2>
          <p className="text-xs text-brandgray-muted mt-1">
            Manage your organization&apos;s CSR mandates, technical domain focus, and contact details.
          </p>
        </div>
        <Button 
          variant={isEditing ? "outline" : "primary"} 
          size="sm" 
          className="h-9 text-xs font-bold"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
          {savedSuccess}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-brandgray-border rounded-lg p-6 space-y-4 shadow-subtle text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-primary block">Organization Name *</label>
              <input 
                type="text"
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-primary block">CSR Representative Name *</label>
              <input 
                type="text"
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-primary block">Email *</label>
              <input 
                type="email"
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-primary block">Phone</label>
              <input 
                type="text"
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-primary block">HQ Location</label>
              <input 
                type="text"
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-primary block">Website</label>
              <input 
                type="text"
                className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-primary block">CSR Focus Areas (Comma Separated)</label>
            <input 
              type="text"
              className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
              value={csrFocusAreas}
              onChange={(e) => setCsrFocusAreas(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-primary block">Areas of Technical Expertise (Comma Separated)</label>
            <input 
              type="text"
              className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-primary block">Available Partnership Resources (Comma Separated)</label>
            <input 
              type="text"
              className="w-full text-xs border border-brandgray-border rounded p-2 focus:outline-none focus:border-primary"
              value={availableResources}
              onChange={(e) => setAvailableResources(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-brandgray-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">Save Changes</Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> {profile.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Organization Type</span>
                  <span className="font-semibold text-primary">{profile.orgType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Representative</span>
                  <span className="font-semibold text-primary">{profile.representativeName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Email</span>
                  <span className="font-medium text-brandgray-text">{profile.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Phone</span>
                  <span className="font-medium text-brandgray-text">{profile.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">HQ Location</span>
                  <span className="font-medium text-brandgray-text">{profile.location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brandgray-muted uppercase block">Website</span>
                  <a href={profile.website} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{profile.website}</a>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-brandgray-light/60">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">CSR Mandates & Focus Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.csrFocusAreas.map((area, i) => (
                    <span key={i} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-medium">
                      ✓ {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-brandgray-light/60">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">Technical Expertise & Capabilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.expertise.map((exp, i) => (
                    <span key={i} className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded font-medium">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-brandgray-light/60">
                <span className="text-[10px] font-bold text-brandgray-muted uppercase tracking-wider block">Available Partnership Resources</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.availableResources.map((res, i) => (
                    <span key={i} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded font-medium">
                      • {res}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brandgray-border shadow-subtle bg-white">
            <CardHeader className="p-5 border-b border-brandgray-border/60">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">
                CSR Partnership Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded space-y-1">
                <span className="font-bold text-[11px] uppercase block">Verification Status</span>
                <p className="font-bold text-emerald-800">✓ VERIFIED INDUSTRY PARTNER</p>
              </div>
              <p className="text-brandgray-muted leading-relaxed text-[11px]">
                Your organization is verified to submit CSR grants and technical mentorship requests for university research projects.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
