import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootSession = async () => {
    const access = localStorage.getItem("access");
    if (!access) {
      setLoading(false);
      return;
    }
    try {
      const response = await authAPI.me();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootSession();
  }, []);

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    const { user: loggedInUser, tokens } = response.data;
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => authAPI.register(payload);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser: bootSession,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
