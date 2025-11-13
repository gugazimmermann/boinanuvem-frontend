import type { Animal, AnimalFormData } from "~/types";

export type { Animal, AnimalFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
const FAZENDA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440010";
const SITIO_LIMOEIRO = "550e8400-e29b-41d4-a716-446655440011";
const CHACARA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440012";

function generateAnimalId(index: number): string {
  const base = 446655440100 + index;
  return `bb0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

function generateRegistrationNumber(propertyCode: string, index: number): string {
  const year = 2020 + (index % 5);
  const num = (index % 1000) + 1;
  return `BR-${year}-${propertyCode}${num.toString().padStart(4, "0")}`;
}

const fazendaAnimals: Animal[] = [];
for (let i = 0; i < 150; i++) {
  fazendaAnimals.push({
    id: generateAnimalId(i),
    code: `FJ${(i + 1).toString().padStart(3, "0")}`,
    registrationNumber: generateRegistrationNumber("FJ", i),
    status: i < 140 ? "active" : "inactive",
    createdAt: `202${Math.floor(i / 50)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    companyId: COMPANY_ID,
    propertyId: FAZENDA_DO_JUCA,
    ...(i % 4 === 0 && {
      acquisitionDate: `202${Math.floor(i / 50)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    }),
  });
}

const chacaraAnimals: Animal[] = [];
for (let i = 0; i < 40; i++) {
  chacaraAnimals.push({
    id: generateAnimalId(150 + i),
    code: `CJ${(i + 1).toString().padStart(3, "0")}`,
    registrationNumber: generateRegistrationNumber("CJ", i),
    status: i < 38 ? "active" : "inactive",
    createdAt: `202${Math.floor(i / 15)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    companyId: COMPANY_ID,
    propertyId: CHACARA_DO_JUCA,
    ...(i % 3 === 0 && {
      acquisitionDate: `202${Math.floor(i / 15)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    }),
  });
}

const sitioAnimals: Animal[] = [];
for (let i = 0; i < 20; i++) {
  sitioAnimals.push({
    id: generateAnimalId(190 + i),
    code: `SL${(i + 1).toString().padStart(3, "0")}`,
    registrationNumber: generateRegistrationNumber("SL", i),
    status: i < 18 ? "active" : "inactive",
    createdAt: `202${Math.floor(i / 8)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    companyId: COMPANY_ID,
    propertyId: SITIO_LIMOEIRO,
    ...(i % 5 === 0 && {
      acquisitionDate: `202${Math.floor(i / 8)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    }),
  });
}

export const mockAnimals: Animal[] = [
  ...fazendaAnimals,
  ...chacaraAnimals,
  ...sitioAnimals,
];

export function getAnimalById(animalId: string | undefined): Animal | undefined {
  if (!animalId) return undefined;
  return mockAnimals.find((animal) => animal.id === animalId);
}

export function getAnimalsByCompanyId(companyId: string): Animal[] {
  return mockAnimals.filter((animal) => animal.companyId === companyId);
}

export function getAnimalsByPropertyId(propertyId: string): Animal[] {
  return mockAnimals.filter((animal) => animal.propertyId === propertyId);
}

export function addAnimal(data: AnimalFormData): Animal {
  const lastId =
    mockAnimals.length > 0
      ? mockAnimals[mockAnimals.length - 1].id
      : "bb0e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newAnimal: Animal = {
    ...data,
    id: `bb0e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockAnimals.push(newAnimal);
  return newAnimal;
}

export function deleteAnimal(animalId: string): boolean {
  const index = mockAnimals.findIndex((animal) => animal.id === animalId);
  if (index !== -1) {
    mockAnimals.splice(index, 1);
    return true;
  }
  return false;
}

export function updateAnimal(animalId: string, data: Partial<AnimalFormData>): boolean {
  const index = mockAnimals.findIndex((animal) => animal.id === animalId);
  if (index !== -1) {
    mockAnimals[index] = {
      ...mockAnimals[index],
      ...data,
    };
    return true;
  }
  return false;
}
