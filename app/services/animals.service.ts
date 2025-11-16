import type { Animal, AnimalFormData } from "~/types";
import { mockAnimals } from "~/mocks/animals";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "bb0e8400-e29b-41d4-a716";
const DEFAULT_ID = "bb0e8400-e29b-41d4-a716-446655440009";

/**
 * Get animal by ID
 */
export function getAnimalById(animalId: string | undefined): Animal | undefined {
  return findById(mockAnimals, animalId);
}

/**
 * Get animals by company ID
 */
export function getAnimalsByCompanyId(companyId: string): Animal[] {
  return findByField(mockAnimals, "companyId", companyId);
}

/**
 * Get animals by property ID
 */
export function getAnimalsByPropertyId(propertyId: string): Animal[] {
  return findByField(mockAnimals, "propertyId", propertyId);
}

/**
 * Add a new animal
 */
export function addAnimal(data: AnimalFormData): Animal {
  return createEntity(mockAnimals, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update an animal
 */
export function updateAnimal(animalId: string, data: Partial<AnimalFormData>): boolean {
  return updateEntity(mockAnimals, animalId, data);
}

/**
 * Delete an animal
 */
export function deleteAnimal(animalId: string): boolean {
  return deleteEntity(mockAnimals, animalId);
}

