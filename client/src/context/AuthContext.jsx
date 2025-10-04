import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import supabase from '../lib/supabaseClient.js';

const AuthContext = createContext({
  user: null,
  role: 'guest',
  session: null,
  loading: true
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadInitialSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!mounted) return;
        if (sessionError) {
          throw sessionError;
        }
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch session'));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    loadInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const role = user?.app_metadata?.role || user?.user_metadata?.role || 'customer';
    return {
      user,
      role: user ? role : 'guest',
      session,
      loading,
      error,
      signOut: () => supabase.auth.signOut()
    };
  }, [user, session, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
