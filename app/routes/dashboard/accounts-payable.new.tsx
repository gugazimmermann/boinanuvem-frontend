import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import type { AccountsPayableFormData } from "~/types";
import { createFormMeta } from "~/utils/route-helpers";
import {
  FinanceTransactionFormPage,
  type FinanceTransactionFormData,
} from "~/components/dashboard/finance/finance-transaction-form-page";

export function meta() {
  return createFormMeta("Adicionar", "Conta a Pagar", "Adicionar nova conta a pagar");
}

export default function NewAccountsPayable() {
  const t = useTranslation();
  const navigate = useNavigate();

  return (
    <FinanceTransactionFormPage
      transactionType="accounts-payable"
      mode="new"
      title={t.accountsPayable.addTransaction}
      description={t.accountsPayable.new.description}
      submitButtonLabel={t.accountsPayable.new.addButton}
      loadingLabel={t.common.loading}
      backRoute={ROUTES.ACCOUNTS_PAYABLE}
      translationKeys={{
        descriptionLabel: t.accountsPayable.new.descriptionLabel,
        amountLabel: t.accountsPayable.new.amountLabel,
        dueDateLabel: t.accountsPayable.new.dueDateLabel,
        propertyLabel: t.accountsPayable.new.propertyLabel,
      }}
      observationLabels={{
        observation: t.accountsPayable.details.observation || "Observação",
        observationPlaceholder:
          t.accountsPayable.details.observationPlaceholder || "Adicione uma observação (opcional)",
        files: t.accountsPayable.details.files || "Anexos",
        filesHelper:
          t.accountsPayable.details.filesHelper ||
          "Você pode anexar múltiplos arquivos à observação",
      }}
      onSubmit={
        (async (data: AccountsPayableFormData) => {
          const result = await addAccountsPayable(data);
          return { id: result.id };
        }) as (data: FinanceTransactionFormData) => Promise<void | { id: string }>
      }
      onSuccess={() => {
        setTimeout(() => {
          navigate(ROUTES.ACCOUNTS_PAYABLE);
        }, 1500);
      }}
      successMessage={t.accountsPayable.new.success}
      errorMessage={t.accountsPayable.new.error}
    />
  );
}
