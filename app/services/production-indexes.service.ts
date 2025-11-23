import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getWeighingsByAnimalId } from "./weighings.service";
import { getSalesByCompanyId, getSalesByAnimalId } from "./sales.service";
import type { Sale } from "~/types";
import { getBirthByAnimalId } from "./births.service";
import { getPropertyById } from "./properties.service";
import { getLocationsByPropertyId } from "./locations.service";
import { getAnimalMovementsByAnimalId } from "./animal-movements.service";
import { LocationType, AreaType } from "~/types";

export interface AverageDailyGainResult {
  adg: number; // kg/day
  initialWeight: number;
  finalWeight: number;
  days: number;
  animalId: string;
  animalCode: string;
}

export interface AverageDailyCarcassGainResult {
  adc: number; // kg/day
  adg: number;
  carcassYield: number; // percentage
  initialWeight: number;
  finalWeight: number;
  days: number;
}

export interface DaysOnFeedResult {
  days: number;
  animalId: string;
  animalCode: string;
  entryDate: string;
  exitDate: string;
}

export interface CarcassYieldResult {
  yield: number; // percentage
  carcassWeight: number;
  liveWeight: number;
  count: number;
}

export interface SlaughterAgeResult {
  averageAge: number; // days
  minAge: number;
  maxAge: number;
  count: number;
}

export interface ArrobaProductionPerHectareResult {
  arrobasPerHectare: number;
  totalArrobas: number;
  areaInHectares: number;
  period?: { startDate?: string; endDate?: string };
}

export interface KgNitrogenPerAUResult {
  kgNitrogenPerAU: number;
  totalNitrogen: number; // kg
  animalUnits: number;
  areaInHectares: number;
}

export interface KgMeatPerKgNitrogenResult {
  kgMeatPerKgNitrogen: number;
  totalWeightGain: number; // kg
  totalNitrogen: number; // kg
}

function convertToHectares(value: number, type: AreaType): number {
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
}

function calculateAnimalUnits(animals: Array<{ weight: number }>): number {
  const totalWeight = animals.reduce((sum, animal) => sum + animal.weight, 0);
  return totalWeight > 0 ? totalWeight / 450 : 0; // 1 AU = 450 kg
}

