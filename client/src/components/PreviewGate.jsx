import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bubbling-preview-code';

export default function PreviewGate({ children }) {
  const requiredCode = import.meta.env.VITE_PREVIEW_ACCESS_CODE;
  const [accessGranted, setAccessGranted] = useState(!requiredCode);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requiredCode) {
      return;
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && saved === requiredCode) {
      setAccessGranted(true);
    }
  }, [requiredCode]);

  if (accessGranted) {
    return children;
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-gray-100 space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-charcoal">Private Preview</h1>
        <p className="text-sm text-gray-500">
          Enter the access code provided by the Bubbling Bath Delights team to explore the staging
          site.
        </p>
        <input
          type="password"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError('');
          }}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
          placeholder="Access code"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="button"
          onClick={() => {
            if (code === requiredCode) {
              window.localStorage.setItem(STORAGE_KEY, code);
              setAccessGranted(true);
            } else {
              setError('Invalid access code. Please try again.');
            }
          }}
          className="w-full rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#a696dd]"
        >
          Unlock preview
        </button>
      </div>
    </div>
  );
}
