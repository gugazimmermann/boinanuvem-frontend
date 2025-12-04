import type { TableColumn } from "~/components/ui";
import { TableActionButtons } from "~/components/ui";

interface CreateActionColumnOptions<T> {
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  canEdit: boolean;
  canDelete: boolean;
  key?: string;
}

/**
 * Creates a standardized action column for table rows with edit and delete buttons.
 */
export function createActionColumn<T extends { id: string }>({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  key = "actions",
}: CreateActionColumnOptions<T>): TableColumn<T> {
  return {
    key,
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
