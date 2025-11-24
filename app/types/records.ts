import type { Language } from "./index";

export interface RecordListConfig<T> {
  data: T[];
  itemsPerPage?: number;
  initialSortColumn?: string;
  initialSortDirection?: "asc" | "desc";
  language?: Language;
  searchFields?: Array<keyof T | ((item: T) => string)>;
  customFilter?: (
    item: T,
    searchValue: string,
    propertyFilter: string,
    dateRange: { startDate: string; endDate: string }
  ) => boolean;
  dateField?: keyof T;
  propertyField?: keyof T;
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface RecordFilterState {
  propertyFilter: string;
  dateRange: DateRangeFilter;
}

export interface FeeItem {
  id: string;
  name: string;
  amount: string;
}

export interface RecordFormState {
  propertyId: string;
  [key: string]: unknown;
}

export interface RecordFormErrors {
  [key: string]: string;
}
