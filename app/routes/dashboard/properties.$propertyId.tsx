import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import { format } from "date-fns";
import {
  Button,
  StatusBadge,
  Table,
  TableActionButtons,
  ConfirmationModal,
  AnimalRegistrationModal,
  Select,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
  PasturePlanningGraph,
  Tooltip as UITooltip,
} from "~/components/ui";
import { PropertyMap } from "~/components/ui/property-map";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  ROUTES,
  getPropertyEditRoute,
  getPropertyBreedingSeasonEditRoute,
  getLocationViewRoute,
  getEmployeeViewRoute,
  getServiceProviderViewRoute,
  getSupplierViewRoute,
  getBuyerViewRoute,
  getMovementViewRoute,
  getMovementNewRoute,
  getAnimalViewRoute,
  getAnimalMovementNewRoute,
  getCashFlowViewRoute,
  getCashFlowEditRoute,
  getAccountsReceivableViewRoute,
  getAccountsReceivableEditRoute,
  getAccountsPayableViewRoute,
  getAccountsPayableEditRoute,
} from "~/routes.config";
import { getPropertyById } from "~/services/properties.service";
import { getLocations } from "~/services/locations.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getBuyers } from "~/services/buyers.service";
import { getLocationMovementsByPropertyId } from "~/services/location-movements.service";
import { getAnimalMovementsByPropertyId } from "~/services/animal-movements.service";
import { getAnimalsByPropertyId, deleteAnimal } from "~/services/animals.service";
import { getBirthByAnimalId, getBirthsByCompanyId } from "~/services/births.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getExpectedBirthsForecast } from "~/services/reproductive-indexes.service";
import { getCashFlowByPropertyId } from "~/services/cash-flow.service";
import { getAccountsReceivableByPropertyId } from "~/services/accounts-receivable.service";
import { getAccountsPayableByPropertyId } from "~/services/accounts-payable.service";
import { usePermissions } from "~/utils/permissions";
import { useFinanceTransactionHandlers } from "~/hooks/use-finance-transaction-handlers";
import type { UnifiedTransaction } from "~/hooks/use-finance-transactions";
import { createMovementsTableColumns } from "~/utils/movements-table-columns";
import { sortItems } from "~/utils/sorting";
import { toSafeString } from "~/utils/table-helpers";
import { getAnimalSortValue, compareAnimalSortValues } from "~/utils/animal-sorting";
import { renderEntityName } from "~/utils/entity-name-renderer";
import type {
  Location,
  Property,
  Employee,
  ServiceProvider,
  Supplier,
  Buyer,
  LocationMovement,
  AnimalMovement,
  Animal,
  CashFlow,
  AccountsReceivable,
  AccountsPayable,
  Language,
} from "~/types";
import { AreaType } from "~/types";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";
import { ReproductiveIndexes } from "~/components/dashboard/reproductive-indexes/reproductive-indexes";
import { FinanceDashboard } from "~/components/dashboard/finance/finance-dashboard";
import { useAlert } from "~/hooks/use-alert";
import { useDateLocale } from "~/hooks/use-date-locale";
import { formatAreaType, formatNumber } from "~/utils/formatting";
import { createAnimalTableColumnsWithConfig } from "~/utils/animal-table-config";
import { createBirthsMap } from "~/utils/births-map";

