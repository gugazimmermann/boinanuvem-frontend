import { describe, it, expect } from "vitest";
import {
  mockEmployees,
  getEmployeeById,
  getEmployeesByCompanyId,
  getEmployeesByPropertyId,
  addEmployee,
  deleteEmployee,
  updateEmployee,
} from "../employees";
import type { EmployeeFormData } from "~/types";

describe("Employees Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const PROPERTY_ID = "550e8400-e29b-41d4-a716-446655440010";

  describe("getEmployeeById", () => {
    it("should return employee by id", () => {
      if (mockEmployees.length > 0) {
        const employee = getEmployeeById(mockEmployees[0].id);
        expect(employee).toBeDefined();
        expect(employee?.id).toBe(mockEmployees[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const employee = getEmployeeById("non-existent-id");
      expect(employee).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const employee = getEmployeeById(undefined);
      expect(employee).toBeUndefined();
    });
  });

  describe("getEmployeesByCompanyId", () => {
    it("should return employees for a company", () => {
      const employees = getEmployeesByCompanyId(COMPANY_ID);
      expect(Array.isArray(employees)).toBe(true);
      employees.forEach((employee) => {
        expect(employee.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const employees = getEmployeesByCompanyId("non-existent-company");
      expect(employees).toEqual([]);
    });
  });

  describe("getEmployeesByPropertyId", () => {
    it("should return employees for a property", () => {
      const employees = getEmployeesByPropertyId(PROPERTY_ID);
      expect(Array.isArray(employees)).toBe(true);
      employees.forEach((employee) => {
        expect(employee.propertyIds).toContain(PROPERTY_ID);
      });
    });

    it("should return empty array for non-existent property", () => {
      const employees = getEmployeesByPropertyId("non-existent-property");
      expect(employees).toEqual([]);
    });
  });

  describe("addEmployee", () => {
    it("should add a new employee", () => {
      const initialCount = mockEmployees.length;
      const newEmployeeData: EmployeeFormData = {
        code: "999",
        name: "Test Employee",
        cpf: "123.456.789-00",
        email: "test@example.com",
        phone: "47999999999",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "123",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addEmployee(newEmployeeData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.code).toBe(newEmployeeData.code);
      expect(added.name).toBe(newEmployeeData.name);
      expect(added.companyId).toBe(newEmployeeData.companyId);
      expect(mockEmployees.length).toBe(initialCount + 1);
    });
  });

  describe("deleteEmployee", () => {
    it("should delete an employee by id", () => {
      const newEmployeeData: EmployeeFormData = {
        code: "DELETE",
        name: "Delete Employee",
        cpf: "987.654.321-00",
        email: "delete@example.com",
        phone: "47988888888",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "456",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addEmployee(newEmployeeData);
      const initialCount = mockEmployees.length;
      const deleted = deleteEmployee(added.id);

      expect(deleted).toBe(true);
      expect(mockEmployees.length).toBe(initialCount - 1);
      expect(getEmployeeById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteEmployee("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateEmployee", () => {
    it("should update an employee", () => {
      const newEmployeeData: EmployeeFormData = {
        code: "UPDATE",
        name: "Update Employee",
        cpf: "111.222.333-44",
        email: "update@example.com",
        phone: "47977777777",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "789",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addEmployee(newEmployeeData);
      const updated = updateEmployee(added.id, { name: "Updated Employee", status: "inactive" });

      expect(updated).toBe(true);
      const employee = getEmployeeById(added.id);
      expect(employee?.name).toBe("Updated Employee");
      expect(employee?.status).toBe("inactive");
      expect(employee?.code).toBe(newEmployeeData.code);
    });

    it("should return false for non-existent id", () => {
      const updated = updateEmployee("non-existent-id", { name: "Test" });
      expect(updated).toBe(false);
    });
  });
});