export function getAverageDailyGain(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): AverageDailyGainResult[] {
  const animals = getAnimalsByPropertyId(propertyId);
  const results: AverageDailyGainResult[] = [];

  animals.forEach((animal) => {
    const weighings = getWeighingsByAnimalId(animal.id);
    if (weighings.length < 2) return;

    // Filter by period if provided
    let filteredWeighings = weighings;
    if (period?.startDate || period?.endDate) {
      filteredWeighings = weighings.filter((weighing) => {
        const weighingDate = new Date(weighing.date).getTime();
        if (period.startDate) {
          const start = new Date(period.startDate).getTime();
          if (weighingDate < start) return false;
        }
        if (period.endDate) {
          const end = new Date(period.endDate).getTime();
          if (weighingDate > end) return false;
        }
        return true;
      });
    }

    if (filteredWeighings.length < 2) return;

    // Sort by date
    const sortedWeighings = [...filteredWeighings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstWeighing = sortedWeighings[0];
    const lastWeighing = sortedWeighings[sortedWeighings.length - 1];

    const initialWeight = firstWeighing.weight;
    const finalWeight = lastWeighing.weight;
    const firstDate = new Date(firstWeighing.date);
    const lastDate = new Date(lastWeighing.date);
    const days = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    if (days > 0) {
      const adg = (finalWeight - initialWeight) / days;
      results.push({
        adg: Math.round(adg * 100) / 100,
        initialWeight,
        finalWeight,
        days,
        animalId: animal.id,
        animalCode: animal.code,
      });
    }
  });

  return results;
}

export function getAverageDailyCarcassGain(
  propertyId: string,
  period?: { startDate?: string; endDate?: string },
  averageCarcassYield?: number
): AverageDailyCarcassGainResult[] {
  const adgResults = getAverageDailyGain(propertyId, period);
  const results: AverageDailyCarcassGainResult[] = [];

  // If no carcass yield provided, calculate from sales data
  let carcassYield = averageCarcassYield;
  if (!carcassYield) {
    const yieldResult = getCarcassYield(propertyId, period);
    carcassYield = yieldResult.yield;
  }

  adgResults.forEach((adgResult) => {
    const adc = (adgResult.adg * carcassYield) / 100;
    results.push({
      adc: Math.round(adc * 100) / 100,
      adg: adgResult.adg,
      carcassYield: carcassYield || 0,
      initialWeight: adgResult.initialWeight,
      finalWeight: adgResult.finalWeight,
      days: adgResult.days,
    });
  });

  return results;
}

export function getDaysOnFeed(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): DaysOnFeedResult[] {
  const animals = getAnimalsByPropertyId(propertyId);
  const locations = getLocationsByPropertyId(propertyId);
  const confinementTypes = [LocationType.FEEDLOT, LocationType.SEMI_FEEDLOT, LocationType.CORRAL];
  const confinementLocationIds = locations
    .filter((loc) => confinementTypes.includes(loc.locationType))
    .map((loc) => loc.id);

  const results: DaysOnFeedResult[] = [];

  animals.forEach((animal) => {
    const movements = getAnimalMovementsByAnimalId(animal.id);
    if (movements.length === 0) return;

    // Filter by period if provided
    let filteredMovements = movements;
    if (period?.startDate || period?.endDate) {
      filteredMovements = movements.filter((movement) => {
        const movementDate = new Date(movement.date).getTime();
        if (period.startDate) {
          const start = new Date(period.startDate).getTime();
          if (movementDate < start) return false;
        }
        if (period.endDate) {
          const end = new Date(period.endDate).getTime();
          if (movementDate > end) return false;
        }
        return true;
      });
    }

    // Sort by date
    const sortedMovements = [...filteredMovements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Find entry into confinement
    let entryDate: Date | null = null;
    let exitDate: Date | null = null;

    for (let i = 0; i < sortedMovements.length; i++) {
      const movement = sortedMovements[i];
      const isConfinement = confinementLocationIds.includes(movement.locationId);

      if (isConfinement && !entryDate) {
        entryDate = new Date(movement.date);
      } else if (!isConfinement && entryDate && !exitDate) {
        exitDate = new Date(movement.date);
        break;
      }
    }

    // If still in confinement, use current date or sale date
    if (entryDate && !exitDate) {
      const sales = getSalesByAnimalId(animal.id);
      if (sales.length > 0) {
        const sale = sales.sort(
          (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
        )[0];
        exitDate = new Date(sale.saleDate);
      } else {
        exitDate = new Date(); // Still in confinement
      }
    }

    if (entryDate && exitDate) {
      const days = Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        results.push({
          days,
          animalId: animal.id,
          animalCode: animal.code,
          entryDate: entryDate.toISOString().split("T")[0],
          exitDate: exitDate.toISOString().split("T")[0],
        });
      }
    }
  });

  return results;
}

export function getCarcassYield(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): CarcassYieldResult {
  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allSales = getSalesByCompanyId(companyId);
  const sales: Sale[] = allSales.filter((sale) => sale.propertyId === propertyId);

  // Filter by period if provided
  let filteredSales = sales;
  if (period?.startDate || period?.endDate) {
    filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate).getTime();
      if (period.startDate) {
        const start = new Date(period.startDate).getTime();
        if (saleDate < start) return false;
      }
      if (period.endDate) {
        const end = new Date(period.endDate).getTime();
        if (saleDate > end) return false;
      }
      return true;
    });
  }

  let totalCarcassWeight = 0;
  let totalLiveWeight = 0;
  let count = 0;

  filteredSales.forEach((sale) => {
    sale.saleItems.forEach((item) => {
      if (item.carcassWeight && item.weight) {
        totalCarcassWeight += item.carcassWeight;
        totalLiveWeight += item.weight;
        count++;
      }
    });
  });

  const yieldPercentage = totalLiveWeight > 0 ? (totalCarcassWeight / totalLiveWeight) * 100 : 0;

  return {
    yield: Math.round(yieldPercentage * 100) / 100,
    carcassWeight: totalCarcassWeight,
    liveWeight: totalLiveWeight,
    count,
  };
}

