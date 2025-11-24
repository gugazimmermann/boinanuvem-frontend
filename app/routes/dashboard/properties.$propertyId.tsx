import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import {
  differenceInMonths,
  differenceInDays,
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import {
  Button,
  StatusBadge,
  Table,
  TableActionButtons,
  ConfirmationModal,
  AnimalRegistrationModal,
  Alert,
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
} from "~/routes.config";
import { getPropertyById } from "~/services/properties.service";
import { getLocationsByPropertyId, getLocationById } from "~/services/locations.service";
import { getEmployeesByPropertyId, getEmployeeById } from "~/services/employees.service";
import {
  getServiceProvidersByPropertyId,
  getServiceProviderById,
} from "~/services/service-providers.service";
import { getSuppliersByPropertyId } from "~/services/suppliers.service";
import { getBuyersByPropertyId } from "~/services/buyers.service";
import { getLocationMovementsByPropertyId } from "~/services/location-movements.service";
import { getAnimalMovementsByPropertyId } from "~/services/animal-movements.service";
import { getAnimalsByPropertyId, deleteAnimal, getAnimalById } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getBreedingsByAnimalId } from "~/services/breedings.service";
import { getExpectedBirthsForecast } from "~/services/reproductive-indexes.service";
import { getCashFlowByPropertyId } from "~/services/cash-flow.service";
import { getAccountsReceivableByPropertyId } from "~/services/accounts-receivable.service";
import { getAccountsPayableByPropertyId } from "~/services/accounts-payable.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import {
  getAnimalViewRoute,
  getAnimalEditRoute,
  getAnimalMovementNewRoute,
  getCashFlowViewRoute,
  getCashFlowEditRoute,
  getAccountsReceivableViewRoute,
  getAccountsReceivableEditRoute,
  getAccountsPayableViewRoute,
  getAccountsPayableEditRoute,
} from "~/routes.config";
import { deleteCashFlow } from "~/services/cash-flow.service";
import { usePermissions } from "~/utils/permissions";
import { deleteAccountsReceivable } from "~/services/accounts-receivable.service";
import { deleteAccountsPayable } from "~/services/accounts-payable.service";
import type {
  Location,
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
} from "~/types";
import { AreaType } from "~/types";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "~/contexts/theme-context";
import { ChartWrapper, getTooltipStyle, getChartColors } from "~/components/dashboard";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import { ReproductiveIndexes } from "~/components/dashboard/reproductive-indexes/reproductive-indexes";

import { formatAreaType } from "~/utils/formatting";

const monthNames = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

interface PropertyFinanceDashboardProps {
  propertyId: string;
}

