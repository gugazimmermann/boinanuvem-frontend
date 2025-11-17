import type { CashFlow, CashFlowFormData } from "~/types";
import { mockCashFlow } from "~/mocks/cash-flow";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "cc0e8400-e29b-41d4-a716";
const DEFAULT_ID = "cc0e8400-e29b-41d4-a716-446655440009";

/**
 * Get cash flow transaction by ID
 */
export function getCashFlowById(transactionId: string | undefined): CashFlow | undefined {
  return findById(mockCashFlow, transactionId);
}

/**
 * Get cash flow transactions by company ID
 */
export function getCashFlowByCompanyId(companyId: string): CashFlow[] {
  return findByField(mockCashFlow, "companyId", companyId);
}

/**
 * Get cash flow transactions by bank account ID
 */
export function getCashFlowByBankAccountId(bankAccountId: string): CashFlow[] {
  return findByField(mockCashFlow, "bankAccountId", bankAccountId);
}

/**
 * Add a new cash flow transaction
 */
export function addCashFlow(data: CashFlowFormData): CashFlow {
  return createEntity(mockCashFlow, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update a cash flow transaction
 */
export function updateCashFlow(transactionId: string, data: Partial<CashFlowFormData>): boolean {
  return updateEntity(mockCashFlow, transactionId, data);
}

/**
 * Delete a cash flow transaction
 */
export function deleteCashFlow(transactionId: string): boolean {
  return deleteEntity(mockCashFlow, transactionId);
}
