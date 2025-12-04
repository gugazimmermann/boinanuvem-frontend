import { useMemo, useState } from "react";
import type { InventoryItem, SortDirection, Language } from "~/types";
import { getCurrentStock } from "~/services/inventory.service";

export interface UseInventoryFiltersOptions {
  items: InventoryItem[];
  lowStockItems: InventoryItem[];
  expiringItems: InventoryItem[];
  language: Language;
}

export function useInventoryFilters(options: UseInventoryFiltersOptions) {
  const { items, lowStockItems, expiringItems, language } = options;
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  const filteredData = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchValue.toLowerCase()) ?? false);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "lowStock" && lowStockItems.some((i) => i.id === item.id)) ||
        (activeFilter === "expiring" && expiringItems.some((i) => i.id === item.id));

      const matchesProperty = propertyFilter === "all" || item.propertyIds.includes(propertyFilter);

      return matchesSearch && matchesFilter && matchesProperty;
    });
  }, [items, searchValue, activeFilter, propertyFilter, lowStockItems, expiringItems]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (!sortState.column || !sortState.direction) {
        return 0;
      }

      type SortValue = string | number | undefined;
      let aValue: SortValue;
      let bValue: SortValue;

      if (sortState.column === "currentStock") {
        aValue = getCurrentStock(a.id);
        bValue = getCurrentStock(b.id);
      } else {
        aValue = a[sortState.column as keyof InventoryItem] as string | number | undefined;
        bValue = b[sortState.column as keyof InventoryItem] as string | number | undefined;
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      const getLocale = () => {
        if (language === "en") return "en-US";
        if (language === "es") return "es-ES";
        return "pt-BR";
      };
      const locale = getLocale();
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue, locale, {
          sensitivity: "base",
        });
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), locale);
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortState, language]);

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
  };

  return {
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    propertyFilter,
    setPropertyFilter,
    sortState,
    handleSort,
    filteredData,
    sortedData,
  };
}
