import type {
  InventoryObservation,
  InventoryObservationFormData,
} from "~/types/inventory-observation";
import { mockInventoryObservations } from "~/mocks/inventory-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getInventoryObservationsByItemId(itemId: string): InventoryObservation[] {
  return findByField(mockInventoryObservations, "itemId", itemId);
}

export function getInventoryObservationById(
  observationId: string | undefined
): InventoryObservation | undefined {
  return findById(mockInventoryObservations, observationId);
}

export function addInventoryObservation(data: InventoryObservationFormData): InventoryObservation {
  const newObservation: InventoryObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockInventoryObservations.push(newObservation);
  return newObservation;
}

export function deleteInventoryObservation(observationId: string): boolean {
  return deleteEntity(mockInventoryObservations, observationId);
}

export function updateInventoryObservation(
  observationId: string,
  data: Partial<InventoryObservationFormData>
): boolean {
  const index = mockInventoryObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockInventoryObservations[index] = {
      ...mockInventoryObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
