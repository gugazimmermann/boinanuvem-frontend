import { useMemo } from "react";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
import { StatCard, ChartWrapper, getTooltipStyle, getChartColors } from "~/components/dashboard";
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
import { getSalesByCompanyId } from "~/services/sales.service";
import { getSalesMetrics } from "~/services/sales-analytics.service";
import { AreaType } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import { ROUTES } from "~/routes.config";
import { translations } from "~/i18n/translations";

export function meta() {
  const t = translations.pt;
  return [
    { title: t.dashboard.meta.title },
    {
      name: "description",
      content: t.dashboard.meta.description,
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

  const employees = useMemo(() => getEmployeesByCompanyId(companyId), [companyId]);
  const suppliers = useMemo(() => getSuppliersByCompanyId(companyId), [companyId]);
  const buyers = useMemo(() => getBuyersByCompanyId(companyId), [companyId]);

  const births = useMemo(() => getBirthsByCompanyId(companyId), [companyId]);
  const breedings = useMemo(() => getBreedingsByCompanyId(companyId), [companyId]);

  const sales = useMemo(() => getSalesByCompanyId(companyId), [companyId]);
  const salesMetrics = useMemo(() => getSalesMetrics(companyId), [companyId]);

  const salesThisMonth = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = parseISO(sale.saleDate);
      return saleDate >= currentMonthStart && saleDate <= currentMonthEnd;
    }).length;
  }, [sales, currentMonthStart, currentMonthEnd]);

  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 10);
  }, [sales]);

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

  const allWeighings = useMemo(() => getWeighingsByCompanyId(companyId), [companyId]);

  const activities = useMemo(() => {
    const activityList: Array<{
      type: string;
      date: string;
      title: string;
      icon: string;
      color: string;
    }> = [];

    animals.forEach((animal) => {
      activityList.push({
        type: "animal",
        date: animal.createdAt || new Date().toISOString(),
        title: t.dashboard.recentActivities.newAnimalRegistered,
        icon: "🐄",
        color: "blue",
      });
    });

    births.forEach((birth) => {
      activityList.push({
        type: "birth",
        date: birth.birthDate,
        title: t.dashboard.recentActivities.newBirthRegistered,
        icon: "👶",
        color: "purple",
      });
    });

    allWeighings.forEach((weighing) => {
      activityList.push({
        type: "weighing",
        date: weighing.date,
        title: t.dashboard.recentActivities.newWeighingRegistered,
        icon: "⚖️",
        color: "teal",
      });
    });

    breedings.forEach((breeding) => {
      activityList.push({
        type: "breeding",
        date: breeding.date,
        title: t.dashboard.recentActivities.newBreedingRegistered,
        icon: "💑",
        color: "pink",
      });
    });

    cashFlowData.forEach((transaction) => {
      activityList.push({
        type: "transaction",
        date: transaction.date,
        title: t.dashboard.recentActivities.newTransactionRegistered,
        icon: transaction.type === "income" ? "💰" : "💸",
        color: transaction.type === "income" ? "green" : "red",
      });
    });

    sales.forEach((sale) => {
      activityList.push({
        type: "sale",
        date: sale.saleDate,
        title: t.dashboard.recentActivities.newSaleRegistered,
        icon: "💵",
        color: "green",
      });
    });

    return activityList
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [animals, births, allWeighings, breedings, cashFlowData, sales, t]);

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

  const chartColors = getChartColors(isDark);

  // Animal distribution by status
  const animalDistributionByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    animals.forEach((animal) => {
      statusCounts[animal.status] = (statusCounts[animal.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [animals]);

  // Sales trends over time
  const salesTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthSales = sales.filter((sale) => {
        const saleDate = parseISO(sale.saleDate);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });

      const revenue = monthSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
      const count = monthSales.length;

      months.push({
        month: format(monthDate, "MMM"),
        revenue: Math.round(revenue),
        count,
      });
    }
    return months;
  }, [sales, currentDate]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t.dashboard.title}
      </h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.livestockOverview}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t.dashboard.stats.properties}
            value={totalProperties}
            subtitle={`${totalAreaInHectares.toFixed(1)} ${t.dashboard.stats.hectares}`}
            icon={<span className="text-lg">🏡</span>}
          />

          <StatCard
            title={t.dashboard.stats.locations}
            value={totalLocations}
            icon={<span className="text-lg">📍</span>}
          />

          <StatCard
            title={t.dashboard.stats.totalAnimals}
            value={totalAnimals.toLocaleString()}
            subtitle={`${activeAnimals} ${t.dashboard.stats.active}`}
            icon={<span className="text-lg">🐄</span>}
          />

          <StatCard
            title={t.properties.table.uas}
            value={animalUnits.toFixed(2)}
            subtitle={`${(totalWeight / 1000).toFixed(1)} ${t.dashboard.stats.totalWeight}`}
            icon={<span className="text-lg">📊</span>}
          />

          <StatCard
            title={t.properties.table.stockingRate}
            value={stockingRate.toFixed(2)}
            subtitle={t.dashboard.stats.uaPerHa}
            icon={<span className="text-lg">🌱</span>}
          />

          <StatCard
            title={t.dashboard.stats.density}
            value={totalAreaInHectares > 0 ? (totalAnimals / totalAreaInHectares).toFixed(2) : 0}
            subtitle={t.dashboard.stats.animalsPerHa}
            icon={<span className="text-lg">📈</span>}
          />

          <StatCard
            title={t.dashboard.stats.averageWeight}
            value={totalAnimals > 0 ? (totalWeight / totalAnimals).toFixed(0) : 0}
            subtitle={t.dashboard.stats.kgPerAnimal}
            icon={<span className="text-lg">⚖️</span>}
          />

          <StatCard
            title={t.dashboard.stats.expectedBirths}
            value={nextMonthExpected}
            subtitle={`${t.dashboard.stats.nextMonth} • ${nextThreeMonthsTotal} ${t.dashboard.stats.nextThreeMonths}`}
            icon={<span className="text-lg">📅</span>}
            link={{ to: ROUTES.BIRTH_FORECAST, text: t.dashboard.stats.viewForecast }}
          />

          <StatCard
            title={t.dashboard.additionalStats.employees}
            value={employees.length}
            icon={<span className="text-lg">👥</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.suppliers}
            value={suppliers.length}
            icon={<span className="text-lg">🏭</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.buyers}
            value={buyers.length}
            icon={<span className="text-lg">🛒</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.birthsThisMonth}
            value={birthsThisMonth}
            icon={<span className="text-lg">👶</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.breedingsThisMonth}
            value={breedingsThisMonth}
            icon={<span className="text-lg">💑</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.salesThisMonth}
            value={salesThisMonth}
            subtitle={`${salesMetrics.totalAnimalsSold} ${t.dashboard.additionalStats.animalsSold}`}
            icon={<span className="text-lg">💵</span>}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.financialOverview}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title={t.dashboard.financial.monthlyIncome}
            value={formatCurrency(totalIncome)}
            valueColor="green"
            icon={<span className="text-lg">📈</span>}
          />

          <StatCard
            title={t.dashboard.financial.monthlyExpenses}
            value={formatCurrency(totalExpenses)}
            valueColor="red"
            icon={<span className="text-lg">📉</span>}
          />

          <StatCard
            title={t.dashboard.financial.netCashFlow}
            value={formatCurrency(netCashFlow)}
            valueColor={netCashFlow >= 0 ? "green" : "red"}
            icon={<span className="text-lg">💰</span>}
          />

          <StatCard
            title={t.dashboard.financial.accountsPayable}
            value={formatCurrency(totalAccountsPayable)}
            valueColor="orange"
            icon={<span className="text-lg">📤</span>}
          />

          <StatCard
            title={t.dashboard.financial.accountsReceivable}
            value={formatCurrency(totalAccountsReceivable)}
            valueColor="blue"
            icon={<span className="text-lg">📥</span>}
            link={{ to: ROUTES.FINANCES_DASHBOARD, text: t.dashboard.financial.viewFinances }}
          />

          <StatCard
            title={t.dashboard.financial.totalSalesRevenue}
            value={formatCurrency(salesMetrics.totalRevenue)}
            valueColor="green"
            subtitle={`${t.dashboard.financial.averagePricePerKg}: ${formatCurrency(salesMetrics.averagePricePerKg)}`}
            icon={<span className="text-lg">💰</span>}
            link={{ to: ROUTES.SALES, text: t.dashboard.financial.viewSales }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.charts}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper
            title={t.dashboard.charts.weightTrends}
            isEmpty={weightTrendData.length === 0}
            emptyMessage="No data available"
          >
            <LineChart data={weightTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 12 }}
                label={{
                  value: t.dashboard.charts.averageWeight,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: chartColors.text, fontSize: "12px" },
                }}
              />
              <Tooltip
                {...getTooltipStyle(isDark)}
                formatter={(value: number) => [`${value} kg`, t.dashboard.charts.averageWeight]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
              <Line
                type="monotone"
                dataKey="averageWeight"
                stroke={chartColors.weight}
                strokeWidth={2}
                name={t.dashboard.charts.averageWeight}
                dot={{ fill: chartColors.weight, r: 4 }}
              />
            </LineChart>
          </ChartWrapper>

          <ChartWrapper
            title={t.dashboard.charts.financialTrends}
            isEmpty={financialTrendData.length === 0}
            emptyMessage="No data available"
          >
            <LineChart data={financialTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                {...getTooltipStyle(isDark)}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
              <Line
                type="monotone"
                dataKey="income"
                stroke={chartColors.income}
                strokeWidth={2}
                name={t.dashboard.charts.income}
                dot={{ fill: chartColors.income, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={chartColors.expense}
                strokeWidth={2}
                name={t.dashboard.charts.expenses}
                dot={{ fill: chartColors.expense, r: 4 }}
              />
            </LineChart>
          </ChartWrapper>

          <ChartWrapper
            title="Sales Trends"
            isEmpty={salesTrendData.length === 0}
            emptyMessage="No sales data available"
          >
            <AreaChart data={salesTrendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.income} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors.income} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                {...getTooltipStyle(isDark)}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={chartColors.income}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            </AreaChart>
          </ChartWrapper>

          <ChartWrapper
            title="Animal Distribution by Status"
            isEmpty={animalDistributionByStatus.length === 0}
            emptyMessage="No animal data available"
          >
            <PieChart>
              <Pie
                data={animalDistributionByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {animalDistributionByStatus.map((entry, index) => {
                  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip {...getTooltipStyle(isDark)} />
            </PieChart>
          </ChartWrapper>
        </div>
      </div>

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
                {t.dashboard.recentActivities.noActivities}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  {t.dashboard.sections.noRecentBirths}
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
                  {t.dashboard.sections.noRecentBreedings}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.sections.recentSales}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <div
                    key={sale.id}
                    className={`flex items-center space-x-3 ${
                      index < recentSales.length - 1
                        ? "pb-3 border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm">💵</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {format(parseISO(sale.saleDate), "dd/MM/yyyy")} •{" "}
                        {formatCurrency(sale.totalPrice)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {sale.saleItems.length}{" "}
                        {t.dashboard.additionalStats.animal(sale.saleItems.length)} •{" "}
                        {formatRelativeTime(sale.saleDate, t)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t.dashboard.sections.noRecentSales}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
