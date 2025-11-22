import { getAnimalTotalCost } from "~/services/location-costs.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import { getBirthByAnimalId } from "~/services/births.service";

export interface AnimalProfitability {
  animalId: string;
  totalCost: number;
  salePrice: number;
  profit: number;
  profitMargin: number;
  costPerKg: number;
  pricePerKg: number;
  roi: number; // Return on Investment (percentage)
}

/**
 * Calculates profitability for an animal at the time of sale
 * @param animalId - The ID of the animal
 * @param salePrice - The price the animal was sold for
 * @param saleDate - The date of the sale
 * @param saleWeight - The weight of the animal at sale time
 * @returns Profitability metrics
 */
export function calculateAnimalProfitability(
  animalId: string,
  salePrice: number,
  saleDate: string,
  saleWeight: number
): AnimalProfitability {
  // Get total accumulated costs up to sale date
  const costData = getAnimalTotalCost(animalId, undefined, saleDate);
  const totalCost = costData?.totalCost || 0;

  // Add acquisition cost if available
  const acquisition = getAcquisitionByAnimalId(animalId);
  const acquisitionCost = acquisition?.price || 0;

  // If animal was born on the property, check birth costs (could be zero or minimal)
  const birth = getBirthByAnimalId(animalId);
  const birthCost = birth ? 0 : 0; // Births typically don't have direct costs

  const totalAccumulatedCost = totalCost + acquisitionCost + birthCost;

  // Calculate metrics
  const profit = salePrice - totalAccumulatedCost;
  const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
  const costPerKg = saleWeight > 0 ? totalAccumulatedCost / saleWeight : 0;
  const pricePerKg = saleWeight > 0 ? salePrice / saleWeight : 0;
  const roi = totalAccumulatedCost > 0 ? (profit / totalAccumulatedCost) * 100 : 0;

  return {
    animalId,
    totalCost: totalAccumulatedCost,
    salePrice,
    profit,
    profitMargin,
    costPerKg,
    pricePerKg,
    roi,
  };
}

/**
 * Calculates aggregated profitability metrics for multiple animals
 */
export function calculateAggregatedProfitability(profitabilities: AnimalProfitability[]): {
  totalCost: number;
  totalSalePrice: number;
  totalProfit: number;
  averageProfitMargin: number;
  averageCostPerKg: number;
  averagePricePerKg: number;
  averageRoi: number;
} {
  if (profitabilities.length === 0) {
    return {
      totalCost: 0,
      totalSalePrice: 0,
      totalProfit: 0,
      averageProfitMargin: 0,
      averageCostPerKg: 0,
      averagePricePerKg: 0,
      averageRoi: 0,
    };
  }

  const totalCost = profitabilities.reduce((sum, p) => sum + p.totalCost, 0);
  const totalSalePrice = profitabilities.reduce((sum, p) => sum + p.salePrice, 0);
  const totalProfit = profitabilities.reduce((sum, p) => sum + p.profit, 0);
  const averageProfitMargin =
    profitabilities.reduce((sum, p) => sum + p.profitMargin, 0) / profitabilities.length;
  const averageCostPerKg =
    profitabilities.reduce((sum, p) => sum + p.costPerKg, 0) / profitabilities.length;
  const averagePricePerKg =
    profitabilities.reduce((sum, p) => sum + p.pricePerKg, 0) / profitabilities.length;
  const averageRoi = profitabilities.reduce((sum, p) => sum + p.roi, 0) / profitabilities.length;

  return {
    totalCost,
    totalSalePrice,
    totalProfit,
    averageProfitMargin,
    averageCostPerKg,
    averagePricePerKg,
    averageRoi,
  };
}
