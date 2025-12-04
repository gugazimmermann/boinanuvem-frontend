import { useState, useMemo, useCallback } from "react";
import { formatCurrency } from "~/utils/formatting";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import type { SortDirection } from "~/components/ui";
import { sortItems } from "~/utils/sorting";
import { paginateItems } from "~/utils/table-helpers";

export interface UnifiedTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  description: string;
  category?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  status: string;
  transactionType: "cashFlow" | "payable" | "receivable";
  propertyId?: string;
  supplierId?: string;
  buyerId?: string;
  employeeId?: string;
  serviceProviderId?: string;
  [key: string]: unknown;
}

export interface UseFinanceTransactionsOptions {
  cashFlowTransactions: CashFlow[];
  payableTransactions?: AccountsPayable[];
  receivableTransactions?: AccountsReceivable[];
  language: "pt" | "en" | "es";
  translationKeys: {
    categories: Record<string, string>;
    paymentMethods: Record<string, string>;
  };
  getPropertyById?: (id: string) => { name: string } | null;
  getSupplierById?: (id: string) => { name: string } | null;
  getBuyerById?: (id: string) => { name: string } | null;
  getEmployeeById?: (id: string) => { name: string } | null;
  getServiceProviderById?: (id: string) => { name: string } | null;
}

export function useFinanceTransactions({
  cashFlowTransactions,
  payableTransactions = [],
  receivableTransactions = [],
  language,
  translationKeys,
  getPropertyById,
  getSupplierById,
  getBuyerById,
  getEmployeeById,
  getServiceProviderById,
}: UseFinanceTransactionsOptions) {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const itemsPerPage = 10;

  const normalizeCashFlow = (cf: CashFlow): UnifiedTransaction => ({
    id: cf.id,
    type: cf.type,
    amount: cf.amount,
    date: cf.date,
    description: cf.description,
    category: cf.category,
    paymentMethod: cf.paymentMethod,
    referenceNumber: cf.referenceNumber,
    status: cf.status,
    transactionType: "cashFlow",
    propertyId: cf.propertyId,
    supplierId: cf.supplierId,
    buyerId: cf.buyerId,
    employeeId: cf.employeeId,
    serviceProviderId: cf.serviceProviderId,
  });

  const normalizePayable = (ap: AccountsPayable): UnifiedTransaction => ({
    id: ap.id,
    type: "expense",
    amount: ap.amount,
    date: ap.dueDate,
    description: ap.description,
    category: ap.category,
    paymentMethod: ap.paymentMethod,
    referenceNumber: ap.referenceNumber,
    status: ap.status,
    transactionType: "payable",
    propertyId: ap.propertyId,
    supplierId: ap.supplierId,
    employeeId: ap.employeeId,
    serviceProviderId: ap.serviceProviderId,
  });

  const normalizeReceivable = (ar: AccountsReceivable): UnifiedTransaction => ({
    id: ar.id,
    type: "income",
    amount: ar.amount,
    date: ar.dueDate,
    description: ar.description,
    category: ar.category,
    paymentMethod: ar.paymentMethod,
    referenceNumber: ar.referenceNumber,
    status: ar.status,
    transactionType: "receivable",
    propertyId: ar.propertyId,
  });

  const allTransactions = useMemo(() => {
    return [
      ...cashFlowTransactions.map(normalizeCashFlow),
      ...payableTransactions.map(normalizePayable),
      ...receivableTransactions.map(normalizeReceivable),
    ];
  }, [cashFlowTransactions, payableTransactions, receivableTransactions]);

  const matchesSearchCriteria = useCallback(
    (transaction: UnifiedTransaction, searchLower: string): boolean => {
      const property =
        transaction.propertyId && getPropertyById ? getPropertyById(transaction.propertyId) : null;
      const propertyName = property?.name?.toLowerCase() || "";
      const category = transaction.category
        ? translationKeys.categories[transaction.category]?.toLowerCase() || ""
        : "";
      const paymentMethod = transaction.paymentMethod
        ? translationKeys.paymentMethods[transaction.paymentMethod]?.toLowerCase() || ""
        : "";
      const amount = formatCurrency(transaction.amount, language).toLowerCase();

      let supplierName = "";
      if (transaction.supplierId && getSupplierById) {
        const supplier = getSupplierById(transaction.supplierId);
        supplierName = supplier?.name?.toLowerCase() || "";
      }

      let buyerName = "";
      if (transaction.buyerId && getBuyerById) {
        const buyer = getBuyerById(transaction.buyerId);
        buyerName = buyer?.name?.toLowerCase() || "";
      }

      let employeeName = "";
      if (transaction.employeeId && getEmployeeById) {
        const employee = getEmployeeById(transaction.employeeId);
        employeeName = employee?.name?.toLowerCase() || "";
      }

      let serviceProviderName = "";
      if (transaction.serviceProviderId && getServiceProviderById) {
        const serviceProvider = getServiceProviderById(transaction.serviceProviderId);
        serviceProviderName = serviceProvider?.name?.toLowerCase() || "";
      }

      return (
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
        propertyName.includes(searchLower) ||
        category.includes(searchLower) ||
        paymentMethod.includes(searchLower) ||
        amount.includes(searchLower) ||
        supplierName.includes(searchLower) ||
        buyerName.includes(searchLower) ||
        employeeName.includes(searchLower) ||
        serviceProviderName.includes(searchLower)
      );
    },
    [
      language,
      translationKeys,
      getPropertyById,
      getSupplierById,
      getBuyerById,
      getEmployeeById,
      getServiceProviderById,
    ]
  );

  const matchesDateFilter = useCallback(
    (transaction: UnifiedTransaction): boolean => {
      const matchesYear = selectedYear === "all" || transaction.date.startsWith(selectedYear);
      const monthStr = selectedMonth === "all" ? null : selectedMonth.padStart(2, "0");
      const matchesMonth =
        selectedMonth === "all" || (monthStr && transaction.date.substring(5, 7) === monthStr);
      return matchesYear && (matchesMonth as boolean);
    },
    [selectedYear, selectedMonth]
  );

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const matchesSearch = searchValue
        ? matchesSearchCriteria(transaction, searchValue.toLowerCase())
        : true;

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "income" && transaction.type === "income") ||
        (activeFilter === "expense" && transaction.type === "expense");

      const matchesDate = matchesDateFilter(transaction);

      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [allTransactions, searchValue, activeFilter, matchesSearchCriteria, matchesDateFilter]);

  const sortedTransactions = useMemo(() => {
    return sortItems({
      items: filteredTransactions,
      sortState,
    });
  }, [filteredTransactions, sortState]);

  const { paginatedItems: paginatedTransactions, totalPages } = useMemo(() => {
    return paginateItems(sortedTransactions, currentPage, itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netTotal = totalIncome - totalExpenses;

  const getYearOptions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return [
      { value: "all", label: "Todos os anos" },
      { value: String(currentYear - 1), label: String(currentYear - 1) },
      { value: String(currentYear), label: String(currentYear) },
    ];
  };

  const getMonthOptions = (locale: string) => {
    const options: Array<{ value: string; label: string }> = [
      { value: "all", label: "Todos os meses" },
    ];

    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2000, month - 1).toLocaleDateString(locale, {
        month: "long",
      });
      options.push({ value: String(month), label: monthName });
    }

    return options;
  };

  return {
    transactions: allTransactions,
    filteredTransactions,
    sortedTransactions,
    paginatedTransactions,
    totalPages,
    totalIncome,
    totalExpenses,
    netTotal,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    currentPage,
    setCurrentPage,
    sortState,
    setSortState,
    getYearOptions,
    getMonthOptions,
  };
}
