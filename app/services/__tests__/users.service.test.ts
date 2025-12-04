import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getUserById,
  getUsersByCompanyId,
  updateUser,
  updateUserPermissions,
  addUser,
  authenticateUser,
} from "../users.service";
import { mockUsers } from "~/mocks/users";
import { mockCompanies } from "~/mocks/companies";
import type { UserFormData } from "~/types";
import type { UserPermissions } from "~/types/permissions";
import bcrypt from "bcryptjs";

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe("users.service", () => {
  beforeEach(() => {
    mockUsers.length = 0;
    mockUsers.push(
      {
        id: "user-1",
        companyId: "company-1",
        name: "User 1",
        email: "user1@test.com",
        phone: "1234567890",
        status: "active",
        mainUser: false,
        createdAt: "2025-01-01",
        password: "$2a$10$hashedpassword1",
      },
      {
        id: "user-2",
        companyId: "company-1",
        name: "User 2",
        email: "user2@test.com",
        phone: "0987654321",
        status: "active",
        mainUser: false,
        createdAt: "2025-01-02",
        password: "$2a$10$hashedpassword2",
      },
      {
        id: "user-3",
        companyId: "company-2",
        name: "User 3",
        email: "user3@test.com",
        phone: "5555555555",
        status: "pending",
        mainUser: false,
        createdAt: "2025-01-03",
        password: "$2a$10$hashedpassword3",
      }
    );

    mockCompanies.length = 0;
    mockCompanies.push({
      id: "company-1",
      companyName: "Company 1",
      cnpj: "12.345.678/0001-90",
      email: "company1@test.com",
      phone: "1234567890",
      street: "Street 1",
      number: "123",
      complement: "",
      neighborhood: "Neighborhood 1",
      city: "City 1",
      state: "State 1",
      zipCode: "12345-678",
      createdAt: "2025-01-01",
    });

    vi.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user when ID exists", () => {
      const result = getUserById("user-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("user-1");
      expect(result?.name).toBe("User 1");
    });

    it("should return undefined when ID is undefined", () => {
      const result = getUserById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getUsersByCompanyId", () => {
    it("should return all users for a company", () => {
      const result = getUsersByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("user-1");
      expect(result[1].id).toBe("user-2");
    });

    it("should return empty array when no users exist for company", () => {
      const result = getUsersByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("updateUser", () => {
    it("should update an existing user", () => {
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "9999999999",
        password: "newpassword",
        confirmPassword: "newpassword",
      };

      updateUser("user-1", updateData);

      const updated = mockUsers.find((u) => u.id === "user-1");
      expect(updated?.name).toBe("Updated User");
      expect(updated?.email).toBe("updated@test.com");
      expect(updated?.phone).toBe("9999999999");
      expect(updated?.password).toBeUndefined();
      expect(updated?.confirmPassword).toBeUndefined();
    });

    it("should not update when user does not exist", () => {
      const originalLength = mockUsers.length;
      const updateData: UserFormData = {
        name: "Updated User",
        email: "updated@test.com",
        phone: "9999999999",
      };

      updateUser("non-existent-id", updateData);

      expect(mockUsers.length).toBe(originalLength);
    });

    it("should remove password and confirmPassword fields", () => {
      const updateData: UserFormData = {
        name: "User 1",
        email: "user1@test.com",
        phone: "1234567890",
        password: "password",
        confirmPassword: "password",
      };

      updateUser("user-1", updateData);

      const updated = mockUsers.find((u) => u.id === "user-1");
      expect(updated?.password).toBeUndefined();
      expect(updated?.confirmPassword).toBeUndefined();
    });
  });

  describe("updateUserPermissions", () => {
    it("should update permissions for an existing user", () => {
      const permissions: UserPermissions = {
        registration: {
          animals: { view: true, add: true, edit: false, remove: false },
          property: { view: false, add: false, edit: false, remove: false },
          location: { view: false, add: false, edit: false, remove: false },
          employee: { view: false, add: false, edit: false, remove: false },
          serviceProvider: { view: false, add: false, edit: false, remove: false },
          supplier: { view: false, add: false, edit: false, remove: false },
          buyer: { view: false, add: false, edit: false, remove: false },
          inventory: { view: false, add: false, edit: false, remove: false },
        },
        records: {
          births: { view: false, add: false, edit: false, remove: false },
          acquisitions: { view: false, add: false, edit: false, remove: false },
          weighings: { view: false, add: false, edit: false, remove: false },
          sales: { view: true, add: true, edit: true, remove: false },
          deaths: { view: false, add: false, edit: false, remove: false },
          sanitaryControls: { view: false, add: false, edit: false, remove: false },
          locationMovements: { view: false, add: false, edit: false, remove: false },
          animalMovements: { view: false, add: false, edit: false, remove: false },
          inventoryMovements: { view: false, add: false, edit: false, remove: false },
        },
        breedings: {
          breedings: { view: false, add: false, edit: false, remove: false },
          unconfirmedBreedings: { view: false, add: false, edit: false, remove: false },
          pregnantCows: { view: false, add: false, edit: false, remove: false },
          reproductiveIndexes: { view: false, add: false, edit: false, remove: false },
          birthForecast: { view: false, add: false, edit: false, remove: false },
        },
        finances: {
          cashFlow: { view: false, add: false, edit: false, remove: false },
          accountsPayable: { view: false, add: false, edit: false, remove: false },
          accountsReceivable: { view: false, add: false, edit: false, remove: false },
          bankAccounts: { view: false, add: false, edit: false, remove: false },
        },
        reports: {
          analytics: { view: false, add: false, edit: false, remove: false },
          financialReports: { view: false, add: false, edit: false, remove: false },
          animalReports: { view: false, add: false, edit: false, remove: false },
          productionReports: { view: false, add: false, edit: false, remove: false },
          inventoryReports: { view: false, add: false, edit: false, remove: false },
        },
      };

      updateUserPermissions("user-1", permissions);

      const updated = mockUsers.find((u) => u.id === "user-1");
      expect(updated?.permissions).toEqual(permissions);
    });

    it("should not update when user does not exist", () => {
      const permissions: UserPermissions = {
        registration: {
          animals: { view: true, add: true, edit: false, remove: false },
          property: { view: false, add: false, edit: false, remove: false },
          location: { view: false, add: false, edit: false, remove: false },
          employee: { view: false, add: false, edit: false, remove: false },
          serviceProvider: { view: false, add: false, edit: false, remove: false },
          supplier: { view: false, add: false, edit: false, remove: false },
          buyer: { view: false, add: false, edit: false, remove: false },
          inventory: { view: false, add: false, edit: false, remove: false },
        },
        records: {
          births: { view: false, add: false, edit: false, remove: false },
          acquisitions: { view: false, add: false, edit: false, remove: false },
          weighings: { view: false, add: false, edit: false, remove: false },
          sales: { view: false, add: false, edit: false, remove: false },
          deaths: { view: false, add: false, edit: false, remove: false },
          sanitaryControls: { view: false, add: false, edit: false, remove: false },
          locationMovements: { view: false, add: false, edit: false, remove: false },
          animalMovements: { view: false, add: false, edit: false, remove: false },
          inventoryMovements: { view: false, add: false, edit: false, remove: false },
        },
        breedings: {
          breedings: { view: false, add: false, edit: false, remove: false },
          unconfirmedBreedings: { view: false, add: false, edit: false, remove: false },
          pregnantCows: { view: false, add: false, edit: false, remove: false },
          reproductiveIndexes: { view: false, add: false, edit: false, remove: false },
          birthForecast: { view: false, add: false, edit: false, remove: false },
        },
        finances: {
          cashFlow: { view: false, add: false, edit: false, remove: false },
          accountsPayable: { view: false, add: false, edit: false, remove: false },
          accountsReceivable: { view: false, add: false, edit: false, remove: false },
          bankAccounts: { view: false, add: false, edit: false, remove: false },
        },
        reports: {
          analytics: { view: false, add: false, edit: false, remove: false },
          financialReports: { view: false, add: false, edit: false, remove: false },
          animalReports: { view: false, add: false, edit: false, remove: false },
          productionReports: { view: false, add: false, edit: false, remove: false },
          inventoryReports: { view: false, add: false, edit: false, remove: false },
        },
      };

      updateUserPermissions("non-existent-id", permissions);

      // Should not throw error, just do nothing
      expect(mockUsers.find((u) => u.id === "non-existent-id")).toBeUndefined();
    });
  });

  describe("addUser", () => {
    it("should add a new user with generated ID", () => {
      const newUser: UserFormData & { password: string } = {
        name: "New User",
        email: "newuser@test.com",
        phone: "1111111111",
        password: "password123",
      };

      const result = addUser(newUser);

      expect(result.id).toMatch(/^550e8400-e29b-41d4-a716-/);
      expect(result.name).toBe("New User");
      expect(result.email).toBe("newuser@test.com");
      expect(result.phone).toBe("1111111111");
      expect(result.status).toBe("pending");
      expect(result.mainUser).toBe(false);
      expect(result.companyId).toBe("company-1");
      expect(result.password).toBe("$2a$10$MyHqC7lONCHhrYYtZgUoEu3xR61lWfbQwSKfWOJVrNGZF.JbrUVQW");
      expect(result.createdAt).toBeDefined();
      expect(mockUsers).toHaveLength(4);
    });

    it("should use default company ID when no companies exist", () => {
      mockCompanies.length = 0;
      const newUser: UserFormData & { password: string } = {
        name: "New User",
        email: "newuser@test.com",
        phone: "1111111111",
        password: "password123",
      };

      const result = addUser(newUser);

      expect(result.companyId).toBe("");
    });

    it("should generate sequential IDs based on users length", () => {
      mockUsers.length = 0;
      const newUser1: UserFormData & { password: string } = {
        name: "User 1",
        email: "user1@test.com",
        phone: "1111111111",
        password: "password123",
      };
      const newUser2: UserFormData & { password: string } = {
        name: "User 2",
        email: "user2@test.com",
        phone: "2222222222",
        password: "password123",
      };

      const result1 = addUser(newUser1);
      const result2 = addUser(newUser2);

      expect(result1.id).toMatch(/^550e8400-e29b-41d4-a716-000000000000$/);
      expect(result2.id).toMatch(/^550e8400-e29b-41d4-a716-000000000001$/);
    });
  });

  describe("authenticateUser", () => {
    it("should return user when credentials are valid", async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authenticateUser("user1@test.com", "password123");

      expect(result).toBeDefined();
      expect(result?.id).toBe("user-1");
      expect(result?.email).toBe("user1@test.com");
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "$2a$10$hashedpassword1");
    });

    it("should return null when user does not exist", async () => {
      const result = await authenticateUser("nonexistent@test.com", "password123");

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should return null when user status is not active", async () => {
      const result = await authenticateUser("user3@test.com", "password123");

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should return null when user has no password", async () => {
      mockUsers[0].password = undefined;
      const result = await authenticateUser("user1@test.com", "password123");

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should return null when password is invalid", async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await authenticateUser("user1@test.com", "wrongpassword");

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", "$2a$10$hashedpassword1");
    });
  });
});
