import type { Breeding, BreedingFormData } from "~/types";
import { mockAnimals } from "./animals";

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

const femaleAnimals = mockAnimals.filter((animal, index) => {
  return index % 2 !== 0;
});

const maleAnimals = mockAnimals.filter((animal, index) => {
  return index % 2 === 0;
});

const allBreedings: Breeding[] = [];

function generateBreedingsForProperty(
  propertyId: string,
  propertyFemaleAnimals: typeof femaleAnimals,
  propertyMaleAnimals: typeof maleAnimals,
  startBreedingIndex: number
): number {
  let breedingIndex = startBreedingIndex;
  const today = new Date();
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  propertyFemaleAnimals.forEach((animal, cowIndex) => {
    let numBreedings = 1;
    const rand = cowIndex % 10;
    if (rand >= 7 && rand < 9) {
      numBreedings = 2;
    } else if (rand === 9) {
      numBreedings = 3;
    }

    const breedingDates: Date[] = [];

    for (let b = 0; b < numBreedings; b++) {
      let breedingDate: Date;

      if (b === 0) {
        const monthsAgo = Math.floor(Math.random() * 18);
        breedingDate = new Date(today);
        breedingDate.setMonth(breedingDate.getMonth() - monthsAgo);
        breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30) - 15);
      } else {
        const previousDate = breedingDates[b - 1];
        const minMonthsBefore = 12;
        const maxMonthsBefore = 18;
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

      if (method === "natural" && propertyMaleAnimals.length > 0) {
        breeding.bullId = propertyMaleAnimals[(cowIndex + b) % propertyMaleAnimals.length].id;
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

const fazendaFemaleAnimals = femaleAnimals.filter(
  (animal) => animal.propertyId === FAZENDA_DO_JUCA_ID
);
const fazendaMaleAnimals = maleAnimals.filter((animal) => animal.propertyId === FAZENDA_DO_JUCA_ID);
const sitioFemaleAnimals = femaleAnimals.filter(
  (animal) => animal.propertyId === SITIO_LIMOEIRO_ID
);
const sitioMaleAnimals = maleAnimals.filter((animal) => animal.propertyId === SITIO_LIMOEIRO_ID);
const chacaraFemaleAnimals = femaleAnimals.filter(
  (animal) => animal.propertyId === CHACARA_DO_JUCA_ID
);
const chacaraMaleAnimals = maleAnimals.filter((animal) => animal.propertyId === CHACARA_DO_JUCA_ID);

let breedingIndex = 0;

breedingIndex = generateBreedingsForProperty(
  FAZENDA_DO_JUCA_ID,
  fazendaFemaleAnimals,
  fazendaMaleAnimals,
  breedingIndex
);

breedingIndex = generateBreedingsForProperty(
  SITIO_LIMOEIRO_ID,
  sitioFemaleAnimals,
  sitioMaleAnimals,
  breedingIndex
);

generateBreedingsForProperty(
  CHACARA_DO_JUCA_ID,
  chacaraFemaleAnimals,
  chacaraMaleAnimals,
  breedingIndex
);

export const mockBreedings: Breeding[] = allBreedings;
