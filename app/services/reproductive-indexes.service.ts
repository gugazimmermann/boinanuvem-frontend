import { getBreedingsByPropertyId, getBreedingsByCompanyId } from "./breedings.service";
import {
  getBirthsByPropertyId,
  getBirthsByCompanyId,
  getCalvingIntervalsByAnimalId,
  getBirthByAnimalId,
} from "./births.service";
import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getWeighingsByAnimalId } from "./weighings.service";
import { getDeathsByCompanyId, getDeathByAnimalId } from "./deaths.service";
import type { Breeding, Death, Birth } from "~/types";
import { filterByPeriod } from "~/utils/period-filters";

export interface FertilityRateResult {
  rate: number;
  pregnantCows: number;
  exposedCows: number;
  breakdown?: {
    byCategory?: Record<string, number>;
    byBull?: Record<string, number>;
    byInseminator?: Record<string, number>;
    byCalvingMonth?: Record<string, number>;
    byBCS?: Record<string, number>;
  };
}

export interface BirthRateResult {
  rate: number;
  calvesBorn: number;
  pregnantFemales: number;
  monthly?: Array<{
    month: string;
    rate: number;
    calvesBorn: number;
    pregnantFemales: number;
  }>;
}

export interface CalvingIntervalResult {
  average: number;
  min: number;
  max: number;
  intervals: number[];
  animalsWithIntervals: number;
}

export interface CullingRateResult {
  rate: number;
  replacedFemales: number;
  totalFemales: number;
  annual?: Array<{
    year: string;
    rate: number;
    replacedFemales: number;
    totalFemales: number;
  }>;
}

export interface IntrauterineMortalityResult {
  rate: number;
  pregnantCows: number;
  cowsThatCalved: number;
  losses: number;
}

export interface BullToCowRatioResult {
  ratio: string;
  bullsUsed: number;
  exposedCows: number;
  details?: Array<{
    bullId: string;
    bullCode: string;
    exposedCows: number;
    ratio: string;
  }>;
}

export interface ExpectedBirthsForecastResult {
  monthly: Array<{
    month: string;
    expectedBirths: number;
  }>;
  total: number;
}

export interface WeaningRateResult {
  rate: number;
  weanedCalves: number;
  exposedFemales: number;
}

export interface WeaningRatioResult {
  ratio: number;
  weanedCalfWeight: number;
  motherWeight: number;
  pairs: number;
}

export interface KgWeanedCalfPerExposedCowResult {
  kgPerExposedCow: number;
  totalWeanedWeight: number;
  weanedCalves: number;
  exposedFemales: number;
}

export interface MortalityRateResult {
  rate: number;
  deadAnimals: number;
  totalAnimals: number;
  period?: { startDate?: string; endDate?: string };
}

