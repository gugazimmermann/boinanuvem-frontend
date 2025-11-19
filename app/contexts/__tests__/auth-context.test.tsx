import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import type { TeamUser } from "~/types";

const mockUser: TeamUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  status: "active",
  mainUser: true,
  companyId: "company-id",
  createdAt: "2025-01-01",
  permissions: {} as never,
};

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn((id: string) => {
    if (id === "test-user-id") return mockUser;
    return null;
  }),
}));

const TestComponent = () => {
  const { currentUser, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="current-user">{currentUser?.name || "null"}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? "true" : "false"}</div>
      <button data-testid="login-button" onClick={() => login("test-user-id")}>
        Login
      </button>
      <button data-testid="logout-button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("should provide null user when not logged in", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("current-user")).toHaveTextContent("null");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
  });

  it("should load user from localStorage on mount", () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "test-user-id");
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("current-user")).toHaveTextContent("Test User");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("should login user and update localStorage", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId("login-button");
    act(() => {
      loginButton.click();
    });

    expect(screen.getByTestId("current-user")).toHaveTextContent("Test User");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    if (typeof window !== "undefined") {
      expect(localStorage.getItem("currentUserId")).toBe("test-user-id");
    }
  });

  it("should logout user and clear localStorage", () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "test-user-id");
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByTestId("logout-button");
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId("current-user")).toHaveTextContent("null");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    if (typeof window !== "undefined") {
      expect(localStorage.getItem("currentUserId")).toBeNull();
    }
  });

  it("should return null for invalid user id", () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "invalid-id");
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("current-user")).toHaveTextContent("null");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
  });

  it("should handle user login correctly", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId("login-button");
    act(() => {
      loginButton.click();
    });

    expect(screen.getByTestId("current-user")).toHaveTextContent("Test User");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });
});
