import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Button,
  StatusBadge,
  Table,
  TableActionButtons,
  ConfirmationModal,
  Select,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
  FileUpload,
  Alert,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  ROUTES,
  getEmployeeEditRoute,
  getPropertyViewRoute,
  getMovementViewRoute,
  getMovementNewRoute,
  getObservationViewRoute,
} from "~/routes.config";
import { getEmployeeById } from "~/services/employees.service";
import { getPropertyById } from "~/services/properties.service";
import { getLocationMovementsByEmployeeId } from "~/services/location-movements.service";
import { getAnimalMovementsByEmployeeId } from "~/services/animal-movements.service";
import { getLocationById } from "~/services/locations.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getAnimalById } from "~/services/animals.service";
import { getCashFlowByEmployeeId, deleteCashFlow } from "~/services/cash-flow.service";
import {
  getAccountsPayableByEmployeeId,
  deleteAccountsPayable,
} from "~/services/accounts-payable.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import {
  getCashFlowViewRoute,
  getCashFlowEditRoute,
  getAccountsPayableViewRoute,
  getAccountsPayableEditRoute,
} from "~/routes.config";
import type { LocationMovement, AnimalMovement, CashFlow, AccountsPayable } from "~/types";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import {
  getEmployeeObservationsByEmployeeId,
  addEmployeeObservation,
} from "~/services/employee-observations.service";
import type { EmployeeObservation } from "~/types/employee-observation";

export function meta() {
  return [
    { title: "Detalhes do Funcionário - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do funcionário",
    },
  ];
}

