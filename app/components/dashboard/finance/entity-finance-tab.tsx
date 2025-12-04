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
import { getPropertyById } from "~/services/properties.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { useAlert } from "~/hooks/use-alert";

export interface EntityFinanceTabProps {
  readonly entityType: EntityFinanceTransactionType;
  readonly entityId: string;
  readonly getCashFlowTransactions: (id: string) => CashFlow[];
  readonly getPayableTransactions?: (id: string) => AccountsPayable[];
  readonly getReceivableTransactions?: (id: string) => AccountsReceivable[];
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

  const subTabParam = searchParams.get("subTab");
  const getInitialSubTab = (): "dashboard" | "transactions" => {
    if (subTabParam === "dashboard" || subTabParam === "transactions") {
      return subTabParam;
    }
    return "dashboard";
  };
  const [financeSubTab, setFinanceSubTab] = useState<"dashboard" | "transactions">(
    getInitialSubTab
  );

  useEffect(() => {
    const subTab = searchParams.get("subTab");
    if (subTab === "dashboard" || subTab === "transactions") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing state with URL params is necessary
      setFinanceSubTab((prev) => (prev === subTab ? prev : subTab));
    } else if (subTab === null && showSubTabs) {
      setFinanceSubTab((prev) => (prev === "dashboard" ? prev : "dashboard"));
    }
  }, [searchParams, showSubTabs]);

  const cashFlowTransactions = getCashFlowTransactions(entityId);
  const payableTransactions = getPayableTransactions?.(entityId);
  const receivableTransactions = getReceivableTransactions?.(entityId);

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
      const prop = getPropertyById(id);
      return prop ? { name: prop.name } : null;
    },
    getSupplierById: (id: string) => {
      const supplier = getSupplierById(id);
      return supplier ? { name: supplier.name } : null;
    },
    getBuyerById: (id: string) => {
      const buyer = getBuyerById(id);
      return buyer ? { name: buyer.name } : null;
    },
    getEmployeeById: (id: string) => {
      const employee = getEmployeeById(id);
      return employee ? { name: employee.name } : null;
    },
    getServiceProviderById: (id: string) => {
      const serviceProvider = getServiceProviderById(id);
      return serviceProvider ? { name: serviceProvider.name } : null;
    },
    onSuccess: (message) => {
      showAlert(message, "success");
    },
    onError: (message) => {
      showAlert(message, "error");
    },
  });

  const getSubTabTranslationKeys = () => {
    switch (entityType) {
      case "employee":
        // Employees don't have subtabs, but we provide fallback
        return {
          dashboard: "Dashboard",
          transactions: "Transações",
        };
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

  // If no subtabs, just show transactions table
  if (!showSubTabs) {
    return (
      <>
        <AlertDisplay />
        <FinanceTransactionsTable
          {...tableProps}
          filteredTransactions={financeTransactions.filteredTransactions}
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
        />
      )}
    </div>
  );
}
