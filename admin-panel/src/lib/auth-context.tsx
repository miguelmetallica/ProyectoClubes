"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, AuthResponse } from "./api";

type Session = Omit<AuthResponse, "token">;

type AuthContextValue = {
  token: string | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "clubes-admin-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthResponse;
        // Hidratación de sesión desde localStorage: solo existe en el cliente, por eso
        // no puede resolverse en el render inicial (que también corre en el servidor).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(parsed.token);
        setSession(parsed);
      }
    } catch {
      // localStorage no disponible o dato corrupto: se ignora y queda deslogueado.
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const auth = await api.login(email, password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setToken(auth.token);
    setSession(auth);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setSession(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  return ctx;
}
