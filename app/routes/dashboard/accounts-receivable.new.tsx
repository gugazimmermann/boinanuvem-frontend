import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addAccountsReceivable } from "~/services/accounts-receivable.service";
import type { AccountsReceivableFormData } from "~/types";
import { createFormMeta } from "~/utils/route-helpers";
import {
  FinanceTransactionFormPage,
  type FinanceTransactionFormData,
} from "~/components/dashboard/finance/finance-transaction-form-page";

export function meta() {
  return createFormMeta("Adicionar", "Conta a Receber", "Adicionar nova conta a receber");
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewAccountsReceivable() {
  const t = useTranslation();
  const navigate = useNavigate();

  return (
    <FinanceTransactionFormPage
      transactionType="accounts-receivable"
      mode="new"
      title={t.accountsReceivable.addTransaction}
      description={t.accountsReceivable.new.description}
      submitButtonLabel={t.accountsReceivable.new.addButton}
      loadingLabel={t.common.loading}
      backRoute={ROUTES.ACCOUNTS_RECEIVABLE}
      translationKeys={{
        descriptionLabel: t.accountsReceivable.new.descriptionLabel,
        amountLabel: t.accountsReceivable.new.amountLabel,
        dueDateLabel: t.accountsReceivable.new.dueDateLabel,
        propertyLabel: t.accountsReceivable.new.propertyLabel,
      }}
      observationLabels={{
        observation: t.accountsReceivable.details.observation || "Observação",
        observationPlaceholder:
          t.accountsReceivable.details.observationPlaceholder ||
          "Adicione uma observação (opcional)",
        files: t.accountsReceivable.details.files || "Anexos",
        filesHelper:
          t.accountsReceivable.details.filesHelper ||
          "Você pode anexar múltiplos arquivos à observação",
      }}
      onSubmit={
        (async (data: AccountsReceivableFormData) => {
          const result = await addAccountsReceivable(data);
          return { id: result.id };
        }) as (data: FinanceTransactionFormData) => Promise<void | { id: string }>
      }
      onSuccess={() => {
        setTimeout(() => {
          navigate(ROUTES.ACCOUNTS_RECEIVABLE);
        }, 1500);
      }}
      successMessage={t.accountsReceivable.new.success}
      errorMessage={t.accountsReceivable.new.error}
    />
  );
}
