import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { formatDate } from "~/utils/formatting";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { useAlert } from "~/hooks/use-alert";
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
import { useEntityDetailsConfig, type EntityType } from "~/hooks/use-entity-details-config";
import { useEntityTab } from "~/hooks/use-entity-tab";
import { useObservationManagement, type Observation } from "~/hooks/use-observation-management";
import type {
  LocationMovement,
  AnimalMovement,
  CashFlow,
  AccountsPayable,
  AccountsReceivable,
} from "~/types";

export interface EntityDetailPageProps<TEntity, TObservation extends Observation> {
  /** Entity ID from route params */
  readonly entityId: string | undefined;
  /** Function to fetch entity by ID */
  readonly fetchEntity: (id: string) => Promise<TEntity>;
  /** Entity type for configuration */
  readonly entityType: EntityType;
  /** Entity data mapper to extract common fields */
  readonly mapEntityToData: (entity: TEntity) => {
    id: string;
    code: string;
    name: string;
    cpf?: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    propertyIds: string[];
    createdAt: string;
    status: "active" | "inactive";
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  /** Translation namespace (e.g., t.buyers, t.employees) */
  readonly translations: {
    errors: { loadFailed: string };
    emptyState: { title: string };
    table: { active: string; inactive: string };
    details: {
      tabs: {
        info: string;
        observations: string;
        finance: string;
        activities?: string;
        movements?: string;
        inventory?: string;
      };
      activityCreated: string;
      activityActivated: string;
      activityDeactivated: string;
      statusLabel: string;
      observationsDescription?: string;
      searchObservations: string;
      noObservations: string;
      noObservationsDescription?: string;
      noObservationsWithSearch?: string | ((searchValue: string) => string);
      observationDate: string;
      observation: string;
      files: string;
      addObservation: string;
      newObservation: string;
      observationPlaceholder: string;
      filesHelper: string;
      observationRequired: string;
      observationAdded: string;
      observationError: string;
    };
  };
  /** Route configuration */
  readonly routes: {
    list: string;
    edit: (id: string) => string;
  };
  /** Permission resource name */
  readonly permissionResource: "buyer" | "employee" | "serviceProvider" | "supplier";
  /** Observation management configuration */
  readonly observationConfig: {
    fetchObservations: (id: string) => TObservation[] | Promise<TObservation[]>;
    addObservation: (data: { [key: string]: unknown }) => TObservation | Promise<TObservation>;
    translationKeys: {
      observationRequired: string;
      observationAdded: string;
      observationError: string;
    };
    fileIdPrefix: string;
  };
  /** Finance tab configuration */
  readonly financeConfig?: {
    getCashFlowTransactions: (id: string) => CashFlow[] | Promise<CashFlow[]>;
    getPayableTransactions?: (id: string) => AccountsPayable[] | Promise<AccountsPayable[]>;
    getReceivableTransactions?: (
      id: string
    ) => AccountsReceivable[] | Promise<AccountsReceivable[]>;
    gradientId?: string;
    showSubTabs?: boolean;
  };
  /** Movements tab configuration */
  readonly movementsConfig?: {
    getLocationMovements: (id: string) => LocationMovement[];
    getAnimalMovements: (id: string) => AnimalMovement[];
    getMovementNewRouteParam: (propertyId: string, entityId: string) => string;
    entityType: "employee" | "serviceProvider";
  };
  /** Custom tabs configuration */
  readonly customTabs?: Array<{
    id: string;
    label: string;
    onClick: () => void;
  }>;
  /** Custom tab content renderer */
  readonly renderCustomTab?: (tabId: string, entity: TEntity) => React.ReactNode;
  /** Valid tabs for this entity */
  readonly validTabs: readonly string[];
}

export function EntityDetailPage<TEntity, TObservation extends Observation>({
  entityId,
  fetchEntity,
  entityType,
  mapEntityToData,
  translations,
  routes,
  permissionResource,
  observationConfig,
  financeConfig,
  movementsConfig,
  customTabs = [],
  renderCustomTab,
  validTabs,
}: EntityDetailPageProps<TEntity, TObservation>) {
  const navigate = useNavigate();
  const t = useTranslation();
  const { language: _language } = useLanguage();
  const { canEdit, isMainUser } = usePermissions();
  const { showAlert } = useAlert();
  const [, setSearchParams] = useSearchParams();
  const [entity, setEntity] = useState<TEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntity = async () => {
      if (!entityId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchEntity(entityId);
        setEntity(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : translations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load entity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntity();
  }, [entityId, fetchEntity, showAlert, translations.errors.loadFailed]);

  const [activeTab, setActiveTab] = useEntityTab({
    validTabs,
    defaultTab: "info",
    isMainUser,
  });

  const entityData = entity ? mapEntityToData(entity) : null;

  const entityDetailsConfig = useEntityDetailsConfig({
    entityType,
    entity: entityData
      ? {
          code: entityData.code,
          name: entityData.name,
          cpf: entityData.cpf,
          cnpj: entityData.cnpj,
          email: entityData.email,
          phone: entityData.phone,
          propertyIds: entityData.propertyIds,
          createdAt: entityData.createdAt,
        }
      : {
          code: "",
          name: "",
          createdAt: new Date().toISOString(),
        },
  });

  const observationManagement = useObservationManagement<TObservation>({
    entityId: entityData?.id || "",
    fetchObservations: observationConfig.fetchObservations,
    addObservation: (data) => {
      const entityIdKey = `${permissionResource}Id` as keyof typeof data;
      return observationConfig.addObservation({
        [entityIdKey]: entityData?.id || "",
        ...data,
      });
    },
    translationKeys: observationConfig.translationKeys,
    generateFileIdPrefix: () => observationConfig.fileIdPrefix,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!entity || !entityData) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{translations.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(routes.list)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "info",
      label: translations.details.tabs.info,
      onClick: () => setActiveTab("info"),
    },
    {
      id: "observations",
      label: translations.details.tabs.observations,
      onClick: () => setActiveTab("observations"),
    },
    ...(financeConfig
      ? [
          {
            id: "finance",
            label: translations.details.tabs.finance,
            onClick: () => {
              setActiveTab("finance");
              setSearchParams({ tab: "finance", subTab: "dashboard" });
            },
          },
        ]
      : []),
    ...(movementsConfig
      ? [
          {
            id: "movements",
            label: translations.details.tabs.movements || t.properties.details.movements.title,
            onClick: () => setActiveTab("movements"),
          },
        ]
      : []),
    ...(Array.isArray(customTabs) ? customTabs : []),
    ...(isMainUser() && translations.details?.tabs?.activities
      ? [
          {
            id: "activities",
            label: translations.details.tabs.activities,
            onClick: () => setActiveTab("activities"),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <EntityDetailHeader
        title={entityData.name}
        subtitle={entityData.code}
        status={{
          label:
            entityData.status === "active"
              ? translations.table.active
              : translations.table.inactive,
          variant: entityData.status === "active" ? "success" : "default",
        }}
        actions={
          <>
            {canEdit("registration", permissionResource) && (
              <Button
                variant="outline"
                onClick={() => navigate(routes.edit(entityData.id))}
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
              onClick={() => navigate(routes.list)}
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
              {t.common.back}
            </Button>
          </>
        }
      />

      <EntityTabs activeTab={activeTab} tabs={tabs} />

      {activeTab === "info" && entityData && entityDetailsConfig && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EntityInfoSection
              title={entityDetailsConfig.infoSectionTitle}
              color="blue"
              fields={entityDetailsConfig.infoFields}
            />

            <AddressSection
              street={entityData.street}
              number={entityData.number}
              complement={entityData.complement}
              neighborhood={entityData.neighborhood}
              city={entityData.city}
              state={entityData.state}
              zipCode={entityData.zipCode}
              translationKeys={entityDetailsConfig.addressTranslationKeys}
            />
          </div>
        </div>
      )}

      {activeTab === "activities" && isMainUser() && entityData && (
        <ActivitiesSection
          title={t.dashboard.recentActivities.title}
          activities={[
            {
              icon: "📝",
              title: translations.details.activityCreated,
              description: formatDate(entityData.createdAt),
            },
            {
              icon: "✅",
              title:
                entityData.status === "active"
                  ? translations.details.activityActivated
                  : translations.details.activityDeactivated,
              description: `${translations.details.statusLabel}: ${
                entityData.status === "active"
                  ? translations.table.active
                  : translations.table.inactive
              }`,
            },
          ]}
        />
      )}

      {activeTab === "movements" && movementsConfig && entityData && (
        <EntityMovementsTab
          entityType={movementsConfig.entityType}
          entityId={entityData.id}
          entityPropertyIds={entityData.propertyIds}
          locationMovements={movementsConfig.getLocationMovements(entityData.id)}
          animalMovements={movementsConfig.getAnimalMovements(entityData.id)}
          getMovementNewRouteParam={(propertyId) =>
            movementsConfig.getMovementNewRouteParam(propertyId, entityData.id)
          }
        />
      )}

      {activeTab === "observations" && entityData && (
        <ObservationSection<TObservation>
          observations={observationManagement.observations}
          title={translations.details.tabs.observations}
          description={
            translations.details.observationsDescription ||
            `Gerencie as observações deste ${permissionResource}`
          }
          searchPlaceholder={translations.details.searchObservations}
          emptyStateTitle={translations.details.noObservations}
          emptyStateDescription={
            translations.details.noObservationsDescription ||
            `Adicione sua primeira observação sobre este ${permissionResource}.`
          }
          emptyStateDescriptionWithSearch={
            typeof translations.details.noObservationsWithSearch === "function"
              ? translations.details.noObservationsWithSearch
              : translations.details.noObservationsWithSearch ||
                ((searchValue: string) => `Nenhuma observação encontrada para "${searchValue}"`)
          }
          translationKeys={{
            observationDate: translations.details.observationDate,
            observation: translations.details.observation,
            files: translations.details.files,
            addObservation: translations.details.addObservation,
            newObservation: translations.details.newObservation,
            observationPlaceholder: translations.details.observationPlaceholder,
            filesHelper: translations.details.filesHelper,
            cancel: t.common.cancel,
            save: t.common.save,
            observationRequired: translations.details.observationRequired,
            observationAdded: translations.details.observationAdded,
            observationError: translations.details.observationError,
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
          entityId={entityData.id}
          entityType={permissionResource.charAt(0).toUpperCase() + permissionResource.slice(1)}
        />
      )}

      {activeTab === "finance" && financeConfig && entityData && (
        <EntityFinanceTab
          entityType={permissionResource}
          entityId={entityData.id}
          getCashFlowTransactions={financeConfig.getCashFlowTransactions}
          getPayableTransactions={financeConfig.getPayableTransactions}
          getReceivableTransactions={financeConfig.getReceivableTransactions}
          gradientId={financeConfig.gradientId}
          showSubTabs={financeConfig.showSubTabs}
        />
      )}

      {renderCustomTab?.(activeTab, entity)}
    </div>
  );
}