export interface CalfMortalityRateResult {
  rate: number;
  deadCalves: number;
  totalCalves: number;
  monthly?: Array<{
    month: string;
    rate: number;
    deadCalves: number;
    totalCalves: number;
  }>;
}
export async function getFertilityRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string },
  filters?: {
    category?: string;
    bullId?: string;
    inseminatorId?: string;
    calvingMonth?: string;
    bcs?: string;
  }
): Promise<FertilityRateResult> {
  const breedings = await getBreedingsByPropertyId(propertyId);

  let filteredBreedings = filterByPeriod(breedings, period);

  if (filters?.bullId) {
    filteredBreedings = filteredBreedings.filter((b) => b.bullId === filters.bullId);
  }

  const exposedAnimalIds = new Set(filteredBreedings.map((b) => b.animalId));
  const exposedCows = await getExposedFemaleAnimalIds(exposedAnimalIds);

  const confirmedBreedings = filteredBreedings.filter((b) => b.confirmed === true);
  const pregnantAnimalIds = new Set(confirmedBreedings.map((b) => b.animalId));
  const pregnantCows = await getExposedFemaleAnimalIds(pregnantAnimalIds);

  const rate = exposedCows.length > 0 ? (pregnantCows.length / exposedCows.length) * 100 : 0;

  const breakdown: FertilityRateResult["breakdown"] = {};

  if (!filters?.bullId) {
    const byBull: Record<string, number> = {};
    const uniqueBulls = new Set(
      filteredBreedings.map((b) => b.bullId).filter((id): id is string => !!id)
    );
    for (const bullId of uniqueBulls) {
      const bullBreedings = filteredBreedings.filter((b) => b.bullId === bullId);
      const bullExposed = new Set(bullBreedings.map((b) => b.animalId));
      const bullPregnant = new Set(
        bullBreedings.filter((b) => b.confirmed === true).map((b) => b.animalId)
      );
      const bull = await getAnimalById(bullId);
      if (bull && bullExposed.size > 0) {
        byBull[bull.code] = (bullPregnant.size / bullExposed.size) * 100;
      }
    }
    if (Object.keys(byBull).length > 0) {
      breakdown.byBull = byBull;
    }
  }

  return {
    rate: Math.round(rate * 100) / 100,
    pregnantCows: pregnantCows.length,
    exposedCows: exposedCows.length,
    breakdown: Object.keys(breakdown).length > 0 ? breakdown : undefined,
  };
}

/**
 * Check if an animal is female by checking its birth record or if it has given birth
 */
async function isFemaleAnimal(
  animalId: string,
  allCompanyBirths?: Awaited<ReturnType<typeof getBirthsByCompanyId>>
): Promise<boolean> {
  const birth = await getBirthByAnimalId(animalId);
  if (birth?.gender === "female") {
    return true;
  }

  // If no company births provided, only check birth record
  if (!allCompanyBirths) {
    return false;
  }

  const birthsAsMother = allCompanyBirths.filter((b) => b.motherId === animalId);
  return birthsAsMother.length > 0;
}

/**
 * Get female animals from a list of animals
 */
async function getFemaleAnimals<T extends { id: string }>(animals: T[]): Promise<T[]> {
  const results: (T | null)[] = [];
  for (const animal of animals) {
    const birth = await getBirthByAnimalId(animal.id);
    if (birth?.gender === "female") {
      results.push(animal);
    } else {
      results.push(null);
    }
  }
  return results.filter((a): a is T => a !== null);
}

/**
 * Get exposed female animal IDs from breedings
 * Uses isFemaleAnimal to check both birth record and if animal has given birth
 */
async function getExposedFemaleAnimalIds(
  animalIds: Set<string>,
  allCompanyBirths?: Awaited<ReturnType<typeof getBirthsByCompanyId>>
): Promise<string[]> {
  const exposedFemalesPromises = Array.from(animalIds).map(async (animalId) => {
    const animal = await getAnimalById(animalId);
    if (!animal) return false;
    return await isFemaleAnimal(animalId, allCompanyBirths);
  });
  const exposedFemalesResults = await Promise.all(exposedFemalesPromises);
  const animalIdsArray = Array.from(animalIds);
  return animalIdsArray.filter((_, index) => exposedFemalesResults[index] === true);
}

function getExpectedBirthWindow(breedingDate: Date) {
  const expectedBirthStart = new Date(breedingDate);
  expectedBirthStart.setDate(expectedBirthStart.getDate() + 255);
  const expectedBirthEnd = new Date(breedingDate);
  expectedBirthEnd.setDate(expectedBirthEnd.getDate() + 285);
  return { expectedBirthStart, expectedBirthEnd };
}

function findMatchingBirth(
  breeding: { animalId: string; date: string },
  births: Awaited<ReturnType<typeof getBirthsByPropertyId>> | undefined
) {
  if (!births) return undefined;
  const breedingDate = new Date(breeding.date);
  const { expectedBirthStart, expectedBirthEnd } = getExpectedBirthWindow(breedingDate);

  return births.find((birth) => {
    if (birth.motherId !== breeding.animalId) return false;
    const birthDate = new Date(birth.birthDate);
    return birthDate >= expectedBirthStart && birthDate <= expectedBirthEnd;
  });
}

