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

const allAnimals = mockAnimals;

const allBreedings: Breeding[] = [];

const TODAY = new Date("2025-11-21");

function generateBreedingsForProperty(propertyId: string, startBreedingIndex: number): number {
  if (!mockBirths || !Array.isArray(mockBirths)) {
    return startBreedingIndex;
  }

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
    if (animal.status !== "active") return;

    const animalBirth = mockBirths.find((b) => b.animalId === animal.id);
    const isFemale = animalBirth?.gender === "female";
    if (!isFemale) return;

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
        const monthsAgo = Math.floor(Math.random() * 18);
        breedingDate = new Date(TODAY);
        breedingDate.setMonth(breedingDate.getMonth() - monthsAgo);
        breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30) - 15);

        if (breedingDate > TODAY) {
          breedingDate = new Date(TODAY);
          breedingDate.setDate(breedingDate.getDate() - Math.floor(Math.random() * 30));
        }
      } else {
        const previousDate = breedingDates[b - 1];
        const minMonthsBefore = 12;
        const maxMonthsBefore = 15;
        const monthsBefore =
          minMonthsBefore + Math.floor(Math.random() * (maxMonthsBefore - minMonthsBefore + 1));

        breedingDate = new Date(previousDate);
        breedingDate.setMonth(breedingDate.getMonth() - monthsBefore);
        breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30) - 15);

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

let breedingsInitialized = false;

function initializeBreedings() {
  if (breedingsInitialized) return;

  if (!mockBirths || !Array.isArray(mockBirths) || mockBirths.length === 0) {
    return;
  }

  breedingsInitialized = true;

  let breedingIndex = 0;

  breedingIndex = generateBreedingsForProperty(FAZENDA_DO_JUCA_ID, breedingIndex);

  breedingIndex = generateBreedingsForProperty(SITIO_LIMOEIRO_ID, breedingIndex);

  generateBreedingsForProperty(CHACARA_DO_JUCA_ID, breedingIndex);
}

const _breedingsProxy = new Proxy(allBreedings, {
  get(target, prop) {
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

let birthsInitialized = false;
function initializeBirthsFromBreedings() {
  if (birthsInitialized) return;
  birthsInitialized = true;

  void (async () => {
    try {
      void allBreedings.length;

      const { addBirthsFromBreedings } = await import("./births");
      if (typeof addBirthsFromBreedings === "function") {
        await addBirthsFromBreedings();
      }
    } catch {
      birthsInitialized = false;
    }
  })();
}

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
