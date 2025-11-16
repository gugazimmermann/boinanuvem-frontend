import type { TeamUser, UserFormData } from "~/types";
import type { UserPermissions } from "~/types/permissions";
import { mockUsers } from "~/mocks/users";
import { mockCompanies } from "~/mocks/companies";
import { findById, findByField, updateEntity, createEntity } from "./base-service";

const ID_PREFIX = "550e8400-e29b-41d4-a716";
const DEFAULT_PASSWORD_HASH = "$2b$10$9c7eBs.MydmDkdO6SworA.ENm1i1yiT62zIzVrxJTecnU6Tl1ZhVu";

/**
 * Get user by ID
 */
export function getUserById(userId: string | undefined): TeamUser | undefined {
  return findById(mockUsers, userId);
}

/**
 * Get users by company ID
 */
export function getUsersByCompanyId(companyId: string): TeamUser[] {
  return findByField(mockUsers, "companyId", companyId);
}

/**
 * Update user
 */
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

/**
 * Update user role
 */
export function updateUserRole(userId: string, role: "admin" | "manager" | "user"): void {
  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].role = role;
  }
}

/**
 * Update user permissions
 */
export function updateUserPermissions(userId: string, permissions: UserPermissions): void {
  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].permissions = permissions;
  }
}

/**
 * Add a new user
 */
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

