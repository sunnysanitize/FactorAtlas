"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logIn, signUp } from "@/lib/api/auth";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth/token";
import type { AuthUser } from "@/lib/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    getMe()
      .then((me) => setUser(me))
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAuthSuccess = (token: string, nextUser: AuthUser) => {
    setStoredToken(token);
    setUser(nextUser);
    router.push("/dashboard");
  };

  const value: AuthContextValue = {
    user,
    loading,
    async login(email: string, password: string) {
      const response = await logIn(email, password);
      handleAuthSuccess(response.access_token, response.user);
    },
    async signup(email: string, password: string) {
      const response = await signUp(email, password);
      handleAuthSuccess(response.access_token, response.user);
    },
    logout() {
      clearStoredToken();
      setUser(null);
      router.push("/auth");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
