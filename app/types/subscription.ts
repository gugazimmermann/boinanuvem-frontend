export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "trial"
  | "past_due"
  | "unpaid";

export type BillingCycle = "monthly" | "annual";

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  limits: {
    properties: string;
    locations: string;
    animals: string;
    members: string;
  };
  features: string[];
  popular: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  billingCycle: BillingCycle;
  isActive: boolean;
  isTrial: boolean;
  trialEndDate: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}