function PropertyFinanceDashboard({ propertyId }: PropertyFinanceDashboardProps) {
  const t = useTranslation();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cashFlowData = useMemo(() => getCashFlowByPropertyId(propertyId), [propertyId]);
  const accountsPayableData = useMemo(
    () => getAccountsPayableByPropertyId(propertyId),
    [propertyId]
  );
  const accountsReceivableData = useMemo(
    () => getAccountsReceivableByPropertyId(propertyId),
    [propertyId]
  );

  const currentDate = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const currentMonthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  const currentMonthCashFlow = cashFlowData.filter((transaction) => {
    const transactionDate = parseISO(transaction.date);
    return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
  });

  const localeForCurrency = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(localeForCurrency, {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalIncome = currentMonthCashFlow
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthCashFlow
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  const unpaidPayable = accountsPayableData.filter(
    (ap) =>
      ap.status === AccountsPayableStatus.UNPAID || ap.status === AccountsPayableStatus.OVERDUE
  );
  const totalAccountsPayable = unpaidPayable.reduce((sum, ap) => {
    const remainingAmount = ap.paidAmount ? ap.amount - ap.paidAmount : ap.amount;
    return sum + remainingAmount;
  }, 0);

  const unpaidReceivable = accountsReceivableData.filter(
    (ar) =>
      ar.status === AccountsReceivableStatus.UNPAID ||
      ar.status === AccountsReceivableStatus.OVERDUE
  );
  const totalAccountsReceivable = unpaidReceivable.reduce((sum, ar) => {
    const remainingAmount = ar.paidAmount ? ar.amount - ar.paidAmount : ar.amount;
    return sum + remainingAmount;
  }, 0);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const overduePayable = useMemo(
    () =>
      accountsPayableData.filter((ap) => {
        const dueDate = parseISO(ap.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return (
          (ap.status === AccountsPayableStatus.UNPAID ||
            ap.status === AccountsPayableStatus.OVERDUE) &&
          dueDate < today
        );
      }),
    [accountsPayableData, today]
  );

  const overdueReceivable = useMemo(
    () =>
      accountsReceivableData.filter((ar) => {
        const dueDate = parseISO(ar.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return (
          (ar.status === AccountsReceivableStatus.UNPAID ||
            ar.status === AccountsReceivableStatus.OVERDUE) &&
          dueDate < today
        );
      }),
    [accountsReceivableData, today]
  );

  const totalOverduePayable = useMemo(() => {
    return overduePayable.reduce((sum, ap) => {
      const remainingAmount = ap.paidAmount ? ap.amount - ap.paidAmount : ap.amount;
      return sum + remainingAmount;
    }, 0);
  }, [overduePayable]);

  const totalOverdueReceivable = useMemo(() => {
    return overdueReceivable.reduce((sum, ar) => {
      const remainingAmount = ar.paidAmount ? ar.amount - ar.paidAmount : ar.amount;
      return sum + remainingAmount;
    }, 0);
  }, [overdueReceivable]);

  const totalOverdue = totalOverduePayable + totalOverdueReceivable;

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expenses: number; net: number }> =
      {};

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthKey = format(monthDate, "yyyy-MM");
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      months[monthKey] = {
        month: monthNames[monthDate.getMonth()],
        income: 0,
        expenses: 0,
        net: 0,
      };

      cashFlowData.forEach((transaction) => {
        const transactionDate = parseISO(transaction.date);
        if (transactionDate >= monthStart && transactionDate <= monthEnd) {
          if (transaction.type === "income") {
            months[monthKey].income += transaction.amount;
          } else {
            months[monthKey].expenses += transaction.amount;
          }
        }
      });

      months[monthKey].net = months[monthKey].income - months[monthKey].expenses;
    }

    return Object.values(months);
  }, [cashFlowData, currentDate]);

  const expenseCategoriesData = useMemo(() => {
    const categories: Record<string, number> = {};

    cashFlowData.forEach((transaction) => {
      if (transaction.type === "expense") {
        const categoryKey = transaction.category;
        const categoryName = t.cashFlow.categories[categoryKey] || categoryKey;

        if (!categories[categoryName]) {
          categories[categoryName] = 0;
        }

        categories[categoryName] += transaction.amount;
      }
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [cashFlowData, t]);

  const chartColors = getChartColors(isDark);
  const tooltipStyle = getTooltipStyle(isDark);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.totalIncome}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.totalExpenses}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.netCashFlow}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.accountsPayable}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.accountsReceivable}
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(totalAccountsReceivable)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.overdue}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(totalOverdue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          title={t.financesDashboard.charts.incomeVsExpenses}
          isEmpty={monthlyData.length === 0}
          emptyMessage={t.financesDashboard.charts.noData}
        >
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
            <YAxis
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => t.common.currency.formatShort(value)}
            />
            <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
            <Line
              type="monotone"
              dataKey="income"
              stroke={chartColors.income}
              strokeWidth={2}
              name={t.financesDashboard.charts.income}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke={chartColors.expense}
              strokeWidth={2}
              name={t.financesDashboard.charts.expenses}
            />
          </LineChart>
        </ChartWrapper>

        <ChartWrapper
          title={t.financesDashboard.charts.monthlyCashFlow}
          isEmpty={monthlyData.length === 0}
          emptyMessage={t.financesDashboard.charts.noData}
        >
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.net} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.net} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
            <YAxis
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => t.common.currency.formatShort(value)}
            />
            <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
            <Area
              type="monotone"
              dataKey="net"
              stroke={chartColors.net}
              fillOpacity={1}
              fill="url(#colorNet)"
              name={t.financesDashboard.charts.netCashFlow}
            />
          </AreaChart>
        </ChartWrapper>

        <ChartWrapper
          title={t.financesDashboard.charts.expenseCategories}
          isEmpty={expenseCategoriesData.length === 0}
          emptyMessage={t.financesDashboard.charts.noData}
          height={400}
          className="lg:col-span-2"
        >
          <BarChart data={expenseCategoriesData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis
              type="number"
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => t.common.currency.formatShort(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: chartColors.text, fontSize: 11 }}
              width={150}
            />
            <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
            <Bar
              dataKey="value"
              fill={chartColors.expense}
              name={t.financesDashboard.charts.expenses}
            />
          </BarChart>
        </ChartWrapper>
      </div>
    </div>
  );
}

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

