import type { BuyerObservation, BuyerObservationFormData } from "~/types/buyer-observation";
import { mockBuyerObservations } from "~/mocks/buyer-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getBuyerObservationsByBuyerId(buyerId: string): BuyerObservation[] {
  return findByField(mockBuyerObservations, "buyerId", buyerId);
}

export function getBuyerObservationById(
  observationId: string | undefined
): BuyerObservation | undefined {
  return findById(mockBuyerObservations, observationId);
}

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

export function deleteBuyerObservation(observationId: string): boolean {
  return deleteEntity(mockBuyerObservations, observationId);
}

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
