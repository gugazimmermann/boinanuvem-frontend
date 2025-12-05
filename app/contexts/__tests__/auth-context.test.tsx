import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { AuthProvider, useAuth } from "../auth-context";
import { authService } from "~/services/auth.service";
import { apiClient } from "~/services/api-client";
import type { LoginResponse } from "~/services/auth.service";

// Mock the auth service
vi.mock("~/services/auth.service", () => ({
  authService: {
    refreshToken: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock the API client
vi.mock("~/services/api-client", () => ({
  apiClient: {
    setTokenRefreshCallback: vi.fn(),
    setOnTokenRefreshCallback: vi.fn(),
    setOnAuthFailureCallback: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe("AuthContext", () => {
  const mockUser = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "gugazimmermann@gmail.com",
    name: "Guga Zimmermann",
    mainUser: true,
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    permissions: {},
    company: {},
  };

  const mockLoginResponse: LoginResponse = {
    access_token: "access-token-123",
    refresh_token: "refresh-token-456",
    user: mockUser,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(apiClient.getAccessToken).mockReturnValue(null);
    vi.mocked(apiClient.getRefreshToken).mockReturnValue(null);
  });

  describe("AuthProvider", () => {
    it("should render children correctly", () => {
      const { container } = render(
        <TestWrapper>
          <div>Test Content</div>
        </TestWrapper>
      );

      expect(container.textContent).toBe("Test Content");
    });

    it("should initialize with null user when no localStorage value", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should initialize from localStorage if present", () => {
      localStorage.setItem("user_data", JSON.stringify(mockUser));
      localStorage.setItem("access_token", "access-token-123");
      localStorage.setItem("refresh_token", "refresh-token-456");

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should set up API client callbacks on mount", () => {
      renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(apiClient.setTokenRefreshCallback).toHaveBeenCalled();
      expect(apiClient.setOnTokenRefreshCallback).toHaveBeenCalled();
      expect(apiClient.setOnAuthFailureCallback).toHaveBeenCalled();
    });

    it("should load tokens into API client on mount", () => {
      localStorage.setItem("access_token", "access-token-123");
      localStorage.setItem("refresh_token", "refresh-token-456");

      renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(apiClient.setAccessToken).toHaveBeenCalledWith("access-token-123");
      expect(apiClient.setRefreshToken).toHaveBeenCalledWith("refresh-token-456");
    });
  });

  describe("useAuth", () => {
    it("should return correct context values", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current).toHaveProperty("currentUser");
      expect(result.current).toHaveProperty("login");
      expect(result.current).toHaveProperty("logout");
      expect(result.current).toHaveProperty("isAuthenticated");
      expect(result.current).toHaveProperty("refreshTokens");
      expect(result.current).toHaveProperty("getAccessToken");
      expect(result.current).toHaveProperty("getRefreshToken");
      expect(typeof result.current.login).toBe("function");
      expect(typeof result.current.logout).toBe("function");
      expect(typeof result.current.isAuthenticated).toBe("boolean");
    });

    it("should throw error when used outside provider", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let error: Error | undefined;
      try {
        renderHook(() => useAuth());
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toContain("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });

    it("should have isAuthenticated as false when no user", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should have isAuthenticated as true when user exists", () => {
      localStorage.setItem("user_data", JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("login", () => {
    it("should store tokens and user data on login", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentUser).toBeNull();

      act(() => {
        result.current.login(mockLoginResponse);
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem("access_token")).toBe("access-token-123");
      expect(localStorage.getItem("refresh_token")).toBe("refresh-token-456");
      expect(localStorage.getItem("user_data")).toBe(JSON.stringify(mockUser));
      expect(apiClient.setAccessToken).toHaveBeenCalledWith("access-token-123");
      expect(apiClient.setRefreshToken).toHaveBeenCalledWith("refresh-token-456");
    });

    it("should update currentUser when logging in", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentUser).toBeNull();

      act(() => {
        result.current.login(mockLoginResponse);
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });
    });
  });

  describe("logout", () => {
    it("should clear tokens and user data on logout", async () => {
      localStorage.setItem("access_token", "access-token-123");
      localStorage.setItem("refresh_token", "refresh-token-456");
      localStorage.setItem("user_data", JSON.stringify(mockUser));

      vi.mocked(apiClient.getRefreshToken).mockReturnValue("refresh-token-456");
      vi.mocked(authService.logout).mockResolvedValue({ message: "Logout successful" });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
      expect(localStorage.getItem("user_data")).toBeNull();
      expect(apiClient.clearTokens).toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalledWith("refresh-token-456");
    });

    it("should handle logout when already logged out", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentUser).toBeNull();

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should clear local data even if backend logout fails", async () => {
      localStorage.setItem("access_token", "access-token-123");
      localStorage.setItem("refresh_token", "refresh-token-456");
      localStorage.setItem("user_data", JSON.stringify(mockUser));

      vi.mocked(apiClient.getRefreshToken).mockReturnValue("refresh-token-456");
      vi.mocked(authService.logout).mockRejectedValue(new Error("Network error"));

      // Suppress console.error for this test since we're testing error handling
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.currentUser).toBeNull();
      });

      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
      expect(localStorage.getItem("user_data")).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe("refreshTokens", () => {
    it("should refresh tokens successfully", async () => {
      localStorage.setItem("refresh_token", "refresh-token-456");
      vi.mocked(apiClient.getRefreshToken).mockReturnValue("refresh-token-456");
      vi.mocked(authService.refreshToken).mockResolvedValue({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.refreshTokens();
      });

      expect(authService.refreshToken).toHaveBeenCalledWith("refresh-token-456");
      expect(localStorage.getItem("access_token")).toBe("new-access-token");
      expect(localStorage.getItem("refresh_token")).toBe("new-refresh-token");
      expect(apiClient.setAccessToken).toHaveBeenCalledWith("new-access-token");
      expect(apiClient.setRefreshToken).toHaveBeenCalledWith("new-refresh-token");
    });

    it("should throw error on refresh failure", async () => {
      localStorage.setItem("refresh_token", "refresh-token-456");
      vi.mocked(apiClient.getRefreshToken).mockReturnValue("refresh-token-456");
      vi.mocked(authService.refreshToken).mockRejectedValue(new Error("Invalid token"));

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await expect(
        act(async () => {
          await result.current.refreshTokens();
        })
      ).rejects.toThrow("Invalid token");
    });
  });

  describe("token getters", () => {
    it("should get access token", () => {
      vi.mocked(apiClient.getAccessToken).mockReturnValue("access-token-123");

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.getAccessToken()).toBe("access-token-123");
    });

    it("should get refresh token", () => {
      vi.mocked(apiClient.getRefreshToken).mockReturnValue("refresh-token-456");

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.getRefreshToken()).toBe("refresh-token-456");
    });
  });

  describe("localStorage persistence", () => {
    it("should persist user data across re-renders", async () => {
      localStorage.setItem("user_data", JSON.stringify(mockUser));
      localStorage.setItem("access_token", "access-token-123");
      localStorage.setItem("refresh_token", "refresh-token-456");

      const { result, rerender } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });

      rerender();

      expect(result.current.currentUser).toEqual(mockUser);
      expect(localStorage.getItem("user_data")).toBe(JSON.stringify(mockUser));
    });
  });
});
