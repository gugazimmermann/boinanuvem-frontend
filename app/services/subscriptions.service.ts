import { apiClient, ApiError } from "./api-client";
import type { Subscription } from "~/types/subscription";

export interface CreateCheckoutSessionRequest {
  planId: string;
  billingCycle: "monthly" | "annual";
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CreateSubscriptionWithPaymentMethodRequest {
  planId: string;
  billingCycle: "monthly" | "annual";
  paymentMethodId: string;
}

export interface ConfirmSubscriptionRequest {
  sessionId: string;
}

// Type alias for API response consistency
export type SubscriptionResponse = Subscription;

/**
 * Get current active subscription for the company
 * Note: This uses the company data which includes currentSubscription
 * For a direct API call, you would need to add a GET endpoint to the backend
 */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  // Since there's no GET endpoint yet, we'll need to get it from company data
  // This is a placeholder - in practice, you'd fetch from company.currentSubscription
  // or add a GET /subscriptions/current endpoint to the backend
  return null;
}

/**
 * Create a Stripe checkout session for subscription
 * @deprecated Use createSubscriptionWithPaymentMethod instead
 */
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  try {
    return await apiClient.post<CreateCheckoutSessionResponse>("/subscriptions/checkout", request);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Access denied. Only main users can create subscriptions.");
      }
      if (error.status === 404) {
        throw new Error("Plan not found");
      }
      if (error.status === 400) {
        throw new Error("Invalid request. Please check your plan selection.");
      }
    }
    throw error;
  }
}

/**
 * Create subscription with payment method from Stripe Elements
 */
export async function createSubscriptionWithPaymentMethod(
  request: CreateSubscriptionWithPaymentMethodRequest
): Promise<SubscriptionResponse> {
  try {
    return await apiClient.post<SubscriptionResponse>("/subscriptions/create", request);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Access denied. Only main users can create subscriptions.");
      }
      if (error.status === 404) {
        throw new Error("Plan not found");
      }
      if (error.status === 400) {
        throw new Error(error.message || "Invalid request. Please check your payment method.");
      }
    }
    throw error;
  }
}

/**
 * Confirm subscription after successful payment
 */
export async function confirmSubscription(
  request: ConfirmSubscriptionRequest
): Promise<SubscriptionResponse> {
  try {
    return await apiClient.post<SubscriptionResponse>("/subscriptions/confirm", request);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Access denied");
      }
      if (error.status === 404) {
        throw new Error("Session not found or invalid");
      }
      if (error.status === 400) {
        throw new Error("Payment verification failed. Please contact support.");
      }
    }
    throw error;
  }
}

export interface CancelSubscriptionRequest {
  cancelImmediately?: boolean;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  request: CancelSubscriptionRequest = {}
): Promise<SubscriptionResponse> {
  try {
    return await apiClient.post<SubscriptionResponse>(
      `/subscriptions/${subscriptionId}/cancel`,
      request
    );
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Access denied. Only main users can cancel subscriptions.");
      }
      if (error.status === 404) {
        throw new Error("Subscription not found");
      }
      if (error.status === 400) {
        throw new Error("Cannot cancel this subscription. It may be a trial subscription.");
      }
    }
    throw error;
  }
}

/**
 * Sync subscription status from Stripe
 */
export async function syncSubscriptionStatus(
  subscriptionId: string
): Promise<SubscriptionResponse> {
  try {
    return await apiClient.post<SubscriptionResponse>(`/subscriptions/${subscriptionId}/sync`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Access denied");
      }
      if (error.status === 404) {
        throw new Error("Subscription not found");
      }
      if (error.status === 400) {
        throw new Error("Subscription does not have a Stripe subscription ID.");
      }
    }
    throw error;
  }
}

export interface CreatePortalSessionRequest {
  returnUrl?: string;
}

export interface CreatePortalSessionResponse {
  url: string;
}

/**
 * Create a customer portal session for self-service subscription management
 */
export async function createCustomerPortalSession(
  request: CreatePortalSessionRequest = {}
): Promise<CreatePortalSessionResponse> {
  try {
    return await apiClient.post<CreatePortalSessionResponse>("/subscriptions/portal", request);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Access denied. Only main users can access the customer portal.");
      }
      if (error.status === 400) {
        throw new Error(
          "Company does not have a Stripe customer ID. Please create a subscription first."
        );
      }
    }
    throw error;
  }
}
