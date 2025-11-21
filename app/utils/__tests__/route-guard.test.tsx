import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { requireGuest, useRequireGuest } from "../route-guard";
import { ROUTES } from "~/routes.config";
import { AuthProvider, useAuth } from "~/contexts/auth-context";
import type { TeamUser } from "~/types";

const CURRENT_USER_ID_KEY = "currentUserId";

const mockUser: TeamUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  status: "active",
  mainUser: false,
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

describe("requireGuest", () => {
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

  it("should redirect to dashboard when user is authenticated", async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_USER_ID_KEY, "test-user-id");
    }

    await expect(requireGuest()).rejects.toThrow();

    try {
      await requireGuest();
      expect.fail("should have thrown redirect");
    } catch (error) {
      // React Router redirect throws a Response object
      expect(error).toBeDefined();
      if (error instanceof Response) {
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toBe(ROUTES.DASHBOARD);
      }
    }
  });

  it("should return null when user is not authenticated", async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }

    const result = await requireGuest();
    expect(result).toBeNull();
  });

  it("should return null when localStorage is empty", async () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    const result = await requireGuest();
    expect(result).toBeNull();
  });

  it("should handle server-side rendering gracefully", async () => {
    // Mock window as undefined to simulate server-side
    const originalWindow = global.window;
    // @ts-expect-error - intentionally setting to undefined for test
    delete global.window;

    const result = await requireGuest();
    expect(result).toBeNull();

    // Restore window
    global.window = originalWindow;
  });
});

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("useRequireGuest", () => {
  const TestComponent = () => {
    useRequireGuest();
    const { isAuthenticated } = useAuth();
    return (
      <div>
        <div data-testid="is-authenticated">{isAuthenticated ? "true" : "false"}</div>
        <div data-testid="component-rendered">Component Rendered</div>
      </div>
    );
  };

  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("should redirect to dashboard when isAuthenticated is true", async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_USER_ID_KEY, "test-user-id");
    }

    const router = createMemoryRouter(
      [
        {
          path: "/test",
          element: (
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          ),
        },
      ],
      {
        initialEntries: ["/test"],
      }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, { replace: true });
    });
  });

  it("should not redirect when isAuthenticated is false", async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }

    const router = createMemoryRouter(
      [
        {
          path: "/test",
          element: (
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          ),
        },
      ],
      {
        initialEntries: ["/test"],
      }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("component-rendered")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should use replace: true in navigation", async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_USER_ID_KEY, "test-user-id");
    }

    const router = createMemoryRouter(
      [
        {
          path: "/test",
          element: (
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          ),
        },
      ],
      {
        initialEntries: ["/test"],
      }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, { replace: true });
      const call = mockNavigate.mock.calls[0];
      expect(call[1]).toEqual({ replace: true });
    });
  });
});
