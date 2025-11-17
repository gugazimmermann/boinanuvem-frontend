import { PaymentMethod, CashFlowCategory } from "./cash-flow";

export enum AccountsReceivableStatus {
  PAID = "paid",
  UNPAID = "unpaid",
  OVERDUE = "overdue",
  PARTIAL = "partial",
}

export interface AccountsReceivable extends Record<string, unknown> {
  id: string;
  companyId: string;
  buyerId?: string;
  amount: number;
  dueDate: string;
  description: string;
  category?: CashFlowCategory;
  paymentMethod?: PaymentMethod;
  status: AccountsReceivableStatus;
  paidDate?: string;
  paidAmount?: number;
  referenceNumber?: string;
  observation?: string;
  fileIds?: string[];
  bankAccountId?: string;
  propertyId: string;
  createdAt: string;
}

export interface AccountsReceivableFormData {
  companyId: string;
  buyerId?: string;
  amount: number;
  dueDate: string;
  description: string;
  category?: CashFlowCategory;
  paymentMethod?: PaymentMethod;
  status: AccountsReceivableStatus;
  paidDate?: string;
  paidAmount?: number;
  referenceNumber?: string;
  observation?: string;
  fileIds?: string[];
  bankAccountId?: string;
  propertyId: string;
}
