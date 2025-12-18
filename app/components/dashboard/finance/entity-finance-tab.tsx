import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import type { CashFlow, AccountsPayable, AccountsReceivable, Acquisition, Sale } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";
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
import { getAcquisitionViewRoute, getSaleViewRoute } from "~/routes.config";
import type { UnifiedTransaction } from "~/hooks/use-finance-transactions";
import { Select } from "~/components/ui";
import { getLocaleForDateTime } from "~/utils/locale-helpers";

export interface EntityFinanceTabProps {
  readonly entityType: EntityFinanceTransactionType;
  readonly entityId: string;
  readonly getCashFlowTransactions: (id: string) => CashFlow[] | Promise<CashFlow[]>;
  readonly getPayableTransactions?: (id: string) => AccountsPayable[] | Promise<AccountsPayable[]>;
  readonly getReceivableTransactions?: (
    id: string
  ) => AccountsReceivable[] | Promise<AccountsReceivable[]>;
  readonly getAcquisitionsTransactions?: (id: string) => Acquisition[] | Promise<Acquisition[]>;
  readonly getSalesTransactions?: (id: string) => Sale[] | Promise<Sale[]>;
  readonly gradientId?: string;
  readonly showSubTabs?: boolean;
}

function getAcquisitionTotalWithFees(acq: Acquisition): number {
  const feesTotal = (acq.fees ?? []).reduce(
    (sum, f) => sum + (typeof f?.amount === "number" ? f.amount : 0),
    0
  );
  const transportationFee = typeof acq.transportationFee === "number" ? acq.transportationFee : 0;
  const handlingFee = typeof acq.handlingFee === "number" ? acq.handlingFee : 0;
  const base = typeof acq.totalPrice === "number" ? acq.totalPrice : 0;
  return base + feesTotal + transportationFee + handlingFee;
}

function getSaleTotalWithFees(sale: Sale): number {
  const feesTotal = (sale.fees ?? []).reduce(
    (sum, f) => sum + (typeof f?.amount === "number" ? f.amount : 0),
    0
  );
  const transportationFee = typeof sale.transportationFee === "number" ? sale.transportationFee : 0;
  const additionalFees = typeof sale.additionalFees === "number" ? sale.additionalFees : 0;
  const base = typeof sale.totalPrice === "number" ? sale.totalPrice : 0;
  return base + feesTotal + transportationFee + additionalFees;
}

