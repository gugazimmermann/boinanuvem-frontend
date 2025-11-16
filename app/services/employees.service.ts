import type { Employee, EmployeeFormData } from "~/types";
import { mockEmployees } from "~/mocks/employees";
import {
  findById,
  findByField,
  findByFieldIncludes,
  createEntity,
  updateEntity,
  deleteEntity,
} from "./base-service";

const ID_PREFIX = "770e8400-e29b-41d4-a716";
const DEFAULT_ID = "770e8400-e29b-41d4-a716-446655440009";

/**
 * Get employee by ID
 */
export function getEmployeeById(employeeId: string | undefined): Employee | undefined {
  return findById(mockEmployees, employeeId);
}

/**
 * Get employees by company ID
 */
export function getEmployeesByCompanyId(companyId: string): Employee[] {
  return findByField(mockEmployees, "companyId", companyId);
}

/**
 * Get employees by property ID
 */
export function getEmployeesByPropertyId(propertyId: string): Employee[] {
  return findByFieldIncludes(mockEmployees, "propertyIds", propertyId);
}

/**
 * Add a new employee
 */
export function addEmployee(data: EmployeeFormData): Employee {
  return createEntity(mockEmployees, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update an employee
 */
export function updateEmployee(employeeId: string, data: Partial<EmployeeFormData>): boolean {
  return updateEntity(mockEmployees, employeeId, data);
}

/**
 * Delete an employee
 */
export function deleteEmployee(employeeId: string): boolean {
  return deleteEntity(mockEmployees, employeeId);
}
