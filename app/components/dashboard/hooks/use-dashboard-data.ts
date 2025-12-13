import { useMemo, useState, useEffect } from "react";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { getProperties } from "~/services/properties.service";
import { getLocations } from "~/services/locations.service";
import type {
  Property,
  Location,
  Employee,
  Supplier,
  Buyer,
  Animal,
  Birth,
  Breeding,
  CashFlow,
  AccountsPayable,
  AccountsReceivable,
} from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import { getAnimalsByCompanyId, getAnimalsByPropertyId } from "~/services/animals.service";
import { getWeighingsByCompanyId } from "~/services/weighings.service";
import { getExpectedBirthsForecast } from "~/services/reproductive-indexes.service";
import { getCashFlowByCompanyId } from "~/services/cash-flow.service";
import { getAccountsPayableByCompanyId } from "~/services/accounts-payable.service";
import { getAccountsReceivableByCompanyId } from "~/services/accounts-receivable.service";
import { getBirthsByCompanyId, getBirthsByPropertyId } from "~/services/births.service";
import { getBreedingsByCompanyId, getBreedingsByPropertyId } from "~/services/breedings.service";
import { getEmployees } from "~/services/employees.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getBuyers } from "~/services/buyers.service";
import { getSalesByCompanyId } from "~/services/sales.service";
import { getSalesMetrics } from "~/services/sales-analytics.service";
import { convertToHectares } from "~/utils/area";
import { ANIMAL_UNIT_WEIGHT_KG } from "~/utils/constants";

export interface DashboardFilters {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
}

