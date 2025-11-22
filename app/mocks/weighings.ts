import type { Weighing, WeighingFormData } from "~/types";
import { mockAnimals } from "./animals";
import { getBirthByAnimalId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";

export type { Weighing, WeighingFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

function generateWeighingId(index: number): string {
  const base = 446655440100 + index;
  return `ww0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

const employees = [
  "770e8400-e29b-41d4-a716-446655440010",
  "770e8400-e29b-41d4-a716-446655440011",
  "770e8400-e29b-41d4-a716-446655440012",
];

const serviceProviders = [
  "880e8400-e29b-41d4-a716-446655440010",
  "880e8400-e29b-41d4-a716-446655440011",
];

// Today is November 21, 2025
const TODAY = new Date("2025-11-21");

function calculateAgeInMonths(referenceDate: string, targetDate: Date = TODAY): number {
  const ref = new Date(referenceDate);
  const months =
    (targetDate.getFullYear() - ref.getFullYear()) * 12 + (targetDate.getMonth() - ref.getMonth());
  const days = targetDate.getDate() - ref.getDate();
  // Add partial month if more than half the month has passed
  return days > 15 ? months + 1 : months;
}

function getWeightForAge(
  ageInMonths: number,
  gender: "male" | "female" | undefined,
  breed: string | undefined
): number {
  // Base weight curves for cattle (in kg)
  // Calves: 30-40kg at birth, grow rapidly in first year
  // Yearlings: 200-350kg depending on breed and gender
  // Adults: 400-800kg depending on breed and gender

  let baseWeight: number;

  if (ageInMonths <= 0) {
    // Newborn
    baseWeight = 30 + Math.random() * 10;
  } else if (ageInMonths < 3) {
    // 0-3 months: rapid growth
    baseWeight = 40 + ageInMonths * 25;
  } else if (ageInMonths < 6) {
    // 3-6 months: continued rapid growth
    baseWeight = 115 + (ageInMonths - 3) * 20;
  } else if (ageInMonths < 12) {
    // 6-12 months: steady growth
    baseWeight = 175 + (ageInMonths - 6) * 15;
  } else if (ageInMonths < 24) {
    // 12-24 months: slower growth
    baseWeight = 265 + (ageInMonths - 12) * 12;
  } else if (ageInMonths < 36) {
    // 24-36 months: approaching adult weight
    baseWeight = 409 + (ageInMonths - 24) * 8;
  } else {
    // 36+ months: adult weight
    baseWeight = 505 + (ageInMonths - 36) * 2;
    // Cap at reasonable maximum
    baseWeight = Math.min(baseWeight, 800);
  }

  // Gender adjustment: males are typically 15-20% heavier
  if (gender === "male") {
    baseWeight *= 1.17;
  } else if (gender === "female") {
    baseWeight *= 0.98;
  }

  // Breed adjustment (some breeds are larger)
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

  // Add some natural variation (±5%)
  const variation = 1 + (Math.random() - 0.5) * 0.1;
  return Math.round(baseWeight * variation);
}

function generateWeighingsForAnimal(
  animal: (typeof mockAnimals)[0],
  animalIndex: number
): Weighing[] {
  const weighings: Weighing[] = [];

  const birth = getBirthByAnimalId(animal.id);
  const acquisition = getAcquisitionByAnimalId(animal.id);
  const acquisitionItem = acquisition?.acquisitionItems.find((item) => item.animalId === animal.id);
  const gender = birth?.gender || acquisitionItem?.gender;
  const breed = birth?.breed || acquisitionItem?.breed;
  const referenceDate =
    birth?.birthDate ||
    acquisitionItem?.birthDate ||
    acquisition?.acquisitionDate ||
    animal.createdAt;

  if (!referenceDate || typeof referenceDate !== "string") return weighings;

  const ageInMonths = calculateAgeInMonths(referenceDate);

  // Determine number of weighings based on age and animal index
  // Younger animals and more recent animals get more weighings
  let numWeighings: number;
  if (ageInMonths < 6) {
    // Very young: monthly weighings
    numWeighings = Math.min(ageInMonths + 1, 6);
  } else if (ageInMonths < 12) {
    // 6-12 months: every 2-3 months
    numWeighings = 3 + Math.floor((ageInMonths - 6) / 2);
  } else if (ageInMonths < 24) {
    // 12-24 months: every 3-4 months
    numWeighings = 6 + Math.floor((ageInMonths - 12) / 3);
  } else {
    // Adults: 4-8 weighings total, more recent animals have more
    numWeighings = 4 + Math.min(Math.floor(animalIndex % 5), 4);
  }

  // Ensure at least 2 weighings
  numWeighings = Math.max(2, Math.min(numWeighings, 12));

  // Last weighing should be recent (within last 90 days for active animals, or older for inactive)
  const lastWeighingDaysAgo =
    animal.status === "active"
      ? Math.floor(Math.random() * 90)
      : 90 + Math.floor(Math.random() * 180);
  const lastWeighingDate = new Date(TODAY);
  lastWeighingDate.setDate(lastWeighingDate.getDate() - lastWeighingDaysAgo);

  // Ensure last weighing is not before animal was born/acquired
  const minDate = new Date(referenceDate);
  if (lastWeighingDate < minDate) {
    lastWeighingDate.setTime(minDate.getTime() + 30 * 24 * 60 * 60 * 1000); // At least 30 days after birth
  }

  for (let i = 0; i < numWeighings; i++) {
    const weighingDate = new Date(lastWeighingDate);

    // Space weighings: more frequent when younger
    let daysBack: number;
    if (i === 0) {
      daysBack = 0;
    } else if (ageInMonths < 6) {
      // Monthly for young animals
      daysBack = i * 30;
    } else if (ageInMonths < 12) {
      // Every 2-3 months
      daysBack = i * (60 + Math.floor(Math.random() * 30));
    } else {
      // Every 3-4 months for older animals
      daysBack = i * (90 + Math.floor(Math.random() * 30));
    }

    weighingDate.setDate(weighingDate.getDate() - daysBack);

    // Ensure weighing date is not before animal was born/acquired
    if (weighingDate < minDate) {
      weighingDate.setTime(minDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Don't create weighings in the future
    if (weighingDate > TODAY) {
      continue;
    }

    // Calculate weight based on age at weighing time
    const ageAtWeighing = calculateAgeInMonths(referenceDate as string, weighingDate);
    const weight = getWeightForAge(ageAtWeighing, gender as "male" | "female" | undefined, breed);

    const numEmployees = (i % 2) + 1;
    const employeeIds = employees.slice(0, numEmployees);

    const hasServiceProvider = i % 3 === 0;
    const serviceProviderIds = hasServiceProvider
      ? [serviceProviders[i % serviceProviders.length]]
      : [];

    const observations = [
      "Pesagem mensal de rotina",
      "Pesagem de controle",
      "Pesagem com veterinário presente",
      "Pesagem após suplementação",
      "Pesagem de rotina",
      "Pesagem de acompanhamento",
      "Pesagem pré-venda",
      "Pesagem pós-tratamento",
    ];

    weighings.push({
      id: generateWeighingId(animalIndex * 10 + i),
      animalId: animal.id,
      employeeIds,
      serviceProviderIds,
      date: weighingDate.toISOString().split("T")[0],
      weight,
      observation: observations[i % observations.length],
      createdAt: weighingDate.toISOString().split("T")[0],
      companyId: COMPANY_ID,
    });
  }

  return weighings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const allWeighings: Weighing[] = [];
mockAnimals.forEach((animal, index) => {
  const weighings = generateWeighingsForAnimal(animal, index);
  allWeighings.push(...weighings);
});

export const mockWeighings: Weighing[] = allWeighings;
