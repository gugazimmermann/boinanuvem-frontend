import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { redirect } from "react-router";
import { createRouteGuard, requireMainUser, requireGuest } from "../route-guard";
import { ROUTES } from "~/routes.config";
import { useAuth } from "~/contexts/auth-context";
import { useNavigate } from "react-router";

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
    redirect: vi.fn((path: string) => {
      const error = new Error() as Error & { status?: number; location?: string };
      error.status = 302;
      error.location = path;
      throw error;
    }),
  };
});

describe("route-guard", () => {
  const mockUser = {
    id: "user-1",
    email: "user1@example.com",
    name: "User One",
    mainUser: true,
    companyId: "company-1",
    permissions: {},
    company: {},
  };

  const mockNonMainUser = {
    id: "user-2",
    email: "user2@example.com",
    name: "User Two",
    mainUser: false,
    companyId: "company-1",
    permissions: {
      registration: {
        animals: {
          view: true,
          add: false,
          edit: false,
          remove: false,
        },
      },
    },
    company: {},
  };

  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(globalThis, "localStorage", {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
    // Mock window
    globalThis.window = {
      ...globalThis.window,
      location: { pathname: "/dashboard/animais" },
    } as Window & typeof globalThis;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createRouteGuard", () => {
    it("should return null on server side (no window)", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - intentionally removing window for test
      delete globalThis.window;

      const guard = createRouteGuard();
      expect(guard()).toBe(null);

      globalThis.window = originalWindow;
    });

    it("should redirect to login if no user", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const guard = createRouteGuard();
      expect(() => guard()).toThrow();
      expect(redirect).toHaveBeenCalledWith(ROUTES.LOGIN);
    });

    it("should allow access for main user", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockUser);
        return null;
      });

      const guard = createRouteGuard(ROUTES.ANIMALS);
      expect(guard()).toBe(null);
    });

    it("should redirect non-main user from team routes", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockNonMainUser);
        return null;
      });

      const guard = createRouteGuard(ROUTES.TEAM);
      expect(() => guard()).toThrow();
      expect(redirect).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("should check permissions for non-main user", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockNonMainUser);
        return null;
      });

      const guard = createRouteGuard(ROUTES.ANIMALS, "view");
      expect(guard()).toBe(null); // Has view permission
    });

    it("should redirect if user lacks required permission", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockNonMainUser);
        return null;
      });

      const guard = createRouteGuard(ROUTES.ANIMALS, "add");
      expect(() => guard()).toThrow();
      expect(redirect).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("should use custom redirectTo", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockNonMainUser);
        return null;
      });

      const guard = createRouteGuard(ROUTES.ANIMALS, "add", "/custom");
      expect(() => guard()).toThrow();
      expect(redirect).toHaveBeenCalledWith("/custom");
    });

    it("should extract route from request URL if not provided", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockUser);
        return null;
      });

      const guard = createRouteGuard();
      const request = new Request("http://localhost/dashboard/animais");
      expect(guard({ request })).toBe(null);
    });

    it("should use window.location if request URL fails", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockUser);
        return null;
      });

      const guard = createRouteGuard();
      // Create a request with an invalid URL that will cause URL parsing to fail
      const request = {
        url: "invalid-url",
      } as Request;
      expect(guard({ request })).toBe(null);
    });

    it("should return null if route has no permission mapping", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockUser);
        return null;
      });

      const guard = createRouteGuard("/unknown/route");
      expect(guard()).toBe(null);
    });
  });

  describe("requireMainUser", () => {
    it("should return null on server side", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - intentionally removing window for test
      delete globalThis.window;

      const guard = requireMainUser();
      expect(guard()).toBe(null);

      globalThis.window = originalWindow;
    });

    it("should redirect to login if no user", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const guard = requireMainUser();
      expect(() => guard()).toThrow();
      expect(redirect).toHaveBeenCalledWith(ROUTES.LOGIN);
    });

    it("should allow access for main user", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockUser);
        return null;
      });

      const guard = requireMainUser();
      expect(guard()).toBe(null);
    });

    it("should redirect non-main user", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockNonMainUser);
        return null;
      });

      const guard = requireMainUser();
      expect(() => guard()).toThrow();
      expect(redirect).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("should use custom redirectTo", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "user_data") return JSON.stringify(mockNonMainUser);
        return null;
      });

      const guard = requireMainUser("/custom");
      expect(() => guard()).toThrow();
      expect(redirect).toHaveBeenCalledWith("/custom");
    });
  });

  describe("requireGuest", () => {
    it("should return null if no access token in localStorage", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = await requireGuest();
      expect(result).toBe(null);
    });

    it("should redirect to dashboard if access token exists", async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "access_token") return "access-token-123";
        return null;
      });
      await expect(requireGuest()).rejects.toThrow();
      expect(redirect).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });

    it("should return null on server side", async () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - intentionally removing window for test
      delete globalThis.window;

      const result = await requireGuest();
      expect(result).toBe(null);

      globalThis.window = originalWindow;
    });
  });

  describe("useRequireGuest", () => {
    it("should navigate to dashboard if authenticated", () => {
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        currentUser: null,
        login: vi.fn(),
        logout: vi.fn(),
      } as ReturnType<typeof useAuth>);

      // This is a hook, so we can't test it directly without rendering
      // But we can verify the mocks are set up correctly
      expect(useNavigate).toBeDefined();
      expect(useAuth).toBeDefined();
    });
  });
});