export function meta() {
  return [
    { title: "Detalhes da Propriedade - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da propriedade",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

function getFinanceEditRoute(transactionType: string, id: string): string {
  if (transactionType === "cashFlow") {
    return getCashFlowEditRoute(id);
  }
  if (transactionType === "receivable") {
    return getAccountsReceivableEditRoute(id);
  }
  return getAccountsPayableEditRoute(id);
}

function getFinanceCanEditPermission(
  transactionType: string,
  canEdit: (module: string, resource: string) => boolean
): boolean {
  if (transactionType === "cashFlow") {
    return canEdit("finances", "cashFlow");
  }
  if (transactionType === "receivable") {
    return canEdit("finances", "accountsReceivable");
  }
  return canEdit("finances", "accountsPayable");
}

function getFinanceCanDeletePermission(
  transactionType: string,
  canRemove: (module: string, resource: string) => boolean
): boolean {
  if (transactionType === "cashFlow") {
    return canRemove("finances", "cashFlow");
  }
  if (transactionType === "receivable") {
    return canRemove("finances", "accountsReceivable");
  }
  return canRemove("finances", "accountsPayable");
}

interface MatchesFinanceSearchOptions {
  readonly searchLower: string;
  readonly formatCurrency: (value: number) => string;
  readonly t: {
    cashFlow: {
      categories: Record<string, string>;
      paymentMethods: Record<string, string>;
    };
  };
  readonly getPropertyName: (id: string) => string | undefined;
  readonly getSupplierName: (id: string) => string | undefined;
  readonly getBuyerName: (id: string) => string | undefined;
  readonly getEmployeeName: (id: string) => string | undefined;
  readonly getServiceProviderName: (id: string) => string | undefined;
}

function matchesFinanceSearch(
  transaction: UnifiedTransaction,
  options: MatchesFinanceSearchOptions
): boolean {
  const {
    searchLower,
    formatCurrency,
    t,
    getPropertyName,
    getSupplierName,
    getBuyerName,
    getEmployeeName,
    getServiceProviderName,
  } = options;
  const propertyName = transaction.propertyId
    ? getPropertyName(transaction.propertyId)?.toLowerCase() || ""
    : "";
  const category = transaction.category
    ? t.cashFlow.categories[transaction.category]?.toLowerCase() || ""
    : "";
  const paymentMethod = transaction.paymentMethod
    ? t.cashFlow.paymentMethods[transaction.paymentMethod]?.toLowerCase() || ""
    : "";
  const amount = formatCurrency(transaction.amount).toLowerCase();

  const supplierName = transaction.supplierId
    ? getSupplierName(transaction.supplierId)?.toLowerCase() || ""
    : "";
  const buyerName = transaction.buyerId
    ? getBuyerName(transaction.buyerId)?.toLowerCase() || ""
    : "";
  const employeeName = transaction.employeeId
    ? getEmployeeName(transaction.employeeId)?.toLowerCase() || ""
    : "";
  const serviceProviderName = transaction.serviceProviderId
    ? getServiceProviderName(transaction.serviceProviderId)?.toLowerCase() || ""
    : "";

  return (
    transaction.description.toLowerCase().includes(searchLower) ||
    transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
    propertyName.includes(searchLower) ||
    category.includes(searchLower) ||
    paymentMethod.includes(searchLower) ||
    amount.includes(searchLower) ||
    supplierName.includes(searchLower) ||
    buyerName.includes(searchLower) ||
    employeeName.includes(searchLower) ||
    serviceProviderName.includes(searchLower)
  );
}

function matchesFinanceFilters(
  transaction: UnifiedTransaction,
  financeActiveFilter: string,
  financeSelectedYear: string,
  financeSelectedMonth: string
): boolean {
  const matchesFilter =
    financeActiveFilter === "all" ||
    (financeActiveFilter === "income" && transaction.type === "income") ||
    (financeActiveFilter === "expense" && transaction.type === "expense");

  const matchesYear =
    financeSelectedYear === "all" || transaction.date.startsWith(financeSelectedYear);

  const monthStr = financeSelectedMonth === "all" ? null : financeSelectedMonth.padStart(2, "0");
  const matchesMonth =
    financeSelectedMonth === "all" ||
    (monthStr !== null && transaction.date.substring(5, 7) === monthStr);

  return Boolean(matchesFilter && matchesYear && matchesMonth);
}

type UnifiedMovement =
  | (LocationMovement & { movementType: "location" } & Record<string, unknown>)
  | (AnimalMovement & { movementType: "animal" } & Record<string, unknown>);

function matchesMovementType(
  movement: UnifiedMovement,
  searchLower: string,
  movementTypes: Record<string, string>
): boolean {
  if (movement.movementType === "location") {
    const typeText =
      movementTypes[(movement as LocationMovement).type as keyof typeof movementTypes] ||
      (movement as LocationMovement).type;
    return typeText.toLowerCase().includes(searchLower);
  }
  const animalMovementText = movementTypes.animal_movement.toLowerCase();
  return animalMovementText.includes(searchLower) || "animal".toLowerCase().includes(searchLower);
}

function matchesLocationNames(
  movement: UnifiedMovement,
  searchLower: string,
  locations: Location[]
): boolean {
  let locationIds: string[];
  if (movement.movementType === "location") {
    locationIds = (movement as LocationMovement).locationIds;
  } else {
    const animalMovement = movement as AnimalMovement;
    locationIds = animalMovement.locationId ? [animalMovement.locationId] : [];
  }
  const locationNames = locationIds
    .filter((id): id is string => id !== null && id !== undefined)
    .map((id) => {
      const location = locations.find((l) => l.id === id);
      return location ? `${location.name} ${location.code}`.toLowerCase() : id.toLowerCase();
    })
    .join(" ");
  return locationNames.includes(searchLower);
}

function matchesAnimalNames(
  movement: UnifiedMovement,
  searchLower: string,
  animalsMap: Map<string, Animal>
): boolean {
  if (movement.movementType !== "animal") return false;
  const animalNames = (movement as AnimalMovement).animalIds
    .map((id) => {
      const animal = animalsMap.get(id);
      return animal ? `${animal.code} ${animal.registrationNumber}`.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
  return animalNames.includes(searchLower);
}

function matchesEmployeeNames(
  movement: UnifiedMovement,
  searchLower: string,
  employees: Employee[]
): boolean {
  const employeeNames = movement.employeeIds
    .map((id) => {
      const employee = employees.find((e) => e.id === id);
      return employee ? employee.name.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
  return employeeNames.includes(searchLower);
}

function matchesProviderNames(
  movement: UnifiedMovement,
  searchLower: string,
  serviceProviders: ServiceProvider[]
): boolean {
  const providerNames = movement.serviceProviderIds
    .map((id) => {
      const provider = serviceProviders.find((sp) => sp.id === id);
      return provider ? provider.name.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
  return providerNames.includes(searchLower);
}

function filterMovementsBySearch(
  movements: UnifiedMovement[],
  searchValue: string,
  formatDate: (dateString: string) => string,
  movementTypes: Record<string, string>,
  searchContext: {
    animalsMap: Map<string, Animal>;
    locations: Location[];
    employees: Employee[];
    serviceProviders: ServiceProvider[];
  }
): UnifiedMovement[] {
  const { animalsMap, locations, employees, serviceProviders } = searchContext;
  if (!searchValue) return movements;

  const searchLower = searchValue.toLowerCase();

  return movements.filter((movement) => {
    if (matchesMovementType(movement, searchLower, movementTypes)) return true;

    const dateText = formatDate(movement.date);
    if (dateText.toLowerCase().includes(searchLower)) return true;

    if (matchesLocationNames(movement, searchLower, locations)) return true;
    if (matchesAnimalNames(movement, searchLower, animalsMap)) return true;
    if (matchesEmployeeNames(movement, searchLower, employees)) return true;
    if (matchesProviderNames(movement, searchLower, serviceProviders)) return true;

    return false;
  });
}

type MovementSortValue = string | number | undefined;

function getMovementSortValue(
  item: UnifiedMovement,
  column: string,
  locations: Location[]
): MovementSortValue {
  if (column === "date") {
    return new Date(item.date).getTime();
  } else if (column === "locations") {
    let locationIds: string[];
    if (item.movementType === "location") {
      locationIds = (item as LocationMovement).locationIds;
    } else {
      const animalMovement = item as AnimalMovement;
      locationIds = animalMovement.locationId ? [animalMovement.locationId] : [];
    }
    const locationNames = locationIds
      .filter((id): id is string => id !== null && id !== undefined)
      .map((id) => {
        const location = locations.find((l) => l.id === id);
        return location ? `${location.name} (${location.code})` : id;
      })
      .toSorted((a, b) => a.localeCompare(b))
      .join(", ");
    return locationNames;
  } else if (column === "type") {
    if (item.movementType === "location") {
      return (item as LocationMovement).type;
    } else {
      return "animal";
    }
  }
  if (item.movementType === "location") {
    return (item as LocationMovement)[column as keyof LocationMovement] as
      | string
      | number
      | undefined;
  }
  return (item as AnimalMovement)[column as keyof AnimalMovement] as string | number | undefined;
}

function getActiveTab(tabParam: string | null): string {
  const validTabs = [
    "info",
    "animals",
    "locations",
    "registrations",
    "activities",
    "movements",
    "finance",
    "indices-reprodutivos",
  ];
  return validTabs.includes(tabParam || "") ? tabParam! : "information";
}

function getRegistrationsSubTab(subTabParam: string | null): string {
  const validSubTabs = ["serviceProviders", "suppliers", "buyers"];
  return validSubTabs.includes(subTabParam || "") ? subTabParam! : "employees";
}

function getFinanceSubTab(subTabParam: string | null): string {
  return subTabParam === "transactions" ? "transactions" : "dashboard";
}

function convertToHectares(value: number, type: AreaType): number {
  switch (type) {
    case AreaType.HECTARES:
      return value;
    case AreaType.SQUARE_METERS:
      return value / 10000;
    case AreaType.SQUARE_FEET:
      return value / 107639;
    case AreaType.ACRES:
      return value * 0.404686;
    case AreaType.SQUARE_KILOMETERS:
      return value * 100;
    case AreaType.SQUARE_MILES:
      return value * 258.999;
    default:
      return value;
  }
}

async function calculatePropertyStats(
  propertyAnimals: Animal[],
  property: Property,
  animalsCount: number
): Promise<{
  totalWeight: number;
  animalUnits: number;
  areaInHectares: number;
  stockingRate: number;
  density: number;
  averageWeight: number;
}> {
  const calculateTotalWeight = async () => {
    let totalWeight = 0;
    for (const animal of propertyAnimals) {
      const weighings = await getWeighingsByAnimalId(animal.id);
      if (weighings.length > 0) {
        const sortedWeighings = weighings.toSorted(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastWeighing = sortedWeighings[0];
        totalWeight += lastWeighing.weight;
      }
    }
    return totalWeight;
  };

  const totalWeight = await calculateTotalWeight();
  const animalUnits = totalWeight > 0 ? totalWeight / 450 : 0;
  const areaInHectares = convertToHectares(property.area.value, property.area.type);
  const stockingRate = areaInHectares > 0 && animalUnits > 0 ? animalUnits / areaInHectares : 0;
  const density = areaInHectares > 0 && animalsCount > 0 ? animalsCount / areaInHectares : 0;
  const averageWeight = animalsCount > 0 ? totalWeight / animalsCount : 0;

  return { totalWeight, animalUnits, areaInHectares, stockingRate, density, averageWeight };
}

function calculateNextMonthExpected(expectedBirthsForecast: {
  monthly: Array<{ month: string; expectedBirths: number }>;
  total: number;
}): number {
  if (!expectedBirthsForecast.monthly || expectedBirthsForecast.monthly.length === 0) return 0;
  const today = new Date();
  const nextMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}`;
  const nextMonth = expectedBirthsForecast.monthly.find((item) => item.month === nextMonthKey);
  return nextMonth?.expectedBirths || 0;
}

import { getLocaleForDateTime } from "~/utils/locale-helpers";

function getLocaleForLanguage(lang: string): string {
  return getLocaleForDateTime(lang);
}

function createDeleteAnimalHandler(
  selectedAnimal: Animal | null,
  setSelectedAnimal: (animal: Animal | null) => void,
  setIsDeleteAnimalModalOpen: (open: boolean) => void,
  showAlert: (message: string, variant: "success" | "error") => void,
  t: ReturnType<typeof useTranslation>
) {
  return async () => {
    if (!selectedAnimal) return;
    try {
      await deleteAnimal(selectedAnimal.id);
      showAlert(t.animals.success.deleted, "success");
    } catch (error) {
      console.error("Error deleting animal:", error);
      showAlert(t.animals.errors.deleteFailed, "error");
    }
    setIsDeleteAnimalModalOpen(false);
    setSelectedAnimal(null);
  };
}

function renderPropertyTabButton(
  tab: string,
  label: string,
  activeTab: string,
  setSearchParams: (params: Record<string, string>) => void,
  params?: Record<string, string>
) {
  const isActive = activeTab === tab;
  const onClick = () => {
    if (params) {
      setSearchParams(params);
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
        ${
          isActive
            ? "dark:text-blue-400"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
        }
      `}
      style={
        isActive
          ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function renderSubTabButton(
  subTab: string,
  label: string,
  activeSubTab: string,
  setSearchParams: (params: Record<string, string>) => void,
  params: Record<string, string>
): React.JSX.Element {
  const isActive = activeSubTab === subTab;

  return (
    <button
      onClick={() => setSearchParams(params)}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
        ${
          isActive
            ? "shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        }
      `}
      style={
        isActive
          ? {
              backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
              color: DASHBOARD_COLORS.primaryDark,
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function filterAnimalsBySearchAndStatus(
  animals: Animal[],
  searchValue: string,
  activeFilter: string,
  birthsMap: Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>
): Animal[] {
  return animals.filter((animal) => {
    const birth = birthsMap.get(animal.id);
    const breedMatch = birth?.breed
      ? birth.breed.toLowerCase().includes(searchValue.toLowerCase())
      : false;
    const matchesSearch =
      animal.registrationNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      animal.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      breedMatch;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && animal.status === "active") ||
      (activeFilter === "inactive" && animal.status === "inactive");

    return matchesSearch && matchesFilter;
  });
}

// toSafeString is now imported from table-helpers

async function sortAnimals(
  animals: Animal[],
  sortState: { column: string | null; direction: SortDirection },
  localeForDateTime: string,
  birthsMap: Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>
): Promise<Animal[]> {
  if (!sortState.column || !sortState.direction) {
    return animals.toSorted((a, b) => {
      return (
        new Date(b.acquisitionDate || b.code).getTime() -
        new Date(a.acquisitionDate || a.code).getTime()
      );
    });
  }

  const animalsWithSort = await Promise.all(
    animals.map(async (animal) => {
      const sortValue = await getAnimalSortValue(
        animal,
        sortState.column!,
        localeForDateTime,
        birthsMap
      );
      return { animal, sortValue };
    })
  );

  const sortedAnimalsWithSort = [...animalsWithSort].sort((a, b) => {
    const comparison = compareAnimalSortValues(a.sortValue, b.sortValue, localeForDateTime);
    return sortState.direction === "asc" ? comparison : -comparison;
  });
  return sortedAnimalsWithSort.map(({ animal }) => animal);
}

type PropertyInformationTabProps = Readonly<{
  property: Property;
  locationsCount: number;
  animalsCount: number;
  animalUnits: number;
  stockingRate: number;
  density: number;
  averageWeight: number;
  expectedBirthsForecast: Awaited<ReturnType<typeof getExpectedBirthsForecast>> | null;
  nextMonthExpected: number;
  localeForDateTime: string;
  language: string;
  formatDate: (dateString: string) => string;
  navigate: (path: string) => void;
  t: ReturnType<typeof useTranslation>;
  employees: Employee[];
  serviceProviders: ServiceProvider[];
  suppliers: Supplier[];
  buyers: Buyer[];
}>;

function PropertyInformationTab({
  property,
  locationsCount,
  animalsCount,
  animalUnits,
  stockingRate,
  density,
  averageWeight,
  expectedBirthsForecast,
  nextMonthExpected,
  localeForDateTime,
  language,
  formatDate: _formatDate,
  navigate,
  t,
  employees,
  serviceProviders,
  suppliers,
  buyers,
}: PropertyInformationTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Informações Gerais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.properties.table.area}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {property.area.value.toLocaleString(localeForDateTime, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {formatAreaType(property.area.type)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📏</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.properties.table.locations}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {locationsCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📍</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.properties.table.animals}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatNumber(animalsCount, language as Language)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {animalsCount} {t.properties.details.activeAnimals.toLowerCase()}
                </p>
              </div>
              <div
                className="w-10 h-10 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
              >
                <span className="text-lg">🐄</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.properties.table.uas}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {animalUnits.toLocaleString(localeForDateTime, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.properties.table.stockingRate}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stockingRate.toLocaleString(localeForDateTime, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.dashboard.stats.uaPerHa}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.stats.density}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {density.toLocaleString(localeForDateTime, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.dashboard.stats.animalsPerHa}
                </p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.stats.averageWeight}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {averageWeight.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.dashboard.stats.kgPerAnimal}
                </p>
              </div>
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚖️</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.stats.expectedBirths}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {nextMonthExpected}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.dashboard.stats.nextMonth} •{" "}
                  {expectedBirthsForecast ? expectedBirthsForecast.total : 0}{" "}
                  {t.dashboard.stats.nextThreeMonths}
                </p>
                <Link
                  to={ROUTES.BIRTH_FORECAST}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                >
                  {t.dashboard.stats.viewForecast}
                </Link>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.properties.details.relatedEntities}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const propertyEmployees = employees.filter((emp) =>
              emp.propertyIds?.includes(property.id)
            );
            const propertyServiceProviders = serviceProviders.filter((sp) =>
              sp.propertyIds?.includes(property.id)
            );
            const propertySuppliers = suppliers.filter((sup) =>
              sup.propertyIds?.includes(property.id)
            );
            const propertyBuyers = buyers.filter((buy) => buy.propertyIds?.includes(property.id));

            return (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.properties.details.tabs.employees}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {propertyEmployees.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.properties.details.tabs.serviceProviders}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {propertyServiceProviders.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🏥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.properties.details.tabs.suppliers}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {propertySuppliers.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🏭</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.properties.details.tabs.buyers}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {propertyBuyers.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🛒</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {property.pasturePlanning && property.pasturePlanning.length > 0 && (
        <PasturePlanningGraph
          data={property.pasturePlanning}
          propertyId={property.id}
          isModifiedByUser={property.pasturePlanningModifiedByUser || false}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t.properties.details.pasturePlanning.breedingSeason.title}
            </h2>
            {!(property.breedingSeasonModifiedByUser || false) && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {t.properties.details.pasturePlanning.breedingSeason.aiGeneratedNote}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(getPropertyBreedingSeasonEditRoute(property.id))}
            className="ml-4"
          >
            {t.properties.edit.title.split(" ")[0]}
          </Button>
        </div>
        {property.breedingMonths && property.breedingMonths.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {(() => {
              const monthOrder = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ];
              const monthsArray = [...property.breedingMonths];
              const sortedMonths = monthsArray.toSorted(
                (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
              );
              return sortedMonths.map((month) => {
                const monthTranslation =
                  t.properties.details.pasturePlanning.breedingSeason.months[
                    month as keyof typeof t.properties.details.pasturePlanning.breedingSeason.months
                  ] || month;
                return (
                  <span
                    key={month}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-sm font-medium"
                  >
                    {monthTranslation}
                  </span>
                );
              });
            })()}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {t.properties.details.pasturePlanning.breedingSeason.noData}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PropertyDetails() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const dateLocale = useDateLocale();
  const localeForDateTime = getLocaleForLanguage(language as string);
  const { canEdit, canRemove, isMainUser } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [births, setBirths] = useState<Awaited<ReturnType<typeof getBirthsByCompanyId>>>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const { showAlert, AlertDisplay } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) {
        setIsLoadingProperty(false);
        return;
      }

      try {
        setIsLoadingProperty(true);
        const [
          propertyData,
          animalsData,
          locationsData,
          employeesData,
          serviceProvidersData,
          suppliersData,
          buyersData,
        ] = await Promise.all([
          getPropertyById(propertyId),
          getAnimalsByPropertyId(propertyId),
          getLocations(),
          getEmployees(),
          getServiceProviders(),
          getSuppliers(),
          getBuyers(),
        ]);
        setProperty(propertyData);
        setAnimals(animalsData || []);
        setLocations(locationsData);
        setEmployees(employeesData);
        setServiceProviders(serviceProvidersData);
        setSuppliers(suppliersData);
        setBuyers(buyersData);

        // Load births for the property's company
        if (propertyData?.companyId) {
          try {
            const birthsData = await getBirthsByCompanyId(propertyData.companyId);
            setBirths(birthsData || []);
          } catch (error) {
            console.error("Failed to load births:", error);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t.properties.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load data:", error);
        setTimeout(() => {
          navigate(ROUTES.PROPERTIES);
        }, 2000);
      } finally {
        setIsLoadingProperty(false);
      }
    };

    fetchData();
  }, [propertyId, navigate, showAlert, t]);

  const animalsMap = useMemo(() => new Map(animals.map((a) => [a.id, a])), [animals]);
  const birthsMap = useMemo(() => createBirthsMap(births), [births]);
  const getAnimalByIdLocal = (id: string) => {
    return animalsMap.get(id);
  };
  const suppliersMap = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);
  const buyersMap = useMemo(() => new Map(buyers.map((b) => [b.id, b])), [buyers]);
  const employeesMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);
  const serviceProvidersMap = useMemo(
    () => new Map(serviceProviders.map((sp) => [sp.id, sp])),
    [serviceProviders]
  );

  const tabParam = searchParams.get("tab");
  const subTabParam = searchParams.get("subTab");

  const activeTab = getActiveTab(tabParam);
  const registrationsSubTab = getRegistrationsSubTab(subTabParam);
  const financeSubTab = getFinanceSubTab(subTabParam);

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
  const financeItemsPerPage = 10;
  const [propertyMovements, setPropertyMovements] = useState<UnifiedMovement[]>([]);

  useEffect(() => {
    if (activeTab === "activities" && !isMainUser()) {
      setSearchParams({ tab: "information" });
    }
  }, [activeTab, isMainUser, setSearchParams]);

  const [animalsSearchValue, setAnimalsSearchValue] = useState("");
  const [animalsActiveFilter, setAnimalsActiveFilter] = useState<string>("all");
  const [animalsCurrentPage, setAnimalsCurrentPage] = useState(1);
  const [animalsSortState, setAnimalsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "code", direction: "asc" });
  const [sortedAnimals, setSortedAnimals] = useState<Animal[]>([]);
  const [isDeleteAnimalModalOpen, setIsDeleteAnimalModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadMovements = async () => {
      if (!property) {
        setPropertyMovements([]);
        return;
      }

      try {
        const [locationMovements, animalMovements] = await Promise.all([
          getLocationMovementsByPropertyId(property.id),
          getAnimalMovementsByPropertyId(property.id),
        ]);

        const movements: UnifiedMovement[] = [
          ...locationMovements.map((m) => ({ ...m, movementType: "location" as const })),
          ...animalMovements.map((m) => ({ ...m, movementType: "animal" as const })),
        ];

        setPropertyMovements(movements);
      } catch (error) {
        console.error("Failed to load property movements:", error);
        setPropertyMovements([]);
      }
    };

    void loadMovements();
  }, [property]);
  const [isAnimalRegistrationModalOpen, setIsAnimalRegistrationModalOpen] = useState(false);

  // Finance transaction handlers - must be called at component level
  const [cashFlowTransactions, setCashFlowTransactions] = useState<CashFlow[]>([]);
  const [receivableTransactions, setReceivableTransactions] = useState<AccountsReceivable[]>([]);
  const [payableTransactions, setPayableTransactions] = useState<AccountsPayable[]>([]);

  useEffect(() => {
    const loadFinanceTransactions = async () => {
      if (property?.id) {
        try {
          const [cashFlow, receivable, payable] = await Promise.all([
            getCashFlowByPropertyId(property.id),
            getAccountsReceivableByPropertyId(property.id),
            getAccountsPayableByPropertyId(property.id),
          ]);
          setCashFlowTransactions(cashFlow);
          setReceivableTransactions(receivable);
          setPayableTransactions(payable);
        } catch (error) {
          console.error("Failed to load finance transactions:", error);
        }
      }
    };
    loadFinanceTransactions();
  }, [property?.id]);

  // Sort animals asynchronously
  useEffect(() => {
    const performSort = async () => {
      if (animals.length === 0) {
        setSortedAnimals([]);
        return;
      }

      const filteredAnimals = filterAnimalsBySearchAndStatus(
        animals,
        animalsSearchValue,
        animalsActiveFilter,
        birthsMap
      );

      const sorted = await sortAnimals(
        filteredAnimals,
        animalsSortState,
        localeForDateTime,
        birthsMap
      );
      setSortedAnimals(sorted);
    };

    performSort();
  }, [
    animals,
    animalsSearchValue,
    animalsActiveFilter,
    animalsSortState,
    birthsMap,
    localeForDateTime,
  ]);

  const financeHandlers = useFinanceTransactionHandlers({
    cashFlowTransactions,
    receivableTransactions,
    payableTransactions,
    onSuccess: (message) => {
      showAlert(message, "success");
    },
    onError: (message) => {
      showAlert(message, "error");
    },
    successMessage: t.cashFlow.success.deleted,
    errorMessage: t.cashFlow.errors.deleteFailed,
  });

  const [expectedBirthsForecast, setExpectedBirthsForecast] = useState<Awaited<
    ReturnType<typeof getExpectedBirthsForecast>
  > | null>(null);

  useEffect(() => {
    const loadExpectedBirthsForecast = async () => {
      if (!property) {
        setExpectedBirthsForecast({ monthly: [], total: 0 });
        return;
      }
      try {
        const forecast = await getExpectedBirthsForecast(property.id, {
          isPropertyId: true,
          monthsAhead: 9,
        });
        setExpectedBirthsForecast(forecast);
      } catch (error) {
        console.error("Failed to load expected births forecast:", error);
        setExpectedBirthsForecast({ monthly: [], total: 0 });
      }
    };
    loadExpectedBirthsForecast();
  }, [property]);

  const nextMonthExpected = useMemo(() => {
    if (!expectedBirthsForecast) return 0;
    return calculateNextMonthExpected(expectedBirthsForecast);
  }, [expectedBirthsForecast]);

  const locationsCount = locations.length;
  const allPropertyAnimals = animals;
  const propertyAnimals = allPropertyAnimals.filter((animal) => animal.status === "active");
  const animalsCount = propertyAnimals.length;

  const [propertyStats, setPropertyStats] = useState<Awaited<
    ReturnType<typeof calculatePropertyStats>
  > | null>(null);

  useEffect(() => {
    const loadPropertyStats = async () => {
      if (!property) {
        setPropertyStats(null);
        return;
      }
      try {
        const stats = await calculatePropertyStats(propertyAnimals, property, animalsCount);
        setPropertyStats(stats);
      } catch (error) {
        console.error("Failed to calculate property stats:", error);
        setPropertyStats(null);
      }
    };
    loadPropertyStats();
  }, [propertyAnimals, property, animalsCount]);

  const handleDeleteAnimal = useMemo(
    () =>
      createDeleteAnimalHandler(
        selectedAnimal,
        setSelectedAnimal,
        setIsDeleteAnimalModalOpen,
        showAlert,
        t
      ),
    [selectedAnimal, setSelectedAnimal, setIsDeleteAnimalModalOpen, showAlert, t]
  );

  if (isLoadingProperty) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.properties.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.PROPERTIES)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const { animalUnits, stockingRate, density, averageWeight } = propertyStats || {
    animalUnits: 0,
    stockingRate: 0,
    density: 0,
    averageWeight: 0,
  };

  const handleDeleteAnimalClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDeleteAnimalModalOpen(true);
  };

  const handleFinanceEdit = (transaction: UnifiedTransaction) => {
    const editRoute = getFinanceEditRoute(transaction.transactionType, transaction.id);
    navigate(editRoute);
  };

  const handleFinanceDelete = (transaction: UnifiedTransaction) => {
    financeHandlers.handleDeleteClick(transaction);
  };

  const renderFinanceActions = (row: UnifiedTransaction) => {
    const canEditValue = getFinanceCanEditPermission(
      row.transactionType,
      canEdit as (module: string, resource: string) => boolean
    );
    const canDeleteValue = getFinanceCanDeletePermission(
      row.transactionType,
      canRemove as (module: string, resource: string) => boolean
    );

    return (
      <TableActionButtons
        onEdit={() => handleFinanceEdit(row)}
        onDelete={() => handleFinanceDelete(row)}
        canEdit={canEditValue}
        canDelete={canDeleteValue}
      />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(localeForDateTime, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{property.name}</h1>
            <StatusBadge
              label={
                property.status === "active"
                  ? t.properties.table.active
                  : t.properties.table.inactive
              }
              variant={property.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {property.code} • {property.city}, {property.state}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit("registration", "property") && (
            <Button
              variant="outline"
              onClick={() => navigate(getPropertyEditRoute(property.id))}
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
            onClick={() => navigate(ROUTES.PROPERTIES)}
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
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label={t.common.ariaLabels.tabs}>
          {renderPropertyTabButton(
            "information",
            t.properties.details.tabs.information,
            activeTab,
            setSearchParams,
            {}
          )}
          {renderPropertyTabButton(
            "info",
            t.properties.details.tabs.info,
            activeTab,
            setSearchParams
          )}
          {renderPropertyTabButton(
            "animals",
            t.properties.details.tabs.animals,
            activeTab,
            setSearchParams
          )}
          {renderPropertyTabButton(
            "indices-reprodutivos",
            t.properties.details.tabs.reproductiveIndexes,
            activeTab,
            setSearchParams
          )}
          {renderPropertyTabButton(
            "movements",
            t.properties.details.tabs.movements,
            activeTab,
            setSearchParams
          )}
          {renderPropertyTabButton(
            "locations",
            t.properties.details.tabs.locations,
            activeTab,
            setSearchParams
          )}
          {renderPropertyTabButton(
            "registrations",
            t.properties.details.tabs.registrations,
            activeTab,
            setSearchParams,
            { tab: "registrations", subTab: "employees" }
          )}
          {renderPropertyTabButton(
            "finance",
            t.properties.details.tabs.finance,
            activeTab,
            setSearchParams,
            { tab: "finance", subTab: "dashboard" }
          )}
          {isMainUser() &&
            renderPropertyTabButton(
              "activities",
              t.properties.details.tabs.activities,
              activeTab,
              setSearchParams
            )}
        </nav>
      </div>

      {activeTab === "information" && (
        <PropertyInformationTab
          property={property}
          locationsCount={locationsCount}
          animalsCount={animalsCount}
          animalUnits={animalUnits}
          stockingRate={stockingRate}
          density={density}
          averageWeight={averageWeight}
          expectedBirthsForecast={expectedBirthsForecast}
          nextMonthExpected={nextMonthExpected}
          localeForDateTime={localeForDateTime}
          language={language}
          formatDate={formatDate}
          navigate={navigate}
          t={t}
          employees={employees}
          serviceProviders={serviceProviders}
          suppliers={suppliers}
          buyers={buyers}
        />
      )}

      {activeTab === "info" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.properties.details.propertyInfo}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{property.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{property.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.area}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.area.value.toLocaleString(localeForDateTime, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {formatAreaType(property.area.type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(property.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-green-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.properties.details.address}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.profile.company.fields.street}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.street}
                    {property.number ? `, ${property.number}` : ""}
                  </p>
                </div>
                {property.complement && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.profile.company.fields.complement}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {property.complement}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.profile.company.fields.neighborhood}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.neighborhood}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.details.cityState}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.city}, {property.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.profile.company.fields.zipCode}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.zipCode}
                  </p>
                </div>
                {property.latitude && property.longitude && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.properties.details.coordinates}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {property.latitude && property.longitude && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-yellow-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.properties.details.location}
                </h2>
              </div>
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                propertyName={property.name}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "animals" &&
        property &&
        (() => {
          // Use sortedAnimals from state (computed via useEffect)

          const totalPages = Math.ceil(sortedAnimals.length / itemsPerPage);
          const paginatedAnimals = sortedAnimals.slice(
            (animalsCurrentPage - 1) * itemsPerPage,
            animalsCurrentPage * itemsPerPage
          );

          const columns: TableColumn<Animal>[] = createAnimalTableColumnsWithConfig({
            t,
            language,
            dateLocale,
            birthsMap,
            TooltipComponent: UITooltip,
            StatusBadgeComponent: StatusBadge,
            navigate: (path: string) => {
              navigate(path);
            },
            handleDeleteAnimalClick,
            canEdit,
            canRemove,
            includeProperties: false,
          });

          const headerActions: TableAction[] = [
            {
              label: t.animals.addAnimal,
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
              onClick: () => setIsAnimalRegistrationModalOpen(true),
            },
          ];

          const filters: TableFilter[] = [
            {
              label: t.animals.filters.all,
              value: "all",
              active: animalsActiveFilter === "all",
              onClick: () => {
                setAnimalsActiveFilter("all");
                setAnimalsCurrentPage(1);
              },
            },
            {
              label: t.animals.filters.active,
              value: "active",
              active: animalsActiveFilter === "active",
              onClick: () => {
                setAnimalsActiveFilter("active");
                setAnimalsCurrentPage(1);
              },
            },
            {
              label: t.animals.filters.inactive,
              value: "inactive",
              active: animalsActiveFilter === "inactive",
              onClick: () => {
                setAnimalsActiveFilter("inactive");
                setAnimalsCurrentPage(1);
              },
            },
          ];

          const handleSort = (column: string, direction: SortDirection) => {
            setAnimalsSortState({ column, direction });
            setAnimalsCurrentPage(1);
          };

          const selectedCount = selectedAnimals.size;
          const selectedAnimalIds = Array.from(selectedAnimals);

          return (
            <div className="space-y-8">
              <Table<Animal>
                columns={columns}
                data={paginatedAnimals}
                header={{
                  title: t.animals.title,
                  badge: {
                    label: t.animals.badge.animals(sortedAnimals.length),
                    variant: "primary",
                  },
                  description: t.animals.description,
                  actions: headerActions,
                }}
                filters={filters}
                selectedCountLabel={
                  selectedCount > 0 ? t.animals.badge.selected(selectedCount) : undefined
                }
                selectedActionButton={
                  selectedCount > 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const route = getAnimalMovementNewRoute(selectedAnimalIds);
                        navigate(route.pathname, { state: route.state });
                      }}
                      leftIcon={
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
                            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                          />
                        </svg>
                      }
                    >
                      {t.animals.movement.addButton}
                    </Button>
                  ) : undefined
                }
                search={{
                  placeholder: t.animals.searchPlaceholder,
                  value: animalsSearchValue,
                  onChange: (value) => {
                    setAnimalsSearchValue(value);
                    setAnimalsCurrentPage(1);
                  },
                }}
                pagination={{
                  currentPage: animalsCurrentPage,
                  totalPages: totalPages || 1,
                  onPageChange: setAnimalsCurrentPage,
                  showInfo: false,
                }}
                sortState={animalsSortState}
                onSort={handleSort}
                onRowClick={(row) => navigate(getAnimalViewRoute(row.id))}
                selectable={{
                  selectedRows: selectedAnimals,
                  onSelectionChange: (newSelection) => {
                    const stringSet = new Set<string>();
                    for (const id of newSelection) {
                      if (typeof id === "string") {
                        stringSet.add(id);
                      } else {
                        stringSet.add(String(id));
                      }
                    }
                    setSelectedAnimals(stringSet);
                  },
                  getRowId: (row) => row.id,
                  allData: sortedAnimals,
                }}
                emptyState={{
                  title: t.animals.emptyState.title,
                  description: animalsSearchValue
                    ? t.animals.emptyState.descriptionWithSearch(animalsSearchValue)
                    : t.animals.emptyState.descriptionWithoutSearch,
                  onClearSearch: () => {
                    setAnimalsSearchValue("");
                    setAnimalsActiveFilter("all");
                    setAnimalsCurrentPage(1);
                  },
                  clearSearchLabel: t.common.clearSearch,
                  onAddNew: () => setIsAnimalRegistrationModalOpen(true),
                  addNewLabel: t.animals.addAnimal,
                }}
              />

              <AlertDisplay />

              <ConfirmationModal
                isOpen={isDeleteAnimalModalOpen}
                onClose={() => {
                  setIsDeleteAnimalModalOpen(false);
                  setSelectedAnimal(null);
                }}
                onConfirm={handleDeleteAnimal}
                title={t.animals.deleteModal.title}
                message={t.animals.deleteModal.message(selectedAnimal?.registrationNumber || "")}
                confirmLabel={t.animals.deleteModal.confirm}
                cancelLabel={t.animals.deleteModal.cancel}
                variant="danger"
              />

              <AnimalRegistrationModal
                isOpen={isAnimalRegistrationModalOpen}
                onClose={() => setIsAnimalRegistrationModalOpen(false)}
                onSelectBirth={() => navigate(ROUTES.BIRTHS_NEW)}
                onSelectAcquisition={() => navigate(ROUTES.ACQUISITIONS_NEW)}
              />
            </div>
          );
        })()}

      {activeTab === "locations" &&
        property &&
        (() => {
          const propertyLocations = locations.filter((loc) => loc.propertyId === property.id);

          const locationsArray = [...propertyLocations];
          const sortedLocations = locationsArray.toSorted((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return 0;
            }

            let aValue = a[sortState.column as keyof Location];
            let bValue = b[sortState.column as keyof Location];

            if (sortState.column === "area") {
              aValue = a.area.value;
              bValue = b.area.value;
            }

            if (sortState.column === "locationType") {
              aValue = a.locationType;
              bValue = b.locationType;
            }

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, localeForDateTime, {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = toSafeString(aValue).localeCompare(
                toSafeString(bValue),
                localeForDateTime
              );
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const columns: TableColumn<Location>[] = [
            {
              key: "name",
              label: t.locations.table.name,
              sortable: true,
              render: (_, row) => (
                <div>
                  <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                  <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
                </div>
              ),
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
            {
              key: "area",
              label: t.locations.table.area,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.area.value.toLocaleString(localeForDateTime, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {formatAreaType(row.area.type)}
                </span>
              ),
            },
            {
              key: "status",
              label: t.locations.table.status,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={
                    row.status === "active" ? t.locations.table.active : t.locations.table.inactive
                  }
                  variant={row.status === "active" ? "success" : "default"}
                />
              ),
            },
          ];

          return (
            <div className="space-y-8">
              <Table<Location>
                columns={columns}
                data={sortedLocations}
                header={{
                  title: t.locations.title,
                  badge: {
                    label: t.locations.badge.locations(locations.length),
                    variant: "primary",
                  },
                  description: t.locations.description,
                }}
                sortState={sortState}
                onSort={(column, direction) => {
                  setSortState({ column, direction });
                }}
                onRowClick={(row) => navigate(getLocationViewRoute(row.id))}
                emptyState={{
                  title: t.locations.emptyState.title,
                  description: t.locations.emptyState.descriptionWithoutSearch,
                  onAddNew: () => {
                    navigate(ROUTES.LOCATIONS_NEW);
                  },
                  addNewLabel: t.locations.addLocation,
                }}
              />
            </div>
          );
        })()}

      {activeTab === "registrations" && property && (
        <div className="space-y-8">
          <div className="mb-4">
            <nav className="flex space-x-3" aria-label="Sub Tabs">
              {renderSubTabButton(
                "employees",
                t.properties.details.tabs.employees,
                registrationsSubTab,
                setSearchParams,
                { tab: "registrations", subTab: "employees" }
              )}
              {renderSubTabButton(
                "serviceProviders",
                t.properties.details.tabs.serviceProviders,
                registrationsSubTab,
                setSearchParams,
                { tab: "registrations", subTab: "serviceProviders" }
              )}
              {renderSubTabButton(
                "suppliers",
                t.properties.details.tabs.suppliers,
                registrationsSubTab,
                setSearchParams,
                { tab: "registrations", subTab: "suppliers" }
              )}
              {renderSubTabButton(
                "buyers",
                t.properties.details.tabs.buyers,
                registrationsSubTab,
                setSearchParams,
                { tab: "registrations", subTab: "buyers" }
              )}
            </nav>
          </div>

          {registrationsSubTab === "employees" &&
            (() => {
              const propertyEmployees = employees.filter((emp) =>
                emp.propertyIds?.includes(property.id)
              );

              const employeesArray = [...propertyEmployees];
              const sortedEmployees = employeesArray.toSorted((a, b) => {
                if (!sortState.column || !sortState.direction) {
                  return 0;
                }

                const aValue = a[sortState.column as keyof Employee];
                const bValue = b[sortState.column as keyof Employee];

                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                let comparison = 0;
                if (typeof aValue === "string" && typeof bValue === "string") {
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = toSafeString(aValue).localeCompare(
                    toSafeString(bValue),
                    localeForDateTime
                  );
                }

                return sortState.direction === "asc" ? comparison : -comparison;
              });

              const columns: TableColumn<Employee>[] = [
                {
                  key: "name",
                  label: t.employees.table.name,
                  sortable: true,
                  render: (_, row) => (
                    <div>
                      <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                      <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        {row.code}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "cpf",
                  label: t.employees.table.cpf,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.cpf || "-"}</span>
                  ),
                },
                {
                  key: "email",
                  label: t.employees.table.email,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
                  ),
                },
                {
                  key: "phone",
                  label: t.employees.table.phone,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
                  ),
                },
                {
                  key: "status",
                  label: t.employees.table.status,
                  sortable: true,
                  render: (_, row) => (
                    <StatusBadge
                      label={
                        row.status === "active"
                          ? t.employees.table.active
                          : t.employees.table.inactive
                      }
                      variant={row.status === "active" ? "success" : "default"}
                    />
                  ),
                },
              ];

              return (
                <div className="space-y-8">
                  <Table<Employee>
                    columns={columns}
                    data={sortedEmployees}
                    header={{
                      title: t.employees.title,
                      badge: {
                        label: t.employees.badge.employees(employees.length),
                        variant: "primary",
                      },
                      description: t.employees.description,
                    }}
                    sortState={sortState}
                    onSort={(column, direction) => {
                      setSortState({ column, direction });
                    }}
                    onRowClick={(row) => navigate(getEmployeeViewRoute(row.id))}
                    emptyState={{
                      title: t.employees.emptyState.title,
                      description: t.employees.emptyState.descriptionWithoutSearch,
                      onAddNew: () => {
                        navigate(ROUTES.EMPLOYEES_NEW);
                      },
                      addNewLabel: t.employees.addEmployee,
                    }}
                  />
                </div>
              );
            })()}

          {registrationsSubTab === "serviceProviders" &&
            (() => {
              const propertyServiceProviders = serviceProviders.filter((sp) =>
                sp.propertyIds?.includes(property.id)
              );

              const serviceProvidersArray = [...propertyServiceProviders];
              const sortedServiceProviders = serviceProvidersArray.toSorted((a, b) => {
                if (!sortState.column || !sortState.direction) {
                  return 0;
                }

                const aValue = a[sortState.column as keyof ServiceProvider];
                const bValue = b[sortState.column as keyof ServiceProvider];

                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                let comparison = 0;
                if (typeof aValue === "string" && typeof bValue === "string") {
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = toSafeString(aValue).localeCompare(
                    toSafeString(bValue),
                    localeForDateTime
                  );
                }

                return sortState.direction === "asc" ? comparison : -comparison;
              });

              const columns: TableColumn<ServiceProvider>[] = [
                {
                  key: "name",
                  label: t.serviceProviders.table.name,
                  sortable: true,
                  render: (_, row) => (
                    <div>
                      <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                      <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        {row.code}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "document",
                  label: t.serviceProviders.table.document,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">
                      {row.cpf || row.cnpj || "-"}
                    </span>
                  ),
                },
                {
                  key: "email",
                  label: t.serviceProviders.table.email,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
                  ),
                },
                {
                  key: "phone",
                  label: t.serviceProviders.table.phone,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
                  ),
                },
                {
                  key: "status",
                  label: t.serviceProviders.table.status,
                  sortable: true,
                  render: (_, row) => (
                    <StatusBadge
                      label={
                        row.status === "active"
                          ? t.serviceProviders.table.active
                          : t.serviceProviders.table.inactive
                      }
                      variant={row.status === "active" ? "success" : "default"}
                    />
                  ),
                },
              ];

              return (
                <div className="space-y-8">
                  <Table<ServiceProvider>
                    columns={columns}
                    data={sortedServiceProviders}
                    header={{
                      title: t.serviceProviders.title,
                      badge: {
                        label: t.serviceProviders.badge.serviceProviders(serviceProviders.length),
                        variant: "primary",
                      },
                      description: t.serviceProviders.description,
                    }}
                    sortState={sortState}
                    onSort={(column, direction) => {
                      setSortState({ column, direction });
                    }}
                    onRowClick={(row) => navigate(getServiceProviderViewRoute(row.id))}
                    emptyState={{
                      title: t.serviceProviders.emptyState.title,
                      description: t.serviceProviders.emptyState.descriptionWithoutSearch,
                      onAddNew: () => {
                        navigate(ROUTES.SERVICE_PROVIDERS_NEW);
                      },
                      addNewLabel: t.serviceProviders.addServiceProvider,
                    }}
                  />
                </div>
              );
            })()}

          {registrationsSubTab === "suppliers" &&
            (() => {
              const propertySuppliers = suppliers.filter((sup) =>
                sup.propertyIds?.includes(property.id)
              );

              const suppliersArray = [...propertySuppliers];
              const sortedSuppliers = suppliersArray.toSorted((a, b) => {
                if (!sortState.column || !sortState.direction) {
                  return 0;
                }

                const aValue = a[sortState.column as keyof Supplier];
                const bValue = b[sortState.column as keyof Supplier];

                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                let comparison = 0;
                if (typeof aValue === "string" && typeof bValue === "string") {
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = toSafeString(aValue).localeCompare(
                    toSafeString(bValue),
                    localeForDateTime
                  );
                }

                return sortState.direction === "asc" ? comparison : -comparison;
              });

              const columns: TableColumn<Supplier>[] = [
                {
                  key: "name",
                  label: t.suppliers.table.name,
                  sortable: true,
                  render: (_, row) => (
                    <div>
                      <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                      <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        {row.code}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "document",
                  label: t.suppliers.table.document,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">
                      {row.cpf || row.cnpj || "-"}
                    </span>
                  ),
                },
                {
                  key: "email",
                  label: t.suppliers.table.email,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
                  ),
                },
                {
                  key: "phone",
                  label: t.suppliers.table.phone,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
                  ),
                },
                {
                  key: "status",
                  label: t.suppliers.table.status,
                  sortable: true,
                  render: (_, row) => (
                    <StatusBadge
                      label={
                        row.status === "active"
                          ? t.suppliers.table.active
                          : t.suppliers.table.inactive
                      }
                      variant={row.status === "active" ? "success" : "default"}
                    />
                  ),
                },
              ];

              return (
                <div className="space-y-8">
                  <Table<Supplier>
                    columns={columns}
                    data={sortedSuppliers}
                    header={{
                      title: t.suppliers.title,
                      badge: {
                        label: t.suppliers.badge.suppliers(suppliers.length),
                        variant: "primary",
                      },
                      description: t.suppliers.description,
                    }}
                    sortState={sortState}
                    onSort={(column, direction) => {
                      setSortState({ column, direction });
                    }}
                    onRowClick={(row) => navigate(getSupplierViewRoute(row.id))}
                    emptyState={{
                      title: t.suppliers.emptyState.title,
                      description: t.suppliers.emptyState.descriptionWithoutSearch,
                      onAddNew: () => {
                        navigate(ROUTES.SUPPLIERS_NEW);
                      },
                      addNewLabel: t.suppliers.addSupplier,
                    }}
                  />
                </div>
              );
            })()}

          {registrationsSubTab === "buyers" &&
            (() => {
              const propertyBuyers = buyers.filter((buy) => buy.propertyIds?.includes(property.id));

              const buyersArray = [...propertyBuyers];
              const sortedBuyers = buyersArray.toSorted((a, b) => {
                if (!sortState.column || !sortState.direction) {
                  return 0;
                }

                const aValue = a[sortState.column as keyof Buyer];
                const bValue = b[sortState.column as keyof Buyer];

                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                let comparison = 0;
                if (typeof aValue === "string" && typeof bValue === "string") {
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = toSafeString(aValue).localeCompare(
                    toSafeString(bValue),
                    localeForDateTime
                  );
                }

                return sortState.direction === "asc" ? comparison : -comparison;
              });

              const columns: TableColumn<Buyer>[] = [
                {
                  key: "name",
                  label: t.buyers.table.name,
                  sortable: true,
                  render: (_, row) => (
                    <div>
                      <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                      <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        {row.code}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "document",
                  label: t.buyers.table.document,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">
                      {row.cpf || row.cnpj || "-"}
                    </span>
                  ),
                },
                {
                  key: "email",
                  label: t.buyers.table.email,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
                  ),
                },
                {
                  key: "phone",
                  label: t.buyers.table.phone,
                  sortable: true,
                  render: (_, row) => (
                    <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
                  ),
                },
                {
                  key: "status",
                  label: t.buyers.table.status,
                  sortable: true,
                  render: (_, row) => (
                    <StatusBadge
                      label={
                        row.status === "active" ? t.buyers.table.active : t.buyers.table.inactive
                      }
                      variant={row.status === "active" ? "success" : "default"}
                    />
                  ),
                },
              ];

              return (
                <div className="space-y-8">
                  <Table<Buyer>
                    columns={columns}
                    data={sortedBuyers}
                    header={{
                      title: t.buyers.title,
                      badge: {
                        label: t.buyers.badge.buyers(buyers.length),
                        variant: "primary",
                      },
                      description: t.buyers.description,
                    }}
                    sortState={sortState}
                    onSort={(column, direction) => {
                      setSortState({ column, direction });
                    }}
                    onRowClick={(row) => navigate(getBuyerViewRoute(row.id))}
                    emptyState={{
                      title: t.buyers.emptyState.title,
                      description: t.buyers.emptyState.descriptionWithoutSearch,
                      onAddNew: () => {
                        navigate(ROUTES.BUYERS_NEW);
                      },
                      addNewLabel: t.buyers.addBuyer,
                    }}
                  />
                </div>
              );
            })()}
        </div>
      )}

      {activeTab === "activities" && isMainUser() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-teal-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.dashboard.recentActivities.title}
            </h2>
          </div>
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
                  {t.properties.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(property.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {property.status === "active"
                    ? t.properties.details.activityActivated
                    : t.properties.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.properties.details.statusLabel}:{" "}
                  {property.status === "active"
                    ? t.properties.table.active
                    : t.properties.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "indices-reprodutivos" && property && (
        <ReproductiveIndexes propertyId={property.id} />
      )}

      {activeTab === "movements" &&
        property &&
        (() => {
          const filteredMovements = filterMovementsBySearch(
            propertyMovements,
            searchValue,
            formatDate,
            t.properties.details.movements.types,
            { animalsMap, locations, employees, serviceProviders }
          );

          const sortedMovements = sortItems({
            items: filteredMovements,
            sortState,
            getValue: (item, column) => getMovementSortValue(item, column, locations),
            defaultSortColumn: "date",
            defaultSortDirection: "desc",
          });

          const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
          const paginatedMovements = sortedMovements.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );

          const columns = createMovementsTableColumns({
            language,
            translationKeys: {
              date: t.properties.details.movements.table.date,
              type: t.properties.details.movements.table.type,
              locations: t.properties.details.movements.table.locations,
              animals: "Animais",
              responsible: t.properties.details.movements.table.responsible,
              observation: t.properties.details.movements.observation,
              files: t.properties.details.movements.files,
              types: t.properties.details.movements.types as Record<string, string>,
            },
            getLocationById: (id: string) => {
              const location = locations.find((l) => l.id === id);
              return location ? { name: location.name, code: location.code } : null;
            },
            getEmployeeById: (id: string) => {
              const employee = employees.find((e) => e.id === id);
              return employee ? { name: employee.name } : null;
            },
            getServiceProviderById: (id: string) => {
              const serviceProvider = serviceProviders.find((sp) => sp.id === id);
              return serviceProvider ? { name: serviceProvider.name } : null;
            },
            getAnimalById: (id: string) => {
              const animal = getAnimalByIdLocal(id);
              return animal
                ? { code: animal.code, registrationNumber: animal.registrationNumber }
                : null;
            },
          });

          const headerActions: TableAction[] = [
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
              onClick: () => {
                navigate(getMovementNewRoute(property.id));
              },
            },
          ];

          return (
            <div className="space-y-8">
              <Table<UnifiedMovement>
                columns={columns}
                data={paginatedMovements}
                header={{
                  title: t.properties.details.movements.title,
                  badge: {
                    label: `${filteredMovements.length} ${filteredMovements.length === 1 ? t.properties.details.movements.movement : t.properties.details.movements.movements}`,
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
                onRowClick={(row) => {
                  navigate(`${getMovementViewRoute(row.id)}?fromProperty=${property.id}`);
                }}
              />
            </div>
          );
        })()}

      {activeTab === "finance" &&
        property &&
        (() => {
          return (
            <div className="space-y-8">
              <div className="mb-4">
                <nav className="flex space-x-3" aria-label="Sub Tabs">
                  <button
                    onClick={() => {
                      setSearchParams({ tab: "finance", subTab: "dashboard" });
                    }}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                      ${
                        financeSubTab === "dashboard"
                          ? "shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }
                    `}
                    style={
                      financeSubTab === "dashboard"
                        ? {
                            backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                            color: DASHBOARD_COLORS.primaryDark,
                          }
                        : undefined
                    }
                  >
                    {t.properties.details.finance.subTabs.dashboard}
                  </button>
                  <button
                    onClick={() => {
                      setSearchParams({ tab: "finance", subTab: "transactions" });
                    }}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                      ${
                        financeSubTab === "transactions"
                          ? "shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }
                    `}
                    style={
                      financeSubTab === "transactions"
                        ? {
                            backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                            color: DASHBOARD_COLORS.primaryDark,
                          }
                        : undefined
                    }
                  >
                    {t.properties.details.finance.subTabs.transactions}
                  </button>
                </nav>
              </div>

              {financeSubTab === "dashboard" && (
                <FinanceDashboard
                  cashFlowData={cashFlowTransactions}
                  accountsPayableData={payableTransactions}
                  accountsReceivableData={receivableTransactions}
                  language={language}
                  gradientId="colorNetProperty"
                />
              )}

              {financeSubTab === "transactions" &&
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
                    transactionType: "cashFlow" | "receivable" | "payable";
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
                    supplierId: cf.supplierId,
                    buyerId: cf.buyerId,
                    employeeId: cf.employeeId,
                    serviceProviderId: cf.serviceProviderId,
                  });

                  const normalizeReceivable = (ar: AccountsReceivable): UnifiedTransaction => ({
                    id: ar.id,
                    type: "income",
                    amount: ar.amount,
                    date: ar.dueDate,
                    description: ar.description,
                    category: ar.category,
                    paymentMethod: ar.paymentMethod,
                    referenceNumber: ar.referenceNumber,
                    status: ar.status,
                    transactionType: "receivable",
                    buyerId: ar.buyerId,
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
                    supplierId: ap.supplierId,
                    employeeId: ap.employeeId,
                    serviceProviderId: ap.serviceProviderId,
                  });

                  const allTransactions: UnifiedTransaction[] = [
                    ...cashFlowTransactions.map(normalizeCashFlow),
                    ...receivableTransactions.map(normalizeReceivable),
                    ...payableTransactions.map(normalizePayable),
                  ];

                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString);
                    return format(date, "dd/MM/yyyy", { locale: dateLocale });
                  };

                  const formatCurrency = (value: number) => {
                    return new Intl.NumberFormat(localeForDateTime, {
                      style: "currency",
                      currency: "BRL",
                    }).format(value);
                  };

                  const getPropertyName = (id: string) =>
                    property?.id === id ? property.name : undefined;
                  const getSupplierName = (id: string) => suppliersMap.get(id)?.name;
                  const getBuyerName = (id: string) => buyersMap.get(id)?.name;
                  const getEmployeeName = (id: string) => employeesMap.get(id)?.name;
                  const getServiceProviderName = (id: string) => serviceProvidersMap.get(id)?.name;

                  const filteredFinanceData = allTransactions.filter((transaction) => {
                    const matchesSearch = financeSearchValue
                      ? matchesFinanceSearch(transaction, {
                          searchLower: financeSearchValue.toLowerCase(),
                          formatCurrency,
                          t,
                          getPropertyName,
                          getSupplierName,
                          getBuyerName,
                          getEmployeeName,
                          getServiceProviderName,
                        })
                      : true;

                    const matchesFilter = matchesFinanceFilters(
                      transaction,
                      financeActiveFilter,
                      financeSelectedYear,
                      financeSelectedMonth
                    );

                    return matchesSearch && matchesFilter;
                  });

                  const sortedFinanceData = sortItems({
                    items: filteredFinanceData,
                    sortState: financeSortState,
                  });

                  const paginatedFinanceData = sortedFinanceData.slice(
                    (financeCurrentPage - 1) * financeItemsPerPage,
                    financeCurrentPage * financeItemsPerPage
                  );

                  const totalFinancePages = Math.ceil(
                    filteredFinanceData.length / financeItemsPerPage
                  );

                  const totalIncome = filteredFinanceData
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0);
                  const totalExpenses = filteredFinanceData
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0);
                  const netTotal = totalIncome - totalExpenses;

                  const getStatusLabel = (status: string, transactionType: string) => {
                    return financeHandlers.getStatusLabel(status, transactionType, {
                      cashFlow: { completed: t.cashFlow.table.completed },
                      accountsReceivable: { status: t.accountsReceivable.status },
                      accountsPayable: { status: t.accountsPayable.status },
                    });
                  };

                  const financeColumns: TableColumn<UnifiedTransaction>[] = [
                    {
                      key: "type",
                      label: t.cashFlow.table.type,
                      sortable: true,
                      render: (_, row) => (
                        <StatusBadge
                          label={
                            row.type === "income"
                              ? t.cashFlow.table.income
                              : t.cashFlow.table.expense
                          }
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
                        <span className="text-gray-700 dark:text-gray-300">
                          {formatDate(row.date)}
                        </span>
                      ),
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
                      render: (_, row) =>
                        renderEntityName({
                          supplierId: row.supplierId,
                          employeeId: row.employeeId,
                          serviceProviderId: row.serviceProviderId,
                          buyerId: row.buyerId,
                          type: row.type,
                        }),
                    },
                    {
                      key: "paymentMethod",
                      label: t.cashFlow.table.paymentMethod,
                      sortable: true,
                      render: (_, row) => (
                        <span className="text-gray-700 dark:text-gray-300">
                          {row.paymentMethod
                            ? (t.cashFlow.paymentMethods as Record<string, string>)[
                                row.paymentMethod
                              ] || row.paymentMethod
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
                          variant={financeHandlers.getStatusVariant(
                            row.status,
                            row.transactionType
                          )}
                        />
                      ),
                    },
                    {
                      key: "actions",
                      label: "",
                      headerClassName: "relative",
                      render: (_, row) => renderFinanceActions(row),
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

                    options.push(
                      {
                        value: String(currentYear - 1),
                        label: String(currentYear - 1),
                      },
                      { value: String(currentYear), label: String(currentYear) }
                    );

                    return options;
                  };

                  const getMonthOptions = () => {
                    const localeMap: Record<string, string> = {
                      pt: localeForDateTime,
                      en: "en-US",
                      es: "es-ES",
                    };
                    const locale = localeMap[language] || localeForDateTime;
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
                    <div className="space-y-8">
                      <Table<UnifiedTransaction>
                        columns={financeColumns}
                        data={paginatedFinanceData}
                        header={{
                          title: t.properties.details.finance.title,
                          badge: {
                            label: t.cashFlow.badge.transactions(filteredFinanceData.length),
                            variant: "primary",
                          },
                          description: t.properties.details.finance.description,
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
                                {t.common.total}
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
                          } else if (row.transactionType === "receivable") {
                            navigate(getAccountsReceivableViewRoute(row.id));
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
                        isOpen={financeHandlers.isDeleteModalOpen}
                        onClose={() => {
                          financeHandlers.setIsDeleteModalOpen(false);
                        }}
                        onConfirm={financeHandlers.handleDeleteConfirm}
                        title={t.cashFlow.deleteModal.title}
                        message={t.cashFlow.deleteModal.message(
                          (
                            financeHandlers.selectedTransaction as
                              | CashFlow
                              | AccountsReceivable
                              | AccountsPayable
                          )?.description || ""
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
        })()}
    </div>
  );
}
