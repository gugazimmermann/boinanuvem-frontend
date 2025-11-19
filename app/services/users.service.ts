import type { TeamUser, UserFormData } from "~/types";
import type { UserPermissions } from "~/types/permissions";
import { mockUsers } from "~/mocks/users";
import { mockCompanies } from "~/mocks/companies";
import { findById, findByField } from "./base-service";
import bcrypt from "bcryptjs";
const DEFAULT_PASSWORD_HASH = "$2a$10$MyHqC7lONCHhrYYtZgUoEu3xR61lWfbQwSKfWOJVrNGZF.JbrUVQW";

export function getUserById(userId: string | undefined): TeamUser | undefined {
  return findById(mockUsers, userId);
}

export function getUsersByCompanyId(companyId: string): TeamUser[] {
  return findByField(mockUsers, "companyId", companyId);
}

export function updateUser(userId: string, data: UserFormData): void {
  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...data,
      password: undefined,
      confirmPassword: undefined,
    };
  }
}

export function updateUserPermissions(userId: string, permissions: UserPermissions): void {
  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].permissions = permissions;
  }
}

export function addUser(data: UserFormData & { password: string }): TeamUser {
  const company = mockCompanies[0];
  const newUser: TeamUser = {
    ...data,
    id: `550e8400-e29b-41d4-a716-${String(mockUsers.length).padStart(12, "0")}`,
    status: "pending",
    mainUser: false,
    companyId: company?.id || "",
    createdAt: new Date().toISOString().split("T")[0],
    password: DEFAULT_PASSWORD_HASH,
  };
  mockUsers.push(newUser);
  return newUser;
}

export async function authenticateUser(email: string, password: string): Promise<TeamUser | null> {
  const user = mockUsers.find((u) => u.email === email);

  if (!user) {
    return null;
  }

  // Only allow active users to login
  if (user.status !== "active") {
    return null;
  }

  // Validate password using bcryptjs
  if (!user.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return user;
}
