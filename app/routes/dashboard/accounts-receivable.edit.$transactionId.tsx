import { ROUTES, getAccountsReceivableViewRoute } from "~/routes.config";
import {
  getAccountsReceivableById,
  updateAccountsReceivable,
} from "~/services/accounts-receivable.service";
import type { AccountsReceivableFormData } from "~/types";
import { createFinanceEditMeta, createFinanceEditRoute } from "~/utils/finance-edit-route-helpers";
import { mapAccountsReceivableToFormData } from "~/utils/finance-edit-helpers";

export const meta = createFinanceEditMeta("Conta a Receber", "Editar conta a receber");

export { createFinanceEditLoader as loader } from "~/utils/finance-edit-route-helpers";

export default createFinanceEditRoute<AccountsReceivableFormData>({
  transactionType: "accounts-receivable",
  getTransactionById: getAccountsReceivableById,
  mapToFormData: mapAccountsReceivableToFormData as <T>(
    transaction: T
  ) => Partial<AccountsReceivableFormData> | undefined,
  updateTransaction: async (id: string, data: Partial<AccountsReceivableFormData>) => {
    await updateAccountsReceivable(id, data);
  },
  backRoute: ROUTES.ACCOUNTS_RECEIVABLE,
  viewRoute: getAccountsReceivableViewRoute,
  getTranslationKeys: (t) => ({
    title: t.accountsReceivable.edit.title,
    description: t.accountsReceivable.edit.description,
    save: t.accountsReceivable.edit.save,
    descriptionLabel: t.accountsReceivable.edit.descriptionLabel,
    amountLabel: t.accountsReceivable.edit.amountLabel,
    dueDateLabel: t.accountsReceivable.edit.dueDateLabel,
    propertyLabel: t.accountsReceivable.edit.propertyLabel,
  }),
  getSuccessMessage: (t) => t.accountsReceivable.success.updated,
  getErrorMessage: (t) => t.accountsReceivable.errors.updateFailed,
  getEmptyStateTitle: (t) => t.accountsReceivable.emptyState.title,
  mapFormDataToUpdate: (data) => ({
    buyerId: data.buyerId,
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
