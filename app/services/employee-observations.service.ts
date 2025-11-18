import type {
  EmployeeObservation,
  EmployeeObservationFormData,
} from "~/types/employee-observation";
import { mockEmployeeObservations } from "~/mocks/employee-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getEmployeeObservationsByEmployeeId(employeeId: string): EmployeeObservation[] {
  return findByField(mockEmployeeObservations, "employeeId", employeeId);
}

export function getEmployeeObservationById(
  observationId: string | undefined
): EmployeeObservation | undefined {
  return findById(mockEmployeeObservations, observationId);
}

export function addEmployeeObservation(data: EmployeeObservationFormData): EmployeeObservation {
  const newObservation: EmployeeObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockEmployeeObservations.push(newObservation);
  return newObservation;
}

export function deleteEmployeeObservation(observationId: string): boolean {
  return deleteEntity(mockEmployeeObservations, observationId);
}

export function updateEmployeeObservation(
  observationId: string,
  data: Partial<EmployeeObservationFormData>
): boolean {
  const index = mockEmployeeObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockEmployeeObservations[index] = {
      ...mockEmployeeObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