function countCalvesBorn(
  confirmedBreedingsForFemales: Array<{ animalId: string; date: string }>,
  births: Awaited<ReturnType<typeof getBirthsByPropertyId>> | undefined,
  period?: { startDate?: string; endDate?: string }
): number {
  if (!births) return 0;
  let calvesBorn = 0;

  for (const breeding of confirmedBreedingsForFemales) {
    const matchingBirth = findMatchingBirth(breeding, births);

    if (period?.startDate || period?.endDate) {
      if (!matchingBirth) continue;
      const birthDate = new Date(matchingBirth.birthDate).getTime();
      const periodEnd = period.endDate ? new Date(period.endDate).getTime() : Date.now();
      const maxBirthDate = periodEnd + 285 * 24 * 60 * 60 * 1000;
      if (birthDate <= maxBirthDate) {
        calvesBorn++;
      }
    } else if (matchingBirth) {
      calvesBorn++;
    }
  }

  return calvesBorn;
}

function getMonthKey(breedingDate: Date): string {
  return `${breedingDate.getFullYear()}-${String(breedingDate.getMonth() + 1).padStart(2, "0")}`;
}

async function getLatestWeight(animalId: string): Promise<number | null> {
  const weighings = await getWeighingsByAnimalId(animalId);
  if (weighings.length === 0) return null;

  const sortedWeighings = [...weighings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sortedWeighings[0].weight;
}

/**
 * Unified function to validate if a calf is weaned
 * Replaces isWeanedCalf, isValidWeanedCalf, and isBirthValidForWeaning
 */
async function isValidWeanedCalf(
  birth: Birth | undefined,
  propertyId: string,
  breedingSeasonFemales: Set<string>,
  weaningAgeDays: number,
  today: Date = new Date()
): Promise<boolean> {
  if (!birth?.motherId) return false;
  const mother = await getAnimalById(birth.motherId);
  if (!mother?.propertyId || mother.propertyId !== propertyId) return false;
  if (!breedingSeasonFemales.has(birth.motherId)) return false;

  const birthDate = new Date(birth.birthDate);
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  if (ageInDays < weaningAgeDays) return false;

  const calf = await getAnimalById(birth.animalId);
  if (!calf || calf.status === "sold") return false;

  const death = await getDeathByAnimalId(birth.animalId);
  return !death;
}

function calculateMonthlyBirthRate(
  confirmedBreedingsForFemales: Array<{ animalId: string; date: string }>,
  births: Awaited<ReturnType<typeof getBirthsByPropertyId>> | undefined
): BirthRateResult["monthly"] {
  if (confirmedBreedingsForFemales.length === 0 || !births) {
    return undefined;
  }

  const monthlyData = new Map<string, { calves: number; pregnancies: number }>();

  for (const breeding of confirmedBreedingsForFemales) {
    const breedingDate = new Date(breeding.date);
    const monthKey = getMonthKey(breedingDate);

    const existing = monthlyData.get(monthKey) || { calves: 0, pregnancies: 0 };
    existing.pregnancies++;

    const matchingBirth = findMatchingBirth(breeding, births);
    if (matchingBirth) {
      existing.calves++;
    }

    monthlyData.set(monthKey, existing);
  }

  const monthly: BirthRateResult["monthly"] = [];
  for (const [monthKey, data] of monthlyData) {
    monthly.push({
      month: monthKey,
      rate: data.pregnancies > 0 ? (data.calves / data.pregnancies) * 100 : 0,
      calvesBorn: data.calves,
      pregnantFemales: data.pregnancies,
    });
  }

  return monthly.toSorted((a, b) => a.month.localeCompare(b.month));
}

export async function getBirthRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): Promise<BirthRateResult> {
  const [breedings, births, animals] = await Promise.all([
    getBreedingsByPropertyId(propertyId),
    getBirthsByPropertyId(propertyId),
    getAnimalsByPropertyId(propertyId),
  ]);

  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allCompanyBirths = await getBirthsByCompanyId(companyId);

  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);
  const filteredConfirmedBreedings = filterByPeriod(confirmedBreedings, period);

  const confirmedBreedingsForFemalesPromises = filteredConfirmedBreedings.map(async (breeding) => {
    const animal = await getAnimalById(breeding.animalId);
    if (!animal) return null;
    const isFemale = await isFemaleAnimal(animal.id, allCompanyBirths);
    return isFemale ? breeding : null;
  });
  const confirmedBreedingsForFemalesResults = await Promise.all(
    confirmedBreedingsForFemalesPromises
  );
  const confirmedBreedingsForFemales = confirmedBreedingsForFemalesResults.filter(
    (b): b is (typeof breedings)[0] => b !== null
  );

  const pregnantFemales = confirmedBreedingsForFemales.length;
  const calvesBorn = countCalvesBorn(confirmedBreedingsForFemales, births, period);

  const rate = pregnantFemales > 0 ? (calvesBorn / pregnantFemales) * 100 : 0;
  const monthly = calculateMonthlyBirthRate(confirmedBreedingsForFemales, births);

  return {
    rate: Math.round(rate * 100) / 100,
    calvesBorn,
    pregnantFemales: pregnantFemales,
    monthly: monthly && monthly.length > 0 ? monthly : undefined,
  };
}

