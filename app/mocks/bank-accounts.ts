import type { BankAccount, BankAccountFormData } from "~/types";

export type { BankAccount, BankAccountFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

export const mockBankAccounts: BankAccount[] = [
  {
    id: "ba0e8400-e29b-41d4-a716-446655440010",
    companyId: COMPANY_ID,
    bankName: "Banco do Brasil",
    bankCode: "001",
    branch: "1234",
    accountNumber: "12345-6",
    accountType: "checking",
    accountHolderName: "JOSE AUGUSTO DE NEGREIROS LTDA",
    status: "active",
    createdAt: "2025-01-01",
  },
  {
    id: "ba0e8400-e29b-41d4-a716-446655440011",
    companyId: COMPANY_ID,
    bankName: "Banco Bradesco",
    bankCode: "237",
    branch: "5678",
    accountNumber: "98765-4",
    accountType: "savings",
    accountHolderName: "JOSE AUGUSTO DE NEGREIROS LTDA",
    status: "active",
    createdAt: "2025-01-15",
  },
  {
    id: "ba0e8400-e29b-41d4-a716-446655440012",
    companyId: COMPANY_ID,
    bankName: "Caixa Econômica Federal",
    bankCode: "104",
    branch: "9012",
    accountNumber: "54321-0",
    accountType: "checking",
    accountHolderName: "JOSE AUGUSTO DE NEGREIROS LTDA",
    status: "active",
    createdAt: "2025-02-01",
  },
];
