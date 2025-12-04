import { CashFlowCategory, PaymentMethod } from "~/types";
import type {
  AccountsReceivable,
  AccountsPayable,
  AccountsReceivableFormData,
  AccountsPayableFormData,
} from "~/types";

/**
 * Maps an AccountsReceivable transaction to form data
 */
export function mapAccountsReceivableToFormData(
  transaction: AccountsReceivable | undefined
): Partial<AccountsReceivableFormData> | undefined {
  if (!transaction) return undefined;
  return {
    buyerId: transaction.buyerId || "",
    amount: transaction.amount,
    dueDate: transaction.dueDate,
    description: transaction.description,
    category: transaction.category || CashFlowCategory.CATTLE_SALES,
    paymentMethod: transaction.paymentMethod || PaymentMethod.CASH,
    status: transaction.status,
    paidDate: transaction.paidDate || "",
    paidAmount: transaction.paidAmount,
    referenceNumber: transaction.referenceNumber || "",
    bankAccountId: transaction.bankAccountId || "",
    propertyId: transaction.propertyId,
  };
}

/**
 * Maps an AccountsPayable transaction to form data
 */
export function mapAccountsPayableToFormData(
  transaction: AccountsPayable | undefined
): Partial<AccountsPayableFormData> | undefined {
  if (!transaction) return undefined;
  return {
    supplierId: transaction.supplierId || "",
    employeeId: transaction.employeeId || "",
    serviceProviderId: transaction.serviceProviderId || "",
    amount: transaction.amount,
    dueDate: transaction.dueDate,
    description: transaction.description,
    category: transaction.category || CashFlowCategory.FEED,
    paymentMethod: transaction.paymentMethod || PaymentMethod.CASH,
    status: transaction.status,
    paidDate: transaction.paidDate || "",
    paidAmount: transaction.paidAmount,
    referenceNumber: transaction.referenceNumber || "",
    bankAccountId: transaction.bankAccountId || "",
    propertyId: transaction.propertyId,
  };
}
