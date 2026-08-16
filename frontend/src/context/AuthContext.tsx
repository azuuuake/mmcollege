import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "../services/api";
import type { Role, User } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    email: string;
    password: string;
    role: Exclude<Role, "ADMIN">;
    firstName?: string;
    lastName?: string;
    businessName?: string;
  }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = localStorage.getItem("mmconnect.token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("mmconnect.token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("mmconnect.token", data.token);
        setUser(data.user);
        return data.user as User;
      },
      async register(input) {
        const { data } = await api.post("/auth/register", input);
        localStorage.setItem("mmconnect.token", data.token);
        setUser(data.user);
        return data.user as User;
      },
      logout() {
        localStorage.removeItem("mmconnect.token");
        setUser(null);
        void api.post("/auth/logout").catch(() => undefined);
      },
      refresh
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
