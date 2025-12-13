import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from "date-fns";
import {
  Button,
  StatusBadge,
  Table,
  type TableColumn,
  type SortDirection,
  type TableAction,
  FixedAlert,
  ConfirmationModal,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { useDateLocale } from "~/hooks/use-date-locale";
import {
  ROUTES,
  getAnimalEditRoute,
  getPropertyViewRoute,
  getAnimalViewRoute,
  getBreedingNewRoute,
  getSanitaryControlNewRoute,
  getSaleViewRoute,
  getLocationViewRoute,
} from "~/routes.config";
import { createViewMeta } from "~/utils/route-helpers";
import { getAnimalById, getAnimalsByCompanyId } from "~/services/animals.service";
import { getPropertyById, getProperties } from "~/services/properties.service";
import {
  getBirthByAnimalId,
  getCalvingIntervalsByAnimalId,
  getBirthsByCompanyId,
} from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getSanitaryControlsByAnimalId } from "~/services/sanitary-controls.service";
import { getInventoryItemById } from "~/services/inventory.service";
import { getEmployeeById, getEmployees } from "~/services/employees.service";
import { getServiceProviderById, getServiceProviders } from "~/services/service-providers.service";
import {
  getAnimalObservationsByAnimalId,
  addAnimalObservation,
} from "~/services/animal-observations.service";
import {
  getBreedingsByAnimalId,
  confirmBreeding,
  deleteBreeding,
} from "~/services/breedings.service";
import { getAnimalMovementsByAnimalId } from "~/services/animal-movements.service";
import { getLocationById, getLocations } from "~/services/locations.service";
import { getSalesByAnimalId } from "~/services/sales.service";
import { getBuyerById, getBuyers } from "~/services/buyers.service";
import { calculateAnimalProfitability } from "~/utils/profitability";
import type { Breeding, Birth, BirthPurity, Weighing } from "~/types";
import type { AnimalObservation } from "~/types/animal-observation";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { usePermissions } from "~/utils/permissions";
import { useObservationManagement } from "~/hooks/use-observation-management";
import { ObservationSection } from "~/components/dashboard/observations/observation-section";
import { getAnimalTotalCost } from "~/services/location-costs.service";
import {
  computeAnimalBasicData,
  computeWeighingData,
  computeAgeData,
  hasNoGenealogyData,
  getParentId,
} from "~/utils/animal-calculations";
import {
  calculateWeighingsWithCalculations,
  calculateGMDValue,
} from "~/utils/weighing-calculations";
import { getLocaleForDateTime, createCurrencyFormatter } from "~/utils/locale-helpers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "~/contexts/theme-context";
import { useAuth } from "~/contexts/auth-context";

type GenealogyNodeType = {
  animal: { id: string; code: string; registrationNumber: string };
  birth?: { purity?: BirthPurity; breed?: string; motherId?: string; fatherId?: string };
  mother?: GenealogyNodeType | null;
  father?: GenealogyNodeType | null;
  level: number;
};

