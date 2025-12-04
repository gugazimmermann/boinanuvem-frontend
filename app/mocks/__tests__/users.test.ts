import { describe, it, expect } from "vitest";
import { mockUsers } from "../users";
import { mockCompanies } from "../companies";

describe("users", () => {
  describe("mockUsers", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockUsers)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockUsers.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockUsers.forEach((user) => {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("cpf");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("password");
        expect(user).toHaveProperty("phone");
        expect(user).toHaveProperty("status");
        expect(user).toHaveProperty("street");
        expect(user).toHaveProperty("number");
        expect(user).toHaveProperty("neighborhood");
        expect(user).toHaveProperty("city");
        expect(user).toHaveProperty("state");
        expect(user).toHaveProperty("zipCode");
        expect(user).toHaveProperty("mainUser");
        expect(user).toHaveProperty("companyId");
        expect(user).toHaveProperty("createdAt");
        expect(user).toHaveProperty("permissions");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockUsers.map((user) => user.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockUsers.forEach((user) => {
        expect(user.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockUsers.forEach((user) => {
        expect(user.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockUsers.forEach((user) => {
        const date = new Date(user.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid CPF format", () => {
      mockUsers.forEach((user) => {
        if (user.cpf) {
          const cpfDigits = user.cpf.replace(/\D/g, "");
          expect(cpfDigits.length).toBe(11);
        }
      });
    });

    it("should have valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      mockUsers.forEach((user) => {
        expect(user.email).toMatch(emailRegex);
      });
    });

    it("should have valid password hash format", () => {
      const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
      mockUsers.forEach((user) => {
        expect(user.password).toMatch(bcryptRegex);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive", "pending"];
      mockUsers.forEach((user) => {
        expect(validStatuses).toContain(user.status);
      });
    });

    it("should have valid mainUser boolean", () => {
      mockUsers.forEach((user) => {
        expect(typeof user.mainUser).toBe("boolean");
      });
    });

    it("should have exactly one main user", () => {
      const mainUsers = mockUsers.filter((user) => user.mainUser);
      expect(mainUsers.length).toBe(1);
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockUsers.forEach((user) => {
        expect(companyIds).toContain(user.companyId);
      });
    });

    it("should have valid permissions structure", () => {
      mockUsers.forEach((user) => {
        expect(user.permissions).toHaveProperty("registration");
        expect(user.permissions).toHaveProperty("records");
        expect(user.permissions).toHaveProperty("breedings");
        expect(user.permissions).toHaveProperty("finances");
        expect(user.permissions).toHaveProperty("reports");
      });
    });

    it("should have valid permission structure for registration", () => {
      mockUsers.forEach((user) => {
        const permissions = user.permissions as {
          registration: Record<
            string,
            { view: boolean; add: boolean; edit: boolean; remove: boolean }
          >;
          records: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
          breedings: Record<
            string,
            { view: boolean; add: boolean; edit: boolean; remove: boolean }
          >;
          finances: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
          reports: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
        };
        const reg = permissions.registration;
        expect(reg).toHaveProperty("property");
        expect(reg).toHaveProperty("location");
        expect(reg).toHaveProperty("employee");
        expect(reg).toHaveProperty("serviceProvider");
        expect(reg).toHaveProperty("supplier");
        expect(reg).toHaveProperty("buyer");
        expect(reg).toHaveProperty("inventory");
        expect(reg).toHaveProperty("animals");
      });
    });

    it("should have valid permission actions", () => {
      mockUsers.forEach((user) => {
        const permissions = user.permissions as {
          registration: Record<
            string,
            { view: boolean; add: boolean; edit: boolean; remove: boolean }
          >;
          records: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
          breedings: Record<
            string,
            { view: boolean; add: boolean; edit: boolean; remove: boolean }
          >;
          finances: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
          reports: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
        };
        const checkPermissions = (perms: {
          view: boolean;
          add: boolean;
          edit: boolean;
          remove: boolean;
        }) => {
          expect(typeof perms.view).toBe("boolean");
          expect(typeof perms.add).toBe("boolean");
          expect(typeof perms.edit).toBe("boolean");
          expect(typeof perms.remove).toBe("boolean");
        };

        Object.values(permissions.registration).forEach(checkPermissions);
        Object.values(permissions.records).forEach(checkPermissions);
        Object.values(permissions.breedings).forEach(checkPermissions);
        Object.values(permissions.finances).forEach(checkPermissions);
        Object.values(permissions.reports).forEach(checkPermissions);
      });
    });

    it("should have different permission levels for different users", () => {
      const permissionLevels = mockUsers.map((user) => {
        const permissions = user.permissions as {
          registration: Record<
            string,
            { view: boolean; add: boolean; edit: boolean; remove: boolean }
          >;
          records: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
          breedings: Record<
            string,
            { view: boolean; add: boolean; edit: boolean; remove: boolean }
          >;
          finances: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
          reports: Record<string, { view: boolean; add: boolean; edit: boolean; remove: boolean }>;
        };
        const allPermissions = [
          ...Object.values(permissions.registration),
          ...Object.values(permissions.records),
          ...Object.values(permissions.breedings),
          ...Object.values(permissions.finances),
          ...Object.values(permissions.reports),
        ];
        return allPermissions.some((p) => p.remove === true);
      });
      expect(new Set(permissionLevels).size).toBeGreaterThan(1);
    });

    it("should have valid lastAccess when present", () => {
      mockUsers.forEach((user) => {
        if ("lastAccess" in user && user.lastAccess) {
          expect(typeof user.lastAccess).toBe("string");
          const lastAccessDate = new Date(user.lastAccess as string);
          expect(lastAccessDate.getTime()).toBeLessThanOrEqual(Date.now());
        }
      });
    });
  });
});
