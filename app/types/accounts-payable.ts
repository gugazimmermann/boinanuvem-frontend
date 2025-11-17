import { PaymentMethod, CashFlowCategory } from "./cash-flow";

export enum AccountsPayableStatus {
  PAID = "paid",
  UNPAID = "unpaid",
  OVERDUE = "overdue",
  PARTIAL = "partial",
}

export interface AccountsPayable extends Record<string, unknown> {
  id: string;
  companyId: string;
  supplierId?: string;
  employeeId?: string;
  serviceProviderId?: string;
  amount: number;
  dueDate: string;
  description: string;
  category?: CashFlowCategory;
  paymentMethod?: PaymentMethod;
  status: AccountsPayableStatus;
  paidDate?: string;
  paidAmount?: number;
  referenceNumber?: string;
  observation?: string;
  fileIds?: string[];
  bankAccountId?: string;
  propertyId: string;
  createdAt: string;
}

export interface AccountsPayableFormData {
  companyId: string;
  supplierId?: string;
  employeeId?: string;
  serviceProviderId?: string;
  amount: number;
  dueDate: string;
  description: string;
  category?: CashFlowCategory;
  paymentMethod?: PaymentMethod;
  status: AccountsPayableStatus;
  paidDate?: string;
  paidAmount?: number;
  referenceNumber?: string;
  observation?: string;
  fileIds?: string[];
  bankAccountId?: string;
  propertyId: string;
}
