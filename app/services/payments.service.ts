import type { Payment } from "~/types/payment";
import { mockPayments } from "~/mocks/payments";
import { findById, findByField } from "./base-service";

export function getPaymentsByCompanyId(companyId: string): Payment[] {
  return findByField(mockPayments, "companyId", companyId);
}

export function getPaymentById(paymentId: string): Payment | undefined {
  return findById(mockPayments, paymentId);
}
