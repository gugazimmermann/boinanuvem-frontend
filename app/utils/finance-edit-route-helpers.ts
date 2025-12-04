import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { createFormMeta } from "~/utils/route-helpers";
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
  getTransactionById: (id: string | undefined) => unknown;
  mapToFormData: (transaction: unknown) => Partial<TFormData> | undefined;
  updateTransaction: (id: string, data: Partial<TFormData>) => void;
  backRoute: string;
  viewRoute: (id: string) => string;
  translationKeys: {
    title: string;
    description: string;
    save: string;
    descriptionLabel: string;
    amountLabel: string;
    dueDateLabel?: string;
    dateLabel?: string;
    propertyLabel: string;
  };
  successMessage: string;
  errorMessage: string;
  emptyStateTitle: string;
}

/**
 * Hook that provides common logic for finance transaction edit routes.
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
