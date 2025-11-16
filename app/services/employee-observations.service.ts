import type {
  EmployeeObservation,
  EmployeeObservationFormData,
} from "~/types/employee-observation";
import { mockEmployeeObservations } from "~/mocks/employee-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

/**
 * Get employee observations by employee ID
 */
export function getEmployeeObservationsByEmployeeId(employeeId: string): EmployeeObservation[] {
  return findByField(mockEmployeeObservations, "employeeId", employeeId);
}

/**
 * Get employee observation by ID
 */
export function getEmployeeObservationById(
  observationId: string | undefined
): EmployeeObservation | undefined {
  return findById(mockEmployeeObservations, observationId);
}

/**
 * Add a new employee observation
 */
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

/**
 * Delete an employee observation
 */
export function deleteEmployeeObservation(observationId: string): boolean {
  return deleteEntity(mockEmployeeObservations, observationId);
}

/**
 * Update an employee observation
 */
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
