import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { demoUsers } from '../data/demo';
import type { User, UserRole } from '../types';
import { getProfile, updateProfile } from '../services/api';

type AuthResult = { error: string | null; message?: string };
type AuthContextValue = {
  session: Session | null;
  user: User;
  loading: boolean;
  mode: 'supabase' | 'demo';
  signIn: (email: string, password: string, role?: UserRole) => Promise<AuthResult>;
  signInWithGoogle: (role?: UserRole) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string, role: UserRole, phone?: string, businessName?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = 'raw:auth:user';
const OAUTH_ROLE_KEY = 'raw:oauth:role';

function readDemoUser(): User {
  try { const raw = localStorage.getItem(DEMO_KEY); if (raw) return JSON.parse(raw) as User; } catch { /* fallback */ }
  return demoUsers[0];
}
function saveDemoUser(user: User) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(user)); } catch { /* best effort */ } }
function fromProfile(profile: Record<string, unknown>, fallback: User): User {
  return {
    ...fallback,
    id: String(profile.id ?? fallback.id), name: String(profile.name ?? fallback.name), email: String(profile.email ?? fallback.email), phone: String(profile.phone ?? fallback.phone),
    location: String(profile.location ?? fallback.location), role: (profile.role as UserRole | undefined) ?? fallback.role,
    trustScore: Number(profile.trust_score ?? fallback.trustScore), verifiedPhone: Boolean(profile.verified_phone ?? fallback.verifiedPhone), verifiedEmail: Boolean(profile.verified_email ?? fallback.verifiedEmail),
    verifiedBusiness: Boolean(profile.verified_business ?? fallback.verifiedBusiness), successfulTransactions: Number(profile.successful_transactions ?? fallback.successfulTransactions), responseRate: Number(profile.response_rate ?? fallback.responseRate),
  };
}

async function syncProfile(roleHint?: 'DONOR' | 'SEEKER', patch?: Record<string, unknown>) {
  if (!supabase) return null;
  const result = await getProfile();
  if (result.data?.profile) {
    const profile = result.data.profile;
    if (roleHint && (profile.role !== roleHint)) {
      const updated = await updateProfile({ role: roleHint, ...patch });
      return updated.data?.profile ?? profile;
    }
    if (patch && Object.keys(patch).length) {
      const updated = await updateProfile(patch);
      return updated.data?.profile ?? profile;
    }
    return profile;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User>(() => readDemoUser());
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;
    const hydrate = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession?.user) { setLoading(false); return; }
      let oauthRole: 'DONOR' | 'SEEKER' | undefined;
      try { const value = sessionStorage.getItem(OAUTH_ROLE_KEY); if (value === 'DONOR' || value === 'SEEKER') oauthRole = value; } catch { /* optional */ }
      const metadata = nextSession.user.user_metadata || {};
      const fallbackRole: 'DONOR' | 'SEEKER' = oauthRole || (metadata.role === 'SEEKER' ? 'SEEKER' : 'DONOR');
      const patch: Record<string, unknown> = { role: fallbackRole };
      if (metadata.name || metadata.full_name) patch.name = metadata.name || metadata.full_name;
      if (metadata.phone) patch.phone = metadata.phone;
      const profile = await syncProfile(fallbackRole, patch);
      if (active && profile) setUser(fromProfile(profile, { ...demoUsers[0], id: nextSession.user.id, email: nextSession.user.email || '', role: fallbackRole, name: String(patch.name || 'RAW Member'), phone: String(patch.phone || '') }));
      try { sessionStorage.removeItem(OAUTH_ROLE_KEY); } catch { /* optional */ }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => void hydrate(data.session)).catch(() => setLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { void hydrate(nextSession); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session, user, loading, mode: supabase ? 'supabase' : 'demo',
    signIn: async (email, password, role = 'DONOR') => {
      if (!supabase) { const demo = { ...demoUsers[0], id: `demo-${Date.now()}`, email, name: email.split('@')[0] || 'RAW Member', role }; saveDemoUser(demo); setUser(demo); return { error: null }; }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    signInWithGoogle: async (role = 'DONOR') => {
      if (!supabase) { const demo = { ...demoUsers[0], id: `demo-google-${Date.now()}`, name: 'RAW Google User', role }; saveDemoUser(demo); setUser(demo); return { error: null }; }
      try { sessionStorage.setItem(OAUTH_ROLE_KEY, role); } catch { /* optional */ }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${role === 'SEEKER' ? '/seeker/marketplace' : '/donor/dashboard'}`, queryParams: { prompt: 'select_account' } },
      });
      return { error: error?.message ?? null };
    },
    signUp: async (name, email, password, role, phone = '', businessName = '') => {
      if (!supabase) { const demo = { ...demoUsers[0], id: `demo-${Date.now()}`, name, email, phone, role }; saveDemoUser(demo); setUser(demo); return { error: null }; }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, role, phone, business_name: businessName } } });
      if (error) return { error: error.message };
      if (!data.session) return { error: null, message: 'Account created. Check your email to confirm the account, then sign in.' };
      const profile = await syncProfile(role, { name, phone, role, business_name: businessName });
      if (profile) setUser(fromProfile(profile, { ...demoUsers[0], id: data.user?.id || demoUsers[0].id, name, email, phone, role }));
      return { error: null };
    },
    signOut: async () => { if (supabase) await supabase.auth.signOut(); localStorage.removeItem(DEMO_KEY); setSession(null); setUser(demoUsers[0]); },
  }), [loading, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
