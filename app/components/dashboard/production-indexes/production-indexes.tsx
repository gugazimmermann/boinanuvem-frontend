import { useMemo, useState, useEffect } from "react";
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
import { Tooltip } from "~/components/ui/tooltip";

interface ProductionIndexesProps {
  readonly propertyId: string;
  readonly period?: {
    readonly startDate?: string;
    readonly endDate?: string;
  };
}

export function ProductionIndexes({ propertyId, period }: ProductionIndexesProps) {
  const t = useTranslation();

  const getDefaultPeriod = useMemo(() => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    return {
      startDate: format(oneYearAgo, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    };
  }, []);

  const selectedPeriod = period || getDefaultPeriod;

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
    if (!adcResults || adcResults.length === 0) return 0;
    const sum = adcResults.reduce((acc, result) => acc + result.adc, 0);
    return sum / adcResults.length;
  }, [adcResults]);

  const [daysOnFeed, setDaysOnFeed] = useState<Awaited<ReturnType<typeof getDaysOnFeed>>>([]);
  const [arrobaProduction, setArrobaProduction] = useState<Awaited<
    ReturnType<typeof getArrobaProductionPerHectare>
  > | null>(null);
  const [kgNitrogenPerAU, setKgNitrogenPerAU] = useState<Awaited<
    ReturnType<typeof getKgNitrogenPerAU>
  > | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [daysOnFeedResult, arrobaProductionResult, kgNitrogenPerAUResult] = await Promise.all(
          [
            getDaysOnFeed(propertyId, selectedPeriod),
            getArrobaProductionPerHectare(propertyId, selectedPeriod),
            getKgNitrogenPerAU(propertyId, selectedPeriod),
          ]
        );
        setDaysOnFeed(daysOnFeedResult);
        setArrobaProduction(arrobaProductionResult);
        setKgNitrogenPerAU(kgNitrogenPerAUResult);
      } catch (error) {
        console.error("Failed to load production indexes:", error);
        setDaysOnFeed([]);
        setArrobaProduction(null);
        setKgNitrogenPerAU(null);
      }
    };
    loadData();
  }, [propertyId, selectedPeriod]);

  const averageDaysOnFeed = useMemo(() => {
    if (daysOnFeed.length === 0) return 0;
    const sum = daysOnFeed.reduce((acc, result) => acc + result.days, 0);
    return sum / daysOnFeed.length;
  }, [daysOnFeed]);

  const slaughterAge = useMemo(
    () => getSlaughterAge(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const kgMeatPerKgNitrogen = useMemo(
    () => getKgMeatPerKgNitrogen(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.averageDailyGain.title}
              </h3>
              <Tooltip content={t.productionIndexes.averageDailyGain.description} position="top">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {averageAdg.toFixed(2)}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">kg/dia</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.averageDailyGain.animals}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {adgResults.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.averageDailyCarcassGain.title}
              </h3>
              <Tooltip
                content={t.productionIndexes.averageDailyCarcassGain.description}
                position="top"
              >
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🥩</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {averageAdc.toFixed(2)}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">kg/dia</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.averageDailyCarcassGain.carcassYield}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {carcassYield.yield.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.daysOnFeed.title}
              </h3>
              <Tooltip content={t.productionIndexes.daysOnFeed.description} position="top">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⏱️</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(averageDaysOnFeed)}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">dias</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.daysOnFeed.animals}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {daysOnFeed.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.carcassYield.title}
              </h3>
              <Tooltip content={t.productionIndexes.carcassYield.description} position="top">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {carcassYield.yield.toFixed(2)}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">%</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.carcassYield.count}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {carcassYield.count}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.carcassYield.carcassWeight}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {carcassYield.carcassWeight.toFixed(2)} kg
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.carcassYield.liveWeight}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {carcassYield.liveWeight.toFixed(2)} kg
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.slaughterAge.title}
              </h3>
              <Tooltip content={t.productionIndexes.slaughterAge.description} position="top">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {Math.round(slaughterAge.averageAge / 30)}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">meses</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.slaughterAge.min}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(slaughterAge.minAge / 30)} meses
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.slaughterAge.max}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(slaughterAge.maxAge / 30)} meses
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.slaughterAge.count}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {slaughterAge.count}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.arrobaProductionPerHectare.title}
              </h3>
              <Tooltip
                content={t.productionIndexes.arrobaProductionPerHectare.description}
                position="top"
              >
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌾</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {arrobaProduction ? arrobaProduction.arrobasPerHectare.toFixed(2) : "0.00"}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">@/ha</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.arrobaProductionPerHectare.totalArrobas}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {arrobaProduction ? arrobaProduction.totalArrobas.toFixed(2) : "0.00"} @
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.arrobaProductionPerHectare.areaInHectares}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {arrobaProduction ? arrobaProduction.areaInHectares.toFixed(2) : "0.00"} ha
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.kgNitrogenPerAU.title}
              </h3>
              <Tooltip content={t.productionIndexes.kgNitrogenPerAU.description} position="top">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌱</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {kgNitrogenPerAU ? kgNitrogenPerAU.kgNitrogenPerAU.toFixed(2) : "0.00"}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">kg N/AU</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgNitrogenPerAU.totalNitrogen}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {kgNitrogenPerAU ? kgNitrogenPerAU.totalNitrogen.toFixed(2) : "0.00"} kg
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgNitrogenPerAU.animalUnits}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {kgNitrogenPerAU ? kgNitrogenPerAU.animalUnits.toFixed(2) : "0.00"} AU
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.productionIndexes.kgMeatPerKgNitrogen.title}
              </h3>
              <Tooltip content={t.productionIndexes.kgMeatPerKgNitrogen.description} position="top">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {kgMeatPerKgNitrogen.kgMeatPerKgNitrogen.toFixed(2)}{" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">kg/kg N</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgMeatPerKgNitrogen.totalWeightGain}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {kgMeatPerKgNitrogen.totalWeightGain.toFixed(2)} kg
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {t.productionIndexes.kgMeatPerKgNitrogen.totalNitrogen}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {kgMeatPerKgNitrogen.totalNitrogen.toFixed(2)} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
