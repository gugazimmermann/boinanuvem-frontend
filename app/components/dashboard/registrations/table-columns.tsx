import type { TableColumn } from "~/components/ui";
import { StatusBadge, TableActionButtons } from "~/components/ui";
import { formatAreaType } from "~/utils/formatting";
import type { AreaType } from "~/types";
import { getLocaleForNumber } from "~/utils/formatting";
import type { Language } from "~/types";

export function createNameCodeColumn<T extends { name: string; code: string }>(
  label: string,
  sortable: boolean = true
): TableColumn<T> {
  return {
    key: "name",
    label,
    sortable,
    render: (_, row) => (
      <div>
        <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
        <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
      </div>
    ),
  };
}

export function createStatusColumn<T extends { status: "active" | "inactive" }>(
  label: string,
  activeLabel: string,
  inactiveLabel: string,
  sortable: boolean = true
): TableColumn<T> {
  return {
    key: "status",
    label,
    sortable,
    render: (_, row) => (
      <StatusBadge
        label={row.status === "active" ? activeLabel : inactiveLabel}
        variant={row.status === "active" ? "success" : "default"}
      />
    ),
  };
}

export function createAreaColumn<T extends { area: { value: number; type: AreaType } }>(
  label: string,
  language: Language = "pt",
  sortable: boolean = true
): TableColumn<T> {
  const localeForNumber = getLocaleForNumber(language);
  return {
    key: "area",
    label,
    sortable,
    render: (_, row) => (
      <span className="text-gray-700 dark:text-gray-300">
        {row.area.value.toLocaleString(localeForNumber, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        {formatAreaType(row.area.type)}
      </span>
    ),
  };
}

export function createActionsColumn<T extends { id: string }>(
  onEdit: (item: T) => void,
  onDelete: (item: T) => void,
  canEdit: boolean,
  canDelete: boolean
): TableColumn<T> {
  return {
    key: "actions",
    label: "",
    headerClassName: "relative",
    render: (_, row) => (
      <TableActionButtons
        onEdit={() => onEdit(row)}
        onDelete={() => onDelete(row)}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    ),
  };
}

export function createTextColumn<T>(
  key: string,
  label: string,
  getValue: (row: T) => string | number | null | undefined,
  sortable: boolean = true
): TableColumn<T> {
  return {
    key,
    label,
    sortable,
    render: (_, row) => {
      const value = getValue(row);
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {value != null ? String(value) : "-"}
        </span>
      );
    },
  };
}
