import React, { createContext, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

const AUTH_STORAGE_KEY = 'soulstone.auth';

const loadAuthFromStorage = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null };
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('auth.storage.read_error', error);
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children = null }) => {
  const [state, setState] = useState(() => loadAuthFromStorage());

  const login = useCallback((token, user) => {
    setState({ token, user });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(state.token),
      token: state.token,
      user: state.user,
      login,
      logout,
    }),
    [login, logout, state.token, state.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
