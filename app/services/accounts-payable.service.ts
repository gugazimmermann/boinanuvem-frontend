import type { AccountsPayable, AccountsPayableFormData } from "~/types";
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ap0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ap0e8400-e29b-41d4-a716-446655440009";

/**
 * Get accounts payable transaction by ID
 */
export function getAccountsPayableById(
  transactionId: string | undefined
): AccountsPayable | undefined {
  return findById(mockAccountsPayable, transactionId);
}

/**
 * Get accounts payable transactions by company ID
 */
export function getAccountsPayableByCompanyId(companyId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "companyId", companyId);
}

/**
 * Get accounts payable transactions by supplier ID
 */
export function getAccountsPayableBySupplierId(supplierId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "supplierId", supplierId);
}

/**
 * Get accounts payable transactions by property ID
 */
export function getAccountsPayableByPropertyId(propertyId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "propertyId", propertyId);
}

/**
 * Get accounts payable transactions by employee ID
 */
export function getAccountsPayableByEmployeeId(employeeId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "employeeId", employeeId);
}

/**
 * Get accounts payable transactions by service provider ID
 */
export function getAccountsPayableByServiceProviderId(
  serviceProviderId: string
): AccountsPayable[] {
  return findByField(mockAccountsPayable, "serviceProviderId", serviceProviderId);
}

/**
 * Add a new accounts payable transaction
 */
export function addAccountsPayable(data: AccountsPayableFormData): AccountsPayable {
  return createEntity(mockAccountsPayable, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update an accounts payable transaction
 */
export function updateAccountsPayable(
  transactionId: string,
  data: Partial<AccountsPayableFormData>
): boolean {
  return updateEntity(mockAccountsPayable, transactionId, data);
}

/**
 * Delete an accounts payable transaction
 */
export function deleteAccountsPayable(transactionId: string): boolean {
  return deleteEntity(mockAccountsPayable, transactionId);
}
