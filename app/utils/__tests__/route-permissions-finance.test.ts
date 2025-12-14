import { describe, it, expect } from "vitest";
import { ROUTES } from "~/routes.config";
import { getRoutePermission, getRouteAction, canAccessRoute } from "../route-permissions";
import type { PermissionAction } from "~/types/permissions";

describe("route-permissions.ts - Finance Routes", () => {
  describe("getRoutePermission", () => {
    it("should return correct permission for cash flow routes", () => {
      expect(getRoutePermission(ROUTES.CASH_FLOW)).toBe("finances.cashFlow");
      expect(getRoutePermission(ROUTES.CASH_FLOW_NEW)).toBe("finances.cashFlow");
      expect(getRoutePermission(ROUTES.CASH_FLOW_EDIT)).toBe("finances.cashFlow");
      expect(getRoutePermission(ROUTES.CASH_FLOW_VIEW)).toBe("finances.cashFlow");
    });

    it("should return correct permission for accounts payable routes", () => {
      expect(getRoutePermission(ROUTES.ACCOUNTS_PAYABLE)).toBe("finances.accountsPayable");
      expect(getRoutePermission(ROUTES.ACCOUNTS_PAYABLE_NEW)).toBe("finances.accountsPayable");
      expect(getRoutePermission(ROUTES.ACCOUNTS_PAYABLE_EDIT)).toBe("finances.accountsPayable");
      expect(getRoutePermission(ROUTES.ACCOUNTS_PAYABLE_VIEW)).toBe("finances.accountsPayable");
    });

    it("should return correct permission for accounts receivable routes", () => {
      expect(getRoutePermission(ROUTES.ACCOUNTS_RECEIVABLE)).toBe("finances.accountsReceivable");
      expect(getRoutePermission(ROUTES.ACCOUNTS_RECEIVABLE_NEW)).toBe(
        "finances.accountsReceivable"
      );
      expect(getRoutePermission(ROUTES.ACCOUNTS_RECEIVABLE_EDIT)).toBe(
        "finances.accountsReceivable"
      );
      expect(getRoutePermission(ROUTES.ACCOUNTS_RECEIVABLE_VIEW)).toBe(
        "finances.accountsReceivable"
      );
    });

    it("should return correct permission for bank accounts routes", () => {
      expect(getRoutePermission(ROUTES.BANK_ACCOUNTS)).toBe("finances.bankAccounts");
      expect(getRoutePermission(ROUTES.BANK_ACCOUNTS_NEW)).toBe("finances.bankAccounts");
      expect(getRoutePermission(ROUTES.BANK_ACCOUNTS_EDIT)).toBe("finances.bankAccounts");
      expect(getRoutePermission(ROUTES.BANK_ACCOUNTS_VIEW)).toBe("finances.bankAccounts");
    });

    it("should return correct permission for finances dashboard", () => {
      expect(getRoutePermission(ROUTES.FINANCES_DASHBOARD)).toBe("finances.cashFlow");
    });

    it("should handle dynamic route patterns", () => {
      const editRoute = ROUTES.CASH_FLOW_EDIT.replace(":transactionId", "cf-1");
      expect(getRoutePermission(editRoute)).toBe("finances.cashFlow");

      const viewRoute = ROUTES.BANK_ACCOUNTS_VIEW.replace(":bankAccountId", "bank-1");
      expect(getRoutePermission(viewRoute)).toBe("finances.bankAccounts");
    });
  });

  describe("getRouteAction", () => {
    it("should return 'add' for new routes", () => {
      expect(getRouteAction(ROUTES.CASH_FLOW_NEW)).toBe("add");
      expect(getRouteAction(ROUTES.ACCOUNTS_PAYABLE_NEW)).toBe("add");
      expect(getRouteAction(ROUTES.ACCOUNTS_RECEIVABLE_NEW)).toBe("add");
      expect(getRouteAction(ROUTES.BANK_ACCOUNTS_NEW)).toBe("add");
    });

    it("should return 'edit' for edit routes", () => {
      expect(getRouteAction(ROUTES.CASH_FLOW_EDIT)).toBe("edit");
      expect(getRouteAction(ROUTES.ACCOUNTS_PAYABLE_EDIT)).toBe("edit");
      expect(getRouteAction(ROUTES.ACCOUNTS_RECEIVABLE_EDIT)).toBe("edit");
      expect(getRouteAction(ROUTES.BANK_ACCOUNTS_EDIT)).toBe("edit");
    });

    it("should return 'view' for list and view routes", () => {
      expect(getRouteAction(ROUTES.CASH_FLOW)).toBe("view");
      expect(getRouteAction(ROUTES.CASH_FLOW_VIEW)).toBe("view");
      expect(getRouteAction(ROUTES.ACCOUNTS_PAYABLE)).toBe("view");
      expect(getRouteAction(ROUTES.ACCOUNTS_RECEIVABLE)).toBe("view");
      expect(getRouteAction(ROUTES.BANK_ACCOUNTS)).toBe("view");
      expect(getRouteAction(ROUTES.FINANCES_DASHBOARD)).toBe("view");
    });
  });

  describe("canAccessRoute", () => {
    const mockHasPermission = (section: string, resource: string, action: PermissionAction) => {
      if (section === "finances" && resource === "cashFlow" && action === "view") return true;
      if (section === "finances" && resource === "accountsPayable" && action === "view")
        return true;
      if (section === "finances" && resource === "bankAccounts" && action === "add") return true;
      return false;
    };

    it("should return true when user has required permission", () => {
      expect(canAccessRoute(ROUTES.CASH_FLOW, mockHasPermission)).toBe(true);
      expect(canAccessRoute(ROUTES.ACCOUNTS_PAYABLE, mockHasPermission)).toBe(true);
      expect(canAccessRoute(ROUTES.BANK_ACCOUNTS_NEW, mockHasPermission, "add")).toBe(true);
    });

    it("should return false when user lacks required permission", () => {
      expect(canAccessRoute(ROUTES.ACCOUNTS_RECEIVABLE, mockHasPermission)).toBe(false);
      expect(canAccessRoute(ROUTES.CASH_FLOW_NEW, mockHasPermission, "add")).toBe(false);
    });

    it("should return true for routes without permission mapping", () => {
      expect(canAccessRoute("/some-other-route", mockHasPermission)).toBe(true);
    });
  });
});
