import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface TableColumn<T = unknown> {
  key: string;
  label: string | ReactNode;
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
  readonly title: string;
  readonly badge?: {
    readonly label: string;
    readonly variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  };
  readonly description?: string;
  readonly actions?: TableAction[];
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
  readonly columns: TableColumn<T>[];
  readonly data: T[];
  readonly header?: TableHeaderProps;
  readonly filters?: TableFilter[];
  readonly search?: {
    readonly placeholder?: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
  };
  readonly pagination?: TablePagination;
  readonly sortState?: {
    readonly column: string | null;
    readonly direction: SortDirection;
  };
  readonly onSort?: (column: string, direction: SortDirection) => void;
  readonly emptyState?: TableEmptyState;
  readonly emptyMessage?: string;
  readonly className?: string;
  readonly rowClassName?: string | ((row: T, index: number) => string);
  readonly loading?: boolean;
  readonly slim?: boolean;
  readonly onRowClick?: (row: T, index: number) => void;
  readonly selectable?: {
    readonly selectedRows: Set<string | number>;
    readonly onSelectionChange: (selectedRows: Set<string | number>) => void;
    readonly getRowId: (row: T) => string | number;
    readonly allData?: T[];
  };
  readonly selectedCountLabel?: ReactNode;
  readonly selectedActionButton?: ReactNode;
  readonly additionalContent?: ReactNode;
  readonly middleContent?: ReactNode;
  readonly rightContent?: ReactNode;
  readonly belowContent?: ReactNode;
}
