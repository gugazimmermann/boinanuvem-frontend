import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import { FinanceDashboard } from "./finance-dashboard";
import {
  FinanceTransactionsTable,
  getFinanceTransactionsTableProps,
} from "./finance-transactions-table";
import { FinanceSubTabs } from "./finance-sub-tabs";
import {
  useEntityFinanceTransactions,
  type EntityFinanceTransactionType,
} from "~/hooks/use-entity-finance-transactions";
import { useEntityLoaders } from "~/hooks/use-entity-loaders";
import { useAlert } from "~/hooks/use-alert";

export interface EntityFinanceTabProps {
  readonly entityType: EntityFinanceTransactionType;
  readonly entityId: string;
  readonly getCashFlowTransactions: (id: string) => CashFlow[] | Promise<CashFlow[]>;
  readonly getPayableTransactions?: (id: string) => AccountsPayable[] | Promise<AccountsPayable[]>;
  readonly getReceivableTransactions?: (
    id: string
  ) => AccountsReceivable[] | Promise<AccountsReceivable[]>;
  readonly gradientId?: string;
  readonly showSubTabs?: boolean;
}

export function EntityFinanceTab({
  entityType,
  entityId,
  getCashFlowTransactions,
  getPayableTransactions,
  getReceivableTransactions,
  gradientId,
  showSubTabs = true,
}: EntityFinanceTabProps) {
  const t = useTranslation();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showAlert, AlertDisplay } = useAlert();

  const {
    getPropertyName: getPropertyNameFromHook,
    getSupplierName,
    getBuyerName,
    getEmployeeName,
    getServiceProviderName,
  } = useEntityLoaders({ silentFail: true });

  const subTabParam = searchParams.get("subTab");
  const getInitialSubTab = (): "dashboard" | "transactions" => {
    if (subTabParam === "dashboard" || subTabParam === "transactions") {
      return subTabParam;
    }
    return "dashboard";
  };
  const [financeSubTab, setFinanceSubTab] = useState<"dashboard" | "transactions">(
    getInitialSubTab()
  );

  useEffect(() => {
    const subTab = searchParams.get("subTab");
    if (subTab === "dashboard" || subTab === "transactions") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing state with URL params is necessary
      setFinanceSubTab(subTab);
    } else if (subTab === null && showSubTabs) {
      setFinanceSubTab("dashboard");
    }
  }, [searchParams, showSubTabs]);

  const [cashFlowTransactions, setCashFlowTransactions] = useState<CashFlow[]>([]);
  const [payableTransactions, setPayableTransactions] = useState<AccountsPayable[] | undefined>(
    undefined
  );
  const [receivableTransactions, setReceivableTransactions] = useState<
    AccountsReceivable[] | undefined
  >(undefined);

  useEffect(() => {
    const loadTransactions = async () => {
      const cashFlowResult = getCashFlowTransactions(entityId);
      const cashFlow = await Promise.resolve(cashFlowResult);
      setCashFlowTransactions(cashFlow);

      if (getPayableTransactions) {
        const payableResult = getPayableTransactions(entityId);
        const payable = await Promise.resolve(payableResult);
        setPayableTransactions(payable);
      }

      if (getReceivableTransactions) {
        const receivableResult = getReceivableTransactions(entityId);
        const receivable = await Promise.resolve(receivableResult);
        setReceivableTransactions(receivable);
      }
    };
    loadTransactions();
  }, [entityId, getCashFlowTransactions, getPayableTransactions, getReceivableTransactions]);

  const {
    financeTransactions,
    financeHandlers,
    getStatusLabel,
    getEditRoute,
    getViewRoute,
    canEdit,
    canDelete,
    translationKeys,
    title,
    description,
  } = useEntityFinanceTransactions({
    entityType,
    cashFlowTransactions,
    payableTransactions,
    receivableTransactions,
    getPropertyById: (id: string) => {
      const name = getPropertyNameFromHook(id);
      return name ? { name } : null;
    },
    getSupplierById: (id: string) => {
      const name = getSupplierName(id);
      return name ? { name } : null;
    },
    getBuyerById: (id: string) => {
      const name = getBuyerName(id);
      return name ? { name } : null;
    },
    getEmployeeById: (id: string) => {
      const name = getEmployeeName(id);
      return name ? { name } : null;
    },
    getServiceProviderById: (id: string) => {
      const name = getServiceProviderName(id);
      return name ? { name } : null;
    },
    onSuccess: (message) => {
      showAlert(message, "success");
    },
    onError: (message) => {
      showAlert(message, "error");
    },
  });

  const getSubTabTranslationKeys = (): { dashboard: string; transactions: string } => {
    switch (entityType) {
      case "serviceProvider":
        return {
          dashboard: t.serviceProviders.details.finance.subTabs.dashboard,
          transactions: t.serviceProviders.details.finance.subTabs.transactions,
        };
      case "supplier":
        return {
          dashboard: t.suppliers.details.finance.subTabs.dashboard,
          transactions: t.suppliers.details.finance.subTabs.transactions,
        };
      case "buyer":
        return {
          dashboard: t.buyers.details.finance.subTabs.dashboard,
          transactions: t.buyers.details.finance.subTabs.transactions,
        };
      case "employee":
      default:
        // Employees don't have subtabs, but we provide fallback
        return {
          dashboard: "Dashboard",
          transactions: "Transações",
        };
    }
  };

  const tableProps = getFinanceTransactionsTableProps({
    financeTransactions,
    financeHandlers,
    getStatusLabel,
    getEditRoute,
    getViewRoute,
    canEdit,
    canDelete,
    title,
    description,
    translationKeys,
  });

  const getPropertyName = (propertyId: string) => getPropertyNameFromHook(propertyId);

  // If no subtabs, just show transactions table
  if (!showSubTabs) {
    return (
      <>
        <AlertDisplay />
        <FinanceTransactionsTable
          {...tableProps}
          filteredTransactions={financeTransactions.filteredTransactions}
          getPropertyName={getPropertyName}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      <AlertDisplay />
      <FinanceSubTabs
        activeTab={financeSubTab}
        onTabChange={(tab) => {
          setFinanceSubTab(tab);
          setSearchParams({ tab: "finance", subTab: tab });
        }}
        translationKeys={getSubTabTranslationKeys()}
      />

      {financeSubTab === "dashboard" && (
        <FinanceDashboard
          cashFlowData={cashFlowTransactions}
          accountsPayableData={payableTransactions}
          accountsReceivableData={receivableTransactions}
          language={language}
          gradientId={gradientId}
        />
      )}

      {financeSubTab === "transactions" && (
        <FinanceTransactionsTable
          {...tableProps}
          filteredTransactions={financeTransactions.filteredTransactions}
          getPropertyName={getPropertyName}
        />
      )}
    </div>
  );
}
