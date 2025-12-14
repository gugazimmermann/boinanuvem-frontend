import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ObservationFormFields } from "~/components/dashboard/observations/observation-form-fields";
import { FormPageLayout } from "~/components/dashboard/forms/form-page-layout";
import { useFinanceTransactionForm } from "~/hooks/use-finance-transaction-form";
import { FinanceTransactionForm } from "~/components/dashboard/finance/finance-transaction-form";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { addAccountsPayableObservation } from "~/services/accounts-payable-observations.service";
import { addAccountsReceivableObservation } from "~/services/accounts-receivable-observations.service";
import { addCashFlowObservation } from "~/services/cash-flow-observations.service";
import { useAuth } from "~/contexts/auth-context";
import type {
  BankAccount,
  CashFlowFormData,
  AccountsPayableFormData,
  AccountsReceivableFormData,
} from "~/types";
import type {
  FinanceTransactionType,
  CashFlowFormState,
  AccountsPayableFormState,
  AccountsReceivableFormState,
} from "~/hooks/use-finance-transaction-form";

type FinanceTransactionFormState =
  | CashFlowFormState
  | AccountsPayableFormState
  | AccountsReceivableFormState;

export type FinanceTransactionFormData =
  | CashFlowFormData
  | AccountsPayableFormData
  | AccountsReceivableFormData;

export interface FinanceTransactionFormPageProps {
  readonly transactionType: FinanceTransactionType;
  readonly mode: "new" | "edit";
  readonly title: string;
  readonly description: string;
  readonly submitButtonLabel: string;
  readonly loadingLabel: string;
  readonly backRoute: string;
  readonly viewRoute?: (id: string) => string;
  readonly transactionId?: string;
  readonly initialData?: Partial<FinanceTransactionFormData>;
  readonly translationKeys: {
    readonly descriptionLabel: string;
    readonly amountLabel: string;
    readonly dateLabel?: string;
    readonly dueDateLabel?: string;
    readonly propertyLabel: string;
  };
  readonly observationLabels?: {
    readonly observation?: string;
    readonly observationPlaceholder?: string;
    readonly files?: string;
    readonly filesHelper?: string;
  };
  readonly onSubmit: (
    data: FinanceTransactionFormData
  ) => void | { id: string } | Promise<void | { id: string }>;
  readonly onSuccess: () => void;
  readonly successMessage: string;
  readonly errorMessage: string;
  readonly showObservations?: boolean;
  readonly formClassName?: string;
  readonly emptyStateTitle?: string;
}

export function FinanceTransactionFormPage({
  transactionType,
  mode,
  title,
  description,
  submitButtonLabel,
  loadingLabel,
  backRoute,
  viewRoute,
  transactionId,
  initialData,
  translationKeys,
  observationLabels,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
  showObservations = mode === "new",
  formClassName,
  emptyStateTitle,
}: FinanceTransactionFormPageProps) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";

  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [observation, setObservation] = useState("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    const loadBankAccounts = async () => {
      if (companyId) {
        try {
          const accounts = await getBankAccountsByCompanyId(companyId);
          setBankAccounts(accounts);
        } catch (error) {
          console.error("Failed to load bank accounts:", error);
        }
      }
    };
    loadBankAccounts();
  }, [companyId]);

  const handleSubmitWrapper = (data: FinanceTransactionFormData): void => {
    void (async () => {
      const result = await Promise.resolve(onSubmit(data));
      if (
        showObservations &&
        observation?.trim() &&
        result &&
        typeof result === "object" &&
        "id" in result
      ) {
        const fileIds = observationFiles.map(
          (_, index) => `file-${transactionType}-obs-${Date.now()}-${index}`
        );

        if (transactionType === "accounts-payable") {
          await addAccountsPayableObservation({
            accountsPayableId: result.id,
            observation: observation.trim(),
            fileIds: fileIds.length > 0 ? fileIds : undefined,
          });
        } else if (transactionType === "accounts-receivable") {
          await addAccountsReceivableObservation({
            accountsReceivableId: result.id,
            observation: observation.trim(),
            fileIds: fileIds.length > 0 ? fileIds : undefined,
          });
        } else if (transactionType === "cash-flow") {
          await addCashFlowObservation({
            cashFlowId: result.id,
            observation: observation.trim(),
            fileIds: fileIds.length > 0 ? fileIds : undefined,
          });
        }
      }
    })();
  };

  const {
    formData,
    errors,
    isSubmitting,
    alertMessage,
    properties,
    employees,
    serviceProviders,
    suppliers,
    buyers,
    handleChange,
    handleSubmit: baseHandleSubmit,
  } = useFinanceTransactionForm({
    transactionType,
    companyId,
    initialData: initialData as Partial<FinanceTransactionFormState> | undefined,
    translationKeys,
    translation: t,
    onSubmit: handleSubmitWrapper,
    onSuccess,
    successMessage,
    errorMessage,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await baseHandleSubmit(e);
  };

  // Handle edit mode with missing transaction
  if (mode === "edit" && !transactionId) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {emptyStateTitle || "Item não encontrado"}
          </p>
          <Button variant="outline" onClick={() => navigate(backRoute)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "new") {
    return (
      <FormPageLayout
        alertMessage={alertMessage}
        title={title}
        description={description}
        backButtonLabel={t.common.back}
        onBack={() => navigate(backRoute)}
        isSubmitting={isSubmitting}
        submitButtonLabel={isSubmitting ? loadingLabel : submitButtonLabel}
        cancelButtonLabel={t.common.cancel}
        onSubmit={handleSubmit}
        onCancel={() => navigate(backRoute)}
        formClassName={formClassName}
      >
        <FinanceTransactionForm
          transactionType={transactionType}
          formData={
            formData as unknown as
              | CashFlowFormState
              | AccountsPayableFormState
              | AccountsReceivableFormState
          }
          errors={errors}
          isSubmitting={isSubmitting}
          onFieldChange={handleChange as (field: string, value: string) => void}
          translation={t}
          properties={properties}
          bankAccounts={bankAccounts}
          employees={employees}
          serviceProviders={serviceProviders}
          suppliers={suppliers}
          buyers={buyers}
        />

        {showObservations && (
          <ObservationFormFields
            observation={observation}
            onObservationChange={setObservation}
            observationFiles={observationFiles}
            onObservationFilesChange={setObservationFiles}
            isSubmitting={isSubmitting}
            observationLabel={observationLabels?.observation || "Observação"}
            observationPlaceholder={
              observationLabels?.observationPlaceholder || "Adicione uma observação (opcional)"
            }
            filesLabel={observationLabels?.files || "Anexos"}
            filesHelperText={
              observationLabels?.filesHelper || "Você pode anexar múltiplos arquivos à observação"
            }
          />
        )}
      </FormPageLayout>
    );
  }

  // Edit mode - custom layout
  const handleBack = () => {
    if (transactionId && viewRoute) {
      navigate(viewRoute(transactionId));
    } else {
      navigate(backRoute);
    }
  };

  return (
    <div className="space-y-6">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FinanceTransactionForm
              transactionType={transactionType}
              formData={
                formData as unknown as
                  | CashFlowFormState
                  | AccountsPayableFormState
                  | AccountsReceivableFormState
              }
              errors={errors}
              isSubmitting={isSubmitting}
              onFieldChange={handleChange as (field: string, value: string) => void}
              translation={t}
              properties={properties}
              bankAccounts={bankAccounts}
              employees={employees}
              serviceProviders={serviceProviders}
              suppliers={suppliers}
              buyers={buyers}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? loadingLabel : submitButtonLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
