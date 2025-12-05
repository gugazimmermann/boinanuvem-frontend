import type { UserFormData } from "~/types";
import type { UserPermissions } from "~/types/permissions";
import { apiClient, ApiError } from "./api-client";

export interface FullUserProfile {
  id: string;
  name: string;
  cpf: string | null;
  email: string;
  phone: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  mainUser: boolean;
  status: string;
  companyId: string;
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
  emailVerifiedAt: string | null;
  company: unknown;
}

export interface UpdateUserDto {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface UpdatePermissionsDto {
  registration: {
    property: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    location: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    employee: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    serviceProvider: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    supplier: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    buyer: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    inventory: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    animals: { view: boolean; add: boolean; edit: boolean; remove: boolean };
  };
  records: {
    births: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    acquisitions: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    weighings: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    sales: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    deaths: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    sanitaryControls: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    locationMovements: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    animalMovements: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    inventoryMovements: { view: boolean; add: boolean; edit: boolean; remove: boolean };
  };
  breedings: {
    breedings: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    unconfirmedBreedings: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    pregnantCows: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    reproductiveIndexes: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    birthForecast: { view: boolean; add: boolean; edit: boolean; remove: boolean };
  };
  finances: {
    cashFlow: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    accountsPayable: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    accountsReceivable: { view: boolean; add: boolean; edit: boolean; remove: boolean };
    bankAccounts: { view: boolean; add: boolean; edit: boolean; remove: boolean };
  };
}

/**
 * Get current user's full profile from backend
 */
export async function getCurrentUser(): Promise<FullUserProfile> {
  try {
    return await apiClient.get<FullUserProfile>("/users/me");
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        throw new Error("Authentication required");
      }
      if (error.status === 404) {
        throw new Error("User not found");
      }
    }
    throw error;
  }
}

/**
 * Get team members list (main user only)
 */
export async function getTeamMembers(): Promise<FullUserProfile[]> {
  try {
    return await apiClient.get<FullUserProfile[]>("/users");
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Only main users can view team members");
      }
      if (error.status === 401) {
        throw new Error("Authentication required");
      }
    }
    throw error;
  }
}

/**
 * Update current user's profile
 * Note: data should already be unmasked (CPF, phone, CEP) before calling this function
 */
export async function updateCurrentUser(data: UserFormData): Promise<FullUserProfile> {
  try {
    const updateDto: UpdateUserDto = {
      name: data.name,
      cpf: data.cpf || undefined,
      email: data.email,
      phone: data.phone || undefined,
      street: data.street || undefined,
      number: data.number || undefined,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zipCode || undefined,
    };

    return await apiClient.put<FullUserProfile>("/users/me", updateDto);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        throw new Error("Authentication required");
      }
      if (error.status === 409) {
        throw new Error("Email already exists");
      }
      if (error.status === 400) {
        throw new Error("Invalid user data");
      }
    }
    throw error;
  }
}

/**
 * Update team member profile (main user only)
 */
export async function updateTeamMember(
  userId: string,
  data: UserFormData
): Promise<FullUserProfile> {
  try {
    const updateDto: UpdateUserDto = {
      name: data.name,
      cpf: data.cpf || undefined,
      email: data.email,
      phone: data.phone || undefined,
      street: data.street || undefined,
      number: data.number || undefined,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zipCode || undefined,
    };

    return await apiClient.put<FullUserProfile>(`/users/${userId}`, updateDto);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Only main users can update team members");
      }
      if (error.status === 404) {
        throw new Error("User not found");
      }
      if (error.status === 409) {
        throw new Error("Email already exists");
      }
      if (error.status === 400) {
        throw new Error("Invalid user data");
      }
    }
    throw error;
  }
}

/**
 * Create team member (main user only)
 * Password is optional - if not provided, user will set it via email invitation
 */
export async function createTeamMember(
  data: UserFormData & { password?: string }
): Promise<FullUserProfile> {
  try {
    const createDto: UpdateUserDto & { password?: string } = {
      name: data.name,
      cpf: data.cpf || undefined,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password || undefined,
      street: data.street || undefined,
      number: data.number || undefined,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zipCode || undefined,
    };

    return await apiClient.post<FullUserProfile>("/users", createDto);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Only main users can create team members");
      }
      if (error.status === 409) {
        throw new Error("Um usuário com este email já existe. Por favor, use outro email.");
      }
      if (error.status === 400) {
        throw new Error("Invalid user data");
      }
    }
    throw error;
  }
}

/**
 * Update team member permissions (main user only)
 */
export async function updateTeamMemberPermissions(
  userId: string,
  permissions: UserPermissions
): Promise<FullUserProfile> {
  try {
    const updateDto: UpdatePermissionsDto = {
      registration: {
        property: permissions.registration.property,
        location: permissions.registration.location,
        employee: permissions.registration.employee,
        serviceProvider: permissions.registration.serviceProvider,
        supplier: permissions.registration.supplier,
        buyer: permissions.registration.buyer,
        inventory: permissions.registration.inventory,
        animals: permissions.registration.animals,
      },
      records: {
        births: permissions.records.births,
        acquisitions: permissions.records.acquisitions,
        weighings: permissions.records.weighings,
        sales: permissions.records.sales,
        deaths: permissions.records.deaths,
        sanitaryControls: permissions.records.sanitaryControls,
        locationMovements: permissions.records.locationMovements,
        animalMovements: permissions.records.animalMovements,
        inventoryMovements: permissions.records.inventoryMovements,
      },
      breedings: {
        breedings: permissions.breedings.breedings,
        unconfirmedBreedings: permissions.breedings.unconfirmedBreedings,
        pregnantCows: permissions.breedings.pregnantCows,
        reproductiveIndexes: permissions.breedings.reproductiveIndexes,
        birthForecast: permissions.breedings.birthForecast,
      },
      finances: {
        cashFlow: permissions.finances.cashFlow,
        accountsPayable: permissions.finances.accountsPayable,
        accountsReceivable: permissions.finances.accountsReceivable,
        bankAccounts: permissions.finances.bankAccounts,
      },
    };

    return await apiClient.put<FullUserProfile>(`/users/${userId}/permissions`, updateDto);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Only main users can update permissions");
      }
      if (error.status === 404) {
        throw new Error("User not found");
      }
      if (error.status === 400) {
        throw new Error("Invalid permissions data");
      }
    }
    throw error;
  }
}

/**
 * Delete/deactivate team member (main user only)
 */
export async function deleteTeamMember(userId: string): Promise<void> {
  try {
    await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Only main users can delete team members");
      }
      if (error.status === 404) {
        throw new Error("User not found");
      }
    }
    throw error;
  }
}