export async function getCalvingInterval(propertyId: string): Promise<CalvingIntervalResult> {
  const animals = await getAnimalsByPropertyId(propertyId);
  const femaleAnimals = await getFemaleAnimals(animals);

  const allIntervals: number[] = [];
  let animalsWithIntervals = 0;

  for (const animal of femaleAnimals) {
    const intervals = await getCalvingIntervalsByAnimalId(animal.id);
    if (intervals.length > 0) {
      allIntervals.push(...intervals);
      animalsWithIntervals++;
    }
  }

  if (allIntervals.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      intervals: [],
      animalsWithIntervals: 0,
    };
  }

  const average = allIntervals.reduce((sum, interval) => sum + interval, 0) / allIntervals.length;
  const min = Math.min(...allIntervals);
  const max = Math.max(...allIntervals);

  return {
    average: Math.round(average),
    min,
    max,
    intervals: allIntervals,
    animalsWithIntervals,
  };
}

export async function getCullingRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string; year?: string }
): Promise<CullingRateResult> {
  const animals = await getAnimalsByPropertyId(propertyId);
  const femaleAnimals = await getFemaleAnimals(animals);

  const filteredFemales = filterByPeriod(femaleAnimals, period);

  const replacedFemales = filteredFemales.filter((animal) => animal.status === "inactive");
  const totalFemales = filteredFemales.length;

  const rate = totalFemales > 0 ? (replacedFemales.length / totalFemales) * 100 : 0;

  const annual: CullingRateResult["annual"] = [];
  if (femaleAnimals.length > 0) {
    const annualData = new Map<string, { replaced: number; total: number }>();

    for (const animal of femaleAnimals) {
      const date = new Date(animal.acquisitionDate || animal.createdAt);
      const year = date.getFullYear().toString();
      const existing = annualData.get(year) || { replaced: 0, total: 0 };
      existing.total++;
      if (animal.status === "inactive") {
        existing.replaced++;
      }
      annualData.set(year, existing);
    }

    for (const [year, data] of annualData) {
      annual.push({
        year,
        rate: data.total > 0 ? (data.replaced / data.total) * 100 : 0,
        replacedFemales: data.replaced,
        totalFemales: data.total,
      });
    }

    const sortedAnnual = annual.toSorted((a, b) => a.year.localeCompare(b.year));
    annual.length = 0;
    annual.push(...sortedAnnual);
  }

  return {
    rate: Math.round(rate * 100) / 100,
    replacedFemales: replacedFemales.length,
    totalFemales,
    annual: annual.length > 0 ? annual : undefined,
  };
}

