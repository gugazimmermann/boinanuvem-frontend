import type {
  SupplierObservation,
  SupplierObservationFormData,
} from "~/types/supplier-observation";
import { mockSupplierObservations } from "~/mocks/supplier-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getSupplierObservationsBySupplierId(supplierId: string): SupplierObservation[] {
  return findByField(mockSupplierObservations, "supplierId", supplierId);
}

export function getSupplierObservationById(
  observationId: string | undefined
): SupplierObservation | undefined {
  return findById(mockSupplierObservations, observationId);
}

export function addSupplierObservation(data: SupplierObservationFormData): SupplierObservation {
  const newObservation: SupplierObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockSupplierObservations.push(newObservation);
  return newObservation;
}

export function deleteSupplierObservation(observationId: string): boolean {
  return deleteEntity(mockSupplierObservations, observationId);
}

export function updateSupplierObservation(
  observationId: string,
  data: Partial<SupplierObservationFormData>
): boolean {
  const index = mockSupplierObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockSupplierObservations[index] = {
      ...mockSupplierObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
