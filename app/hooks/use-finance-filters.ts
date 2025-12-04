import { useMemo } from "react";
import { useTranslation } from "~/i18n";
import { formatCurrency } from "~/utils/formatting";
import { getPropertyById } from "~/services/properties.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";

type FinanceTransaction = CashFlow | AccountsPayable | AccountsReceivable;

type EntityId = string | number | object | undefined;

export interface FinanceFilterOptions {
  searchValue: string;
  activeFilter: string;
  propertyFilter: string;
  selectedYear: string;
  selectedMonth: string;
  selectedSupplier?: string;
  selectedBuyer?: string;
}

export interface FinanceFilterConfig {
  searchFields?: string[];
  enableSupplierFilter?: boolean;
  enableBuyerFilter?: boolean;
  enableTypeFilter?: boolean;
}

function getEntityNameById(
  id: EntityId,
  getter: (id: string) => { name?: string } | undefined
): string {
  if (!id) return "";
  let idValue: string;
  if (typeof id === "string") {
    idValue = id;
  } else if (typeof id === "number") {
    idValue = String(id);
  } else {
    idValue = "";
  }
  if (!idValue) return "";
  const entity = getter(idValue);
  return entity?.name?.toLowerCase() || "";
}

function matchesSearchCriteria<T extends FinanceTransaction>(
  transaction: T,
  searchValue: string,
  t: ReturnType<typeof useTranslation>
): boolean {
  if (!searchValue) return true;

  const searchLower = searchValue.toLowerCase();
  const property = getPropertyById(transaction.propertyId);
  const propertyName = property?.name?.toLowerCase() || "";
  const category = transaction.category
    ? t.cashFlow.categories[transaction.category]?.toLowerCase() || ""
    : "";
  const paymentMethod = transaction.paymentMethod
    ? t.cashFlow.paymentMethods[transaction.paymentMethod]?.toLowerCase() || ""
    : "";
  const amount = formatCurrency(transaction.amount).toLowerCase();

  const supplierName =
    "supplierId" in transaction
      ? getEntityNameById(transaction.supplierId as EntityId, getSupplierById)
      : "";
  const buyerName =
    "buyerId" in transaction
      ? getEntityNameById(transaction.buyerId as EntityId, getBuyerById)
      : "";
  const employeeName =
    "employeeId" in transaction
      ? getEntityNameById(transaction.employeeId as EntityId, getEmployeeById)
      : "";
  const serviceProviderName =
    "serviceProviderId" in transaction
      ? getEntityNameById(transaction.serviceProviderId as EntityId, getServiceProviderById)
      : "";

  return (
    transaction.description.toLowerCase().includes(searchLower) ||
    ("referenceNumber" in transaction &&
      transaction.referenceNumber?.toLowerCase().includes(searchLower)) ||
    propertyName.includes(searchLower) ||
    category.includes(searchLower) ||
    paymentMethod.includes(searchLower) ||
    amount.includes(searchLower) ||
    supplierName.includes(searchLower) ||
    buyerName.includes(searchLower) ||
    employeeName.includes(searchLower) ||
    serviceProviderName.includes(searchLower)
  );
}

function matchesTypeFilter<T extends FinanceTransaction>(
  transaction: T,
  activeFilter: string,
  enableTypeFilter: boolean
): boolean {
  if (!enableTypeFilter || !("type" in transaction)) return true;
  return (
    activeFilter === "all" ||
    (activeFilter === "income" && transaction.type === "income") ||
    (activeFilter === "expense" && transaction.type === "expense")
  );
}

function matchesStatusFilter<T extends FinanceTransaction>(
  transaction: T,
  activeFilter: string,
  enableTypeFilter: boolean
): boolean {
  if (enableTypeFilter || !("status" in transaction)) return true;
  return (
    activeFilter === "all" ||
    (activeFilter === "paid" && transaction.status === "paid") ||
    (activeFilter === "unpaid" && transaction.status === "unpaid") ||
    (activeFilter === "overdue" && transaction.status === "overdue") ||
    (activeFilter === "partial" && transaction.status === "partial")
  );
}

function matchesDateFilter<T extends FinanceTransaction>(
  transaction: T,
  selectedYear: string,
  selectedMonth: string
): boolean {
  const dateField = ("date" in transaction ? transaction.date : transaction.dueDate) as string;
  const matchesYear = selectedYear === "all" || dateField.startsWith(selectedYear);
  const monthStr = selectedMonth === "all" ? null : selectedMonth.padStart(2, "0");
  const matchesMonth: boolean =
    selectedMonth === "all" || (monthStr !== null && dateField.substring(5, 7) === monthStr);
  return matchesYear && matchesMonth;
}

function matchesSupplierFilter<T extends FinanceTransaction>(
  transaction: T,
  selectedSupplier: string | undefined,
  enableSupplierFilter: boolean
): boolean {
  if (!enableSupplierFilter || !selectedSupplier) return true;
  return (
    selectedSupplier === "all" ||
    ("supplierId" in transaction && transaction.supplierId === selectedSupplier)
  );
}

function matchesBuyerFilter<T extends FinanceTransaction>(
  transaction: T,
  selectedBuyer: string | undefined,
  enableBuyerFilter: boolean
): boolean {
  if (!enableBuyerFilter || !selectedBuyer) return true;
  return (
    selectedBuyer === "all" || ("buyerId" in transaction && transaction.buyerId === selectedBuyer)
  );
}

export function useFinanceFilters<T extends FinanceTransaction>(
  transactions: T[],
  options: FinanceFilterOptions,
  config: FinanceFilterConfig = {}
) {
  const t = useTranslation();
  const {
    searchValue,
    activeFilter,
    propertyFilter,
    selectedYear,
    selectedMonth,
    selectedSupplier,
    selectedBuyer,
  } = options;

  const filteredData = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = matchesSearchCriteria(transaction, searchValue, t);
      const matchesType = matchesTypeFilter(
        transaction,
        activeFilter,
        config.enableTypeFilter || false
      );
      const matchesStatus = matchesStatusFilter(
        transaction,
        activeFilter,
        config.enableTypeFilter || false
      );
      const matchesDate = matchesDateFilter(transaction, selectedYear, selectedMonth);
      const matchesProperty: boolean =
        propertyFilter === "all" || transaction.propertyId === propertyFilter;
      const matchesSupplier = matchesSupplierFilter(
        transaction,
        selectedSupplier,
        config.enableSupplierFilter || false
      );
      const matchesBuyer = matchesBuyerFilter(
        transaction,
        selectedBuyer,
        config.enableBuyerFilter || false
      );

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDate &&
        matchesProperty &&
        matchesSupplier &&
        matchesBuyer
      );
    });
  }, [
    transactions,
    searchValue,
    activeFilter,
    propertyFilter,
    selectedYear,
    selectedMonth,
    selectedSupplier,
    selectedBuyer,
    t,
    config.enableTypeFilter,
    config.enableSupplierFilter,
    config.enableBuyerFilter,
  ]);

  return filteredData;
}
