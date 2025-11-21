import type { Animal, AnimalFormData } from "~/types";

export type { Animal, AnimalFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
const FAZENDA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440010";
const SITIO_LIMOEIRO = "550e8400-e29b-41d4-a716-446655440011";
const CHACARA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440012";

// Today is November 21, 2025
const _TODAY = new Date("2025-11-21");

function generateAnimalId(index: number): string {
  const base = 446655440100 + index;
  return `bb0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

function generateRegistrationNumber(propertyCode: string, index: number, year: number): string {
  const num = (index % 1000) + 1;
  return `BR-${year}-${propertyCode}${num.toString().padStart(4, "0")}`;
}

function _getRandomDateBetween(startDate: Date, endDate: Date): string {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  const date = new Date(randomTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateForAnimalIndex(index: number, total: number, _startYear: number = 2020): string {
  // Distribute animals across years 2020-2025
  // More recent animals (higher index) are more likely to be in recent years
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const progress = index / total; // 0 to 1

  // Weight towards recent years for higher indices
  let yearIndex: number;
  if (progress < 0.1) {
    // First 10%: mostly 2020-2021
    yearIndex = Math.floor(Math.random() * 2);
  } else if (progress < 0.3) {
    // Next 20%: mostly 2021-2022
    yearIndex = 1 + Math.floor(Math.random() * 2);
  } else if (progress < 0.5) {
    // Next 20%: mostly 2022-2023
    yearIndex = 2 + Math.floor(Math.random() * 2);
  } else if (progress < 0.7) {
    // Next 20%: mostly 2023-2024
    yearIndex = 3 + Math.floor(Math.random() * 2);
  } else if (progress < 0.9) {
    // Next 20%: mostly 2024-2025
    yearIndex = 4 + Math.floor(Math.random() * 2);
  } else {
    // Last 10%: mostly 2025
    yearIndex = 4 + Math.floor(Math.random() * 2);
  }

  // Ensure yearIndex is within bounds
  yearIndex = Math.max(0, Math.min(yearIndex, years.length - 1));
  const year = years[yearIndex];
  const month = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Increase to ~300 animals total
// Fazenda: 180, Chácara: 60, Sítio: 60
const fazendaAnimals: Animal[] = [];
for (let i = 0; i < 180; i++) {
  const createdAt = getDateForAnimalIndex(i, 180);
  const year = parseInt(createdAt.split("-")[0]);
  fazendaAnimals.push({
    id: generateAnimalId(i),
    code: `FJ${(i + 1).toString().padStart(3, "0")}`,
    registrationNumber: generateRegistrationNumber("FJ", i, year),
    status: i < 170 ? "active" : "inactive",
    createdAt,
    companyId: COMPANY_ID,
    propertyId: FAZENDA_DO_JUCA,
  });
}

const chacaraAnimals: Animal[] = [];
for (let i = 0; i < 60; i++) {
  const createdAt = getDateForAnimalIndex(i, 60);
  const year = parseInt(createdAt.split("-")[0]);
  chacaraAnimals.push({
    id: generateAnimalId(180 + i),
    code: `CJ${(i + 1).toString().padStart(3, "0")}`,
    registrationNumber: generateRegistrationNumber("CJ", i, year),
    status: i < 57 ? "active" : "inactive",
    createdAt,
    companyId: COMPANY_ID,
    propertyId: CHACARA_DO_JUCA,
  });
}

const sitioAnimals: Animal[] = [];
for (let i = 0; i < 60; i++) {
  const createdAt = getDateForAnimalIndex(i, 60);
  const year = parseInt(createdAt.split("-")[0]);
  sitioAnimals.push({
    id: generateAnimalId(240 + i),
    code: `SL${(i + 1).toString().padStart(3, "0")}`,
    registrationNumber: generateRegistrationNumber("SL", i, year),
    status: i < 57 ? "active" : "inactive",
    createdAt,
    companyId: COMPANY_ID,
    propertyId: SITIO_LIMOEIRO,
  });
}

// Special animal with observations (keep existing one but update date)
const animalWithObservations: Animal = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  code: "FJ001",
  registrationNumber: "BR-2020-FJ0001",
  status: "active",
  createdAt: "2020-01-15",
  companyId: COMPANY_ID,
  propertyId: FAZENDA_DO_JUCA,
};

export const mockAnimals: Animal[] = [
  animalWithObservations,
  ...fazendaAnimals,
  ...chacaraAnimals,
  ...sitioAnimals,
];
