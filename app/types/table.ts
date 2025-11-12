/**
 * Table component types
 */

import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface TableFilter {
  label: string;
  value: string;
  active?: boolean;
  onClick: () => void;
}

export interface TablePagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

export interface TableHeaderProps {
  title: string;
  badge?: {
    label: string;
    variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  };
  description?: string;
  actions?: TableAction[];
}

export interface TableEmptyState {
  title?: string;
  description?: string;
  onClearSearch?: () => void;
  clearSearchLabel?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  icon?: ReactNode;
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  header?: TableHeaderProps;
  filters?: TableFilter[];
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };
  pagination?: TablePagination;
  sortState?: {
    column: string | null;
    direction: SortDirection;
  };
  onSort?: (column: string, direction: SortDirection) => void;
  emptyState?: TableEmptyState;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  loading?: boolean;
  slim?: boolean;
  onRowClick?: (row: T, index: number) => void;
}
