import { useMemo } from "react";
import { Link } from "react-router";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  parseISO,
  differenceInHours,
  differenceInDays,
  differenceInMinutes,
} from "date-fns";
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
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { mockProperties } from "~/mocks/properties";
import { mockLocations } from "~/mocks/locations";
import { mockCompanies } from "~/mocks/companies";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getWeighingsByAnimalId, getWeighingsByCompanyId } from "~/services/weighings.service";
import { getExpectedBirthsForecast } from "~/services/reproductive-indexes.service";
import { getCashFlowByCompanyId } from "~/services/cash-flow.service";
import { getAccountsPayableByCompanyId } from "~/services/accounts-payable.service";
import { getAccountsReceivableByCompanyId } from "~/services/accounts-receivable.service";
import { getBirthsByCompanyId } from "~/services/births.service";
import { getBreedingsByCompanyId } from "~/services/breedings.service";
import { getEmployeesByCompanyId } from "~/services/employees.service";
import { getSuppliersByCompanyId } from "~/services/suppliers.service";
import { getBuyersByCompanyId } from "~/services/buyers.service";
import { AreaType } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import { ROUTES } from "~/routes.config";

export function meta() {
  return [
    { title: "Dashboard - Boi na Nuvem" },
    {
      name: "description",
      content: "Painel de controle do Boi na Nuvem",
    },
  ];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatRelativeTime = (dateString: string, t: ReturnType<typeof useTranslation>) => {
  const date = parseISO(dateString);
  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);

  if (minutes < 60) {
    return t.dashboard.recentActivities.minutesAgo(minutes);
  } else if (hours < 24) {
    return t.dashboard.recentActivities.hoursAgo(hours);
  } else {
    return t.dashboard.recentActivities.daysAgo(days);
  }
};