export async function getIntrauterineMortalityIndex(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): Promise<IntrauterineMortalityResult> {
  const [breedings, births] = await Promise.all([
    getBreedingsByPropertyId(propertyId),
    getBirthsByPropertyId(propertyId),
  ]);

  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);
  const filteredBreedings = filterByPeriod(confirmedBreedings, period);

  const pregnantAnimalIds = new Set(filteredBreedings.map((b) => b.animalId));
  const pregnantCows = await getExposedFemaleAnimalIds(pregnantAnimalIds);

  const cowsThatCalvedPromises = (births || [])
    .filter((birth) => birth.motherId)
    .map(async (birth) => {
      const mother = await getAnimalById(birth.motherId ?? undefined);
      return mother?.propertyId === propertyId ? birth.motherId : null;
    });
  const cowsThatCalvedResults = await Promise.all(cowsThatCalvedPromises);
  const cowsThatCalved = new Set(cowsThatCalvedResults.filter((id): id is string => id !== null));

  const losses = pregnantCows.filter((animalId) => !cowsThatCalved.has(animalId)).length;

  const rate = pregnantCows.length > 0 ? (losses / pregnantCows.length) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100,
    pregnantCows: pregnantCows.length,
    cowsThatCalved: cowsThatCalved.size,
    losses,
  };
}

export async function getBullToCowRatio(propertyId: string): Promise<BullToCowRatioResult> {
  const breedings = await getBreedingsByPropertyId(propertyId);

  const exposedAnimalIds = new Set(breedings.map((b) => b.animalId));
  const exposedCows = await getExposedFemaleAnimalIds(exposedAnimalIds);

  const bullIds = new Set(breedings.map((b) => b.bullId).filter((id): id is string => !!id));

  const bullsUsed = bullIds.size;
  const ratioValue =
    exposedCows.length > 0 && bullsUsed > 0 ? Math.round(exposedCows.length / bullsUsed) : 0;
  const ratio = ratioValue > 0 ? `1:${ratioValue}` : "N/A";

  const details: BullToCowRatioResult["details"] = [];
  for (const bullId of bullIds) {
    const bullBreedings = breedings.filter((b) => b.bullId === bullId);
    const bullExposedCows = new Set(bullBreedings.map((b) => b.animalId));
    const bull = await getAnimalById(bullId);
    if (bull) {
      const bullRatioValue = bullExposedCows.size > 0 ? Math.round(bullExposedCows.size / 1) : 0;
      details.push({
        bullId,
        bullCode: bull.code,
        exposedCows: bullExposedCows.size,
        ratio: bullRatioValue > 0 ? `1:${bullRatioValue}` : "N/A",
      });
    }
  }

  return {
    ratio,
    bullsUsed,
    exposedCows: exposedCows.length,
    details: details.length > 0 ? details : undefined,
  };
}

