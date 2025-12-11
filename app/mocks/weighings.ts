import type { Weighing, WeighingFormData } from "~/types";

export type { Weighing, WeighingFormData };

const _COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

function _generateWeighingId(index: number): string {
  const base = 446655440100 + index;
  return `ww0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

const _employees = [
  "770e8400-e29b-41d4-a716-446655440010",
  "770e8400-e29b-41d4-a716-446655440011",
  "770e8400-e29b-41d4-a716-446655440012",
];

const _serviceProviders = [
  "880e8400-e29b-41d4-a716-446655440010",
  "880e8400-e29b-41d4-a716-446655440011",
];

const _TODAY = new Date("2025-11-21");

function _calculateAgeInMonths(referenceDate: string, targetDate: Date = _TODAY): number {
  const ref = new Date(referenceDate);
  const months =
    (targetDate.getFullYear() - ref.getFullYear()) * 12 + (targetDate.getMonth() - ref.getMonth());
  const days = targetDate.getDate() - ref.getDate();

  return days > 15 ? months + 1 : months;
}

function _getWeightForAge(
  ageInMonths: number,
  gender: "male" | "female" | undefined,
  breed: string | undefined
): number {
  let baseWeight: number;

  if (ageInMonths <= 0) {
    baseWeight = 30 + Math.random() * 10;
  } else if (ageInMonths < 3) {
    baseWeight = 40 + ageInMonths * 25;
  } else if (ageInMonths < 6) {
    baseWeight = 115 + (ageInMonths - 3) * 20;
  } else if (ageInMonths < 12) {
    baseWeight = 175 + (ageInMonths - 6) * 15;
  } else if (ageInMonths < 24) {
    baseWeight = 265 + (ageInMonths - 12) * 12;
  } else if (ageInMonths < 36) {
    baseWeight = 409 + (ageInMonths - 24) * 8;
  } else {
    baseWeight = 505 + (ageInMonths - 36) * 2;

    baseWeight = Math.min(baseWeight, 800);
  }

  if (gender === "male") {
    baseWeight *= 1.17;
  } else if (gender === "female") {
    baseWeight *= 0.98;
  }

  if (breed) {
    const largeBreeds = ["ANGUS", "HEREFORD", "SIMENTAL", "GIROLANDO"];
    const mediumBreeds = ["NELORE", "BRAHMAN", "CANCHIM"];
    if (largeBreeds.includes(breed)) {
      baseWeight *= 1.1;
    } else if (mediumBreeds.includes(breed)) {
      baseWeight *= 1.0;
    } else {
      baseWeight *= 0.95;
    }
  }

  const variation = 1 + (Math.random() - 0.5) * 0.1;
  return Math.round(baseWeight * variation);
}

// Removed generateWeighingsForAnimal function as it's no longer used after removing mock dependencies
// Mock weighings are now generated independently
// This file can be used for test data generation without dependencies on removed mocks
export const mockWeighings: Weighing[] = [];
