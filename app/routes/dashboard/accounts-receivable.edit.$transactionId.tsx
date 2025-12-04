import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getAccountsReceivableViewRoute } from "~/routes.config";
import {
  getAccountsReceivableById,
  updateAccountsReceivable,
} from "~/services/accounts-receivable.service";
import type { AccountsReceivableFormData } from "~/types";
import { createFinanceEditMeta } from "~/utils/finance-edit-route-helpers";
import { mapAccountsReceivableToFormData } from "~/utils/finance-edit-helpers";
import {
  FinanceTransactionFormPage,
  type FinanceTransactionFormData,
} from "~/components/dashboard/finance/finance-transaction-form-page";

export const meta = createFinanceEditMeta("Conta a Receber", "Editar conta a receber");

export { createFinanceEditLoader as loader } from "~/utils/finance-edit-route-helpers";

export default function EditAccountsReceivable() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const transaction = getAccountsReceivableById(transactionId);

  const initialData = useMemo(() => mapAccountsReceivableToFormData(transaction), [transaction]);

  return (
    <FinanceTransactionFormPage
      transactionType="accounts-receivable"
      mode="edit"
      title={t.accountsReceivable.edit.title}
      description={t.accountsReceivable.edit.description}
      submitButtonLabel={t.accountsReceivable.edit.save}
      loadingLabel={t.common.loading}
      backRoute={ROUTES.ACCOUNTS_RECEIVABLE}
      viewRoute={getAccountsReceivableViewRoute}
      transactionId={transactionId}
      initialData={initialData}
      translationKeys={{
        descriptionLabel: t.accountsReceivable.edit.descriptionLabel,
        amountLabel: t.accountsReceivable.edit.amountLabel,
        dueDateLabel: t.accountsReceivable.edit.dueDateLabel,
        propertyLabel: t.accountsReceivable.edit.propertyLabel,
      }}
      onSubmit={
        ((data: AccountsReceivableFormData) => {
          if (!transactionId) return;
          updateAccountsReceivable(transactionId, {
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
          });
        }) as (data: FinanceTransactionFormData) => void | { id: string }
      }
      onSuccess={() => {
        setTimeout(() => {
          if (transactionId) {
            navigate(getAccountsReceivableViewRoute(transactionId));
          }
        }, 1500);
      }}
      successMessage={t.accountsReceivable.success.updated}
      errorMessage={t.accountsReceivable.errors.updateFailed}
      emptyStateTitle={t.accountsReceivable.emptyState.title}
    />
  );
}
