import { useMemo, useState, useEffect } from "react";
import {
  getFertilityRate,
  getBirthRate,
  getCalvingInterval,
  getCullingRate,
  getIntrauterineMortalityIndex,
  getBullToCowRatio,
  getExpectedBirthsForecast,
  getWeaningRate,
  getWeaningRatio,
  getKgWeanedCalfPerExposedCow,
  getMortalityRate,
  getCalfMortalityRate,
} from "~/services/reproductive-indexes.service";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subYears } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";

interface ReproductiveIndexesProps {
  readonly propertyId: string;
  readonly period?: {
    readonly startDate?: string;
    readonly endDate?: string;
  };
}

export function ReproductiveIndexes({ propertyId, period }: ReproductiveIndexesProps) {
  const t = useTranslation();
  const { language } = useLanguage();

  const getDefaultPeriod = () => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    return {
      startDate: format(oneYearAgo, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    };
  };

  const selectedPeriod = period || getDefaultPeriod();

  const dateLocale = useMemo(() => {
    switch (language) {
      case "en":
        return enUS;
      case "es":
        return es;
      default:
        return ptBR;
    }
  }, [language]);

  const [fertilityRate, setFertilityRate] = useState<Awaited<
    ReturnType<typeof getFertilityRate>
  > | null>(null);
  const [birthRate, setBirthRate] = useState<Awaited<ReturnType<typeof getBirthRate>> | null>(null);
  const [calvingInterval, setCalvingInterval] = useState<Awaited<
    ReturnType<typeof getCalvingInterval>
  > | null>(null);
  const [cullingRate, setCullingRate] = useState<Awaited<ReturnType<typeof getCullingRate>> | null>(
    null
  );
  const [intrauterineMortality, setIntrauterineMortality] = useState<Awaited<
    ReturnType<typeof getIntrauterineMortalityIndex>
  > | null>(null);
  const [bullToCowRatio, setBullToCowRatio] = useState<Awaited<
    ReturnType<typeof getBullToCowRatio>
  > | null>(null);
  const [weaningRate, setWeaningRate] = useState<Awaited<ReturnType<typeof getWeaningRate>> | null>(
    null
  );
  const [weaningRatio, setWeaningRatio] = useState<Awaited<
    ReturnType<typeof getWeaningRatio>
  > | null>(null);
  const [kgWeanedCalfPerExposedCow, setKgWeanedCalfPerExposedCow] = useState<Awaited<
    ReturnType<typeof getKgWeanedCalfPerExposedCow>
  > | null>(null);
  const [mortalityRate, setMortalityRate] = useState<Awaited<
    ReturnType<typeof getMortalityRate>
  > | null>(null);
  const [calfMortalityRate, setCalfMortalityRate] = useState<Awaited<
    ReturnType<typeof getCalfMortalityRate>
  > | null>(null);
  const [expectedBirthsForecast, setExpectedBirthsForecast] = useState<Awaited<
    ReturnType<typeof getExpectedBirthsForecast>
  > | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          fertilityRateData,
          birthRateData,
          calvingIntervalData,
          cullingRateData,
          intrauterineMortalityData,
          bullToCowRatioData,
          weaningRateData,
          weaningRatioData,
          kgWeanedCalfPerExposedCowData,
          mortalityRateData,
          calfMortalityRateData,
          expectedBirthsForecastData,
        ] = await Promise.all([
          getFertilityRate(propertyId, selectedPeriod),
          getBirthRate(propertyId, selectedPeriod),
          getCalvingInterval(propertyId),
          getCullingRate(propertyId, selectedPeriod),
          getIntrauterineMortalityIndex(propertyId, selectedPeriod),
          getBullToCowRatio(propertyId),
          getWeaningRate(propertyId, selectedPeriod),
          getWeaningRatio(propertyId, selectedPeriod),
          getKgWeanedCalfPerExposedCow(propertyId, selectedPeriod),
          getMortalityRate(propertyId, selectedPeriod),
          getCalfMortalityRate(propertyId, selectedPeriod),
          getExpectedBirthsForecast(propertyId, { isPropertyId: true, monthsAhead: 9 }),
        ]);
        setFertilityRate(fertilityRateData);
        setBirthRate(birthRateData);
        setCalvingInterval(calvingIntervalData);
        setCullingRate(cullingRateData);
        setIntrauterineMortality(intrauterineMortalityData);
        setBullToCowRatio(bullToCowRatioData);
        setWeaningRate(weaningRateData);
        setWeaningRatio(weaningRatioData);
        setKgWeanedCalfPerExposedCow(kgWeanedCalfPerExposedCowData);
        setMortalityRate(mortalityRateData);
        setCalfMortalityRate(calfMortalityRateData);
        setExpectedBirthsForecast(expectedBirthsForecastData);
      } catch (error) {
        console.error("Failed to load reproductive indexes:", error);
        setFertilityRate(null);
        setBirthRate(null);
        setCalvingInterval(null);
        setCullingRate(null);
        setIntrauterineMortality(null);
        setBullToCowRatio(null);
        setWeaningRate(null);
        setWeaningRatio(null);
        setKgWeanedCalfPerExposedCow(null);
        setMortalityRate(null);
        setCalfMortalityRate(null);
        setExpectedBirthsForecast(null);
      }
    };
    loadData();
  }, [propertyId, selectedPeriod]);

  const monthlyBirthRateData = useMemo(() => {
    if (!birthRate?.monthly) return [];
    return birthRate.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        rate: Math.round(item.rate * 100) / 100,
        calves: item.calvesBorn,
      };
    });
  }, [birthRate, dateLocale]);

  const annualCullingRateData = useMemo(() => {
    if (!cullingRate?.annual) return [];
    return cullingRate.annual.map((item) => ({
      year: item.year,
      rate: Math.round(item.rate * 100) / 100,
      replaced: item.replacedFemales,
    }));
  }, [cullingRate]);

  const expectedBirthsData = useMemo(() => {
    if (!expectedBirthsForecast?.monthly || expectedBirthsForecast.monthly.length === 0) return [];
    return expectedBirthsForecast.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        expectedBirths: item.expectedBirths,
      };
    });
  }, [expectedBirthsForecast, dateLocale]);

  const monthlyCalfMortalityData = useMemo(() => {
    if (!calfMortalityRate?.monthly) return [];
    return calfMortalityRate.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        rate: Math.round(item.rate * 100) / 100,
        dead: item.deadCalves,
        total: item.totalCalves,
      };
    });
  }, [calfMortalityRate, dateLocale]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes?.fertilityRate?.title || "Fertility Rate"}
            </h3>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {fertilityRate?.rate?.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.fertilityRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.fertilityRate.pregnantCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {fertilityRate?.pregnantCows ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.fertilityRate.exposedCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {fertilityRate?.exposedCows ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.birthRate.title}
            </h3>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">👶</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {birthRate?.rate.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.birthRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.birthRate.calvesBorn}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {birthRate?.calvesBorn ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.birthRate.pregnantFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {birthRate?.pregnantFemales ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.calvingInterval.title}
            </h3>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⏱️</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {calvingInterval && calvingInterval.average > 0
                ? `${Math.round(calvingInterval.average / 30)} ${t.reproductiveIndexes.calvingInterval.months}`
                : "-"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.calvingInterval.description}
            </p>
          </div>
          {calvingInterval && calvingInterval.average > 0 && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.reproductiveIndexes.calvingInterval.min}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(calvingInterval.min / 30)}{" "}
                  {t.reproductiveIndexes.calvingInterval.months}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.reproductiveIndexes.calvingInterval.max}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(calvingInterval.max / 30)}{" "}
                  {t.reproductiveIndexes.calvingInterval.months}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.reproductiveIndexes.calvingInterval.animals}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {calvingInterval.animalsWithIntervals}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.cullingRate.title}
            </h3>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔄</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {cullingRate?.rate.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.cullingRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.cullingRate.replacedFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cullingRate?.replacedFemales ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.cullingRate.totalFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cullingRate?.totalFemales ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.intrauterineMortality.title}
            </h3>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {intrauterineMortality?.rate.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.intrauterineMortality.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.intrauterineMortality.pregnantCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {intrauterineMortality?.pregnantCows ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.intrauterineMortality.cowsThatCalved}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {intrauterineMortality?.cowsThatCalved ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.intrauterineMortality.losses}:
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {intrauterineMortality?.losses ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.bullToCowRatio.title}
            </h3>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🐂</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {bullToCowRatio?.ratio ?? "0:0"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.bullToCowRatio.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.bullToCowRatio.bullsUsed}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {bullToCowRatio?.bullsUsed ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.bullToCowRatio.exposedCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {bullToCowRatio?.exposedCows ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.weaningRate.title}
            </h3>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🍼</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {weaningRate?.rate.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.weaningRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.weaningRate.weanedCalves}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {weaningRate?.weanedCalves ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.weaningRate.exposedFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {weaningRate?.exposedFemales ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.weaningRatio.title}
            </h3>
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⚖️</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {weaningRatio?.ratio.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.weaningRatio.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.weaningRatio.weanedCalfWeight}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {weaningRatio?.weanedCalfWeight.toFixed(2) ?? "0.00"} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.weaningRatio.motherWeight}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {weaningRatio?.motherWeight.toFixed(2) ?? "0.00"} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.weaningRatio.pairs}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {weaningRatio?.pairs ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.kgWeanedCalfPerExposedCow.title}
            </h3>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📦</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {kgWeanedCalfPerExposedCow?.kgPerExposedCow.toFixed(2) ?? "0.00"} kg
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.kgWeanedCalfPerExposedCow.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.kgWeanedCalfPerExposedCow.totalWeanedWeight}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {kgWeanedCalfPerExposedCow?.totalWeanedWeight.toFixed(2) ?? "0.00"} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.kgWeanedCalfPerExposedCow.weanedCalves}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {kgWeanedCalfPerExposedCow?.weanedCalves ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.kgWeanedCalfPerExposedCow.exposedFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {kgWeanedCalfPerExposedCow?.exposedFemales ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.mortalityRate.title}
            </h3>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">💀</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {mortalityRate?.rate.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.mortalityRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.mortalityRate.deadAnimals}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {mortalityRate?.deadAnimals ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.mortalityRate.totalAnimals}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {mortalityRate?.totalAnimals ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.calfMortalityRate.title}
            </h3>
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🐄</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {calfMortalityRate?.rate.toFixed(2) ?? "0.00"}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.calfMortalityRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.calfMortalityRate.deadCalves}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {calfMortalityRate?.deadCalves ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.calfMortalityRate.totalCalves}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {calfMortalityRate?.totalCalves ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyBirthRateData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.reproductiveIndexes.charts.monthlyBirthRate}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyBirthRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  name={t.reproductiveIndexes.charts.birthRate}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {annualCullingRateData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.reproductiveIndexes.charts.annualCullingRate}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={annualCullingRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="rate"
                  fill="#ef4444"
                  name={t.reproductiveIndexes.charts.cullingRate}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {expectedBirthsData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.reproductiveIndexes.charts.expectedFutureBirths}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expectedBirthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="expectedBirths"
                fill="#10b981"
                name={t.reproductiveIndexes.charts.expectedBirths}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyCalfMortalityData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.reproductiveIndexes.charts.monthlyCalfMortality}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyCalfMortalityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#ec4899"
                name={t.reproductiveIndexes.charts.calfMortalityRate}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
