import type {
  CashFlowObservation,
  CashFlowObservationFormData,
} from "~/types/cash-flow-observation";
import { mockCashFlowObservations } from "~/mocks/cash-flow-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getCashFlowObservationsByCashFlowId(cashFlowId: string): CashFlowObservation[] {
  return findByField(mockCashFlowObservations, "cashFlowId", cashFlowId);
}

export function getCashFlowObservationById(
  observationId: string | undefined
): CashFlowObservation | undefined {
  return findById(mockCashFlowObservations, observationId);
}

export function addCashFlowObservation(data: CashFlowObservationFormData): CashFlowObservation {
  const newObservation: CashFlowObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockCashFlowObservations.push(newObservation);
  return newObservation;
}

export function deleteCashFlowObservation(observationId: string): boolean {
  return deleteEntity(mockCashFlowObservations, observationId);
}

export function updateCashFlowObservation(
  observationId: string,
  data: Partial<CashFlowObservationFormData>
): boolean {
  const index = mockCashFlowObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockCashFlowObservations[index] = {
      ...mockCashFlowObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
