import type { Employee, EmployeeFormData } from "~/types";
import { createEntityService } from "./entity-service-factory";

const employeeService = createEntityService<Employee, EmployeeFormData>({
  endpoint: "/employees",
  entityName: "funcionário",
  entityNamePlural: "funcionários",
  supportsCNPJ: false,
});

/**
 * Get all employees for the current user's company via API
 */
export async function getEmployees(): Promise<Employee[]> {
  return employeeService.getAll();
}

/**
 * Get a single employee by ID via API
 */
export async function getEmployeeById(employeeId: string): Promise<Employee> {
  return employeeService.getById(employeeId);
}

/**
 * Create a new employee via API
 */
export async function addEmployee(data: EmployeeFormData): Promise<Employee> {
  return employeeService.add(data);
}

/**
 * Update an employee via API
 */
export async function updateEmployee(
  employeeId: string,
  data: Partial<EmployeeFormData>
): Promise<Employee> {
  return employeeService.update(employeeId, data);
}

/**
 * Delete an employee via API
 */
export async function deleteEmployee(employeeId: string): Promise<void> {
  return employeeService.remove(employeeId);
}
