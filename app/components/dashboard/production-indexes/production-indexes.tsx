import { useMemo, useState } from "react";
import {
  getAverageDailyGain,
  getAverageDailyCarcassGain,
  getDaysOnFeed,
  getCarcassYield,
  getSlaughterAge,
  getArrobaProductionPerHectare,
  getKgNitrogenPerAU,
  getKgMeatPerKgNitrogen,
} from "~/services/production-indexes.service";
import { useTranslation } from "~/i18n";
import { format, subYears } from "date-fns";

interface ProductionIndexesProps {
  propertyId: string;
}

export function ProductionIndexes({ propertyId }: ProductionIndexesProps) {
  const t = useTranslation();

  const getDefaultPeriod = () => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    return {
      startDate: format(oneYearAgo, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    };
  };

  const [selectedPeriod, setSelectedPeriod] = useState<{
    startDate?: string;
    endDate?: string;
  }>(getDefaultPeriod());

  const adgResults = useMemo(
    () => getAverageDailyGain(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const averageAdg = useMemo(() => {
    if (adgResults.length === 0) return 0;
    const sum = adgResults.reduce((acc, result) => acc + result.adg, 0);
    return sum / adgResults.length;
  }, [adgResults]);

  const carcassYield = useMemo(
    () => getCarcassYield(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const adcResults = useMemo(
    () => getAverageDailyCarcassGain(propertyId, selectedPeriod, carcassYield.yield),
    [propertyId, selectedPeriod, carcassYield.yield]
  );

  const averageAdc = useMemo(() => {
    if (adcResults.length === 0) return 0;
    const sum = adcResults.reduce((acc, result) => acc + result.adc, 0);
    return sum / adcResults.length;
  }, [adcResults]);

  const daysOnFeed = useMemo(
    () => getDaysOnFeed(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const averageDaysOnFeed = useMemo(() => {
    if (daysOnFeed.length === 0) return 0;
    const sum = daysOnFeed.reduce((acc, result) => acc + result.days, 0);
    return sum / daysOnFeed.length;
  }, [daysOnFeed]);

  const slaughterAge = useMemo(
    () => getSlaughterAge(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const arrobaProduction = useMemo(
    () => getArrobaProductionPerHectare(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const kgNitrogenPerAU = useMemo(
    () => getKgNitrogenPerAU(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const kgMeatPerKgNitrogen = useMemo(
    () => getKgMeatPerKgNitrogen(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.productionIndexes.filters.startDate}
            </label>
            <input
              type="date"
              value={selectedPeriod.startDate || ""}
              onChange={(e) =>
                setSelectedPeriod((prev) => ({
                  ...prev,
                  startDate: e.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.productionIndexes.filters.endDate}
            </label>
            <input
              type="date"
              value={selectedPeriod.endDate || ""}
              onChange={(e) =>
                setSelectedPeriod((prev) => ({
                  ...prev,
                  endDate: e.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.averageDailyGain.title}
            </h3>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {averageAdg.toFixed(2)} kg/dia
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.averageDailyGain.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.averageDailyGain.animals}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {adgResults.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.averageDailyCarcassGain.title}
            </h3>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🥩</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {averageAdc.toFixed(2)} kg/dia
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.averageDailyCarcassGain.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.averageDailyCarcassGain.carcassYield}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {carcassYield.yield.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.daysOnFeed.title}
            </h3>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⏱️</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(averageDaysOnFeed)} dias
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.daysOnFeed.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.daysOnFeed.animals}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {daysOnFeed.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.carcassYield.title}
            </h3>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {carcassYield.yield.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.carcassYield.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.carcassYield.count}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {carcassYield.count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.carcassYield.carcassWeight}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {carcassYield.carcassWeight.toFixed(2)} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.carcassYield.liveWeight}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {carcassYield.liveWeight.toFixed(2)} kg
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.slaughterAge.title}
            </h3>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(slaughterAge.averageAge / 30)} meses
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.slaughterAge.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.slaughterAge.min}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {Math.round(slaughterAge.minAge / 30)} meses
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.slaughterAge.max}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {Math.round(slaughterAge.maxAge / 30)} meses
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.slaughterAge.count}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {slaughterAge.count}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.arrobaProductionPerHectare.title}
            </h3>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌾</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {arrobaProduction.arrobasPerHectare.toFixed(2)} @/ha
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.arrobaProductionPerHectare.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.arrobaProductionPerHectare.totalArrobas}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {arrobaProduction.totalArrobas.toFixed(2)} @
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.arrobaProductionPerHectare.areaInHectares}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {arrobaProduction.areaInHectares.toFixed(2)} ha
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.kgNitrogenPerAU.title}
            </h3>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌱</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kgNitrogenPerAU.kgNitrogenPerAU.toFixed(2)} kg N/AU
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.kgNitrogenPerAU.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgNitrogenPerAU.totalNitrogen}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {kgNitrogenPerAU.totalNitrogen.toFixed(2)} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgNitrogenPerAU.animalUnits}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {kgNitrogenPerAU.animalUnits.toFixed(2)} AU
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.kgMeatPerKgNitrogen.title}
            </h3>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kgMeatPerKgNitrogen.kgMeatPerKgNitrogen.toFixed(2)} kg/kg N
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.productionIndexes.kgMeatPerKgNitrogen.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgMeatPerKgNitrogen.totalWeightGain}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {kgMeatPerKgNitrogen.totalWeightGain.toFixed(2)} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgMeatPerKgNitrogen.totalNitrogen}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {kgMeatPerKgNitrogen.totalNitrogen.toFixed(2)} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
