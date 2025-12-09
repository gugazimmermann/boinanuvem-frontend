import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { redirect } from "react-router";
import { createRouteGuard, requireMainUser, requireGuest, useRequireGuest } from "../route-guard";
import { ROUTES } from "~/routes.config";
import { getRoutePermission, getRouteAction } from "../route-permissions";
import type { UserPermissions } from "~/types/permissions";

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  redirect: vi.fn((path: string) => {
    const error = new Error(`Redirect to ${path}`);
    (error as { status?: number; location?: string }).status = 302;
    (error as { status?: number; location?: string }).location = path;
    throw error;
  }),
  useNavigate: () => mockNavigate,
}));

// Mock route-permissions
vi.mock("../route-permissions", () => ({
  getRoutePermission: vi.fn(),
  getRouteAction: vi.fn(),
}));

// Mock auth context
const mockUseAuth = vi.fn(() => ({
  isAuthenticated: false,
}));

vi.mock("~/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("createRouteGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;
    global.window = { location: { pathname: "/dashboard" } } as Window & typeof globalThis;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return null when window is undefined (SSR)", () => {
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for SSR test
    delete global.window;

    const guard = createRouteGuard();
    const result = guard({});

    global.window = originalWindow;
    expect(result).toBeNull();
  });

  it("should redirect to login when user is not authenticated", () => {
    global.localStorage.getItem = vi.fn(() => null);
    const guard = createRouteGuard();

    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it("should allow access for main user on team routes", () => {
    const mainUser = {
      mainUser: true,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(mainUser);
      }
      return null;
    });

    const guard = createRouteGuard(ROUTES.TEAM);
    const result = guard({});
    // Should not throw redirect
    expect(result).toBeNull();
  });

  it("should redirect non-main users from team routes", () => {
    const regularUser = {
      mainUser: false,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(regularUser);
      }
      return null;
    });

    const guard = createRouteGuard(ROUTES.TEAM);

    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalled();
  });

  it("should handle invalid JSON in localStorage", () => {
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return "invalid json";
      }
      return null;
    });

    const guard = createRouteGuard();

    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it("should extract route from request URL", () => {
    const user = {
      mainUser: true,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const mockRequest = {
      url: "https://example.com/dashboard/properties",
    } as Request;

    const guard = createRouteGuard();
    const result = guard({ request: mockRequest });
    expect(result).toBeNull();
  });

  it("should use window.location.pathname when request is not provided", () => {
    const user = {
      mainUser: true,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    global.window.location.pathname = "/dashboard/animals";
    const guard = createRouteGuard();
    const result = guard({});
    expect(result).toBeNull();
  });

  it("should handle URL parsing error in request", () => {
    const user = {
      mainUser: true,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const mockRequest = {
      url: "invalid-url",
    } as Request;

    // Mock URL constructor to throw error
    const originalURL = global.URL;
    class MockURL {
      constructor(_url: string) {
        throw new Error("Invalid URL");
      }
    }
    global.URL = MockURL as typeof URL;

    const guard = createRouteGuard();
    const result = guard({ request: mockRequest });

    global.URL = originalURL;
    expect(result).toBeNull();
  });

  it("should allow access when user has permission", () => {
    vi.mocked(getRoutePermission).mockReturnValue("registration.animals");
    vi.mocked(getRouteAction).mockReturnValue("view");

    const user = {
      mainUser: false,
      permissions: {
        registration: {
          animals: {
            view: true,
            add: false,
            edit: false,
            remove: false,
          },
        },
      } as UserPermissions,
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/dashboard/animals");
    const result = guard({});
    expect(result).toBeNull();
  });

  it("should redirect when user lacks permission", () => {
    vi.mocked(getRoutePermission).mockReturnValue("registration.animals");
    vi.mocked(getRouteAction).mockReturnValue("view");

    const user = {
      mainUser: false,
      permissions: {
        registration: {
          animals: {
            view: false,
            add: false,
            edit: false,
            remove: false,
          },
        },
      } as UserPermissions,
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/dashboard/animals");
    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it("should use custom redirect path when permission denied", () => {
    vi.mocked(getRoutePermission).mockReturnValue("registration.animals");
    vi.mocked(getRouteAction).mockReturnValue("view");

    const user = {
      mainUser: false,
      permissions: {
        registration: {
          animals: {
            view: false,
            add: false,
            edit: false,
            remove: false,
          },
        },
      } as UserPermissions,
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/dashboard/animals", undefined, "/custom-redirect");
    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalledWith("/custom-redirect");
  });

  it("should return null when no permission path exists", () => {
    vi.mocked(getRoutePermission).mockReturnValue(null);

    const user = {
      mainUser: false,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/unknown-route");
    const result = guard({});
    expect(result).toBeNull();
  });

  it("should use requiredAction when provided", () => {
    vi.mocked(getRoutePermission).mockReturnValue("registration.animals");

    const user = {
      mainUser: false,
      permissions: {
        registration: {
          animals: {
            view: false,
            add: true,
            edit: false,
            remove: false,
          },
        },
      } as UserPermissions,
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/dashboard/animals", "add");
    const result = guard({});
    expect(result).toBeNull();
    expect(getRouteAction).not.toHaveBeenCalled();
  });

  it("should handle missing section in permissions", () => {
    vi.mocked(getRoutePermission).mockReturnValue("registration.animals");
    vi.mocked(getRouteAction).mockReturnValue("view");

    const user = {
      mainUser: false,
      permissions: {} as UserPermissions,
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/dashboard/animals");
    expect(() => guard({})).toThrow();
  });

  it("should handle missing resource in permissions", () => {
    vi.mocked(getRoutePermission).mockReturnValue("registration.animals");
    vi.mocked(getRouteAction).mockReturnValue("view");

    const user = {
      mainUser: false,
      permissions: {
        registration: {},
      } as UserPermissions,
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/dashboard/animals");
    expect(() => guard({})).toThrow();
  });

  it("should handle team route with parameter", () => {
    const user = {
      mainUser: false,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(user);
      }
      return null;
    });

    const guard = createRouteGuard("/dashboard/team/123/permissions");
    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalled();
  });
});

describe("requireMainUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;
    global.window = { location: { pathname: "/dashboard" } } as Window & typeof globalThis;
  });

  it("should return null when window is undefined (SSR)", () => {
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for SSR test
    delete global.window;

    const guard = requireMainUser();
    const result = guard({});

    global.window = originalWindow;
    expect(result).toBeNull();
  });

  it("should redirect to login when user is not authenticated", () => {
    global.localStorage.getItem = vi.fn(() => null);
    const guard = requireMainUser();

    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it("should redirect non-main users", () => {
    const regularUser = {
      mainUser: false,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(regularUser);
      }
      return null;
    });

    const guard = requireMainUser();

    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalled();
  });

  it("should allow main users", () => {
    const mainUser = {
      mainUser: true,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(mainUser);
      }
      return null;
    });

    const guard = requireMainUser();
    const result = guard({});
    expect(result).toBeNull();
  });

  it("should use custom redirect path", () => {
    const regularUser = {
      mainUser: false,
      permissions: {},
    };
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "user_data") {
        return JSON.stringify(regularUser);
      }
      return null;
    });

    const guard = requireMainUser("/custom-redirect");

    expect(() => guard({})).toThrow();
    expect(redirect).toHaveBeenCalledWith("/custom-redirect");
  });
});

