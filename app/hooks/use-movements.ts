import { useState, useMemo } from "react";
import type { LocationMovement, AnimalMovement } from "~/types";
import { formatDate } from "~/utils/formatting";
import type { UnifiedMovement } from "~/components/dashboard/movements/movements-section";
import { sortItems } from "~/utils/sorting";
import {
  getLocationIds,
  getLocationNamesForSearch,
  getLocationNamesForSort,
  getEntityNames,
  getAnimalNames,
} from "~/utils/movements-helpers";
import { paginateItems } from "~/utils/table-helpers";
import { consolidateAnimalMovements } from "~/utils/movement-consolidation";

interface UseMovementsOptions {
  locationMovements: LocationMovement[];
  animalMovements: AnimalMovement[];
  language: "pt" | "en" | "es";
  translationKeys: {
    types: Record<string, string>;
  };
  getLocationById: (id: string) => { name: string; code: string } | null;
  getEmployeeById: (id: string) => { name: string } | null;
  getServiceProviderById: (id: string) => { name: string } | null;
  getAnimalById: (id: string) => { code: string; registrationNumber: string } | null;
  itemsPerPage?: number;
}

export function useMovements({
  locationMovements,
  animalMovements,
  language,
  translationKeys,
  getLocationById,
  getEmployeeById,
  getServiceProviderById,
  getAnimalById,
  itemsPerPage = 10,
}: UseMovementsOptions) {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: "asc" | "desc" | null;
  }>({ column: "date", direction: "desc" });

  const consolidatedAnimalMovements = useMemo(
    () => consolidateAnimalMovements(animalMovements),
    [animalMovements]
  );

  const movements: UnifiedMovement[] = useMemo(
    () => [
      ...locationMovements.map((m) => ({ ...m, movementType: "location" as const })),
      ...consolidatedAnimalMovements.map((m) => ({ ...m, movementType: "animal" as const })),
    ],
    [locationMovements, consolidatedAnimalMovements]
  );

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      if (!searchValue) return true;

      const searchLower = searchValue.toLowerCase();

      if (movement.movementType === "location") {
        const typeText =
          translationKeys.types[
            (movement as LocationMovement).type as keyof typeof translationKeys.types
          ] || (movement as LocationMovement).type;
        if (typeText.toLowerCase().includes(searchLower)) return true;
      } else {
        const animalMovementText = translationKeys.types.animal_movement?.toLowerCase() || "";
        if (
          animalMovementText.includes(searchLower) ||
          "animal".toLowerCase().includes(searchLower)
        )
          return true;
      }

      const dateText = formatDate(movement.date, language);
      if (dateText.toLowerCase().includes(searchLower)) return true;

      const locationIds = getLocationIds(movement);
      const locationNames = getLocationNamesForSearch(locationIds, getLocationById);
      if (locationNames.includes(searchLower)) return true;

      if (movement.movementType === "animal") {
        const animalNames = getAnimalNames((movement as AnimalMovement).animalIds, getAnimalById);
        if (animalNames.includes(searchLower)) return true;
      }

      const employeeNames = getEntityNames(movement.employeeIds, getEmployeeById);
      if (employeeNames.includes(searchLower)) return true;

      const providerNames = getEntityNames(movement.serviceProviderIds, getServiceProviderById);
      if (providerNames.includes(searchLower)) return true;

      return false;
    });
  }, [
    movements,
    searchValue,
    language,
    translationKeys,
    getLocationById,
    getEmployeeById,
    getServiceProviderById,
    getAnimalById,
  ]);

  const sortedMovements = useMemo(() => {
    return sortItems({
      items: filteredMovements,
      sortState,
      getValue: (item, column) => {
        if (column === "date") {
          return new Date(item.date).getTime();
        } else if (column === "locations") {
          const locationIds = getLocationIds(item);
          return getLocationNamesForSort(locationIds, getLocationById);
        } else if (column === "type") {
          if (item.movementType === "location") {
            return (item as LocationMovement).type;
          }
          return "animal";
        }
        if (item.movementType === "location") {
          return (item as LocationMovement)[column as keyof LocationMovement] as
            | string
            | number
            | undefined;
        }
        return (item as AnimalMovement)[column as keyof AnimalMovement] as
          | string
          | number
          | undefined;
      },
      defaultSortColumn: "date",
      defaultSortDirection: "desc",
    });
  }, [filteredMovements, sortState, getLocationById]);

  const { paginatedItems: paginatedMovements, totalPages } = useMemo(() => {
    return paginateItems(sortedMovements, currentPage, itemsPerPage);
  }, [sortedMovements, currentPage, itemsPerPage]);

  return {
    movements,
    filteredMovements,
    sortedMovements,
    paginatedMovements,
    totalPages,
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    sortState,
    setSortState: (state: { column: string | null; direction: "asc" | "desc" | null }) => {
      setSortState(state);
      setCurrentPage(1);
    },
  };
}
