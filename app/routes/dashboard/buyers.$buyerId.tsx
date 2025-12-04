import { useParams, useNavigate, useSearchParams } from "react-router";
import { formatDate } from "~/utils/formatting";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getBuyerEditRoute } from "~/routes.config";
import { getBuyerById } from "~/services/buyers.service";
import { getCashFlowByBuyerId } from "~/services/cash-flow.service";
import { getAccountsReceivableByBuyerId } from "~/services/accounts-receivable.service";
import {
  getBuyerObservationsByBuyerId,
  addBuyerObservation,
} from "~/services/buyer-observations.service";
import type { BuyerObservation } from "~/types/buyer-observation";
import { useObservationManagement } from "~/hooks/use-observation-management";
import { ObservationSection } from "~/components/dashboard/observations/observation-section";
import { EntityFinanceTab } from "~/components/dashboard/finance/entity-finance-tab";
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
    { title: "Detalhes do Comprador - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do comprador",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function BuyerDetails() {
  const { buyerId } = useParams<{ buyerId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language: _language } = useLanguage();
  const { canEdit, isMainUser } = usePermissions();
  const [_searchParams, setSearchParams] = useSearchParams();
  const buyer = getBuyerById(buyerId);

  const [activeTab, setActiveTab] = useEntityTab<
    "info" | "activities" | "observations" | "finance"
  >({
    validTabs: ["info", "activities", "observations", "finance"],
    defaultTab: "info",
    isMainUser,
  });

  const entityDetailsConfig = useEntityDetailsConfig({
    entityType: "buyer",
    entity: buyer
      ? {
          code: buyer.code,
          name: buyer.name,
          cpf: buyer.cpf,
          cnpj: buyer.cnpj,
          email: buyer.email,
          phone: buyer.phone,
          propertyIds: buyer.propertyIds,
          createdAt: buyer.createdAt,
        }
      : {
          code: "",
          name: "",
          createdAt: new Date().toISOString(),
        },
  });

  const observationManagement = useObservationManagement<BuyerObservation>({
    entityId: buyer?.id || "",
    fetchObservations: getBuyerObservationsByBuyerId,
    addObservation: (data) => addBuyerObservation({ buyerId: buyer!.id, ...data }),
    translationKeys: {
      observationRequired: t.buyers.details.observationRequired,
      observationAdded: t.buyers.details.observationAdded,
      observationError: t.buyers.details.observationError,
    },
    generateFileIdPrefix: () => "file-buy-obs",
  });

  if (!buyer) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.buyers.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.BUYERS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EntityDetailHeader
        title={buyer.name}
        subtitle={buyer.code}
        status={{
          label: buyer.status === "active" ? t.buyers.table.active : t.buyers.table.inactive,
          variant: buyer.status === "active" ? "success" : "default",
        }}
        actions={
          <>
            {canEdit("registration", "buyer") && (
              <Button
                variant="outline"
                onClick={() => navigate(getBuyerEditRoute(buyer.id))}
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
              onClick={() => navigate(ROUTES.BUYERS)}
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
            label: t.buyers.details.tabs.info,
            onClick: () => setActiveTab("info"),
          },
          {
            id: "observations",
            label: t.buyers.details.tabs.observations,
            onClick: () => setActiveTab("observations"),
          },
          {
            id: "finance",
            label: t.buyers.details.tabs.finance,
            onClick: () => {
              setActiveTab("finance");
              setSearchParams({ tab: "finance", subTab: "dashboard" });
            },
          },
          ...(isMainUser()
            ? [
                {
                  id: "activities",
                  label: t.buyers.details.tabs.activities,
                  onClick: () => setActiveTab("activities"),
                },
              ]
            : []),
        ]}
      />

      {activeTab === "info" && buyer && entityDetailsConfig && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EntityInfoSection
              title={entityDetailsConfig.infoSectionTitle}
              color="blue"
              fields={entityDetailsConfig.infoFields}
            />

            <AddressSection
              street={buyer.street}
              number={buyer.number}
              complement={buyer.complement}
              neighborhood={buyer.neighborhood}
              city={buyer.city}
              state={buyer.state}
              zipCode={buyer.zipCode}
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
              title: t.buyers.details.activityCreated,
              description: formatDate(buyer.createdAt),
            },
            {
              icon: "✅",
              title:
                buyer.status === "active"
                  ? t.buyers.details.activityActivated
                  : t.buyers.details.activityDeactivated,
              description: `${t.buyers.details.statusLabel}: ${
                buyer.status === "active" ? t.buyers.table.active : t.buyers.table.inactive
              }`,
            },
          ]}
        />
      )}

      {activeTab === "observations" && buyer && (
        <ObservationSection<BuyerObservation>
          observations={observationManagement.observations}
          title={t.buyers.details.tabs.observations}
          description={
            t.buyers.details.observationsDescription || "Gerencie as observações deste comprador"
          }
          searchPlaceholder={t.buyers.details.searchObservations}
          emptyStateTitle={t.buyers.details.noObservations}
          emptyStateDescription={
            t.buyers.details.noObservationsDescription ||
            "Adicione sua primeira observação sobre este comprador."
          }
          emptyStateDescriptionWithSearch={
            typeof t.buyers.details.noObservationsWithSearch === "function"
              ? t.buyers.details.noObservationsWithSearch
              : t.buyers.details.noObservationsWithSearch ||
                ((searchValue: string) => `Nenhuma observação encontrada para "${searchValue}"`)
          }
          translationKeys={{
            observationDate: t.buyers.details.observationDate,
            observation: t.buyers.details.observation,
            files: t.buyers.details.files,
            addObservation: t.buyers.details.addObservation,
            newObservation: t.buyers.details.newObservation,
            observationPlaceholder: t.buyers.details.observationPlaceholder,
            filesHelper: t.buyers.details.filesHelper,
            cancel: t.common.cancel,
            save: t.common.save,
            observationRequired: t.buyers.details.observationRequired,
            observationAdded: t.buyers.details.observationAdded,
            observationError: t.buyers.details.observationError,
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
          entityId={buyer.id}
          entityType="Buyer"
        />
      )}

      {activeTab === "finance" && buyer && (
        <EntityFinanceTab
          entityType="buyer"
          entityId={buyer.id}
          getCashFlowTransactions={getCashFlowByBuyerId}
          getReceivableTransactions={getAccountsReceivableByBuyerId}
          gradientId="colorNetBuyer"
        />
      )}
    </div>
  );
}
