import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getCashFlowViewRoute } from "~/routes.config";
import { getCashFlowById, updateCashFlow } from "~/services/cash-flow.service";
import type { CashFlowFormData } from "~/types";
import { createFormMeta } from "~/utils/route-helpers";
import {
  FinanceTransactionFormPage,
  type FinanceTransactionFormData,
} from "~/components/dashboard/finance/finance-transaction-form-page";

export function meta() {
  return createFormMeta("Editar", "Transação", "Editar transação de fluxo de caixa");
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditCashFlow() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const transaction = getCashFlowById(transactionId);

  const initialData = useMemo(() => {
    if (!transaction) return undefined;
    return {
      type: transaction.type,
      amount: transaction.amount.toString(),
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      supplierId: transaction.supplierId || "",
      buyerId: transaction.buyerId || "",
      employeeId: transaction.employeeId || "",
      serviceProviderId: transaction.serviceProviderId || "",
      paymentDate: transaction.paymentDate || "",
      referenceNumber: transaction.referenceNumber || "",
      bankAccountId: transaction.bankAccountId || "",
      propertyId: transaction.propertyId,
    };
  }, [transaction]);

  return (
    <FinanceTransactionFormPage
      transactionType="cash-flow"
      mode="edit"
      title={t.cashFlow.edit.title}
      description={t.cashFlow.edit.description}
      submitButtonLabel={t.cashFlow.edit.save}
      loadingLabel={t.common.loading}
      backRoute={ROUTES.CASH_FLOW}
      viewRoute={getCashFlowViewRoute}
      transactionId={transactionId}
      initialData={initialData as Partial<CashFlowFormData> | undefined}
      translationKeys={{
        descriptionLabel: t.cashFlow.edit.descriptionLabel,
        amountLabel: t.cashFlow.edit.amountLabel,
        dateLabel: t.cashFlow.edit.dateLabel,
        propertyLabel: t.cashFlow.edit.propertyLabel,
      }}
      onSubmit={
        ((data: CashFlowFormData) => {
          if (!transactionId) return;
          updateCashFlow(transactionId, {
            type: data.type,
            amount: data.amount,
            date: data.date,
            description: data.description,
            category: data.category,
            paymentMethod: data.paymentMethod,
            supplierId: data.supplierId,
            buyerId: data.buyerId,
            employeeId: data.employeeId,
            serviceProviderId: data.serviceProviderId,
            paymentDate: data.paymentDate,
            referenceNumber: data.referenceNumber,
            bankAccountId: data.bankAccountId,
            propertyId: data.propertyId,
          });
        }) as (data: FinanceTransactionFormData) => void | { id: string }
      }
      onSuccess={() => {
        setTimeout(() => {
          if (transactionId) {
            navigate(getCashFlowViewRoute(transactionId));
          }
        }, 1500);
      }}
      successMessage={t.cashFlow.success.updated}
      errorMessage={t.cashFlow.errors.updateFailed}
      emptyStateTitle={t.cashFlow.emptyState.title}
    />
  );
}
