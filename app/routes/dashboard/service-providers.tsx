import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockServiceProviders } from "~/mocks/service-providers";
import { deleteServiceProvider } from "~/services/service-providers.service";
import type { ServiceProvider } from "~/types";
import { getPropertyById } from "~/services/properties.service";
import { ROUTES, getServiceProviderEditRoute, getServiceProviderViewRoute } from "~/routes.config";
import { getLocationMovementsByServiceProviderId } from "~/services/location-movements.service";
import { getServiceProviderObservationsByServiceProviderId } from "~/services/service-provider-observations.service";
import { usePermissions } from "~/utils/permissions";
import { RegistrationListPage } from "~/components/dashboard/registrations/registration-list-page";
import {
  createNameCodeColumn,
  createStatusColumn,
  createTextColumn,
} from "~/components/dashboard/registrations/table-columns";
import { formatDate } from "~/utils/formatting";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";

export function meta() {
  return createRegistrationMeta(
    "Prestadores de Serviço",
    "Gerenciamento de prestadores de serviço do Boi na Nuvem"
  );
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function ServiceProviders() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canEdit, canRemove } = usePermissions();
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([
    ...mockServiceProviders,
  ]);

  const columns: TableColumn<ServiceProvider>[] = useMemo(
    () => [
      createNameCodeColumn<ServiceProvider>(t.serviceProviders.table.name, true),
      createTextColumn<ServiceProvider>(
        "document",
        t.serviceProviders.table.document || "Documento",
        (row) => row.cpf || row.cnpj || null,
        false
      ),
      createTextColumn<ServiceProvider>(
        "email",
        t.serviceProviders.table.email,
        (row) => row.email || null,
        true
      ),
      createTextColumn<ServiceProvider>(
        "phone",
        t.serviceProviders.table.phone,
        (row) => row.phone || null,
        true
      ),
      {
        key: "properties",
        label: t.serviceProviders.table.properties,
        sortable: false,
        render: (_, row) => {
          const properties = row.propertyIds
            .map((id) => getPropertyById(id))
            .filter((p) => p !== undefined)
            .map((p) => p!.name);
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {properties.length > 0 ? properties.join(", ") : "-"}
            </span>
          );
        },
      },
      {
        key: "lastMovement",
        label: t.serviceProviders.table.lastMovement || "Última Movimentação",
        sortable: false,
        render: (_, row) => {
          const movements = getLocationMovementsByServiceProviderId(row.id);
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
        label: t.serviceProviders.table.lastObservation || "Última Observação",
        sortable: false,
        render: (_, row) => {
          const observations = getServiceProviderObservationsByServiceProviderId(row.id);
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
      createStatusColumn<ServiceProvider>(
        t.serviceProviders.table.status,
        t.serviceProviders.table.active,
        t.serviceProviders.table.inactive,
        true
      ),
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => navigate(getServiceProviderEditRoute(row.id))}
            onDelete={() => {}}
            canEdit={canEdit("registration", "serviceProvider")}
            canDelete={canRemove("registration", "serviceProvider")}
          />
        ),
      },
    ],
    [t, language, navigate, canEdit, canRemove]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.serviceProviders.filters.all, value: "all" },
      { label: t.serviceProviders.filters.active, value: "active" },
      { label: t.serviceProviders.filters.inactive, value: "inactive" },
    ],
    [t]
  );

  return (
    <RegistrationListPage<ServiceProvider>
      data={serviceProviders}
      columns={columns}
      title={t.serviceProviders.title}
      description={t.serviceProviders.description}
      badgeLabel={(count) => t.serviceProviders.badge.serviceProviders(count)}
      searchPlaceholder={t.serviceProviders.searchPlaceholder}
      emptyStateTitle={t.serviceProviders.emptyState.title}
      emptyStateDescription={(searchValue) =>
        t.serviceProviders.emptyState.descriptionWithSearch(searchValue)
      }
      emptyStateDescriptionWithoutSearch={t.serviceProviders.emptyState.descriptionWithoutSearch}
      addButtonLabel={t.serviceProviders.addServiceProvider}
      newRoute={ROUTES.SERVICE_PROVIDERS_NEW}
      viewRoute={getServiceProviderViewRoute}
      deleteService={(serviceProvider) => {
        const success = deleteServiceProvider(serviceProvider.id);
        if (success) {
          setServiceProviders(serviceProviders.filter((sp) => sp.id !== serviceProvider.id));
        }
        return success;
      }}
      deleteSuccessMessage={t.serviceProviders.success.deleted}
      deleteErrorMessage={t.serviceProviders.errors.deleteFailed}
      deleteModalTitle={t.serviceProviders.deleteModal.title}
      deleteModalMessage={(name) => t.serviceProviders.deleteModal.message(name)}
      deleteModalConfirm={t.serviceProviders.deleteModal.confirm}
      deleteModalCancel={t.serviceProviders.deleteModal.cancel}
      onDeleteSuccess={(serviceProvider) => {
        setServiceProviders(serviceProviders.filter((sp) => sp.id !== serviceProvider.id));
      }}
      permissionSection="registration"
      permissionResource="serviceProvider"
      language={language}
      initialSortColumn="name"
      searchFields={["name", "code", "email", "phone", "cpf", "cnpj"]}
      filterOptions={filterOptions}
    />
  );
}