function GenealogyTreeComponent({
  node,
  t,
  navigate,
}: {
  readonly node: GenealogyNodeType;
  readonly t: ReturnType<typeof useTranslation>;
  readonly navigate: (path: string) => void;
}) {
  const getAnimalViewRoute = (id: string) => `/dashboard/animais/${id}`;

  const renderNode = (node: GenealogyNodeType, isMother: boolean | null = null) => {
    if (!node) return null;

    const getLabel = () => {
      if (node.level === 0) return t.animals.details.currentAnimal;
      if (isMother === true) return t.animals.details.mother;
      if (isMother === false) return t.animals.details.father;
      return "";
    };
    const label = getLabel();

    const getBgColor = () => {
      if (node.level === 0) {
        return "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-700/50";
      }
      if (isMother === true) {
        return "bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10 border-pink-200 dark:border-pink-700/50";
      }
      return "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-700/50";
    };
    const bgColor = getBgColor();

    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          className={`
            relative px-3 py-2 rounded-lg border min-w-[140px] max-w-[160px] cursor-pointer 
            transition-all duration-200 hover:scale-105 hover:shadow-lg
            ${bgColor}
          `}
          onClick={() => navigate(getAnimalViewRoute(node.animal.id))}
        >
          <div className="text-center space-y-1">
            {label && (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                {label}
              </p>
            )}
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {node.animal.registrationNumber}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              {node.animal.code}
            </p>
            {node.birth?.purity && (
              <div className="mt-1.5 flex justify-center">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {t.animals.purity[node.birth.purity]}
                </span>
              </div>
            )}
            {node.birth?.breed && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {t.animals.breeds[node.birth.breed as keyof typeof t.animals.breeds]}
              </p>
            )}
          </div>
        </button>

        {(node.mother || node.father) && (
          <div className="mt-3 flex gap-6">
            {node.mother && (
              <div className="flex flex-col items-center">
                <div className="w-px h-3 bg-gradient-to-b from-pink-300 to-transparent dark:from-pink-600 dark:to-transparent"></div>
                {renderNode(node.mother, true)}
              </div>
            )}
            {node.father && (
              <div className="flex flex-col items-center">
                <div className="w-px h-3 bg-gradient-to-b from-green-300 to-transparent dark:from-green-600 dark:to-transparent"></div>
                {renderNode(node.father, false)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center py-4 w-full">
      <div className="flex flex-col items-center min-w-max">{renderNode(node)}</div>
    </div>
  );
}

export function meta() {
  return createViewMeta("Animal", "Visualização detalhada do animal");
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

function buildGenealogyTree(
  animalId: string,
  animalsMap: Map<string, { id: string; code: string; registrationNumber: string }>,
  birthsMap: Map<string, Birth>,
  level: number = 0,
  maxLevel: number = 4
): GenealogyNodeType | null {
  if (level > maxLevel) return null;

  const currentAnimal = animalsMap.get(animalId);
  if (!currentAnimal) return null;

  const currentBirth = birthsMap.get(animalId);
  const node: GenealogyNodeType = {
    animal: {
      id: currentAnimal.id,
      code: currentAnimal.code,
      registrationNumber: currentAnimal.registrationNumber,
    },
    birth: currentBirth
      ? {
          purity: currentBirth.purity,
          breed: currentBirth.breed,
          motherId: currentBirth.motherId,
          fatherId: currentBirth.fatherId,
        }
      : undefined,
    level,
  };

  if (currentBirth?.motherId) {
    node.mother = buildGenealogyTree(
      currentBirth.motherId,
      animalsMap,
      birthsMap,
      level + 1,
      maxLevel
    );
  }

  if (currentBirth?.fatherId) {
    node.father = buildGenealogyTree(
      currentBirth.fatherId,
      animalsMap,
      birthsMap,
      level + 1,
      maxLevel
    );
  }

  return node;
}

type WeighingWithCalculations = ReturnType<typeof calculateWeighingsWithCalculations>[0];

type SonWithAnimal = {
  birth: Birth;
  animal: { id: string; code: string; registrationNumber: string };
};

function sortSonsWithAnimals(
  sonsWithAnimals: SonWithAnimal[],
  sortState: { column: string | null; direction: SortDirection },
  localeForDateTime: string
): SonWithAnimal[] {
  const { column, direction } = sortState;
  if (!column) {
    return sonsWithAnimals.toSorted((a, b) => {
      const dateA = new Date(a.birth.birthDate).getTime();
      const dateB = new Date(b.birth.birthDate).getTime();
      return dateB - dateA;
    });
  }

  return sonsWithAnimals.toSorted((a, b) => {
    let comparison = 0;
    if (column === "code") {
      comparison = a.animal.code.localeCompare(b.animal.code, localeForDateTime);
    } else if (column === "registrationNumber") {
      comparison = a.animal.registrationNumber.localeCompare(
        b.animal.registrationNumber,
        localeForDateTime
      );
    } else if (column === "birthDate") {
      comparison = new Date(a.birth.birthDate).getTime() - new Date(b.birth.birthDate).getTime();
    } else if (column === "gender") {
      const genderA = a.birth.gender || "";
      const genderB = b.birth.gender || "";
      comparison = genderA.localeCompare(genderB, localeForDateTime);
    } else if (column === "purity") {
      const purityA = a.birth.purity || "";
      const purityB = b.birth.purity || "";
      comparison = purityA.localeCompare(purityB, localeForDateTime);
    } else if (column === "breed") {
      const breedA = a.birth.breed || "";
      const breedB = b.birth.breed || "";
      comparison = breedA.localeCompare(breedB, localeForDateTime);
    } else {
      return 0;
    }
    return direction === "asc" ? comparison : -comparison;
  });
}

function handleTabChangeForActivities(
  activeTab: AnimalTab,
  canAccessActivities: boolean,
  setActiveTab: (tab: AnimalTab | ((prev: AnimalTab) => AnimalTab)) => void
): void {
  if (activeTab === "activities" && !canAccessActivities) {
    setActiveTab((prev) => (prev === "dashboard" ? prev : "dashboard"));
  }
}

function handleTabChangeForBreeding(
  isMale: boolean,
  activeTab: AnimalTab,
  setActiveTab: (tab: AnimalTab | ((prev: AnimalTab) => AnimalTab)) => void
): void {
  if (isMale && activeTab === "breeding") {
    setActiveTab((prev) => (prev === "dashboard" ? prev : "dashboard"));
  }
}

type AnimalTab =
  | "dashboard"
  | "info"
  | "weighings"
  | "genealogy"
  | "activities"
  | "observations"
  | "breeding"
  | "sanitaryControl"
  | "costs"
  | "sales";

function renderTabButton(
  tab: AnimalTab,
  label: string,
  activeTab: AnimalTab,
  setActiveTab: (tab: AnimalTab) => void,
  isConditional?: boolean
) {
  if (isConditional === false) return null;

  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`
        py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
        ${
          activeTab === tab
            ? "dark:text-blue-400"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
        }
      `}
      style={
        activeTab === tab
          ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function renderParentGenealogy(
  parentId: string | undefined,
  animalsMap: Map<string, { id: string; code: string; registrationNumber: string }>,
  birthsMap: Map<string, Birth>,
  t: ReturnType<typeof useTranslation>,
  navigate: (path: string) => void,
  getAnimalViewRoute: (id: string) => string,
  bgColor: string
): React.JSX.Element | null {
  if (!parentId) return null;

  const parent = animalsMap.get(parentId);
  const parentBirth = birthsMap.get(parentId);

  if (!parent) {
    return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
  }

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${bgColor} cursor-pointer hover:opacity-80`}
        onClick={() => navigate(getAnimalViewRoute(parent.id))}
      >
        {parent.code} - {parent.registrationNumber}
      </button>
      {parentBirth?.purity && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t.animals.details.purity}:
          </span>
          <StatusBadge label={t.animals.purity[parentBirth.purity]} variant="default" />
          {parentBirth.breed && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({t.animals.breeds[parentBirth.breed]})
            </span>
          )}
        </div>
      )}
    </>
  );
}

function renderAcquisitionItemDetails(
  acquisition: Awaited<ReturnType<typeof getAcquisitionByAnimalId>> | null,
  animalId: string,
  localeForNumber: string,
  t: ReturnType<typeof useTranslation>
): React.JSX.Element | null {
  if (!acquisition) return null;

  const acquisitionItem = acquisition.acquisitionItems?.find((item) => item.animalId === animalId);

  if (!acquisitionItem) return null;

  return (
    <>
      <div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {t.animals.details.costs.acquisitionCost}
        </p>
        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
          {acquisitionItem.price.toLocaleString(localeForNumber, {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>
      {acquisitionItem.weight > 0 && (
        <>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {"Peso na Aquisição"}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {acquisitionItem.weight} kg
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {"Custo por Arroba"}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {acquisitionItem.costPerArroba.toLocaleString(localeForNumber, {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </>
      )}
    </>
  );
}

type ReproductiveStatsData = {
  sonsBirths: Birth[];
  breedings: Breeding[];
  birthsAsMother: Birth[];
  confirmedBreedings: Breeding[];
  pendingBreedings: Breeding[];
  averageCalvingInterval: number | null;
};

function renderReproductiveStats(
  isMale: boolean,
  data: ReproductiveStatsData,
  t: ReturnType<typeof useTranslation>
) {
  const {
    sonsBirths,
    breedings,
    birthsAsMother,
    confirmedBreedings,
    pendingBreedings,
    averageCalvingInterval,
  } = data;
  const hasReproductiveData =
    (!isMale && (birthsAsMother.length > 0 || breedings.length > 0)) ||
    (isMale && (sonsBirths.length > 0 || breedings.length > 0));

  if (!hasReproductiveData) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-12 bg-pink-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t.animals.details.dashboard.reproductiveStatistics}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isMale ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.totalOffspring}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {sonsBirths.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👨</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.totalBreedings}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {breedings.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🐂</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.totalBirths}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {birthsAsMother.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👶</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.confirmedBreedings}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {confirmedBreedings.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.pendingBreedings}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {pendingBreedings.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⏳</span>
                </div>
              </div>
            </div>
            {averageCalvingInterval !== null && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.dashboard.averageCalvingInterval}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {averageCalvingInterval} {t.animals.details.dashboard.days}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📅</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type AnimalDashboardTabProps = Readonly<{
  animal: NonNullable<Awaited<ReturnType<typeof getAnimalById>>>;
  currentWeight: number;
  weightInArrobas: string;
  gmd: number | null;
  age: number | null;
  birth: Birth | null;
  acquisitionItem: { birthDate?: string; gender?: string } | null;
  isMale: boolean;
  sonsBirths: Birth[];
  breedings: Breeding[];
  birthsAsMother: Birth[];
  confirmedBreedings: Breeding[];
  pendingBreedings: Breeding[];
  averageCalvingInterval: number | null;
  currentLocation: Awaited<ReturnType<typeof getLocationById>> | undefined;
  currentProperty: Awaited<ReturnType<typeof getPropertyById>> | undefined;
  animalMovements: ReturnType<typeof getAnimalMovementsByAnimalId>;
  locationsMap: Map<string, Awaited<ReturnType<typeof getLocationById>>>;
  daysInCurrentLocation: number | null;
  animalCostData: Awaited<ReturnType<typeof getAnimalTotalCost>> | null;
  totalCost: number;
  costPerKg: number;
  weighings: Weighing[];
  firstWeighing: Weighing | null;
  lastWeighing: Weighing | null;
  weightGainSinceFirst: number | null;
  averageWeightGainPerMonth: string | null;
  weightChartData: Array<{ date: string; weight: number }>;
  recentWeighings: Weighing[];
  recentBreedingsList: Breeding[];
  recentMovementsList: ReturnType<typeof getAnimalMovementsByAnimalId>;
  isDark: boolean;
  formatDate: (dateString: string | undefined) => string;
  formatRelativeTime: (dateString: string) => string;
  formatCurrency: (value: number) => string;
  navigate: (path: string) => void;
  t: ReturnType<typeof useTranslation>;
}>;

function AnimalDashboardTab({ animal, ...props }: AnimalDashboardTabProps) {
  const {
    currentWeight,
    weightInArrobas,
    gmd,
    age,
    birth,
    acquisitionItem,
    isMale,
    sonsBirths,
    breedings,
    birthsAsMother,
    confirmedBreedings,
    pendingBreedings,
    averageCalvingInterval,
    currentLocation,
    currentProperty,
    animalMovements,
    locationsMap,
    daysInCurrentLocation,
    animalCostData,
    totalCost,
    costPerKg,
    weighings,
    firstWeighing,
    lastWeighing,
    weightGainSinceFirst,
    averageWeightGainPerMonth,
    weightChartData,
    recentWeighings,
    recentBreedingsList,
    recentMovementsList,
    isDark,
    formatDate,
    formatRelativeTime,
    formatCurrency,
    navigate,
    t,
  } = props;
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.dashboard.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.table.weight}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {currentWeight > 0 ? `${currentWeight} kg` : "-"}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚖️</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.table.weightInArrobas}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {weightInArrobas} @
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.table.gmd}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {gmd ? `${gmd} kg/dia` : "-"}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.table.birthDate}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {(() => {
                    if (age === null) return "-";
                    const unit = age === 1 ? t.common.month : t.common.months;
                    return `${age} ${unit}`;
                  })()}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎂</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.animals.details.dashboard.additionalMetrics}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.table.status}
                </p>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  <StatusBadge
                    label={
                      animal.status === "active" ? t.animals.table.active : t.animals.table.inactive
                    }
                    variant={animal.status === "active" ? "success" : "default"}
                  />
                </div>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">✓</span>
              </div>
            </div>
          </div>

          {birth?.breed && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.breed}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {t.animals.breeds[birth.breed] || birth.breed}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🐄</span>
                </div>
              </div>
            </div>
          )}

          {(birth?.gender || acquisitionItem?.gender) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.gender}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {
                      t.animals.gender[
                        (birth?.gender || acquisitionItem?.gender) as "male" | "female"
                      ]
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">
                    {birth?.gender === "male" || acquisitionItem?.gender === "male" ? "♂" : "♀"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {birth?.purity && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.purity}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {t.animals.purity[birth.purity]}
                  </p>
                </div>
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {renderReproductiveStats(
        isMale,
        {
          sonsBirths,
          breedings,
          birthsAsMother,
          confirmedBreedings,
          pendingBreedings,
          averageCalvingInterval,
        },
        t
      )}

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.animals.details.dashboard.locationProperty}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.details.dashboard.currentLocation}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {currentLocation ? (
                    <button
                      onClick={() => navigate(getLocationViewRoute(currentLocation.id))}
                      className="hover:underline"
                    >
                      {currentLocation.name}
                    </button>
                  ) : (
                    t.animals.details.dashboard.noLocation
                  )}
                </p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📍</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.details.dashboard.currentProperty}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {currentProperty ? (
                    <button
                      onClick={() => navigate(getPropertyViewRoute(currentProperty.id))}
                      className="hover:underline"
                    >
                      {currentProperty.name}
                    </button>
                  ) : (
                    t.animals.details.dashboard.noProperty
                  )}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏡</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.animals.details.dashboard.totalMovements}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {animalMovements.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">🚚</span>
              </div>
            </div>
          </div>

          {daysInCurrentLocation !== null && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.daysInLocation}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {daysInCurrentLocation} {t.animals.details.dashboard.days}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📆</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {animalCostData && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.animals.details.dashboard.costInformation}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.costs.totalCost}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
              </div>
            </div>

            {currentWeight > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.dashboard.costPerKg}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatCurrency(costPerKg)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {weighings.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.animals.details.dashboard.weighingStatistics}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.dashboard.totalWeighings}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {weighings.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⚖️</span>
                </div>
              </div>
            </div>

            {firstWeighing && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.dashboard.firstWeighing}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(firstWeighing.date)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {firstWeighing.weight} kg
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📅</span>
                  </div>
                </div>
              </div>
            )}

            {lastWeighing && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.dashboard.lastWeighing}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(lastWeighing.date)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {lastWeighing.weight} kg
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📅</span>
                  </div>
                </div>
              </div>
            )}

            {weightGainSinceFirst !== null && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.dashboard.weightGain}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {weightGainSinceFirst > 0 ? "+" : ""}
                      {weightGainSinceFirst.toFixed(1)} kg
                    </p>
                    {averageWeightGainPerMonth && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {averageWeightGainPerMonth} kg/{t.common.month}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {weightChartData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-teal-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.animals.details.dashboard.weightTrend}
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
              <XAxis
                dataKey="date"
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
                label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={DASHBOARD_COLORS.primary}
                strokeWidth={2}
                dot={{ fill: DASHBOARD_COLORS.primary, r: 4 }}
                name={t.animals.table.weight}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-yellow-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.animals.details.dashboard.recentActivity}
          </h2>
        </div>
        <div className="space-y-3">
          {recentWeighings.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.animals.details.dashboard.recentWeighings}
              </h3>
              <div className="space-y-2">
                {recentWeighings.map((weighing) => (
                  <div
                    key={weighing.id}
                    className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm">⚖️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t.animals.details.weighing}: {weighing.weight} kg
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(weighing.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isMale && recentBreedingsList.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.animals.details.dashboard.recentBreedings}
              </h3>
              <div className="space-y-2">
                {recentBreedingsList.map((breeding) => (
                  <div
                    key={breeding.id}
                    className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm">💕</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t.animals.details.breeding.title}: {formatDate(breeding.date)}
                        <span className="ml-2">
                          {breeding.confirmed ? (
                            <StatusBadge
                              label={t.animals.details.breeding.table.confirmed}
                              variant="success"
                            />
                          ) : (
                            <StatusBadge
                              label={t.animals.details.breeding.table.unconfirmed}
                              variant="default"
                            />
                          )}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(breeding.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentMovementsList.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.animals.details.dashboard.recentMovements}
              </h3>
              <div className="space-y-2">
                {recentMovementsList.map((movement) => {
                  const location = locationsMap.get(movement.locationId);
                  return (
                    <div
                      key={movement.id}
                      className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm">🚚</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {location?.name || t.animals.details.dashboard.noLocation}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(movement.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {recentWeighings.length === 0 &&
            recentBreedingsList.length === 0 &&
            recentMovementsList.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.dashboard.recentActivities.noActivities}
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

export default function AnimalDetails() {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEdit, isMainUser } = usePermissions();
  const { currentUser } = useAuth();
  const [animal, setAnimal] = useState<Awaited<ReturnType<typeof getAnimalById>> | undefined>(
    undefined
  );
  const [birth, setBirth] = useState<Birth | undefined>(undefined);
  const [allAnimals, setAllAnimals] = useState<
    Array<{ id: string; code: string; registrationNumber: string }>
  >([]);
  const [allBirths, setAllBirths] = useState<Birth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!animalId || !currentUser?.companyId) return;
      setIsLoading(true);
      try {
        const [animalData, birthData, animalsData, birthsData] = await Promise.all([
          getAnimalById(animalId),
          getBirthByAnimalId(animalId),
          getAnimalsByCompanyId(currentUser.companyId),
          getBirthsByCompanyId(currentUser.companyId),
        ]);
        setAnimal(animalData);
        setBirth(birthData);
        setAllAnimals(animalsData || []);
        setAllBirths(birthsData || []);
      } catch (error) {
        console.error("Failed to load animal data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [animalId, currentUser?.companyId]);

  const animalsMap = useMemo(() => {
    const map = new Map<string, { id: string; code: string; registrationNumber: string }>();
    for (const a of allAnimals) {
      map.set(a.id, { id: a.id, code: a.code, registrationNumber: a.registrationNumber });
    }
    if (animal) {
      map.set(animal.id, {
        id: animal.id,
        code: animal.code,
        registrationNumber: animal.registrationNumber,
      });
    }
    return map;
  }, [allAnimals, animal]);

  const birthsMap = useMemo(() => {
    const map = new Map<string, Birth>();
    for (const b of allBirths) {
      map.set(b.animalId, b);
    }
    if (birth) {
      map.set(birth.animalId, birth);
    }
    return map;
  }, [allBirths, birth]);

  const getAnimalByIdLocal = useCallback(
    (id: string | undefined) => {
      if (!id) return undefined;
      return animalsMap.get(id) || animal;
    },
    [animalsMap, animal]
  );

  const _getBirthByAnimalIdLocal = (id: string | undefined) => {
    if (!id) return undefined;
    return birthsMap.get(id) || (id === animalId ? birth : undefined);
  };

  const getBirthsByFatherIdLocal = useCallback(
    (fatherId: string | undefined) => {
      if (!fatherId) return [];
      return allBirths.filter((b) => b.fatherId === fatherId);
    },
    [allBirths]
  );

  const dateLocale = useDateLocale();
  const localeForDateTime = useMemo(() => getLocaleForDateTime(language), [language]);
  const localeForNumber = localeForDateTime;
  const formatCurrency = useMemo(() => createCurrencyFormatter(localeForNumber), [localeForNumber]);

  const [animalBasicData, setAnimalBasicData] = useState<Awaited<
    ReturnType<typeof computeAnimalBasicData>
  > | null>(null);

  useEffect(() => {
    const loadAnimalBasicData = async () => {
      if (animal || birth) {
        const data = await computeAnimalBasicData(animal ?? null, birth);
        setAnimalBasicData(data);
      } else {
        setAnimalBasicData(null);
      }
    };
    loadAnimalBasicData();
  }, [animal, birth]);

  const {
    birth: computedBirth,
    acquisition,
    acquisitionItem,
    isMale,
  } = animalBasicData || {
    birth: null,
    acquisition: null,
    acquisitionItem: null,
    isMale: false,
  };
  // Use loaded birth if available, otherwise use computed birth
  const birthData = birth || computedBirth;
  const canAccessActivities = isMainUser();
  const [activeTab, setActiveTab] = useState<AnimalTab>(() => {
    // Initialize tab - avoid activities if user doesn't have permission
    return "dashboard";
  });

  useEffect(() => {
    handleTabChangeForActivities(activeTab, canAccessActivities, setActiveTab);
  }, [activeTab, canAccessActivities]);

  useEffect(() => {
    handleTabChangeForBreeding(isMale, activeTab, setActiveTab);
  }, [isMale, activeTab]);
  const [weighingsCurrentPage, setWeighingsCurrentPage] = useState(1);
  const [weighingsSortState, setWeighingsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const observationManagement = useObservationManagement<AnimalObservation>({
    entityId: animal?.id || "",
    fetchObservations: getAnimalObservationsByAnimalId,
    addObservation: (data) => addAnimalObservation({ animalId: animal!.id, ...data }),
    translationKeys: {
      observationRequired: t.animals.details.observationRequired,
      observationAdded: t.animals.details.observationAdded,
      observationError: t.animals.details.observationError,
    },
    generateFileIdPrefix: () => "file-animal-obs",
  });
  const [costsStartDate, setCostsStartDate] = useState<string>("");
  const [costsEndDate, setCostsEndDate] = useState<string>("");
  const [breedingsCurrentPage, setBreedingsCurrentPage] = useState(1);
  const [breedingsSortState, setBreedingsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [sanitaryControlsCurrentPage, setSanitaryControlsCurrentPage] = useState(1);
  const [sanitaryControlsSortState, setSanitaryControlsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [sonsSortState, setSonsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "birthDate", direction: "desc" });
  const [isConfirmBreedingModalOpen, setIsConfirmBreedingModalOpen] = useState(false);
  const [isDiscardBreedingModalOpen, setIsDiscardBreedingModalOpen] = useState(false);
  const [selectedBreeding, setSelectedBreeding] = useState<Breeding | null>(null);
  const [breedingAlert, setBreedingAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);
  const [breedingsKey, setBreedingsKey] = useState(0);
  const [employeesMap, setEmployeesMap] = useState<
    Map<string, Awaited<ReturnType<typeof getEmployeeById>>>
  >(new Map());
  const [serviceProvidersMap, setServiceProvidersMap] = useState<
    Map<string, Awaited<ReturnType<typeof getServiceProviderById>>>
  >(new Map());
  const [buyersMap, setBuyersMap] = useState<Map<string, Awaited<ReturnType<typeof getBuyerById>>>>(
    new Map()
  );
  const [locationsMap, setLocationsMap] = useState<
    Map<string, Awaited<ReturnType<typeof getLocationById>>>
  >(new Map());
  const [propertiesMap, setPropertiesMap] = useState<
    Map<string, Awaited<ReturnType<typeof getPropertyById>>>
  >(new Map());
  const [salesProfitability, setSalesProfitability] = useState<
    Map<string, Awaited<ReturnType<typeof calculateAnimalProfitability>>>
  >(new Map());
  const [animalSales, setAnimalSales] = useState<Awaited<ReturnType<typeof getSalesByAnimalId>>>(
    []
  );
  const itemsPerPage = 10;

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const [employeesData, serviceProvidersData, buyersData, locationsData, propertiesData] =
          await Promise.all([
            getEmployees(),
            getServiceProviders(),
            getBuyers(),
            getLocations(),
            getProperties(),
          ]);
        setEmployeesMap(new Map(employeesData.map((e) => [e.id, e])));
        setServiceProvidersMap(new Map(serviceProvidersData.map((sp) => [sp.id, sp])));
        setBuyersMap(new Map(buyersData.map((b) => [b.id, b])));
        setLocationsMap(new Map(locationsData.map((l) => [l.id, l])));
        setPropertiesMap(new Map(propertiesData.map((p) => [p.id, p])));
      } catch (error) {
        console.error("Failed to load entities:", error);
      }
    };
    loadEntities();
  }, []);

  const calculateSaleProfitability = async (
    sale: Awaited<ReturnType<typeof getSalesByAnimalId>>[0],
    animalId: string
  ) => {
    const saleItem = sale.saleItems.find((item) => item.animalId === animalId);
    if (!saleItem) return null;
    try {
      const profitability = await calculateAnimalProfitability(
        animalId,
        saleItem.price,
        sale.saleDate,
        saleItem.weight
      );
      return { saleId: sale.id, profitability };
    } catch (error) {
      console.error("Failed to calculate profitability:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadProfitability = async () => {
      if (!animal) return;
      const salesData = await getSalesByAnimalId(animal.id);
      setAnimalSales(salesData);

      const profitabilityPromises = salesData.map((sale) =>
        calculateSaleProfitability(sale, animal.id)
      );
      const results = await Promise.all(profitabilityPromises);
      const profitabilityMap = new Map(
        results
          .filter(
            (
              r
            ): r is {
              saleId: string;
              profitability: Awaited<ReturnType<typeof calculateAnimalProfitability>>;
            } => r !== null
          )
          .map((r) => [r.saleId, r.profitability])
      );
      setSalesProfitability(profitabilityMap);
    };
    loadProfitability();
  }, [animal]);

  const [breedings, setBreedings] = useState<Breeding[]>([]);

  useEffect(() => {
    const loadBreedings = async () => {
      if (animal) {
        const breedingsData = await getBreedingsByAnimalId(animal.id);
        setBreedings(breedingsData);
      } else {
        setBreedings([]);
      }
    };
    loadBreedings();
  }, [animal]);

  const [sanitaryControls, setSanitaryControls] = useState<
    import("~/types/sanitary-control").SanitaryControl[]
  >([]);
  const [inventoryItemsMap, setInventoryItemsMap] = useState<
    Map<string, Awaited<ReturnType<typeof getInventoryItemById>>>
  >(new Map());

  useEffect(() => {
    const loadSanitaryControls = async () => {
      if (animal) {
        const sanitaryControlsData = await getSanitaryControlsByAnimalId(animal.id);
        setSanitaryControls(sanitaryControlsData);

        // Pre-load inventory items for sanitary controls
        const itemIds = new Set<string>();
        for (const control of sanitaryControlsData) {
          for (const applied of control.appliedMedicines || []) {
            itemIds.add(applied.itemId);
          }
        }
        const itemsMap = new Map<string, Awaited<ReturnType<typeof getInventoryItemById>>>();
        await Promise.all(
          Array.from(itemIds).map(async (itemId) => {
            try {
              const item = await getInventoryItemById(itemId);
              if (item) {
                itemsMap.set(itemId, item);
              }
            } catch (error) {
              console.error(`Failed to load inventory item ${itemId}:`, error);
            }
          })
        );
        setInventoryItemsMap(itemsMap);
      } else {
        setSanitaryControls([]);
        setInventoryItemsMap(new Map());
      }
    };
    loadSanitaryControls();
  }, [animal]);

  const [weighings, setWeighings] = useState<Weighing[]>([]);

  useEffect(() => {
    const loadWeighings = async () => {
      if (animal) {
        const weighingsData = await getWeighingsByAnimalId(animal.id);
        setWeighings(weighingsData);
      } else {
        setWeighings([]);
      }
    };
    loadWeighings();
  }, [animal]);

  const weighingsWithCalculations = useMemo(() => {
    return calculateWeighingsWithCalculations(weighings);
  }, [weighings]);

  const weighingData = useMemo(() => computeWeighingData(weighings), [weighings]);
  const { sortedWeighings, lastWeighing, firstWeighing, currentWeight, weightInArrobas } =
    weighingData;

  const calculateGMD = useMemo(() => {
    return calculateGMDValue(sortedWeighings);
  }, [sortedWeighings]);

  const age = useMemo(
    () => computeAgeData(birth ?? null, acquisitionItem),
    [birth, acquisitionItem]
  );
  const gmd = calculateGMD ? Number.parseFloat(calculateGMD) : null;

  const sonsBirths = useMemo(() => {
    if (!animal) return [];
    return getBirthsByFatherIdLocal(animal.id);
  }, [animal, getBirthsByFatherIdLocal]);

  const sonsWithAnimals: SonWithAnimal[] = useMemo(() => {
    if (!sonsBirths || sonsBirths.length === 0) return [];
    const mapped = sonsBirths
      .map((birth): SonWithAnimal | null => {
        const sonAnimal = getAnimalByIdLocal(birth.animalId);
        if (!sonAnimal) return null;
        // Normalize to simplified type - both types have these properties
        const animalData: { id: string; code: string; registrationNumber: string } = {
          id: sonAnimal.id,
          code: sonAnimal.code,
          registrationNumber: sonAnimal.registrationNumber,
        };
        return { birth, animal: animalData };
      })
      .filter((item): item is SonWithAnimal => item !== null);

    return sortSonsWithAnimals(mapped, sonsSortState, localeForDateTime);
  }, [sonsBirths, sonsSortState, localeForDateTime, getAnimalByIdLocal]);

  const _companyId = currentUser?.companyId || "";
  const _allCompanyBirths = allBirths;
  const birthsAsMother = useMemo(
    () => (animal ? allBirths.filter((b) => b.motherId === animal.id) : []),
    [animal, allBirths]
  );
  const confirmedBreedings = useMemo(
    () => breedings.filter((b) => b.confirmed === true),
    [breedings]
  );
  const pendingBreedings = useMemo(
    () => breedings.filter((b) => b.confirmed === false),
    [breedings]
  );
  const [calvingIntervals, setCalvingIntervals] = useState<number[]>([]);

  useEffect(() => {
    const loadCalvingIntervals = async () => {
      if (!animal) {
        setCalvingIntervals([]);
        return;
      }
      try {
        const intervals = await getCalvingIntervalsByAnimalId(animal.id);
        setCalvingIntervals(intervals || []);
      } catch (error) {
        console.error("Failed to load calving intervals:", error);
        setCalvingIntervals([]);
      }
    };
    loadCalvingIntervals();
  }, [animal]);

  const averageCalvingInterval =
    calvingIntervals.length > 0
      ? Math.round(calvingIntervals.reduce((a, b) => a + b, 0) / calvingIntervals.length)
      : null;

  const animalMovements = useMemo(
    () => (animal ? getAnimalMovementsByAnimalId(animal.id) : []),
    [animal]
  );
  const sortedMovements = useMemo(
    () =>
      animalMovements.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [animalMovements]
  );
  const currentMovement = sortedMovements[0];
  const [currentLocation, setCurrentLocation] = useState<Awaited<
    ReturnType<typeof getLocationById>
  > | null>(null);
  const [currentProperty, setCurrentProperty] = useState<Awaited<
    ReturnType<typeof getPropertyById>
  > | null>(null);

  useEffect(() => {
    const loadLocationAndProperty = async () => {
      if (currentMovement) {
        try {
          const location = await getLocationById(currentMovement.locationId);
          setCurrentLocation(location);
          const property = await getPropertyById(location.propertyId);
          setCurrentProperty(property);
        } catch (error) {
          console.error("Failed to load location:", error);
          setCurrentLocation(null);
          setCurrentProperty(null);
        }
      } else if (animal?.propertyId) {
        try {
          const property = await getPropertyById(animal.propertyId);
          setCurrentProperty(property);
          setCurrentLocation(null);
        } catch (error) {
          console.error("Failed to load property:", error);
          setCurrentProperty(null);
        }
      } else {
        setCurrentLocation(null);
        setCurrentProperty(null);
      }
    };
    loadLocationAndProperty();
  }, [currentMovement, animal?.propertyId]);
  const daysInCurrentLocation = useMemo(() => {
    if (!currentMovement) return null;
    const today = new Date();
    const movementDate = new Date(currentMovement.date);
    return differenceInDays(today, movementDate);
  }, [currentMovement]);

  const [animalCostData, setAnimalCostData] = useState<Awaited<
    ReturnType<typeof getAnimalTotalCost>
  > | null>(null);

  useEffect(() => {
    const loadCostData = async () => {
      if (!animal) {
        setAnimalCostData(null);
        return;
      }
      try {
        const costData = await getAnimalTotalCost(
          animal.id,
          costsStartDate || undefined,
          costsEndDate || undefined
        );
        setAnimalCostData(costData);
      } catch (error) {
        console.error("Failed to load animal cost data:", error);
        setAnimalCostData(null);
      }
    };
    loadCostData();
  }, [animal, costsStartDate, costsEndDate]);
  const totalCost = animalCostData?.totalCost || 0;
  const costPerKg = currentWeight > 0 ? totalCost / currentWeight : 0;

  const weightGainSinceFirst =
    firstWeighing && currentWeight > 0 ? currentWeight - firstWeighing.weight : null;
  const averageWeightGainPerMonth = useMemo(() => {
    if (!firstWeighing || !lastWeighing || weightGainSinceFirst === null) return null;
    const firstDate = new Date(firstWeighing.date);
    const lastDate = new Date(lastWeighing.date);
    const monthsDiff = differenceInMonths(lastDate, firstDate);
    return monthsDiff > 0 ? (weightGainSinceFirst / monthsDiff).toFixed(2) : null;
  }, [firstWeighing, lastWeighing, weightGainSinceFirst]);

  const weightChartData = useMemo(() => {
    return sortedWeighings
      .slice()
      .reverse()
      .map((weighing) => ({
        date: format(new Date(weighing.date), "dd/MM", { locale: dateLocale }),
        weight: weighing.weight,
      }));
  }, [sortedWeighings, dateLocale]);

  const formatDate = useMemo(() => {
    return (dateString: string | undefined) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
      return format(date, dateFormat, { locale: dateLocale });
    };
  }, [language, dateLocale]);

  const genealogyTree = useMemo(() => {
    if (!animal) return null;
    return buildGenealogyTree(animal.id, animalsMap, birthsMap);
  }, [animal, animalsMap, birthsMap]);

  const formatRelativeTime = useMemo(() => {
    return (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const minutes = differenceInMinutes(now, date);

      if (minutes < 1) {
        return t.dashboard.recentActivities.justNow;
      }
      if (minutes < 60) {
        return t.dashboard.recentActivities.minutesAgo(minutes);
      }

      const hours = differenceInHours(now, date);
      if (hours < 24) {
        return t.dashboard.recentActivities.hoursAgo(hours);
      }

      const days = differenceInDays(now, date);
      if (days === 1) {
        return t.dashboard.recentActivities.yesterday;
      }
      if (days < 7) {
        return t.dashboard.recentActivities.daysAgo(days);
      }

      return format(date, "dd/MM/yyyy", { locale: dateLocale });
    };
  }, [t, dateLocale]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading || "Carregando..."}</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.animals.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const recentWeighings = sortedWeighings.slice(0, 5);
  const recentBreedingsList = breedings.slice(0, 5);
  const recentMovementsList = sortedMovements.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {animal.registrationNumber}
            </h1>
            <StatusBadge
              label={animal.status === "active" ? t.animals.table.active : t.animals.table.inactive}
              variant={animal.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{animal.code}</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit("registration", "animals") && (
            <Button
              variant="outline"
              onClick={() => navigate(getAnimalEditRoute(animal.id))}
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
            onClick={() => navigate(ROUTES.ANIMALS)}
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
          {renderTabButton("dashboard", t.dashboard.title, activeTab, setActiveTab)}
          {renderTabButton("info", t.animals.details.tabs.info, activeTab, setActiveTab)}
          {renderTabButton("weighings", t.animals.details.tabs.weighings, activeTab, setActiveTab)}
          {renderTabButton(
            "breeding",
            t.animals.details.tabs.breeding,
            activeTab,
            setActiveTab,
            !isMale
          )}
          {renderTabButton("genealogy", t.animals.details.tabs.genealogy, activeTab, setActiveTab)}
          {renderTabButton(
            "observations",
            t.animals.details.tabs.observations,
            activeTab,
            setActiveTab
          )}
          {renderTabButton(
            "sanitaryControl",
            t.animals.details.tabs.sanitaryControl,
            activeTab,
            setActiveTab
          )}
          {renderTabButton("costs", t.animals.details.costs?.title || "", activeTab, setActiveTab)}
          {renderTabButton("sales", t.animals.details.tabs.sales, activeTab, setActiveTab)}
          {renderTabButton(
            "activities",
            t.animals.details.tabs.activities,
            activeTab,
            setActiveTab,
            isMainUser()
          )}
        </nav>
      </div>

      {activeTab === "dashboard" && (
        <AnimalDashboardTab
          animal={animal}
          currentWeight={currentWeight}
          weightInArrobas={weightInArrobas}
          gmd={gmd}
          age={age}
          birth={birth ?? null}
          acquisitionItem={acquisitionItem}
          isMale={isMale}
          sonsBirths={sonsBirths}
          breedings={breedings}
          birthsAsMother={birthsAsMother}
          confirmedBreedings={confirmedBreedings}
          pendingBreedings={pendingBreedings}
          averageCalvingInterval={averageCalvingInterval}
          currentLocation={currentLocation ?? undefined}
          currentProperty={currentProperty ?? undefined}
          animalMovements={animalMovements}
          locationsMap={locationsMap}
          daysInCurrentLocation={daysInCurrentLocation}
          animalCostData={animalCostData}
          totalCost={totalCost}
          costPerKg={costPerKg}
          weighings={weighings}
          firstWeighing={firstWeighing ?? null}
          lastWeighing={lastWeighing ?? null}
          weightGainSinceFirst={weightGainSinceFirst}
          averageWeightGainPerMonth={averageWeightGainPerMonth}
          weightChartData={weightChartData}
          recentWeighings={recentWeighings}
          recentBreedingsList={recentBreedingsList}
          recentMovementsList={recentMovementsList}
          isDark={isDark}
          formatDate={formatDate}
          formatRelativeTime={formatRelativeTime}
          formatCurrency={formatCurrency}
          navigate={navigate}
          t={t}
        />
      )}

      {activeTab === "info" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.animals.details.animalInfo}
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{animal.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.registration}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {animal.registrationNumber}
                  </p>
                </div>
                {birth?.breed && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.breed}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {t.animals.breeds[birth.breed] || birth.breed}
                    </p>
                  </div>
                )}
                {birth?.gender && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.gender}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {t.animals.gender[birth.gender]}
                    </p>
                  </div>
                )}
                {birth?.purity && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.purity}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {t.animals.purity[birth.purity]}
                    </p>
                  </div>
                )}
                {birth?.birthDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.birthDate}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(birth.birthDate)}
                    </p>
                  </div>
                )}
                {animal.acquisitionDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.acquisitionDate}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(animal.acquisitionDate)}
                    </p>
                  </div>
                )}
                {renderAcquisitionItemDetails(acquisition, animal.id, localeForNumber, t)}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {animal.propertyId ? (
                      (() => {
                        const property = propertiesMap.get(animal.propertyId);
                        return property ? (
                          <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(getPropertyViewRoute(animal.propertyId))}
                          >
                            {property.name}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        );
                      })()
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(animal.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.animals.details.genealogy}
                </h2>
              </div>
              <div className="space-y-4">
                {birth?.purity && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {t.animals.details.purity}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={t.animals.purity[birth.purity]} variant="default" />
                      {birth.breed && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({t.animals.breeds[birth.breed]})
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {getParentId(birth ?? null, acquisitionItem, "mother") && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.animals.details.mother}
                    </p>
                    <div className="mt-1 space-y-1">
                      {renderParentGenealogy(
                        getParentId(birthData ?? null, acquisitionItem, "mother"),
                        animalsMap,
                        birthsMap,
                        t,
                        navigate,
                        getAnimalViewRoute,
                        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50"
                      )}
                    </div>
                  </div>
                )}
                {getParentId(birthData ?? null, acquisitionItem, "father") && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {t.animals.details.father}
                    </p>
                    <div className="mt-1 space-y-1">
                      {renderParentGenealogy(
                        getParentId(birthData ?? null, acquisitionItem, "father"),
                        animalsMap,
                        birthsMap,
                        t,
                        navigate,
                        getAnimalViewRoute,
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      )}
                    </div>
                  </div>
                )}
                {hasNoGenealogyData(birthData ?? null, acquisitionItem) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.animals.details.noGenealogy}
                  </p>
                )}
                {birthData?.observation && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.details.observation}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {birthData.observation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "weighings" &&
        weighings.length > 0 &&
        (() => {
          const sortedWeighingsForTable = weighingsWithCalculations.toSorted((a, b) => {
            const { column, direction } = weighingsSortState;

            if (!column) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            let comparison = 0;
            if (column === "date") {
              comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (column === "weight") {
              comparison = a.weight - b.weight;
            } else if (column === "weightDiff") {
              comparison = (a.weightDiff ?? 0) - (b.weightDiff ?? 0);
            } else if (column === "periodGMD") {
              comparison =
                Number.parseFloat(a.periodGMD ?? "0") - Number.parseFloat(b.periodGMD ?? "0");
            } else {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            return direction === "asc" ? comparison : -comparison;
          });

          const filteredWeighings = sortedWeighingsForTable.filter((w) => w?.id !== undefined);
          const totalPages = Math.ceil(filteredWeighings.length / itemsPerPage);
          const startIndex = (weighingsCurrentPage - 1) * itemsPerPage;
          const paginatedWeighings = filteredWeighings.slice(startIndex, startIndex + itemsPerPage);

          const columns: TableColumn<WeighingWithCalculations>[] = [
            {
              key: "date",
              label: t.animals.details.date,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(weighing.date)}
                  </span>
                );
              },
            },
            {
              key: "weight",
              label: t.animals.table.weight,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {weighing.weight} kg
                  </span>
                );
              },
            },
            {
              key: "weightDiff",
              label: t.animals.details.variation,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                const weightDiff = weighing.weightDiff;
                if (weightDiff === null || weightDiff === undefined || Number.isNaN(weightDiff)) {
                  return <span className="text-sm text-gray-400">-</span>;
                }
                return (
                  <span
                    className={`text-sm font-medium ${
                      weightDiff >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {weightDiff >= 0 ? "+" : ""}
                    {weightDiff.toFixed(1)} kg
                  </span>
                );
              },
            },
            {
              key: "periodGMD",
              label: t.animals.table.gmd,
              sortable: true,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                const periodGMD = weighing.periodGMD;
                if (!periodGMD || periodGMD === null || periodGMD === undefined) {
                  return <span className="text-sm text-gray-400">-</span>;
                }
                return (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {periodGMD} kg/dia
                  </span>
                );
              },
            },
            {
              key: "observation",
              label: t.animals.details.observation,
              sortable: false,
              render: (_value, weighing) => {
                if (!weighing) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {weighing.observation || "-"}
                  </span>
                );
              },
            },
          ];

          return (
            <div className="space-y-8">
              <Table<WeighingWithCalculations>
                columns={columns}
                data={paginatedWeighings}
                header={{
                  title: t.animals.details.weighingHistory,
                  badge: {
                    label: t.animals.details.weighings(filteredWeighings.length),
                    variant: "primary",
                  },
                }}
                pagination={{
                  currentPage: weighingsCurrentPage,
                  totalPages: totalPages || 1,
                  onPageChange: setWeighingsCurrentPage,
                  showInfo: false,
                }}
                sortState={weighingsSortState}
                onSort={(column, direction) => {
                  setWeighingsSortState({ column, direction });
                  setWeighingsCurrentPage(1);
                }}
                emptyState={{
                  title: t.animals.details.noWeighings,
                  description: "",
                }}
              />
            </div>
          );
        })()}

      {activeTab === "weighings" && weighings.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.animals.details.noWeighings}
          </p>
        </div>
      )}

      {activeTab === "genealogy" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t.animals.details.genealogy}
              </h2>
              {birth?.purity && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t.animals.details.purity}:
                  </span>
                  <StatusBadge label={t.animals.purity[birth.purity]} variant="default" />
                  {birth.breed && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {t.animals.breeds[birth.breed]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {genealogyTree ? (
              <div className="w-full overflow-x-auto overflow-y-visible">
                <div className="min-w-max pb-4">
                  <GenealogyTreeComponent node={genealogyTree} t={t} navigate={navigate} />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.animals.details.noGenealogy}
                </p>
              </div>
            )}
          </div>

          {sonsWithAnimals.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.animals.details.sons}
              </h2>
              <Table<SonWithAnimal>
                columns={[
                  {
                    key: "code",
                    label: t.animals.table.code,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {row.animal.code}
                      </span>
                    ),
                  },
                  {
                    key: "registrationNumber",
                    label: t.animals.table.registration,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {row.animal.registrationNumber}
                      </span>
                    ),
                  },
                  {
                    key: "birthDate",
                    label: t.animals.table.birthDate,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(row.birth.birthDate)}
                      </span>
                    ),
                  },
                  {
                    key: "gender",
                    label: t.animals.table.gender,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {row.birth.gender ? t.animals.gender[row.birth.gender] : "-"}
                      </span>
                    ),
                  },
                  {
                    key: "purity",
                    label: t.animals.table.purity,
                    sortable: true,
                    render: (_value, row) => (
                      <div>
                        {row.birth.purity ? (
                          <StatusBadge
                            label={t.animals.purity[row.birth.purity]}
                            variant="default"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "breed",
                    label: t.animals.table.breed,
                    sortable: true,
                    render: (_value, row) => (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {row.birth.breed
                          ? t.animals.breeds[row.birth.breed as keyof typeof t.animals.breeds] ||
                            row.birth.breed
                          : "-"}
                      </span>
                    ),
                  },
                ]}
                data={sonsWithAnimals}
                header={{
                  title: t.animals.details.sons,
                  badge: {
                    label: `${sonsWithAnimals.length} ${sonsWithAnimals.length === 1 ? t.animals.details.son : t.animals.details.sonsPlural}`,
                    variant: "primary",
                  },
                }}
                sortState={sonsSortState}
                onSort={(column, direction) => {
                  setSonsSortState({ column, direction });
                }}
                onRowClick={(row) => navigate(getAnimalViewRoute(row.animal.id))}
                emptyState={{
                  title: t.animals.details.noSons,
                  description: t.animals.details.noSonsDescription,
                }}
              />
            </div>
          )}
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
                  {t.animals.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(animal.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {animal.status === "active"
                    ? t.animals.details.activityActivated
                    : t.animals.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.animals.details.statusLabel}:{" "}
                  {animal.status === "active" ? t.animals.table.active : t.animals.table.inactive}
                </p>
              </div>
            </div>
            {birth && (
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm">🐄</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {t.animals.details.birthRegistered}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(birth.birthDate)}
                  </p>
                </div>
              </div>
            )}
            {acquisition && (
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {t.animals.details.acquisitionRegistered}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(acquisition.acquisitionDate)}
                  </p>
                </div>
              </div>
            )}
            {sortedWeighings.slice(0, 5).map((weighing) => (
              <div
                key={weighing.id}
                className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm">⚖️</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {t.animals.details.weighing}: {weighing.weight} kg
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(weighing.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "observations" && animal && (
        <ObservationSection<AnimalObservation>
          observations={observationManagement.observations}
          title={t.animals.details.tabs.observations}
          description={
            t.animals.details.observationsDescription || "Gerencie as observações deste animal"
          }
          searchPlaceholder={t.animals.details.searchObservations}
          emptyStateTitle={t.animals.details.noObservations}
          emptyStateDescription={
            t.animals.details.noObservationsDescription ||
            "Adicione sua primeira observação sobre este animal."
          }
          emptyStateDescriptionWithSearch={
            typeof t.animals.details.noObservationsWithSearch === "function"
              ? t.animals.details.noObservationsWithSearch
              : t.animals.details.noObservationsWithSearch ||
                ((searchValue: string) => `Nenhuma observação encontrada para "${searchValue}"`)
          }
          translationKeys={{
            observationDate: t.animals.details.observationDate,
            observation: t.animals.details.observation,
            files: t.animals.details.files,
            addObservation: t.animals.details.addObservation,
            newObservation: t.animals.details.newObservation,
            observationPlaceholder: t.animals.details.observationPlaceholder,
            filesHelper: t.animals.details.filesHelper,
            cancel: t.common.cancel,
            save: t.common.save,
            observationRequired: t.animals.details.observationRequired,
            observationAdded: t.animals.details.observationAdded,
            observationError: t.animals.details.observationError,
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
          entityId={animal.id}
          entityType="Animal"
        />
      )}

      {activeTab === "breeding" &&
        animal &&
        !isMale &&
        (() => {
          const handleConfirmBreeding = (breeding: Breeding) => {
            setSelectedBreeding(breeding);
            setIsConfirmBreedingModalOpen(true);
          };

          const handleConfirmBreedingSubmit = async () => {
            if (!selectedBreeding) return;
            try {
              const success = await confirmBreeding(selectedBreeding.id);
              if (success) {
                setBreedingsKey((prev) => prev + 1);
                setBreedingAlert({
                  title: t.animals.details.breeding.confirmSuccess,
                  variant: "success",
                });
                setTimeout(() => setBreedingAlert(null), 3000);
              } else {
                setBreedingAlert({
                  title:
                    t.animals.details.breeding.confirmError ||
                    "Erro ao confirmar cobertura. Tente novamente.",
                  variant: "error",
                });
                setTimeout(() => setBreedingAlert(null), 3000);
              }
            } catch (error) {
              console.error("Error confirming breeding:", error);
              setBreedingAlert({
                title:
                  t.animals.details.breeding.confirmError ||
                  "Erro ao confirmar cobertura. Tente novamente.",
                variant: "error",
              });
              setTimeout(() => setBreedingAlert(null), 3000);
            }
            setIsConfirmBreedingModalOpen(false);
            setSelectedBreeding(null);
          };

          const handleDiscardBreeding = (breeding: Breeding) => {
            setSelectedBreeding(breeding);
            setIsDiscardBreedingModalOpen(true);
          };

          const handleDiscardBreedingSubmit = async () => {
            if (!selectedBreeding) return;
            try {
              await deleteBreeding(selectedBreeding.id);
              setBreedingsKey((prev) => prev + 1);
              setBreedingAlert({
                title: t.animals.details.breeding.discardSuccess,
                variant: "success",
              });
              setTimeout(() => setBreedingAlert(null), 3000);
            } catch (error) {
              console.error("Error deleting breeding:", error);
              setBreedingAlert({
                title: t.animals.details.breeding.discardError || "Erro ao descartar cobertura.",
                variant: "error",
              });
              setTimeout(() => setBreedingAlert(null), 3000);
            }
            setIsDiscardBreedingModalOpen(false);
            setSelectedBreeding(null);
          };

          const hasAnyBreeding = breedings.length > 0;

          type BreedingSortValue = string | number | boolean | undefined;

          const getBreedingSortValue = (breeding: Breeding, column: string): BreedingSortValue => {
            if (column === "date") {
              return new Date(breeding.date).getTime();
            }
            if (column === "method") {
              return breeding.method;
            }
            if (column === "confirmed") {
              return breeding.confirmed ? 1 : 0;
            }
            return breeding[column as keyof Breeding] as BreedingSortValue;
          };

          const compareBreedingValues = (
            aValue: BreedingSortValue,
            bValue: BreedingSortValue
          ): number => {
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (typeof aValue === "string" && typeof bValue === "string") {
              return aValue.localeCompare(bValue, "pt-BR", { sensitivity: "base" });
            }
            if (typeof aValue === "number" && typeof bValue === "number") {
              return aValue - bValue;
            }
            return String(aValue).localeCompare(String(bValue), "pt-BR");
          };

          const sortedBreedings = breedings.toSorted((a, b) => {
            if (!breedingsSortState.column || !breedingsSortState.direction) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            const aValue = getBreedingSortValue(a, breedingsSortState.column);
            const bValue = getBreedingSortValue(b, breedingsSortState.column);
            const comparison = compareBreedingValues(aValue, bValue);

            return breedingsSortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedBreedings.length / itemsPerPage);
          const paginatedBreedings = sortedBreedings.slice(
            (breedingsCurrentPage - 1) * itemsPerPage,
            breedingsCurrentPage * itemsPerPage
          );

          const columns: TableColumn<Breeding>[] = [
            {
              key: "date",
              label: t.animals.details.breeding.table.date,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
              ),
            },
            {
              key: "method",
              label: t.animals.details.breeding.table.method,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.method === "natural"
                    ? t.breedings.new.methodNatural
                    : t.breedings.new.methodAI}
                </span>
              ),
            },
            {
              key: "confirmed",
              label: t.animals.details.breeding.table.status,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={
                    row.confirmed
                      ? t.animals.details.breeding.table.confirmed
                      : t.animals.details.breeding.table.unconfirmed
                  }
                  variant={row.confirmed ? "success" : "warning"}
                />
              ),
            },
            {
              key: "daysSince",
              label: t.animals.details.breeding.table.daysSince,
              sortable: false,
              render: (_, row) => {
                const breedingDate = new Date(row.date);
                const today = new Date();
                const days = differenceInDays(today, breedingDate);
                const expectedBirthDate = new Date(breedingDate);
                expectedBirthDate.setDate(expectedBirthDate.getDate() + 270);
                const daysUntilBirth = differenceInDays(expectedBirthDate, today);

                return (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {days}{" "}
                      {days === 1
                        ? t.animals.details.breeding.table.day
                        : t.animals.details.breeding.table.days}
                    </span>
                    {row.confirmed && daysUntilBirth > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.animals.details.breeding.table.expectedBirth}:{" "}
                        {formatDate(expectedBirthDate.toISOString())}
                      </p>
                    )}
                  </div>
                );
              },
            },
            {
              key: "actions",
              label: "",
              sortable: false,
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const state: { motherId: string; fatherId?: string } = {
                        motherId: animal.id,
                      };
                      if (row.method === "natural" && row.bullId) {
                        state.fatherId = row.bullId;
                      }
                      navigate(ROUTES.BIRTHS_NEW, { state });
                    }}
                  >
                    {t.animals.details.breeding.registerBirthButton}
                  </Button>
                  {!row.confirmed && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmBreeding(row);
                        }}
                      >
                        {t.animals.details.breeding.confirmButton}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscardBreeding(row);
                        }}
                      >
                        {t.animals.details.breeding.discardButton}
                      </Button>
                    </>
                  )}
                </div>
              ),
            },
          ];

          const headerActions: TableAction[] = hasAnyBreeding
            ? []
            : [
                {
                  label: t.animals.details.breeding.registerButton,
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
                    const route = getBreedingNewRoute([animal.id]);
                    navigate(route.pathname, { state: route.state });
                  },
                },
              ];

          return (
            <div className="space-y-8">
              <FixedAlert alertMessage={breedingAlert} />

              <Table<Breeding>
                key={breedingsKey}
                columns={columns}
                data={paginatedBreedings}
                header={{
                  title: t.animals.details.breeding.title,
                  badge: {
                    label: `${breedings.length} ${breedings.length === 1 ? t.animals.details.breeding.badgeSingular : t.animals.details.breeding.badge}`,
                    variant: "primary",
                  },
                  description:
                    t.animals.details.breeding.description ||
                    "Histórico de coberturas deste animal",
                  actions: headerActions,
                }}
                pagination={{
                  currentPage: breedingsCurrentPage,
                  totalPages: totalPages || 1,
                  onPageChange: setBreedingsCurrentPage,
                  showInfo: false,
                }}
                sortState={breedingsSortState}
                onSort={(column, direction) => {
                  setBreedingsSortState({ column, direction });
                  setBreedingsCurrentPage(1);
                }}
                emptyState={{
                  title: t.animals.details.breeding.emptyState.title,
                  description: t.animals.details.breeding.emptyState.description,
                  onAddNew: hasAnyBreeding
                    ? undefined
                    : () => {
                        const route = getBreedingNewRoute([animal.id]);
                        navigate(route.pathname, { state: route.state });
                      },
                  addNewLabel: t.animals.details.breeding.registerButton,
                }}
              />

              <ConfirmationModal
                isOpen={isConfirmBreedingModalOpen}
                onClose={() => {
                  setIsConfirmBreedingModalOpen(false);
                  setSelectedBreeding(null);
                }}
                onConfirm={handleConfirmBreedingSubmit}
                title={t.animals.details.breeding.confirmModal.title}
                message={
                  selectedBreeding
                    ? t.animals.details.breeding.confirmModal.message(animal.code) ||
                      `Tem certeza que deseja confirmar a cobertura do animal "${animal.code}"?`
                    : ""
                }
                confirmLabel={t.animals.details.breeding.confirmModal.confirm}
                cancelLabel={t.animals.details.breeding.confirmModal.cancel}
                variant="info"
              />

              <ConfirmationModal
                isOpen={isDiscardBreedingModalOpen}
                onClose={() => {
                  setIsDiscardBreedingModalOpen(false);
                  setSelectedBreeding(null);
                }}
                onConfirm={handleDiscardBreedingSubmit}
                title={t.animals.details.breeding.discardModal.title}
                message={
                  selectedBreeding
                    ? t.animals.details.breeding.discardModal.message(animal.code) ||
                      `Tem certeza que deseja descartar a cobertura do animal "${animal.code}"? Esta ação não pode ser desfeita.`
                    : ""
                }
                confirmLabel={t.animals.details.breeding.discardModal.confirm}
                cancelLabel={t.animals.details.breeding.discardModal.cancel}
                variant="danger"
              />
            </div>
          );
        })()}

      {activeTab === "sanitaryControl" &&
        animal &&
        (() => {
          const sortedSanitaryControls = sanitaryControls.toSorted((a, b) => {
            const { column, direction } = sanitaryControlsSortState;

            if (!column) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            let comparison = 0;
            if (column === "date") {
              comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            return direction === "asc" ? comparison : -comparison;
          });

          const filteredSanitaryControls = sortedSanitaryControls.filter(
            (sc) => sc?.id !== undefined
          );
          const totalPages = Math.ceil(filteredSanitaryControls.length / itemsPerPage);
          const startIndex = (sanitaryControlsCurrentPage - 1) * itemsPerPage;
          const paginatedSanitaryControls = filteredSanitaryControls.slice(
            startIndex,
            startIndex + itemsPerPage
          );

          const columns: TableColumn<import("~/types/sanitary-control").SanitaryControl>[] = [
            {
              key: "date",
              label: t.animals.details.date,
              sortable: true,
              render: (_value, record) => {
                if (!record) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(record.date)}
                  </span>
                );
              },
            },
            {
              key: "appliedMedicines",
              label: t.animals.details.sanitaryControl?.appliedItems,
              sortable: false,
              render: (_value, record) => {
                if (!record) return <span className="text-sm text-gray-400">-</span>;
                return (
                  <div className="space-y-1">
                    {record.appliedMedicines.map(
                      (
                        applied: { itemId: string; quantity: number; calculatedDosage?: number },
                        idx: number
                      ) => {
                        const item = inventoryItemsMap.get(applied.itemId);
                        return (
                          <div
                            key={`${applied.itemId}-${idx}`}
                            className="text-sm text-gray-900 dark:text-gray-100"
                          >
                            {item?.name || t.common.itemNotFound}: {applied.quantity}{" "}
                            {item?.unit || ""}
                          </div>
                        );
                      }
                    )}
                  </div>
                );
              },
            },
            {
              key: "responsible",
              label: t.animals.details.sanitaryControl?.responsible,
              sortable: false,
              render: (_value, record) => {
                if (!record) return <span className="text-sm text-gray-400">-</span>;
                const employees = (record.employeeIds || [])
                  .map((id: string) => employeesMap.get(id))
                  .filter(Boolean);
                const serviceProviders = (record.serviceProviderIds || [])
                  .map((id: string) => serviceProvidersMap.get(id))
                  .filter(Boolean);
                const allResponsible = [
                  ...employees.map((e) => e?.name || ""),
                  ...serviceProviders.map((sp) => sp?.name || ""),
                ].filter(Boolean);

                if (allResponsible.length === 0) {
                  return <span className="text-sm text-gray-400">-</span>;
                }

                return (
                  <div className="space-y-1">
                    {allResponsible.map((name, idx) => (
                      <div
                        key={`${name}-${idx}`}
                        className="text-sm text-gray-900 dark:text-gray-100"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                );
              },
            },
            {
              key: "observation",
              label: t.animals.details.sanitaryControl?.observation,
              sortable: false,
              render: (_value, record) => {
                if (!record?.observation) {
                  return <span className="text-sm text-gray-400">-</span>;
                }
                return (
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {record.observation}
                  </span>
                );
              },
            },
          ];

          const headerActions: TableAction[] = [
            {
              label: t.animals.details.sanitaryControl?.addButton,
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
                const route = getSanitaryControlNewRoute([animal.id]);
                if (typeof route === "string") {
                  navigate(route);
                } else {
                  navigate(route.pathname, { state: route.state });
                }
              },
            },
          ];

          return (
            <div className="space-y-8">
              <Table<import("~/types/sanitary-control").SanitaryControl>
                columns={columns}
                data={paginatedSanitaryControls}
                header={{
                  title: t.animals.details.sanitaryControl?.title,
                  badge: {
                    label: `${sanitaryControls.length} ${
                      sanitaryControls.length === 1
                        ? t.animals.details.sanitaryControl?.badgeSingular
                        : t.animals.details.sanitaryControl?.badge
                    }`,
                    variant: "primary",
                  },
                  description:
                    t.animals.details.sanitaryControl?.description ||
                    "Histórico de controles sanitários deste animal",
                  actions: headerActions,
                }}
                pagination={{
                  currentPage: sanitaryControlsCurrentPage,
                  totalPages: totalPages || 1,
                  onPageChange: setSanitaryControlsCurrentPage,
                  showInfo: false,
                }}
                sortState={sanitaryControlsSortState}
                onSort={(column, direction) => {
                  setSanitaryControlsSortState({ column, direction });
                  setSanitaryControlsCurrentPage(1);
                }}
                emptyState={{
                  title:
                    t.animals.details.sanitaryControl?.emptyState?.title ||
                    "Nenhum controle sanitário registrado",
                  description:
                    t.animals.details.sanitaryControl?.emptyState?.description ||
                    "Registre o primeiro controle sanitário para este animal.",
                  onAddNew: () => {
                    const route = getSanitaryControlNewRoute([animal.id]);
                    if (typeof route === "string") {
                      navigate(route);
                    } else {
                      navigate(route.pathname, { state: route.state });
                    }
                  },
                  addNewLabel: t.animals.details.sanitaryControl?.addButton,
                }}
              />
            </div>
          );
        })()}

      {activeTab === "costs" && animal && (
        <div className="space-y-8">
          {animalCostData &&
            (() => {
              const allConsumptionDetails = animalCostData.locationBreakdown.flatMap((location) =>
                location.consumptionDetails.map((detail) => ({
                  ...detail,
                  locationId: location.locationId,
                  locationName: location.locationName,
                  costPerAnimal:
                    detail.animalsPresent.length > 0
                      ? detail.totalCost / detail.animalsPresent.length
                      : 0,
                }))
              );

              return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-red-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {t.animals.details.costs?.title}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {t.animals.details.costs?.description ||
                      "Track inventory consumption costs for this animal"}
                  </p>

                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.locations.costs.startDate}
                      </label>
                      <input
                        type="date"
                        value={costsStartDate}
                        onChange={(e) => setCostsStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.locations.costs.endDate}
                      </label>
                      <input
                        type="date"
                        value={costsEndDate}
                        onChange={(e) => setCostsEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCostsStartDate("");
                          setCostsEndDate("");
                        }}
                        disabled={!costsStartDate && !costsEndDate}
                      >
                        {t.locations.costs.clearFilter}
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {t.animals.details.costs?.totalCost}
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                        {animalCostData.totalCost.toLocaleString(localeForNumber, {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {animalCostData.consumptionPeriods}{" "}
                        {t.animals.details.costs?.consumptionPeriods}
                      </p>
                    </div>
                  </div>

                  {animalCostData.locationBreakdown.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t.animals.details.costs?.costByLocation}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.location}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.totalAllocatedCost}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.consumptionPeriods}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {animalCostData.locationBreakdown.map((location) => (
                              <tr key={location.locationId}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {location.locationName}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {location.totalCost.toLocaleString(localeForNumber, {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {location.consumptionPeriods}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      navigate(
                                        getLocationViewRoute(location.locationId) + "?tab=costs"
                                      )
                                    }
                                  >
                                    View Location
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {allConsumptionDetails.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t.animals.details.costs?.consumptionHistory}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.locations.costs.date}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.location}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.itemName}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.quantity}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.costPerAnimal}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t.animals.details.costs?.totalAllocatedCost}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {allConsumptionDetails.map((detail) => (
                              <tr key={detail.movement.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {format(new Date(detail.movement.date), "PP", {
                                    locale: dateLocale,
                                  })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {detail.locationName}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {detail.item.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {detail.movement.quantity.toLocaleString(localeForNumber)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                  {detail.costPerAnimal.toLocaleString(localeForNumber, {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {detail.costPerAnimal.toLocaleString(localeForNumber, {
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

                  {animalCostData.locationBreakdown.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="font-medium">{t.animals.details.costs?.noCosts}</p>
                      <p className="text-sm mt-2">
                        {t.animals.details.costs?.noCostsDescription ||
                          "This animal has no inventory consumption costs recorded yet."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      )}

      {activeTab === "sales" && animal && animalSales.length > 0 && (
        <div className="space-y-8">
          {(() => {
            const salesWithDetails = animalSales
              .map((sale) => {
                const saleItem = sale.saleItems.find((item) => item.animalId === animal.id);
                if (!saleItem) return null;

                const profitability = salesProfitability.get(sale.id);
                if (!profitability) return null;

                const buyer = buyersMap.get(sale.buyerId);

                return {
                  sale,
                  saleItem,
                  profitability,
                  buyer: buyer ?? null,
                };
              })
              .filter(Boolean) as Array<{
              sale: (typeof animalSales)[0];
              saleItem: (typeof animalSales)[0]["saleItems"][0];
              profitability: Awaited<ReturnType<typeof calculateAnimalProfitability>>;
              buyer: Awaited<ReturnType<typeof getBuyerById>> | null;
            }>;

            return (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-green-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {t.animals.details.tabs.sales}
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {t.animals.details.sales?.description}
                </p>

                {salesWithDetails.length > 0 ? (
                  <div className="space-y-8">
                    {salesWithDetails.map(({ sale, saleItem, profitability, buyer }) => (
                      <div
                        key={sale.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                              {format(new Date(sale.saleDate), "PP", { locale: dateLocale })}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {buyer?.name || t.common.notAvailable}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => navigate(getSaleViewRoute(sale.id))}
                          >
                            {t.common.view}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {t.sales.details.price}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                              {formatCurrency(saleItem.price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {t.sales.details.weight}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                              {saleItem.weight} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {t.sales.details.pricePerKg}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                              {formatCurrency(profitability.pricePerKg)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {t.sales.details.profit}
                            </p>
                            <p
                              className={`text-lg font-bold mt-1 ${
                                profitability.profit >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {formatCurrency(profitability.profit)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {profitability.profitMargin.toFixed(2)}%{" "}
                              {t.sales.details.profitMargin}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {t.sales.details.cost}
                              </p>
                              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                {formatCurrency(profitability.totalCost)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {t.sales.details.saleType}
                              </p>
                              <StatusBadge
                                label={(() => {
                                  if (sale.saleType === "slaughterhouse")
                                    return t.sales.saleTypes?.slaughterhouse;
                                  if (sale.saleType === "auction")
                                    return t.sales.saleTypes?.auction;
                                  return t.sales.saleTypes?.otherFarm;
                                })()}
                                variant={(() => {
                                  if (sale.saleType === "slaughterhouse") return "danger";
                                  if (sale.saleType === "auction") return "warning";
                                  return "info";
                                })()}
                              />
                            </div>
                          </div>
                          {profitability.acquisitionArrobaValue !== undefined &&
                            profitability.saleArrobaValue !== undefined && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                  {"Análise de Spread (Arroba)"}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      {"Valor Arroba na Aquisição"}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                      {formatCurrency(profitability.acquisitionArrobaValue)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      {"Valor Arroba na Venda"}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                      {formatCurrency(profitability.saleArrobaValue)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      {"Spread por Arroba"}
                                    </p>
                                    <p
                                      className={`text-sm font-semibold mt-1 ${
                                        (profitability.spreadPerArroba || 0) >= 0
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {formatCurrency(profitability.spreadPerArroba || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      {"Spread Total"}
                                    </p>
                                    <p
                                      className={`text-sm font-semibold mt-1 ${
                                        (profitability.totalSpread || 0) >= 0
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {formatCurrency(profitability.totalSpread || 0)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="font-medium">{t.animals.details.sales?.noSales}</p>
                    <p className="text-sm mt-2">
                      {t.animals.details.sales?.noSalesDescription ||
                        "Este animal ainda não foi vendido."}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
