import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Button,
  StatusBadge,
  Table,
  TableActionButtons,
  ConfirmationModal,
  Alert,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
  PasturePlanningGraph,
  Tooltip,
} from "~/components/ui";
import { PropertyMap } from "~/components/ui/property-map";
import { useTranslation } from "~/i18n";
import {
  ROUTES,
  getPropertyEditRoute,
  getLocationViewRoute,
  getEmployeeViewRoute,
  getServiceProviderViewRoute,
  getSupplierViewRoute,
  getBuyerViewRoute,
  getMovementViewRoute,
  getMovementNewRoute,
} from "~/routes.config";
import { getPropertyById } from "~/mocks/properties";
import { getLocationsByPropertyId, getLocationById } from "~/mocks/locations";
import { getEmployeesByPropertyId, getEmployeeById } from "~/mocks/employees";
import { getServiceProvidersByPropertyId, getServiceProviderById } from "~/mocks/service-providers";
import { getSuppliersByPropertyId } from "~/mocks/suppliers";
import { getBuyersByPropertyId } from "~/mocks/buyers";
import { getLocationMovementsByPropertyId } from "~/mocks/location-movements";
import { getAnimalsByPropertyId, deleteAnimal } from "~/mocks/animals";
import { getBirthByAnimalId } from "~/mocks/births";
import { getWeighingsByAnimalId } from "~/mocks/weighings";
import { getAnimalViewRoute, getAnimalEditRoute } from "~/routes.config";
import type {
  Location,
  Employee,
  ServiceProvider,
  Supplier,
  Buyer,
  LocationMovement,
  Animal,
} from "~/types";
import { AreaType } from "~/types";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";

const formatAreaType = (type: AreaType): string => {
  const typeMap: Record<AreaType, string> = {
    [AreaType.HECTARES]: "ha",
    [AreaType.SQUARE_METERS]: "m²",
    [AreaType.SQUARE_FEET]: "ft²",
    [AreaType.ACRES]: "ac",
    [AreaType.SQUARE_KILOMETERS]: "km²",
    [AreaType.SQUARE_MILES]: "mi²",
  };
  return typeMap[type] || type;
};

export function meta() {
  return [
    { title: "Detalhes da Propriedade - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da propriedade",
    },
  ];
}

