import { useMemo } from "react";
import { useNavigate } from "react-router";
import { TableActionButtons, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getServiceProviders, deleteServiceProvider } from "~/services/service-providers.service";
import { useAlert } from "~/hooks/use-alert";
import type { ServiceProvider } from "~/types";
import { ROUTES, getServiceProviderEditRoute, getServiceProviderViewRoute } from "~/routes.config";
import { getLocationMovementsByServiceProviderId } from "~/services/location-movements.service";
import { getServiceProviderObservationsByServiceProviderId } from "~/services/service-provider-observations.service";
import { usePermissions } from "~/utils/permissions";
import { RegistrationListPage } from "~/components/dashboard/registrations/registration-list-page";
import {
  createNameCodeColumn,
  createStatusColumn,
  createTextColumn,
  createLastObservationColumn,
  createPropertiesColumn,
  createLastMovementColumn,
} from "~/components/dashboard/registrations/table-columns";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";
import { useRegistrationList } from "~/hooks/use-registration-list";

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
  const { showAlert } = useAlert();

  const {
    entities: serviceProviders,
    isLoading,
    setEntities: setServiceProviders,
    getPropertyById,
  } = useRegistrationList<ServiceProvider>({
    fetchEntities: getServiceProviders,
    loadErrorMessage: t.serviceProviders.errors.loadFailed,
  });

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
      createPropertiesColumn<ServiceProvider>(t.serviceProviders.table.properties, getPropertyById),
      createLastMovementColumn<ServiceProvider>(
        t.serviceProviders.table.lastMovement || "Última Movimentação",
        getLocationMovementsByServiceProviderId,
        t,
        language
      ),
      createLastObservationColumn<ServiceProvider>(
        t.serviceProviders.table.lastObservation || "Última Observação",
        getServiceProviderObservationsByServiceProviderId,
        language
      ),
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
    [t, language, navigate, canEdit, canRemove, getPropertyById]
  );

  const filterOptions = useMemo(
    () => [
      { label: t.serviceProviders.filters.all, value: "all" as const },
      { label: t.serviceProviders.filters.active, value: "active" as const },
      { label: t.serviceProviders.filters.inactive, value: "inactive" as const },
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
      deleteService={async (serviceProvider) => {
        try {
          await deleteServiceProvider(serviceProvider.id);
          setServiceProviders(serviceProviders.filter((sp) => sp.id !== serviceProvider.id));
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t.serviceProviders.errors.deleteFailed;
          showAlert(errorMessage, "error");
          return false;
        }
      }}
      isLoading={isLoading}
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
