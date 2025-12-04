import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getWeighingsByAnimalId } from "./weighings.service";
import { getSalesByCompanyId, getSalesByAnimalId } from "./sales.service";
import type { Sale, AnimalMovement } from "~/types";
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

  for (const animal of animals) {
    const weighings = getWeighingsByAnimalId(animal.id);
    if (weighings.length < 2) continue;

    const filteredWeighings = filterByPeriod(weighings, period);

    if (filteredWeighings.length < 2) continue;

    const weighingsArray = [...filteredWeighings];
    const sortedWeighings = weighingsArray.toSorted(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstWeighing = sortedWeighings[0];
    const lastWeighing = sortedWeighings.at(-1);

    if (!firstWeighing || !lastWeighing) {
      continue;
    }

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
  }

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

  for (const adgResult of adgResults) {
    const adc = (adgResult.adg * carcassYield) / 100;
    results.push({
      adc: Math.round(adc * 100) / 100,
      adg: adgResult.adg,
      carcassYield: carcassYield || 0,
      initialWeight: adgResult.initialWeight,
      finalWeight: adgResult.finalWeight,
      days: adgResult.days,
    });
  }

  setCachedResult(cacheKey, results);
  return results;
}

// Generic date filtering utility
function filterByPeriod<T extends { date: string }>(
  items: T[],
  period?: { startDate?: string; endDate?: string }
): T[] {
  if (!period?.startDate && !period?.endDate) {
    return items;
  }
  return items.filter((item) => {
    const itemDate = new Date(item.date).getTime();
    if (period.startDate) {
      const start = new Date(period.startDate).getTime();
      if (itemDate < start) return false;
    }
    if (period.endDate) {
      const end = new Date(period.endDate).getTime();
      if (itemDate > end) return false;
    }
    return true;
  });
}

