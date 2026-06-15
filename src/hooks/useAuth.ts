import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  session: Session | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    session: null,
  });

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately on subscribe —
    // no separate getSession() needed, which avoids a race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user, session);
      } else {
        setState({ user: null, profile: null, role: null, loading: false, session: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(user: User, session: Session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setState({
      user,
      profile,
      role: (profile?.role as UserRole) ?? 'guest',
      loading: false,
      session,
    });
  }

  return state;
}

// Sign in with magic link
export const signInWithEmail = (email: string) =>
  supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/host/dashboard` } });

// Sign in with email + password
export const signInWithPassword = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

// Sign up
export const signUp = (email: string, password: string, fullName: string) =>
  supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

// Sign out
export const signOut = () => supabase.auth.signOut();
