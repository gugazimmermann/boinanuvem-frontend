import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRouteGuard } from "../route-guard";
import { ROUTES } from "~/routes.config";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe("route-guard.ts - Finance Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = mockLocalStorage as unknown as Storage;
    Object.defineProperty(global, "window", {
      value: {
        location: {
          pathname: "/dashboard/fluxo-caixa",
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow access when user has view permission for cash flow", () => {
    const mockUser = {
      id: "user-1",
      mainUser: false,
      permissions: {
        finances: {
          cashFlow: { view: true, add: false, edit: false, remove: false },
        },
      },
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

    const guard = createRouteGuard(ROUTES.CASH_FLOW, "view");
    const result = guard({ request: { url: "http://localhost/dashboard/fluxo-caixa" } as Request });

    expect(result).toBeNull();
  });

  it("should redirect when user lacks permission", () => {
    const mockUser = {
      id: "user-1",
      mainUser: false,
      permissions: {
        finances: {
          cashFlow: { view: false, add: false, edit: false, remove: false },
        },
      },
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

    const guard = createRouteGuard(ROUTES.CASH_FLOW, "view");

    expect(() => {
      guard({ request: { url: "http://localhost/dashboard/fluxo-caixa" } as Request });
    }).toThrow();
  });

  it("should allow access for main users regardless of permissions", () => {
    const mockMainUser = {
      id: "user-1",
      mainUser: true,
      permissions: {},
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockMainUser));

    const guard = createRouteGuard(ROUTES.ACCOUNTS_RECEIVABLE, "view");
    const result = guard({
      request: { url: "http://localhost/dashboard/contas-receber" } as Request,
    });

    expect(result).toBeNull();
  });

  it("should redirect to login when user is not authenticated", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const guard = createRouteGuard(ROUTES.CASH_FLOW, "view");

    expect(() => {
      guard({ request: { url: "http://localhost/dashboard/fluxo-caixa" } as Request });
    }).toThrow();
  });
});
