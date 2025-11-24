import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getWeighingsByAnimalId } from "./weighings.service";
import { getSalesByCompanyId, getSalesByAnimalId } from "./sales.service";
import type { Sale } from "~/types";
import { getBirthByAnimalId } from "./births.service";
import { getPropertyById } from "./properties.service";
import { getLocationsByPropertyId } from "./locations.service";
import { getAnimalMovementsByAnimalId } from "./animal-movements.service";
import { LocationType, AreaType, InventoryMovementType } from "~/types";
import { getMovementsByPropertyId } from "./inventory-movements.service";
import { hasNitrogenContent, getNitrogenContent } from "./nitrogen-content.service";

const indexCache = new Map<
  string,
  {
    result: unknown;
    timestamp: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(
  functionName: string,
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): string {
  return `${functionName}:${propertyId}:${period?.startDate || ""}:${period?.endDate || ""}`;
}

function getCachedResult<T>(key: string): T | null {
  const cached = indexCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result as T;
  }
  if (cached) {
    indexCache.delete(key);
  }
  return null;
}

function setCachedResult<T>(key: string, result: T): void {
  indexCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

export interface AverageDailyGainResult {
  adg: number;
  initialWeight: number;
  finalWeight: number;
  days: number;
  animalId: string;
  animalCode: string;
}

export interface AverageDailyCarcassGainResult {
  adc: number;
  adg: number;
  carcassYield: number;
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
  yield: number;
  carcassWeight: number;
  liveWeight: number;
  count: number;
}

export interface SlaughterAgeResult {
  averageAge: number;
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
  totalNitrogen: number;
  animalUnits: number;
  areaInHectares: number;
}

export interface KgMeatPerKgNitrogenResult {
  kgMeatPerKgNitrogen: number;
  totalWeightGain: number;
  totalNitrogen: number;
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
  return totalWeight > 0 ? totalWeight / 450 : 0;
}

export function getAverageDailyGain(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): AverageDailyGainResult[] {
  const cacheKey = getCacheKey("getAverageDailyGain", propertyId, period);
  const cached = getCachedResult<AverageDailyGainResult[]>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const animals = getAnimalsByPropertyId(propertyId);
  const results: AverageDailyGainResult[] = [];

  animals.forEach((animal) => {
    const weighings = getWeighingsByAnimalId(animal.id);
    if (weighings.length < 2) return;

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

  setCachedResult(cacheKey, results);
  return results;
}

export function getAverageDailyCarcassGain(
  propertyId: string,
  period?: { startDate?: string; endDate?: string },
  averageCarcassYield?: number
): AverageDailyCarcassGainResult[] {
  const cacheKey = getCacheKey("getAverageDailyCarcassGain", propertyId, period);
  const cached = getCachedResult<AverageDailyCarcassGainResult[]>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const adgResults = getAverageDailyGain(propertyId, period);
  const results: AverageDailyCarcassGainResult[] = [];

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

  setCachedResult(cacheKey, results);
  return results;
}

export function getDaysOnFeed(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): DaysOnFeedResult[] {
  const cacheKey = getCacheKey("getDaysOnFeed", propertyId, period);
  const cached = getCachedResult<DaysOnFeedResult[]>(cacheKey);
  if (cached !== null) {
    return cached;
  }

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

    const sortedMovements = [...filteredMovements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

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

    if (entryDate && !exitDate) {
      const sales = getSalesByAnimalId(animal.id);
      if (sales.length > 0) {
        const sale = sales.sort(
          (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
        )[0];
        exitDate = new Date(sale.saleDate);
      } else {
        exitDate = new Date();
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

  setCachedResult(cacheKey, results);
  return results;
}

export function getCarcassYield(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): CarcassYieldResult {
  const cacheKey = getCacheKey("getCarcassYield", propertyId, period);
  const cached = getCachedResult<CarcassYieldResult>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allSales = getSalesByCompanyId(companyId);
  const sales: Sale[] = allSales.filter((sale) => sale.propertyId === propertyId);

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

  const result: CarcassYieldResult = {
    yield: Math.round(yieldPercentage * 100) / 100,
    carcassWeight: totalCarcassWeight,
    liveWeight: totalLiveWeight,
    count,
  };

  setCachedResult(cacheKey, result);
  return result;
}

export function getSlaughterAge(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): SlaughterAgeResult {
  const cacheKey = getCacheKey("getSlaughterAge", propertyId, period);
  const cached = getCachedResult<SlaughterAgeResult>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allSales = getSalesByCompanyId(companyId);
  const sales: Sale[] = allSales.filter((sale) => sale.propertyId === propertyId);

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
    const result: SlaughterAgeResult = {
      averageAge: 0,
      minAge: 0,
      maxAge: 0,
      count: 0,
    };
    setCachedResult(cacheKey, result);
    return result;
  }

  const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  const result: SlaughterAgeResult = {
    averageAge: Math.round(averageAge),
    minAge,
    maxAge,
    count: ages.length,
  };

  setCachedResult(cacheKey, result);
  return result;
}

export function getArrobaProductionPerHectare(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): ArrobaProductionPerHectareResult {
  const cacheKey = getCacheKey("getArrobaProductionPerHectare", propertyId, period);
  const cached = getCachedResult<ArrobaProductionPerHectareResult>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const property = getPropertyById(propertyId);
  if (!property) {
    const result: ArrobaProductionPerHectareResult = {
      arrobasPerHectare: 0,
      totalArrobas: 0,
      areaInHectares: 0,
      period,
    };
    setCachedResult(cacheKey, result);
    return result;
  }

  const areaInHectares = convertToHectares(property.area.value, property.area.type);

  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allSales = getSalesByCompanyId(companyId);
  const sales: Sale[] = allSales.filter((sale) => sale.propertyId === propertyId);

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

  let totalArrobas = 0;
  filteredSales.forEach((sale: Sale) => {
    sale.saleItems.forEach((item) => {
      totalArrobas += item.weight / 30;
    });
  });

  const arrobasPerHectare = areaInHectares > 0 ? totalArrobas / areaInHectares : 0;

  const result: ArrobaProductionPerHectareResult = {
    arrobasPerHectare: Math.round(arrobasPerHectare * 100) / 100,
    totalArrobas: Math.round(totalArrobas * 100) / 100,
    areaInHectares,
    period,
  };

  setCachedResult(cacheKey, result);
  return result;
}

export function getKgNitrogenPerAU(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): KgNitrogenPerAUResult {
  const cacheKey = getCacheKey("getKgNitrogenPerAU", propertyId, period);
  const cached = getCachedResult<KgNitrogenPerAUResult>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const property = getPropertyById(propertyId);
  if (!property) {
    const result: KgNitrogenPerAUResult = {
      kgNitrogenPerAU: 0,
      totalNitrogen: 0,
      animalUnits: 0,
      areaInHectares: 0,
    };
    setCachedResult(cacheKey, result);
    return result;
  }

  const areaInHectares = convertToHectares(property.area.value, property.area.type);

  const animals = getAnimalsByPropertyId(propertyId);
  const animalsWithWeights = animals
    .map((animal) => {
      const weighings = getWeighingsByAnimalId(animal.id);
      if (weighings.length === 0) return null;

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

  const movements = getMovementsByPropertyId(propertyId);
  let filteredMovements = movements.filter(
    (movement) => movement.type === InventoryMovementType.CONSUMPTION
  );

  if (period?.startDate || period?.endDate) {
    filteredMovements = filteredMovements.filter((movement) => {
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

  let totalNitrogen = 0;
  filteredMovements.forEach((movement) => {
    if (hasNitrogenContent(movement.itemId)) {
      const nitrogenKgPerUnit = getNitrogenContent(movement.itemId);
      const nitrogenKg = movement.quantity * nitrogenKgPerUnit;
      totalNitrogen += nitrogenKg;
    }
  });

  const kgNitrogenPerAU = animalUnits > 0 ? totalNitrogen / animalUnits : 0;

  const result: KgNitrogenPerAUResult = {
    kgNitrogenPerAU: Math.round(kgNitrogenPerAU * 100) / 100,
    totalNitrogen,
    animalUnits,
    areaInHectares,
  };

  setCachedResult(cacheKey, result);
  return result;
}

export function getKgMeatPerKgNitrogen(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): KgMeatPerKgNitrogenResult {
  const cacheKey = getCacheKey("getKgMeatPerKgNitrogen", propertyId, period);
  const cached = getCachedResult<KgMeatPerKgNitrogenResult>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const adgResults = getAverageDailyGain(propertyId, period);
  let totalWeightGain = 0;

  adgResults.forEach((result) => {
    totalWeightGain += result.finalWeight - result.initialWeight;
  });

  const movements = getMovementsByPropertyId(propertyId);
  let filteredMovements = movements.filter(
    (movement) => movement.type === InventoryMovementType.CONSUMPTION
  );

  if (period?.startDate || period?.endDate) {
    filteredMovements = filteredMovements.filter((movement) => {
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

  let totalNitrogen = 0;
  filteredMovements.forEach((movement) => {
    if (hasNitrogenContent(movement.itemId)) {
      const nitrogenKgPerUnit = getNitrogenContent(movement.itemId);
      const nitrogenKg = movement.quantity * nitrogenKgPerUnit;
      totalNitrogen += nitrogenKg;
    }
  });

  const kgMeatPerKgNitrogen = totalNitrogen > 0 ? totalWeightGain / totalNitrogen : 0;

  const result: KgMeatPerKgNitrogenResult = {
    kgMeatPerKgNitrogen: Math.round(kgMeatPerKgNitrogen * 100) / 100,
    totalWeightGain,
    totalNitrogen,
  };

  setCachedResult(cacheKey, result);
  return result;
}
