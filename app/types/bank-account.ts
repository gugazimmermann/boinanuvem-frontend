export type BankAccountType = "checking" | "savings";

export interface BankAccount extends Record<string, unknown> {
  id: string;
  companyId: string;
  bankName: string;
  bankCode: string;
  branch: string;
  accountNumber: string;
  accountType: BankAccountType;
  accountHolderName: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface BankAccountFormData {
  companyId: string;
  bankName: string;
  bankCode: string;
  branch: string;
  accountNumber: string;
  accountType: BankAccountType;
  accountHolderName: string;
  status: "active" | "inactive";
}
