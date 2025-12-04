import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";
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

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (globalThis.window !== undefined) {
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

  const login = useCallback((userId: string) => {
    setCurrentUserId(userId);
  }, []);

  const logout = useCallback(() => {
    setCurrentUserId(null);
  }, []);

  const isAuthenticated = currentUser !== null;

  const contextValue = useMemo(
    () => ({ currentUser, login, logout, isAuthenticated }),
    [currentUser, login, logout, isAuthenticated]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
