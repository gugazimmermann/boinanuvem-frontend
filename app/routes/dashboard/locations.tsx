import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getLocations, deleteLocation } from "~/services/locations.service";
import { useAlert } from "~/hooks/use-alert";
import type { Animal, AnimalMovement, Location, Property } from "~/types";
import { getProperties } from "~/services/properties.service";
import { ROUTES, getLocationEditRoute, getLocationViewRoute } from "~/routes.config";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";
import { getLocationMovementsByLocationId } from "~/services/location-movements.service";
import { getLocationObservationsByLocationId } from "~/services/location-observations.service";
import { usePermissions } from "~/utils/permissions";
import { RegistrationListPage } from "~/components/dashboard/registrations/registration-list-page";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getAnimalMovementsByCompanyId } from "~/services/animal-movements.service";
import {
  createNameCodeColumn,
  createStatusColumn,
  createAreaColumn,
  createLastObservationColumn,
  createLastMovementColumn,
} from "~/components/dashboard/registrations/table-columns";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";

export function meta() {
  return createRegistrationMeta("Localizações", "Gerenciamento de localizações do Boi na Nuvem");
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function Locations() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canEdit, canRemove } = usePermissions();
  const { showAlert } = useAlert();
  const [locations, setLocations] = useState<Location[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalMovements, setAnimalMovements] = useState<AnimalMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [locationsData, propertiesData, animalsData, animalMovementsData] = await Promise.all(
          [
            getLocations(),
            getProperties(),
            // companyId is inferred from the current auth context in the API
            getAnimalsByCompanyId(""),
            getAnimalMovementsByCompanyId(),
          ]
        );
        setLocations(locationsData);
        setProperties(propertiesData);
        setAnimals(animalsData);
        setAnimalMovements(animalMovementsData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t.locations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showAlert, t]);

  const activeAnimalsCountByLocationId = useMemo(() => {
    // Determine each animal's last movement location, then count only active animals per location
    const activeAnimalIds = new Set(animals.filter((a) => a.status === "active").map((a) => a.id));

    const lastLocationByAnimalId = new Map<string, string | null>();
    const sortedMovements = [...animalMovements].sort((a, b) => {
      // date comes as string (YYYY-MM-DD); fall back to createdAt/updatedAt if needed
      const aTime = Date.parse(a.date ?? "") || 0;
      const bTime = Date.parse(b.date ?? "") || 0;
      return bTime - aTime;
    });

    for (const movement of sortedMovements) {
      for (const animalId of movement.animalIds || []) {
        if (!lastLocationByAnimalId.has(animalId)) {
          lastLocationByAnimalId.set(animalId, movement.locationId ?? null);
        }
      }
    }

    const counts = new Map<string, number>();
    for (const [animalId, locationId] of lastLocationByAnimalId.entries()) {
      if (!locationId) continue;
      if (!activeAnimalIds.has(animalId)) continue;
      counts.set(locationId, (counts.get(locationId) ?? 0) + 1);
    }
    return counts;
  }, [animals, animalMovements]);

  const columns: TableColumn<Location>[] = useMemo(
    () => [
      createNameCodeColumn<Location>(t.locations.table.name, true),
      {
        key: "property",
        label: t.locations.table.property,
        sortable: true,
        render: (_, row) => {
          const property = properties.find((p) => p.id === row.propertyId);
          return <span className="text-gray-700 dark:text-gray-300">{property?.name || "-"}</span>;
        },
      },
      {
        key: "locationType",
        label: t.locations.table.locationType,
        sortable: true,
        render: (_, row) => (
          <LocationTypeBadge
            locationType={row.locationType}
            label={
              t.locations.types[row.locationType as keyof typeof t.locations.types] ||
              row.locationType
            }
          />
        ),
      },
      createAreaColumn<Location>(t.locations.table.area, language, true),
      {
        key: "activeAnimals",
        label: t.locations.table.activeAnimals,
        sortable: true,
        render: (_, row) => (
          <span className="text-gray-700 dark:text-gray-300">
            {activeAnimalsCountByLocationId.get(row.id) ?? 0}
          </span>
        ),
      },
      createLastMovementColumn<Location>(
        t.locations.table.lastMovement || "Última Movimentação",
        getLocationMovementsByLocationId,
        t,
        language
      ),
      createLastObservationColumn<Location>(
        t.locations.table.lastObservation || "Última Observação",
        getLocationObservationsByLocationId,
        language
      ),
      createStatusColumn<Location>(
        t.locations.table.status,
        t.locations.table.active,
        t.locations.table.inactive,
        true
      ),
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => navigate(getLocationEditRoute(row.id))}
            onDelete={() => {}}
            canEdit={canEdit("registration", "location")}
            canDelete={canRemove("registration", "location")}
          />
        ),
      },
    ],
    [t, language, navigate, canEdit, canRemove, properties, activeAnimalsCountByLocationId]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.locations.filters.all, value: "all" as const },
      { label: t.locations.filters.active, value: "active" as const },
      { label: t.locations.filters.inactive, value: "inactive" as const },
    ],
    [t]
  );

  return (
    <RegistrationListPage<Location>
      data={locations}
      columns={columns}
      title={t.locations.title}
      description={t.locations.description}
      badgeLabel={(count) => t.locations.badge.locations(count)}
      searchPlaceholder={t.locations.searchPlaceholder}
      emptyStateTitle={t.locations.emptyState.title}
      emptyStateDescription={(searchValue) =>
        t.locations.emptyState.descriptionWithSearch(searchValue)
      }
      emptyStateDescriptionWithoutSearch={t.locations.emptyState.descriptionWithoutSearch}
      addButtonLabel={t.locations.addLocation}
      newRoute={ROUTES.LOCATIONS_NEW}
      viewRoute={getLocationViewRoute}
      deleteService={async (location) => {
        try {
          await deleteLocation(location.id);
          setLocations(locations.filter((l) => l.id !== location.id));
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t.locations.errors.deleteFailed;
          showAlert(errorMessage, "error");
          return false;
        }
      }}
      isLoading={isLoading}
      deleteSuccessMessage={t.locations.success.deleted}
      deleteErrorMessage={t.locations.errors.deleteFailed}
      deleteModalTitle={t.locations.deleteModal.title}
      deleteModalMessage={(name) => t.locations.deleteModal.message(name)}
      deleteModalConfirm={t.locations.deleteModal.confirm}
      deleteModalCancel={t.locations.deleteModal.cancel}
      onDeleteSuccess={(location) => {
        setLocations(locations.filter((l) => l.id !== location.id));
      }}
      permissionSection="registration"
      permissionResource="location"
      language={language}
      initialSortColumn="name"
      searchFields={[
        "name",
        (location) => properties.find((p) => p.id === location.propertyId)?.name || "",
      ]}
      filterOptions={filterOptions}
    />
  );
}
