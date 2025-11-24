import { useMemo } from "react";
import { useTranslation } from "~/i18n";
import { formatCurrency } from "~/utils/formatting";
import { getPropertyById } from "~/services/properties.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";

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

export function useFinanceFilters<T extends CashFlow | AccountsPayable | AccountsReceivable>(
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
      let matchesSearch = true;
      if (searchValue) {
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

        let supplierName = "";
        if ("supplierId" in transaction && transaction.supplierId) {
          const supplier = getSupplierById(String(transaction.supplierId));
          supplierName = supplier?.name?.toLowerCase() || "";
        }

        let buyerName = "";
        if ("buyerId" in transaction && transaction.buyerId) {
          const buyer = getBuyerById(String(transaction.buyerId));
          buyerName = buyer?.name?.toLowerCase() || "";
        }

        let employeeName = "";
        if ("employeeId" in transaction && transaction.employeeId) {
          const employee = getEmployeeById(String(transaction.employeeId));
          employeeName = employee?.name?.toLowerCase() || "";
        }

        let serviceProviderName = "";
        if ("serviceProviderId" in transaction && transaction.serviceProviderId) {
          const serviceProvider = getServiceProviderById(String(transaction.serviceProviderId));
          serviceProviderName = serviceProvider?.name?.toLowerCase() || "";
        }

        matchesSearch =
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
          serviceProviderName.includes(searchLower);
      }

      let matchesType = true;
      if (config.enableTypeFilter && "type" in transaction) {
        matchesType =
          activeFilter === "all" ||
          (activeFilter === "income" && transaction.type === "income") ||
          (activeFilter === "expense" && transaction.type === "expense");
      }

      let matchesStatus = true;
      if (!config.enableTypeFilter && "status" in transaction) {
        matchesStatus =
          activeFilter === "all" ||
          (activeFilter === "paid" && transaction.status === "paid") ||
          (activeFilter === "unpaid" && transaction.status === "unpaid") ||
          (activeFilter === "overdue" && transaction.status === "overdue") ||
          (activeFilter === "partial" && transaction.status === "partial");
      }

      const dateField = ("date" in transaction ? transaction.date : transaction.dueDate) as string;
      const matchesYear = selectedYear === "all" || dateField.startsWith(selectedYear);

      const monthStr = selectedMonth === "all" ? null : selectedMonth.padStart(2, "0");
      const matchesMonth =
        selectedMonth === "all" || (monthStr && dateField.substring(5, 7) === monthStr);

      const matchesProperty = propertyFilter === "all" || transaction.propertyId === propertyFilter;

      let matchesSupplier = true;
      if (config.enableSupplierFilter && selectedSupplier) {
        matchesSupplier =
          selectedSupplier === "all" ||
          ("supplierId" in transaction && transaction.supplierId === selectedSupplier);
      }

      let matchesBuyer = true;
      if (config.enableBuyerFilter && selectedBuyer) {
        matchesBuyer =
          selectedBuyer === "all" ||
          ("buyerId" in transaction && transaction.buyerId === selectedBuyer);
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesYear &&
        matchesMonth &&
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
