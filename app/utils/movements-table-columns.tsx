import { formatDate } from "~/utils/formatting";
import type { TableColumn } from "~/components/ui";
import type { LocationMovement, AnimalMovement } from "~/types";
import type { UnifiedMovement } from "~/components/dashboard/movements/movements-section";

export interface MovementsTableColumnsOptions {
  language: "pt" | "en" | "es";
  translationKeys: {
    date: string;
    type: string;
    locations: string;
    animals?: string;
    responsible: string;
    observation: string;
    files: string;
    types: Record<string, string>;
  };
  getLocationById: (id: string) => { name: string; code: string } | null;
  getEmployeeById: (id: string) => { name: string } | null;
  getServiceProviderById: (id: string) => { name: string } | null;
  getAnimalById?: (id: string) => { code: string; registrationNumber: string } | null;
  includeAnimalsColumn?: boolean;
}

/**
 * Factory function to generate movements table columns
 */
export function createMovementsTableColumns({
  language,
  translationKeys,
  getLocationById,
  getEmployeeById,
  getServiceProviderById,
  getAnimalById: _getAnimalById,
  includeAnimalsColumn = true,
}: MovementsTableColumnsOptions): TableColumn<UnifiedMovement>[] {
  const columns: TableColumn<UnifiedMovement>[] = [
    {
      key: "date",
      label: translationKeys.date,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date, language)}</span>
      ),
    },
    {
      key: "type",
      label: translationKeys.type,
      sortable: true,
      render: (_, row) => {
        if (row.movementType === "location") {
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {translationKeys.types[
                (row as LocationMovement).type as keyof typeof translationKeys.types
              ] || (row as LocationMovement).type}
            </span>
          );
        } else {
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {translationKeys.types.animal_movement}
            </span>
          );
        }
      },
    },
    {
      key: "locations",
      label: translationKeys.locations,
      sortable: true,
      render: (_, row) => {
        let locationIds: string[];
        if (row.movementType === "location") {
          locationIds = (row as LocationMovement).locationIds;
        } else {
          const animalMovement = row as AnimalMovement;
          locationIds = animalMovement.locationId ? [animalMovement.locationId] : [];
        }
        const locationNames = locationIds
          .filter((id): id is string => id !== null && id !== undefined)
          .map((id) => {
            const location = getLocationById(id);
            return location ? `${location.name} (${location.code})` : id;
          })
          .join(", ");
        return <span className="text-gray-700 dark:text-gray-300">{locationNames || "-"}</span>;
      },
    },
  ];

  if (includeAnimalsColumn) {
    columns.push({
      key: "animals",
      label: translationKeys.animals || "Animais",
      sortable: false,
      render: (_, row) => {
        if (row.movementType === "animal") {
          const count = (row as AnimalMovement).animalIds.length;
          return <span className="text-gray-700 dark:text-gray-300">{count}</span>;
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      },
    });
  }

  columns.push(
    {
      key: "responsible",
      label: translationKeys.responsible,
      sortable: false,
      render: (_, row) => {
        const employeeNames = row.employeeIds
          .map((id) => {
            const employee = getEmployeeById(id);
            return employee ? employee.name : null;
          })
          .filter((name): name is string => name !== null);

        const providerNames = row.serviceProviderIds
          .map((id) => {
            const provider = getServiceProviderById(id);
            return provider ? provider.name : null;
          })
          .filter((name): name is string => name !== null);

        const allResponsibles = [...employeeNames, ...providerNames];
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {allResponsibles.length > 0 ? allResponsibles.join(", ") : "-"}
          </span>
        );
      },
    },
    {
      key: "observation",
      label: translationKeys.observation,
      sortable: false,
      render: (_, row) => {
        const observation =
          row.movementType === "location"
            ? (row as LocationMovement).observation
            : (row as AnimalMovement).observation;
        if (!observation) {
          return <span className="text-gray-400 dark:text-gray-500">-</span>;
        }
        const truncated =
          observation.length > 50 ? `${observation.substring(0, 50)}...` : observation;
        return (
          <span className="text-gray-700 dark:text-gray-300" title={observation}>
            {truncated}
          </span>
        );
      },
    },
    {
      key: "files",
      label: translationKeys.files,
      sortable: false,
      render: (_, row) => {
        const fileIds =
          row.movementType === "location"
            ? (row as LocationMovement).fileIds
            : (row as AnimalMovement).fileIds;
        if (!fileIds || fileIds.length === 0) {
          return <span className="text-gray-400 dark:text-gray-500">-</span>;
        }
        return (
          <div className="flex items-center space-x-1">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">{fileIds.length}</span>
          </div>
        );
      },
    }
  );

  return columns;
}
