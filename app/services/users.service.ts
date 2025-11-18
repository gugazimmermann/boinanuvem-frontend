import type { TeamUser, UserFormData } from "~/types";
import type { UserPermissions } from "~/types/permissions";
import { mockUsers } from "~/mocks/users";
import { mockCompanies } from "~/mocks/companies";
import { findById, findByField } from "./base-service";
const DEFAULT_PASSWORD_HASH = "$2b$10$9c7eBs.MydmDkdO6SworA.ENm1i1yiT62zIzVrxJTecnU6Tl1ZhVu";

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

export function updateUserRole(userId: string, role: "admin" | "manager" | "user"): void {
  const userIndex = mockUsers.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].role = role;
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
