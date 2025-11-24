import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockLocations } from "~/mocks/locations";
import { deleteLocation } from "~/services/locations.service";
import type { Location } from "~/types";
import { getPropertyById } from "~/services/properties.service";
import { ROUTES, getLocationEditRoute, getLocationViewRoute } from "~/routes.config";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";
import { getLocationMovementsByLocationId } from "~/services/location-movements.service";
import { getLocationObservationsByLocationId } from "~/services/location-observations.service";
import { usePermissions } from "~/utils/permissions";
import { RegistrationListPage } from "~/components/dashboard/registrations/registration-list-page";
import {
  createNameCodeColumn,
  createStatusColumn,
  createAreaColumn,
} from "~/components/dashboard/registrations/table-columns";
import { formatDate } from "~/utils/formatting";
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
  const [locations, setLocations] = useState<Location[]>([...mockLocations]);

  const columns: TableColumn<Location>[] = useMemo(
    () => [
      createNameCodeColumn<Location>(t.locations.table.name, true),
      {
        key: "property",
        label: t.locations.table.property,
        sortable: true,
        render: (_, row) => {
          const property = getPropertyById(row.propertyId);
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
        key: "lastMovement",
        label: t.locations.table.lastMovement || "Última Movimentação",
        sortable: false,
        render: (_, row) => {
          const movements = getLocationMovementsByLocationId(row.id);
          if (movements.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500">-</span>;
          }
          const lastMovement = movements.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          const movementTypeLabel =
            t.properties.details.movements.types[
              lastMovement.type as keyof typeof t.properties.details.movements.types
            ] || lastMovement.type;
          return (
            <div className="space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">{movementTypeLabel}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(lastMovement.date, language)}
              </p>
            </div>
          );
        },
      },
      {
        key: "lastObservation",
        label: t.locations.table.lastObservation || "Última Observação",
        sortable: false,
        render: (_, row) => {
          const observations = getLocationObservationsByLocationId(row.id);
          if (observations.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500">-</span>;
          }
          const lastObservation = observations.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          const truncated =
            lastObservation.observation.length > 60
              ? `${lastObservation.observation.substring(0, 60)}...`
              : lastObservation.observation;
          return (
            <div className="space-y-1">
              <p
                className="text-sm text-gray-700 dark:text-gray-300"
                title={lastObservation.observation}
              >
                {truncated}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(lastObservation.createdAt, language)}
              </p>
            </div>
          );
        },
      },
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
    [t, language, navigate, canEdit, canRemove]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.locations.filters.all, value: "all" },
      { label: t.locations.filters.active, value: "active" },
      { label: t.locations.filters.inactive, value: "inactive" },
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
      deleteService={(location) => {
        const success = deleteLocation(location.id);
        if (success) {
          setLocations(locations.filter((l) => l.id !== location.id));
        }
        return success;
      }}
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
      searchFields={["name", (location) => getPropertyById(location.propertyId)?.name || ""]}
      filterOptions={filterOptions}
    />
  );
}
