import { useMemo, useState, useCallback } from "react";
import type { SortDirection } from "~/components/ui";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import {
  useFinanceFilters,
  type FinanceFilterOptions,
  type FinanceFilterConfig,
} from "./use-finance-filters";
import { useFinanceSort, type SortState } from "./use-finance-sort";

export interface UseFinanceListOptions<T> {
  data: T[];
  initialSort?: { column: string; direction: SortDirection };
  itemsPerPage?: number;
  filterConfig?: FinanceFilterConfig;
}

export interface UseFinanceListResult<T> {
  // Filter state
  searchValue: string;
  setSearchValue: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  propertyFilter: string;
  setPropertyFilter: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  selectedSupplier: string;
  setSelectedSupplier: (value: string) => void;
  selectedBuyer: string;
  setSelectedBuyer: (value: string) => void;
  // Sort state
  sortState: SortState;
  handleSort: (column: string, direction: SortDirection) => void;
  // Pagination state
  currentPage: number;
  setCurrentPage: (page: number) => void;
  // Computed data
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  totalPages: number;
  // Totals
  totalAmount: number;
}

/**
 * Combined hook for finance list operations (filtering, sorting, pagination)
 */
export function useFinanceList<T extends CashFlow | AccountsPayable | AccountsReceivable>(
  options: UseFinanceListOptions<T>
): UseFinanceListResult<T> {
  const { data, initialSort, itemsPerPage = 10, filterConfig = {} } = options;

  // Filter state
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedBuyer, setSelectedBuyer] = useState("all");

  // Sort state
  const [sortState, setSortState] = useState<SortState>(
    initialSort || { column: null, direction: "asc" }
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Filter options
  const filterOptions: FinanceFilterOptions = useMemo(
    () => ({
      searchValue,
      activeFilter,
      propertyFilter,
      selectedYear,
      selectedMonth,
      selectedSupplier: filterConfig.enableSupplierFilter ? selectedSupplier : undefined,
      selectedBuyer: filterConfig.enableBuyerFilter ? selectedBuyer : undefined,
    }),
    [
      searchValue,
      activeFilter,
      propertyFilter,
      selectedYear,
      selectedMonth,
      selectedSupplier,
      selectedBuyer,
      filterConfig.enableSupplierFilter,
      filterConfig.enableBuyerFilter,
    ]
  );

  // Filtered data
  const filteredData = useFinanceFilters(data, filterOptions, filterConfig);

  // Sorted data
  const sortedData = useFinanceSort(filteredData, sortState);

  // Paginated data
  const paginatedData = useMemo(() => {
    return sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData.length, itemsPerPage]
  );

  // Total amount
  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredData]);

  // Sort handler
  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  }, []);

  // Reset filters handler
  const resetFilters = useCallback(() => {
    setSearchValue("");
    setActiveFilter("all");
    setPropertyFilter("all");
    setSelectedYear("all");
    setSelectedMonth("all");
    setSelectedSupplier("all");
    setSelectedBuyer("all");
    setCurrentPage(1);
  }, []);

  return {
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    propertyFilter,
    setPropertyFilter,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedSupplier,
    setSelectedSupplier,
    selectedBuyer,
    setSelectedBuyer,
    sortState,
    handleSort,
    currentPage,
    setCurrentPage,
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    totalAmount,
    resetFilters,
  } as UseFinanceListResult<T> & { resetFilters: () => void };
}
