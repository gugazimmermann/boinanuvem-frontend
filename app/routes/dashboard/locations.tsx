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
    [t, language, navigate, canEdit, canRemove]
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
