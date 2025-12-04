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
export function getFertilityRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string },
  filters?: {
    category?: string;
    bullId?: string;
    inseminatorId?: string;
    calvingMonth?: string;
    bcs?: string;
  }
): FertilityRateResult {
  const breedings = getBreedingsByPropertyId(propertyId);

  let filteredBreedings = breedings;

  if (period?.startDate || period?.endDate) {
    filteredBreedings = filteredBreedings.filter((b) => {
      const breedingDate = new Date(b.date).getTime();
      if (period.startDate) {
        const start = new Date(period.startDate).getTime();
        if (breedingDate < start) return false;
      }
      if (period.endDate) {
        const end = new Date(period.endDate).getTime();
        if (breedingDate > end) return false;
      }
      return true;
    });
  }

  if (filters?.bullId) {
    filteredBreedings = filteredBreedings.filter((b) => b.bullId === filters.bullId);
  }

  const exposedAnimalIds = new Set(filteredBreedings.map((b) => b.animalId));
  const exposedCows = Array.from(exposedAnimalIds).filter((animalId) => {
    const animal = getAnimalById(animalId);
    if (!animal) return false;
    const birth = getBirthByAnimalId(animalId);
    return birth?.gender === "female";
  });

  const confirmedBreedings = filteredBreedings.filter((b) => b.confirmed === true);
  const pregnantAnimalIds = new Set(confirmedBreedings.map((b) => b.animalId));
  const pregnantCows = Array.from(pregnantAnimalIds).filter((animalId) => {
    const animal = getAnimalById(animalId);
    if (!animal) return false;
    const birth = getBirthByAnimalId(animalId);
    return birth?.gender === "female";
  });

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
      const bull = getAnimalById(bullId);
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

function filterBreedingsByPeriod(
  breedings: ReturnType<typeof getBreedingsByPropertyId>,
  period?: { startDate?: string; endDate?: string }
) {
  const filtered = breedings.filter((b) => b.confirmed === true);
  if (!period?.startDate && !period?.endDate) {
    return filtered;
  }

  return filtered.filter((b) => {
    const breedingDate = new Date(b.date).getTime();
    if (period.startDate) {
      const start = new Date(period.startDate).getTime();
      if (breedingDate < start) return false;
    }
    if (period.endDate) {
      const end = new Date(period.endDate).getTime();
      if (breedingDate > end) return false;
    }
    return true;
  });
}

function isFemaleAnimal(
  animalId: string,
  allCompanyBirths: ReturnType<typeof getBirthsByCompanyId>
): boolean {
  const birth = getBirthByAnimalId(animalId);
  if (birth?.gender === "female") {
    return true;
  }

  const birthsAsMother = allCompanyBirths.filter((b) => b.motherId === animalId);
  return birthsAsMother.length > 0;
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
  births: ReturnType<typeof getBirthsByPropertyId>
) {
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
  births: ReturnType<typeof getBirthsByPropertyId>,
  period?: { startDate?: string; endDate?: string }
): number {
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

function getLatestWeight(animalId: string): number | null {
  const weighings = getWeighingsByAnimalId(animalId);
  if (weighings.length === 0) return null;

  const sortedWeighings = weighings.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sortedWeighings[0].weight;
}

function isWeanedCalf(
  birth: ReturnType<typeof getBirthsByPropertyId>[0],
  propertyId: string,
  breedingSeasonFemales: Set<string>,
  today: Date,
  weaningAgeDays: number
): boolean {
  if (!birth.motherId) return false;
  const mother = getAnimalById(birth.motherId);
  if (!mother?.propertyId || mother.propertyId !== propertyId) return false;
  if (!breedingSeasonFemales.has(birth.motherId)) return false;

  const birthDate = new Date(birth.birthDate);
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  if (ageInDays < weaningAgeDays) return false;

  const calf = getAnimalById(birth.animalId);
  if (!calf || calf.status === "sold") return false;

  const death = getDeathByAnimalId(birth.animalId);
  return !death;
}

function calculateMonthlyBirthRate(
  confirmedBreedingsForFemales: Array<{ animalId: string; date: string }>,
  births: ReturnType<typeof getBirthsByPropertyId>
): BirthRateResult["monthly"] {
  if (confirmedBreedingsForFemales.length === 0) {
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

export function getBirthRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): BirthRateResult {
  const breedings = getBreedingsByPropertyId(propertyId);
  const births = getBirthsByPropertyId(propertyId);
  const animals = getAnimalsByPropertyId(propertyId);

  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allCompanyBirths = getBirthsByCompanyId(companyId);

  const filteredConfirmedBreedings = filterBreedingsByPeriod(breedings, period);

  const confirmedBreedingsForFemales = filteredConfirmedBreedings.filter((breeding) => {
    const animal = getAnimalById(breeding.animalId);
    if (!animal) return false;
    return isFemaleAnimal(animal.id, allCompanyBirths);
  });

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

export function getCalvingInterval(propertyId: string): CalvingIntervalResult {
  const animals = getAnimalsByPropertyId(propertyId);

  const femaleAnimals = animals.filter((animal) => {
    const birth = getBirthByAnimalId(animal.id);
    return birth?.gender === "female";
  });

  const allIntervals: number[] = [];
  let animalsWithIntervals = 0;

  for (const animal of femaleAnimals) {
    const intervals = getCalvingIntervalsByAnimalId(animal.id);
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

export function getCullingRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string; year?: string }
): CullingRateResult {
  const animals = getAnimalsByPropertyId(propertyId);

  const femaleAnimals = animals.filter((animal) => {
    const birth = getBirthByAnimalId(animal.id);
    return birth?.gender === "female";
  });

  let filteredFemales = femaleAnimals;
  if (period?.startDate || period?.endDate) {
    filteredFemales = femaleAnimals.filter((animal) => {
      const animalDate = animal.acquisitionDate || animal.createdAt;
      if (!animalDate) return true;
      const date = new Date(animalDate).getTime();
      if (period.startDate) {
        const start = new Date(period.startDate).getTime();
        if (date < start) return false;
      }
      if (period.endDate) {
        const end = new Date(period.endDate).getTime();
        if (date > end) return false;
      }
      return true;
    });
  }

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

export function getIntrauterineMortalityIndex(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): IntrauterineMortalityResult {
  const breedings = getBreedingsByPropertyId(propertyId);
  const births = getBirthsByPropertyId(propertyId);

  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);

  let filteredBreedings = confirmedBreedings;
  if (period?.startDate || period?.endDate) {
    filteredBreedings = confirmedBreedings.filter((b) => {
      const breedingDate = new Date(b.date).getTime();
      if (period.startDate) {
        const start = new Date(period.startDate).getTime();
        if (breedingDate < start) return false;
      }
      if (period.endDate) {
        const end = new Date(period.endDate).getTime();
        if (breedingDate > end) return false;
      }
      return true;
    });
  }

  const pregnantAnimalIds = new Set(filteredBreedings.map((b) => b.animalId));
  const pregnantCows = Array.from(pregnantAnimalIds).filter((animalId) => {
    const animal = getAnimalById(animalId);
    if (!animal) return false;
    const birth = getBirthByAnimalId(animalId);
    return birth?.gender === "female";
  });

  const cowsThatCalved = new Set(
    births
      .filter((birth) => {
        if (!birth.motherId) return false;
        const mother = getAnimalById(birth.motherId);
        return mother?.propertyId === propertyId;
      })
      .map((birth) => birth.motherId)
  );

  const losses = pregnantCows.filter((animalId) => !cowsThatCalved.has(animalId)).length;

  const rate = pregnantCows.length > 0 ? (losses / pregnantCows.length) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100,
    pregnantCows: pregnantCows.length,
    cowsThatCalved: cowsThatCalved.size,
    losses,
  };
}

export function getBullToCowRatio(propertyId: string): BullToCowRatioResult {
  const breedings = getBreedingsByPropertyId(propertyId);

  const exposedAnimalIds = new Set(breedings.map((b) => b.animalId));
  const exposedCows = Array.from(exposedAnimalIds).filter((animalId) => {
    const animal = getAnimalById(animalId);
    if (!animal) return false;
    const birth = getBirthByAnimalId(animalId);
    return birth?.gender === "female";
  });

  const bullIds = new Set(breedings.map((b) => b.bullId).filter((id): id is string => !!id));

  const bullsUsed = bullIds.size;
  const ratioValue =
    exposedCows.length > 0 && bullsUsed > 0 ? Math.round(exposedCows.length / bullsUsed) : 0;
  const ratio = ratioValue > 0 ? `1:${ratioValue}` : "N/A";

  const details: BullToCowRatioResult["details"] = [];
  for (const bullId of bullIds) {
    const bullBreedings = breedings.filter((b) => b.bullId === bullId);
    const bullExposedCows = new Set(bullBreedings.map((b) => b.animalId));
    const bull = getAnimalById(bullId);
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

export function getExpectedBirthsForecast(
  companyIdOrPropertyId: string,
  options?: { isPropertyId?: boolean; monthsAhead?: number }
): ExpectedBirthsForecastResult {
  const isPropertyId = options?.isPropertyId ?? false;
  const monthsAhead = options?.monthsAhead ?? 9;

  let breedings: Breeding[];
  if (isPropertyId) {
    breedings = getBreedingsByPropertyId(companyIdOrPropertyId);
  } else {
    breedings = getBreedingsByCompanyId(companyIdOrPropertyId);
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

export function getWeaningRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): WeaningRateResult {
  const breedings = getBreedingsByPropertyId(propertyId);
  const births = getBirthsByPropertyId(propertyId);
  const animals = getAnimalsByPropertyId(propertyId);

  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allCompanyBirths = getBirthsByCompanyId(companyId);

  const exposedAnimalIds = new Set(breedings.map((b) => b.animalId));
  const exposedFemales = Array.from(exposedAnimalIds).filter((animalId) => {
    const animal = getAnimalById(animalId);
    if (!animal) return false;
    const birth = getBirthByAnimalId(animalId);
    if (birth?.gender === "female") return true;
    const birthsAsMother = allCompanyBirths.filter((b) => b.motherId === animalId);
    return birthsAsMother.length > 0;
  });

  let filteredBreedings = breedings;
  if (period?.startDate || period?.endDate) {
    filteredBreedings = breedings.filter((b) => {
      const breedingDate = new Date(b.date).getTime();
      if (period.startDate) {
        const start = new Date(period.startDate).getTime();
        if (breedingDate < start) return false;
      }
      if (period.endDate) {
        const end = new Date(period.endDate).getTime();
        if (breedingDate > end) return false;
      }
      return true;
    });
  }

  const today = new Date();
  const weaningAgeDays = 180; // 6 months

  const weanedCalves: string[] = [];
  const breedingSeasonFemales = new Set(filteredBreedings.map((b) => b.animalId));

  for (const birth of births) {
    if (isWeanedCalf(birth, propertyId, breedingSeasonFemales, today, weaningAgeDays)) {
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

function filterBreedingsByPeriodGeneric(
  breedings: Breeding[],
  period?: { startDate?: string; endDate?: string }
): Breeding[] {
  if (!period?.startDate && !period?.endDate) {
    return breedings;
  }

  return breedings.filter((b) => {
    const breedingDate = new Date(b.date).getTime();
    if (period.startDate) {
      const start = new Date(period.startDate).getTime();
      if (breedingDate < start) return false;
    }
    if (period.endDate) {
      const end = new Date(period.endDate).getTime();
      if (breedingDate > end) return false;
    }
    return true;
  });
}

function isValidWeanedCalf(
  birth: Birth,
  propertyId: string,
  breedingSeasonFemales: Set<string>,
  weaningAgeDays: number
): boolean {
  if (!birth.motherId) return false;
  const mother = getAnimalById(birth.motherId);
  if (!mother?.propertyId || mother.propertyId !== propertyId) return false;
  if (!breedingSeasonFemales.has(birth.motherId)) return false;

  const today = new Date();
  const birthDate = new Date(birth.birthDate);
  const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  if (ageInDays < weaningAgeDays) return false;

  const calf = getAnimalById(birth.animalId);
  if (!calf || calf.status === "sold") return false;

  const death = getDeathByAnimalId(birth.animalId);
  if (death) return false;

  return true;
}

function calculateWeaningWeights(
  births: Birth[],
  propertyId: string,
  breedingSeasonFemales: Set<string>
): { totalWeanedCalfWeight: number; totalMotherWeight: number; pairs: number } {
  const weaningAgeDays = 180; // 6 months

  let totalWeanedCalfWeight = 0;
  let totalMotherWeight = 0;
  let pairs = 0;

  for (const birth of births) {
    if (!isValidWeanedCalf(birth, propertyId, breedingSeasonFemales, weaningAgeDays)) {
      continue;
    }

    const calfWeight = getLatestWeight(birth.animalId);
    const motherWeight = birth.motherId ? getLatestWeight(birth.motherId) : null;

    if (calfWeight && motherWeight) {
      totalWeanedCalfWeight += calfWeight;
      totalMotherWeight += motherWeight;
      pairs++;
    }
  }

  return { totalWeanedCalfWeight, totalMotherWeight, pairs };
}

export function getWeaningRatio(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): WeaningRatioResult {
  const breedings = getBreedingsByPropertyId(propertyId);
  const births = getBirthsByPropertyId(propertyId);

  const filteredBreedings = filterBreedingsByPeriodGeneric(breedings, period);
  const breedingSeasonFemales = new Set(filteredBreedings.map((b) => b.animalId));

  const { totalWeanedCalfWeight, totalMotherWeight, pairs } = calculateWeaningWeights(
    births,
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

function getExposedFemales(breedings: Breeding[], allCompanyBirths: Birth[]): string[] {
  const exposedAnimalIds = new Set(breedings.map((b) => b.animalId));
  return Array.from(exposedAnimalIds).filter((animalId) => {
    const animal = getAnimalById(animalId);
    if (!animal) return false;
    const birth = getBirthByAnimalId(animalId);
    if (birth?.gender === "female") return true;
    const birthsAsMother = allCompanyBirths.filter((b) => b.motherId === animalId);
    return birthsAsMother.length > 0;
  });
}

function calculateWeanedCalfWeights(
  births: Birth[],
  propertyId: string,
  breedingSeasonFemales: Set<string>
): { totalWeanedWeight: number; weanedCalvesCount: number } {
  const today = new Date();
  const weaningAgeDays = 180; // 6 months

  let totalWeanedWeight = 0;
  let weanedCalvesCount = 0;

  for (const birth of births) {
    if (!birth.motherId) continue;
    const mother = getAnimalById(birth.motherId);
    if (!mother?.propertyId || mother.propertyId !== propertyId) continue;
    if (!breedingSeasonFemales.has(birth.motherId)) continue;

    const birthDate = new Date(birth.birthDate);
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    if (ageInDays < weaningAgeDays) continue;

    const calf = getAnimalById(birth.animalId);
    if (!calf || calf.status === "sold") continue;

    const death = getDeathByAnimalId(birth.animalId);
    if (death) continue;

    const calfWeighings = getWeighingsByAnimalId(birth.animalId);
    if (calfWeighings.length === 0) continue;

    const sortedCalfWeighings = calfWeighings.toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestCalfWeighing = sortedCalfWeighings[0];
    totalWeanedWeight += latestCalfWeighing.weight;
    weanedCalvesCount++;
  }

  return { totalWeanedWeight, weanedCalvesCount };
}

export function getKgWeanedCalfPerExposedCow(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): KgWeanedCalfPerExposedCowResult {
  const breedings = getBreedingsByPropertyId(propertyId);
  const births = getBirthsByPropertyId(propertyId);
  const animals = getAnimalsByPropertyId(propertyId);

  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const allCompanyBirths = getBirthsByCompanyId(companyId);

  const exposedFemales = getExposedFemales(breedings, allCompanyBirths);
  const filteredBreedings = filterBreedingsByPeriodGeneric(breedings, period);
  const breedingSeasonFemales = new Set(filteredBreedings.map((b) => b.animalId));

  const { totalWeanedWeight, weanedCalvesCount } = calculateWeanedCalfWeights(
    births,
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

function filterDeathsByPeriod(
  deaths: Death[],
  period?: { startDate?: string; endDate?: string }
): Death[] {
  if (!period?.startDate && !period?.endDate) {
    return deaths;
  }

  return deaths.filter((death) => {
    const deathDate = new Date(death.date).getTime();
    if (period.startDate) {
      const start = new Date(period.startDate).getTime();
      if (deathDate < start) return false;
    }
    if (period.endDate) {
      const end = new Date(period.endDate).getTime();
      if (deathDate > end) return false;
    }
    return true;
  });
}

function countAnimalsInPeriod(
  animals: ReturnType<typeof getAnimalsByPropertyId>,
  period?: { startDate?: string; endDate?: string }
): number {
  if (!period?.startDate && !period?.endDate) {
    return animals.length;
  }

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

export function getMortalityRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): MortalityRateResult {
  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const deaths = getDeathsByCompanyId(companyId);

  const propertyDeaths = deaths.filter((death) => {
    const deadAnimal = getAnimalById(death.animalId);
    return deadAnimal?.propertyId === propertyId;
  });

  const filteredDeaths = filterDeathsByPeriod(propertyDeaths, period);
  const totalAnimals = countAnimalsInPeriod(animals, period);
  const deadAnimals = filteredDeaths.length;
  const rate = totalAnimals > 0 ? (deadAnimals / totalAnimals) * 100 : 0;

  return {
    rate: Math.round(rate * 100) / 100,
    deadAnimals,
    totalAnimals,
    period,
  };
}

function filterCalfDeaths(deaths: Death[], propertyId: string): Death[] {
  const calfAgeDays = 12 * 30; // 12 months * 30 days

  return deaths.filter((death) => {
    const deadAnimal = getAnimalById(death.animalId);
    if (!deadAnimal?.propertyId || deadAnimal.propertyId !== propertyId) return false;

    const birth = getBirthByAnimalId(death.animalId);
    if (!birth) return false;

    const birthDate = new Date(birth.birthDate);
    const deathDate = new Date(death.date);
    const ageInDays = Math.floor(
      (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return ageInDays <= calfAgeDays;
  });
}

function filterBirthsByPeriod(
  births: Birth[],
  period?: { startDate?: string; endDate?: string }
): Birth[] {
  if (!period?.startDate && !period?.endDate) {
    return births;
  }

  return births.filter((birth) => {
    const birthDate = new Date(birth.birthDate).getTime();
    if (period.startDate) {
      const start = new Date(period.startDate).getTime();
      if (birthDate < start) return false;
    }
    if (period.endDate) {
      const end = new Date(period.endDate).getTime();
      if (birthDate > end) return false;
    }
    return true;
  });
}

export function getCalfMortalityRate(
  propertyId: string,
  period?: { startDate?: string; endDate?: string }
): CalfMortalityRateResult {
  const calfAgeDays = 12 * 30; // 12 months * 30 days
  const births = getBirthsByPropertyId(propertyId);
  const animals = getAnimalsByPropertyId(propertyId);
  const animal = animals[0];
  const companyId = animal?.companyId || "550e8400-e29b-41d4-a716-446655440000";
  const deaths = getDeathsByCompanyId(companyId);

  const propertyDeaths = filterCalfDeaths(deaths, propertyId);
  const filteredDeaths = filterDeathsByPeriod(propertyDeaths, period);
  const totalCalves = filterBirthsByPeriod(births, period).length;

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

  const monthly = calculateMonthlyMortality(births, deaths, calfAgeDays);

  return {
    rate: Math.round(rate * 100) / 100,
    deadCalves,
    totalCalves,
    monthly: monthly && monthly.length > 0 ? monthly : undefined,
  };
}
