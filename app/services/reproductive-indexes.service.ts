import { getBreedingsByPropertyId, getBreedingsByCompanyId } from "./breedings.service";
import {
  getBirthsByPropertyId,
  getBirthsByCompanyId,
  getCalvingIntervalsByAnimalId,
} from "./births.service";
import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getBirthByAnimalId } from "./births.service";
import type { Breeding } from "~/types";

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
    uniqueBulls.forEach((bullId) => {
      const bullBreedings = filteredBreedings.filter((b) => b.bullId === bullId);
      const bullExposed = new Set(bullBreedings.map((b) => b.animalId));
      const bullPregnant = new Set(
        bullBreedings.filter((b) => b.confirmed === true).map((b) => b.animalId)
      );
      const bull = getAnimalById(bullId);
      if (bull && bullExposed.size > 0) {
        byBull[bull.code] = (bullPregnant.size / bullExposed.size) * 100;
      }
    });
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

  let filteredConfirmedBreedings = breedings.filter((b) => b.confirmed === true);
  if (period?.startDate || period?.endDate) {
    filteredConfirmedBreedings = filteredConfirmedBreedings.filter((b) => {
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

  const isFemaleAnimal = (animalId: string): boolean => {
    const birth = getBirthByAnimalId(animalId);
    if (birth?.gender) {
      return birth.gender === "female";
    }

    const birthsAsMother = allCompanyBirths.filter((b) => b.motherId === animalId);
    if (birthsAsMother.length > 0) {
      return true;
    }

    return true;
  };

  const confirmedBreedingsForFemales = filteredConfirmedBreedings.filter((breeding) => {
    const animal = getAnimalById(breeding.animalId);
    if (!animal) return false;
    return isFemaleAnimal(animal.id);
  });

  const pregnantFemales = confirmedBreedingsForFemales.length;

  let calvesBorn = 0;

  confirmedBreedingsForFemales.forEach((breeding) => {
    const breedingDate = new Date(breeding.date);
    const expectedBirthStart = new Date(breedingDate);
    expectedBirthStart.setDate(expectedBirthStart.getDate() + 255);
    const expectedBirthEnd = new Date(breedingDate);
    expectedBirthEnd.setDate(expectedBirthEnd.getDate() + 285);

    const matchingBirth = births.find((birth) => {
      if (birth.motherId !== breeding.animalId) return false;
      const birthDate = new Date(birth.birthDate);
      return birthDate >= expectedBirthStart && birthDate <= expectedBirthEnd;
    });

    if (period?.startDate || period?.endDate) {
      if (!matchingBirth) return;
      const birthDate = new Date(matchingBirth.birthDate).getTime();
      const periodEnd = period.endDate ? new Date(period.endDate).getTime() : Date.now();
      const maxBirthDate = periodEnd + 285 * 24 * 60 * 60 * 1000;
      if (birthDate <= maxBirthDate) {
        calvesBorn++;
      }
    } else {
      if (matchingBirth) {
        calvesBorn++;
      }
    }
  });

  const rate = pregnantFemales > 0 ? (calvesBorn / pregnantFemales) * 100 : 0;

  const monthly: BirthRateResult["monthly"] = [];
  if (confirmedBreedingsForFemales.length > 0) {
    const monthlyData = new Map<string, { calves: number; pregnancies: number }>();

    confirmedBreedingsForFemales.forEach((breeding) => {
      const breedingDate = new Date(breeding.date);
      const monthKey = `${breedingDate.getFullYear()}-${String(breedingDate.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyData.get(monthKey) || { calves: 0, pregnancies: 0 };
      existing.pregnancies++;

      const breedingDateTime = breedingDate.getTime();
      const expectedBirthStart = new Date(breedingDateTime);
      expectedBirthStart.setDate(expectedBirthStart.getDate() + 255);
      const expectedBirthEnd = new Date(breedingDateTime);
      expectedBirthEnd.setDate(expectedBirthEnd.getDate() + 285);

      const matchingBirth = births.find((birth) => {
        if (birth.motherId !== breeding.animalId) return false;
        const birthDate = new Date(birth.birthDate);
        return birthDate >= expectedBirthStart && birthDate <= expectedBirthEnd;
      });

      if (matchingBirth) {
        existing.calves++;
      }

      monthlyData.set(monthKey, existing);
    });

    monthlyData.forEach((data, monthKey) => {
      monthly.push({
        month: monthKey,
        rate: data.pregnancies > 0 ? (data.calves / data.pregnancies) * 100 : 0,
        calvesBorn: data.calves,
        pregnantFemales: data.pregnancies,
      });
    });

    monthly.sort((a, b) => a.month.localeCompare(b.month));
  }

  return {
    rate: Math.round(rate * 100) / 100,
    calvesBorn,
    pregnantFemales: pregnantFemales,
    monthly: monthly.length > 0 ? monthly : undefined,
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

  femaleAnimals.forEach((animal) => {
    const intervals = getCalvingIntervalsByAnimalId(animal.id);
    if (intervals.length > 0) {
      allIntervals.push(...intervals);
      animalsWithIntervals++;
    }
  });

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

    femaleAnimals.forEach((animal) => {
      const date = new Date(animal.acquisitionDate || animal.createdAt);
      const year = date.getFullYear().toString();
      const existing = annualData.get(year) || { replaced: 0, total: 0 };
      existing.total++;
      if (animal.status === "inactive") {
        existing.replaced++;
      }
      annualData.set(year, existing);
    });

    annualData.forEach((data, year) => {
      annual.push({
        year,
        rate: data.total > 0 ? (data.replaced / data.total) * 100 : 0,
        replacedFemales: data.replaced,
        totalFemales: data.total,
      });
    });

    annual.sort((a, b) => a.year.localeCompare(b.year));
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
  bullIds.forEach((bullId) => {
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
  });

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

  confirmedBreedings.forEach((breeding) => {
    const breedingDate = new Date(breeding.date);
    const expectedBirthDate = new Date(breedingDate);
    expectedBirthDate.setDate(expectedBirthDate.getDate() + 270);

    if (expectedBirthDate >= today && expectedBirthDate <= futureCutoff) {
      const monthKey = `${expectedBirthDate.getFullYear()}-${String(expectedBirthDate.getMonth() + 1).padStart(2, "0")}`;
      const current = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, current + 1);
    }
  });

  const monthly = Array.from(monthlyMap.entries())
    .map(([month, expectedBirths]) => ({
      month,
      expectedBirths,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const total = monthly.reduce((sum, item) => sum + item.expectedBirths, 0);

  return {
    monthly,
    total,
  };
}
