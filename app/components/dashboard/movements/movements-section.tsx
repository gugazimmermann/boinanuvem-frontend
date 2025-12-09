import { Table, type TableColumn, type TableAction } from "~/components/ui";
import type { LocationMovement, AnimalMovement } from "~/types";

export type UnifiedMovement =
  | (LocationMovement & { movementType: "location" } & Record<string, unknown>)
  | (AnimalMovement & { movementType: "animal" } & Record<string, unknown>);

interface MovementsSectionProps {
  readonly movements: UnifiedMovement[];
  readonly filteredMovements: UnifiedMovement[];
  readonly paginatedMovements: UnifiedMovement[];
  readonly totalPages: number;
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly sortState: { column: string | null; direction: "asc" | "desc" | null };
  readonly onSort: (column: string, direction: "asc" | "desc" | null) => void;
  readonly columns: TableColumn<UnifiedMovement>[];
  readonly headerActions?: TableAction[];
  readonly title: string;
  readonly description: string;
  readonly searchPlaceholder: string;
  readonly emptyStateTitle: string;
  readonly emptyStateDescription: string;
  readonly emptyStateDescriptionWithSearch?: (searchValue: string) => string;
  readonly onRowClick?: (row: UnifiedMovement) => void;
  readonly translationKeys: {
    date: string;
    type: string;
    locations: string;
    animals: string;
    responsible: string;
    observation: string;
    files: string;
    movements: string;
    movement: string;
    clearSearch: string;
  };
}

export function MovementsSection({
  filteredMovements,
  paginatedMovements,
  totalPages,
  currentPage,
  onPageChange,
  searchValue,
  onSearchChange,
  sortState,
  onSort,
  columns,
  headerActions,
  title,
  description,
  searchPlaceholder,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateDescriptionWithSearch,
  onRowClick,
  translationKeys,
}: MovementsSectionProps) {
  return (
    <div data-testid="movements-section" className="space-y-8">
      <Table<UnifiedMovement>
        columns={columns}
        data={paginatedMovements}
        header={{
          title,
          badge: {
            label: `${filteredMovements.length} ${
              filteredMovements.length === 1 ? translationKeys.movement : translationKeys.movements
            }`,
            variant: "primary",
          },
          description,
          actions: headerActions,
        }}
        search={{
          placeholder: searchPlaceholder,
          value: searchValue,
          onChange: (value) => {
            onSearchChange(value);
            onPageChange(1);
          },
        }}
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange,
          showInfo: false,
        }}
        sortState={sortState}
        onSort={onSort}
        emptyState={{
          title: emptyStateTitle,
          description: searchValue
            ? emptyStateDescriptionWithSearch?.(searchValue) || emptyStateDescription
            : emptyStateDescription,
          onClearSearch: searchValue
            ? () => {
                onSearchChange("");
                onPageChange(1);
              }
            : undefined,
          clearSearchLabel: searchValue ? translationKeys.clearSearch : undefined,
        }}
        onRowClick={onRowClick}
      />
    </div>
  );
}
