import type { AnimalMovement } from "~/types";
import { mockAnimalMovements } from "~/mocks/animal-movements";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getAnimalMovementsByAnimalId(animalId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.animalIds.includes(animalId));
}

export function getAnimalMovementsByLocationId(locationId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.locationId === locationId);
}

export function getAnimalMovementsByPropertyId(propertyId: string): AnimalMovement[] {
  return findByField(mockAnimalMovements, "propertyId", propertyId);
}

export function getAnimalMovementsByCompanyId(companyId: string): AnimalMovement[] {
  return findByField(mockAnimalMovements, "companyId", companyId);
}

export function getAnimalMovementsByEmployeeId(employeeId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.employeeIds.includes(employeeId));
}

export function getAnimalMovementsByServiceProviderId(serviceProviderId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) =>
    movement.serviceProviderIds?.includes(serviceProviderId)
  );
}

export function getAnimalMovementById(movementId: string): AnimalMovement | undefined {
  return findById(mockAnimalMovements, movementId);
}

export function getAnimalsByLastMovementLocation(locationId: string): string[] {
  const movementsByAnimal = new Map<string, AnimalMovement>();

  mockAnimalMovements.forEach((movement) => {
    movement.animalIds.forEach((animalId) => {
      const existing = movementsByAnimal.get(animalId);
      if (!existing || new Date(movement.date) > new Date(existing.date)) {
        movementsByAnimal.set(animalId, movement);
      }
    });
  });

  const animalIds: string[] = [];
  movementsByAnimal.forEach((movement, animalId) => {
    if (movement.locationId === locationId) {
      animalIds.push(animalId);
    }
  });

  return animalIds;
}

export function addAnimalMovement(data: Omit<AnimalMovement, "id" | "createdAt">): AnimalMovement {
  const newMovement: AnimalMovement = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
  };
  mockAnimalMovements.push(newMovement);
  return newMovement;
}

export function deleteAnimalMovement(movementId: string): boolean {
  return deleteEntity(mockAnimalMovements, movementId);
}
