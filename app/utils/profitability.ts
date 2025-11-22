import { getAnimalTotalCost } from "~/services/location-costs.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import { getBirthByAnimalId } from "~/services/births.service";

const ARROBA_KG = 30; // 1 arroba = 30 kg

export interface AnimalProfitability {
  animalId: string;
  totalCost: number;
  salePrice: number;
  profit: number;
  profitMargin: number;
  costPerKg: number;
  pricePerKg: number;
  roi: number; // Return on Investment (percentage)
  acquisitionArrobaValue?: number; // Cost per arroba at acquisition
  saleArrobaValue?: number; // Price per arroba at sale
  spreadPerArroba?: number; // Profit/loss per arroba (sale - acquisition)
  totalSpread?: number; // Total spread (spreadPerArroba * saleArrobas)
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

  // Get acquisition data for this animal
  const acquisition = getAcquisitionByAnimalId(animalId);
  const acquisitionItem = acquisition?.acquisitionItems.find((item) => item.animalId === animalId);
  const acquisitionCost = acquisitionItem?.price || 0;

  // If animal was born on the property, check birth costs (could be zero or minimal)
  const birth = getBirthByAnimalId(animalId);
  const birthCost = birth ? 0 : 0; // Births typically don't have direct costs

  const totalAccumulatedCost = totalCost + acquisitionCost + birthCost;

  // Calculate arroba-based metrics if acquisition data is available
  let acquisitionArrobaValue: number | undefined;
  let saleArrobaValue: number | undefined;
  let spreadPerArroba: number | undefined;
  let totalSpread: number | undefined;

  if (acquisitionItem && acquisitionItem.weight > 0) {
    // Calculate acquisition arroba value (cost per arroba at acquisition)
    acquisitionArrobaValue = acquisitionItem.costPerArroba;

    // Calculate sale arroba value (price per arroba at sale)
    const saleArrobas = saleWeight / ARROBA_KG;
    saleArrobaValue = saleArrobas > 0 ? salePrice / saleArrobas : 0;

    // Calculate spread per arroba
    spreadPerArroba = saleArrobaValue - acquisitionArrobaValue;

    // Calculate total spread
    totalSpread = spreadPerArroba * saleArrobas;
  }

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
    acquisitionArrobaValue,
    saleArrobaValue,
    spreadPerArroba,
    totalSpread,
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
  averageAcquisitionArrobaValue?: number;
  averageSaleArrobaValue?: number;
  averageSpreadPerArroba?: number;
  totalSpread?: number;
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

  // Calculate spread metrics
  const spreadProfitabilities = profitabilities.filter(
    (p) => p.acquisitionArrobaValue !== undefined && p.saleArrobaValue !== undefined
  );
  let averageAcquisitionArrobaValue: number | undefined;
  let averageSaleArrobaValue: number | undefined;
  let averageSpreadPerArroba: number | undefined;
  let totalSpread: number | undefined;

  if (spreadProfitabilities.length > 0) {
    averageAcquisitionArrobaValue =
      spreadProfitabilities.reduce((sum, p) => sum + (p.acquisitionArrobaValue || 0), 0) /
      spreadProfitabilities.length;
    averageSaleArrobaValue =
      spreadProfitabilities.reduce((sum, p) => sum + (p.saleArrobaValue || 0), 0) /
      spreadProfitabilities.length;
    averageSpreadPerArroba =
      spreadProfitabilities.reduce((sum, p) => sum + (p.spreadPerArroba || 0), 0) /
      spreadProfitabilities.length;
    totalSpread = spreadProfitabilities.reduce((sum, p) => sum + (p.totalSpread || 0), 0);
  }

  return {
    totalCost,
    totalSalePrice,
    totalProfit,
    averageProfitMargin,
    averageCostPerKg,
    averagePricePerKg,
    averageRoi,
    averageAcquisitionArrobaValue,
    averageSaleArrobaValue,
    averageSpreadPerArroba,
    totalSpread,
  };
}
