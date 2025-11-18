import type { AccountsPayable, AccountsPayableFormData } from "~/types";
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ap0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ap0e8400-e29b-41d4-a716-446655440009";

export function getAccountsPayableById(
  transactionId: string | undefined
): AccountsPayable | undefined {
  return findById(mockAccountsPayable, transactionId);
}

export function getAccountsPayableByCompanyId(companyId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "companyId", companyId);
}

export function getAccountsPayableBySupplierId(supplierId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "supplierId", supplierId);
}

export function getAccountsPayableByPropertyId(propertyId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "propertyId", propertyId);
}

export function getAccountsPayableByEmployeeId(employeeId: string): AccountsPayable[] {
  return findByField(mockAccountsPayable, "employeeId", employeeId);
}

export function getAccountsPayableByServiceProviderId(
  serviceProviderId: string
): AccountsPayable[] {
  return findByField(mockAccountsPayable, "serviceProviderId", serviceProviderId);
}

export function addAccountsPayable(data: AccountsPayableFormData): AccountsPayable {
  return createEntity(mockAccountsPayable, data, ID_PREFIX, DEFAULT_ID);
}

export function updateAccountsPayable(
  transactionId: string,
  data: Partial<AccountsPayableFormData>
): boolean {
  return updateEntity(mockAccountsPayable, transactionId, data);
}

export function deleteAccountsPayable(transactionId: string): boolean {
  return deleteEntity(mockAccountsPayable, transactionId);
}
