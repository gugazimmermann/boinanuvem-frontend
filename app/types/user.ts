/**
 * User-related types
 */

export type UserRole = "admin" | "manager" | "user";

export interface UserFormData {
  name: string;
  cpf?: string;
  email: string;
  phone: string;
  role?: UserRole;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  password?: string;
  confirmPassword?: string;
}

export interface TeamUser extends UserFormData, Record<string, unknown> {
  id: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}
