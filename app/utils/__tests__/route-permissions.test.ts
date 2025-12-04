import { describe, it, expect, vi } from "vitest";
import { getRoutePermission, getRouteAction, canAccessRoute } from "../route-permissions";
import { ROUTES } from "~/routes.config";

describe("route-permissions", () => {
  describe("getRoutePermission", () => {
    it("should return permission for exact route match", () => {
      expect(getRoutePermission(ROUTES.PROPERTIES)).toBe("registration.property");
      expect(getRoutePermission(ROUTES.ANIMALS)).toBe("registration.animals");
      expect(getRoutePermission(ROUTES.INVENTORY)).toBe("registration.inventory");
    });

    it("should return permission for route with parameters using pattern matching", () => {
      // These routes should match the pattern from ROUTES.PROPERTIES_VIEW, ANIMALS_VIEW, etc.
      // The actual route format depends on how the routes are defined
      const propertyViewRoute = ROUTES.PROPERTIES_VIEW.replace(":propertyId", "123");
      const animalViewRoute = ROUTES.ANIMALS_VIEW.replace(":animalId", "456");
      expect(getRoutePermission(propertyViewRoute)).toBe("registration.property");
      expect(getRoutePermission(animalViewRoute)).toBe("registration.animals");
    });

    it("should return permission for new routes", () => {
      expect(getRoutePermission(ROUTES.PROPERTIES_NEW)).toBe("registration.property");
      expect(getRoutePermission(ROUTES.ANIMALS_NEW)).toBe("registration.animals");
      expect(getRoutePermission(ROUTES.INVENTORY_NEW)).toBe("registration.inventory");
    });

    it("should return permission for edit routes", () => {
      expect(getRoutePermission(ROUTES.PROPERTIES_EDIT)).toBe("registration.property");
      expect(getRoutePermission(ROUTES.ANIMALS_EDIT)).toBe("registration.animals");
    });

    it("should return permission for view routes", () => {
      expect(getRoutePermission(ROUTES.PROPERTIES_VIEW)).toBe("registration.property");
      expect(getRoutePermission(ROUTES.ANIMALS_VIEW)).toBe("registration.animals");
    });

    it("should return permission for locations routes", () => {
      expect(getRoutePermission(ROUTES.LOCATIONS)).toBe("registration.location");
      expect(getRoutePermission(ROUTES.LOCATIONS_NEW)).toBe("registration.location");
      expect(getRoutePermission("/dashboard/localizacoes/123")).toBe("registration.location");
    });

    it("should return permission for employees routes", () => {
      expect(getRoutePermission(ROUTES.EMPLOYEES)).toBe("registration.employee");
      expect(getRoutePermission(ROUTES.EMPLOYEES_NEW)).toBe("registration.employee");
    });

    it("should return permission for service providers routes", () => {
      expect(getRoutePermission(ROUTES.SERVICE_PROVIDERS)).toBe("registration.serviceProvider");
      expect(getRoutePermission(ROUTES.SERVICE_PROVIDERS_NEW)).toBe("registration.serviceProvider");
    });

    it("should return permission for suppliers routes", () => {
      expect(getRoutePermission(ROUTES.SUPPLIERS)).toBe("registration.supplier");
      expect(getRoutePermission(ROUTES.SUPPLIERS_NEW)).toBe("registration.supplier");
    });

    it("should return permission for buyers routes", () => {
      expect(getRoutePermission(ROUTES.BUYERS)).toBe("registration.buyer");
      expect(getRoutePermission(ROUTES.BUYERS_NEW)).toBe("registration.buyer");
    });

    it("should return permission for records routes", () => {
      expect(getRoutePermission(ROUTES.BIRTHS)).toBe("records.births");
      expect(getRoutePermission(ROUTES.ACQUISITIONS)).toBe("records.acquisitions");
      expect(getRoutePermission(ROUTES.SALES)).toBe("records.sales");
    });

    it("should return permission for breedings routes", () => {
      expect(getRoutePermission(ROUTES.BREEDINGS_NEW)).toBe("breedings.breedings");
      expect(getRoutePermission(ROUTES.BREEDINGS_UNCONFIRMED)).toBe(
        "breedings.unconfirmedBreedings"
      );
      expect(getRoutePermission(ROUTES.BREEDINGS_PREGNANT)).toBe("breedings.pregnantCows");
    });

    it("should return permission for finance routes", () => {
      expect(getRoutePermission(ROUTES.CASH_FLOW)).toBe("finances.cashFlow");
      expect(getRoutePermission(ROUTES.ACCOUNTS_PAYABLE)).toBe("finances.accountsPayable");
      expect(getRoutePermission(ROUTES.ACCOUNTS_RECEIVABLE)).toBe("finances.accountsReceivable");
      expect(getRoutePermission(ROUTES.BANK_ACCOUNTS)).toBe("finances.bankAccounts");
    });

    it("should return null for unknown route", () => {
      expect(getRoutePermission("/unknown/route")).toBe(null);
      expect(getRoutePermission("/dashboard/unknown")).toBe(null);
    });

    it("should handle route with multiple path segments", () => {
      expect(getRoutePermission("/dashboard/propriedades/123/pastagem/456")).toBe(
        "registration.property"
      );
    });
  });

  describe("getRouteAction", () => {
    it("should return 'add' for new routes", () => {
      expect(getRouteAction("/dashboard/animais/novo")).toBe("add");
      expect(getRouteAction("/dashboard/animals/new")).toBe("add");
      expect(getRouteAction(ROUTES.ANIMALS_NEW)).toBe("add");
    });

    it("should return 'edit' for edit routes", () => {
      expect(getRouteAction("/dashboard/animais/editar/123")).toBe("edit");
      expect(getRouteAction("/dashboard/animals/edit/123")).toBe("edit");
      expect(getRouteAction(ROUTES.ANIMALS_EDIT)).toBe("edit");
    });

    it("should return 'remove' for remove/delete routes", () => {
      expect(getRouteAction("/dashboard/animais/remover/123")).toBe("remove");
      expect(getRouteAction("/dashboard/animals/remove/123")).toBe("remove");
      expect(getRouteAction("/dashboard/animals/delete/123")).toBe("remove");
    });

    it("should return 'view' for view routes", () => {
      expect(getRouteAction("/dashboard/animais/123")).toBe("view");
      expect(getRouteAction(ROUTES.ANIMALS_VIEW)).toBe("view");
    });

    it("should return 'view' as default", () => {
      expect(getRouteAction("/dashboard/animais")).toBe("view");
      expect(getRouteAction("/dashboard")).toBe("view");
    });

    it("should be case insensitive", () => {
      expect(getRouteAction("/dashboard/ANIMALS/NEW")).toBe("add");
      expect(getRouteAction("/dashboard/Animals/Edit")).toBe("edit");
    });
  });

  describe("canAccessRoute", () => {
    it("should return true if route has no permission", () => {
      const hasPermission = vi.fn(() => false);
      expect(canAccessRoute("/unknown/route", hasPermission)).toBe(true);
      expect(hasPermission).not.toHaveBeenCalled();
    });

    it("should return true if user has permission", () => {
      const hasPermission = vi.fn(() => true);
      expect(canAccessRoute(ROUTES.ANIMALS, hasPermission)).toBe(true);
      expect(hasPermission).toHaveBeenCalled();
    });

    it("should return false if user does not have permission", () => {
      const hasPermission = vi.fn(() => false);
      expect(canAccessRoute(ROUTES.ANIMALS, hasPermission)).toBe(false);
    });

    it("should use provided action if given", () => {
      const hasPermission = vi.fn(() => true);
      canAccessRoute(ROUTES.ANIMALS, hasPermission, "add");
      expect(hasPermission).toHaveBeenCalledWith("registration", "animals", "add");
    });

    it("should extract action from route if not provided", () => {
      const hasPermission = vi.fn(() => true);
      canAccessRoute(ROUTES.ANIMALS_NEW, hasPermission);
      expect(hasPermission).toHaveBeenCalledWith("registration", "animals", "add");
    });

    it("should handle permission path with multiple segments", () => {
      const hasPermission = vi.fn(() => true);
      canAccessRoute(ROUTES.BREEDINGS_UNCONFIRMED, hasPermission);
      expect(hasPermission).toHaveBeenCalledWith("breedings", "unconfirmedBreedings", "view");
    });
  });
});
