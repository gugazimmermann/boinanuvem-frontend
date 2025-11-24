import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockProperties } from "~/mocks/properties";
import { deleteProperty } from "~/services/properties.service";
import type { Property } from "~/types";
import { getLocationsByPropertyId } from "~/services/locations.service";
import { getAnimalsByPropertyId } from "~/services/animals.service";
import { ROUTES, getPropertyEditRoute, getPropertyViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { RegistrationListPage } from "~/components/dashboard/registrations/registration-list-page";
import {
  createNameCodeColumn,
  createStatusColumn,
  createAreaColumn,
} from "~/components/dashboard/registrations/table-columns";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";

export function meta() {
  return createRegistrationMeta("Propriedades", "Gerenciamento de propriedades do Boi na Nuvem");
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function Properties() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canEdit, canRemove } = usePermissions();
  const [properties, setProperties] = useState<Property[]>([...mockProperties]);

  const columns: TableColumn<Property>[] = useMemo(
    () => [
      createNameCodeColumn<Property>(t.properties.table.name, true),
      {
        key: "address",
        label: t.properties.table.address,
        sortable: false,
        render: (_, row) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.city} / {row.state}
          </span>
        ),
      },
      createAreaColumn<Property>(t.properties.table.area, language, true),
      {
        key: "pastures",
        label: t.properties.table.locations,
        sortable: true,
        render: (_, row) => {
          const locations = getLocationsByPropertyId(row.id);
          return <span className="text-gray-700 dark:text-gray-300">{locations.length}</span>;
        },
      },
      {
        key: "animals",
        label: t.properties.table.animals,
        sortable: true,
        render: (_, row) => {
          const animals = getAnimalsByPropertyId(row.id);
          return <span className="text-gray-700 dark:text-gray-300">{animals.length}</span>;
        },
      },
      createStatusColumn<Property>(
        t.properties.table.status,
        t.properties.table.active,
        t.properties.table.inactive,
        true
      ),
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => navigate(getPropertyEditRoute(row.id))}
            onDelete={() => {}}
            canEdit={canEdit("registration", "property")}
            canDelete={canRemove("registration", "property")}
          />
        ),
      },
    ],
    [t, language, navigate, canEdit, canRemove]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.properties.filters.all, value: "all" },
      { label: t.properties.filters.active, value: "active" },
      { label: t.properties.filters.inactive, value: "inactive" },
    ],
    [t]
  );

  return (
    <RegistrationListPage<Property>
      data={properties}
      columns={columns}
      title={t.properties.title}
      description={t.properties.description}
      badgeLabel={(count) => t.properties.badge.properties(count)}
      searchPlaceholder={t.properties.searchPlaceholder}
      emptyStateTitle={t.properties.emptyState.title}
      emptyStateDescription={(searchValue) =>
        t.properties.emptyState.descriptionWithSearch(searchValue)
      }
      emptyStateDescriptionWithoutSearch={t.properties.emptyState.descriptionWithoutSearch}
      addButtonLabel={t.properties.addProperty}
      newRoute={ROUTES.PROPERTIES_NEW}
      viewRoute={getPropertyViewRoute}
      deleteService={(property) => {
        const success = deleteProperty(property.id);
        if (success) {
          setProperties(properties.filter((p) => p.id !== property.id));
        }
        return success;
      }}
      deleteSuccessMessage={t.properties.success.deleted}
      deleteErrorMessage={t.properties.errors.deleteFailed}
      deleteModalTitle={t.properties.deleteModal.title}
      deleteModalMessage={(name) => t.properties.deleteModal.message(name)}
      deleteModalConfirm={t.properties.deleteModal.confirm}
      deleteModalCancel={t.properties.deleteModal.cancel}
      onDeleteSuccess={(property) => {
        setProperties(properties.filter((p) => p.id !== property.id));
      }}
      permissionSection="registration"
      permissionResource="property"
      language={language}
      initialSortColumn="name"
      searchFields={["name", "city", "state"]}
      filterOptions={filterOptions}
    />
  );
}
