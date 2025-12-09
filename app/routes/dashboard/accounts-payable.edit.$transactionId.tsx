import { ROUTES, getAccountsPayableViewRoute } from "~/routes.config";
import { getAccountsPayableById, updateAccountsPayable } from "~/services/accounts-payable.service";
import type { AccountsPayableFormData } from "~/types";
import { createFinanceEditMeta, createFinanceEditRoute } from "~/utils/finance-edit-route-helpers";
import { mapAccountsPayableToFormData } from "~/utils/finance-edit-helpers";

export const meta = createFinanceEditMeta("Conta a Pagar", "Editar conta a pagar");

export { createFinanceEditLoader as loader } from "~/utils/finance-edit-route-helpers";

export default createFinanceEditRoute<AccountsPayableFormData>({
  transactionType: "accounts-payable",
  getTransactionById: getAccountsPayableById,
  mapToFormData: mapAccountsPayableToFormData as <T>(
    transaction: T
  ) => Partial<AccountsPayableFormData> | undefined,
  updateTransaction: updateAccountsPayable,
  backRoute: ROUTES.ACCOUNTS_PAYABLE,
  viewRoute: getAccountsPayableViewRoute,
  getTranslationKeys: (t) => ({
    title: t.accountsPayable.edit.title,
    description: t.accountsPayable.edit.description,
    save: t.accountsPayable.edit.save,
    descriptionLabel: t.accountsPayable.edit.descriptionLabel,
    amountLabel: t.accountsPayable.edit.amountLabel,
    dueDateLabel: t.accountsPayable.edit.dueDateLabel,
    propertyLabel: t.accountsPayable.edit.propertyLabel,
  }),
  getSuccessMessage: (t) => t.accountsPayable.success.updated,
  getErrorMessage: (t) => t.accountsPayable.errors.updateFailed,
  getEmptyStateTitle: (t) => t.accountsPayable.emptyState.title,
  mapFormDataToUpdate: (data) => ({
    supplierId: data.supplierId,
    employeeId: data.employeeId,
    serviceProviderId: data.serviceProviderId,
    amount: data.amount,
    dueDate: data.dueDate,
    description: data.description,
    category: data.category,
    paymentMethod: data.paymentMethod,
    status: data.status,
    paidDate: data.paidDate,
    paidAmount: data.paidAmount,
    referenceNumber: data.referenceNumber,
    bankAccountId: data.bankAccountId,
    propertyId: data.propertyId,
  }),
});
