import { describe, it, expect } from "vitest";
import {
  mockUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserPermissions,
  addUser,
} from "../users";
import type { UserFormData } from "~/types";
import type { UserPermissions } from "~/types/permissions";

describe("Users Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

  describe("getUserById", () => {
    it("should return user by id", () => {
      if (mockUsers.length > 0) {
        const user = getUserById(mockUsers[0].id);
        expect(user).toBeDefined();
        expect(user?.id).toBe(mockUsers[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const user = getUserById("non-existent-id");
      expect(user).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const user = getUserById(undefined);
      expect(user).toBeUndefined();
    });
  });

  describe("updateUser", () => {
    it("should update a user", () => {
      if (mockUsers.length > 0) {
        const user = mockUsers[0];
        const updateData: UserFormData = {
          name: "Updated Name",
          email: "updated@example.com",
          phone: "47999999999",
        };

        updateUser(user.id, updateData);
        const updated = getUserById(user.id);
        expect(updated?.name).toBe(updateData.name);
        expect(updated?.email).toBe(updateData.email);
        expect(updated?.phone).toBe(updateData.phone);
      }
    });

    it("should not update password fields", () => {
      if (mockUsers.length > 0) {
        const user = mockUsers[0];
        const originalPassword = user.password;
        const updateData: UserFormData = {
          name: "Test",
          password: "newpassword",
          confirmPassword: "newpassword",
        };

        updateUser(user.id, updateData);
        const updated = getUserById(user.id);
        expect(updated?.password).toBe(originalPassword);
      }
    });
  });

  describe("updateUserRole", () => {
    it("should update user role", () => {
      if (mockUsers.length > 0) {
        const user = mockUsers[0];
        updateUserRole(user.id, "manager");
        const updated = getUserById(user.id);
        expect(updated?.role).toBe("manager");
      }
    });
  });

  describe("updateUserPermissions", () => {
    it("should update user permissions", () => {
      if (mockUsers.length > 0) {
        const user = mockUsers[0];
        const permissions: UserPermissions = {
          properties: { view: true, create: false, edit: false, delete: false },
          animals: { view: true, create: true, edit: false, delete: false },
        };

        updateUserPermissions(user.id, permissions);
        const updated = getUserById(user.id);
        expect(updated?.permissions).toEqual(permissions);
      }
    });
  });

  describe("addUser", () => {
    it("should add a new user", () => {
      const initialCount = mockUsers.length;
      const newUserData: UserFormData & { password: string } = {
        name: "New User",
        cpf: "123.456.789-00",
        email: "newuser@example.com",
        password: "password123",
        phone: "47999999999",
        street: "Test Street",
        number: "123",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addUser(newUserData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.name).toBe(newUserData.name);
      expect(added.email).toBe(newUserData.email);
      expect(added.status).toBe("pending");
      expect(added.mainUser).toBe(false);
      expect(added.password).toBeDefined();
      expect(mockUsers.length).toBe(initialCount + 1);
    });
  });
});

