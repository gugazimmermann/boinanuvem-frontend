import { getSalesByCompanyId, getSalesByBuyerId } from "./sales.service";
import { getAnimalById } from "./animals.service";
import { getBirthByAnimalId } from "./births.service";
import { getAcquisitionByAnimalId } from "./acquisitions.service";
import {
  calculateAnimalProfitability,
  calculateAggregatedProfitability,
} from "~/utils/profitability";
import type { Sale, SaleType } from "~/types";
import { differenceInMonths, parseISO } from "date-fns";
import { getTotalFees } from "~/utils/fees";

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averagePricePerKg: number;
  averagePricePerHead: number;
  averageCarcassValue?: number;
  averageAgeAtSale: number;
  totalAnimalsSold: number;
  profitability: {
    totalCost: number;
    totalSalePrice: number;
    totalProfit: number;
    averageProfitMargin: number;
    averageCostPerKg: number;
    averagePricePerKg: number;
    averageRoi: number;
  };
}

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  buyerId?: string;
  saleType?: SaleType;
  propertyId?: string;
}

function filterSales(sales: Sale[], filters?: SalesFilters): Sale[] {
  let filtered = [...sales];

  if (filters?.startDate && filters?.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);

    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((sale) => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= start && saleDate <= end;
    });
  }

  if (filters?.buyerId) {
    filtered = filtered.filter((sale) => sale.buyerId === filters.buyerId);
  }

  if (filters?.saleType) {
    filtered = filtered.filter((sale) => sale.saleType === filters.saleType);
  }

  if (filters?.propertyId) {
    filtered = filtered.filter((sale) => sale.propertyId === filters.propertyId);
  }

  return filtered;
}

async function calculateSaleItemMetrics(sales: Sale[]): Promise<{
  totalWeight: number;
  totalCarcassWeight: number;
  carcassCount: number;
  profitabilities: Awaited<ReturnType<typeof calculateAnimalProfitability>>[];
}> {
  let totalWeight = 0;
  let totalCarcassWeight = 0;
  let carcassCount = 0;
  const profitabilityPromises: Promise<Awaited<ReturnType<typeof calculateAnimalProfitability>>>[] =
    [];

  for (const sale of sales) {
    for (const item of sale.saleItems) {
      totalWeight += item.weight;
      if (item.carcassWeight) {
        totalCarcassWeight += item.carcassWeight;
        carcassCount++;
      }
      profitabilityPromises.push(
        calculateAnimalProfitability(item.animalId, item.price, sale.saleDate, item.weight)
      );
    }
  }

  const profitabilities = await Promise.all(profitabilityPromises);

  return { totalWeight, totalCarcassWeight, carcassCount, profitabilities };
}

async function calculateAverageAge(sales: Sale[]): Promise<number> {
  let totalAgeInMonths = 0;
  let ageCount = 0;
  for (const sale of sales) {
    for (const item of sale.saleItems) {
      const animal = await getAnimalById(item.animalId);
      if (!animal) continue;

      const birth = await getBirthByAnimalId(animal.id);
      const acquisition = await getAcquisitionByAnimalId(animal.id);
      const acquisitionItem = acquisition?.acquisitionItems?.find(
        (acqItem) => acqItem.animalId === animal.id
      );

      let birthDate: string | undefined;
      if (birth) {
        birthDate = birth.birthDate;
      } else if (acquisitionItem?.birthDate) {
        birthDate = acquisitionItem.birthDate;
      } else if (acquisition?.acquisitionDate) {
        const acqDate = parseISO(acquisition.acquisitionDate);
        const estBirthDate = new Date(acqDate);
        estBirthDate.setFullYear(estBirthDate.getFullYear() - 2);
        birthDate = estBirthDate.toISOString().split("T")[0];
      }

      if (birthDate) {
        const ageInMonths = differenceInMonths(parseISO(sale.saleDate), parseISO(birthDate));
        totalAgeInMonths += ageInMonths;
        ageCount++;
      }
    }
  }
  return ageCount > 0 ? totalAgeInMonths / ageCount : 0;
}

export async function getSalesMetrics(
  companyId: string,
  filters?: SalesFilters
): Promise<SalesMetrics> {
  let sales = await getSalesByCompanyId(companyId);
  sales = filterSales(sales, filters);

  const totalSales = sales.length;
  const { totalWeight, totalCarcassWeight, carcassCount, profitabilities } =
    await calculateSaleItemMetrics(sales);
  const totalAnimalsSold = sales.reduce((sum, sale) => sum + sale.saleItems.length, 0);
  const totalRevenue = sales.reduce((sum, sale) => {
    const totalFees = getTotalFees(sale.fees, sale.transportationFee, sale.additionalFees);
    return sum + sale.totalPrice + totalFees;
  }, 0);

  const averagePricePerKg = totalWeight > 0 ? totalRevenue / totalWeight : 0;
  const averagePricePerHead = totalAnimalsSold > 0 ? totalRevenue / totalAnimalsSold : 0;
  const averageCarcassValue =
    carcassCount > 0 && totalCarcassWeight > 0
      ? totalRevenue / (totalCarcassWeight / totalWeight)
      : undefined;
  const averageAgeAtSale = await calculateAverageAge(sales);

  const profitability = calculateAggregatedProfitability(profitabilities);

  return {
    totalSales,
    totalRevenue,
    averagePricePerKg,
    averagePricePerHead,
    averageCarcassValue,
    averageAgeAtSale,
    totalAnimalsSold,
    profitability,
  };
}

export async function getPricePerKg(companyId: string, filters?: SalesFilters): Promise<number> {
  const metrics = await getSalesMetrics(companyId, filters);
  return metrics.averagePricePerKg;
}

export async function getPricePerHead(companyId: string, filters?: SalesFilters): Promise<number> {
  const metrics = await getSalesMetrics(companyId, filters);
  return metrics.averagePricePerHead;
}

export async function getCarcassValue(
  companyId: string,
  filters?: SalesFilters
): Promise<number | undefined> {
  const metrics = await getSalesMetrics(companyId, filters);
  return metrics.averageCarcassValue;
}

export async function getAverageAgeAtSale(
  companyId: string,
  filters?: SalesFilters
): Promise<number> {
  const metrics = await getSalesMetrics(companyId, filters);
  return metrics.averageAgeAtSale;
}

export async function getProfitabilityMetrics(companyId: string, filters?: SalesFilters) {
  const metrics = await getSalesMetrics(companyId, filters);
  return metrics.profitability;
}

export async function getSalesByBuyer(
  companyId: string,
  buyerId: string,
  filters?: SalesFilters
): Promise<Sale[]> {
  // In tests, getSalesByBuyerId may be mocked as async, so we await it
  let sales = await (getSalesByBuyerId(buyerId) as Promise<Sale[]> | Sale[]);

  sales = sales.filter((sale) => sale.companyId === companyId);
  sales = filterSales(sales, filters);
  return sales;
}

export async function getSalesByCategory(
  companyId: string,
  category: SaleType,
  filters?: SalesFilters
): Promise<Sale[]> {
  let sales = await getSalesByCompanyId(companyId);
  sales = sales.filter((sale) => sale.saleType === category);
  sales = filterSales(sales, filters);
  return sales;
}