export async function getExpectedBirthsForecast(
  companyIdOrPropertyId: string,
  options?: { isPropertyId?: boolean; monthsAhead?: number }
): Promise<ExpectedBirthsForecastResult> {
  const isPropertyId = options?.isPropertyId ?? false;
  const monthsAhead = options?.monthsAhead ?? 9;

  let breedings: Breeding[];
  if (isPropertyId) {
    breedings = await getBreedingsByPropertyId(companyIdOrPropertyId);
  } else {
    breedings = await getBreedingsByCompanyId(companyIdOrPropertyId);
  }

  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureCutoff = new Date(today);
  futureCutoff.setMonth(futureCutoff.getMonth() + monthsAhead);

  const monthlyMap = new Map<string, number>();

  for (const breeding of confirmedBreedings) {
    const breedingDate = new Date(breeding.date);
    const expectedBirthDate = new Date(breedingDate);
    expectedBirthDate.setDate(expectedBirthDate.getDate() + 270);

    if (expectedBirthDate >= today && expectedBirthDate <= futureCutoff) {
      const monthKey = `${expectedBirthDate.getFullYear()}-${String(expectedBirthDate.getMonth() + 1).padStart(2, "0")}`;
      const current = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, current + 1);
    }
  }

  const monthlyArray = Array.from(monthlyMap.entries()).map(([month, expectedBirths]) => ({
    month,
    expectedBirths,
  }));
  const monthly = monthlyArray.toSorted((a, b) => a.month.localeCompare(b.month));

  const total = monthly.reduce((sum, item) => sum + item.expectedBirths, 0);

  return {
    monthly,
    total,
  };
}

export async function getWeaningRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): Promise<WeaningRateResult> {
  const [breedings, births, animals] = await Promise.all([
    getBreedingsByPropertyId(propertyId),
    getBirthsByPropertyId(propertyId),
    getAnimalsByPropertyId(propertyId),
  ]);

  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allCompanyBirths = await getBirthsByCompanyId(companyId);

  const exposedAnimalIds = new Set(breedings.map((b) => b.animalId));
  const exposedFemales = await getExposedFemaleAnimalIds(exposedAnimalIds, allCompanyBirths);

  const filteredBreedings = filterByPeriod(breedings, period);

  const today = new Date();
  const weaningAgeDays = 180; // 6 months

  const weanedCalves: string[] = [];
  const breedingSeasonFemales = new Set(filteredBreedings.map((b) => b.animalId));

  if (!births) return { rate: 0, weanedCalves: 0, exposedFemales: exposedFemales.length };
  for (const birth of births) {
    const isWeaned = await isValidWeanedCalf(
      birth,
      propertyId,
      breedingSeasonFemales,
      weaningAgeDays,
      today
    );
    if (isWeaned) {
      weanedCalves.push(birth.animalId);
    }
  }

  const rate = exposedFemales.length > 0 ? (weanedCalves.length / exposedFemales.length) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100,
    weanedCalves: weanedCalves.length,
    exposedFemales: exposedFemales.length,
  };
}

async function calculateWeaningWeights(
  births: Birth[],
  propertyId: string,
  breedingSeasonFemales: Set<string>
): Promise<{ totalWeanedCalfWeight: number; totalMotherWeight: number; pairs: number }> {
  const weaningAgeDays = 180; // 6 months

  let totalWeanedCalfWeight = 0;
  let totalMotherWeight = 0;
  let pairs = 0;

  if (!births) return { totalWeanedCalfWeight: 0, totalMotherWeight: 0, pairs: 0 };
  for (const birth of births) {
    const isValid = await isValidWeanedCalf(
      birth,
      propertyId,
      breedingSeasonFemales,
      weaningAgeDays
    );
    if (!isValid) {
      continue;
    }

    const calfWeight = await getLatestWeight(birth.animalId);
    const motherWeight = birth.motherId ? await getLatestWeight(birth.motherId) : null;

    if (calfWeight && motherWeight) {
      totalWeanedCalfWeight += calfWeight;
      totalMotherWeight += motherWeight;
      pairs++;
    }
  }

  return { totalWeanedCalfWeight, totalMotherWeight, pairs };
}

export async function getWeaningRatio(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): Promise<WeaningRatioResult> {
  const [breedings, births] = await Promise.all([
    getBreedingsByPropertyId(propertyId),
    getBirthsByPropertyId(propertyId),
  ]);

  const filteredBreedings = filterByPeriod(breedings, period);
  const breedingSeasonFemales = new Set(filteredBreedings.map((b) => b.animalId));

  const { totalWeanedCalfWeight, totalMotherWeight, pairs } = await calculateWeaningWeights(
    births || [],
    propertyId,
    breedingSeasonFemales
  );

  const ratio = totalMotherWeight > 0 ? (totalWeanedCalfWeight / totalMotherWeight) * 100 : 0;

  return {
    ratio: Math.round(ratio * 100) / 100,
    weanedCalfWeight: totalWeanedCalfWeight,
    motherWeight: totalMotherWeight,
    pairs,
  };
}

