import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { createFormMeta } from "~/utils/route-helpers";
import { useTranslation } from "~/i18n";
import { FinanceTransactionFormPage } from "~/components/dashboard/finance/finance-transaction-form-page";
import type { FinanceTransactionFormData } from "~/components/dashboard/finance/finance-transaction-form-page";

/**
 * Common loader function for finance transaction edit routes.
 */
export async function createFinanceEditLoader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

/**
 * Common meta function factory for finance transaction edit routes.
 */
export function createFinanceEditMeta(entityName: string, description: string) {
  return () => createFormMeta("Editar", entityName, description);
}

/**
 * Configuration for a finance transaction edit route component.
 */
export interface FinanceEditRouteConfig<TFormData extends FinanceTransactionFormData> {
  transactionType: "accounts-payable" | "accounts-receivable" | "cash-flow";
  getTransactionById: (id: string | undefined) => Promise<unknown>;
  mapToFormData: <T>(transaction: T) => Partial<TFormData> | undefined;
  updateTransaction: (id: string, data: Partial<TFormData>) => Promise<void>;
  backRoute: string;
  viewRoute: (id: string) => string;
  getTranslationKeys: (t: ReturnType<typeof useTranslation>) => {
    title: string;
    description: string;
    save: string;
    descriptionLabel: string;
    amountLabel: string;
    dueDateLabel?: string;
    dateLabel?: string;
    propertyLabel: string;
  };
  getSuccessMessage: (t: ReturnType<typeof useTranslation>) => string;
  getErrorMessage: (t: ReturnType<typeof useTranslation>) => string;
  getEmptyStateTitle: (t: ReturnType<typeof useTranslation>) => string;
  mapFormDataToUpdate?: (data: TFormData) => Partial<TFormData>;
}

/**
 * Factory function that creates a finance transaction edit route component.
 */
export function createFinanceEditRoute<TFormData extends FinanceTransactionFormData>(
  config: FinanceEditRouteConfig<TFormData>
) {
  return function FinanceEditRoute() {
    const t = useTranslation();
    const navigate = useNavigate();
    const { transactionId } = useParams<{ transactionId: string }>();
    const [initialData, setInitialData] = useState<Partial<TFormData> | undefined>(undefined);

    useEffect(() => {
      const loadTransaction = async () => {
        if (transactionId) {
          try {
            const transactionData = await config.getTransactionById(transactionId);
            if (transactionData) {
              const mapped = config.mapToFormData(transactionData);
              setInitialData(mapped);
            }
          } catch (error) {
            console.error("Failed to load transaction:", error);
          }
        }
      };
      loadTransaction();
    }, [transactionId]);

    const translationKeys = config.getTranslationKeys(t);

    return (
      <FinanceTransactionFormPage
        transactionType={config.transactionType}
        mode="edit"
        title={translationKeys.title}
        description={translationKeys.description}
        submitButtonLabel={translationKeys.save}
        loadingLabel={t.common.loading}
        backRoute={config.backRoute}
        viewRoute={config.viewRoute}
        transactionId={transactionId}
        initialData={initialData as Partial<FinanceTransactionFormData> | undefined}
        translationKeys={{
          descriptionLabel: translationKeys.descriptionLabel,
          amountLabel: translationKeys.amountLabel,
          dueDateLabel: translationKeys.dueDateLabel,
          propertyLabel: translationKeys.propertyLabel,
        }}
        onSubmit={
          (async (data: TFormData) => {
            if (!transactionId) return;
            const updateData = config.mapFormDataToUpdate ? config.mapFormDataToUpdate(data) : data;
            await config.updateTransaction(transactionId, updateData);
          }) as (data: FinanceTransactionFormData) => Promise<void | { id: string }>
        }
        onSuccess={() => {
          setTimeout(() => {
            if (transactionId) {
              navigate(config.viewRoute(transactionId));
            }
          }, 1500);
        }}
        successMessage={config.getSuccessMessage(t)}
        errorMessage={config.getErrorMessage(t)}
        emptyStateTitle={config.getEmptyStateTitle(t)}
      />
    );
  };
}

/**
 * Hook that provides common logic for finance transaction edit routes.
 * @deprecated Use createFinanceEditRoute instead
 */
export function useFinanceEditRoute<TFormData extends FinanceTransactionFormData>(
  config: FinanceEditRouteConfig<TFormData>
) {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const transaction = config.getTransactionById(transactionId);

  const initialData = useMemo(() => config.mapToFormData(transaction), [transaction, config]);

  const handleSubmit = (data: TFormData) => {
    if (!transactionId) return;
    config.updateTransaction(transactionId, data);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      if (transactionId) {
        navigate(config.viewRoute(transactionId));
      }
    }, 1500);
  };

  return {
    transactionId,
    initialData,
    handleSubmit,
    handleSuccess,
  };
}