describe("requireGuest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;
    global.window = { location: { pathname: "/login" } } as Window & typeof globalThis;
  });

  it("should return null when window is undefined (SSR)", async () => {
    const originalWindow = global.window;
    // @ts-expect-error - intentionally removing window for SSR test
    delete global.window;

    const result = await requireGuest();

    global.window = originalWindow;
    expect(result).toBeNull();
  });

  it("should redirect to dashboard when access token exists", async () => {
    global.localStorage.getItem = vi.fn((key: string) => {
      if (key === "access_token") {
        return "token-123";
      }
      return null;
    });

    await expect(requireGuest()).rejects.toThrow();
    expect(redirect).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it("should return null when no access token", async () => {
    global.localStorage.getItem = vi.fn(() => null);

    const result = await requireGuest();
    expect(result).toBeNull();
  });
});

describe("useRequireGuest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.window = { location: { pathname: "/login" } } as Window & typeof globalThis;
  });

  it("should navigate to dashboard when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    renderHook(() => useRequireGuest());

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, { replace: true });
  });

  it("should not navigate when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    renderHook(() => useRequireGuest());

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should update navigation when authentication status changes", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    const { rerender } = renderHook(() => useRequireGuest());

    expect(mockNavigate).not.toHaveBeenCalled();

    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    rerender();

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD, { replace: true });
  });
});
