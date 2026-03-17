import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const signIn = (userData) => {
    // Save JWT token separately, save user info separately
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    const { token, ...userInfo } = userData;
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
