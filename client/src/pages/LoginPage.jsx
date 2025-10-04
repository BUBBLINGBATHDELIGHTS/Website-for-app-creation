import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [role, navigate]);

  const redirectTo = location.state?.from?.pathname || (role === 'admin' ? '/admin' : '/');

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password
      });

      if (signInError) {
        throw signInError;
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-lavender to-mint text-white font-semibold">
            B
          </div>
          <h1 className="text-xl font-semibold text-charcoal">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to access your boutique dashboard.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-lavender focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formState.password}
              onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-lavender focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a696dd] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">
          Need an account? Invite your team from the Supabase dashboard and assign <span className="font-semibold text-lavender">role = admin</span> to grant access.
        </p>
      </div>
    </div>
  );
}