export default function Dashboard() {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const animals = getAnimalsByCompanyId(companyId);
  const totalAnimals = animals.length;
  const totalProperties = mockProperties.length;
  const totalLocations = mockLocations.length;

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

  const totalAreaInHectares = mockProperties.reduce((sum, property) => {
    return sum + convertToHectares(property.area.value, property.area.type);
  }, 0);

  const stockingRate =
    totalAreaInHectares > 0 && animalUnits > 0 ? animalUnits / totalAreaInHectares : 0;

  const activeAnimals = animals.filter((animal) => animal.status === "active").length;

  const expectedBirthsForecast = useMemo(
    () => getExpectedBirthsForecast(companyId, { isPropertyId: false, monthsAhead: 9 }),
    [companyId]
  );

  const nextMonthExpected = useMemo(() => {
    if (!expectedBirthsForecast.monthly || expectedBirthsForecast.monthly.length === 0) return 0;
    const today = new Date();
    const nextMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}`;
    const nextMonth = expectedBirthsForecast.monthly.find((item) => item.month === nextMonthKey);
    return nextMonth?.expectedBirths || 0;
  }, [expectedBirthsForecast.monthly]);

  const nextThreeMonthsTotal = expectedBirthsForecast.total;

  // Financial data
  const cashFlowData = useMemo(() => getCashFlowByCompanyId(companyId), [companyId]);
  const accountsPayableData = useMemo(() => getAccountsPayableByCompanyId(companyId), [companyId]);
  const accountsReceivableData = useMemo(
    () => getAccountsReceivableByCompanyId(companyId),
    [companyId]
  );

  const currentDate = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const currentMonthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  const currentMonthCashFlow = useMemo(() => {
    return cashFlowData.filter((transaction) => {
      const transactionDate = parseISO(transaction.date);
      return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
    });
  }, [cashFlowData, currentMonthStart, currentMonthEnd]);

  const totalIncome = useMemo(() => {
    return currentMonthCashFlow
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthCashFlow]);

  const totalExpenses = useMemo(() => {
    return currentMonthCashFlow
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthCashFlow]);

  const netCashFlow = totalIncome - totalExpenses;

  const totalAccountsPayable = useMemo(() => {
    const unpaidPayable = accountsPayableData.filter(
      (ap) =>
        ap.status === AccountsPayableStatus.UNPAID || ap.status === AccountsPayableStatus.OVERDUE
    );
    return unpaidPayable.reduce((sum, ap) => {
      const remainingAmount = ap.paidAmount ? ap.amount - ap.paidAmount : ap.amount;
      return sum + remainingAmount;
    }, 0);
  }, [accountsPayableData]);

  const totalAccountsReceivable = useMemo(() => {
    const unpaidReceivable = accountsReceivableData.filter(
      (ar) =>
        ar.status === AccountsReceivableStatus.UNPAID ||
        ar.status === AccountsReceivableStatus.OVERDUE
    );
    return unpaidReceivable.reduce((sum, ar) => {
      const remainingAmount = ar.paidAmount ? ar.amount - ar.paidAmount : ar.amount;
      return sum + remainingAmount;
    }, 0);
  }, [accountsReceivableData]);

  // Additional stats
  const employees = useMemo(() => getEmployeesByCompanyId(companyId), [companyId]);
  const suppliers = useMemo(() => getSuppliersByCompanyId(companyId), [companyId]);
  const buyers = useMemo(() => getBuyersByCompanyId(companyId), [companyId]);

  // Births and breedings
  const births = useMemo(() => getBirthsByCompanyId(companyId), [companyId]);
  const breedings = useMemo(() => getBreedingsByCompanyId(companyId), [companyId]);

  const birthsThisMonth = useMemo(() => {
    return births.filter((birth) => {
      const birthDate = parseISO(birth.birthDate);
      return birthDate >= currentMonthStart && birthDate <= currentMonthEnd;
    }).length;
  }, [births, currentMonthStart, currentMonthEnd]);

  const breedingsThisMonth = useMemo(() => {
    return breedings.filter((breeding) => {
      const breedingDate = parseISO(breeding.date);
      return breedingDate >= currentMonthStart && breedingDate <= currentMonthEnd;
    }).length;
  }, [breedings, currentMonthStart, currentMonthEnd]);

  const recentBirths = useMemo(() => {
    return [...births]
      .sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime())
      .slice(0, 10);
  }, [births]);

  const recentBreedings = useMemo(() => {
    return [...breedings]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [breedings]);

  // Activity feed
  const allWeighings = useMemo(() => getWeighingsByCompanyId(companyId), [companyId]);

  const activities = useMemo(() => {
    const activityList: Array<{
      type: string;
      date: string;
      title: string;
      icon: string;
      color: string;
    }> = [];

    // Animal registrations
    animals.forEach((animal) => {
      activityList.push({
        type: "animal",
        date: animal.createdAt || new Date().toISOString(),
        title: t.dashboard.recentActivities.newAnimalRegistered,
        icon: "🐄",
        color: "blue",
      });
    });

    // Births
    births.forEach((birth) => {
      activityList.push({
        type: "birth",
        date: birth.birthDate,
        title: t.dashboard.recentActivities.newBirthRegistered,
        icon: "👶",
        color: "purple",
      });
    });

    // Weighings
    allWeighings.forEach((weighing) => {
      activityList.push({
        type: "weighing",
        date: weighing.date,
        title: t.dashboard.recentActivities.newWeighingRegistered,
        icon: "⚖️",
        color: "teal",
      });
    });

    // Breedings
    breedings.forEach((breeding) => {
      activityList.push({
        type: "breeding",
        date: breeding.date,
        title: t.dashboard.recentActivities.newBreedingRegistered,
        icon: "💑",
        color: "pink",
      });
    });

    // Financial transactions
    cashFlowData.forEach((transaction) => {
      activityList.push({
        type: "transaction",
        date: transaction.date,
        title: t.dashboard.recentActivities.newTransactionRegistered,
        icon: transaction.type === "income" ? "💰" : "💸",
        color: transaction.type === "income" ? "green" : "red",
      });
    });

    return activityList
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [animals, births, allWeighings, breedings, cashFlowData, t]);

  // Charts data
  const weightTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthWeighings = allWeighings.filter((w) => {
        const weighingDate = parseISO(w.date);
        return weighingDate >= monthStart && weighingDate <= monthEnd;
      });

      let totalWeight = 0;
      let count = 0;
      monthWeighings.forEach((weighing) => {
        totalWeight += weighing.weight;
        count++;
      });

      const avgWeight = count > 0 ? totalWeight / count : 0;

      months.push({
        month: format(monthDate, "MMM"),
        averageWeight: Math.round(avgWeight),
      });
    }
    return months;
  }, [allWeighings, currentDate]);

  const financialTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = cashFlowData.filter((t) => {
        const transactionDate = parseISO(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: format(monthDate, "MMM"),
        income: Math.round(income),
        expenses: Math.round(expenses),
      });
    }
    return months;
  }, [cashFlowData, currentDate]);

  const chartColors = {
    grid: isDark ? "#374151" : "#e5e7eb",
    text: isDark ? "#9ca3af" : "#6b7280",
    lineIncome: "#10b981",
    lineExpenses: "#ef4444",
    lineWeight: "#3b82f6",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t.dashboard.title}
      </h1>

      {/* Livestock Overview Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.livestockOverview}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.stats.expectedBirths}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {nextMonthExpected}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.dashboard.stats.nextMonth} • {nextThreeMonthsTotal}{" "}
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

          {/* Additional Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.additionalStats.employees}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {employees.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.additionalStats.suppliers}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {suppliers.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏭</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.additionalStats.buyers}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {buyers.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">🛒</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.additionalStats.birthsThisMonth}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {birthsThisMonth}
                </p>
              </div>
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">👶</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.additionalStats.breedingsThisMonth}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {breedingsThisMonth}
                </p>
              </div>
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">💑</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.financialOverview}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.financial.monthlyIncome}
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.financial.monthlyExpenses}
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📉</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.financial.netCashFlow}
                </p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    netCashFlow >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(netCashFlow)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.financial.accountsPayable}
                </p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {formatCurrency(totalAccountsPayable)}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📤</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.dashboard.financial.accountsReceivable}
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(totalAccountsReceivable)}
                </p>
                <Link
                  to={ROUTES.FINANCES_DASHBOARD}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                >
                  {t.dashboard.financial.viewFinances}
                </Link>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📥</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.charts}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.dashboard.charts.weightTrends}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="month" stroke={chartColors.text} style={{ fontSize: "12px" }} />
                <YAxis
                  stroke={chartColors.text}
                  style={{ fontSize: "12px" }}
                  label={{
                    value: t.dashboard.charts.averageWeight,
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: chartColors.text, fontSize: "12px" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: chartColors.text }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
                <Line
                  type="monotone"
                  dataKey="averageWeight"
                  stroke={chartColors.lineWeight}
                  strokeWidth={2}
                  name={t.dashboard.charts.averageWeight}
                  dot={{ fill: chartColors.lineWeight, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.dashboard.charts.financialTrends}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="month" stroke={chartColors.text} style={{ fontSize: "12px" }} />
                <YAxis
                  stroke={chartColors.text}
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: chartColors.text }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke={chartColors.lineIncome}
                  strokeWidth={2}
                  name={t.dashboard.charts.income}
                  dot={{ fill: chartColors.lineIncome, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke={chartColors.lineExpenses}
                  strokeWidth={2}
                  name={t.dashboard.charts.expenses}
                  dot={{ fill: chartColors.lineExpenses, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.recentActivities.title}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 ${
                    index < activities.length - 1
                      ? "pb-3 border-b border-gray-200 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : activity.color === "purple"
                          ? "bg-purple-100 dark:bg-purple-900/30"
                          : activity.color === "teal"
                            ? "bg-teal-100 dark:bg-teal-900/30"
                            : activity.color === "pink"
                              ? "bg-pink-100 dark:bg-pink-900/30"
                              : activity.color === "green"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(activity.date, t)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activities
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Births & Breedings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.sections.recentBirths}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {recentBirths.length > 0 ? (
                recentBirths.map((birth, index) => (
                  <div
                    key={birth.id}
                    className={`flex items-center space-x-3 ${
                      index < recentBirths.length - 1
                        ? "pb-3 border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm">👶</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {format(parseISO(birth.birthDate), "dd/MM/yyyy")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(birth.birthDate, t)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent births
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.sections.recentBreedings}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {recentBreedings.length > 0 ? (
                recentBreedings.map((breeding, index) => (
                  <div
                    key={breeding.id}
                    className={`flex items-center space-x-3 ${
                      index < recentBreedings.length - 1
                        ? "pb-3 border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm">💑</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {format(parseISO(breeding.date), "dd/MM/yyyy")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(breeding.date, t)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent breedings
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
