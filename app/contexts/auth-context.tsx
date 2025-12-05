import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { authService, type LoginResponse } from "~/services/auth.service";
import { apiClient } from "~/services/api-client";
import { ROUTES } from "~/routes.config";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  mainUser: boolean;
  companyId: string;
  permissions: unknown;
  company: unknown;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  login: (loginResponse: LoginResponse) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshTokens: () => Promise<void>;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

function loadUserFromStorage(): AuthUser | null {
  if (globalThis.window === undefined) {
    return null;
  }
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) {
    return null;
  }
  try {
    return JSON.parse(userData) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => loadUserFromStorage());

  // Set up API client callbacks for token refresh
  useEffect(() => {
    apiClient.setTokenRefreshCallback(async (refreshToken: string) => {
      return await authService.refreshToken(refreshToken);
    });

    apiClient.setOnTokenRefreshCallback((tokens) => {
      // Update stored tokens
      if (globalThis.window !== undefined) {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      }
    });

    apiClient.setOnAuthFailureCallback(() => {
      // Clear all auth data and redirect to login
      if (globalThis.window !== undefined) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
      }
      setCurrentUser(null);
      navigate(ROUTES.LOGIN, { replace: true });
    });
  }, [navigate]);

  // Load tokens into API client on mount
  useEffect(() => {
    if (globalThis.window !== undefined) {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (accessToken) {
        apiClient.setAccessToken(accessToken);
      }
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken);
      }
    }
  }, []);

  const login = useCallback((loginResponse: LoginResponse) => {
    if (globalThis.window !== undefined) {
      localStorage.setItem(ACCESS_TOKEN_KEY, loginResponse.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, loginResponse.refresh_token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(loginResponse.user));
      apiClient.setAccessToken(loginResponse.access_token);
      apiClient.setRefreshToken(loginResponse.refresh_token);
    }
    setCurrentUser(loginResponse.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = apiClient.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      // Even if logout fails, clear local data
      console.error("Logout error:", error);
    } finally {
      // Clear all local auth data
      if (globalThis.window !== undefined) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
      }
      apiClient.clearTokens();
      setCurrentUser(null);
      // Navigate to login page after logout
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [navigate]);

  const refreshTokens = useCallback(async () => {
    const refreshToken = apiClient.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const tokens = await authService.refreshToken(refreshToken);
    if (globalThis.window !== undefined) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      apiClient.setAccessToken(tokens.access_token);
      apiClient.setRefreshToken(tokens.refresh_token);
    }
  }, []);

  const getAccessToken = useCallback(() => {
    return apiClient.getAccessToken();
  }, []);

  const getRefreshToken = useCallback(() => {
    return apiClient.getRefreshToken();
  }, []);

  const isAuthenticated = currentUser !== null;

  const contextValue = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      isAuthenticated,
      refreshTokens,
      getAccessToken,
      getRefreshToken,
    }),
    [currentUser, login, logout, isAuthenticated, refreshTokens, getAccessToken, getRefreshToken]
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
