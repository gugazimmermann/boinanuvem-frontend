import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getProperties, deleteProperty } from "~/services/properties.service";
import { useAlert } from "~/hooks/use-alert";
import type { Property, Location, Animal } from "~/types";
import { getLocations } from "~/services/locations.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
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
  const { showAlert } = useAlert();
  const [properties, setProperties] = useState<Property[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [propertiesData, locationsData] = await Promise.all([
          getProperties(),
          getLocations(),
        ]);
        setProperties(propertiesData);
        setLocations(locationsData);

        // Load animals for all properties' companies
        if (propertiesData.length > 0) {
          const companyIds = new Set(propertiesData.map((p) => p.companyId));
          const animalsPromises = Array.from(companyIds).map((companyId) =>
            getAnimalsByCompanyId(companyId)
          );
          const animalsArrays = await Promise.all(animalsPromises);
          setAnimals(animalsArrays.flat());
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t.properties.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showAlert, t]);

  const animalsByPropertyId = useMemo(() => {
    const map = new Map<string, Animal[]>();
    for (const animal of animals) {
      if (animal.propertyId) {
        const existing = map.get(animal.propertyId) || [];
        map.set(animal.propertyId, [...existing, animal]);
      }
    }
    return map;
  }, [animals]);

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
          const propertyLocations = locations.filter((loc) => loc.propertyId === row.id);
          return (
            <span className="text-gray-700 dark:text-gray-300">{propertyLocations.length}</span>
          );
        },
      },
      {
        key: "animals",
        label: t.properties.table.animals,
        sortable: true,
        render: (_, row) => {
          const propertyAnimals = animalsByPropertyId.get(row.id) || [];
          return <span className="text-gray-700 dark:text-gray-300">{propertyAnimals.length}</span>;
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
    [t, language, navigate, canEdit, canRemove, locations, animalsByPropertyId]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.properties.filters.all, value: "all" as const },
      { label: t.properties.filters.active, value: "active" as const },
      { label: t.properties.filters.inactive, value: "inactive" as const },
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
      deleteService={async (property) => {
        try {
          await deleteProperty(property.id);
          setProperties(properties.filter((p) => p.id !== property.id));
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t.properties.errors.deleteFailed;
          showAlert(errorMessage, "error");
          return false;
        }
      }}
      isLoading={isLoading}
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