// Helper for filtering sales by period (uses saleDate instead of date)
function filterSalesByPeriod(
  sales: Sale[],
  period?: { startDate?: string; endDate?: string }
): Sale[] {
  if (!period?.startDate && !period?.endDate) {
    return sales;
  }
  return sales.filter((sale) => {
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

function filterMovementsByPeriod(
  movements: AnimalMovement[],
  period?: { startDate?: string; endDate?: string }
): AnimalMovement[] {
  return filterByPeriod(movements, period);
}

function getConfinementLocationIds(propertyId: string): Set<string> {
  const locations = getLocationsByPropertyId(propertyId);
  const confinementTypes = new Set([
    LocationType.FEEDLOT,
    LocationType.SEMI_FEEDLOT,
    LocationType.CORRAL,
  ]);
  return new Set(
    locations.filter((loc) => confinementTypes.has(loc.locationType)).map((loc) => loc.id)
  );
}

function findEntryAndExitDates(
  sortedMovements: ReturnType<typeof filterMovementsByPeriod>,
  confinementLocationIds: Set<string>
): { entryDate: Date | null; exitDate: Date | null } {
  let entryDate: Date | null = null;
  let exitDate: Date | null = null;

  for (const movement of sortedMovements) {
    const isConfinement = confinementLocationIds.has(movement.locationId);

    if (isConfinement && !entryDate) {
      entryDate = new Date(movement.date);
    } else if (!isConfinement && entryDate && !exitDate) {
      exitDate = new Date(movement.date);
      break;
    }
  }

  return { entryDate, exitDate };
}

function getExitDateFromSales(animalId: string, _entryDate: Date): Date {
  const sales = getSalesByAnimalId(animalId);
  if (sales.length === 0) {
    return new Date();
  }

  const sortedSales = sales.toSorted(
    (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  );
  return new Date(sortedSales[0].saleDate);
}

function calculateDaysOnFeed(
  animal: ReturnType<typeof getAnimalsByPropertyId>[0],
  movements: ReturnType<typeof getAnimalMovementsByAnimalId>,
  confinementLocationIds: Set<string>,
  period?: { startDate?: string; endDate?: string }
): DaysOnFeedResult | null {
  if (movements.length === 0) {
    return null;
  }

  const filteredMovements = filterMovementsByPeriod(movements, period);
  const sortedMovements = filteredMovements.toSorted(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const { entryDate, exitDate: initialExitDate } = findEntryAndExitDates(
    sortedMovements,
    confinementLocationIds
  );

  const exitDate =
    entryDate && !initialExitDate ? getExitDateFromSales(animal.id, entryDate) : initialExitDate;

  if (!entryDate || !exitDate) {
    return null;
  }

  const days = Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return null;
  }

  return {
    days,
    animalId: animal.id,
    animalCode: animal.code,
    entryDate: entryDate.toISOString().split("T")[0],
    exitDate: exitDate.toISOString().split("T")[0],
  };
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
  const confinementLocationIds = getConfinementLocationIds(propertyId);
  const results: DaysOnFeedResult[] = [];

  for (const animal of animals) {
    const movements = getAnimalMovementsByAnimalId(animal.id);
    const result = calculateDaysOnFeed(animal, movements, confinementLocationIds, period);
    if (result) {
      results.push(result);
    }
  }

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

  const filteredSales = filterSalesByPeriod(sales, period);

  let totalCarcassWeight = 0;
  let totalLiveWeight = 0;
  let count = 0;

  for (const sale of filteredSales) {
    for (const item of sale.saleItems) {
      if (item.carcassWeight && item.weight) {
        totalCarcassWeight += item.carcassWeight;
        totalLiveWeight += item.weight;
        count++;
      }
    }
  }

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

  const filteredSales = filterSalesByPeriod(sales, period);

  const ages: number[] = [];

  for (const sale of filteredSales) {
    for (const item of sale.saleItems) {
      const animal = getAnimalById(item.animalId);
      if (!animal) continue;

      const birth = getBirthByAnimalId(animal.id);
      if (birth) {
        const birthDate = new Date(birth.birthDate);
        const saleDate = new Date(sale.saleDate);
        const ageInDays = Math.floor(
          (saleDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        ages.push(ageInDays);
      }
    }
  }

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

  const filteredSales = filterSalesByPeriod(sales, period);

  let totalArrobas = 0;
  for (const sale of filteredSales) {
    for (const item of sale.saleItems) {
      totalArrobas += item.weight / 30;
    }
  }

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

      const filteredWeighings = filterByPeriod(weighings, period);

      if (filteredWeighings.length === 0) return null;

      const latestWeighing = filteredWeighings
        .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .at(0);

      if (!latestWeighing) return null;
      return { weight: latestWeighing.weight };
    })
    .filter((animal): animal is { weight: number } => animal !== null);

  const animalUnits = calculateAnimalUnits(animalsWithWeights);

  const movements = getMovementsByPropertyId(propertyId);
  let filteredMovements = movements.filter(
    (movement) => movement.type === InventoryMovementType.CONSUMPTION
  );

  filteredMovements = filterByPeriod(filteredMovements, period);

  let totalNitrogen = 0;
  for (const movement of filteredMovements) {
    if (hasNitrogenContent(movement.itemId)) {
      const nitrogenKgPerUnit = getNitrogenContent(movement.itemId);
      const nitrogenKg = movement.quantity * nitrogenKgPerUnit;
      totalNitrogen += nitrogenKg;
    }
  }

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

  for (const result of adgResults) {
    totalWeightGain += result.finalWeight - result.initialWeight;
  }

  const movements = getMovementsByPropertyId(propertyId);
  let filteredMovements = movements.filter(
    (movement) => movement.type === InventoryMovementType.CONSUMPTION
  );

  filteredMovements = filterByPeriod(filteredMovements, period);

  let totalNitrogen = 0;
  for (const movement of filteredMovements) {
    if (hasNitrogenContent(movement.itemId)) {
      const nitrogenKgPerUnit = getNitrogenContent(movement.itemId);
      const nitrogenKg = movement.quantity * nitrogenKgPerUnit;
      totalNitrogen += nitrogenKg;
    }
  }

  const kgMeatPerKgNitrogen = totalNitrogen > 0 ? totalWeightGain / totalNitrogen : 0;

  const result: KgMeatPerKgNitrogenResult = {
    kgMeatPerKgNitrogen: Math.round(kgMeatPerKgNitrogen * 100) / 100,
    totalWeightGain,
    totalNitrogen,
  };

  setCachedResult(cacheKey, result);
  return result;
}
