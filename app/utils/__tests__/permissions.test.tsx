import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissions } from "../permissions";
import { useAuth } from "~/contexts/auth-context";

// Mock auth context
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return full permissions for main user", () => {
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { mainUser: true },
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());
    expect(result.current.isMainUser()).toBe(true);
    expect(result.current.hasPermission("registration", "property", "view")).toBe(true);
  });

  it("should return user permissions when provided", () => {
    const userPermissions = {
      registration: {
        property: { view: true, add: false, edit: false, remove: false },
      },
    };

    vi.mocked(useAuth).mockReturnValue({
      currentUser: { mainUser: false, permissions: userPermissions },
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission("registration", "property", "view")).toBe(true);
    expect(result.current.hasPermission("registration", "property", "add")).toBe(false);
  });

  it("should return no permissions when user has no permissions", () => {
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { mainUser: false },
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission("registration", "property", "view")).toBe(false);
  });

  it("should provide convenience methods", () => {
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { mainUser: true },
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());
    expect(result.current.canView("registration", "property")).toBe(true);
    expect(result.current.canAdd("registration", "property")).toBe(true);
    expect(result.current.canEdit("registration", "property")).toBe(true);
    expect(result.current.canRemove("registration", "property")).toBe(true);
  });

  it("should check permission path", () => {
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { mainUser: true },
      isAuthenticated: true,
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());
    expect(result.current.checkPermissionPath("registration.property.view", "view")).toBe(true);
  });
});
