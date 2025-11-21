import type { Death, DeathFormData } from "~/types";
import { mockDeaths } from "~/mocks/deaths";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "de0e8400-e29b-41d4-a716";
const DEFAULT_ID = "de0e8400-e29b-41d4-a716-446655440009";

export function getDeathById(deathId: string | undefined): Death | undefined {
  return findById(mockDeaths, deathId);
}

export function getDeathByAnimalId(animalId: string): Death | undefined {
  return mockDeaths.find((death) => death.animalId === animalId);
}

export function getDeathsByCompanyId(companyId: string): Death[] {
  return findByField(mockDeaths, "companyId", companyId);
}

export function addDeath(data: DeathFormData): Death {
  return createEntity(mockDeaths, data, ID_PREFIX, DEFAULT_ID);
}

export function updateDeath(deathId: string, data: Partial<DeathFormData>): boolean {
  return updateEntity(mockDeaths, deathId, data);
}

export function deleteDeath(deathId: string): boolean {
  return deleteEntity(mockDeaths, deathId);
}
