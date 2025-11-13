import type { Animal, AnimalFormData } from "~/types";

export type { Animal, AnimalFormData };

export const mockAnimals: Animal[] = [
  {
    id: "bb0e8400-e29b-41d4-a716-446655440010",
    code: "001",
    registrationNumber: "BR-2025-0001",
    acquisitionDate: "2022-06-01",
    status: "active",
    createdAt: "2025-01-08",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440011",
    code: "002",
    registrationNumber: "BR-2025-0002",
    status: "active",
    createdAt: "2025-02-12",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440012",
    code: "003",
    registrationNumber: "BR-2025-0003",
    status: "active",
    createdAt: "2025-03-18",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
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
