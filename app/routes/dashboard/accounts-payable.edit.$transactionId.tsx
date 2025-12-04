import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getAccountsPayableViewRoute } from "~/routes.config";
import { getAccountsPayableById, updateAccountsPayable } from "~/services/accounts-payable.service";
import type { AccountsPayableFormData } from "~/types";
import { createFinanceEditMeta } from "~/utils/finance-edit-route-helpers";
import { mapAccountsPayableToFormData } from "~/utils/finance-edit-helpers";
import {
  FinanceTransactionFormPage,
  type FinanceTransactionFormData,
} from "~/components/dashboard/finance/finance-transaction-form-page";

export const meta = createFinanceEditMeta("Conta a Pagar", "Editar conta a pagar");

export { createFinanceEditLoader as loader } from "~/utils/finance-edit-route-helpers";

export default function EditAccountsPayable() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const transaction = getAccountsPayableById(transactionId);

  const initialData = useMemo(() => mapAccountsPayableToFormData(transaction), [transaction]);

  return (
    <FinanceTransactionFormPage
      transactionType="accounts-payable"
      mode="edit"
      title={t.accountsPayable.edit.title}
      description={t.accountsPayable.edit.description}
      submitButtonLabel={t.accountsPayable.edit.save}
      loadingLabel={t.common.loading}
      backRoute={ROUTES.ACCOUNTS_PAYABLE}
      viewRoute={getAccountsPayableViewRoute}
      transactionId={transactionId}
      initialData={initialData}
      translationKeys={{
        descriptionLabel: t.accountsPayable.edit.descriptionLabel,
        amountLabel: t.accountsPayable.edit.amountLabel,
        dueDateLabel: t.accountsPayable.edit.dueDateLabel,
        propertyLabel: t.accountsPayable.edit.propertyLabel,
      }}
      onSubmit={
        ((data: AccountsPayableFormData) => {
          if (!transactionId) return;
          updateAccountsPayable(transactionId, {
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
          });
        }) as (data: FinanceTransactionFormData) => void | { id: string }
      }
      onSuccess={() => {
        setTimeout(() => {
          if (transactionId) {
            navigate(getAccountsPayableViewRoute(transactionId));
          }
        }, 1500);
      }}
      successMessage={t.accountsPayable.success.updated}
      errorMessage={t.accountsPayable.errors.updateFailed}
      emptyStateTitle={t.accountsPayable.emptyState.title}
    />
  );
}
