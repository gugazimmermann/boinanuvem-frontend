import type { Payment } from "~/types/payment";
import { PaymentStatus } from "~/types/payment";
import { mockPayments } from "~/mocks/payments";
import { findById, findByField } from "./base-service";
import { apiClient, ApiError } from "./api-client";

/**
 * Backend payment response structure
 */
interface BackendPayment {
  id: string;
  companyId: string;
  subscriptionId: string | null;
  amount: number | string; // Can be Decimal from Prisma
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paymentMethod: string | null;
  paymentDate: string | null;
  dueDate: string;
  description: string | null;
  externalId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    id: string;
    planId: string;
    plan?: {
      id: string;
      name: string;
      price: number | string;
    };
  } | null;
}

/**
 * Map backend payment to frontend Payment type
 */
function mapBackendPaymentToFrontend(backendPayment: BackendPayment): Payment {
  const amount =
    typeof backendPayment.amount === "string"
      ? Number.parseFloat(backendPayment.amount)
      : backendPayment.amount;

  // Extract month from dueDate (YYYY-MM-DD format)
  const dueDate = new Date(backendPayment.dueDate);
  const month = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}`;

  // Get plan name from subscription or use default
  const plan = backendPayment.subscription?.plan?.name || "N/A";

  // Map backend status to frontend PaymentStatus
  let status: PaymentStatus;
  switch (backendPayment.status) {
    case "paid":
      status = PaymentStatus.PAID;
      break;
    case "pending":
      status = PaymentStatus.PENDING;
      break;
    case "failed":
      status = PaymentStatus.FAILED;
      break;
    default:
      status = PaymentStatus.PENDING;
  }

  return {
    id: backendPayment.id,
    companyId: backendPayment.companyId,
    month,
    plan,
    amount,
    status,
    invoiceId: backendPayment.id, // Use payment ID as invoice ID for now
    createdAt: backendPayment.createdAt,
  };
}

/**
 * Get payments by company ID from the backend
 */
export async function getPaymentsByCompanyId(companyId: string): Promise<Payment[]> {
  try {
    const backendPayments: BackendPayment[] = await apiClient.get(`/payments/company/${companyId}`);
    return backendPayments.map(mapBackendPaymentToFrontend);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Access denied to this company");
      }
      if (error.status === 404) {
        // Return empty array if company not found
        return [];
      }
      console.error("Failed to fetch payments from API:", error.message);
      // Fallback to mock data on error
      return findByField(mockPayments, "companyId", companyId);
    }
    console.error("Unexpected error fetching payments:", error);
    // Fallback to mock data on error
    return findByField(mockPayments, "companyId", companyId);
  }
}

/**
 * Get payment by ID from the backend
 */
export async function getPaymentById(paymentId: string): Promise<Payment | undefined> {
  try {
    const backendPayment: BackendPayment = await apiClient.get(`/payments/${paymentId}`);
    return mapBackendPaymentToFrontend(backendPayment);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return undefined;
      }
      if (error.status === 403) {
        throw new Error("Access denied to this payment");
      }
      console.error("Failed to fetch payment from API:", error.message);
    }
    console.error("Unexpected error fetching payment:", error);
    // Fallback to mock data
    return findById(mockPayments, paymentId);
  }
}
