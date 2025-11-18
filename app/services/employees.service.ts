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

export function getEmployeeById(employeeId: string | undefined): Employee | undefined {
  return findById(mockEmployees, employeeId);
}

export function getEmployeesByCompanyId(companyId: string): Employee[] {
  return findByField(mockEmployees, "companyId", companyId);
}

export function getEmployeesByPropertyId(propertyId: string): Employee[] {
  return findByFieldIncludes(mockEmployees, "propertyIds", propertyId);
}

export function addEmployee(data: EmployeeFormData): Employee {
  return createEntity(mockEmployees, data, ID_PREFIX, DEFAULT_ID);
}

export function updateEmployee(employeeId: string, data: Partial<EmployeeFormData>): boolean {
  return updateEntity(mockEmployees, employeeId, data);
}

export function deleteEmployee(employeeId: string): boolean {
  return deleteEntity(mockEmployees, employeeId);
}
