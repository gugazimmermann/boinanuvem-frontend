import { useMemo } from "react";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { mockProperties } from "~/mocks/properties";
import { mockLocations } from "~/mocks/locations";
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
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import { convertToHectares } from "~/utils/area";
import { ANIMAL_UNIT_WEIGHT_KG } from "~/utils/constants";

export function useDashboardData(companyId: string) {
  const allAnimals = useMemo(() => getAnimalsByCompanyId(companyId), [companyId]);

  // Filtrar apenas animais ativos para todos os cálculos
  const animals = useMemo(
    () => allAnimals.filter((animal) => animal.status === "active"),
    [allAnimals]
  );

  const totalAnimals = animals.length;
  const totalProperties = mockProperties.length;
  const totalLocations = mockLocations.length;

  const totalWeight = useMemo(() => {
    let weight = 0;
    animals.forEach((animal) => {
      const weighings = getWeighingsByAnimalId(animal.id);
      if (weighings.length > 0) {
        const lastWeighing = weighings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        weight += lastWeighing.weight;
      }
    });
    return weight;
  }, [animals]);

  const animalUnits = useMemo(
    () => (totalWeight > 0 ? totalWeight / ANIMAL_UNIT_WEIGHT_KG : 0),
    [totalWeight]
  );

  const totalAreaInHectares = useMemo(() => {
    return mockProperties.reduce((sum, property) => {
      return sum + convertToHectares(property.area.value, property.area.type);
    }, 0);
  }, []);

  const stockingRate = useMemo(
    () => (totalAreaInHectares > 0 && animalUnits > 0 ? animalUnits / totalAreaInHectares : 0),
    [totalAreaInHectares, animalUnits]
  );

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
