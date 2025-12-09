import type { TableColumn, TableFilter } from "~/components/ui";
import { StatusBadge } from "~/components/ui";
import { formatDate, formatCurrency } from "~/utils/formatting";
import { renderEntityName } from "./entity-name-renderer";
import { getStatusVariant } from "~/utils/finance";
import type { Language, Property } from "~/types";

interface PropertyColumnOptions {
  label: string;
  language: Language;
  propertiesMap?: Map<string, Property>;
}

/**
 * Creates a property column for finance transaction tables.
 */
export function createPropertyColumn<T extends { propertyId: string }>({
  label,
  language: _language,
  propertiesMap,
}: PropertyColumnOptions): TableColumn<T> {
  return {
    key: "property",
    label,
    sortable: true,
    render: (_, row) => {
      const property = propertiesMap?.get(row.propertyId);
      return <span className="text-gray-700 dark:text-gray-300">{property?.name || "-"}</span>;
    },
  };
}

interface CategoryColumnOptions {
  label: string;
  categories: Record<string, string>;
}

/**
 * Creates a category column for finance transaction tables.
 */
export function createCategoryColumn<T extends { category?: string }>({
  label,
  categories,
}: CategoryColumnOptions): TableColumn<T> {
  return {
    key: "category",
    label,
    sortable: true,
    render: (_, row) => (
      <span className="text-gray-700 dark:text-gray-300">
        {row.category ? categories[row.category] || row.category : "-"}
      </span>
    ),
  };
}

interface DescriptionColumnOptions {
  label: string;
}

/**
 * Creates a description column for finance transaction tables.
 */
export function createDescriptionColumn<T extends { description: string }>({
  label,
}: DescriptionColumnOptions): TableColumn<T> {
  return {
    key: "description",
    label,
    sortable: true,
    render: (_, row) => <span className="text-gray-700 dark:text-gray-300">{row.description}</span>,
  };
}

interface EntityColumnOptions {
  key?: string;
  type?: "income" | "expense";
}

/**
 * Creates an entity (supplier/employee/serviceProvider/buyer) column for finance transaction tables.
 * For CashFlow transactions, pass the type to determine which entities to show.
 * For AccountsPayable/AccountsReceivable, omit the type.
 */
export function createEntityColumn<
  T extends {
    supplierId?: string;
    employeeId?: string;
    serviceProviderId?: string;
    buyerId?: string;
    type?: "income" | "expense";
  },
>({ key = "supplierBuyer", type }: EntityColumnOptions = {}): TableColumn<T> {
  return {
    key,
    label: "",
    sortable: false,
    render: (_, row) => {
      return renderEntityName({
        supplierId: row.supplierId,
        employeeId: row.employeeId,
        serviceProviderId: row.serviceProviderId,
        buyerId: row.buyerId,
        type: type || row.type,
      });
    },
  };
}

interface DateColumnOptions {
  label: string;
  language: Language;
  dateField: "date" | "dueDate";
}

/**
 * Creates a date column for finance transaction tables.
 */
export function createDateColumn<T extends { date?: string; dueDate?: string }>({
  label,
  language,
  dateField,
}: DateColumnOptions): TableColumn<T> {
  return {
    key: dateField,
    label,
    sortable: true,
    render: (_, row) => {
      const dateValue = dateField === "date" ? row.date : row.dueDate;
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {dateValue ? formatDate(dateValue, language) : "-"}
        </span>
      );
    },
  };
}

interface AmountColumnOptions {
  label: string;
  colorClass?: "green" | "red";
}

/**
 * Creates an amount column for finance transaction tables.
 */
export function createAmountColumn<T extends { amount: number }>({
  label,
  colorClass = "green",
}: AmountColumnOptions): TableColumn<T> {
  const colorClasses =
    colorClass === "green"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  return {
    key: "amount",
    label,
    sortable: true,
    render: (_, row) => (
      <span className={`font-medium ${colorClasses}`}>{formatCurrency(row.amount)}</span>
    ),
  };
}

interface StatusColumnOptions {
  label: string;
  statusMap: Record<string, string>;
}

/**
 * Creates a status column for finance transaction tables.
 */
export function createStatusColumn<T extends { status: string }>({
  label,
  statusMap,
}: StatusColumnOptions): TableColumn<T> {
  return {
    key: "status",
    label,
    sortable: true,
    render: (_, row) => (
      <StatusBadge
        label={statusMap[row.status] || row.status}
        variant={getStatusVariant(row.status)}
      />
    ),
  };
}

interface PaidAmountColumnOptions {
  label: string;
}

/**
 * Creates a paid amount column for finance transaction tables.
 */
export function createPaidAmountColumn<T extends { paidAmount?: number }>({
  label,
}: PaidAmountColumnOptions): TableColumn<T> {
  return {
    key: "paidAmount",
    label,
    sortable: true,
    render: (_, row) => (
      <span className="text-gray-700 dark:text-gray-300">
        {row.paidAmount ? formatCurrency(row.paidAmount) : "-"}
      </span>
    ),
  };
}

interface FinanceFilterOptions {
  allLabel: string;
  paidLabel: string;
  unpaidLabel: string;
  overdueLabel: string;
  partialLabel: string;
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

/**
 * Creates standard filters for accounts payable/receivable pages.
 */
export function createFinanceFilters({
  allLabel,
  paidLabel,
  unpaidLabel,
  overdueLabel,
  partialLabel,
  activeFilter,
  onFilterChange,
}: FinanceFilterOptions): TableFilter[] {
  return [
    {
      label: allLabel,
      value: "all",
      active: activeFilter === "all",
      onClick: () => onFilterChange("all"),
    },
    {
      label: paidLabel,
      value: "paid",
      active: activeFilter === "paid",
      onClick: () => onFilterChange("paid"),
    },
    {
      label: unpaidLabel,
      value: "unpaid",
      active: activeFilter === "unpaid",
      onClick: () => onFilterChange("unpaid"),
    },
    {
      label: overdueLabel,
      value: "overdue",
      active: activeFilter === "overdue",
      onClick: () => onFilterChange("overdue"),
    },
    {
      label: partialLabel,
      value: "partial",
      active: activeFilter === "partial",
      onClick: () => onFilterChange("partial"),
    },
  ];
}
