import type { Breeding, BreedingFormData } from "~/types";
import { mockAnimals } from "./animals";
import { mockBirths } from "./births";

export type { Breeding, BreedingFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

function generateBreedingId(index: number): string {
  const base = 446655440200 + index;
  return `pp0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
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

const FAZENDA_DO_JUCA_ID = "550e8400-e29b-41d4-a716-446655440010";
const SITIO_LIMOEIRO_ID = "550e8400-e29b-41d4-a716-446655440011";
const CHACARA_DO_JUCA_ID = "550e8400-e29b-41d4-a716-446655440012";

// We'll filter animals by gender inside the function using lazy require
// to avoid circular dependency with births.ts
const allAnimals = mockAnimals;

const allBreedings: Breeding[] = [];

// Today is November 21, 2025
const TODAY = new Date("2025-11-21");

function generateBreedingsForProperty(propertyId: string, startBreedingIndex: number): number {
  // Safety check: if mockBirths is not available yet, return early
  if (!mockBirths || !Array.isArray(mockBirths)) {
    return startBreedingIndex;
  }

  // Filter animals by property and gender
  const propertyAnimals = allAnimals.filter((animal) => animal.propertyId === propertyId);
  const femaleAnimals = propertyAnimals.filter((animal) => {
    const birth = mockBirths.find((b) => b.animalId === animal.id);
    return birth?.gender === "female";
  });
  const maleAnimals = propertyAnimals.filter((animal) => {
    const birth = mockBirths.find((b) => b.animalId === animal.id);
    return birth?.gender === "male";
  });
  let breedingIndex = startBreedingIndex;
  const twoYearsAgo = new Date(TODAY);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  femaleAnimals.forEach((animal, cowIndex) => {
    // Only create breedings for active female animals
    if (animal.status !== "active") return;

    // Double-check it's a female (should already be filtered, but be safe)
    const animalBirth = mockBirths.find((b) => b.animalId === animal.id);
    const isFemale = animalBirth?.gender === "female";
    if (!isFemale) return;

    // Determine number of breedings: most cows have 1-2 breedings in last 2 years
    // Some active breeding cows have 3
    let numBreedings = 1;
    const rand = cowIndex % 10;
    if (rand >= 6 && rand < 9) {
      numBreedings = 2;
    } else if (rand === 9) {
      numBreedings = 3;
    }

    const breedingDates: Date[] = [];

    for (let b = 0; b < numBreedings; b++) {
      let breedingDate: Date;

      if (b === 0) {
        // Most recent breeding: within last 18 months
        const monthsAgo = Math.floor(Math.random() * 18);
        breedingDate = new Date(TODAY);
        breedingDate.setMonth(breedingDate.getMonth() - monthsAgo);
        breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30) - 15);

        // Don't create breedings in the future
        if (breedingDate > TODAY) {
          breedingDate = new Date(TODAY);
          breedingDate.setDate(breedingDate.getDate() - Math.floor(Math.random() * 30));
        }
      } else {
        // Previous breedings: 12-15 months apart (realistic calving interval)
        const previousDate = breedingDates[b - 1];
        const minMonthsBefore = 12;
        const maxMonthsBefore = 15; // More realistic interval
        const monthsBefore =
          minMonthsBefore + Math.floor(Math.random() * (maxMonthsBefore - minMonthsBefore + 1));

        breedingDate = new Date(previousDate);
        breedingDate.setMonth(breedingDate.getMonth() - monthsBefore);
        breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30) - 15);

        // Don't go too far back
        if (breedingDate < twoYearsAgo) {
          const maxDate = new Date(previousDate);
          maxDate.setMonth(maxDate.getMonth() - 12);
          if (maxDate > twoYearsAgo) {
            breedingDate = new Date(maxDate);
            breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30) - 15);
          } else {
            numBreedings = b;
            break;
          }
        }
      }

      breedingDates.push(breedingDate);
    }

    for (let b = 0; b < numBreedings; b++) {
      const breedingDate = breedingDates[b];
      if (!breedingDate) continue;

      const method: "natural" | "artificial_insemination" =
        (cowIndex + b) % 5 < 3 ? "natural" : "artificial_insemination";

      const numEmployees = ((cowIndex + b) % 2) + 1;
      const employeeIds = employees.slice(0, numEmployees);

      const hasServiceProvider = (cowIndex + b) % 3 === 0;
      const serviceProviderIds = hasServiceProvider
        ? [serviceProviders[(cowIndex + b) % serviceProviders.length]]
        : [];

      const observations = [
        "Cobertura confirmada por ultrassom",
        "Cobertura registrada",
        "Cobertura confirmada",
        "Registro de cobertura",
        "Cobertura confirmada por veterinário",
        "Cobertura realizada na estação de monta",
        "Cobertura com touro de alta qualidade genética",
        "Cobertura com acompanhamento reprodutivo",
        "Cobertura registrada no sistema",
      ];

      const confirmed = (cowIndex * 10 + b) % 20 < 17;

      const breeding: Breeding = {
        id: generateBreedingId(breedingIndex),
        animalId: animal.id,
        date: breedingDate.toISOString().split("T")[0],
        method,
        employeeIds,
        serviceProviderIds,
        observation: observations[(cowIndex + b) % observations.length],
        confirmed,
        createdAt: breedingDate.toISOString().split("T")[0],
        companyId: COMPANY_ID,
      };

      if (method === "natural" && maleAnimals.length > 0) {
        breeding.bullId = maleAnimals[(cowIndex + b) % maleAnimals.length].id;
      } else if (method === "artificial_insemination") {
        breeding.attemptNumber = b + 1;
        breeding.semenCode = `SEM-${String(cowIndex * 10 + b + 1).padStart(4, "0")}`;
      }

      allBreedings.push(breeding);
      breedingIndex++;
    }
  });

  return breedingIndex;
}

// Lazy initialization function
let breedingsInitialized = false;

function initializeBreedings() {
  // Check if already initialized
  if (breedingsInitialized) return;

  // Safety check: ensure mockBirths is available and has data
  // During circular dependency resolution, mockBirths might be undefined
  if (!mockBirths || !Array.isArray(mockBirths) || mockBirths.length === 0) {
    // Try again later - this will be called when mockBirths is populated
    return;
  }

  breedingsInitialized = true;

  let breedingIndex = 0;

  breedingIndex = generateBreedingsForProperty(FAZENDA_DO_JUCA_ID, breedingIndex);

  breedingIndex = generateBreedingsForProperty(SITIO_LIMOEIRO_ID, breedingIndex);

  generateBreedingsForProperty(CHACARA_DO_JUCA_ID, breedingIndex);
}

// Create a proxy that initializes breedings on first access
const _breedingsProxy = new Proxy(allBreedings, {
  get(target, prop) {
    // Initialize on any meaningful access
    initializeBreedings();
    return Reflect.get(target, prop);
  },
  has(target, prop) {
    initializeBreedings();
    return Reflect.has(target, prop);
  },
  ownKeys(target) {
    initializeBreedings();
    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, prop) {
    initializeBreedings();
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },
});

// Call addBirthsFromBreedings after breedings are initialized
// This ensures mockBreedings is available when births.ts tries to use it
let birthsInitialized = false;
function initializeBirthsFromBreedings() {
  if (birthsInitialized) return;
  birthsInitialized = true;

  try {
    // Force initialization of breedings by accessing length
    void allBreedings.length;

    // Now safely call addBirthsFromBreedings
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { addBirthsFromBreedings } = require("./births");
    if (typeof addBirthsFromBreedings === "function") {
      addBirthsFromBreedings();
    }
  } catch {
    // Ignore errors during initialization - will retry on next access
    birthsInitialized = false;
  }
}

// Enhanced proxy that also initializes births when breedings are accessed
const enhancedProxy = new Proxy(allBreedings, {
  get(target, prop) {
    initializeBreedings();
    if (prop === "length" || typeof prop === "number") {
      initializeBirthsFromBreedings();
    }
    return Reflect.get(target, prop);
  },
  has(target, prop) {
    initializeBreedings();
    return Reflect.has(target, prop);
  },
  ownKeys(target) {
    initializeBreedings();
    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, prop) {
    initializeBreedings();
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },
});

export const mockBreedings: Breeding[] = enhancedProxy as Breeding[];
