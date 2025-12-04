import { useParams, useNavigate, useSearchParams } from "react-router";
import { formatDate } from "~/utils/formatting";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getEmployeeEditRoute, getMovementNewRoute } from "~/routes.config";
import { getEmployeeById } from "~/services/employees.service";
import { getLocationMovementsByEmployeeId } from "~/services/location-movements.service";
import { getAnimalMovementsByEmployeeId } from "~/services/animal-movements.service";
import { getCashFlowByEmployeeId } from "~/services/cash-flow.service";
import { getAccountsPayableByEmployeeId } from "~/services/accounts-payable.service";
import {
  getEmployeeObservationsByEmployeeId,
  addEmployeeObservation,
} from "~/services/employee-observations.service";
import type { EmployeeObservation } from "~/types/employee-observation";
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
    { title: "Detalhes do Funcionário - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do funcionário",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function EmployeeDetails() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language: _language } = useLanguage();
  const { canEdit, canRemove: _canRemove, isMainUser } = usePermissions();
  const [_searchParams, _setSearchParams] = useSearchParams();
  const employee = getEmployeeById(employeeId);

  const [activeTab, setActiveTab] = useEntityTab<
    "info" | "activities" | "movements" | "observations" | "finance"
  >({
    validTabs: ["info", "activities", "movements", "observations", "finance"],
    defaultTab: "info",
    isMainUser,
  });

  const observationManagement = useObservationManagement<EmployeeObservation>({
    entityId: employee?.id || "",
    fetchObservations: getEmployeeObservationsByEmployeeId,
    addObservation: (data) => addEmployeeObservation({ employeeId: employee!.id, ...data }),
    translationKeys: {
      observationRequired: t.employees.details.observationRequired,
      observationAdded: t.employees.details.observationAdded,
      observationError: t.employees.details.observationError,
    },
    generateFileIdPrefix: () => "file-emp-obs",
  });

  const entityDetailsConfig = useEntityDetailsConfig({
    entityType: "employee",
    entity: employee
      ? {
          code: employee.code,
          name: employee.name,
          cpf: employee.cpf,
          email: employee.email,
          phone: employee.phone,
          propertyIds: employee.propertyIds,
          createdAt: employee.createdAt,
        }
      : {
          code: "",
          name: "",
          createdAt: new Date().toISOString(),
        },
  });

  if (!employee) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.employees.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.EMPLOYEES)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EntityDetailHeader
        title={employee.name}
        subtitle={employee.code}
        status={{
          label:
            employee.status === "active" ? t.employees.table.active : t.employees.table.inactive,
          variant: employee.status === "active" ? "success" : "default",
        }}
        actions={
          <>
            {canEdit("registration", "employee") && (
              <Button
                variant="outline"
                onClick={() => navigate(getEmployeeEditRoute(employee.id))}
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
              onClick={() => navigate(ROUTES.EMPLOYEES)}
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
            label: t.employees.details.tabs.info,
            onClick: () => setActiveTab("info"),
          },
          {
            id: "movements",
            label: t.properties.details.movements.title,
            onClick: () => setActiveTab("movements"),
          },
          {
            id: "observations",
            label: t.employees.details.tabs.observations,
            onClick: () => setActiveTab("observations"),
          },
          {
            id: "finance",
            label: t.employees.details.tabs.finance,
            onClick: () => setActiveTab("finance"),
          },
          ...(isMainUser()
            ? [
                {
                  id: "activities",
                  label: t.employees.details.tabs.activities,
                  onClick: () => setActiveTab("activities"),
                },
              ]
            : []),
        ]}
      />

      {activeTab === "info" && employee && entityDetailsConfig && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EntityInfoSection
              title={entityDetailsConfig.infoSectionTitle}
              color="blue"
              fields={entityDetailsConfig.infoFields}
            />

            <AddressSection
              street={employee.street}
              number={employee.number}
              complement={employee.complement}
              neighborhood={employee.neighborhood}
              city={employee.city}
              state={employee.state}
              zipCode={employee.zipCode}
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
              title: t.employees.details.activityCreated,
              description: formatDate(employee.createdAt),
            },
            {
              icon: "✅",
              title:
                employee.status === "active"
                  ? t.employees.details.activityActivated
                  : t.employees.details.activityDeactivated,
              description: `${t.employees.details.statusLabel}: ${
                employee.status === "active" ? t.employees.table.active : t.employees.table.inactive
              }`,
            },
          ]}
        />
      )}

      {activeTab === "movements" && employee && (
        <EntityMovementsTab
          entityType="employee"
          entityId={employee.id}
          entityPropertyIds={employee.propertyIds}
          locationMovements={getLocationMovementsByEmployeeId(employee.id)}
          animalMovements={getAnimalMovementsByEmployeeId(employee.id)}
          getMovementNewRouteParam={(propertyId) =>
            `${getMovementNewRoute(propertyId)}?employeeId=${employee.id}`
          }
        />
      )}

      {activeTab === "observations" && employee && (
        <ObservationSection<EmployeeObservation>
          observations={observationManagement.observations}
          title={t.employees.details.tabs.observations}
          description={
            t.employees.details.observationsDescription ||
            "Gerencie as observações deste funcionário"
          }
          searchPlaceholder={t.employees.details.searchObservations}
          emptyStateTitle={t.employees.details.noObservations}
          emptyStateDescription={
            t.employees.details.noObservationsDescription ||
            "Adicione sua primeira observação sobre este funcionário."
          }
          emptyStateDescriptionWithSearch={
            typeof t.employees.details.noObservationsWithSearch === "function"
              ? t.employees.details.noObservationsWithSearch
              : t.employees.details.noObservationsWithSearch ||
                ((searchValue: string) => `Nenhuma observação encontrada para "${searchValue}"`)
          }
          translationKeys={{
            observationDate: t.employees.details.observationDate,
            observation: t.employees.details.observation,
            files: t.employees.details.files,
            addObservation: t.employees.details.addObservation,
            newObservation: t.employees.details.newObservation,
            observationPlaceholder: t.employees.details.observationPlaceholder,
            filesHelper: t.employees.details.filesHelper,
            cancel: t.common.cancel,
            save: t.common.save,
            observationRequired: t.employees.details.observationRequired,
            observationAdded: t.employees.details.observationAdded,
            observationError: t.employees.details.observationError,
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
          entityId={employee.id}
          entityType="Employee"
        />
      )}

      {activeTab === "finance" && employee && (
        <EntityFinanceTab
          entityType="employee"
          entityId={employee.id}
          getCashFlowTransactions={getCashFlowByEmployeeId}
          getPayableTransactions={getAccountsPayableByEmployeeId}
          showSubTabs={false}
        />
      )}
    </div>
  );
}
