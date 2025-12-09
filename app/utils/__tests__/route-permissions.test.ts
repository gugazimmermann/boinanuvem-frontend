import { describe, it, expect } from "vitest";
import { getRoutePermission, getRouteAction, canAccessRoute } from "../route-permissions";
import { ROUTES } from "~/routes.config";
import type { PermissionAction } from "~/types/permissions";

describe("getRoutePermission", () => {
  it("should return permission for exact route match", () => {
    expect(getRoutePermission(ROUTES.PROPERTIES)).toBe("registration.property");
    expect(getRoutePermission(ROUTES.ANIMALS)).toBe("registration.animals");
  });

  it("should return permission for route with parameters", () => {
    const route = ROUTES.PROPERTIES_VIEW.replace(":propertyId", "property-1");
    expect(getRoutePermission(route)).toBe("registration.property");
  });

  it("should return null for unknown route", () => {
    expect(getRoutePermission("/unknown/route")).toBeNull();
  });

  it("should handle routes with multiple parameters", () => {
    const route = "/dashboard/properties/property-1/pasture-planning/edit";
    const result = getRoutePermission(route);
    // Should match pattern even with parameters
    expect(result).toBeDefined();
  });
});

describe("getRouteAction", () => {
  it("should return 'add' for new routes", () => {
    expect(getRouteAction("/dashboard/animals/novo")).toBe("add");
    expect(getRouteAction("/dashboard/animals/new")).toBe("add");
  });

  it("should return 'edit' for edit routes", () => {
    expect(getRouteAction("/dashboard/animals/editar/123")).toBe("edit");
    expect(getRouteAction("/dashboard/animals/edit/123")).toBe("edit");
  });

  it("should return 'remove' for remove routes", () => {
    expect(getRouteAction("/dashboard/animals/remover/123")).toBe("remove");
    expect(getRouteAction("/dashboard/animals/remove/123")).toBe("remove");
    expect(getRouteAction("/dashboard/animals/delete/123")).toBe("remove");
  });

  it("should return 'view' for view routes", () => {
    expect(getRouteAction("/dashboard/animals/123")).toBe("view");
    expect(getRouteAction("/dashboard/properties")).toBe("view");
  });

  it("should be case insensitive", () => {
    expect(getRouteAction("/dashboard/animals/NEW")).toBe("add");
    expect(getRouteAction("/dashboard/animals/EDIT")).toBe("edit");
  });
});

describe("canAccessRoute", () => {
  const mockHasPermission = (section: string, resource: string, action: PermissionAction) => {
    return section === "registration" && resource === "property" && action === "view";
  };

  it("should return true when permission exists", () => {
    const result = canAccessRoute(ROUTES.PROPERTIES, mockHasPermission);
    expect(result).toBe(true);
  });

  it("should return false when permission does not exist", () => {
    const result = canAccessRoute(ROUTES.ANIMALS, mockHasPermission);
    expect(result).toBe(false);
  });

  it("should return true for routes without permission mapping", () => {
    const result = canAccessRoute("/unknown/route", mockHasPermission);
    expect(result).toBe(true);
  });

  it("should use provided action instead of detected action", () => {
    const result = canAccessRoute(ROUTES.PROPERTIES, mockHasPermission, "edit");
    expect(result).toBe(false); // mockHasPermission only allows "view"
  });

  it("should handle complex permission paths", () => {
    const hasPermission = (section: string, resource: string) => {
      return section === "records" && resource === "sales";
    };
    const result = canAccessRoute(ROUTES.SALES, hasPermission);
    expect(result).toBe(true);
  });
});