export function useDashboardData(companyId: string, filters?: DashboardFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesData, locationsData, employeesData, suppliersData, buyersData] =
          await Promise.all([
            getProperties(),
            getLocations(),
            getEmployees(),
            getSuppliers(),
            getBuyers(),
          ]);
        // Filter by companyId
        setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
        setLocations(locationsData.filter((loc) => loc.companyId === companyId));
        setEmployees(employeesData.filter((emp) => emp.companyId === companyId));
        setSuppliers(suppliersData.filter((sup) => sup.companyId === companyId));
        setBuyers(buyersData.filter((buy) => buy.companyId === companyId));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };
    fetchData();
  }, [companyId]);

  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        if (filters?.propertyId) {
          const animalsData = await getAnimalsByPropertyId(filters.propertyId);
          setAllAnimals(animalsData || []);
        } else {
          const animalsData = await getAnimalsByCompanyId(companyId);
          setAllAnimals(animalsData || []);
        }
      } catch (error) {
        console.error("Failed to load animals:", error);
        setAllAnimals([]);
      }
    };
    loadAnimals();
  }, [companyId, filters?.propertyId]);

  const animals = useMemo(
    () => allAnimals.filter((animal) => animal.status === "active"),
    [allAnimals]
  );

  const totalAnimals = animals.length;
  const totalProperties = properties.length;
  const totalLocations = locations.length;

  const [allWeighingsData, setAllWeighingsData] = useState<
    Awaited<ReturnType<typeof getWeighingsByCompanyId>>
  >([]);

  useEffect(() => {
    const loadWeighings = async () => {
      try {
        const weighings = await getWeighingsByCompanyId(companyId);
        setAllWeighingsData(weighings);
      } catch (error) {
        console.error("Failed to load weighings:", error);
        setAllWeighingsData([]);
      }
    };
    loadWeighings();
  }, [companyId]);

  const totalWeight = useMemo(() => {
    const allWeighingsDataLocal = allWeighingsData;

    let filteredWeighings = allWeighingsDataLocal;
    if (filters?.propertyId) {
      const propertyAnimalIds = new Set(animals.map((a) => a.id));
      filteredWeighings = allWeighingsDataLocal.filter((weighing) =>
        propertyAnimalIds.has(weighing.animalId)
      );
    }

    const lastWeighingByAnimal = new Map<string, { weight: number; date: string }>();
    for (const weighing of filteredWeighings) {
      const existing = lastWeighingByAnimal.get(weighing.animalId);
      if (!existing || new Date(weighing.date).getTime() > new Date(existing.date).getTime()) {
        lastWeighingByAnimal.set(weighing.animalId, {
          weight: weighing.weight,
          date: weighing.date,
        });
      }
    }

    let weight = 0;
    for (const weighing of lastWeighingByAnimal.values()) {
      weight += weighing.weight;
    }

    return weight;
  }, [animals, filters, allWeighingsData]);

  const animalUnits = useMemo(
    () => (totalWeight > 0 ? totalWeight / ANIMAL_UNIT_WEIGHT_KG : 0),
    [totalWeight]
  );

  const totalAreaInHectares = useMemo(() => {
    if (filters?.propertyId) {
      const property = properties.find((p) => p.id === filters.propertyId);
      return property ? convertToHectares(property.area.value, property.area.type) : 0;
    }
    return properties.reduce((sum, property) => {
      return sum + convertToHectares(property.area.value, property.area.type);
    }, 0);
  }, [filters, properties]);

  const stockingRate = useMemo(
    () => (totalAreaInHectares > 0 && animalUnits > 0 ? animalUnits / totalAreaInHectares : 0),
    [totalAreaInHectares, animalUnits]
  );

  const [expectedBirthsForecast, setExpectedBirthsForecast] = useState<Awaited<
    ReturnType<typeof getExpectedBirthsForecast>
  > | null>(null);

  useEffect(() => {
    const loadExpectedBirthsForecast = async () => {
      try {
        const forecast = await getExpectedBirthsForecast(companyId, {
          isPropertyId: false,
          monthsAhead: 9,
        });
        setExpectedBirthsForecast(forecast);
      } catch (error) {
        console.error("Failed to load expected births forecast:", error);
        setExpectedBirthsForecast(null);
      }
    };
    loadExpectedBirthsForecast();
  }, [companyId]);

  const nextMonthExpected = useMemo(() => {
    if (!expectedBirthsForecast?.monthly || expectedBirthsForecast.monthly.length === 0) return 0;
    const today = new Date();
    const nextMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}`;
    const nextMonth = expectedBirthsForecast.monthly.find((item) => item.month === nextMonthKey);
    return nextMonth?.expectedBirths || 0;
  }, [expectedBirthsForecast]);

  const nextThreeMonthsTotal = expectedBirthsForecast?.total || 0;

  const [cashFlowData, setCashFlowData] = useState<CashFlow[]>([]);

  useEffect(() => {
    const loadCashFlow = async () => {
      try {
        const allCashFlow = await getCashFlowByCompanyId(companyId);
        if (!filters?.startDate && !filters?.endDate) {
          setCashFlowData(allCashFlow);
          return;
        }
        const filtered = allCashFlow.filter((transaction) => {
          const transactionDate = parseISO(transaction.date);
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            if (transactionDate < start) return false;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            if (transactionDate > end) return false;
          }
          return true;
        });
        setCashFlowData(filtered);
      } catch (error) {
        console.error("Failed to load cash flow:", error);
        setCashFlowData([]);
      }
    };
    loadCashFlow();
  }, [companyId, filters?.startDate, filters?.endDate]);

  const [accountsPayableData, setAccountsPayableData] = useState<AccountsPayable[]>([]);

  useEffect(() => {
    const loadAccountsPayable = async () => {
      try {
        const data = await getAccountsPayableByCompanyId(companyId);
        setAccountsPayableData(data);
      } catch (error) {
        console.error("Failed to load accounts payable:", error);
        setAccountsPayableData([]);
      }
    };
    loadAccountsPayable();
  }, [companyId]);

  const [accountsReceivableData, setAccountsReceivableData] = useState<AccountsReceivable[]>([]);

  useEffect(() => {
    const loadAccountsReceivable = async () => {
      try {
        const data = await getAccountsReceivableByCompanyId(companyId);
        setAccountsReceivableData(data);
      } catch (error) {
        console.error("Failed to load accounts receivable:", error);
        setAccountsReceivableData([]);
      }
    };
    loadAccountsReceivable();
  }, [companyId]);

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

  // employees, suppliers, and buyers are now loaded via useEffect above

  const [births, setBirths] = useState<Birth[]>([]);

  useEffect(() => {
    const loadBirths = async () => {
      try {
        const allBirthsData = filters?.propertyId
          ? await getBirthsByPropertyId(filters.propertyId)
          : await getBirthsByCompanyId(companyId);

        const allBirths = allBirthsData || [];

        if (!filters?.startDate && !filters?.endDate) {
          setBirths(allBirths);
          return;
        }

        const filtered = allBirths.filter((birth) => {
          const birthDate = parseISO(birth.birthDate);
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            if (birthDate < start) return false;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            if (birthDate > end) return false;
          }
          return true;
        });

        setBirths(filtered);
      } catch (error) {
        console.error("Failed to load births:", error);
        setBirths([]);
      }
    };
    loadBirths();
  }, [companyId, filters?.propertyId, filters?.startDate, filters?.endDate]);

  const [breedings, setBreedings] = useState<Breeding[]>([]);

  useEffect(() => {
    const loadBreedings = async () => {
      try {
        let allBreedings: Breeding[];

        if (filters?.propertyId) {
          const breedingsData = await getBreedingsByPropertyId(filters.propertyId);
          allBreedings = breedingsData || [];
        } else {
          const breedingsData = await getBreedingsByCompanyId(companyId);
          allBreedings = breedingsData || [];
        }

        if (!filters?.startDate && !filters?.endDate) {
          setBreedings(allBreedings);
          return;
        }

        const filtered = allBreedings.filter((breeding) => {
          const breedingDate = parseISO(breeding.date);
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            if (breedingDate < start) return false;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            if (breedingDate > end) return false;
          }
          return true;
        });

        setBreedings(filtered);
      } catch (error) {
        console.error("Failed to load breedings:", error);
        setBreedings([]);
      }
    };
    loadBreedings();
  }, [companyId, filters?.propertyId, filters?.startDate, filters?.endDate]);

  const [allSalesData, setAllSalesData] = useState<Awaited<ReturnType<typeof getSalesByCompanyId>>>(
    []
  );

  useEffect(() => {
    const loadSales = async () => {
      try {
        const sales = await getSalesByCompanyId(companyId);
        setAllSalesData(sales);
      } catch (error) {
        console.error("Failed to load sales:", error);
        setAllSalesData([]);
      }
    };
    loadSales();
  }, [companyId]);

  const sales = useMemo(() => {
    const allSales = allSalesData;
    let filtered = allSales;

    if (filters?.propertyId) {
      filtered = filtered.filter((sale) => sale.propertyId === filters.propertyId);
    }

    if (filters?.startDate || filters?.endDate) {
      filtered = filtered.filter((sale) => {
        const saleDate = parseISO(sale.saleDate);
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          if (saleDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (saleDate > end) return false;
        }
        return true;
      });
    }

    return filtered;
  }, [allSalesData, filters]);

  const [salesMetrics, setSalesMetrics] = useState<Awaited<
    ReturnType<typeof getSalesMetrics>
  > | null>(null);

  useEffect(() => {
    const loadSalesMetrics = async () => {
      try {
        const metrics = await getSalesMetrics(companyId, {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          propertyId: filters?.propertyId,
        });
        setSalesMetrics(metrics);
      } catch (error) {
        console.error("Failed to load sales metrics:", error);
        setSalesMetrics(null);
      }
    };
    loadSalesMetrics();
  }, [companyId, filters?.startDate, filters?.endDate, filters?.propertyId]);

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

  const allWeighings = useMemo(() => {
    const allWeighingsDataLocal = allWeighingsData;

    let filtered = allWeighingsDataLocal;
    if (filters?.propertyId) {
      const propertyAnimalIds = new Set(allAnimals.map((a) => a.id));
      filtered = filtered.filter((weighing) => propertyAnimalIds.has(weighing.animalId));
    }

    if (filters?.startDate || filters?.endDate) {
      filtered = filtered.filter((weighing) => {
        const weighingDate = parseISO(weighing.date);
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          if (weighingDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (weighingDate > end) return false;
        }
        return true;
      });
    }

    return filtered;
  }, [allWeighingsData, filters, allAnimals]);

  return {
    animals,
    totalAnimals,
    totalProperties,
    totalLocations,
    totalWeight,
    animalUnits,
    totalAreaInHectares,
    stockingRate,
    expectedBirthsForecast,
    nextMonthExpected,
    nextThreeMonthsTotal,
    cashFlowData,
    accountsPayableData,
    accountsReceivableData,
    currentDate,
    currentMonthStart,
    currentMonthEnd,
    currentMonthCashFlow,
    totalIncome,
    totalExpenses,
    netCashFlow,
    totalAccountsPayable,
    totalAccountsReceivable,
    employees,
    suppliers,
    buyers,
    births,
    breedings,
    sales,
    salesMetrics,
    salesThisMonth,
    recentSales,
    birthsThisMonth,
    breedingsThisMonth,
    recentBirths,
    recentBreedings,
    allWeighings,
  };
}
