import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  Button,
  StatusBadge,
  Table,
  Input,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
  FileUpload,
  FixedAlert,
  Tooltip,
  ConfirmationModal,
  AnimalRegistrationModal,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  ROUTES,
  getLocationEditRoute,
  getMovementViewRoute,
  getMovementNewRoute,
  getObservationViewRoute,
  getAnimalViewRoute,
  getAnimalMovementNewRoute,
  getInventoryViewRoute,
  getLocationInventoryMovementNewRoute,
} from "~/routes.config";
import { getLocationById, getLocations } from "~/services/locations.service";
import {
  AreaType,
  InventoryMovementType,
  type LocationMovement,
  type AnimalMovement,
  type Animal,
  type InventoryMovement,
  type Location,
  type Property,
  type Employee,
  type ServiceProvider,
  type InventoryItem,
} from "~/types";
import { getProperties } from "~/services/properties.service";
import { getLocationMovementsByLocationId } from "~/services/location-movements.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { useAlert } from "~/hooks/use-alert";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import {
  getAnimalsByLastMovementLocation,
  getAnimalMovementsByLocationId,
} from "~/services/animal-movements.service";
import { getAnimalsByCompanyId, deleteAnimal } from "~/services/animals.service";
import { getBirthsByCompanyId } from "~/services/births.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { useDateLocale } from "~/hooks/use-date-locale";
import { createAnimalTableColumnsWithConfig } from "~/utils/animal-table-config";
import { createBirthsMap } from "~/utils/births-map";
import {
  getLocationConsumptionCosts,
  getTotalLocationCost,
  getAnimalCostBreakdown,
} from "~/services/location-costs.service";

type LocationTab =
  | "information"
  | "info"
  | "activities"
  | "movements"
  | "observations"
  | "animals"
  | "costs";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";

type MovementUnion =
  | (LocationMovement & { movementType: "location" })
  | (AnimalMovement & { movementType: "animal" })
  | (InventoryMovement & { movementType: "inventory" });

function matchesLocationMovementSearch(
  movement: LocationMovement,
  searchLower: string,
  t: { properties: { details: { movements: { types: Record<string, string> } } } }
): boolean {
  const typeText =
    t.properties.details.movements.types[
      movement.type as keyof typeof t.properties.details.movements.types
    ] || movement.type;
  return typeText.toLowerCase().includes(searchLower);
}

function matchesAnimalMovementSearch(
  movement: AnimalMovement,
  searchLower: string,
  t: { properties: { details: { movements: { types: { animal_movement: string } } } } }
): boolean {
  const animalMovementText = t.properties.details.movements.types.animal_movement.toLowerCase();
  return animalMovementText.includes(searchLower) || "animal".toLowerCase().includes(searchLower);
}

async function matchesInventoryMovementSearch(
  movement: InventoryMovement,
  searchLower: string,
  t: { inventory: { movements: { types: { consumption?: string } } } }
): Promise<boolean> {
  const item = await getInventoryItemById(movement.itemId);
  if (item) {
    const itemName = `${item.code} ${item.name}`.toLowerCase();
    if (itemName.includes(searchLower)) return true;
    if (item.name.toLowerCase().includes(searchLower)) return true;
  }
  const consumptionText = t.inventory.movements.types.consumption?.toLowerCase() || "consumo";
  return consumptionText.includes(searchLower);
}

function matchesLocationNames(
  movement: MovementUnion,
  searchLower: string,
  locations: Location[]
): boolean {
  const locationIds =
    movement.movementType === "location"
      ? (movement as LocationMovement).locationIds
      : [(movement as AnimalMovement).locationId];
  const locationNames = locationIds
    .map((id) => {
      const loc = locations.find((l) => l.id === id);
      return loc ? `${loc.name} ${loc.code}`.toLowerCase() : id.toLowerCase();
    })
    .join(" ");
  return locationNames.includes(searchLower);
}

