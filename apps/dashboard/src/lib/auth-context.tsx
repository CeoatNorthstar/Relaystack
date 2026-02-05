"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

interface User {
  id: string;
  email: string;
  name: string | null;
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    
    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      // Verify token and get user
      fetchUser(storedAccessToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${GATEWAY_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token invalid, try refresh
        await refreshAuth();
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("relaystack_api_key"); // Legacy key
  };

  const saveTokens = (access: string, refresh: string) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("relaystack_api_key", access); // For API compatibility
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${GATEWAY_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await res.json();
    saveTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${GATEWAY_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await res.json();
    saveTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    if (refreshToken) {
      try {
        await fetch(`${GATEWAY_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
    clearAuth();
  };

  const refreshAuth = useCallback(async () => {
    const currentRefreshToken = refreshToken || localStorage.getItem("refreshToken");
    
    if (!currentRefreshToken) {
      clearAuth();
      return;
    }

    try {
      const res = await fetch(`${GATEWAY_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        saveTokens(data.accessToken, data.refreshToken);
        await fetchUser(data.accessToken);
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      clearAuth();
    }
  }, [refreshToken]);

  // Auto-refresh token before expiry (every 10 minutes)
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      refreshAuth();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken, refreshAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
