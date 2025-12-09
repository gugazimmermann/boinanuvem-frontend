import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import { authService } from "~/services/auth.service";
import { apiClient } from "~/services/api-client";
import { ROUTES } from "~/routes.config";
import { useNavigate } from "react-router";
import userEvent from "@testing-library/user-event";

// Mock dependencies
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("~/services/auth.service");
vi.mock("~/services/api-client");

// Test component that uses the auth hook
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="is-authenticated">{auth.isAuthenticated ? "true" : "false"}</div>
      <div data-testid="current-user">{auth.currentUser?.email || "null"}</div>
      <div data-testid="access-token">{auth.getAccessToken() || "null"}</div>
      <div data-testid="refresh-token">{auth.getRefreshToken() || "null"}</div>
      <button onClick={() => auth.login(mockLoginResponse)}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.refreshTokens()}>Refresh</button>
    </div>
  );
}

// Mock data
const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  mainUser: true,
  companyId: "company-1",
  permissions: {},
  company: {},
};

const mockLoginResponse = {
  access_token: "access-token-123",
  refresh_token: "refresh-token-456",
  user: mockUser,
};

const mockRefreshTokens = {
  access_token: "new-access-token-789",
  refresh_token: "new-refresh-token-012",
};

describe("AuthContext", () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    length: number;
    key: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock as Storage,
      writable: true,
    });

    // Setup navigate mock
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Reset mocks
    vi.clearAllMocks();
    vi.mocked(authService.logout).mockResolvedValue({ message: "Logged out" });
    vi.mocked(authService.refreshToken).mockResolvedValue(mockRefreshTokens);
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe("AuthProvider", () => {
    it("should render children", () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should initialize with user from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "user_data") {
          return JSON.stringify(mockUser);
        }
        if (key === "access_token") {
          return "stored-access-token";
        }
        if (key === "refresh_token") {
          return "stored-refresh-token";
        }
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("current-user")).toHaveTextContent("test@example.com");
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    });

    it("should initialize with null user when localStorage is empty", () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("current-user")).toHaveTextContent("null");
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "user_data") {
          return "invalid-json{";
        }
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("current-user")).toHaveTextContent("null");
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });

    it("should set up API client callbacks on mount", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(apiClient.setTokenRefreshCallback).toHaveBeenCalled();
        expect(apiClient.setOnTokenRefreshCallback).toHaveBeenCalled();
        expect(apiClient.setOnAuthFailureCallback).toHaveBeenCalled();
      });
    });

    it("should load tokens into API client on mount", async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "access_token") {
          return "stored-access-token";
        }
        if (key === "refresh_token") {
          return "stored-refresh-token";
        }
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(apiClient.setAccessToken).toHaveBeenCalledWith("stored-access-token");
        expect(apiClient.setRefreshToken).toHaveBeenCalledWith("stored-refresh-token");
      });
    });
  });

  describe("useAuth hook", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });

    it("should return auth context when used within provider", () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("is-authenticated")).toBeInTheDocument();
      expect(screen.getByTestId("current-user")).toBeInTheDocument();
    });
  });

  describe("login function", () => {
    it("should store tokens and user data in localStorage", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "access-token-123");
        expect(localStorageMock.setItem).toHaveBeenCalledWith("refresh_token", "refresh-token-456");
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "user_data",
          JSON.stringify(mockUser)
        );
      });
    });

    it("should update API client with tokens", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(apiClient.setAccessToken).toHaveBeenCalledWith("access-token-123");
        expect(apiClient.setRefreshToken).toHaveBeenCalledWith("refresh-token-456");
      });
    });

    it("should update current user state", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("current-user")).toHaveTextContent("test@example.com");
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });
    });
  });

  describe("logout function", () => {
    it("should call authService.logout with refresh token", async () => {
      const user = userEvent.setup();

      vi.mocked(apiClient.getRefreshToken).mockReturnValue("refresh-token-456");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // First login to set up state
      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });

      // Then logout
      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalledWith("refresh-token-456");
      });
    });

    it("should clear localStorage on logout", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });

      // Logout
      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("refresh_token");
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_data");
      });
    });

    it("should clear API client tokens on logout", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });

      // Logout
      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(apiClient.clearTokens).toHaveBeenCalled();
      });
    });

    it("should update current user to null on logout", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });

      // Logout
      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId("current-user")).toHaveTextContent("null");
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
      });
    });

    it("should navigate to login page on logout", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });

      // Logout
      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true });
      });
    });

    it("should handle logout error gracefully", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.mocked(authService.logout).mockRejectedValue(new Error("Logout failed"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });

      // Logout
      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        // Should still clear local data even if logout fails
        expect(localStorageMock.removeItem).toHaveBeenCalled();
        expect(apiClient.clearTokens).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it("should logout even when no refresh token exists", async () => {
      const user = userEvent.setup();

      vi.mocked(apiClient.getRefreshToken).mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });

      // Logout
      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        // Should not call logout service but still clear local data
        expect(authService.logout).not.toHaveBeenCalled();
        expect(localStorageMock.removeItem).toHaveBeenCalled();
      });
    });
  });

  describe("refreshTokens function", () => {
    it("should refresh tokens successfully", async () => {
      const user = userEvent.setup();

      vi.mocked(apiClient.getRefreshToken).mockReturnValue("refresh-token-456");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const refreshButton = screen.getByText("Refresh");
      await user.click(refreshButton);

      await waitFor(() => {
        expect(authService.refreshToken).toHaveBeenCalledWith("refresh-token-456");
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "access_token",
          "new-access-token-789"
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "refresh_token",
          "new-refresh-token-012"
        );
        expect(apiClient.setAccessToken).toHaveBeenCalledWith("new-access-token-789");
        expect(apiClient.setRefreshToken).toHaveBeenCalledWith("new-refresh-token-012");
      });
    });

    it("should throw error when no refresh token available", async () => {
      vi.mocked(apiClient.getRefreshToken).mockReturnValue(null);

      // Create a test component that catches the error
      let caughtError: Error | null = null;
      function TestComponentWithErrorHandler() {
        const auth = useAuth();
        const handleRefresh = async () => {
          try {
            await auth.refreshTokens();
          } catch (error) {
            caughtError = error as Error;
          }
        };
        return (
          <div>
            <button onClick={handleRefresh}>Refresh</button>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponentWithErrorHandler />
        </AuthProvider>
      );

      const user = userEvent.setup();
      const refreshButton = screen.getByText("Refresh");
      await user.click(refreshButton);

      await waitFor(() => {
        expect(caughtError).not.toBeNull();
        expect(caughtError?.message).toBe("No refresh token available");
      });

      expect(authService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe("getAccessToken and getRefreshToken", () => {
    it("should return tokens from API client", () => {
      vi.mocked(apiClient.getAccessToken).mockReturnValue("test-access-token");
      vi.mocked(apiClient.getRefreshToken).mockReturnValue("test-refresh-token");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("access-token")).toHaveTextContent("test-access-token");
      expect(screen.getByTestId("refresh-token")).toHaveTextContent("test-refresh-token");
    });

    it("should return null when tokens are not available", () => {
      vi.mocked(apiClient.getAccessToken).mockReturnValue(null);
      vi.mocked(apiClient.getRefreshToken).mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("access-token")).toHaveTextContent("null");
      expect(screen.getByTestId("refresh-token")).toHaveTextContent("null");
    });
  });

  describe("isAuthenticated", () => {
    it("should be false when currentUser is null", () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });

    it("should be true when currentUser exists", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText("Login");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      });
    });
  });

  describe("API client callbacks", () => {
    it("should handle auth failure callback", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(apiClient.setOnAuthFailureCallback).toHaveBeenCalled();
      });

      // Get the callback that was set
      const setOnAuthFailureCallback = vi.mocked(apiClient.setOnAuthFailureCallback);
      const callback = setOnAuthFailureCallback.mock.calls[0][0];

      // Call the callback
      callback();

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("refresh_token");
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("user_data");
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true });
      });
    });

    it("should handle token refresh callback", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(apiClient.setOnTokenRefreshCallback).toHaveBeenCalled();
      });

      // Get the callback that was set
      const setOnTokenRefreshCallback = vi.mocked(apiClient.setOnTokenRefreshCallback);
      const callback = setOnTokenRefreshCallback.mock.calls[0][0];

      // Call the callback
      callback(mockRefreshTokens);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "access_token",
          "new-access-token-789"
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "refresh_token",
          "new-refresh-token-012"
        );
      });
    });
  });
});