function matchesAnimalNames(
  movement: AnimalMovement,
  searchLower: string,
  animalsMap: Map<string, Animal>
): boolean {
  const animalNames = movement.animalIds
    .map((id) => {
      const animal = animalsMap.get(id);
      return animal ? `${animal.code} ${animal.registrationNumber}`.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
  return animalNames.includes(searchLower);
}

async function checkMovementTypeSpecificSearch(
  movement: MovementUnion,
  searchLower: string,
  t: {
    properties: {
      details: {
        movements: {
          types: Record<string, string> & { animal_movement: string };
        };
      };
    };
    inventory: {
      movements: {
        types: {
          consumption?: string;
        };
      };
    };
  }
): Promise<boolean> {
  if (movement.movementType === "location") {
    return matchesLocationMovementSearch(movement as LocationMovement, searchLower, t);
  }
  if (movement.movementType === "animal") {
    return matchesAnimalMovementSearch(movement as AnimalMovement, searchLower, t);
  }
  if (movement.movementType === "inventory") {
    return await matchesInventoryMovementSearch(movement as InventoryMovement, searchLower, t);
  }
  return false;
}

async function matchesMovementSearch(
  movement: MovementUnion,
  searchLower: string,
  formatDate: (date: string) => string,
  t: {
    properties: {
      details: {
        movements: {
          types: Record<string, string> & { animal_movement: string };
        };
      };
    };
    inventory: {
      movements: {
        types: {
          consumption?: string;
        };
      };
    };
  },
  searchContext: {
    locations: Location[];
    employees: Employee[];
    serviceProviders: ServiceProvider[];
    animalsMap: Map<string, Animal>;
  }
): Promise<boolean> {
  const { locations, employees, serviceProviders, animalsMap } = searchContext;
  if (await checkMovementTypeSpecificSearch(movement, searchLower, t)) {
    return true;
  }

  const dateText = formatDate(movement.date);
  if (dateText.toLowerCase().includes(searchLower)) return true;

  if (
    movement.movementType !== "inventory" &&
    matchesLocationNames(movement, searchLower, locations)
  ) {
    return true;
  }

  if (
    movement.movementType === "animal" &&
    matchesAnimalNames(movement as AnimalMovement, searchLower, animalsMap)
  ) {
    return true;
  }

  const employeeNames = getEmployeeNamesForMovement(movement, employees);
  if (employeeNames?.includes(searchLower)) return true;

  const providerNames = getProviderNamesForMovement(movement, serviceProviders);
  if (providerNames?.includes(searchLower)) return true;

  return false;
}

function getEmployeeNamesForMovement(movement: MovementUnion, employees: Employee[]): string {
  if (movement.movementType === "inventory") {
    const inventoryMovement = movement as InventoryMovement;
    if (!inventoryMovement.employeeIds) return "";
    return inventoryMovement.employeeIds
      .map((id) => {
        const employee = employees.find((e) => e.id === id);
        return employee ? employee.name.toLowerCase() : "";
      })
      .filter((name) => name !== "")
      .join(" ");
  }
  if (!movement.employeeIds) return "";
  return movement.employeeIds
    .map((id) => {
      const employee = employees.find((e) => e.id === id);
      return employee ? employee.name.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
}

function getProviderNamesForMovement(
  movement: MovementUnion,
  serviceProviders: ServiceProvider[]
): string {
  if (movement.movementType === "inventory") {
    const inventoryMovement = movement as InventoryMovement;
    if (!inventoryMovement.serviceProviderIds) return "";
    return inventoryMovement.serviceProviderIds
      .map((id) => {
        const provider = serviceProviders.find((sp) => sp.id === id);
        return provider ? provider.name.toLowerCase() : "";
      })
      .filter((name) => name !== "")
      .join(" ");
  }
  if (!movement.serviceProviderIds) return "";
  return movement.serviceProviderIds
    .map((id) => {
      const provider = serviceProviders.find((sp) => sp.id === id);
      return provider ? provider.name.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
}

function getEmployeeNames(employeeIds: string[] | undefined, employeesList: Employee[]): string[] {
  if (!employeeIds) return [];
  return employeeIds
    .map((id) => {
      const employee = employeesList.find((e) => e.id === id);
      return employee ? employee.name : null;
    })
    .filter((name): name is string => name !== null);
}

function getProviderNames(
  providerIds: string[] | undefined,
  providersList: ServiceProvider[]
): string[] {
  if (!providerIds) return [];
  return providerIds
    .map((id) => {
      const provider = providersList.find((sp) => sp.id === id);
      return provider ? provider.name : null;
    })
    .filter((name): name is string => name !== null);
}

import {
  getLocationObservationsByLocationId,
  addLocationObservation,
} from "~/services/location-observations.service";
import type { LocationObservation } from "~/types/location-observation";
import { usePermissions } from "~/utils/permissions";
import { getMovementsByLocationId } from "~/services/inventory-movements.service";
import { getInventoryItemById } from "~/services/inventory.service";
import { getUnitLabel } from "~/utils/inventory-utils";

import { formatAreaType } from "~/utils/formatting";

type UnifiedMovement =
  | (LocationMovement & { movementType: "location" } & Record<string, unknown>)
  | (AnimalMovement & { movementType: "animal" } & Record<string, unknown>)
  | (InventoryMovement & { movementType: "inventory" } & Record<string, unknown>);

type MovementSortValue = string | number | undefined;

function getMovementLocationSortValue(movement: UnifiedMovement, locations: Location[]): string {
  if (movement.movementType === "inventory") {
    const locationId = (movement as InventoryMovement).locationId;
    const loc = locationId ? locations.find((l) => l.id === locationId) : null;
    return loc ? `${loc.name} (${loc.code})` : locationId || "";
  }
  if (movement.movementType === "location") {
    const locationIds = (movement as LocationMovement).locationIds;
    const names = locationIds
      .map((id) => {
        const loc = locations.find((l) => l.id === id);
        return loc ? `${loc.name} (${loc.code})` : id;
      })
      .toSorted((a, b) => a.localeCompare(b));
    return names.join(", ");
  }
  const locationId = (movement as AnimalMovement).locationId;
  const loc = locationId ? locations.find((l) => l.id === locationId) : null;
  return loc ? `${loc.name} (${loc.code})` : locationId || "";
}

async function getMovementTypeSortValue(movement: UnifiedMovement): Promise<string> {
  if (movement.movementType === "location") {
    return (movement as LocationMovement).type;
  }
  if (movement.movementType === "animal") {
    return "animal";
  }
  const item = await getInventoryItemById((movement as InventoryMovement).itemId);
  return item ? `${item.code} - ${item.name}` : "inventory";
}

async function getMovementSortValue(
  movement: UnifiedMovement,
  column: string,
  locations: Location[]
): Promise<MovementSortValue> {
  if (column === "date") {
    return new Date(movement.date).getTime();
  }
  if (column === "locations") {
    return getMovementLocationSortValue(movement, locations);
  }
  if (column === "type") {
    return await getMovementTypeSortValue(movement);
  }
  if (movement.movementType === "location") {
    return (movement as LocationMovement)[column as keyof LocationMovement] as MovementSortValue;
  }
  if (movement.movementType === "animal") {
    return (movement as AnimalMovement)[column as keyof AnimalMovement] as MovementSortValue;
  }
  return (movement as InventoryMovement)[column as keyof InventoryMovement] as MovementSortValue;
}

import { createViewMeta } from "~/utils/route-helpers";

export function meta() {
  return createViewMeta("Localização", "Visualização detalhada da localização");
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
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

async function calculateLocationStats(
  animalsInLocation: Animal[],
  location: Location
): Promise<{
  totalWeight: number;
  animalUnits: number;
  areaInHectares: number;
  stockingRate: number;
  density: number;
}> {
  const calculateTotalWeight = async () => {
    let totalWeight = 0;
    for (const animal of animalsInLocation) {
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
  const areaInHectares = convertToHectares(location.area.value, location.area.type);
  const stockingRate = areaInHectares > 0 && animalUnits > 0 ? animalUnits / areaInHectares : 0;
  const density =
    areaInHectares > 0 && animalsInLocation.length > 0
      ? animalsInLocation.length / areaInHectares
      : 0;

  return { totalWeight, animalUnits, areaInHectares, stockingRate, density };
}

function handleTabChange(
  tab: string | null,
  isMainUser: () => boolean,
  setActiveTab: (tab: LocationTab) => void,
  setSearchParams: (params: { tab?: string }) => void
): void {
  const validTabs = ["info", "activities", "movements", "observations", "animals", "costs"];

  if (tab === "activities" && !isMainUser()) {
    setActiveTab("information");
    setSearchParams({ tab: "information" });
    return;
  }
  if (validTabs.includes(tab || "")) {
    setActiveTab(tab as LocationTab);
  } else if (!tab) {
    setActiveTab("information");
  }
}

function getLocaleForLanguage(lang: string) {
  if (lang === "en") return "en-US";
  if (lang === "es") return "es-ES";
  return "pt-BR";
}

function getActiveTabFromParam(tabParam: string | null): LocationTab {
  const validTabs = [
    "info",
    "activities",
    "movements",
    "observations",
    "animals",
    "costs",
  ] as const;
  if (tabParam === null) return "information";
  return validTabs.includes(tabParam as (typeof validTabs)[number])
    ? (tabParam as LocationTab)
    : "information";
}

function createDateFormatter(locale: string) {
  return (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
}

function createDateTimeFormatter(locale: string) {
  return (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
}

function renderTabButton(
  tab: LocationTab,
  label: string,
  activeTab: LocationTab,
  setActiveTab: (tab: LocationTab) => void,
  setSearchParams: (params: { tab: string }) => void,
  isConditional?: boolean
) {
  if (isConditional === false) return null;

  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => {
        setActiveTab(tab);
        setSearchParams({ tab });
      }}
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

interface ObservationSubmitHandlerOptions {
  location: Location;
  observationText: string;
  observationFiles: File[];
  setters: {
    setObservationText: (text: string) => void;
    setObservationFiles: (files: File[]) => void;
    setShowObservationForm: (show: boolean) => void;
    setObservations: (obs: LocationObservation[]) => void;
    setObservationAlert: (
      alert: { title: string; variant: "success" | "error" | "warning" | "info" } | null
    ) => void;
    setIsSubmittingObservation: (isSubmitting: boolean) => void;
  };
  t: ReturnType<typeof useTranslation>;
}

function createObservationSubmitHandler(options: ObservationSubmitHandlerOptions) {
  const { location, observationText, observationFiles, setters, t } = options;
  const {
    setObservationText,
    setObservationFiles,
    setShowObservationForm,
    setObservations,
    setObservationAlert,
    setIsSubmittingObservation,
  } = setters;

  return async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim()) {
      setObservationAlert({
        title: t.locations.details.observationRequired,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-obs-${Date.now()}-${index}`);

      addLocationObservation({
        locationId: location.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getLocationObservationsByLocationId(location.id));

      setObservationAlert({
        title: t.locations.details.observationAdded,
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.locations.details.observationError,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };
}

function LocationCostsContent({
  locationId,
  costsStartDate,
  costsEndDate,
  onStartDateChange,
  onEndDateChange,
  t,
  language: _language,
  dateLocale,
  localeForNumber,
}: Readonly<{
  locationId: string;
  costsStartDate: string;
  costsEndDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  t: ReturnType<typeof useTranslation>;
  language: string;
  dateLocale: Locale;
  localeForNumber: string;
}>) {
  const [consumptionCosts, setConsumptionCosts] = useState<
    Awaited<ReturnType<typeof getLocationConsumptionCosts>>
  >([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [animalBreakdown, setAnimalBreakdown] = useState<
    Awaited<ReturnType<typeof getAnimalCostBreakdown>>
  >([]);
  const [isLoadingCosts, setIsLoadingCosts] = useState(true);

  useEffect(() => {
    const loadCosts = async () => {
      setIsLoadingCosts(true);
      try {
        const [costsData, totalCostData, breakdownData] = await Promise.all([
          getLocationConsumptionCosts(
            locationId,
            costsStartDate || undefined,
            costsEndDate || undefined
          ),
          getTotalLocationCost(locationId, costsStartDate || undefined, costsEndDate || undefined),
          getAnimalCostBreakdown(
            locationId,
            costsStartDate || undefined,
            costsEndDate || undefined
          ),
        ]);
        setConsumptionCosts(costsData);
        setTotalCost(totalCostData);
        setAnimalBreakdown(breakdownData);
      } catch (error) {
        console.error("Failed to load costs:", error);
      } finally {
        setIsLoadingCosts(false);
      }
    };
    loadCosts();
  }, [locationId, costsStartDate, costsEndDate]);

  const averageCostPerAnimal = animalBreakdown.length > 0 ? totalCost / animalBreakdown.length : 0;

  if (isLoadingCosts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading || "Carregando..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.locations.costs.title}
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t.locations.costs.description}
        </p>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label={t.locations.costs.startDate}
              type="date"
              value={costsStartDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <Input
              label={t.locations.costs.endDate}
              type="date"
              value={costsEndDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                onStartDateChange("");
                onEndDateChange("");
              }}
              disabled={!costsStartDate && !costsEndDate}
            >
              {t.locations.costs.clearFilter}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t.locations.costs.totalCost}
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {totalCost.toLocaleString(localeForNumber, {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {t.locations.costs.averageCostPerAnimal}
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {averageCostPerAnimal.toLocaleString(localeForNumber, {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {t.locations.costs.consumptionRecords}
            </p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {consumptionCosts.length}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.locations.costs.consumptionHistory}
          </h3>
          {consumptionCosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="font-medium">{t.locations.costs.noConsumption}</p>
              <p className="text-sm mt-2">
                {costsStartDate || costsEndDate
                  ? t.locations.costs.noConsumptionWithFilter
                  : t.locations.costs.noConsumptionDescription}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.itemName}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.quantity}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.unitPrice}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.totalCost}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.date}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.animalsPresent}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {consumptionCosts.map((cost) => (
                    <tr key={cost.movement.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {cost.item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {cost.movement.quantity.toLocaleString(localeForNumber)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(cost.movement.unitPrice ?? cost.item.unitPrice ?? 0).toLocaleString(
                          localeForNumber,
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {cost.totalCost.toLocaleString(localeForNumber, {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(cost.movement.date), "PP", {
                          locale: dateLocale,
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {cost.animalsPresent.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {animalBreakdown.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.locations.costs.perAnimalBreakdown}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.animalCode}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.animalRegistration}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.totalAllocatedCost}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.consumptionPeriods}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.locations.costs.averageCostPerPeriod}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {animalBreakdown.map((breakdown) => (
                    <tr key={breakdown.animal.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {breakdown.animal.code}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {breakdown.animal.registrationNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {breakdown.totalCost.toLocaleString(localeForNumber, {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {breakdown.consumptionPeriods}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {breakdown.averageCostPerPeriod.toLocaleString(localeForNumber, {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LocationDetails() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit, canRemove, isMainUser } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showAlert } = useAlert();
  const [location, setLocation] = useState<Location | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [births, setBirths] = useState<Awaited<ReturnType<typeof getBirthsByCompanyId>>>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!locationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [locationData, propertiesData, locationsData, employeesData, serviceProvidersData] =
          await Promise.all([
            getLocationById(locationId),
            getProperties(),
            getLocations(),
            getEmployees(),
            getServiceProviders(),
          ]);
        setLocation(locationData);
        setLocations(locationsData);
        setEmployees(employeesData);
        setServiceProviders(serviceProvidersData);
        const propertyData = propertiesData.find((p) => p.id === locationData.propertyId);
        if (propertyData) {
          setProperty(propertyData);
          // Load animals and births for this property's company
          try {
            const [animalsData, birthsData] = await Promise.all([
              getAnimalsByCompanyId(propertyData.companyId),
              getBirthsByCompanyId(propertyData.companyId),
            ]);
            setAnimals(animalsData || []);
            setBirths(birthsData || []);
          } catch (error) {
            console.error("Failed to load animals:", error);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t.locations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load location:", error);
        setTimeout(() => {
          navigate(ROUTES.LOCATIONS);
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locationId, navigate, showAlert, t]);

  const locationsMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const getLocationByIdSync = (id: string) => locationsMap.get(id);
  const animalsMap = useMemo(() => new Map(animals.map((a) => [a.id, a])), [animals]);
  const birthsMap = useMemo(() => createBirthsMap(births), [births]);

  const getAnimalByIdLocal = (id: string) => {
    return animalsMap.get(id);
  };

  const getBirthByAnimalIdLocal = (id: string) => {
    return birthsMap.get(id);
  };

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<LocationTab>(getActiveTabFromParam(tabParam));

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchValue, setSearchValue] = useState("");

  const [animalsSearchValue, setAnimalsSearchValue] = useState("");
  const [animalsActiveFilter, setAnimalsActiveFilter] = useState<string>("all");
  const [animalsCurrentPage, setAnimalsCurrentPage] = useState(1);
  const [filteredAndSortedMovements, setFilteredAndSortedMovements] = useState<UnifiedMovement[]>(
    []
  );
  const [inventoryItemsMap, setInventoryItemsMap] = useState<Map<string, InventoryItem>>(new Map());
  const [animalsSortState, setAnimalsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "code", direction: "asc" });
  const [isDeleteAnimalModalOpen, setIsDeleteAnimalModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const [isAnimalRegistrationModalOpen, setIsAnimalRegistrationModalOpen] = useState(false);
  const [costsStartDate, setCostsStartDate] = useState<string>("");
  const [costsEndDate, setCostsEndDate] = useState<string>("");

  const dateLocale = useDateLocale();
  const localeForDateTime = getLocaleForLanguage(language);
  const localeForNumber = localeForDateTime;
  const formatDate = useMemo(() => createDateFormatter(localeForDateTime), [localeForDateTime]);
  const formatDateTime = useMemo(
    () => createDateTimeFormatter(localeForDateTime),
    [localeForDateTime]
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    handleTabChange(tab, isMainUser, setActiveTab, setSearchParams);
  }, [searchParams, isMainUser, setSearchParams]);

  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [observations, setObservations] = useState<LocationObservation[]>([]);

  useEffect(() => {
    if (location) {
      setObservations(getLocationObservationsByLocationId(location.id));
    }
  }, [location]);

  const animalIdsInLocation = location ? getAnimalsByLastMovementLocation(location.id) : [];
  const allAnimalsInLocation = animalIdsInLocation
    .map((id) => getAnimalByIdLocal(id))
    .filter((animal): animal is Animal => animal !== null);
  const animalsInLocation = allAnimalsInLocation.filter((animal) => animal.status === "active");

  const [locationStats, setLocationStats] = useState<{
    totalWeight: number;
    animalUnits: number;
    areaInHectares: number;
    stockingRate: number;
    density: number;
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!location) {
        setLocationStats(null);
        return;
      }
      const stats = await calculateLocationStats(animalsInLocation, location);
      setLocationStats(stats);
    };
    loadStats();
  }, [animalsInLocation, location]);

  // Pre-load inventory items for movements
  useEffect(() => {
    const loadInventoryItems = async () => {
      if (!location) {
        setInventoryItemsMap(new Map());
        return;
      }
      const inventoryMovements = getMovementsByLocationId(location.id).filter(
        (m) => m.type === InventoryMovementType.CONSUMPTION
      );
      const itemIds = new Set(inventoryMovements.map((m) => m.itemId));
      const itemPromises = Array.from(itemIds).map(async (itemId) => {
        const item = await getInventoryItemById(itemId);
        return [itemId, item] as [string, InventoryItem | undefined];
      });
      const items = await Promise.all(itemPromises);
      const itemsMap = new Map(
        items.filter(([, item]) => item !== undefined) as [string, InventoryItem][]
      );
      setInventoryItemsMap(itemsMap);
    };
    loadInventoryItems();
  }, [location]);

  // Filter and sort movements
  useEffect(() => {
    const filterAndSortMovements = async () => {
      if (!location || !property) {
        setFilteredAndSortedMovements([]);
        return;
      }

      const locationMovements = getLocationMovementsByLocationId(location.id);
      const animalMovements = getAnimalMovementsByLocationId(location.id);
      const inventoryMovements = getMovementsByLocationId(location.id).filter(
        (m) => m.type === InventoryMovementType.CONSUMPTION
      );

      const movements: UnifiedMovement[] = [
        ...locationMovements.map((m) => ({ ...m, movementType: "location" as const })),
        ...animalMovements.map((m) => ({ ...m, movementType: "animal" as const })),
        ...inventoryMovements.map((m) => ({ ...m, movementType: "inventory" as const })),
      ];

      // Filter movements
      const filterPromises = movements.map(async (movement) => {
        if (!searchValue) return movement;
        const matches = await matchesMovementSearch(
          movement,
          searchValue.toLowerCase(),
          formatDate,
          t,
          {
            locations,
            employees,
            serviceProviders,
            animalsMap,
          }
        );
        return matches ? movement : null;
      });
      const filterResults = await Promise.all(filterPromises);
      const filteredMovements = filterResults.filter((m): m is UnifiedMovement => m !== null);

      // Sort movements
      const sortPromises = filteredMovements.map(async (movement) => {
        const sortValue = await getMovementSortValue(
          movement,
          sortState.column || "date",
          locations
        );
        return { movement, sortValue };
      });
      const sortResults = await Promise.all(sortPromises);

      const sortedResults = [...sortResults].sort((a, b) => {
        if (!sortState.column || !sortState.direction) {
          return new Date(b.movement.date).getTime() - new Date(a.movement.date).getTime();
        }

        const aValue = a.sortValue;
        const bValue = b.sortValue;

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
          comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
        }

        return sortState.direction === "asc" ? comparison : -comparison;
      });
      const sortedMovements = sortedResults.map(({ movement }) => movement);

      setFilteredAndSortedMovements(sortedMovements);
    };

    filterAndSortMovements();
  }, [
    location,
    property,
    searchValue,
    sortState,
    formatDate,
    t,
    locations,
    employees,
    serviceProviders,
    animalsMap,
    localeForDateTime,
  ]);

  const handleSubmitObservation = useMemo(
    () =>
      location
        ? createObservationSubmitHandler({
            location,
            observationText,
            observationFiles,
            setters: {
              setObservationText,
              setObservationFiles,
              setShowObservationForm,
              setObservations,
              setObservationAlert,
              setIsSubmittingObservation,
            },
            t,
          })
        : undefined,
    [
      location,
      observationText,
      observationFiles,
      setObservationText,
      setObservationFiles,
      setShowObservationForm,
      setObservations,
      setObservationAlert,
      setIsSubmittingObservation,
      t,
    ]
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.locations.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.LOCATIONS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const { animalUnits, stockingRate, density } = locationStats || {
    animalUnits: 0,
    stockingRate: 0,
    density: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{location.name}</h1>
            <StatusBadge
              label={
                location.status === "active" ? t.locations.table.active : t.locations.table.inactive
              }
              variant={location.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {location.code} {property && `• ${property.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit("registration", "location") && (
            <Button
              variant="outline"
              onClick={() => navigate(getLocationEditRoute(location.id))}
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
            onClick={() => navigate(ROUTES.LOCATIONS)}
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
        <nav className="flex space-x-8" aria-label={t.common.ariaLabels.tabs}>
          <button
            onClick={() => {
              setActiveTab("information");
              setSearchParams({});
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "information"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "information"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.locations.details.tabs.information}
          </button>
          {renderTabButton(
            "info",
            t.locations.details.tabs.info,
            activeTab,
            setActiveTab,
            setSearchParams
          )}
          {renderTabButton("animals", t.animals.title, activeTab, setActiveTab, setSearchParams)}
          {renderTabButton(
            "costs",
            t.locations.costs.title,
            activeTab,
            setActiveTab,
            setSearchParams
          )}
          {renderTabButton(
            "movements",
            t.properties.details.movements.title,
            activeTab,
            setActiveTab,
            setSearchParams
          )}
          {renderTabButton(
            "observations",
            t.locations.details.tabs.observations,
            activeTab,
            setActiveTab,
            setSearchParams
          )}
          {renderTabButton(
            "activities",
            t.locations.details.tabs.activities,
            activeTab,
            setActiveTab,
            setSearchParams,
            isMainUser()
          )}
        </nav>
      </div>

      {activeTab === "information" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.area}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {location.area.value.toLocaleString(localeForNumber, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {formatAreaType(location.area.type)}
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
                    {t.locations.table.animals}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {animalsInLocation.length}
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
                    {t.locations.table.uas}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {animalUnits.toLocaleString(localeForNumber, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.stockingRate}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stockingRate.toLocaleString(localeForNumber, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t.dashboard.stats.uaPerHa}
                  </p>
                </div>
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📈</span>
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
                    {density.toLocaleString(localeForNumber, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t.dashboard.stats.animalsPerHa}
                  </p>
                </div>
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.locations.details.locationInfo}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{location.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{location.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.locationType}
                  </p>
                  <div className="mt-1">
                    <LocationTypeBadge
                      locationType={location.locationType}
                      label={
                        t.locations.types[
                          location.locationType as keyof typeof t.locations.types
                        ] || location.locationType
                      }
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.property}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.area}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {location.area.value.toLocaleString(localeForNumber, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {formatAreaType(location.area.type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(location.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activities" && isMainUser() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-green-500 rounded-full"></div>
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
                  {t.locations.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(location.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {location.status === "active"
                    ? t.locations.details.activityActivated
                    : t.locations.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.locations.details.statusLabel}:{" "}
                  {location.status === "active"
                    ? t.locations.table.active
                    : t.locations.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "animals" &&
        location &&
        (() => {
          const animalIdsInLocation = getAnimalsByLastMovementLocation(location.id);
          const allAnimals = animalIdsInLocation
            .map((id) => getAnimalByIdLocal(id))
            .filter((animal): animal is Animal => animal !== null);

          const handleDeleteAnimalClick = (animal: Animal) => {
            setSelectedAnimal(animal);
            setIsDeleteAnimalModalOpen(true);
          };

          const handleDeleteAnimal = async () => {
            if (!selectedAnimal) return;
            try {
              await deleteAnimal(selectedAnimal.id);
              setSelectedAnimals((prev) => {
                const newSet = new Set(prev);
                newSet.delete(selectedAnimal.id);
                return newSet;
              });
            } catch (error) {
              console.error("Failed to delete animal:", error);
            } finally {
              setIsDeleteAnimalModalOpen(false);
              setSelectedAnimal(null);
            }
          };

          const filteredAnimals = allAnimals.filter((animal) => {
            const birth = getBirthByAnimalIdLocal(animal.id);
            const breedMatch = birth?.breed
              ? birth.breed.toLowerCase().includes(animalsSearchValue.toLowerCase())
              : false;
            const matchesSearch =
              animal.registrationNumber.toLowerCase().includes(animalsSearchValue.toLowerCase()) ||
              animal.code.toLowerCase().includes(animalsSearchValue.toLowerCase()) ||
              breedMatch;

            const matchesFilter =
              animalsActiveFilter === "all" ||
              (animalsActiveFilter === "active" && animal.status === "active") ||
              (animalsActiveFilter === "inactive" && animal.status === "inactive");

            return matchesSearch && matchesFilter;
          });

          const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
          const paginatedAnimals = filteredAnimals.slice(
            (animalsCurrentPage - 1) * itemsPerPage,
            animalsCurrentPage * itemsPerPage
          );

          const columns: TableColumn<Animal>[] = createAnimalTableColumnsWithConfig({
            t,
            language,
            dateLocale,
            birthsMap,
            TooltipComponent: Tooltip,
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
                    label: t.animals.badge.animals(filteredAnimals.length),
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
                  allData: filteredAnimals,
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

              <FixedAlert alertMessage={observationAlert} />

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

      {activeTab === "observations" &&
        location &&
        (() => {
          const filteredObservations = observations.filter((observation) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            if (observation.observation.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDateTime(observation.createdAt);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            return false;
          });

          const sortedObservations = filteredObservations.toSorted((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }

            type ObservationSortValue = string | number | undefined;
            let aValue: ObservationSortValue;
            let bValue: ObservationSortValue;

            if (sortState.column === "date") {
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
            } else if (sortState.column === "observation") {
              aValue = a.observation;
              bValue = b.observation;
            } else {
              aValue = a[sortState.column as keyof LocationObservation] as ObservationSortValue;
              bValue = b[sortState.column as keyof LocationObservation] as ObservationSortValue;
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
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
          const paginatedObservations = sortedObservations.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );

          const columns: TableColumn<LocationObservation>[] = [
            {
              key: "date",
              label: t.locations.details.observationDate,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateTime(row.createdAt)}
                </span>
              ),
            },
            {
              key: "observation",
              label: t.locations.details.observation,
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
              label: t.locations.details.files,
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
              label: t.locations.details.addObservation,
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
            <div className="space-y-8">
              <FixedAlert alertMessage={observationAlert} />

              {showObservationForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                      {t.locations.details.newObservation}
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
                  <form
                    onSubmit={handleSubmitObservation || ((e) => e.preventDefault())}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.locations.details.observation} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        disabled={isSubmittingObservation}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                        placeholder={
                          t.locations.details.observationPlaceholder ||
                          "Digite sua observação sobre esta localização..."
                        }
                        required
                      />
                    </div>

                    <FileUpload
                      label={t.locations.details.files}
                      files={observationFiles}
                      onChange={setObservationFiles}
                      disabled={isSubmittingObservation}
                      multiple={true}
                      helperText={
                        t.locations.details.filesHelper ||
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
                <Table<LocationObservation & Record<string, unknown>>
                  columns={columns}
                  data={paginatedObservations as (LocationObservation & Record<string, unknown>)[]}
                  header={{
                    title: t.locations.details.tabs.observations,
                    badge: {
                      label: `${filteredObservations.length} ${filteredObservations.length === 1 ? t.locations.details.observation : t.locations.details.tabs.observations}`,
                      variant: "primary",
                    },
                    description:
                      t.locations.details.observationsDescription ||
                      "Gerencie as observações desta localização",
                    actions: headerActions,
                  }}
                  search={{
                    placeholder: t.locations.details.searchObservations,
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
                    title: t.locations.details.noObservations,
                    description: (() => {
                      if (searchValue) {
                        if (typeof t.locations.details.noObservationsWithSearch === "function") {
                          return t.locations.details.noObservationsWithSearch(searchValue);
                        }
                        return (
                          t.locations.details.noObservationsWithSearch ||
                          `Nenhuma observação encontrada para "${searchValue}"`
                        );
                      }
                      return (
                        t.locations.details.noObservationsDescription ||
                        "Adicione sua primeira observação sobre esta localização."
                      );
                    })(),
                    onClearSearch: searchValue
                      ? () => {
                          setSearchValue("");
                          setCurrentPage(1);
                        }
                      : undefined,
                    clearSearchLabel: searchValue ? t.common.clearSearch : undefined,
                    onAddNew: () => setShowObservationForm(true),
                    addNewLabel: t.locations.details.addObservation,
                  }}
                  onRowClick={(row) =>
                    navigate(`${getObservationViewRoute(row.id)}?fromLocation=${location.id}`)
                  }
                />
              )}
            </div>
          );
        })()}

      {activeTab === "movements" &&
        location &&
        property &&
        (() => {
          const getLocationNameById = (id: string, locationsList: Location[]) => {
            const loc = locationsList.find((l) => l.id === id);
            return loc ? `${loc.name} (${loc.code})` : id;
          };

          const locationMovements = getLocationMovementsByLocationId(location.id);
          const animalMovements = getAnimalMovementsByLocationId(location.id);
          const inventoryMovements = getMovementsByLocationId(location.id).filter(
            (m) => m.type === InventoryMovementType.CONSUMPTION
          );

          const _movements: UnifiedMovement[] = [
            ...locationMovements.map((m) => ({ ...m, movementType: "location" as const })),
            ...animalMovements.map((m) => ({ ...m, movementType: "animal" as const })),
            ...inventoryMovements.map((m) => ({ ...m, movementType: "inventory" as const })),
          ];

          const totalPages = Math.ceil(filteredAndSortedMovements.length / itemsPerPage);
          const paginatedMovements = filteredAndSortedMovements.slice(
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
                } else if (row.movementType === "animal") {
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {t.properties.details.movements.types.animal_movement}
                    </span>
                  );
                } else {
                  const inventoryMovement = row as InventoryMovement;
                  const item = inventoryItemsMap.get(inventoryMovement.itemId);
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {item
                        ? `${item.code} - ${item.name}`
                        : t.inventory.movements.types.consumption || "Consumo"}
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
                if (row.movementType === "inventory") {
                  const inventoryMovement = row as InventoryMovement;
                  const loc = inventoryMovement.locationId
                    ? getLocationByIdSync(inventoryMovement.locationId)
                    : undefined;
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {loc ? `${loc.name} (${loc.code})` : "-"}
                    </span>
                  );
                }
                const locationIds =
                  row.movementType === "location"
                    ? (row as LocationMovement).locationIds
                    : [(row as AnimalMovement).locationId];
                const locationNames = locationIds
                  .map((id) => getLocationNameById(id, locations))
                  .join(", ");
                return (
                  <span className="text-gray-700 dark:text-gray-300">{locationNames || "-"}</span>
                );
              },
            },
            {
              key: "animals",
              label: t.inventory.movements.table.quantity || "Quantidade",
              sortable: false,
              render: (_, row) => {
                if (row.movementType === "animal") {
                  const count = (row as AnimalMovement).animalIds.length;
                  return <span className="text-gray-700 dark:text-gray-300">{count}</span>;
                }
                if (row.movementType === "inventory") {
                  const inventoryMovement = row as InventoryMovement;
                  const item = inventoryItemsMap.get(inventoryMovement.itemId);
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {item
                        ? `${inventoryMovement.quantity} ${getUnitLabel(item.unit, inventoryMovement.quantity, t)}`
                        : "-"}
                    </span>
                  );
                }
                return <span className="text-gray-400 dark:text-gray-500">-</span>;
              },
            },
            {
              key: "responsible",
              label: t.properties.details.movements.table.responsible,
              sortable: false,
              render: (_, row) => {
                let employeeNames: string[] = [];
                let providerNames: string[] = [];

                if (row.movementType === "inventory") {
                  const inventoryMovement = row as InventoryMovement;
                  employeeNames = getEmployeeNames(inventoryMovement.employeeIds, employees);
                  providerNames = getProviderNames(
                    inventoryMovement.serviceProviderIds,
                    serviceProviders
                  );
                } else {
                  employeeNames = getEmployeeNames(row.employeeIds, employees);
                  providerNames = getProviderNames(row.serviceProviderIds, serviceProviders);
                }

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
              label: t.properties.details.movements.observation,
              sortable: false,
              render: (_, row) => {
                const getObservation = (movement: typeof row): string | undefined => {
                  if (movement.movementType === "location") {
                    return (movement as LocationMovement).observation;
                  }
                  if (movement.movementType === "animal") {
                    return (movement as AnimalMovement).observation;
                  }
                  return (movement as InventoryMovement).description;
                };
                const observation = getObservation(row);
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
              label: t.properties.details.movements.files,
              sortable: false,
              render: (_, row) => {
                if (row.movementType === "inventory") {
                  return <span className="text-gray-400 dark:text-gray-500">-</span>;
                }
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

          return (
            <div className="space-y-8">
              <Table<UnifiedMovement>
                columns={columns}
                data={paginatedMovements}
                header={{
                  title: t.properties.details.movements.title,
                  badge: {
                    label: `${filteredAndSortedMovements.length} ${filteredAndSortedMovements.length === 1 ? t.properties.details.movements.movement : t.properties.details.movements.movements}`,
                    variant: "primary",
                  },
                  description: t.properties.details.movements.description,
                }}
                search={{
                  placeholder: t.properties.details.movements.searchPlaceholder,
                  value: searchValue,
                  onChange: (value) => {
                    setSearchValue(value);
                    setCurrentPage(1);
                  },
                }}
                belowContent={
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        navigate(`${getMovementNewRoute(property.id)}?locationId=${location.id}`)
                      }
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
                            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      }
                    >
                      {t.properties.details.movements.add}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(getLocationInventoryMovementNewRoute(location.id))}
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
                            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                          />
                        </svg>
                      }
                    >
                      Adicionar Consumo de Estoque
                    </Button>
                  </div>
                }
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
                  if (row.movementType === "inventory") {
                    const inventoryMovement = row as InventoryMovement;
                    navigate(getInventoryViewRoute(inventoryMovement.itemId));
                  } else {
                    navigate(`${getMovementViewRoute(row.id)}?fromLocation=${location.id}`);
                  }
                }}
              />
            </div>
          );
        })()}

      {activeTab === "costs" && location && (
        <LocationCostsContent
          locationId={location.id}
          costsStartDate={costsStartDate}
          costsEndDate={costsEndDate}
          onStartDateChange={setCostsStartDate}
          onEndDateChange={setCostsEndDate}
          t={t}
          language={language}
          dateLocale={dateLocale}
          localeForNumber={localeForNumber}
        />
      )}
    </div>
  );
}
