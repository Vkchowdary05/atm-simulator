import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('atm_token');
    const accountNumber = localStorage.getItem('atm_accountNumber');
    const fullName = localStorage.getItem('atm_fullName');
    return { token, accountNumber, fullName };
  });
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    const reset = () => setIdleSeconds(0);
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('click', reset);
    window.addEventListener('touchstart', reset);
    const interval = setInterval(() => setIdleSeconds((value) => value + 1), 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('click', reset);
      window.removeEventListener('touchstart', reset);
    };
  }, []);

  useEffect(() => {
    if (!authState.token) return;
    if (idleSeconds === 60) setShowTimeoutWarning(true);
    if (idleSeconds >= 80) {
      logout();
    }
  }, [idleSeconds, authState.token]);

  const login = ({ token, accountNumber, fullName }) => {
    localStorage.setItem('atm_token', token);
    localStorage.setItem('atm_accountNumber', accountNumber);
    localStorage.setItem('atm_fullName', fullName);
    setAuthState({ token, accountNumber, fullName });
    setIdleSeconds(0);
    setShowTimeoutWarning(false);
  };

  const logout = () => {
    localStorage.removeItem('atm_token');
    localStorage.removeItem('atm_accountNumber');
    localStorage.removeItem('atm_fullName');
    setAuthState({ token: null, accountNumber: null, fullName: null });
    setShowTimeoutWarning(false);
    window.location.href = '/';
  };

  const value = useMemo(
    () => ({ authState, login, logout, showTimeoutWarning, setShowTimeoutWarning }),
    [authState, showTimeoutWarning]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export const getAuthToken = () => localStorage.getItem('atm_token');
export const logout = () => {
  localStorage.removeItem('atm_token');
  localStorage.removeItem('atm_accountNumber');
  localStorage.removeItem('atm_fullName');
};