export default function EmployeeDetails() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const employee = getEmployeeById(employeeId);

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<
    "info" | "activities" | "movements" | "observations" | "finance"
  >(
    (tabParam === "activities" ||
    tabParam === "movements" ||
    tabParam === "observations" ||
    tabParam === "finance"
      ? tabParam
      : "info") as "info" | "activities" | "movements" | "observations" | "finance"
  );

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchValue, setSearchValue] = useState("");

  const [financeSearchValue, setFinanceSearchValue] = useState("");
  const [financeActiveFilter, setFinanceActiveFilter] = useState<string>("all");
  const [financeSelectedYear, setFinanceSelectedYear] = useState<string>("all");
  const [financeSelectedMonth, setFinanceSelectedMonth] = useState<string>("all");
  const [financeCurrentPage, setFinanceCurrentPage] = useState(1);
  const [financeSortState, setFinanceSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [isDeleteFinanceModalOpen, setIsDeleteFinanceModalOpen] = useState(false);
  const [selectedFinanceTransaction, setSelectedFinanceTransaction] = useState<
    CashFlow | AccountsPayable | null
  >(null);
  const [selectedFinanceTransactionType, setSelectedFinanceTransactionType] = useState<
    "cashFlow" | "payable" | null
  >(null);
  const financeItemsPerPage = 10;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "activities" ||
      tab === "movements" ||
      tab === "observations" ||
      tab === "finance"
    ) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("info");
    }
  }, [searchParams]);

  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [observations, setObservations] = useState<EmployeeObservation[]>([]);

  useEffect(() => {
    if (employee) {
      setObservations(getEmployeeObservationsByEmployeeId(employee.id));
    }
  }, [employee]);

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.employees.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.EMPLOYEES)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!observationText.trim()) {
      setObservationAlert({
        title: t.employees.details.observationRequired,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-emp-obs-${Date.now()}-${index}`);

      addEmployeeObservation({
        employeeId: employee.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getEmployeeObservationsByEmployeeId(employee.id));

      setObservationAlert({
        title: t.employees.details.observationAdded,
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.employees.details.observationError,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{employee.name}</h1>
            <StatusBadge
              label={
                employee.status === "active" ? t.employees.table.active : t.employees.table.inactive
              }
              variant={employee.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.employees.table.code}: {employee.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => {
              setActiveTab("info");
              setSearchParams({ tab: "info" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "info"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "info"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.employees.details.tabs.info}
          </button>
          <button
            onClick={() => {
              setActiveTab("movements");
              setSearchParams({ tab: "movements" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "movements"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "movements"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.movements.title}
          </button>
          <button
            onClick={() => {
              setActiveTab("observations");
              setSearchParams({ tab: "observations" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "observations"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "observations"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.employees.details.tabs.observations || "Observações"}
          </button>
          <button
            onClick={() => {
              setActiveTab("finance");
              setSearchParams({ tab: "finance" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "finance"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "finance"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.employees.details.tabs.finance}
          </button>
          <button
            onClick={() => {
              setActiveTab("activities");
              setSearchParams({ tab: "activities" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "activities"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "activities"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.employees.details.tabs.activities}
          </button>
        </nav>
      </div>

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.employees.details.employeeInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.employees.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{employee.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.employees.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{employee.name}</p>
                </div>
                {employee.cpf && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.employees.table.cpf}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{employee.cpf}</p>
                  </div>
                )}
                {employee.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.employees.table.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {employee.email}
                    </p>
                  </div>
                )}
                {employee.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.employees.table.phone}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {employee.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.employees.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {employee.propertyIds && employee.propertyIds.length > 0 ? (
                      employee.propertyIds.map((propertyId: string) => {
                        const property = getPropertyById(propertyId);
                        return property ? (
                          <span
                            key={propertyId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(getPropertyViewRoute(propertyId))}
                          >
                            {property.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.employees.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(employee.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {(employee.street || employee.city) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {t.employees.details.address}
                </h2>
                <div className="space-y-4">
                  {employee.street && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.street}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.street}
                        {employee.number ? `, ${employee.number}` : ""}
                      </p>
                    </div>
                  )}
                  {employee.complement && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.complement}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.complement}
                      </p>
                    </div>
                  )}
                  {employee.neighborhood && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.neighborhood}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.neighborhood}
                      </p>
                    </div>
                  )}
                  {(employee.city || employee.state) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.employees.details.cityState}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.city || ""}
                        {employee.city && employee.state ? ", " : ""}
                        {employee.state || ""}
                      </p>
                    </div>
                  )}
                  {employee.zipCode && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.zipCode}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activities" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.recentActivities.title}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div
                className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
              >
                <span className="text-sm">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {t.employees.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(employee.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {employee.status === "active"
                    ? t.employees.details.activityActivated
                    : t.employees.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.employees.details.statusLabel}:{" "}
                  {employee.status === "active"
                    ? t.employees.table.active
                    : t.employees.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "movements" &&
        employee &&
        (() => {
          const locationMovements = getLocationMovementsByEmployeeId(employee.id);
          const animalMovements = getAnimalMovementsByEmployeeId(employee.id);

          type UnifiedMovement =
            | (LocationMovement & { movementType: "location" } & Record<string, unknown>)
            | (AnimalMovement & { movementType: "animal" } & Record<string, unknown>);

          const movements: UnifiedMovement[] = [
            ...locationMovements.map((m) => ({ ...m, movementType: "location" as const })),
            ...animalMovements.map((m) => ({ ...m, movementType: "animal" as const })),
          ];

          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(date);
          };

          const filteredMovements = movements.filter((movement) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            if (movement.movementType === "location") {
              const typeText =
                t.properties.details.movements.types[
                  (movement as LocationMovement)
                    .type as keyof typeof t.properties.details.movements.types
                ] || (movement as LocationMovement).type;
              if (typeText.toLowerCase().includes(searchLower)) return true;
            } else {
              const animalMovementText =
                t.properties.details.movements.types.animal_movement.toLowerCase();
              if (
                animalMovementText.includes(searchLower) ||
                "animal".toLowerCase().includes(searchLower)
              )
                return true;
            }

            const dateText = formatDate(movement.date);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            const locationIds =
              movement.movementType === "location"
                ? (movement as LocationMovement).locationIds
                : [(movement as AnimalMovement).locationId];
            const locationNames = locationIds
              .map((id) => {
                const location = getLocationById(id);
                return location
                  ? `${location.name} ${location.code}`.toLowerCase()
                  : id.toLowerCase();
              })
              .join(" ");
            if (locationNames.includes(searchLower)) return true;

            if (movement.movementType === "animal") {
              const animalNames = (movement as AnimalMovement).animalIds
                .map((id) => {
                  const animal = getAnimalById(id);
                  return animal ? `${animal.code} ${animal.registrationNumber}`.toLowerCase() : "";
                })
                .filter((name) => name !== "")
                .join(" ");
              if (animalNames.includes(searchLower)) return true;
            }

            const employeeNames = movement.employeeIds
              .map((id) => {
                const emp = getEmployeeById(id);
                return emp ? emp.name.toLowerCase() : "";
              })
              .filter((name) => name !== "")
              .join(" ");
            if (employeeNames.includes(searchLower)) return true;

            const providerNames = movement.serviceProviderIds
              .map((id) => {
                const provider = getServiceProviderById(id);
                return provider ? provider.name.toLowerCase() : "";
              })
              .filter((name) => name !== "")
              .join(" ");
            if (providerNames.includes(searchLower)) return true;

            return false;
          });

          const sortedMovements = [...filteredMovements].sort((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (sortState.column === "date") {
              aValue = new Date(a.date).getTime();
              bValue = new Date(b.date).getTime();
            } else if (sortState.column === "locations") {
              const aLocationIds =
                a.movementType === "location"
                  ? (a as LocationMovement).locationIds
                  : [(a as AnimalMovement).locationId];
              const bLocationIds =
                b.movementType === "location"
                  ? (b as LocationMovement).locationIds
                  : [(b as AnimalMovement).locationId];
              const aLocationNames = aLocationIds
                .map((id) => {
                  const location = getLocationById(id);
                  return location ? `${location.name} (${location.code})` : id;
                })
                .sort()
                .join(", ");
              const bLocationNames = bLocationIds
                .map((id) => {
                  const location = getLocationById(id);
                  return location ? `${location.name} (${location.code})` : id;
                })
                .sort()
                .join(", ");
              aValue = aLocationNames;
              bValue = bLocationNames;
            } else if (sortState.column === "type") {
              if (a.movementType === "location") {
                aValue = (a as LocationMovement).type;
              } else {
                aValue = "animal";
              }
              if (b.movementType === "location") {
                bValue = (b as LocationMovement).type;
              } else {
                bValue = "animal";
              }
            } else {
              if (a.movementType === "location") {
                aValue = (a as LocationMovement)[sortState.column as keyof LocationMovement] as
                  | string
                  | number
                  | undefined;
              } else {
                aValue = (a as AnimalMovement)[sortState.column as keyof AnimalMovement] as
                  | string
                  | number
                  | undefined;
              }
              if (b.movementType === "location") {
                bValue = (b as LocationMovement)[sortState.column as keyof LocationMovement] as
                  | string
                  | number
                  | undefined;
              } else {
                bValue = (b as AnimalMovement)[sortState.column as keyof AnimalMovement] as
                  | string
                  | number
                  | undefined;
              }
            }

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, "pt-BR", {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
          const paginatedMovements = sortedMovements.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );

          const columns: TableColumn<UnifiedMovement>[] = [
            {
              key: "date",
              label: t.properties.details.movements.table.date,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
              ),
            },
            {
              key: "type",
              label: t.properties.details.movements.table.type,
              sortable: true,
              render: (_, row) => {
                if (row.movementType === "location") {
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {t.properties.details.movements.types[
                        (row as LocationMovement)
                          .type as keyof typeof t.properties.details.movements.types
                      ] || (row as LocationMovement).type}
                    </span>
                  );
                } else {
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {t.properties.details.movements.types.animal_movement}
                    </span>
                  );
                }
              },
            },
            {
              key: "locations",
              label: t.properties.details.movements.table.locations,
              sortable: true,
              render: (_, row) => {
                const locationIds =
                  row.movementType === "location"
                    ? (row as LocationMovement).locationIds
                    : [(row as AnimalMovement).locationId];
                const locationNames = locationIds
                  .map((id) => {
                    const location = getLocationById(id);
                    return location ? `${location.name} (${location.code})` : id;
                  })
                  .join(", ");
                return (
                  <span className="text-gray-700 dark:text-gray-300">{locationNames || "-"}</span>
                );
              },
            },
            {
              key: "animals",
              label: "Animais",
              sortable: false,
              render: (_, row) => {
                if (row.movementType === "animal") {
                  const count = (row as AnimalMovement).animalIds.length;
                  return <span className="text-gray-700 dark:text-gray-300">{count}</span>;
                }
                return <span className="text-gray-400 dark:text-gray-500">-</span>;
              },
            },
            {
              key: "responsible",
              label: t.properties.details.movements.table.responsible,
              sortable: false,
              render: (_, row) => {
                const employeeNames = row.employeeIds
                  .map((id) => {
                    const emp = getEmployeeById(id);
                    return emp ? emp.name : null;
                  })
                  .filter((name): name is string => name !== null);

                const providerNames = row.serviceProviderIds
                  .map((id) => {
                    const provider = getServiceProviderById(id);
                    return provider ? provider.name : null;
                  })
                  .filter((name): name is string => name !== null);

                const allResponsibles = [...employeeNames, ...providerNames];
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {allResponsibles.length > 0 ? allResponsibles.join(", ") : "-"}
                  </span>
                );
              },
            },
            {
              key: "observation",
              label: t.properties.details.movements.observation || "Observação",
              sortable: false,
              render: (_, row) => {
                const observation =
                  row.movementType === "location"
                    ? (row as LocationMovement).observation
                    : (row as AnimalMovement).observation;
                if (!observation) {
                  return <span className="text-gray-400 dark:text-gray-500">-</span>;
                }
                const truncated =
                  observation.length > 50 ? `${observation.substring(0, 50)}...` : observation;
                return (
                  <span className="text-gray-700 dark:text-gray-300" title={observation}>
                    {truncated}
                  </span>
                );
              },
            },
            {
              key: "files",
              label: t.properties.details.movements.files || "Anexos",
              sortable: false,
              render: (_, row) => {
                const fileIds =
                  row.movementType === "location"
                    ? (row as LocationMovement).fileIds
                    : (row as AnimalMovement).fileIds;
                if (!fileIds || fileIds.length === 0) {
                  return <span className="text-gray-400 dark:text-gray-500">-</span>;
                }
                return (
                  <div className="flex items-center space-x-1">
                    <svg
                      className="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {fileIds.length}
                    </span>
                  </div>
                );
              },
            },
          ];

          const firstPropertyId =
            employee.propertyIds && employee.propertyIds.length > 0
              ? employee.propertyIds[0]
              : null;
          const headerActions: TableAction[] = firstPropertyId
            ? [
                {
                  label: t.properties.details.movements.add,
                  variant: "primary",
                  leftIcon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  onClick: () =>
                    navigate(`${getMovementNewRoute(firstPropertyId)}?employeeId=${employee.id}`),
                },
              ]
            : [];

          return (
            <div className="space-y-6">
              <Table<UnifiedMovement>
                columns={columns}
                data={paginatedMovements}
                header={{
                  title: t.properties.details.movements.title,
                  badge: {
                    label: `${filteredMovements.length} ${filteredMovements.length !== 1 ? t.properties.details.movements.movements : t.properties.details.movements.movement}`,
                    variant: "primary",
                  },
                  description: t.properties.details.movements.description,
                  actions: headerActions,
                }}
                search={{
                  placeholder: t.properties.details.movements.searchPlaceholder,
                  value: searchValue,
                  onChange: (value) => {
                    setSearchValue(value);
                    setCurrentPage(1);
                  },
                }}
                pagination={{
                  currentPage,
                  totalPages: totalPages || 1,
                  onPageChange: (page) => {
                    setCurrentPage(page);
                  },
                  showInfo: false,
                }}
                sortState={sortState}
                onSort={(column, direction) => {
                  setSortState({ column, direction });
                  setCurrentPage(1);
                }}
                emptyState={{
                  title: t.properties.details.movements.emptyState.title,
                  description: searchValue
                    ? t.properties.details.movements.emptyState.descriptionWithSearch?.(
                        searchValue
                      ) || t.properties.details.movements.emptyState.description
                    : t.properties.details.movements.emptyState.description,
                  onClearSearch: searchValue
                    ? () => {
                        setSearchValue("");
                        setCurrentPage(1);
                      }
                    : undefined,
                  clearSearchLabel: searchValue ? t.common.clearSearch : undefined,
                }}
                onRowClick={(row) =>
                  navigate(`${getMovementViewRoute(row.id)}?fromEmployee=${employee.id}`)
                }
              />
            </div>
          );
        })()}

      {activeTab === "observations" &&
        employee &&
        (() => {
          const filteredObservations = observations.filter((observation) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            if (observation.observation.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDateTime(observation.createdAt);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            return false;
          });

          const sortedObservations = [...filteredObservations].sort((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (sortState.column === "date") {
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
            } else if (sortState.column === "observation") {
              aValue = a.observation;
              bValue = b.observation;
            } else {
              aValue = a[sortState.column as keyof EmployeeObservation] as
                | string
                | number
                | undefined;
              bValue = b[sortState.column as keyof EmployeeObservation] as
                | string
                | number
                | undefined;
            }

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, "pt-BR", {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
          const paginatedObservations = sortedObservations.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );

          const columns: TableColumn<EmployeeObservation>[] = [
            {
              key: "date",
              label: t.employees.details.observationDate || "Data",
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateTime(row.createdAt)}
                </span>
              ),
            },
            {
              key: "observation",
              label: t.employees.details.observation || "Observação",
              sortable: true,
              render: (_, row) => {
                const truncated =
                  row.observation.length > 100
                    ? `${row.observation.substring(0, 100)}...`
                    : row.observation;
                return (
                  <span className="text-gray-700 dark:text-gray-300" title={row.observation}>
                    {truncated}
                  </span>
                );
              },
            },
            {
              key: "files",
              label: t.employees.details.files || "Anexos",
              sortable: false,
              render: (_, row) => {
                if (!row.fileIds || row.fileIds.length === 0) {
                  return <span className="text-gray-400 dark:text-gray-500">-</span>;
                }
                return (
                  <div className="flex items-center space-x-1">
                    <svg
                      className="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {row.fileIds.length}
                    </span>
                  </div>
                );
              },
            },
          ];

          const headerActions: TableAction[] = [
            {
              label: t.employees.details.addObservation || "Adicionar Observação",
              variant: "primary",
              leftIcon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              onClick: () => setShowObservationForm(true),
            },
          ];

          return (
            <div className="space-y-6">
              {observationAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
                  <Alert title={observationAlert.title} variant={observationAlert.variant} />
                </div>
              )}

              {showObservationForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                      {t.employees.details.newObservation || "Nova Observação"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowObservationForm(false);
                        setObservationText("");
                        setObservationFiles([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmitObservation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.employees.details.observation || "Observação"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        disabled={isSubmittingObservation}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                        placeholder={
                          t.employees.details.observationPlaceholder ||
                          "Digite sua observação sobre este funcionário..."
                        }
                        required
                      />
                    </div>

                    <FileUpload
                      label={t.employees.details.files || "Anexos"}
                      files={observationFiles}
                      onChange={setObservationFiles}
                      disabled={isSubmittingObservation}
                      multiple={true}
                      helperText={
                        t.employees.details.filesHelper ||
                        "Você pode fazer upload de múltiplos arquivos"
                      }
                    />

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowObservationForm(false);
                          setObservationText("");
                          setObservationFiles([]);
                        }}
                        disabled={isSubmittingObservation}
                      >
                        {t.common.cancel}
                      </Button>
                      <Button type="submit" disabled={isSubmittingObservation}>
                        {t.common.save}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {!showObservationForm && (
                <Table<EmployeeObservation & Record<string, unknown>>
                  columns={columns}
                  data={paginatedObservations as (EmployeeObservation & Record<string, unknown>)[]}
                  header={{
                    title: t.employees.details.tabs.observations || "Observações",
                    badge: {
                      label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? t.employees.details.tabs.observations : t.employees.details.observation}`,
                      variant: "primary",
                    },
                    description:
                      t.employees.details.observationsDescription ||
                      "Gerencie as observações deste funcionário",
                    actions: headerActions,
                  }}
                  search={{
                    placeholder: t.employees.details.searchObservations || "Buscar observações...",
                    value: searchValue,
                    onChange: (value) => {
                      setSearchValue(value);
                      setCurrentPage(1);
                    },
                  }}
                  pagination={{
                    currentPage,
                    totalPages: totalPages || 1,
                    onPageChange: (page) => {
                      setCurrentPage(page);
                    },
                    showInfo: false,
                  }}
                  sortState={sortState}
                  onSort={(column, direction) => {
                    setSortState({ column, direction });
                    setCurrentPage(1);
                  }}
                  emptyState={{
                    title: t.employees.details.noObservations || "Nenhuma observação registrada",
                    description: searchValue
                      ? typeof t.employees.details.noObservationsWithSearch === "function"
                        ? t.employees.details.noObservationsWithSearch(searchValue)
                        : t.employees.details.noObservationsWithSearch ||
                          `Nenhuma observação encontrada para "${searchValue}"`
                      : t.employees.details.noObservationsDescription ||
                        "Adicione sua primeira observação sobre este funcionário.",
                    onClearSearch: searchValue
                      ? () => {
                          setSearchValue("");
                          setCurrentPage(1);
                        }
                      : undefined,
                    clearSearchLabel: searchValue ? t.common.clearSearch : undefined,
                    onAddNew: () => setShowObservationForm(true),
                    addNewLabel: t.employees.details.addObservation || "Adicionar Observação",
                  }}
                  onRowClick={(row) =>
                    navigate(`${getObservationViewRoute(row.id)}?fromEmployee=${employee.id}`)
                  }
                />
              )}
            </div>
          );
        })()}

      {activeTab === "finance" &&
        employee &&
        (() => {
          type UnifiedTransaction = {
            id: string;
            type: "income" | "expense";
            amount: number;
            date: string;
            description: string;
            category?: string;
            paymentMethod?: string;
            referenceNumber?: string;
            status: string;
            transactionType: "cashFlow" | "payable";
            propertyId?: string;
            supplierId?: string;
            buyerId?: string;
            employeeId?: string;
            serviceProviderId?: string;
            [key: string]: unknown;
          };

          const normalizeCashFlow = (cf: CashFlow): UnifiedTransaction => ({
            id: cf.id,
            type: cf.type,
            amount: cf.amount,
            date: cf.date,
            description: cf.description,
            category: cf.category,
            paymentMethod: cf.paymentMethod,
            referenceNumber: cf.referenceNumber,
            status: cf.status,
            transactionType: "cashFlow",
            propertyId: cf.propertyId,
            supplierId: cf.supplierId,
            buyerId: cf.buyerId,
            serviceProviderId: cf.serviceProviderId,
          });

          const normalizePayable = (ap: AccountsPayable): UnifiedTransaction => ({
            id: ap.id,
            type: "expense",
            amount: ap.amount,
            date: ap.dueDate,
            description: ap.description,
            category: ap.category,
            paymentMethod: ap.paymentMethod,
            referenceNumber: ap.referenceNumber,
            status: ap.status,
            transactionType: "payable",
            propertyId: ap.propertyId,
            supplierId: ap.supplierId,
            serviceProviderId: ap.serviceProviderId,
          });

          const cashFlowTransactions = getCashFlowByEmployeeId(employee.id);
          const payableTransactions = getAccountsPayableByEmployeeId(employee.id);

          const allTransactions: UnifiedTransaction[] = [
            ...cashFlowTransactions.map(normalizeCashFlow),
            ...payableTransactions.map(normalizePayable),
          ];

          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return format(date, "dd/MM/yyyy", { locale: ptBR });
          };

          const formatCurrency = (value: number) => {
            return new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value);
          };

          const handleDeleteFinanceClick = (transaction: UnifiedTransaction) => {
            let originalTransaction: CashFlow | AccountsPayable | null = null;
            let transactionType: "cashFlow" | "payable" | null = null;

            if (transaction.transactionType === "cashFlow") {
              const found = cashFlowTransactions.find((t) => t.id === transaction.id);
              if (found) {
                originalTransaction = found;
                transactionType = "cashFlow";
              }
            } else if (transaction.transactionType === "payable") {
              const found = payableTransactions.find((t) => t.id === transaction.id);
              if (found) {
                originalTransaction = found;
                transactionType = "payable";
              }
            }

            if (originalTransaction && transactionType) {
              setSelectedFinanceTransaction(originalTransaction);
              setSelectedFinanceTransactionType(transactionType);
              setIsDeleteFinanceModalOpen(true);
            }
          };

          const handleDeleteFinanceTransaction = async () => {
            if (!selectedFinanceTransaction || !selectedFinanceTransactionType) return;

            let success = false;
            if (selectedFinanceTransactionType === "cashFlow") {
              success = deleteCashFlow(selectedFinanceTransaction.id);
            } else if (selectedFinanceTransactionType === "payable") {
              success = deleteAccountsPayable(selectedFinanceTransaction.id);
            }

            if (success) {
              setObservationAlert({
                title: t.cashFlow.success.deleted,
                variant: "success",
              });
              setTimeout(() => setObservationAlert(null), 3000);
            } else {
              setObservationAlert({
                title: t.cashFlow.errors.deleteFailed,
                variant: "error",
              });
              setTimeout(() => setObservationAlert(null), 3000);
            }
            setSelectedFinanceTransaction(null);
            setSelectedFinanceTransactionType(null);
          };

          const filteredFinanceData = allTransactions.filter((transaction) => {
            let matchesSearch: boolean;
            if (!financeSearchValue) {
              matchesSearch = true;
            } else {
              const searchLower = financeSearchValue.toLowerCase();
              const property = transaction.propertyId
                ? getPropertyById(transaction.propertyId)
                : null;
              const propertyName = property?.name?.toLowerCase() || "";
              const category = transaction.category
                ? (t.cashFlow.categories as Record<string, string>)[
                    transaction.category
                  ]?.toLowerCase() || ""
                : "";
              const paymentMethod = transaction.paymentMethod
                ? (t.cashFlow.paymentMethods as Record<string, string>)[
                    transaction.paymentMethod
                  ]?.toLowerCase() || ""
                : "";
              const amount = formatCurrency(transaction.amount).toLowerCase();

              let supplierName = "";
              if (transaction.supplierId) {
                const supplier = getSupplierById(transaction.supplierId);
                supplierName = supplier?.name?.toLowerCase() || "";
              }

              let buyerName = "";
              if (transaction.buyerId) {
                const buyer = getBuyerById(transaction.buyerId);
                buyerName = buyer?.name?.toLowerCase() || "";
              }

              let serviceProviderName = "";
              if (transaction.serviceProviderId) {
                const serviceProvider = getServiceProviderById(transaction.serviceProviderId);
                serviceProviderName = serviceProvider?.name?.toLowerCase() || "";
              }

              matchesSearch =
                transaction.description.toLowerCase().includes(searchLower) ||
                transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
                propertyName.includes(searchLower) ||
                category.includes(searchLower) ||
                paymentMethod.includes(searchLower) ||
                amount.includes(searchLower) ||
                supplierName.includes(searchLower) ||
                buyerName.includes(searchLower) ||
                serviceProviderName.includes(searchLower);
            }

            const matchesFilter =
              financeActiveFilter === "all" ||
              (financeActiveFilter === "income" && transaction.type === "income") ||
              (financeActiveFilter === "expense" && transaction.type === "expense");

            const matchesYear =
              financeSelectedYear === "all" || transaction.date.startsWith(financeSelectedYear);
            const monthStr =
              financeSelectedMonth === "all" ? null : financeSelectedMonth.padStart(2, "0");
            const matchesMonth =
              financeSelectedMonth === "all" ||
              (monthStr && transaction.date.substring(5, 7) === monthStr);

            return matchesSearch && matchesFilter && matchesYear && matchesMonth;
          });

          const sortedFinanceData = [...filteredFinanceData].sort((a, b) => {
            if (!financeSortState.column || !financeSortState.direction) {
              return 0;
            }

            const aValue = a[financeSortState.column];
            const bValue = b[financeSortState.column];

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, "pt-BR", {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return financeSortState.direction === "asc" ? comparison : -comparison;
          });

          const paginatedFinanceData = sortedFinanceData.slice(
            (financeCurrentPage - 1) * financeItemsPerPage,
            financeCurrentPage * financeItemsPerPage
          );

          const totalFinancePages = Math.ceil(filteredFinanceData.length / financeItemsPerPage);

          const totalIncome = filteredFinanceData
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
          const totalExpenses = filteredFinanceData
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
          const netTotal = totalIncome - totalExpenses;

          const getStatusVariant = (status: string, transactionType: string) => {
            if (transactionType === "cashFlow") {
              return "success";
            }
            switch (status) {
              case "paid":
                return "success";
              case "overdue":
                return "danger";
              case "partial":
                return "warning";
              default:
                return "default";
            }
          };

          const getStatusLabel = (status: string, transactionType: string) => {
            if (transactionType === "cashFlow") {
              return t.cashFlow.table.completed;
            }
            if (transactionType === "payable") {
              return (
                t.accountsPayable.status[status as keyof typeof t.accountsPayable.status] || status
              );
            }
            return status;
          };

          const financeColumns: TableColumn<UnifiedTransaction>[] = [
            {
              key: "type",
              label: t.cashFlow.table.type,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={row.type === "income" ? t.cashFlow.table.income : t.cashFlow.table.expense}
                  variant={row.type === "income" ? "success" : "default"}
                />
              ),
            },
            {
              key: "amount",
              label: t.cashFlow.table.amount,
              sortable: true,
              render: (_, row) => (
                <span
                  className={`font-medium ${
                    row.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {row.type === "income" ? "+" : "-"} {formatCurrency(row.amount)}
                </span>
              ),
            },
            {
              key: "date",
              label: t.cashFlow.table.date,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
              ),
            },
            {
              key: "property",
              label: t.cashFlow.table.property,
              sortable: true,
              render: (_, row) => {
                const property = getPropertyById(row.propertyId);
                return (
                  <span className="text-gray-700 dark:text-gray-300">{property?.name || "-"}</span>
                );
              },
            },
            {
              key: "category",
              label: t.cashFlow.table.category,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.category
                    ? (t.cashFlow.categories as Record<string, string>)[row.category] ||
                      row.category
                    : row.category}
                </span>
              ),
            },
            {
              key: "description",
              label: t.cashFlow.table.description,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{row.description}</span>
              ),
            },
            {
              key: "supplierBuyer",
              label: "",
              sortable: false,
              render: (_, row) => {
                if (row.type === "expense" && row.supplierId) {
                  const supplier = getSupplierById(row.supplierId);
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {supplier?.name || "-"}
                    </span>
                  );
                }
                if (row.type === "expense" && row.serviceProviderId) {
                  const serviceProvider = getServiceProviderById(row.serviceProviderId);
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {serviceProvider?.name || "-"}
                    </span>
                  );
                }
                if (row.type === "income" && row.buyerId) {
                  const buyer = getBuyerById(row.buyerId);
                  return (
                    <span className="text-gray-700 dark:text-gray-300">{buyer?.name || "-"}</span>
                  );
                }
                if (row.type === "income" && row.serviceProviderId) {
                  const serviceProvider = getServiceProviderById(row.serviceProviderId);
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {serviceProvider?.name || "-"}
                    </span>
                  );
                }
                return <span className="text-gray-400 dark:text-gray-500">-</span>;
              },
            },
            {
              key: "paymentMethod",
              label: t.cashFlow.table.paymentMethod,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.paymentMethod
                    ? (t.cashFlow.paymentMethods as Record<string, string>)[row.paymentMethod] ||
                      row.paymentMethod
                    : row.paymentMethod}
                </span>
              ),
            },
            {
              key: "referenceNumber",
              label: t.cashFlow.table.referenceNumber,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.referenceNumber || "-"}
                </span>
              ),
            },
            {
              key: "status",
              label: t.cashFlow.table.status,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={getStatusLabel(row.status, row.transactionType)}
                  variant={getStatusVariant(row.status, row.transactionType)}
                />
              ),
            },
            {
              key: "actions",
              label: "",
              headerClassName: "relative",
              render: (_, row) => {
                const getEditRoute = () => {
                  if (row.transactionType === "cashFlow") {
                    return getCashFlowEditRoute(row.id);
                  } else {
                    return getAccountsPayableEditRoute(row.id);
                  }
                };

                return (
                  <TableActionButtons
                    onEdit={() => navigate(getEditRoute())}
                    onDelete={() => handleDeleteFinanceClick(row)}
                  />
                );
              },
            },
          ];

          const financeFilters: TableFilter[] = [
            {
              label: t.cashFlow.filters.all,
              value: "all",
              active: financeActiveFilter === "all",
              onClick: () => {
                setFinanceActiveFilter("all");
                setFinanceCurrentPage(1);
              },
            },
            {
              label: t.cashFlow.filters.income,
              value: "income",
              active: financeActiveFilter === "income",
              onClick: () => {
                setFinanceActiveFilter("income");
                setFinanceCurrentPage(1);
              },
            },
            {
              label: t.cashFlow.filters.expense,
              value: "expense",
              active: financeActiveFilter === "expense",
              onClick: () => {
                setFinanceActiveFilter("expense");
                setFinanceCurrentPage(1);
              },
            },
          ];

          const getYearOptions = () => {
            const options: Array<{ value: string; label: string }> = [
              { value: "all", label: t.cashFlow.filters.allYears },
            ];
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();

            options.push({ value: String(currentYear - 1), label: String(currentYear - 1) });
            options.push({ value: String(currentYear), label: String(currentYear) });

            return options;
          };

          const getMonthOptions = () => {
            const localeMap: Record<string, string> = {
              pt: "pt-BR",
              en: "en-US",
              es: "es-ES",
            };
            const locale = localeMap[language] || "pt-BR";
            const options: Array<{ value: string; label: string }> = [
              { value: "all", label: t.cashFlow.filters.allMonths },
            ];

            for (let month = 1; month <= 12; month++) {
              const monthName = new Date(2000, month - 1).toLocaleDateString(locale, {
                month: "long",
              });
              options.push({ value: String(month), label: monthName });
            }

            return options;
          };

          return (
            <div className="space-y-6">
              <Table<UnifiedTransaction>
                columns={financeColumns}
                data={paginatedFinanceData}
                header={{
                  title: t.employees.details.finance.title,
                  badge: {
                    label: t.cashFlow.badge.transactions(filteredFinanceData.length),
                    variant: "primary",
                  },
                  description: t.employees.details.finance.description,
                }}
                filters={financeFilters}
                search={{
                  placeholder: t.cashFlow.searchPlaceholder,
                  value: financeSearchValue,
                  onChange: setFinanceSearchValue,
                }}
                rightContent={
                  <div className="flex items-center gap-2">
                    <div className="w-32">
                      <Select
                        value={financeSelectedYear}
                        onChange={(e) => {
                          setFinanceSelectedYear(e.target.value);
                          setFinanceCurrentPage(1);
                        }}
                        options={getYearOptions()}
                        selectClassName="text-xs sm:text-sm py-2"
                      />
                    </div>
                    <div className="w-36">
                      <Select
                        value={financeSelectedMonth}
                        onChange={(e) => {
                          setFinanceSelectedMonth(e.target.value);
                          setFinanceCurrentPage(1);
                        }}
                        options={getMonthOptions()}
                        selectClassName="text-xs sm:text-sm py-2"
                      />
                    </div>
                  </div>
                }
                middleContent={
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {t.cashFlow.filters.income}
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(totalIncome)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {t.cashFlow.filters.expense}
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(totalExpenses)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {t.common.total || "Total"}
                      </span>
                      <span
                        className={`font-semibold ${
                          netTotal >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(netTotal)}
                      </span>
                    </div>
                  </div>
                }
                pagination={{
                  currentPage: financeCurrentPage,
                  totalPages: totalFinancePages || 1,
                  onPageChange: setFinanceCurrentPage,
                  showInfo: false,
                }}
                sortState={financeSortState}
                onSort={(column, direction) => {
                  setFinanceSortState({ column, direction });
                  setFinanceCurrentPage(1);
                }}
                onRowClick={(row) => {
                  if (row.transactionType === "cashFlow") {
                    navigate(getCashFlowViewRoute(row.id));
                  } else {
                    navigate(getAccountsPayableViewRoute(row.id));
                  }
                }}
                emptyState={{
                  title: t.cashFlow.emptyState.title,
                  description: financeSearchValue
                    ? t.cashFlow.emptyState.descriptionWithSearch(financeSearchValue)
                    : t.cashFlow.emptyState.descriptionWithoutSearch,
                  onClearSearch: () => {
                    setFinanceSearchValue("");
                    setFinanceActiveFilter("all");
                    setFinanceSelectedYear("all");
                    setFinanceSelectedMonth("all");
                  },
                  clearSearchLabel: t.common.clearSearch,
                }}
              />

              <ConfirmationModal
                isOpen={isDeleteFinanceModalOpen}
                onClose={() => {
                  setIsDeleteFinanceModalOpen(false);
                  setSelectedFinanceTransaction(null);
                }}
                onConfirm={handleDeleteFinanceTransaction}
                title={t.cashFlow.deleteModal.title}
                message={t.cashFlow.deleteModal.message(
                  (selectedFinanceTransaction as CashFlow | AccountsPayable)?.description || ""
                )}
                confirmLabel={t.cashFlow.deleteModal.confirm}
                cancelLabel={t.cashFlow.deleteModal.cancel}
                variant="danger"
              />
            </div>
          );
        })()}
    </div>
  );
}
