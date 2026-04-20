import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'cmpe132-library-auth';

const AuthContext = createContext(null);

function getInitialState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, role: null, displayName: null };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { token: null, role: null, displayName: null };
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(getInitialState);

  const login = (payload) => {
    const next = {
      token: payload.access_token,
      role: payload.role,
      displayName: payload.display_name,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, role: null, displayName: null });
  };

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      login,
      logout,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
