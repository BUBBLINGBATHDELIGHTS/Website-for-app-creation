import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'bubbles-workspace-access';

const WorkspaceAccessContext = createContext({
  hasAccess: false,
  profile: null,
  grantAccess: () => {},
  clearAccess: () => {}
});

export function WorkspaceAccessProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Unable to read workspace access ticket', error);
      return null;
    }
  });

  function grantAccess(nextProfile) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
  }

  function clearAccess() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    setProfile(null);
  }

  const value = useMemo(
    () => ({
      hasAccess: Boolean(profile),
      profile,
      grantAccess,
      clearAccess
    }),
    [profile]
  );

  return <WorkspaceAccessContext.Provider value={value}>{children}</WorkspaceAccessContext.Provider>;
}

export function useWorkspaceAccess() {
  return useContext(WorkspaceAccessContext);
}
