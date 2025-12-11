import type { Breeding, BreedingFormData } from "~/types";

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

const allBreedings: Breeding[] = [];

const TODAY = new Date("2025-11-21");

function generateBreedingsForProperty(propertyId: string, startBreedingIndex: number): number {
  // Simplified mock breedings generation without dependencies on removed mocks
  // Generate minimal mock data for testing
  const mockFemaleAnimalIds: string[] = [];
  const mockMaleAnimalIds: string[] = [];

  // Generate some mock animal IDs
  for (let i = 0; i < 10; i++) {
    mockFemaleAnimalIds.push(
      `bb0e8400-e29b-41d4-a716-${(446655440100 + i).toString().padStart(12, "0")}`
    );
    mockMaleAnimalIds.push(
      `bb0e8400-e29b-41d4-a716-${(446655440200 + i).toString().padStart(12, "0")}`
    );
  }

  const femaleAnimals = mockFemaleAnimalIds.map((id) => ({ id, propertyId, status: "active" }));
  const maleAnimals = mockMaleAnimalIds.map((id) => ({ id, propertyId, status: "active" }));
  let breedingIndex = startBreedingIndex;
  const actualToday = new Date();
  const actualTwoYearsAgo = new Date(actualToday);
  actualTwoYearsAgo.setFullYear(actualTwoYearsAgo.getFullYear() - 2);
  const twoYearsAgo = new Date(TODAY);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  femaleAnimals.forEach((animal, cowIndex) => {
    if (animal.status !== "active") return;

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
        // First breeding: generate within last 18 months from actual today
        const monthsAgo = Math.floor(Math.random() * 18);
        breedingDate = new Date(actualToday);
        breedingDate.setMonth(breedingDate.getMonth() - monthsAgo);
        breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30) - 15);

        // Ensure not in future (date-only comparison)
        const breedingDateOnlyCheck = new Date(
          breedingDate.getFullYear(),
          breedingDate.getMonth(),
          breedingDate.getDate()
        );
        const actualTodayOnlyCheck = new Date(
          actualToday.getFullYear(),
          actualToday.getMonth(),
          actualToday.getDate()
        );
        if (breedingDateOnlyCheck.getTime() > actualTodayOnlyCheck.getTime()) {
          breedingDate = new Date(actualTodayOnlyCheck);
          breedingDate.setDate(breedingDate.getDate() - Math.floor(Math.random() * 30));
          breedingDate.setHours(0, 0, 0, 0);
        }

        // Ensure not before two years ago (date-only comparison)
        const actualTwoYearsAgoOnlyCheck = new Date(
          actualTwoYearsAgo.getFullYear(),
          actualTwoYearsAgo.getMonth(),
          actualTwoYearsAgo.getDate()
        );
        if (breedingDateOnlyCheck.getTime() < actualTwoYearsAgoOnlyCheck.getTime()) {
          breedingDate = new Date(actualTwoYearsAgoOnlyCheck);
          breedingDate.setDate(breedingDate.getDate() + Math.floor(Math.random() * 30));
          breedingDate.setHours(0, 0, 0, 0);
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

        // Ensure at least 12 months before previous date (date-only comparison)
        const previousDateOnly = new Date(
          previousDate.getFullYear(),
          previousDate.getMonth(),
          previousDate.getDate()
        );
        const minAllowedDate = new Date(previousDateOnly);
        minAllowedDate.setMonth(minAllowedDate.getMonth() - 12);
        const breedingDateOnlyCheck2 = new Date(
          breedingDate.getFullYear(),
          breedingDate.getMonth(),
          breedingDate.getDate()
        );
        if (breedingDateOnlyCheck2.getTime() > minAllowedDate.getTime()) {
          breedingDate = new Date(minAllowedDate);
          breedingDate.setHours(0, 0, 0, 0);
        }

        // Ensure not before two years ago (date-only comparison)
        const actualTwoYearsAgoOnlyCheck2 = new Date(
          actualTwoYearsAgo.getFullYear(),
          actualTwoYearsAgo.getMonth(),
          actualTwoYearsAgo.getDate()
        );
        if (breedingDateOnlyCheck2.getTime() < actualTwoYearsAgoOnlyCheck2.getTime()) {
          // Check if we can fit this breeding while maintaining 12 months gap
          const maxPossibleDate = new Date(previousDateOnly);
          maxPossibleDate.setMonth(maxPossibleDate.getMonth() - 12);
          maxPossibleDate.setHours(0, 0, 0, 0);

          if (maxPossibleDate.getTime() < actualTwoYearsAgoOnlyCheck2.getTime()) {
            // Cannot fit another breeding with 12 month gap, stop here
            numBreedings = b;
            break;
          } else {
            // Use the latest possible date that's still 12 months before previous
            breedingDate = new Date(maxPossibleDate);
            // Add some variation but keep it before previous date by at least 12 months
            const dayOffset = Math.floor(Math.random() * 16) - 15; // Range: -15 to 0
            breedingDate.setDate(breedingDate.getDate() + dayOffset);
            breedingDate.setHours(0, 0, 0, 0);

            // Re-verify 12 month gap (date-only)
            const recheckMinDate = new Date(previousDateOnly);
            recheckMinDate.setMonth(recheckMinDate.getMonth() - 12);
            recheckMinDate.setHours(0, 0, 0, 0);
            const breedingDateOnlyRecheck = new Date(
              breedingDate.getFullYear(),
              breedingDate.getMonth(),
              breedingDate.getDate()
            );
            if (breedingDateOnlyRecheck.getTime() > recheckMinDate.getTime()) {
              breedingDate = new Date(recheckMinDate);
              breedingDate.setHours(0, 0, 0, 0);
            }

            // Re-verify two years ago limit (date-only)
            const breedingDateOnlyFinal = new Date(
              breedingDate.getFullYear(),
              breedingDate.getMonth(),
              breedingDate.getDate()
            );
            if (breedingDateOnlyFinal.getTime() < actualTwoYearsAgoOnlyCheck2.getTime()) {
              breedingDate = new Date(actualTwoYearsAgoOnlyCheck2);
              breedingDate.setHours(0, 0, 0, 0);
            }
          }
        }
      }

      // Final validation: Ensure the date is within the last two years from the actual current date
      // Use date-only comparison to avoid time component issues
      const breedingDateOnly = new Date(
        breedingDate.getFullYear(),
        breedingDate.getMonth(),
        breedingDate.getDate()
      );
      const actualTwoYearsAgoOnly = new Date(
        actualTwoYearsAgo.getFullYear(),
        actualTwoYearsAgo.getMonth(),
        actualTwoYearsAgo.getDate()
      );
      const actualTodayOnly = new Date(
        actualToday.getFullYear(),
        actualToday.getMonth(),
        actualToday.getDate()
      );

      // Ensure the date is not before two years ago (using date-only comparison)
      if (breedingDateOnly.getTime() < actualTwoYearsAgoOnly.getTime()) {
        breedingDate = new Date(actualTwoYearsAgoOnly);
        breedingDate.setHours(0, 0, 0, 0);
      }
      // Ensure the date is not in the future (using date-only comparison)
      if (breedingDateOnly.getTime() > actualTodayOnly.getTime()) {
        breedingDate = new Date(actualTodayOnly);
        breedingDate.setHours(0, 0, 0, 0);
      }

      // Final double-check: ensure date-only is within bounds
      const finalDateOnly = new Date(
        breedingDate.getFullYear(),
        breedingDate.getMonth(),
        breedingDate.getDate()
      );
      if (finalDateOnly.getTime() < actualTwoYearsAgoOnly.getTime()) {
        breedingDate = new Date(actualTwoYearsAgoOnly);
        breedingDate.setHours(0, 0, 0, 0);
      }
      if (finalDateOnly.getTime() > actualTodayOnly.getTime()) {
        breedingDate = new Date(actualTodayOnly);
        breedingDate.setHours(0, 0, 0, 0);
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

export const mockBreedings: Breeding[] = _breedingsProxy as Breeding[];
