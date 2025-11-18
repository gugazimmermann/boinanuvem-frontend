import type { Animal, AnimalFormData } from "~/types";
import { mockAnimals } from "~/mocks/animals";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "bb0e8400-e29b-41d4-a716";
const DEFAULT_ID = "bb0e8400-e29b-41d4-a716-446655440009";

export function getAnimalById(animalId: string | undefined): Animal | undefined {
  return findById(mockAnimals, animalId);
}

export function getAnimalsByCompanyId(companyId: string): Animal[] {
  return findByField(mockAnimals, "companyId", companyId);
}

export function getAnimalsByPropertyId(propertyId: string): Animal[] {
  return findByField(mockAnimals, "propertyId", propertyId);
}

export function addAnimal(data: AnimalFormData): Animal {
  return createEntity(mockAnimals, data, ID_PREFIX, DEFAULT_ID);
}

export function updateAnimal(animalId: string, data: Partial<AnimalFormData>): boolean {
  return updateEntity(mockAnimals, animalId, data);
}

export function deleteAnimal(animalId: string): boolean {
  return deleteEntity(mockAnimals, animalId);
}
