import { describe, it, expect } from "vitest";
import { mockUsers } from "../users";
import type { TeamUser } from "~/types";

describe("users mock", () => {
  it("should export mockUsers array", () => {
    expect(Array.isArray(mockUsers)).toBe(true);
    expect(mockUsers.length).toBeGreaterThan(0);
  });

  it("should have valid user structure", () => {
    mockUsers.forEach((user: TeamUser) => {
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("cpf");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("password");
      expect(user).toHaveProperty("phone");
      expect(user).toHaveProperty("role");
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

      expect(typeof user.id).toBe("string");
      expect(typeof user.name).toBe("string");
      expect(typeof user.cpf).toBe("string");
      expect(typeof user.email).toBe("string");
      expect(typeof user.password).toBe("string");
      expect(typeof user.phone).toBe("string");
      expect(typeof user.role).toBe("string");
      expect(typeof user.status).toBe("string");
      expect(typeof user.street).toBe("string");
      expect(typeof user.number).toBe("string");
      expect(typeof user.neighborhood).toBe("string");
      expect(typeof user.city).toBe("string");
      expect(typeof user.state).toBe("string");
      expect(typeof user.zipCode).toBe("string");
      expect(typeof user.mainUser).toBe("boolean");
      expect(typeof user.companyId).toBe("string");
      expect(typeof user.createdAt).toBe("string");
    });
  });

  it("should have valid CPF format", () => {
    mockUsers.forEach((user: TeamUser) => {
      expect(user.cpf).toMatch(/^[\d.-]+$/);
    });
  });

  it("should have valid email format", () => {
    mockUsers.forEach((user: TeamUser) => {
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("should have valid role", () => {
    mockUsers.forEach((user: TeamUser) => {
      expect(["admin", "manager", "user"]).toContain(user.role);
    });
  });

  it("should have valid status", () => {
    mockUsers.forEach((user: TeamUser) => {
      expect(["active", "inactive", "pending"]).toContain(user.status);
    });
  });

  it("should have valid date format", () => {
    mockUsers.forEach((user: TeamUser) => {
      expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(user.createdAt)).not.toThrow();
    });
  });

  it("should have valid lastAccess format when present", () => {
    mockUsers.forEach((user: TeamUser) => {
      if (user.lastAccess) {
        expect(typeof user.lastAccess).toBe("string");
        expect(() => new Date(user.lastAccess!)).not.toThrow();
      }
    });
  });

  it("should have unique IDs", () => {
    const ids = mockUsers.map((u) => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have at least one main user", () => {
    const mainUsers = mockUsers.filter((u) => u.mainUser);
    expect(mainUsers.length).toBeGreaterThan(0);
  });

  it("should have hashed password", () => {
    mockUsers.forEach((user: TeamUser) => {
      expect(user.password).toMatch(/^\$2[aby]\$/);
    });
  });
});

