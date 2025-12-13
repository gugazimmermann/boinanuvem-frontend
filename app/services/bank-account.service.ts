import type { BankAccount, BankAccountFormData } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";

const bankAccountErrors = createResourceErrorMessages("contas bancárias");

/**
 * Transform backend BankAccountResponseDto to frontend BankAccount type
 */
function transformBankAccount(backendBA: BankAccount): BankAccount {
  return {
    ...backendBA,
    createdAt:
      typeof backendBA.createdAt === "string"
        ? backendBA.createdAt
        : new Date(backendBA.createdAt).toISOString(),
  };
}

/**
 * Get all bank accounts for the current user's company via API
 */
export async function getBankAccountsByCompanyId(_companyId: string): Promise<BankAccount[]> {
  try {
    const accounts = await apiClient.get<BankAccount[]>("/bank-accounts");
    return accounts.map(transformBankAccount);
  } catch (error) {
    try {
      handleApiError(error, bankAccountErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single bank account by ID via API
 */
export async function getBankAccountById(
  bankAccountId: string | undefined
): Promise<BankAccount | undefined> {
  if (!bankAccountId) return undefined;
  try {
    const account = await apiClient.get<BankAccount>(`/bank-accounts/${bankAccountId}`);
    return transformBankAccount(account);
  } catch (error) {
    try {
      handleApiError(error, {
        ...bankAccountErrors.view,
        403: "Você não tem permissão para visualizar esta conta bancária",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new bank account via API
 */
export async function addBankAccount(data: BankAccountFormData): Promise<BankAccount> {
  try {
    const createDto = {
      bankName: data.bankName,
      bankCode: data.bankCode,
      branch: data.branch,
      accountNumber: data.accountNumber,
      accountType: data.accountType,
      accountHolderName: data.accountHolderName,
      status: data.status || "active",
    };

    const response = await apiClient.post<BankAccount>("/bank-accounts", createDto);
    return transformBankAccount(response);
  } catch (error) {
    handleApiError(error, {
      ...bankAccountErrors.create,
      409: "Já existe uma conta bancária com estes dados",
    });
  }
}

/**
 * Update a bank account via API
 */
export async function updateBankAccount(
  bankAccountId: string,
  data: Partial<BankAccountFormData>
): Promise<BankAccount> {
  try {
    const updateDto: Record<string, unknown> = {};
    if (data.bankName !== undefined) updateDto.bankName = data.bankName;
    if (data.bankCode !== undefined) updateDto.bankCode = data.bankCode;
    if (data.branch !== undefined) updateDto.branch = data.branch;
    if (data.accountNumber !== undefined) updateDto.accountNumber = data.accountNumber;
    if (data.accountType !== undefined) updateDto.accountType = data.accountType;
    if (data.accountHolderName !== undefined) updateDto.accountHolderName = data.accountHolderName;
    if (data.status !== undefined) updateDto.status = data.status;

    const response = await apiClient.put<BankAccount>(`/bank-accounts/${bankAccountId}`, updateDto);
    return transformBankAccount(response);
  } catch (error) {
    handleApiError(error, {
      ...bankAccountErrors.update,
      409: "Já existe uma conta bancária com estes dados",
    });
  }
}

/**
 * Delete a bank account via API
 */
export async function deleteBankAccount(bankAccountId: string): Promise<void> {
  try {
    await apiClient.delete(`/bank-accounts/${bankAccountId}`);
  } catch (error) {
    handleApiError(error, bankAccountErrors.delete);
  }
}
