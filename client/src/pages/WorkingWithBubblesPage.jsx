import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useWorkspaceAccess } from '../context/WorkspaceAccessContext.jsx';

export default function WorkingWithBubblesPage() {
  const [mode, setMode] = useState('admin');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAccess, grantAccess, clearAccess } = useWorkspaceAccess();

  useEffect(() => {
    setStatus(null);
    setError(null);
  }, [mode, email]);

  async function handleValidate(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/access/validate', { email, role: mode });
      grantAccess(response.data);
      setStatus({ type: 'success', message: 'Access confirmed. Continue to sign in below.' });
    } catch (err) {
      clearAccess();
      if (err.response?.status === 404) {
        setStatus({ type: 'info', message: 'Request access below and the leadership team will approve your invite.' });
      } else {
        setStatus({ type: 'error', message: err.message || 'Unable to validate access' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegistration(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/access/registrations', { email, role: mode });
      setStatus({
        type: 'info',
        message:
          response.data.status === 'pending'
            ? 'Registration received. Watch your inbox for an approval email from leadership.'
            : 'Registration updated. Contact leadership if you need the status changed.'
      });
    } catch (err) {
      setError(err.message || 'Unable to submit registration');
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    const redirect = location.state?.from?.pathname || (mode === 'employee' ? '/employee' : '/admin');
    navigate('/login', { state: { from: { pathname: redirect } } });
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-lavender to-mint text-white font-semibold">
            B
          </div>
          <h1 className="text-2xl font-semibold text-charcoal">Working with Bubbles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Secure entry point for Bubbling Bath Delights admins and employees.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleValidate}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-lavender focus:outline-none"
              placeholder="you@bubblingbathdelights.com"
              required
            />
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-600">Portal</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'admin', label: 'Admin console' },
                { value: 'employee', label: 'Fulfillment dashboard' }
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    mode === option.value
                      ? 'border-lavender bg-lavender text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-lavender'
                  }`}
                  onClick={() => setMode(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {status ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'bg-mint/10 text-mint'
                  : status.type === 'error'
                  ? 'bg-red-50 text-red-500'
                  : 'bg-lavender/10 text-lavender'
              }`}
            >
              {status.message}
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a696dd] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Checking…' : 'Verify access'}
            </button>
            <button
              type="button"
              onClick={handleRegistration}
              className="w-full rounded-2xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-lavender hover:text-lavender"
            >
              Request approval
            </button>
          </div>
        </form>

        {hasAccess ? (
          <div className="mt-6 rounded-2xl bg-mint/10 p-4 text-sm text-mint">
            <p className="font-semibold">Access confirmed</p>
            <p className="mt-1 text-mint/80">
              Continue to sign in using your Supabase credentials. Use the security-approved devices only.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-mint px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6FA897]"
              onClick={handleContinue}
            >
              Continue to login
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