export default function PropertyDetails() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const property = getPropertyById(propertyId);

  const tabParam = searchParams.get("tab");
  const subTabParam = searchParams.get("subTab");

  const [activeTab, setActiveTab] = useState<
    "information" | "info" | "animals" | "locations" | "cadastros" | "activities" | "movements"
  >(
    (tabParam === "info" ||
    tabParam === "animals" ||
    tabParam === "locations" ||
    tabParam === "cadastros" ||
    tabParam === "activities" ||
    tabParam === "movements"
      ? tabParam
      : "information") as
      | "information"
      | "info"
      | "animals"
      | "locations"
      | "cadastros"
      | "activities"
      | "movements"
  );

  const [cadastrosSubTab, setCadastrosSubTab] = useState<
    "employees" | "serviceProviders" | "suppliers" | "buyers"
  >(
    (subTabParam === "serviceProviders" || subTabParam === "suppliers" || subTabParam === "buyers"
      ? subTabParam
      : "employees") as "employees" | "serviceProviders" | "suppliers" | "buyers"
  );

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchValue, setSearchValue] = useState("");

  // States for animals tab
  const [animalsSearchValue, setAnimalsSearchValue] = useState("");
  const [animalsActiveFilter, setAnimalsActiveFilter] = useState<string>("all");
  const [animalsCurrentPage, setAnimalsCurrentPage] = useState(1);
  const [animalsSortState, setAnimalsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "code", direction: "asc" });
  const [isDeleteAnimalModalOpen, setIsDeleteAnimalModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "info" ||
      tab === "animals" ||
      tab === "locations" ||
      tab === "cadastros" ||
      tab === "activities" ||
      tab === "movements"
    ) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("information");
    }

    const subTab = searchParams.get("subTab");
    if (subTab === "serviceProviders" || subTab === "suppliers" || subTab === "buyers") {
      setCadastrosSubTab(subTab);
    } else if (subTab === "employees" || (activeTab === "cadastros" && !subTab)) {
      setCadastrosSubTab("employees");
    }
  }, [searchParams, activeTab]);

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.properties.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.PROPERTIES)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const locations = getLocationsByPropertyId(property.id);
  const locationsCount = locations.length;
  const allPropertyAnimals = getAnimalsByPropertyId(property.id);
  const animalsCount = allPropertyAnimals.length;

  // Calculate total weight from last weighing of each animal
  const calculateTotalWeight = () => {
    let totalWeight = 0;
    allPropertyAnimals.forEach((animal) => {
      const weighings = getWeighingsByAnimalId(animal.id);
      if (weighings.length > 0) {
        const lastWeighing = weighings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        totalWeight += lastWeighing.weight;
      }
    });
    return totalWeight;
  };

  // Calculate Animal Units (UA): total weight / 450
  const totalWeight = calculateTotalWeight();
  const animalUnits = totalWeight > 0 ? totalWeight / 450 : 0;

  // Convert area to hectares
  const convertToHectares = (value: number, type: AreaType): number => {
    switch (type) {
      case AreaType.HECTARES:
        return value;
      case AreaType.SQUARE_METERS:
        return value / 10000; // 1 hectare = 10,000 m²
      case AreaType.SQUARE_FEET:
        return value / 107639; // 1 hectare = 107,639 ft²
      case AreaType.ACRES:
        return value * 0.404686; // 1 acre = 0.404686 hectares
      case AreaType.SQUARE_KILOMETERS:
        return value * 100; // 1 km² = 100 hectares
      case AreaType.SQUARE_MILES:
        return value * 258.999; // 1 mi² = 258.999 hectares
      default:
        return value;
    }
  };

  // Calculate Stocking Rate: UA's / Hectares
  const areaInHectares = convertToHectares(property.area.value, property.area.type);
  const stockingRate = areaInHectares > 0 && animalUnits > 0 ? animalUnits / areaInHectares : 0;

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteAnimalClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDeleteAnimalModalOpen(true);
  };

  const handleDeleteAnimal = async () => {
    if (!selectedAnimal) return;
    const success = deleteAnimal(selectedAnimal.id);
    if (success) {
      showAlert(t.animals.success.deleted, "success");
    } else {
      showAlert(t.animals.errors.deleteFailed, "error");
    }
    setIsDeleteAnimalModalOpen(false);
    setSelectedAnimal(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{property.name}</h1>
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
            {t.properties.table.code}: {property.code} • {property.city}, {property.state}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            {t.team.new.back}
          </Button>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
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
            {t.properties.details.tabs.information}
          </button>
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
            {t.properties.details.tabs.info}
          </button>
          <button
            onClick={() => {
              setActiveTab("animals");
              setSearchParams({ tab: "animals" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "animals"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "animals"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.animals}
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
            {t.properties.details.tabs.movements}
          </button>
          <button
            onClick={() => {
              setActiveTab("locations");
              setSearchParams({ tab: "locations" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "locations"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "locations"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.locations}
          </button>
          <button
            onClick={() => {
              setActiveTab("cadastros");
              setCadastrosSubTab("employees");
              setSearchParams({ tab: "cadastros", subTab: "employees" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "cadastros"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "cadastros"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.cadastros}
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
            {t.properties.details.tabs.activities}
          </button>
        </nav>
      </div>

      {activeTab === "information" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.area}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {property.area.value.toLocaleString("pt-BR", {
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

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
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

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.animals}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {animalsCount}
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

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.uas}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {animalUnits.toLocaleString("pt-BR", {
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

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.stockingRate}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stockingRate.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
              </div>
            </div>
          </div>

          {property.pasturePlanning && property.pasturePlanning.length > 0 && (
            <PasturePlanningGraph data={property.pasturePlanning} />
          )}

          {property.breedingMonths && property.breedingMonths.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.pasturePlanning.breedingSeason.title}
              </h2>
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
                  const sortedMonths = [...property.breedingMonths].sort(
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
            </div>
          )}
        </div>
      )}

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.propertyInfo}
              </h2>
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
                    {property.area.value.toLocaleString("pt-BR", {
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

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.address}
              </h2>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.location}
              </h2>
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
          const allAnimals = getAnimalsByPropertyId(property.id);

          const filteredAnimals = allAnimals.filter((animal) => {
            const birth = getBirthByAnimalId(animal.id);
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

          const sortedAnimals = [...filteredAnimals].sort((a, b) => {
            if (!animalsSortState.column || !animalsSortState.direction) {
              return 0;
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (animalsSortState.column === "code") {
              aValue = a.code;
              bValue = b.code;
            } else if (animalsSortState.column === "registrationNumber") {
              aValue = a.registrationNumber;
              bValue = b.registrationNumber;
            } else if (animalsSortState.column === "breed") {
              const aBirth = getBirthByAnimalId(a.id);
              const bBirth = getBirthByAnimalId(b.id);
              aValue = aBirth?.breed || "";
              bValue = bBirth?.breed || "";
            } else if (animalsSortState.column === "purity") {
              const aBirth = getBirthByAnimalId(a.id);
              const bBirth = getBirthByAnimalId(b.id);
              aValue = aBirth?.purity || "";
              bValue = bBirth?.purity || "";
            } else if (animalsSortState.column === "gender") {
              const aBirth = getBirthByAnimalId(a.id);
              const bBirth = getBirthByAnimalId(b.id);
              aValue = aBirth?.gender || "";
              bValue = bBirth?.gender || "";
            } else if (animalsSortState.column === "birthDate") {
              const aBirth = getBirthByAnimalId(a.id);
              const bBirth = getBirthByAnimalId(b.id);
              aValue = aBirth?.birthDate
                ? new Date(aBirth.birthDate).getTime()
                : 0;
              bValue = bBirth?.birthDate
                ? new Date(bBirth.birthDate).getTime()
                : 0;
            } else if (animalsSortState.column === "acquisitionDate") {
              aValue = a.acquisitionDate ? new Date(a.acquisitionDate).getTime() : 0;
              bValue = b.acquisitionDate ? new Date(b.acquisitionDate).getTime() : 0;
            } else if (animalsSortState.column === "weight") {
              const aWeighings = getWeighingsByAnimalId(a.id);
              const bWeighings = getWeighingsByAnimalId(b.id);
              const aLastWeighing = aWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              )[0];
              const bLastWeighing = bWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              )[0];
              aValue = aLastWeighing?.weight || 0;
              bValue = bLastWeighing?.weight || 0;
            } else if (animalsSortState.column === "weightInArrobas") {
              const aWeighings = getWeighingsByAnimalId(a.id);
              const bWeighings = getWeighingsByAnimalId(b.id);
              const aLastWeighing = aWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              )[0];
              const bLastWeighing = bWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              )[0];
              aValue = aLastWeighing ? aLastWeighing.weight / 30 : 0;
              bValue = bLastWeighing ? bLastWeighing.weight / 30 : 0;
            } else if (animalsSortState.column === "lastWeighingDate") {
              const aWeighings = getWeighingsByAnimalId(a.id);
              const bWeighings = getWeighingsByAnimalId(b.id);
              const aLastWeighing = aWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              )[0];
              const bLastWeighing = bWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              )[0];
              aValue = aLastWeighing ? new Date(aLastWeighing.date).getTime() : 0;
              bValue = bLastWeighing ? new Date(bLastWeighing.date).getTime() : 0;
            } else if (animalsSortState.column === "gmd") {
              const aWeighings = getWeighingsByAnimalId(a.id);
              const bWeighings = getWeighingsByAnimalId(b.id);
              const aSorted = aWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              );
              const bSorted = bWeighings.sort(
                (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
              );
              if (aSorted.length >= 2) {
                const weightDiff = aSorted[0].weight - aSorted[1].weight;
                const daysDiff = differenceInDays(
                  new Date(aSorted[0].date),
                  new Date(aSorted[1].date)
                );
                aValue = daysDiff > 0 ? weightDiff / daysDiff : 0;
              } else {
                aValue = 0;
              }
              if (bSorted.length >= 2) {
                const weightDiff = bSorted[0].weight - bSorted[1].weight;
                const daysDiff = differenceInDays(
                  new Date(bSorted[0].date),
                  new Date(bSorted[1].date)
                );
                bValue = daysDiff > 0 ? weightDiff / daysDiff : 0;
              } else {
                bValue = 0;
              }
            } else {
              aValue = a[animalsSortState.column as keyof Animal] as string | number | undefined;
              bValue = b[animalsSortState.column as keyof Animal] as string | number | undefined;
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

            return animalsSortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedAnimals.length / itemsPerPage);
          const paginatedAnimals = sortedAnimals.slice(
            (animalsCurrentPage - 1) * itemsPerPage,
            animalsCurrentPage * itemsPerPage
          );

          const columns: TableColumn<Animal>[] = [
            {
              key: "code",
              label: t.animals.table.registration,
              sortable: true,
              render: (_, row) => (
                <div>
                  <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.code}</h2>
                  <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    {row.registrationNumber}
                  </p>
                </div>
              ),
            },
            {
              key: "breed",
              label: t.animals.table.breed,
              sortable: true,
              render: (_, row) => {
                const birth = getBirthByAnimalId(row.id);
                if (!birth || !birth.breed) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {t.animals.breeds[birth.breed] || birth.breed}
                  </span>
                );
              },
            },
            {
              key: "purity",
              label: t.animals.table.purity,
              sortable: true,
              render: (_, row) => {
                const birth = getBirthByAnimalId(row.id);
                if (!birth || !birth.purity) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }
                return (
                  <span className="text-gray-700 dark:text-gray-300">{t.animals.purity[birth.purity]}</span>
                );
              },
            },
            {
              key: "gender",
              label: t.animals.table.gender,
              sortable: true,
              render: (_, row) => {
                const birth = getBirthByAnimalId(row.id);
                if (!birth || !birth.gender) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {birth.gender ? t.animals.gender[birth.gender] : "-"}
                  </span>
                );
              },
            },
            {
              key: "birthDate",
              label: t.animals.table.birthDate,
              sortable: true,
              render: (_, row) => {
                const birth = getBirthByAnimalId(row.id);
                if (!birth || !birth.birthDate) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }

                const birthDate = new Date(birth.birthDate);
                const today = new Date();
                const months = differenceInMonths(today, birthDate);
                const formattedDate = format(birthDate, "dd/MM/yyyy", { locale: ptBR });

                return (
                  <Tooltip content={formattedDate}>
                    <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      {months} {months === 1 ? t.common.month : t.common.months}
                    </span>
                  </Tooltip>
                );
              },
            },
            {
              key: "acquisitionDate",
              label: t.animals.table.acquisitionDate,
              sortable: true,
              render: (_, row) => {
                if (!row.acquisitionDate) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }

                const acquisitionDate = new Date(row.acquisitionDate);
                const today = new Date();
                const months = differenceInMonths(today, acquisitionDate);
                const formattedDate = format(acquisitionDate, "dd/MM/yyyy", { locale: ptBR });

                return (
                  <Tooltip content={formattedDate}>
                    <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      {months} {months === 1 ? t.common.month : t.common.months}
                    </span>
                  </Tooltip>
                );
              },
            },
            {
              key: "weight",
              label: t.animals.table.weight,
              sortable: true,
              render: (_, row) => {
                const weighings = getWeighingsByAnimalId(row.id);
                const lastWeighing = weighings.sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0];
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {lastWeighing ? `${lastWeighing.weight}` : "-"}
                  </span>
                );
              },
            },
            {
              key: "weightInArrobas",
              label: t.animals.table.weightInArrobas,
              sortable: true,
              render: (_, row) => {
                const weighings = getWeighingsByAnimalId(row.id);
                const lastWeighing = weighings.sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0];
                const weightInArrobas = lastWeighing ? (lastWeighing.weight / 30).toFixed(2) : null;
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {weightInArrobas ? `${weightInArrobas}` : "-"}
                  </span>
                );
              },
            },
            {
              key: "lastWeighingDate",
              label: t.animals.table.lastWeighingDate,
              sortable: true,
              render: (_, row) => {
                const weighings = getWeighingsByAnimalId(row.id);
                const lastWeighing = weighings.sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0];
                if (!lastWeighing) return <span className="text-gray-700 dark:text-gray-300">-</span>;

                const formattedDate = format(new Date(lastWeighing.date), "dd/MM/yyyy", { locale: ptBR });
                const today = new Date();
                const weighingDate = new Date(lastWeighing.date);
                const daysAgo = differenceInDays(today, weighingDate);
                const tooltipText = t.common.daysAgo(daysAgo);

                return (
                  <Tooltip content={tooltipText}>
                    <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      {formattedDate}
                    </span>
                  </Tooltip>
                );
              },
            },
            {
              key: "gmd",
              label: (
                <Tooltip content={t.common.dailyAverageGain}>
                  <span className="border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-help">
                    {t.animals.table.gmd}
                  </span>
                </Tooltip>
              ),
              sortable: true,
              render: (_, row) => {
                const weighings = getWeighingsByAnimalId(row.id);
                const sortedWeighings = weighings.sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                if (sortedWeighings.length < 2) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }

                const lastWeighing = sortedWeighings[0];
                const previousWeighing = sortedWeighings[1];

                const weightDifference = lastWeighing.weight - previousWeighing.weight;
                const daysDifference = differenceInDays(
                  new Date(lastWeighing.date),
                  new Date(previousWeighing.date)
                );

                if (daysDifference === 0) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }

                const gpd = (weightDifference / daysDifference).toFixed(2);
                return <span className="text-gray-700 dark:text-gray-300">{gpd}</span>;
              },
            },
            {
              key: "status",
              label: t.animals.table.status,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={row.status === "active" ? t.animals.table.active : t.animals.table.inactive}
                  variant={row.status === "active" ? "success" : "default"}
                />
              ),
            },
            {
              key: "actions",
              label: "",
              headerClassName: "relative",
              render: (_, row) => (
                <TableActionButtons
                  onEdit={() => navigate(getAnimalEditRoute(row.id))}
                  onDelete={() => handleDeleteAnimalClick(row)}
                />
              ),
            },
          ];

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
              onClick: () => navigate(ROUTES.ANIMALS_NEW),
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

          return (
            <div className="space-y-6">
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
                  onAddNew: () => navigate(ROUTES.ANIMALS_NEW),
                  addNewLabel: t.animals.addAnimal,
                }}
              />

              {alertMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
                  <Alert title={alertMessage.title} variant={alertMessage.variant} />
                </div>
              )}

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
            </div>
          );
        })()}

      {activeTab === "locations" &&
        property &&
        (() => {
          const locations = getLocationsByPropertyId(property.id);

          const sortedLocations = [...locations].sort((a, b) => {
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
                  {row.area.value.toLocaleString("pt-BR", {
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
            <div className="space-y-6">
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
                  onAddNew: () => navigate(ROUTES.LOCATIONS_NEW),
                  addNewLabel: t.locations.addLocation,
                }}
              />
            </div>
          );
        })()}

      {activeTab === "cadastros" && property && (
        <div className="space-y-6">
          <div className="mb-4">
            <nav className="flex space-x-3" aria-label="Sub Tabs">
              <button
                onClick={() => {
                  setCadastrosSubTab("employees");
                  setSearchParams({ tab: "cadastros", subTab: "employees" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    cadastrosSubTab === "employees"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  cadastrosSubTab === "employees"
                    ? {
                        backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                        color: DASHBOARD_COLORS.primaryDark,
                      }
                    : undefined
                }
              >
                {t.properties.details.tabs.employees}
              </button>
              <button
                onClick={() => {
                  setCadastrosSubTab("serviceProviders");
                  setSearchParams({ tab: "cadastros", subTab: "serviceProviders" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    cadastrosSubTab === "serviceProviders"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  cadastrosSubTab === "serviceProviders"
                    ? {
                        backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                        color: DASHBOARD_COLORS.primaryDark,
                      }
                    : undefined
                }
              >
                {t.properties.details.tabs.serviceProviders}
              </button>
              <button
                onClick={() => {
                  setCadastrosSubTab("suppliers");
                  setSearchParams({ tab: "cadastros", subTab: "suppliers" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    cadastrosSubTab === "suppliers"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  cadastrosSubTab === "suppliers"
                    ? {
                        backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                        color: DASHBOARD_COLORS.primaryDark,
                      }
                    : undefined
                }
              >
                {t.properties.details.tabs.suppliers}
              </button>
              <button
                onClick={() => {
                  setCadastrosSubTab("buyers");
                  setSearchParams({ tab: "cadastros", subTab: "buyers" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    cadastrosSubTab === "buyers"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  cadastrosSubTab === "buyers"
                    ? {
                        backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                        color: DASHBOARD_COLORS.primaryDark,
                      }
                    : undefined
                }
              >
                {t.properties.details.tabs.buyers}
              </button>
            </nav>
          </div>

          {cadastrosSubTab === "employees" &&
            (() => {
              const employees = getEmployeesByPropertyId(property.id);

              const sortedEmployees = [...employees].sort((a, b) => {
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
                <div className="space-y-6">
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
                      onAddNew: () => navigate(ROUTES.EMPLOYEES_NEW),
                      addNewLabel: t.employees.addEmployee,
                    }}
                  />
                </div>
              );
            })()}

          {cadastrosSubTab === "serviceProviders" &&
            (() => {
              const serviceProviders = getServiceProvidersByPropertyId(property.id);

              const sortedServiceProviders = [...serviceProviders].sort((a, b) => {
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
                <div className="space-y-6">
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
                      onAddNew: () => navigate(ROUTES.SERVICE_PROVIDERS_NEW),
                      addNewLabel: t.serviceProviders.addServiceProvider,
                    }}
                  />
                </div>
              );
            })()}

          {cadastrosSubTab === "suppliers" &&
            (() => {
              const suppliers = getSuppliersByPropertyId(property.id);

              const sortedSuppliers = [...suppliers].sort((a, b) => {
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
                <div className="space-y-6">
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
                      onAddNew: () => navigate(ROUTES.SUPPLIERS_NEW),
                      addNewLabel: t.suppliers.addSupplier,
                    }}
                  />
                </div>
              );
            })()}

          {cadastrosSubTab === "buyers" &&
            (() => {
              const buyers = getBuyersByPropertyId(property.id);

              const sortedBuyers = [...buyers].sort((a, b) => {
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
                <div className="space-y-6">
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
                      onAddNew: () => navigate(ROUTES.BUYERS_NEW),
                      addNewLabel: t.buyers.addBuyer,
                    }}
                  />
                </div>
              );
            })()}
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

      {activeTab === "movements" &&
        property &&
        (() => {
          const movements = getLocationMovementsByPropertyId(property.id);

          const filteredMovements = movements.filter((movement) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            const typeText =
              t.properties.details.movements.types[
                movement.type as keyof typeof t.properties.details.movements.types
              ] || movement.type;
            if (typeText.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDate(movement.date);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            const locationNames = movement.locationIds
              .map((id) => {
                const location = getLocationById(id);
                return location
                  ? `${location.name} ${location.code}`.toLowerCase()
                  : id.toLowerCase();
              })
              .join(" ");
            if (locationNames.includes(searchLower)) return true;

            const employeeNames = movement.employeeIds
              .map((id) => {
                const employee = getEmployeeById(id);
                return employee ? employee.name.toLowerCase() : "";
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
              return 0;
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (sortState.column === "date") {
              aValue = new Date(a.date).getTime();
              bValue = new Date(b.date).getTime();
            } else if (sortState.column === "locations") {
              const aLocationNames = a.locationIds
                .map((id) => {
                  const location = getLocationById(id);
                  return location ? `${location.name} (${location.code})` : id;
                })
                .sort()
                .join(", ");
              const bLocationNames = b.locationIds
                .map((id) => {
                  const location = getLocationById(id);
                  return location ? `${location.name} (${location.code})` : id;
                })
                .sort()
                .join(", ");
              aValue = aLocationNames;
              bValue = bLocationNames;
            } else {
              aValue = a[sortState.column as keyof LocationMovement] as string | number | undefined;
              bValue = b[sortState.column as keyof LocationMovement] as string | number | undefined;
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

          const columns: TableColumn<LocationMovement>[] = [
            {
              key: "date",
              label: t.properties.details.movements.table.date,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
              ),
            },
            {
              key: "locations",
              label: t.properties.details.movements.table.locations,
              sortable: true,
              render: (_, row) => {
                const locationNames = row.locationIds
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
              key: "type",
              label: t.properties.details.movements.table.type,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {t.properties.details.movements.types[
                    row.type as keyof typeof t.properties.details.movements.types
                  ] || row.type}
                </span>
              ),
            },
            {
              key: "responsible",
              label: t.properties.details.movements.table.responsible,
              sortable: false,
              render: (_, row) => {
                const employeeNames = row.employeeIds
                  .map((id) => {
                    const employee = getEmployeeById(id);
                    return employee ? employee.name : null;
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
          ];

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
              onClick: () => navigate(getMovementNewRoute(property.id)),
            },
          ];

          return (
            <div className="space-y-6">
              <Table<LocationMovement & Record<string, unknown>>
                columns={columns}
                data={paginatedMovements as (LocationMovement & Record<string, unknown>)[]}
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
                onRowClick={(row) => navigate(getMovementViewRoute(row.id))}
              />
            </div>
          );
        })()}
    </div>
  );
}
