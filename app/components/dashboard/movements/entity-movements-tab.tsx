import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import type { LocationMovement, AnimalMovement } from "~/types";
import type { TableAction } from "~/components/ui";
import { MovementsSection } from "./movements-section";
import { useMovements } from "~/hooks/use-movements";
import { createMovementsTableColumns } from "~/utils/movements-table-columns";
import { createEntityGetters } from "~/utils/entity-getters";
import { getMovementNewRoute, getMovementViewRoute } from "~/routes.config";

export type EntityMovementsType = "employee" | "serviceProvider";

export interface EntityMovementsTabProps {
  readonly entityType: EntityMovementsType;
  readonly entityId: string;
  readonly entityPropertyIds?: string[];
  readonly locationMovements: LocationMovement[];
  readonly animalMovements: AnimalMovement[];
  readonly getMovementNewRouteParam?: (propertyId: string) => string;
  readonly getMovementViewRouteParam?: (movementId: string) => string;
}

export function EntityMovementsTab({
  entityType,
  entityId,
  entityPropertyIds = [],
  locationMovements,
  animalMovements,
  getMovementNewRouteParam,
  getMovementViewRouteParam,
}: EntityMovementsTabProps) {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();

  const entityGetters = createEntityGetters();

  const movementsData = useMovements({
    locationMovements,
    animalMovements,
    language,
    translationKeys: {
      types: t.properties.details.movements.types as Record<string, string>,
    },
    ...entityGetters,
  });

  const columns = createMovementsTableColumns({
    language,
    translationKeys: {
      date: t.properties.details.movements.table.date,
      type: t.properties.details.movements.table.type,
      locations: t.properties.details.movements.table.locations,
      animals: "Animais",
      responsible: t.properties.details.movements.table.responsible,
      observation: t.properties.details.movements.observation,
      files: t.properties.details.movements.files,
      types: t.properties.details.movements.types as Record<string, string>,
    },
    ...entityGetters,
  });

  const firstPropertyId =
    entityPropertyIds && entityPropertyIds.length > 0 ? entityPropertyIds[0] : null;

  const headerActions: TableAction[] = firstPropertyId
    ? [
        {
          label: t.properties.details.movements.add,
          variant: "primary",
          leftIcon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          onClick: () => {
            const route = getMovementNewRouteParam
              ? getMovementNewRouteParam(firstPropertyId)
              : `${getMovementNewRoute(firstPropertyId)}?${entityType}Id=${entityId}`;
            navigate(route);
          },
        },
      ]
    : [];

  const getRowClickRoute = (movementId: string) => {
    if (getMovementViewRouteParam) {
      return getMovementViewRouteParam(movementId);
    }
    return `${getMovementViewRoute(movementId)}?from${entityType.charAt(0).toUpperCase() + entityType.slice(1)}=${entityId}`;
  };

  return (
    <MovementsSection
      movements={movementsData.movements}
      filteredMovements={movementsData.filteredMovements}
      paginatedMovements={movementsData.paginatedMovements}
      totalPages={movementsData.totalPages}
      currentPage={movementsData.currentPage}
      onPageChange={movementsData.setCurrentPage}
      searchValue={movementsData.searchValue}
      onSearchChange={movementsData.setSearchValue}
      sortState={movementsData.sortState}
      onSort={(column: string, direction: "asc" | "desc" | null) => {
        movementsData.setSortState({ column, direction: direction || null });
      }}
      columns={columns}
      headerActions={headerActions}
      title={t.properties.details.movements.title}
      description={t.properties.details.movements.description}
      searchPlaceholder={t.properties.details.movements.searchPlaceholder}
      emptyStateTitle={t.properties.details.movements.emptyState.title}
      emptyStateDescription={t.properties.details.movements.emptyState.description}
      emptyStateDescriptionWithSearch={
        t.properties.details.movements.emptyState.descriptionWithSearch
      }
      onRowClick={(row) => navigate(getRowClickRoute(row.id))}
      translationKeys={{
        date: t.properties.details.movements.table.date,
        type: t.properties.details.movements.table.type,
        locations: t.properties.details.movements.table.locations,
        animals: t.properties.details.movements.table.locations || "",
        responsible: t.properties.details.movements.table.responsible,
        observation: t.properties.details.movements.table.observation,
        files: t.properties.details.movements.table.files || "",
        movements: t.properties.details.movements.title || "",
        movement: t.properties.details.movements.title || "",
        clearSearch: t.common.clearSearch,
      }}
    />
  );
}