async function getExposedFemales(
  breedings: Breeding[],
  allCompanyBirths: Birth[]
): Promise<string[]> {
  const exposedAnimalIds = new Set(breedings.map((b) => b.animalId));
  return await getExposedFemaleAnimalIds(exposedAnimalIds, allCompanyBirths);
}

async function calculateWeanedCalfWeights(
  births: Birth[],
  propertyId: string,
  breedingSeasonFemales: Set<string>
): Promise<{ totalWeanedWeight: number; weanedCalvesCount: number }> {
  const today = new Date();
  const weaningAgeDays = 180; // 6 months

  let totalWeanedWeight = 0;
  let weanedCalvesCount = 0;

  if (!births) return { totalWeanedWeight: 0, weanedCalvesCount: 0 };
  for (const birth of births) {
    const isValid = await isValidWeanedCalf(
      birth,
      propertyId,
      breedingSeasonFemales,
      weaningAgeDays,
      today
    );
    if (!isValid) continue;

    const latestWeight = await getLatestWeight(birth.animalId);
    if (latestWeight === null) continue;

    totalWeanedWeight += latestWeight;
    weanedCalvesCount++;
  }

  return { totalWeanedWeight, weanedCalvesCount };
}

export async function getKgWeanedCalfPerExposedCow(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): Promise<KgWeanedCalfPerExposedCowResult> {
  const [breedings, births, animals] = await Promise.all([
    getBreedingsByPropertyId(propertyId),
    getBirthsByPropertyId(propertyId),
    getAnimalsByPropertyId(propertyId),
  ]);

  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allCompanyBirths = await getBirthsByCompanyId(companyId);

  const exposedFemales = await getExposedFemales(breedings, allCompanyBirths || []);
  const filteredBreedings = filterByPeriod(breedings, period);
  const breedingSeasonFemales = new Set(filteredBreedings.map((b) => b.animalId));

  const { totalWeanedWeight, weanedCalvesCount } = await calculateWeanedCalfWeights(
    births || [],
    propertyId,
    breedingSeasonFemales
  );

  const avgWeanedWeight = weanedCalvesCount > 0 ? totalWeanedWeight / weanedCalvesCount : 0;
  const totalWeanedWeightFromCalves = weanedCalvesCount * avgWeanedWeight;
  const kgPerExposedCow =
    exposedFemales.length > 0 ? totalWeanedWeightFromCalves / exposedFemales.length : 0;

  return {
    kgPerExposedCow: Math.round(kgPerExposedCow * 100) / 100,
    totalWeanedWeight: totalWeanedWeightFromCalves,
    weanedCalves: weanedCalvesCount,
    exposedFemales: exposedFemales.length,
  };
}

function countAnimalsInPeriod(
  animals: Awaited<ReturnType<typeof getAnimalsByPropertyId>>,
  period?: { startDate?: string; endDate?: string }
): number {
  if (!period?.startDate && !period?.endDate) {
    return animals.length;
  }

  // For animals, we filter by acquisitionDate or createdAt, but the logic is slightly different
  // (checking if date > start instead of < start for acquisition date)
  // So we keep the custom logic here
  return animals.filter((animal) => {
    const animalDate = animal.acquisitionDate || animal.createdAt;
    if (!animalDate) return true;
    const date = new Date(animalDate).getTime();
    if (period.startDate) {
      const start = new Date(period.startDate).getTime();
      if (date > start) return false;
    }
    return true;
  }).length;
}

