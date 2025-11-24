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

  sortState: SortState;
  handleSort: (column: string, direction: SortDirection) => void;

  currentPage: number;
  setCurrentPage: (page: number) => void;

  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  totalPages: number;

  totalAmount: number;
}

export function useFinanceList<T extends CashFlow | AccountsPayable | AccountsReceivable>(
  options: UseFinanceListOptions<T>
): UseFinanceListResult<T> {
  const { data, initialSort, itemsPerPage = 10, filterConfig = {} } = options;

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedBuyer, setSelectedBuyer] = useState("all");

  const [sortState, setSortState] = useState<SortState>(
    initialSort || { column: null, direction: "asc" }
  );

  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredData = useFinanceFilters(data, filterOptions, filterConfig);

  const sortedData = useFinanceSort(filteredData, sortState);

  const paginatedData = useMemo(() => {
    return sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData.length, itemsPerPage]
  );

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredData]);

  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  }, []);

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
