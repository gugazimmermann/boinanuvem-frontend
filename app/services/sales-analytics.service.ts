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
    // Filter by date range directly on the sales array
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    // Set end date to end of day for inclusive comparison
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

export function getSalesMetrics(companyId: string, filters?: SalesFilters): SalesMetrics {
  let sales = getSalesByCompanyId(companyId);
  sales = filterSales(sales, filters);

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => {
    return sum + sale.totalPrice + (sale.transportationFee || 0) + (sale.additionalFees || 0);
  }, 0);

  let totalWeight = 0;
  let totalCarcassWeight = 0;
  let carcassCount = 0;
  const totalAnimalsSold = sales.reduce((sum, sale) => sum + sale.saleItems.length, 0);

  const profitabilities: ReturnType<typeof calculateAnimalProfitability>[] = [];

  sales.forEach((sale) => {
    sale.saleItems.forEach((item) => {
      totalWeight += item.weight;
      if (item.carcassWeight) {
        totalCarcassWeight += item.carcassWeight;
        carcassCount++;
      }

      // Calculate profitability for this animal
      const profitability = calculateAnimalProfitability(
        item.animalId,
        item.price,
        sale.saleDate,
        item.weight
      );
      profitabilities.push(profitability);
    });
  });

  const averagePricePerKg = totalWeight > 0 ? totalRevenue / totalWeight : 0;
  const averagePricePerHead = totalAnimalsSold > 0 ? totalRevenue / totalAnimalsSold : 0;
  const averageCarcassValue = carcassCount > 0 ? totalCarcassWeight / carcassCount : undefined;

  // Calculate average age at sale
  let totalAgeInMonths = 0;
  let ageCount = 0;
  sales.forEach((sale) => {
    sale.saleItems.forEach((item) => {
      const animal = getAnimalById(item.animalId);
      if (!animal) return;

      const birth = getBirthByAnimalId(animal.id);
      const acquisition = getAcquisitionByAnimalId(animal.id);

      let birthDate: string | undefined;
      if (birth) {
        birthDate = birth.birthDate;
      } else if (acquisition?.birthDate) {
        birthDate = acquisition.birthDate;
      } else if (acquisition?.acquisitionDate) {
        // Estimate birth date as 2 years before acquisition (typical for purchased animals)
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
    });
  });
  const averageAgeAtSale = ageCount > 0 ? totalAgeInMonths / ageCount : 0;

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

export function getPricePerKg(companyId: string, filters?: SalesFilters): number {
  const metrics = getSalesMetrics(companyId, filters);
  return metrics.averagePricePerKg;
}

export function getPricePerHead(companyId: string, filters?: SalesFilters): number {
  const metrics = getSalesMetrics(companyId, filters);
  return metrics.averagePricePerHead;
}

export function getCarcassValue(companyId: string, filters?: SalesFilters): number | undefined {
  const metrics = getSalesMetrics(companyId, filters);
  return metrics.averageCarcassValue;
}

export function getAverageAgeAtSale(companyId: string, filters?: SalesFilters): number {
  const metrics = getSalesMetrics(companyId, filters);
  return metrics.averageAgeAtSale;
}

export function getProfitabilityMetrics(companyId: string, filters?: SalesFilters) {
  const metrics = getSalesMetrics(companyId, filters);
  return metrics.profitability;
}

export function getSalesByBuyer(
  companyId: string,
  buyerId: string,
  filters?: SalesFilters
): Sale[] {
  let sales = getSalesByBuyerId(buyerId);
  // Filter by company to ensure we only get sales for the correct company
  sales = sales.filter((sale) => sale.companyId === companyId);
  sales = filterSales(sales, filters);
  return sales;
}

export function getSalesByCategory(
  companyId: string,
  category: SaleType,
  filters?: SalesFilters
): Sale[] {
  let sales = getSalesByCompanyId(companyId);
  sales = sales.filter((sale) => sale.saleType === category);
  sales = filterSales(sales, filters);
  return sales;
}
