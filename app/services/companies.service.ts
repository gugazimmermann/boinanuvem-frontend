import { apiClient, ApiError } from "./api-client";

export interface EnhancedCompany {
  id: string;
  cnpj: string;
  companyName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  planId?: string;
  status: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialStatus?: string;
  createdAt: string;
  updatedAt: string;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    mainUser: boolean;
    status: string;
    createdAt: string;
    lastAccess?: string | null;
  }>;
  subscriptions?: unknown[];
  plan?: unknown;
  trial: {
    isOnTrial: boolean;
    isTrialExpired: boolean;
    trialDaysRemaining: number;
    trialStartDate: string | null;
    trialEndDate: string | null;
    trialStatus: string | null;
  };
  currentPlan: unknown;
  currentSubscription: unknown;
}

export interface UpdateCompanyDto {
  companyName?: string;
  email?: string;
  phone?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get company by ID from the backend
 */
export async function getCompany(companyId: string): Promise<EnhancedCompany> {
  try {
    return await apiClient.get<EnhancedCompany>(`/companies/${companyId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error("Company not found");
      }
      if (error.status === 403) {
        throw new Error("Access denied to this company");
      }
    }
    throw error;
  }
}

/**
 * Update company information
 */
export async function updateCompany(
  companyId: string,
  data: UpdateCompanyDto
): Promise<EnhancedCompany> {
  try {
    return await apiClient.put<EnhancedCompany>(`/companies/${companyId}`, data);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error("Company not found");
      }
      if (error.status === 403) {
        throw new Error("Access denied. Only main users can update company information");
      }
      if (error.status === 409) {
        throw new Error("Company with this email already exists");
      }
    }
    throw error;
  }
}