export default function PropertyDetails() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit, canRemove, isMainUser } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const property = getPropertyById(propertyId);

  const tabParam = searchParams.get("tab");
  const subTabParam = searchParams.get("subTab");

  const activeTab =
    tabParam === "info" ||
    tabParam === "animals" ||
    tabParam === "locations" ||
    tabParam === "registrations" ||
    tabParam === "activities" ||
    tabParam === "movements" ||
    tabParam === "finance" ||
    tabParam === "indices-reprodutivos"
      ? tabParam
      : "information";

  const registrationsSubTab =
    subTabParam === "serviceProviders" || subTabParam === "suppliers" || subTabParam === "buyers"
      ? subTabParam
      : activeTab === "registrations"
        ? "employees"
        : "employees";

  const financeSubTab =
    subTabParam === "transactions"
      ? "transactions"
      : activeTab === "finance"
        ? "dashboard"
        : "dashboard";

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
  const [isDeleteFinanceModalOpen, setIsDeleteFinanceModalOpen] = useState(false);
  const [selectedFinanceTransaction, setSelectedFinanceTransaction] = useState<
    CashFlow | AccountsReceivable | AccountsPayable | null
  >(null);
  const [selectedFinanceTransactionType, setSelectedFinanceTransactionType] = useState<
    "cashFlow" | "receivable" | "payable" | null
  >(null);
  const financeItemsPerPage = 10;

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
  const [isDeleteAnimalModalOpen, setIsDeleteAnimalModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const [isAnimalRegistrationModalOpen, setIsAnimalRegistrationModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const expectedBirthsForecast = useMemo(() => {
    if (!property) return { monthly: [], total: 0 };
    return getExpectedBirthsForecast(property.id, { isPropertyId: true, monthsAhead: 9 });
  }, [property]);

  const nextMonthExpected = useMemo(() => {
    if (!expectedBirthsForecast.monthly || expectedBirthsForecast.monthly.length === 0) return 0;
    const today = new Date();
    const nextMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}`;
    const nextMonth = expectedBirthsForecast.monthly.find((item) => item.month === nextMonthKey);
    return nextMonth?.expectedBirths || 0;
  }, [expectedBirthsForecast.monthly]);

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

  const localeForDateTime = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";

  if (!property) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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
  const propertyAnimals = allPropertyAnimals.filter((animal) => animal.status === "active");
  const animalsCount = propertyAnimals.length;

  const calculateTotalWeight = () => {
    let totalWeight = 0;
    propertyAnimals.forEach((animal) => {
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

  const areaInHectares = property ? convertToHectares(property.area.value, property.area.type) : 0;
  const stockingRate = areaInHectares > 0 && animalUnits > 0 ? animalUnits / areaInHectares : 0;
  const density = areaInHectares > 0 && animalsCount > 0 ? animalsCount / areaInHectares : 0;
  const averageWeight = animalsCount > 0 ? totalWeight / animalsCount : 0;

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
            {t.team.new.back}
          </Button>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label={t.common.ariaLabels.tabs}>
          <button
            onClick={() => {
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
              setSearchParams({ tab: "indices-reprodutivos" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "indices-reprodutivos"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "indices-reprodutivos"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.reproductiveIndexes}
          </button>
          <button
            onClick={() => {
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
              setSearchParams({ tab: "registrations", subTab: "employees" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "registrations"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "registrations"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.registrations}
          </button>
          <button
            onClick={() => {
              setSearchParams({ tab: "finance", subTab: "dashboard" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "finance"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "finance"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.finance}
          </button>
          {isMainUser() && (
            <button
              onClick={() => {
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
          )}
        </nav>
      </div>

      {activeTab === "information" && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Informações Gerais
              </h2>
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
                      {animalsCount.toLocaleString()}
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
                      {t.dashboard.stats.nextMonth} • {expectedBirthsForecast.total}{" "}
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
                const employees = getEmployeesByPropertyId(property.id);
                const serviceProviders = getServiceProvidersByPropertyId(property.id);
                const suppliers = getSuppliersByPropertyId(property.id);
                const buyers = getBuyersByPropertyId(property.id);

                return (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {t.properties.details.tabs.employees}
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

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {t.properties.details.tabs.serviceProviders}
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                            {serviceProviders.length}
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
                            {suppliers.length}
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
                            {buyers.length}
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
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {t.properties.details.pasturePlanning.breedingSeason.noData}
              </p>
            )}
          </div>
        </div>
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
              aValue = aBirth?.birthDate ? new Date(aBirth.birthDate).getTime() : 0;
              bValue = bBirth?.birthDate ? new Date(bBirth.birthDate).getTime() : 0;
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
              comparison = aValue.localeCompare(bValue, localeForDateTime, {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
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
                  <span className="text-gray-700 dark:text-gray-300">
                    {t.animals.purity[birth.purity]}
                  </span>
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
                const formattedDate = format(birthDate, "dd/MM/yyyy", { locale: dateLocale });

                return (
                  <UITooltip content={formattedDate}>
                    <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      {months} {months === 1 ? t.common.month : t.common.months}
                    </span>
                  </UITooltip>
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
                const formattedDate = format(acquisitionDate, "dd/MM/yyyy", { locale: dateLocale });

                return (
                  <UITooltip content={formattedDate}>
                    <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      {months} {months === 1 ? t.common.month : t.common.months}
                    </span>
                  </UITooltip>
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
                if (!lastWeighing)
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;

                const formattedDate = format(new Date(lastWeighing.date), "dd/MM/yyyy", {
                  locale: dateLocale,
                });
                const today = new Date();
                const weighingDate = new Date(lastWeighing.date);
                const daysAgo = differenceInDays(today, weighingDate);
                const tooltipText = t.common.daysAgo(daysAgo);

                return (
                  <UITooltip content={tooltipText}>
                    <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                      {formattedDate}
                    </span>
                  </UITooltip>
                );
              },
            },
            {
              key: "gmd",
              label: (
                <UITooltip content={t.common.dailyAverageGain} position="bottom">
                  <span className="border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-help">
                    {t.animals.table.gmd}
                  </span>
                </UITooltip>
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
              key: "breedingStatus",
              label: t.animals.table.breedingStatus,
              sortable: false,
              render: (_, row) => {
                const birth = getBirthByAnimalId(row.id);
                if (!birth || birth.gender !== "female") {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }
                const breedings = getBreedingsByAnimalId(row.id);
                if (breedings.length === 0) {
                  return <span className="text-gray-700 dark:text-gray-300">-</span>;
                }
                const hasConfirmed = breedings.some((b) => b.confirmed === true);

                if (hasConfirmed) {
                  return (
                    <StatusBadge label={t.animals.table.breedingStatusPregnant} variant="success" />
                  );
                } else {
                  return (
                    <StatusBadge label={t.animals.table.breedingStatusPregnant} variant="warning" />
                  );
                }
              },
            },
            {
              key: "status",
              label: t.animals.table.status,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={
                    row.status === "active" ? t.animals.table.active : t.animals.table.inactive
                  }
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
                  canEdit={canEdit("registration", "animals")}
                  canDelete={canRemove("registration", "animals")}
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
                    newSelection.forEach((id) => {
                      if (typeof id === "string") {
                        stringSet.add(id);
                      }
                    });
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
              comparison = aValue.localeCompare(bValue, localeForDateTime, {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
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
                  onAddNew: () => navigate(ROUTES.LOCATIONS_NEW),
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
              <button
                onClick={() => {
                  setSearchParams({ tab: "registrations", subTab: "employees" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    registrationsSubTab === "employees"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  registrationsSubTab === "employees"
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
                  setSearchParams({ tab: "registrations", subTab: "serviceProviders" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    registrationsSubTab === "serviceProviders"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  registrationsSubTab === "serviceProviders"
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
                  setSearchParams({ tab: "registrations", subTab: "suppliers" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    registrationsSubTab === "suppliers"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  registrationsSubTab === "suppliers"
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
                  setSearchParams({ tab: "registrations", subTab: "buyers" });
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    registrationsSubTab === "buyers"
                      ? "shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }
                `}
                style={
                  registrationsSubTab === "buyers"
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

          {registrationsSubTab === "employees" &&
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
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
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
                      onAddNew: () => navigate(ROUTES.EMPLOYEES_NEW),
                      addNewLabel: t.employees.addEmployee,
                    }}
                  />
                </div>
              );
            })()}

          {registrationsSubTab === "serviceProviders" &&
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
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
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
                      onAddNew: () => navigate(ROUTES.SERVICE_PROVIDERS_NEW),
                      addNewLabel: t.serviceProviders.addServiceProvider,
                    }}
                  />
                </div>
              );
            })()}

          {registrationsSubTab === "suppliers" &&
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
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
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
                      onAddNew: () => navigate(ROUTES.SUPPLIERS_NEW),
                      addNewLabel: t.suppliers.addSupplier,
                    }}
                  />
                </div>
              );
            })()}

          {registrationsSubTab === "buyers" &&
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
                  comparison = aValue.localeCompare(bValue, localeForDateTime, {
                    sensitivity: "base",
                  });
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                  comparison = aValue - bValue;
                } else {
                  comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
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
                      onAddNew: () => navigate(ROUTES.BUYERS_NEW),
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
          const locationMovements = getLocationMovementsByPropertyId(property.id);
          const animalMovements = getAnimalMovementsByPropertyId(property.id);

          type UnifiedMovement =
            | (LocationMovement & { movementType: "location" } & Record<string, unknown>)
            | (AnimalMovement & { movementType: "animal" } & Record<string, unknown>);

          const movements: UnifiedMovement[] = [
            ...locationMovements.map((m) => ({ ...m, movementType: "location" as const })),
            ...animalMovements.map((m) => ({ ...m, movementType: "animal" as const })),
          ];

          const filteredMovements = movements.filter((movement) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            if (movement.movementType === "location") {
              const typeText =
                t.properties.details.movements.types[
                  (movement as LocationMovement)
                    .type as keyof typeof t.properties.details.movements.types
                ] || (movement as LocationMovement).type;
              if (typeText.toLowerCase().includes(searchLower)) return true;
            } else {
              const animalMovementText =
                t.properties.details.movements.types.animal_movement.toLowerCase();
              if (
                animalMovementText.includes(searchLower) ||
                "animal".toLowerCase().includes(searchLower)
              )
                return true;
            }

            const dateText = formatDate(movement.date);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            const locationIds =
              movement.movementType === "location"
                ? (movement as LocationMovement).locationIds
                : [(movement as AnimalMovement).locationId];
            const locationNames = locationIds
              .map((id) => {
                const location = getLocationById(id);
                return location
                  ? `${location.name} ${location.code}`.toLowerCase()
                  : id.toLowerCase();
              })
              .join(" ");
            if (locationNames.includes(searchLower)) return true;

            if (movement.movementType === "animal") {
              const animalNames = (movement as AnimalMovement).animalIds
                .map((id) => {
                  const animal = getAnimalById(id);
                  return animal ? `${animal.code} ${animal.registrationNumber}`.toLowerCase() : "";
                })
                .filter((name) => name !== "")
                .join(" ");
              if (animalNames.includes(searchLower)) return true;
            }

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
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (sortState.column === "date") {
              aValue = new Date(a.date).getTime();
              bValue = new Date(b.date).getTime();
            } else if (sortState.column === "locations") {
              const aLocationIds =
                a.movementType === "location"
                  ? (a as LocationMovement).locationIds
                  : [(a as AnimalMovement).locationId];
              const bLocationIds =
                b.movementType === "location"
                  ? (b as LocationMovement).locationIds
                  : [(b as AnimalMovement).locationId];
              const aLocationNames = aLocationIds
                .map((id) => {
                  const location = getLocationById(id);
                  return location ? `${location.name} (${location.code})` : id;
                })
                .sort()
                .join(", ");
              const bLocationNames = bLocationIds
                .map((id) => {
                  const location = getLocationById(id);
                  return location ? `${location.name} (${location.code})` : id;
                })
                .sort()
                .join(", ");
              aValue = aLocationNames;
              bValue = bLocationNames;
            } else if (sortState.column === "type") {
              if (a.movementType === "location") {
                aValue = (a as LocationMovement).type;
              } else {
                aValue = "animal";
              }
              if (b.movementType === "location") {
                bValue = (b as LocationMovement).type;
              } else {
                bValue = "animal";
              }
            } else {
              if (a.movementType === "location") {
                aValue = (a as LocationMovement)[sortState.column as keyof LocationMovement] as
                  | string
                  | number
                  | undefined;
              } else {
                aValue = (a as AnimalMovement)[sortState.column as keyof AnimalMovement] as
                  | string
                  | number
                  | undefined;
              }
              if (b.movementType === "location") {
                bValue = (b as LocationMovement)[sortState.column as keyof LocationMovement] as
                  | string
                  | number
                  | undefined;
              } else {
                bValue = (b as AnimalMovement)[sortState.column as keyof AnimalMovement] as
                  | string
                  | number
                  | undefined;
              }
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
              comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
          const paginatedMovements = sortedMovements.slice(
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
                } else {
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {t.properties.details.movements.types.animal_movement}
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
                const locationIds =
                  row.movementType === "location"
                    ? (row as LocationMovement).locationIds
                    : [(row as AnimalMovement).locationId];
                const locationNames = locationIds
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
              key: "animals",
              label: "Animais",
              sortable: false,
              render: (_, row) => {
                if (row.movementType === "animal") {
                  const count = (row as AnimalMovement).animalIds.length;
                  return <span className="text-gray-700 dark:text-gray-300">{count}</span>;
                }
                return <span className="text-gray-400 dark:text-gray-500">-</span>;
              },
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
            {
              key: "observation",
              label: t.properties.details.movements.observation,
              sortable: false,
              render: (_, row) => {
                const observation =
                  row.movementType === "location"
                    ? (row as LocationMovement).observation
                    : (row as AnimalMovement).observation;
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
            <div className="space-y-8">
              <Table<UnifiedMovement>
                columns={columns}
                data={paginatedMovements}
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
                <PropertyFinanceDashboard propertyId={property.id} />
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

                  const cashFlowTransactions = getCashFlowByPropertyId(property.id);
                  const receivableTransactions = getAccountsReceivableByPropertyId(property.id);
                  const payableTransactions = getAccountsPayableByPropertyId(property.id);

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

                  const handleDeleteFinanceClick = (transaction: UnifiedTransaction) => {
                    let originalTransaction:
                      | CashFlow
                      | AccountsReceivable
                      | AccountsPayable
                      | null = null;
                    let transactionType: "cashFlow" | "receivable" | "payable" | null = null;

                    if (transaction.transactionType === "cashFlow") {
                      const found = cashFlowTransactions.find((t) => t.id === transaction.id);
                      if (found) {
                        originalTransaction = found;
                        transactionType = "cashFlow";
                      }
                    } else if (transaction.transactionType === "receivable") {
                      const found = receivableTransactions.find((t) => t.id === transaction.id);
                      if (found) {
                        originalTransaction = found;
                        transactionType = "receivable";
                      }
                    } else if (transaction.transactionType === "payable") {
                      const found = payableTransactions.find((t) => t.id === transaction.id);
                      if (found) {
                        originalTransaction = found;
                        transactionType = "payable";
                      }
                    }

                    if (originalTransaction && transactionType) {
                      setSelectedFinanceTransaction(originalTransaction);
                      setSelectedFinanceTransactionType(transactionType);
                      setIsDeleteFinanceModalOpen(true);
                    }
                  };

                  const handleDeleteFinanceTransaction = async () => {
                    if (!selectedFinanceTransaction || !selectedFinanceTransactionType) return;

                    let success = false;
                    if (selectedFinanceTransactionType === "cashFlow") {
                      success = deleteCashFlow(selectedFinanceTransaction.id);
                    } else if (selectedFinanceTransactionType === "receivable") {
                      success = deleteAccountsReceivable(selectedFinanceTransaction.id);
                    } else if (selectedFinanceTransactionType === "payable") {
                      success = deleteAccountsPayable(selectedFinanceTransaction.id);
                    }

                    if (success) {
                      showAlert(t.cashFlow.success.deleted, "success");
                    } else {
                      showAlert(t.cashFlow.errors.deleteFailed, "error");
                    }
                    setSelectedFinanceTransaction(null);
                    setSelectedFinanceTransactionType(null);
                  };

                  const filteredFinanceData = allTransactions.filter((transaction) => {
                    let matchesSearch: boolean;
                    if (!financeSearchValue) {
                      matchesSearch = true;
                    } else {
                      const searchLower = financeSearchValue.toLowerCase();
                      const property = transaction.propertyId
                        ? getPropertyById(transaction.propertyId)
                        : null;
                      const propertyName = property?.name?.toLowerCase() || "";
                      const category = transaction.category
                        ? (t.cashFlow.categories as Record<string, string>)[
                            transaction.category
                          ]?.toLowerCase() || ""
                        : "";
                      const paymentMethod = transaction.paymentMethod
                        ? (t.cashFlow.paymentMethods as Record<string, string>)[
                            transaction.paymentMethod
                          ]?.toLowerCase() || ""
                        : "";
                      const amount = formatCurrency(transaction.amount).toLowerCase();

                      let supplierName = "";
                      if (transaction.supplierId) {
                        const supplier = getSupplierById(transaction.supplierId);
                        supplierName = supplier?.name?.toLowerCase() || "";
                      }

                      let buyerName = "";
                      if (transaction.buyerId) {
                        const buyer = getBuyerById(transaction.buyerId);
                        buyerName = buyer?.name?.toLowerCase() || "";
                      }

                      let employeeName = "";
                      if (transaction.employeeId) {
                        const employee = getEmployeeById(transaction.employeeId);
                        employeeName = employee?.name?.toLowerCase() || "";
                      }

                      let serviceProviderName = "";
                      if (transaction.serviceProviderId) {
                        const serviceProvider = getServiceProviderById(
                          transaction.serviceProviderId
                        );
                        serviceProviderName = serviceProvider?.name?.toLowerCase() || "";
                      }

                      matchesSearch =
                        transaction.description.toLowerCase().includes(searchLower) ||
                        transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
                        propertyName.includes(searchLower) ||
                        category.includes(searchLower) ||
                        paymentMethod.includes(searchLower) ||
                        amount.includes(searchLower) ||
                        supplierName.includes(searchLower) ||
                        buyerName.includes(searchLower) ||
                        employeeName.includes(searchLower) ||
                        serviceProviderName.includes(searchLower);
                    }

                    const matchesFilter =
                      financeActiveFilter === "all" ||
                      (financeActiveFilter === "income" && transaction.type === "income") ||
                      (financeActiveFilter === "expense" && transaction.type === "expense");

                    const matchesYear =
                      financeSelectedYear === "all" ||
                      transaction.date.startsWith(financeSelectedYear);
                    const monthStr =
                      financeSelectedMonth === "all" ? null : financeSelectedMonth.padStart(2, "0");
                    const matchesMonth =
                      financeSelectedMonth === "all" ||
                      (monthStr && transaction.date.substring(5, 7) === monthStr);

                    return matchesSearch && matchesFilter && matchesYear && matchesMonth;
                  });

                  const sortedFinanceData = [...filteredFinanceData].sort((a, b) => {
                    if (!financeSortState.column || !financeSortState.direction) {
                      return 0;
                    }

                    const aValue = a[financeSortState.column];
                    const bValue = b[financeSortState.column];

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
                      comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
                    }

                    return financeSortState.direction === "asc" ? comparison : -comparison;
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

                  const getStatusVariant = (status: string, transactionType: string) => {
                    if (transactionType === "cashFlow") {
                      return "success";
                    }
                    switch (status) {
                      case "paid":
                        return "success";
                      case "overdue":
                        return "danger";
                      case "partial":
                        return "warning";
                      default:
                        return "default";
                    }
                  };

                  const getStatusLabel = (status: string, transactionType: string) => {
                    if (transactionType === "cashFlow") {
                      return t.cashFlow.table.completed;
                    }
                    if (transactionType === "receivable") {
                      return (
                        t.accountsReceivable.status[
                          status as keyof typeof t.accountsReceivable.status
                        ] || status
                      );
                    }
                    if (transactionType === "payable") {
                      return (
                        t.accountsPayable.status[status as keyof typeof t.accountsPayable.status] ||
                        status
                      );
                    }
                    return status;
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
                          {row.transactionType === "cashFlow"
                            ? formatDate(row.date)
                            : formatDate(row.date)}
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
                      render: (_, row) => {
                        if (row.type === "expense" && row.supplierId) {
                          const supplier = getSupplierById(row.supplierId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {supplier?.name || "-"}
                            </span>
                          );
                        }
                        if (row.type === "expense" && row.employeeId) {
                          const employee = getEmployeeById(row.employeeId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {employee?.name || "-"}
                            </span>
                          );
                        }
                        if (row.type === "expense" && row.serviceProviderId) {
                          const serviceProvider = getServiceProviderById(row.serviceProviderId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {serviceProvider?.name || "-"}
                            </span>
                          );
                        }
                        if (row.type === "income" && row.buyerId) {
                          const buyer = getBuyerById(row.buyerId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {buyer?.name || "-"}
                            </span>
                          );
                        }
                        if (row.type === "income" && row.serviceProviderId) {
                          const serviceProvider = getServiceProviderById(row.serviceProviderId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {serviceProvider?.name || "-"}
                            </span>
                          );
                        }
                        return <span className="text-gray-400 dark:text-gray-500">-</span>;
                      },
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
                          variant={getStatusVariant(row.status, row.transactionType)}
                        />
                      ),
                    },
                    {
                      key: "actions",
                      label: "",
                      headerClassName: "relative",
                      render: (_, row) => {
                        const getEditRoute = () => {
                          if (row.transactionType === "cashFlow") {
                            return getCashFlowEditRoute(row.id);
                          } else if (row.transactionType === "receivable") {
                            return getAccountsReceivableEditRoute(row.id);
                          } else {
                            return getAccountsPayableEditRoute(row.id);
                          }
                        };

                        const getCanEdit = () => {
                          if (row.transactionType === "cashFlow") {
                            return canEdit("finances", "cashFlow");
                          } else if (row.transactionType === "receivable") {
                            return canEdit("finances", "accountsReceivable");
                          } else {
                            return canEdit("finances", "accountsPayable");
                          }
                        };

                        const getCanDelete = () => {
                          if (row.transactionType === "cashFlow") {
                            return canRemove("finances", "cashFlow");
                          } else if (row.transactionType === "receivable") {
                            return canRemove("finances", "accountsReceivable");
                          } else {
                            return canRemove("finances", "accountsPayable");
                          }
                        };

                        return (
                          <TableActionButtons
                            onEdit={() => navigate(getEditRoute())}
                            onDelete={() => handleDeleteFinanceClick(row)}
                            canEdit={getCanEdit()}
                            canDelete={getCanDelete()}
                          />
                        );
                      },
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

                    options.push({
                      value: String(currentYear - 1),
                      label: String(currentYear - 1),
                    });
                    options.push({ value: String(currentYear), label: String(currentYear) });

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
                        isOpen={isDeleteFinanceModalOpen}
                        onClose={() => {
                          setIsDeleteFinanceModalOpen(false);
                          setSelectedFinanceTransaction(null);
                        }}
                        onConfirm={handleDeleteFinanceTransaction}
                        title={t.cashFlow.deleteModal.title}
                        message={t.cashFlow.deleteModal.message(
                          (
                            selectedFinanceTransaction as
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
