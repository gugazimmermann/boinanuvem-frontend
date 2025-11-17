import type { AccountsReceivable, AccountsReceivableFormData } from "~/types";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ar0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ar0e8400-e29b-41d4-a716-446655440009";

/**
 * Get accounts receivable transaction by ID
 */
export function getAccountsReceivableById(
  transactionId: string | undefined
): AccountsReceivable | undefined {
  return findById(mockAccountsReceivable, transactionId);
}

/**
 * Get accounts receivable transactions by company ID
 */
export function getAccountsReceivableByCompanyId(companyId: string): AccountsReceivable[] {
  return findByField(mockAccountsReceivable, "companyId", companyId);
}

/**
 * Get accounts receivable transactions by buyer ID
 */
export function getAccountsReceivableByBuyerId(buyerId: string): AccountsReceivable[] {
  return findByField(mockAccountsReceivable, "buyerId", buyerId);
}

/**
 * Get accounts receivable transactions by property ID
 */
export function getAccountsReceivableByPropertyId(propertyId: string): AccountsReceivable[] {
  return findByField(mockAccountsReceivable, "propertyId", propertyId);
}

/**
 * Add a new accounts receivable transaction
 */
export function addAccountsReceivable(data: AccountsReceivableFormData): AccountsReceivable {
  return createEntity(mockAccountsReceivable, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update an accounts receivable transaction
 */
export function updateAccountsReceivable(
  transactionId: string,
  data: Partial<AccountsReceivableFormData>
): boolean {
  return updateEntity(mockAccountsReceivable, transactionId, data);
}

/**
 * Delete an accounts receivable transaction
 */
export function deleteAccountsReceivable(transactionId: string): boolean {
  return deleteEntity(mockAccountsReceivable, transactionId);
}