export function getSlaughterAge(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): SlaughterAgeResult {
  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allSales = getSalesByCompanyId(companyId);
  const sales: Sale[] = allSales.filter((sale) => sale.propertyId === propertyId);

  // Filter by period if provided
  let filteredSales = sales;
  if (period?.startDate || period?.endDate) {
    filteredSales = sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.saleDate).getTime();
      if (period.startDate) {
        const start = new Date(period.startDate).getTime();
        if (saleDate < start) return false;
      }
      if (period.endDate) {
        const end = new Date(period.endDate).getTime();
        if (saleDate > end) return false;
      }
      return true;
    });
  }

  const ages: number[] = [];

  filteredSales.forEach((sale: Sale) => {
    sale.saleItems.forEach((item) => {
      const animal = getAnimalById(item.animalId);
      if (!animal) return;

      const birth = getBirthByAnimalId(animal.id);
      if (birth) {
        const birthDate = new Date(birth.birthDate);
        const saleDate = new Date(sale.saleDate);
        const ageInDays = Math.floor(
          (saleDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        ages.push(ageInDays);
      }
    });
  });

  if (ages.length === 0) {
    return {
      averageAge: 0,
      minAge: 0,
      maxAge: 0,
      count: 0,
    };
  }

  const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  return {
    averageAge: Math.round(averageAge),
    minAge,
    maxAge,
    count: ages.length,
  };
}

export function getArrobaProductionPerHectare(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): ArrobaProductionPerHectareResult {
  const property = getPropertyById(propertyId);
  if (!property) {
    return {
      arrobasPerHectare: 0,
      totalArrobas: 0,
      areaInHectares: 0,
      period,
    };
  }

  const areaInHectares = convertToHectares(property.area.value, property.area.type);

  // Get sales in the period
  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allSales = getSalesByCompanyId(companyId);
  const sales: Sale[] = allSales.filter((sale) => sale.propertyId === propertyId);

  // Filter by period if provided
  let filteredSales = sales;
  if (period?.startDate || period?.endDate) {
    filteredSales = sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.saleDate).getTime();
      if (period.startDate) {
        const start = new Date(period.startDate).getTime();
        if (saleDate < start) return false;
      }
      if (period.endDate) {
        const end = new Date(period.endDate).getTime();
        if (saleDate > end) return false;
      }
      return true;
    });
  }

  // Calculate total arrobas (1 arroba = 30 kg)
  let totalArrobas = 0;
  filteredSales.forEach((sale: Sale) => {
    sale.saleItems.forEach((item) => {
      totalArrobas += item.weight / 30;
    });
  });

  const arrobasPerHectare = areaInHectares > 0 ? totalArrobas / areaInHectares : 0;

  return {
    arrobasPerHectare: Math.round(arrobasPerHectare * 100) / 100,
    totalArrobas: Math.round(totalArrobas * 100) / 100,
    areaInHectares,
    period,
  };
}

export function getKgNitrogenPerAU(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): KgNitrogenPerAUResult {
  const property = getPropertyById(propertyId);
  if (!property) {
    return {
      kgNitrogenPerAU: 0,
      totalNitrogen: 0,
      animalUnits: 0,
      areaInHectares: 0,
    };
  }

  const areaInHectares = convertToHectares(property.area.value, property.area.type);

  // Get animals and their weights
  const animals = getAnimalsByPropertyId(propertyId);
  const animalsWithWeights = animals
    .map((animal) => {
      const weighings = getWeighingsByAnimalId(animal.id);
      if (weighings.length === 0) return null;

      // Filter by period if provided
      let filteredWeighings = weighings;
      if (period?.startDate || period?.endDate) {
        filteredWeighings = weighings.filter((weighing) => {
          const weighingDate = new Date(weighing.date).getTime();
          if (period.startDate) {
            const start = new Date(period.startDate).getTime();
            if (weighingDate < start) return false;
          }
          if (period.endDate) {
            const end = new Date(period.endDate).getTime();
            if (weighingDate > end) return false;
          }
          return true;
        });
      }

      if (filteredWeighings.length === 0) return null;

      const latestWeighing = filteredWeighings.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      return { weight: latestWeighing.weight };
    })
    .filter((animal): animal is { weight: number } => animal !== null);

  const animalUnits = calculateAnimalUnits(animalsWithWeights);

  // Note: Nitrogen application data would need to come from location observations
  // or inventory movements. For now, we'll return a structure that can be populated
  // when that data is available. This is a placeholder implementation.
  const totalNitrogen = 0; // TODO: Calculate from actual nitrogen application data

  const kgNitrogenPerAU = animalUnits > 0 ? totalNitrogen / animalUnits : 0;

  return {
    kgNitrogenPerAU: Math.round(kgNitrogenPerAU * 100) / 100,
    totalNitrogen,
    animalUnits,
    areaInHectares,
  };
}

export function getKgMeatPerKgNitrogen(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): KgMeatPerKgNitrogenResult {
  // Get weight gain from weighings
  const adgResults = getAverageDailyGain(propertyId, period);
  let totalWeightGain = 0;

  adgResults.forEach((result) => {
    totalWeightGain += result.finalWeight - result.initialWeight;
  });

  // Note: Nitrogen application data would need to come from location observations
  // or inventory movements. For now, we'll return a structure that can be populated
  // when that data is available. This is a placeholder implementation.
  const totalNitrogen = 0; // TODO: Calculate from actual nitrogen application data

  const kgMeatPerKgNitrogen = totalNitrogen > 0 ? totalWeightGain / totalNitrogen : 0;

  return {
    kgMeatPerKgNitrogen: Math.round(kgMeatPerKgNitrogen * 100) / 100,
    totalWeightGain,
    totalNitrogen,
  };
}