export async function getMortalityRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): Promise<MortalityRateResult> {
  const animals = await getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const deaths = await getDeathsByCompanyId(companyId);

  const propertyDeathsPromises = deaths.map(async (death) => {
    const deadAnimal = await getAnimalById(death.animalId);
    return deadAnimal?.propertyId === propertyId ? death : null;
  });
  const propertyDeathsResults = await Promise.all(propertyDeathsPromises);
  const propertyDeaths = propertyDeathsResults.filter((d): d is (typeof deaths)[0] => d !== null);

  const filteredDeaths = filterByPeriod(propertyDeaths, period);
  const totalAnimals = countAnimalsInPeriod(animals || [], period);
  const deadAnimals = filteredDeaths.length;
  const rate = totalAnimals > 0 ? (deadAnimals / totalAnimals) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100,
    deadAnimals,
    totalAnimals,
    period,
  };
}

async function filterCalfDeaths(deaths: Death[], propertyId: string): Promise<Death[]> {
  const calfAgeDays = 12 * 30; // 12 months * 30 days

  const filteredDeathsPromises = deaths.map(async (death) => {
    const deadAnimal = await getAnimalById(death.animalId);
    if (!deadAnimal?.propertyId || deadAnimal.propertyId !== propertyId) return null;

    const birth = await getBirthByAnimalId(death.animalId);
    if (!birth) return null;

    const birthDate = new Date(birth.birthDate);
    const deathDate = new Date(death.date);
    const ageInDays = Math.floor(
      (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return ageInDays <= calfAgeDays ? death : null;
  });
  const filteredDeathsResults = await Promise.all(filteredDeathsPromises);
  return filteredDeathsResults.filter((d): d is (typeof deaths)[0] => d !== null);
}

export async function getCalfMortalityRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): Promise<CalfMortalityRateResult> {
  const calfAgeDays = 12 * 30; // 12 months * 30 days
  const [births, animals] = await Promise.all([
    getBirthsByPropertyId(propertyId),
    getAnimalsByPropertyId(propertyId),
  ]);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const deaths = await getDeathsByCompanyId(companyId);

  const propertyDeaths = await filterCalfDeaths(deaths, propertyId);
  const filteredDeaths = filterByPeriod(propertyDeaths, period);
  const filteredBirths = filterByPeriod(births || [], period);
  const totalCalves = filteredBirths.length;

  const deadCalves = filteredDeaths.length;
  const rate = totalCalves > 0 ? (deadCalves / totalCalves) * 100 : 0;

  const calculateMonthlyMortality = (
    births: Birth[],
    deaths: Death[],
    calfAgeDays: number
  ): CalfMortalityRateResult["monthly"] => {
    if (births.length === 0) {
      return [];
    }

    const monthlyData = new Map<string, { dead: number; total: number }>();

    for (const birth of births) {
      const birthDate = new Date(birth.birthDate);
      const monthKey = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyData.get(monthKey) || { dead: 0, total: 0 };
      existing.total++;

      const death = deaths.find((d) => d.animalId === birth.animalId);
      if (death) {
        const deathDate = new Date(death.date);
        const ageInDays = Math.floor(
          (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (ageInDays <= calfAgeDays) {
          existing.dead++;
        }
      }

      monthlyData.set(monthKey, existing);
    }

    const monthly: CalfMortalityRateResult["monthly"] = [];
    for (const [monthKey, data] of monthlyData) {
      monthly.push({
        month: monthKey,
        rate: data.total > 0 ? (data.dead / data.total) * 100 : 0,
        deadCalves: data.dead,
        totalCalves: data.total,
      });
    }

    return monthly.toSorted((a, b) => a.month.localeCompare(b.month));
  };

  const monthly = calculateMonthlyMortality(births || [], deaths, calfAgeDays);

  return {
    rate: Math.round(rate * 100) / 100,
    deadCalves,
    totalCalves,
    monthly: monthly && monthly.length > 0 ? monthly : undefined,
  };
}
