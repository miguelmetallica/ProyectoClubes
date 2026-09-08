import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api, AuthResponse } from "./api";

type Session = Omit<AuthResponse, "token">;

type AuthContextValue = {
  token: string | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string, telefono?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "clubes-cliente-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as AuthResponse;
        setToken(parsed.token);
        setSession(parsed);
      })
      .catch(() => {
        // Storage no disponible o dato corrupto: se ignora y queda deslogueado.
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (auth: AuthResponse) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setToken(auth.token);
    setSession(auth);
  };

  const login = async (email: string, password: string) => {
    const auth = await api.login(email, password);
    await persist(auth);
  };

  const register = async (nombre: string, email: string, password: string, telefono?: string) => {
    const auth = await api.register(nombre, email, password, telefono);
    await persist(auth);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ token, session, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  return ctx;
}