export function EntityFinanceTab({
  entityType,
  entityId,
  getCashFlowTransactions,
  getPayableTransactions,
  getReceivableTransactions,
  getAcquisitionsTransactions,
  getSalesTransactions,
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
      // Ensure subTab is set in URL when finance tab is active but no subTab is present
      const tab = searchParams.get("tab");
      if (tab === "finance") {
        setSearchParams({ tab: "finance", subTab: "dashboard" }, { replace: true });
      }
    }
  }, [searchParams, showSubTabs, setSearchParams]);

  const [cashFlowTransactions, setCashFlowTransactions] = useState<CashFlow[]>([]);
  const [payableTransactions, setPayableTransactions] = useState<AccountsPayable[] | undefined>(
    undefined
  );
  const [receivableTransactions, setReceivableTransactions] = useState<
    AccountsReceivable[] | undefined
  >(undefined);
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

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

      if (getAcquisitionsTransactions) {
        const acquisitionsResult = getAcquisitionsTransactions(entityId);
        const acquisitionsData = await Promise.resolve(acquisitionsResult);
        setAcquisitions(acquisitionsData);
      }

      if (getSalesTransactions) {
        const salesResult = getSalesTransactions(entityId);
        const salesData = await Promise.resolve(salesResult);
        setSales(salesData);
      }
    };
    loadTransactions();
  }, [
    entityId,
    getCashFlowTransactions,
    getPayableTransactions,
    getReceivableTransactions,
    getAcquisitionsTransactions,
    getSalesTransactions,
  ]);

  // Convert acquisitions and sales to CashFlow format for processing
  const cashFlowWithAcquisitionsAndSales = useMemo(() => {
    let result = [...cashFlowTransactions];

    if (acquisitions && acquisitions.length > 0) {
      const acquisitionCashFlow: CashFlow[] = acquisitions.map((a) => ({
        id: `acq:${a.id}`,
        companyId: a.companyId,
        type: "expense",
        amount: getAcquisitionTotalWithFees(a),
        date: a.acquisitionDate,
        description: "Aquisição",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.OTHER,
        status: "completed",
        supplierId: a.supplierId,
        propertyId: a.propertyId,
        createdAt: a.createdAt,
      }));
      result = [...result, ...acquisitionCashFlow];
    }

    if (sales && sales.length > 0) {
      const saleCashFlow: CashFlow[] = sales.map((s) => ({
        id: `sale:${s.id}`,
        companyId: s.companyId,
        type: "income",
        amount: getSaleTotalWithFees(s),
        date: s.saleDate,
        description: "Venda",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.OTHER,
        status: "completed",
        buyerId: s.buyerId,
        propertyId: s.propertyId,
        createdAt: s.createdAt,
      }));
      result = [...result, ...saleCashFlow];
    }

    return result;
  }, [cashFlowTransactions, acquisitions, sales]);

  // Calculate year options based on all transactions including acquisitions and sales
  const yearOptions = useMemo(() => {
    const allTransactions = cashFlowWithAcquisitionsAndSales;
    const dates = allTransactions
      .map((t) => {
        try {
          return new Date(t.date);
        } catch {
          return null;
        }
      })
      .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()));

    if (dates.length === 0) {
      const currentYear = new Date().getFullYear();
      return [
        { value: "all", label: t.cashFlow.filters.allYears },
        { value: String(currentYear), label: String(currentYear) },
      ];
    }

    const minYear = Math.min(...dates.map((d) => d.getFullYear()));
    const maxYear = new Date().getFullYear();
    const options: Array<{ value: string; label: string }> = [
      { value: "all", label: t.cashFlow.filters.allYears },
    ];
    for (let y = minYear; y <= maxYear; y++) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }, [cashFlowWithAcquisitionsAndSales, t]);

  // Calculate month options
  const monthOptions = useMemo(() => {
    const localeMap: Record<string, string> = {
      pt: getLocaleForDateTime("pt"),
      en: "en-US",
      es: "es-ES",
    };
    const locale = localeMap[language] || getLocaleForDateTime("pt");
    const options: Array<{ value: string; label: string }> = [
      { value: "all", label: t.cashFlow.filters.allMonths },
    ];
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2000, month - 1).toLocaleDateString(locale, {
        month: "long",
      });
      options.push({ value: String(month), label: monthName });
    }
    return options;
  }, [language, t.cashFlow.filters.allMonths]);

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
    cashFlowTransactions: cashFlowWithAcquisitionsAndSales,
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

  // Override getViewRoute to handle acquisitions
  const getViewRouteWithAcquisitionsAndSales = (transaction: UnifiedTransaction): string => {
    // Check if this is an acquisition (ID starts with "acq:")
    if (transaction.id.startsWith("acq:")) {
      const acquisitionId = transaction.id.replace("acq:", "");
      return getAcquisitionViewRoute(acquisitionId);
    }
    // Check if this is a sale (ID starts with "sale:")
    if (transaction.id.startsWith("sale:")) {
      const saleId = transaction.id.replace("sale:", "");
      return getSaleViewRoute(saleId);
    }
    return getViewRoute(transaction);
  };

  const tableProps = getFinanceTransactionsTableProps({
    financeTransactions,
    financeHandlers,
    getStatusLabel,
    getEditRoute,
    getViewRoute: getViewRouteWithAcquisitionsAndSales,
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
          yearOptions={yearOptions}
          monthOptions={monthOptions}
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
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <div className="w-32">
              <Select
                value={financeTransactions.selectedYear}
                onChange={(e) => {
                  financeTransactions.setSelectedYear(e.target.value);
                }}
                options={yearOptions}
                selectClassName="text-xs sm:text-sm py-2"
              />
            </div>
            <div className="w-36">
              <Select
                value={financeTransactions.selectedMonth}
                onChange={(e) => {
                  financeTransactions.setSelectedMonth(e.target.value);
                }}
                options={monthOptions}
                selectClassName="text-xs sm:text-sm py-2"
              />
            </div>
          </div>
          <FinanceDashboard
            cashFlowData={cashFlowWithAcquisitionsAndSales}
            accountsPayableData={payableTransactions}
            accountsReceivableData={receivableTransactions}
            language={language}
            gradientId={gradientId}
            selectedYear={financeTransactions.selectedYear}
            selectedMonth={financeTransactions.selectedMonth}
          />
        </div>
      )}

      {financeSubTab === "transactions" && (
        <FinanceTransactionsTable
          {...tableProps}
          filteredTransactions={financeTransactions.filteredTransactions}
          getPropertyName={getPropertyName}
          yearOptions={yearOptions}
          monthOptions={monthOptions}
        />
      )}
    </div>
  );
}
