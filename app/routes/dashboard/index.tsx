import { useTranslation } from "~/i18n";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { mockProperties } from "~/mocks/properties";
import { mockLocations } from "~/mocks/locations";
import { mockCompanies } from "~/mocks/companies";
import { getAnimalsByCompanyId } from "~/mocks/animals";
import { getBirthsByCompanyId } from "~/mocks/births";
import { getWeighingsByAnimalId } from "~/mocks/weighings";
import { AreaType } from "~/types";

export function meta() {
  return [
    { title: "Dashboard - Boi na Nuvem" },
    {
      name: "description",
      content: "Painel de controle do Boi na Nuvem",
    },
  ];
}

export default function Dashboard() {
  const t = useTranslation();

  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const animals = getAnimalsByCompanyId(companyId);
  const totalAnimals = animals.length;
  const totalProperties = mockProperties.length;
  const totalLocations = mockLocations.length;
  const births = getBirthsByCompanyId(companyId);
  const totalBirths = births.length;

  // Calculate total weight across all animals
  const calculateTotalWeight = () => {
    let totalWeight = 0;
    animals.forEach((animal) => {
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

  const totalWeight = calculateTotalWeight();
  const animalUnits = totalWeight > 0 ? totalWeight / 450 : 0;

  // Convert area to hectares
  const convertToHectares = (value: number, type: AreaType): number => {
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
  };

  // Calculate total area in hectares
  const totalAreaInHectares = mockProperties.reduce((sum, property) => {
    return sum + convertToHectares(property.area.value, property.area.type);
  }, 0);

  // Calculate stocking rate (UA per hectare)
  const stockingRate =
    totalAreaInHectares > 0 && animalUnits > 0 ? animalUnits / totalAreaInHectares : 0;

  // Calculate active animals
  const activeAnimals = animals.filter((animal) => animal.status === "active").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t.dashboard.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.totalAnimals}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {totalAnimals.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeAnimals} {t.dashboard.stats.active}
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
                {t.dashboard.stats.properties}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {totalProperties}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {totalAreaInHectares.toFixed(1)} {t.dashboard.stats.hectares}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🏡</span>
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
                {animalUnits.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(totalWeight / 1000).toFixed(1)} {t.dashboard.stats.totalWeight}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
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
                {stockingRate.toFixed(2)}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.locations}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {totalLocations}
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
                {t.dashboard.stats.births}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {totalBirths}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">👶</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.averageWeight}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {totalAnimals > 0 ? (totalWeight / totalAnimals).toFixed(0) : 0}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.density}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {totalAreaInHectares > 0 ? (totalAnimals / totalAreaInHectares).toFixed(2) : 0}
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
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
          {t.dashboard.recentActivities.title}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div
              className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
            >
              <span className="text-sm">🐄</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {t.dashboard.recentActivities.newAnimalRegistered}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.dashboard.recentActivities.hoursAgo(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-sm">🌾</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {t.dashboard.recentActivities.pastureUpdated}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.dashboard.recentActivities.hoursAgo(5)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <span className="text-sm">👶</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {t.dashboard.recentActivities.newBirthRegistered}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.dashboard.recentActivities.daysAgo(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
