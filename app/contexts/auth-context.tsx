import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { TeamUser } from "~/types";
import { getUserById } from "~/services/users.service";

interface AuthContextType {
  currentUser: TeamUser | null;
  login: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_ID_KEY = "currentUserId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(CURRENT_USER_ID_KEY);
    }
    return null;
  });

  const currentUser = useMemo<TeamUser | null>(() => {
    if (currentUserId) {
      return getUserById(currentUserId) || null;
    }
    return null;
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(CURRENT_USER_ID_KEY, currentUserId);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }
  }, [currentUserId]);

  const login = (userId: string) => {
    setCurrentUserId(userId);
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
