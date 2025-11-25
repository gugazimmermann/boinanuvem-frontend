/**
 * Plan-related type definitions matching the backend API structure
 */

export interface PlanLimits {
  properties: string;
  locations: string;
  animals: string;
  members: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  limits: PlanLimits;
  features: string[];
  popular: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PlansApiResponse = Plan[];

export interface GetPlansParams {
  status?: "active" | "inactive" | "all";
}
