import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getUserById,
  getUsersByCompanyId,
  updateUser,
  updateUserPermissions,
  addUser,
} from "../users.service";
import { mockUsers } from "~/mocks/users";
import type { UserFormData, UserPermissions } from "~/types";
import { defaultPermissions } from "~/types/permissions";

vi.mock("~/mocks/users", () => ({
  mockUsers: [],
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Company",
      cnpj: "12345678000190",
    },
  ],
}));

describe("users.service", () => {
  beforeEach(() => {
    mockUsers.length = 0;
    mockUsers.push(
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        cpf: "12345678900",
        email: "john@example.com",
        password: "hashed-password",
        phone: "47999999999",
        status: "active",
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "SC",
        zipCode: "88000000",
        mainUser: true,
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: "2020-01-01",
        permissions: defaultPermissions,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Jane Smith",
        cpf: "98765432100",
        email: "jane@example.com",
        password: "hashed-password",
        phone: "47988888888",
        status: "pending",
        street: "Second St",
        number: "456",
        complement: "",
        neighborhood: "Uptown",
        city: "City",
        state: "SC",
        zipCode: "88000001",
        mainUser: false,
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: "2020-01-02",
        permissions: defaultPermissions,
      }
    );
  });

  describe("getUserById", () => {
    it("should return user when ID exists", () => {
      const result = getUserById("550e8400-e29b-41d4-a716-446655440000");
      expect(result).toBeDefined();
      expect(result?.name).toBe("John Doe");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getUserById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getUserById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getUsersByCompanyId", () => {
    it("should return users for specific company", () => {
      const result = getUsersByCompanyId("550e8400-e29b-41d4-a716-446655440000");
      expect(result).toHaveLength(2);
      expect(
        result.every((user) => user.companyId === "550e8400-e29b-41d4-a716-446655440000")
      ).toBe(true);
    });

    it("should return empty array when company has no users", () => {
      const result = getUsersByCompanyId("nonexistent-company");
      expect(result).toHaveLength(0);
    });
  });

  describe("updateUser", () => {
    it("should update existing user", () => {
      const formData: UserFormData = {
        name: "John Updated",
        email: "john.updated@example.com",
        phone: "47977777777",
        cpf: "12345678900",
        street: "New St",
        number: "999",
        complement: "",
        neighborhood: "New Neighborhood",
        city: "New City",
        state: "PR",
        zipCode: "99999999",
      };

      updateUser("550e8400-e29b-41d4-a716-446655440000", formData);

      const updated = mockUsers.find((u) => u.id === "550e8400-e29b-41d4-a716-446655440000");
      expect(updated?.name).toBe("John Updated");
      expect(updated?.email).toBe("john.updated@example.com");
      expect(updated?.password).toBeUndefined();
      expect(updated?.confirmPassword).toBeUndefined();
    });

    it("should not update password fields", () => {
      const formData: UserFormData = {
        name: "John",
        email: "john@example.com",
        phone: "47999999999",
        cpf: "12345678900",
        password: "new-password",
        confirmPassword: "new-password",
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "SC",
        zipCode: "88000000",
      };

      updateUser("550e8400-e29b-41d4-a716-446655440000", formData);

      const updated = mockUsers.find((u) => u.id === "550e8400-e29b-41d4-a716-446655440000");
      expect(updated?.password).toBeUndefined();
      expect(updated?.confirmPassword).toBeUndefined();
    });

    it("should not update non-existent user", () => {
      const initialUsers = [...mockUsers];
      updateUser("nonexistent-id", { name: "New Name" } as UserFormData);
      expect(mockUsers).toEqual(initialUsers);
    });
  });

  describe("updateUserPermissions", () => {
    it("should update user permissions", () => {
      const newPermissions: UserPermissions = {
        registration: {
          property: { view: true, add: true, edit: true, remove: true },
          location: { view: true, add: false, edit: false, remove: false },
          employee: { view: true, add: false, edit: false, remove: false },
          serviceProvider: { view: false, add: false, edit: false, remove: false },
          supplier: { view: false, add: false, edit: false, remove: false },
          buyer: { view: false, add: false, edit: false, remove: false },
          inventory: { view: false, add: false, edit: false, remove: false },
          animals: { view: false, add: false, edit: false, remove: false },
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
      };

      updateUserPermissions("550e8400-e29b-41d4-a716-446655440001", newPermissions);

      const updated = mockUsers.find((u) => u.id === "550e8400-e29b-41d4-a716-446655440001");
      expect(updated?.permissions).toEqual(newPermissions);
    });

    it("should not update non-existent user", () => {
      const initialUsers = [...mockUsers];
      updateUserPermissions("nonexistent-id", defaultPermissions);
      expect(mockUsers).toEqual(initialUsers);
    });
  });

  describe("addUser", () => {
    it("should add new user with default values", () => {
      const formData: UserFormData & { password: string } = {
        name: "New User",
        email: "newuser@example.com",
        phone: "47966666666",
        cpf: "11122233344",
        password: "password123",
        street: "Third St",
        number: "789",
        complement: "",
        neighborhood: "Suburb",
        city: "City",
        state: "SC",
        zipCode: "88000002",
      };

      const initialLength = mockUsers.length;
      const result = addUser(formData);

      expect(mockUsers).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.name).toBe("New User");
      expect(result.status).toBe("pending");
      expect(result.mainUser).toBe(false);
      expect(result.companyId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.createdAt).toBeDefined();
      expect(result.password).toBeDefined();
    });
  });
});
