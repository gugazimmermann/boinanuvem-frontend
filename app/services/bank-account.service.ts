import type { BankAccount, BankAccountFormData } from "~/types";
import { mockBankAccounts } from "~/mocks/bank-accounts";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ba0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ba0e8400-e29b-41d4-a716-446655440009";

/**
 * Get bank account by ID
 */
export function getBankAccountById(bankAccountId: string | undefined): BankAccount | undefined {
  return findById(mockBankAccounts, bankAccountId);
}

/**
 * Get bank accounts by company ID
 */
export function getBankAccountsByCompanyId(companyId: string): BankAccount[] {
  return findByField(mockBankAccounts, "companyId", companyId);
}

/**
 * Add a new bank account
 */
export function addBankAccount(data: BankAccountFormData): BankAccount {
  return createEntity(mockBankAccounts, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update a bank account
 */
export function updateBankAccount(
  bankAccountId: string,
  data: Partial<BankAccountFormData>
): boolean {
  return updateEntity(mockBankAccounts, bankAccountId, data);
}

/**
 * Delete a bank account
 */
export function deleteBankAccount(bankAccountId: string): boolean {
  return deleteEntity(mockBankAccounts, bankAccountId);
}
