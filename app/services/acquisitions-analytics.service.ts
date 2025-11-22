import {
  getAcquisitionsByCompanyId,
  getAcquisitionsBySupplierId,
  getAcquisitionsByDateRange,
} from "./acquisitions.service";
import type { Acquisition } from "~/types";
import { getTotalFees } from "~/utils/fees";

export interface AcquisitionsMetrics {
  totalAcquisitions: number;
  totalCost: number;
  totalAnimalsAcquired: number;
  averagePricePerAnimal: number;
  averageCostPerArroba: number;
  averageWeightAtAcquisition: number;
  costEvolution: Array<{
    date: string;
    totalCost: number;
    averageCostPerArroba: number;
    animalCount: number;
  }>;
}

export interface AcquisitionsFilters {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  propertyId?: string;
}

function filterAcquisitions(
  acquisitions: Acquisition[],
  filters?: AcquisitionsFilters
): Acquisition[] {
  let filtered = [...acquisitions];

  if (filters?.startDate && filters?.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((acquisition) => {
      const acquisitionDate = new Date(acquisition.acquisitionDate);
      return acquisitionDate >= start && acquisitionDate <= end;
    });
  }

  if (filters?.supplierId) {
    filtered = filtered.filter((acquisition) => acquisition.supplierId === filters.supplierId);
  }

  if (filters?.propertyId) {
    filtered = filtered.filter((acquisition) => acquisition.propertyId === filters.propertyId);
  }

  return filtered;
}

export function getAcquisitionsMetrics(
  companyId: string,
  filters?: AcquisitionsFilters
): AcquisitionsMetrics {
  let acquisitions = getAcquisitionsByCompanyId(companyId);
  acquisitions = filterAcquisitions(acquisitions, filters);

  const totalAcquisitions = acquisitions.length;
  const totalCost = acquisitions.reduce((sum, acquisition) => {
    const totalFees = getTotalFees(
      acquisition.fees,
      acquisition.transportationFee,
      undefined,
      acquisition.handlingFee
    );
    return sum + acquisition.totalPrice + totalFees;
  }, 0);

  let totalWeight = 0;
  let totalCostPerArroba = 0;
  let arrobaCount = 0;
  const totalAnimalsAcquired = acquisitions.reduce(
    (sum, acquisition) => sum + acquisition.acquisitionItems.length,
    0
  );

  acquisitions.forEach((acquisition) => {
    acquisition.acquisitionItems.forEach((item) => {
      totalWeight += item.weight;
      if (item.costPerArroba > 0) {
        totalCostPerArroba += item.costPerArroba;
        arrobaCount++;
      }
    });
  });

  const averagePricePerAnimal = totalAnimalsAcquired > 0 ? totalCost / totalAnimalsAcquired : 0;
  const averageCostPerArroba = arrobaCount > 0 ? totalCostPerArroba / arrobaCount : 0;
  const averageWeightAtAcquisition =
    totalAnimalsAcquired > 0 ? totalWeight / totalAnimalsAcquired : 0;

  // Calculate cost evolution over time (group by month)
  const costEvolutionMap = new Map<
    string,
    { totalCost: number; costPerArroba: number; count: number }
  >();

  acquisitions.forEach((acquisition) => {
    const date = new Date(acquisition.acquisitionDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const totalFees = getTotalFees(
      acquisition.fees,
      acquisition.transportationFee,
      undefined,
      acquisition.handlingFee
    );
    const acquisitionCost = acquisition.totalPrice + totalFees;

    const avgCostPerArroba =
      acquisition.acquisitionItems.reduce((sum, item) => sum + item.costPerArroba, 0) /
      acquisition.acquisitionItems.length;

    const existing = costEvolutionMap.get(monthKey);
    if (existing) {
      existing.totalCost += acquisitionCost;
      existing.costPerArroba += avgCostPerArroba;
      existing.count += 1;
    } else {
      costEvolutionMap.set(monthKey, {
        totalCost: acquisitionCost,
        costPerArroba: avgCostPerArroba,
        count: 1,
      });
    }
  });

  const costEvolution = Array.from(costEvolutionMap.entries())
    .map(([date, data]) => ({
      date,
      totalCost: data.totalCost,
      averageCostPerArroba: data.costPerArroba / data.count,
      animalCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalAcquisitions,
    totalCost,
    totalAnimalsAcquired,
    averagePricePerAnimal,
    averageCostPerArroba,
    averageWeightAtAcquisition,
    costEvolution,
  };
}

export function getAverageAcquisitionPrice(
  companyId: string,
  filters?: AcquisitionsFilters
): number {
  const metrics = getAcquisitionsMetrics(companyId, filters);
  return metrics.averagePricePerAnimal;
}

export function getAverageCostPerArroba(companyId: string, filters?: AcquisitionsFilters): number {
  const metrics = getAcquisitionsMetrics(companyId, filters);
  return metrics.averageCostPerArroba;
}

export function getAcquisitionsBySupplier(
  companyId: string,
  supplierId: string,
  filters?: AcquisitionsFilters
): Acquisition[] {
  let acquisitions = getAcquisitionsBySupplierId(supplierId);
  acquisitions = acquisitions.filter((acquisition) => acquisition.companyId === companyId);
  acquisitions = filterAcquisitions(acquisitions, filters);
  return acquisitions;
}

export function getAcquisitionsByDateRangeFiltered(
  companyId: string,
  startDate: string,
  endDate: string,
  filters?: Omit<AcquisitionsFilters, "startDate" | "endDate">
): Acquisition[] {
  let acquisitions = getAcquisitionsByDateRange(companyId, startDate, endDate);
  acquisitions = filterAcquisitions(acquisitions, filters);
  return acquisitions;
}
