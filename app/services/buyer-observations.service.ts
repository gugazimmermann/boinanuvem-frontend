import type { BuyerObservation, BuyerObservationFormData } from "~/types/buyer-observation";
import { mockBuyerObservations } from "~/mocks/buyer-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

/**
 * Get buyer observations by buyer ID
 */
export function getBuyerObservationsByBuyerId(buyerId: string): BuyerObservation[] {
  return findByField(mockBuyerObservations, "buyerId", buyerId);
}

/**
 * Get buyer observation by ID
 */
export function getBuyerObservationById(
  observationId: string | undefined
): BuyerObservation | undefined {
  return findById(mockBuyerObservations, observationId);
}

/**
 * Add a new buyer observation
 */
export function addBuyerObservation(data: BuyerObservationFormData): BuyerObservation {
  const newObservation: BuyerObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockBuyerObservations.push(newObservation);
  return newObservation;
}

/**
 * Delete a buyer observation
 */
export function deleteBuyerObservation(observationId: string): boolean {
  return deleteEntity(mockBuyerObservations, observationId);
}

/**
 * Update a buyer observation
 */
export function updateBuyerObservation(
  observationId: string,
  data: Partial<BuyerObservationFormData>
): boolean {
  const index = mockBuyerObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockBuyerObservations[index] = {
      ...mockBuyerObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
