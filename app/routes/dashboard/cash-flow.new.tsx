import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addCashFlow } from "~/services/cash-flow.service";
import type { CashFlowFormData } from "~/types";
import { createFormMeta } from "~/utils/route-helpers";
import {
  FinanceTransactionFormPage,
  type FinanceTransactionFormData,
} from "~/components/dashboard/finance/finance-transaction-form-page";

export function meta() {
  return createFormMeta("Adicionar", "Transação", "Adicionar nova transação de fluxo de caixa");
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewCashFlow() {
  const t = useTranslation();
  const navigate = useNavigate();

  return (
    <FinanceTransactionFormPage
      transactionType="cash-flow"
      mode="new"
      title={t.cashFlow.addTransaction}
      description={t.cashFlow.new.description}
      submitButtonLabel={t.cashFlow.new.addButton}
      loadingLabel={t.common.loading}
      backRoute={ROUTES.CASH_FLOW}
      translationKeys={{
        descriptionLabel: t.cashFlow.new.descriptionLabel,
        amountLabel: t.cashFlow.new.amountLabel,
        dateLabel: t.cashFlow.new.dateLabel,
        propertyLabel: t.cashFlow.new.propertyLabel,
      }}
      observationLabels={{
        observation: t.cashFlow.details.observation || "Observação",
        observationPlaceholder:
          t.cashFlow.details.observationPlaceholder || "Adicione uma observação (opcional)",
        files: t.cashFlow.details.files || "Anexos",
        filesHelper:
          t.cashFlow.details.filesHelper || "Você pode anexar múltiplos arquivos à observação",
      }}
      onSubmit={
        (async (data: CashFlowFormData) => {
          const result = await addCashFlow(data);
          return { id: result.id };
        }) as (data: FinanceTransactionFormData) => Promise<void | { id: string }>
      }
      onSuccess={() => {
        setTimeout(() => {
          navigate(ROUTES.CASH_FLOW);
        }, 1500);
      }}
      successMessage={t.cashFlow.new.success}
      errorMessage={t.cashFlow.new.error}
      formClassName="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow"
    />
  );
}
