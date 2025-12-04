import type { TableColumn } from "~/components/ui";
import { formatDate } from "~/utils/formatting";
import { getPropertyById } from "~/services/properties.service";
import { renderEntityName } from "./entity-name-renderer";
import type { Language } from "~/types";

interface PropertyColumnOptions {
  label: string;
  language: Language;
}

/**
 * Creates a property column for finance transaction tables.
 */
export function createPropertyColumn<T extends { propertyId: string }>({
  label,
  language: _language,
}: PropertyColumnOptions): TableColumn<T> {
  return {
    key: "property",
    label,
    sortable: true,
    render: (_, row) => {
      const property = getPropertyById(row.propertyId);
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
