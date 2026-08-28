'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'CITIZEN' | 'UNIVERSITY' | 'INDUSTRY' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  status?: string;
  orgName?: string | null;
  orgDetails?: string | null;
  profile?: Record<string, any>;
}

export interface SignupPayload {
  role: 'CITIZEN' | 'UNIVERSITY' | 'INDUSTRY';
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  // Citizen
  state?: string;
  district?: string;
  addressLine1?: string;
  pincode?: string;
  // University
  universityName?: string;
  institutionType?: string;
  accreditationId?: string;
  // Industry
  organizationName?: string;
  organizationType?: string;
  companyCin?: string;
  csrId?: string;
  csrFocusAreas?: string;
  geographicFocus?: string;
  technicalExpertise?: string;
  // Shared Address/Others
  addressLine2?: string;
  website?: string;
  isManualUniversity?: boolean;
  isManualCompany?: boolean;
  designation?: string;
  department?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>;
  signup: (data: SignupPayload) => Promise<{ success?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const ROLE_REDIRECT: Record<UserRole, string> = {
  CITIZEN: '/citizen',
  UNIVERSITY: '/university/dashboard',
  INDUSTRY: '/industry/dashboard',
  ADMIN: '/admin',
};

const defaultContext: AuthContextValue = {
  user: null,
  loading: true,
  login: async () => ({ success: false, error: 'Not initialized' }),
  signup: async () => ({ success: false, error: 'Not initialized' }),
  logout: async () => {},
  refreshUser: async () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };
      
      // Set user directly from login response — avoids a race condition where
      // calling refreshUser() immediately fires /api/auth/me before the browser
      // has committed the Set-Cookie header from this response to the cookie jar.
      const loggedInUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as UserRole,
        orgName: data.user.orgName ?? null,
        orgDetails: data.user.orgDetails ?? null,
      };
      setUser(loggedInUser);
      setLoading(false);
      
      const role = data.user.role as UserRole;
      router.push(ROLE_REDIRECT[role] || '/');
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, [router]);

  const signup = useCallback(async (signupData: SignupPayload) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      // Set user directly from signup response — avoids the same Set-Cookie race condition
      const signedUpUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as UserRole,
        orgName: data.user.orgName ?? null,
        orgDetails: data.user.orgDetails ?? null,
      };
      setUser(signedUpUser);
      setLoading(false);

      const role = data.user.role as UserRole;
      router.push(ROLE_REDIRECT[role] || '/');
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
