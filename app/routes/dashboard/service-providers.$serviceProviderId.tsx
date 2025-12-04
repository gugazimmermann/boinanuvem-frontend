import { useParams, useNavigate, useSearchParams } from "react-router";
import { formatDate } from "~/utils/formatting";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getServiceProviderEditRoute, getMovementNewRoute } from "~/routes.config";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getLocationMovementsByServiceProviderId } from "~/services/location-movements.service";
import { getAnimalMovementsByServiceProviderId } from "~/services/animal-movements.service";
import { getCashFlowByServiceProviderId } from "~/services/cash-flow.service";
import { getAccountsPayableByServiceProviderId } from "~/services/accounts-payable.service";
import {
  getServiceProviderObservationsByServiceProviderId,
  addServiceProviderObservation,
} from "~/services/service-provider-observations.service";
import type { ServiceProviderObservation } from "~/types/service-provider-observation";
import { useObservationManagement } from "~/hooks/use-observation-management";
import { ObservationSection } from "~/components/dashboard/observations/observation-section";
import { EntityFinanceTab } from "~/components/dashboard/finance/entity-finance-tab";
import { EntityMovementsTab } from "~/components/dashboard/movements/entity-movements-tab";
import {
  EntityDetailHeader,
  EntityInfoSection,
  AddressSection,
  ActivitiesSection,
} from "~/components/dashboard/entity-details";
import { EntityTabs } from "~/components/dashboard/tabs/entity-tabs";
import { useEntityDetailsConfig } from "~/hooks/use-entity-details-config";
import { useEntityTab } from "~/hooks/use-entity-tab";

