import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { demoUsers } from '../data/demo';
import type { User, UserRole } from '../types';

type AuthContextValue = {
  session: Session | null;
  user: User;
  loading: boolean;
  mode: 'supabase' | 'demo';
  signIn: (email: string, password: string, role?: UserRole) => Promise<{ error: string | null }>;
  signInWithGoogle: (role?: UserRole) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string, role: UserRole, phone?: string, businessName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = 'raw:auth:user';

function readDemoUser(): User {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch { /* fall back */ }
  return demoUsers[0];
}

function saveDemoUser(user: User) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(user)); } catch { /* demo mode */ }
}

function fromProfile(profile: Record<string, unknown>, fallback: User): User {
  return {
    ...fallback,
    id: String(profile.id ?? fallback.id),
    name: String(profile.name ?? fallback.name),
    email: String(profile.email ?? fallback.email),
    phone: String(profile.phone ?? fallback.phone),
    location: String(profile.location ?? fallback.location),
    role: (profile.role as UserRole | undefined) ?? fallback.role,
    trustScore: Number(profile.trust_score ?? fallback.trustScore),
    verifiedPhone: Boolean(profile.verified_phone ?? fallback.verifiedPhone),
    verifiedEmail: Boolean(profile.verified_email ?? fallback.verifiedEmail),
    verifiedBusiness: Boolean(profile.verified_business ?? fallback.verifiedBusiness),
    successfulTransactions: Number(profile.successful_transactions ?? fallback.successfulTransactions),
    responseRate: Number(profile.response_rate ?? fallback.responseRate),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User>(() => readDemoUser());
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) {
        const { data: profile } = await supabase!.from('profiles').select('*').eq('id', data.session.user.id).maybeSingle();
        if (active && profile) setUser(fromProfile(profile, demoUsers[0]));
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        const { data: profile } = await supabase!.from('profiles').select('*').eq('id', nextSession.user.id).maybeSingle();
        if (profile) setUser(fromProfile(profile, demoUsers[0]));
      }
    });

    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    loading,
    mode: supabase ? 'supabase' : 'demo',
    signIn: async (email, password, role = 'DONOR') => {
      if (!supabase) {
        const match = demoUsers.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
        const demo = match ?? { ...demoUsers[0], email, name: email.split('@')[0] || 'RAW Member', role };
        saveDemoUser(demo);
        setUser(demo);
        return { error: null };
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    signInWithGoogle: async (role = 'DONOR') => {
      if (!supabase) {
        const demo = { ...demoUsers[0], id: `demo-google-${Date.now()}`, name: 'RAW Google User', role };
        saveDemoUser(demo);
        setUser(demo);
        return { error: null };
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + (role === 'SEEKER' ? '/seeker/marketplace' : '/donor/dashboard') },
      });
      return { error: error?.message ?? null };
    },
    signUp: async (name, email, password, role, phone = '', businessName = '') => {
      if (!supabase) {
        const demo = { ...demoUsers[0], id: `demo-${Date.now()}`, name, email, phone, role };
        saveDemoUser(demo);
        setUser(demo);
        return { error: null };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role, phone, business_name: businessName } },
      });
      if (!error && data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id, name, email, phone, role,
        });
        return { error: profileError?.message ?? null };
      }
      return { error: error?.message ?? null };
    },
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
      localStorage.removeItem(DEMO_KEY);
      setSession(null);
      setUser(demoUsers[0]);
    },
  }), [loading, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
