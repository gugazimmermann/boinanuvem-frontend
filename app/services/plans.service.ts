import { apiClient, ApiError } from "./api-client";
import type { Plan, PlansApiResponse, GetPlansParams } from "~/types/plan";

/**
 * Plans API service for fetching pricing plans from the backend
 */
export class PlansService {
  /**
   * Fetch all plans from the backend API
   * @param params - Query parameters for filtering plans
   * @returns Promise resolving to an array of plans
   */
  async getPlans(params?: GetPlansParams): Promise<Plan[]> {
    const finalParams: GetPlansParams = params || { status: "active" };
    try {
      const queryParams: Record<string, string> = {};

      if (finalParams.status) {
        queryParams.status = finalParams.status;
      }

      const plans: PlansApiResponse = await apiClient.get("/plans", queryParams);
      return plans;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Failed to fetch plans from API:", error.message);
        throw new Error(`Failed to fetch plans: ${error.message}`);
      }
      console.error("Unexpected error fetching plans:", error);
      throw new Error("Failed to fetch plans due to unexpected error");
    }
  }

  /**
   * Get active plans only (convenience method)
   * @returns Promise resolving to an array of active plans
   */
  async getActivePlans(): Promise<Plan[]> {
    return this.getPlans({ status: "active" });
  }

  /**
   * Get all plans regardless of status (convenience method)
   * @returns Promise resolving to an array of all plans
   */
  async getAllPlans(): Promise<Plan[]> {
    return this.getPlans({ status: "all" });
  }
}

// Default plans service instance
export const plansService = new PlansService();

/**
 * Standalone function for fetching plans (for use in React Router loaders)
 * @param params - Query parameters for filtering plans
 * @returns Promise resolving to an array of plans
 */
export async function fetchPlans(params?: GetPlansParams): Promise<Plan[]> {
  const finalParams: GetPlansParams = params || { status: "active" };
  return plansService.getPlans(finalParams);
}