export function meta() {
  return [
    { title: "Detalhes do Prestador de Serviço - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do prestador de serviço",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function ServiceProviderDetails() {
  const { serviceProviderId } = useParams<{ serviceProviderId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language: _language } = useLanguage();
  const { canEdit, canRemove: _canRemove, isMainUser } = usePermissions();
  const [_searchParams, setSearchParams] = useSearchParams();
  const serviceProvider = getServiceProviderById(serviceProviderId);

  const [activeTab, setActiveTab] = useEntityTab<
    "info" | "activities" | "movements" | "observations" | "finance"
  >({
    validTabs: ["info", "activities", "movements", "observations", "finance"],
    defaultTab: "info",
    isMainUser,
  });

  const entityDetailsConfig = useEntityDetailsConfig({
    entityType: "serviceProvider",
    entity: serviceProvider
      ? {
          code: serviceProvider.code,
          name: serviceProvider.name,
          cpf: serviceProvider.cpf,
          cnpj: serviceProvider.cnpj,
          email: serviceProvider.email,
          phone: serviceProvider.phone,
          propertyIds: serviceProvider.propertyIds,
          createdAt: serviceProvider.createdAt,
        }
      : {
          code: "",
          name: "",
          createdAt: new Date().toISOString(),
        },
  });

  const observationManagement = useObservationManagement<ServiceProviderObservation>({
    entityId: serviceProvider?.id || "",
    fetchObservations: getServiceProviderObservationsByServiceProviderId,
    addObservation: (data) =>
      addServiceProviderObservation({ serviceProviderId: serviceProvider!.id, ...data }),
    translationKeys: {
      observationRequired: t.serviceProviders.details.observationRequired,
      observationAdded: t.serviceProviders.details.observationAdded,
      observationError: t.serviceProviders.details.observationError,
    },
    generateFileIdPrefix: () => "file-svc-obs",
  });

  if (!serviceProvider) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.serviceProviders.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SERVICE_PROVIDERS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EntityDetailHeader
        title={serviceProvider.name}
        subtitle={serviceProvider.code}
        status={{
          label:
            serviceProvider.status === "active"
              ? t.serviceProviders.table.active
              : t.serviceProviders.table.inactive,
          variant: serviceProvider.status === "active" ? "success" : "default",
        }}
        actions={
          <>
            {canEdit("registration", "serviceProvider") && (
              <Button
                variant="outline"
                onClick={() => navigate(getServiceProviderEditRoute(serviceProvider.id))}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
              >
                {t.profile.company.edit}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.SERVICE_PROVIDERS)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              }
            >
              {t.team.new.back}
            </Button>
          </>
        }
      />

      <EntityTabs
        activeTab={activeTab}
        tabs={[
          {
            id: "info",
            label: t.serviceProviders.details.tabs.info,
            onClick: () => setActiveTab("info"),
          },
          {
            id: "movements",
            label: t.properties.details.movements.title,
            onClick: () => setActiveTab("movements"),
          },
          {
            id: "observations",
            label: t.serviceProviders.details.tabs.observations,
            onClick: () => setActiveTab("observations"),
          },
          {
            id: "finance",
            label: t.serviceProviders.details.tabs.finance,
            onClick: () => {
              setActiveTab("finance");
              setSearchParams({ tab: "finance", subTab: "dashboard" });
            },
          },
          ...(isMainUser()
            ? [
                {
                  id: "activities",
                  label: t.serviceProviders.details.tabs.activities,
                  onClick: () => setActiveTab("activities"),
                },
              ]
            : []),
        ]}
      />

      {activeTab === "info" && serviceProvider && entityDetailsConfig && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EntityInfoSection
              title={entityDetailsConfig.infoSectionTitle}
              color="blue"
              fields={entityDetailsConfig.infoFields}
            />

            <AddressSection
              street={serviceProvider.street}
              number={serviceProvider.number}
              complement={serviceProvider.complement}
              neighborhood={serviceProvider.neighborhood}
              city={serviceProvider.city}
              state={serviceProvider.state}
              zipCode={serviceProvider.zipCode}
              translationKeys={entityDetailsConfig.addressTranslationKeys}
            />
          </div>
        </div>
      )}

      {activeTab === "activities" && isMainUser() && (
        <ActivitiesSection
          title={t.dashboard.recentActivities.title}
          activities={[
            {
              icon: "📝",
              title: t.serviceProviders.details.activityCreated,
              description: formatDate(serviceProvider.createdAt),
            },
            {
              icon: "✅",
              title:
                serviceProvider.status === "active"
                  ? t.serviceProviders.details.activityActivated
                  : t.serviceProviders.details.activityDeactivated,
              description: `${t.serviceProviders.details.statusLabel}: ${
                serviceProvider.status === "active"
                  ? t.serviceProviders.table.active
                  : t.serviceProviders.table.inactive
              }`,
            },
          ]}
        />
      )}

      {activeTab === "movements" && serviceProvider && (
        <EntityMovementsTab
          entityType="serviceProvider"
          entityId={serviceProvider.id}
          entityPropertyIds={serviceProvider.propertyIds}
          locationMovements={getLocationMovementsByServiceProviderId(serviceProvider.id)}
          animalMovements={getAnimalMovementsByServiceProviderId(serviceProvider.id)}
          getMovementNewRouteParam={(propertyId) =>
            `${getMovementNewRoute(propertyId)}?serviceProviderId=${serviceProvider.id}`
          }
        />
      )}

      {activeTab === "observations" && serviceProvider && (
        <ObservationSection<ServiceProviderObservation>
          observations={observationManagement.observations}
          title={t.serviceProviders.details.tabs.observations}
          description={
            t.serviceProviders.details.observationsDescription ||
            "Gerencie as observações deste prestador de serviço"
          }
          searchPlaceholder={t.serviceProviders.details.searchObservations}
          emptyStateTitle={t.serviceProviders.details.noObservations}
          emptyStateDescription={
            t.serviceProviders.details.noObservationsDescription ||
            "Adicione sua primeira observação sobre este prestador de serviço."
          }
          emptyStateDescriptionWithSearch={
            typeof t.serviceProviders.details.noObservationsWithSearch === "function"
              ? t.serviceProviders.details.noObservationsWithSearch
              : t.serviceProviders.details.noObservationsWithSearch ||
                ((searchValue: string) => `Nenhuma observação encontrada para "${searchValue}"`)
          }
          translationKeys={{
            observationDate: t.serviceProviders.details.observationDate,
            observation: t.serviceProviders.details.observation,
            files: t.serviceProviders.details.files,
            addObservation: t.serviceProviders.details.addObservation,
            newObservation: t.serviceProviders.details.newObservation,
            observationPlaceholder: t.serviceProviders.details.observationPlaceholder,
            filesHelper: t.serviceProviders.details.filesHelper,
            cancel: t.common.cancel,
            save: t.common.save,
            observationRequired: t.serviceProviders.details.observationRequired,
            observationAdded: t.serviceProviders.details.observationAdded,
            observationError: t.serviceProviders.details.observationError,
            clearSearch: t.common.clearSearch,
          }}
          onAddObservation={(e: React.FormEvent) => observationManagement.handleSubmit(e)}
          showForm={observationManagement.showForm}
          onShowFormChange={observationManagement.setShowForm}
          observationText={observationManagement.observationText}
          onObservationTextChange={observationManagement.setObservationText}
          observationFiles={observationManagement.observationFiles}
          onObservationFilesChange={observationManagement.setObservationFiles}
          isSubmitting={observationManagement.isSubmitting}
          alert={observationManagement.alert}
          entityId={serviceProvider.id}
          entityType="ServiceProvider"
        />
      )}

      {activeTab === "finance" && serviceProvider && (
        <EntityFinanceTab
          entityType="serviceProvider"
          entityId={serviceProvider.id}
          getCashFlowTransactions={getCashFlowByServiceProviderId}
          getPayableTransactions={getAccountsPayableByServiceProviderId}
          gradientId="colorNetServiceProvider"
        />
      )}
    </div>
  );
}
