import { describe, it, expect, beforeEach } from "vitest";
import {
  getEmployeeById,
  getEmployeesByCompanyId,
  getEmployeesByPropertyId,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../employees.service";
import { mockEmployees } from "~/mocks/employees";
import type { EmployeeFormData } from "~/types";

describe("employees.service", () => {
  beforeEach(() => {
    mockEmployees.length = 0;
    mockEmployees.push(
      {
        id: "employee-1",
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        code: "EMP001",
        name: "Employee 1",
        email: "employee1@test.com",
        phone: "1234567890",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "employee-2",
        companyId: "company-1",
        propertyIds: ["property-2"],
        code: "EMP002",
        name: "Employee 2",
        email: "employee2@test.com",
        phone: "0987654321",
        status: "active",
        createdAt: "2025-01-02",
      },
      {
        id: "employee-3",
        companyId: "company-2",
        propertyIds: ["property-3"],
        code: "EMP003",
        name: "Employee 3",
        email: "employee3@test.com",
        phone: "5555555555",
        status: "inactive",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getEmployeeById", () => {
    it("should return employee when ID exists", () => {
      const result = getEmployeeById("employee-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("employee-1");
      expect(result?.name).toBe("Employee 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getEmployeeById("employee-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getEmployeeById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getEmployeesByCompanyId", () => {
    it("should return all employees for a company", () => {
      const result = getEmployeesByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("employee-1");
      expect(result[1]?.id).toBe("employee-2");
    });

    it("should return empty array when company has no employees", () => {
      const result = getEmployeesByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getEmployeesByPropertyId", () => {
    it("should return employees that have the property in propertyIds", () => {
      const result = getEmployeesByPropertyId("property-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("employee-1");
    });

    it("should return multiple employees when multiple have the property", () => {
      const result = getEmployeesByPropertyId("property-2");
      expect(result).toHaveLength(2);
      expect(result.some((e) => e.id === "employee-1")).toBe(true);
      expect(result.some((e) => e.id === "employee-2")).toBe(true);
    });

    it("should return empty array when property has no employees", () => {
      const result = getEmployeesByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addEmployee", () => {
    it("should add a new employee with generated ID", () => {
      const formData: EmployeeFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "EMP004",
        name: "Employee 4",
        email: "employee4@test.com",
        phone: "1111111111",
        status: "active",
      };

      const initialLength = mockEmployees.length;
      const result = addEmployee(formData);

      expect(mockEmployees).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.name).toBe("Employee 4");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: EmployeeFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "EMP004",
        name: "Employee 4",
        status: "active",
      };

      const result = addEmployee(formData);
      expect(result.id).toContain("770e8400-e29b-41d4-a716");
    });
  });

  describe("updateEmployee", () => {
    it("should update employee when ID exists", () => {
      const updateData: Partial<EmployeeFormData> = {
        name: "Updated Employee 1",
        email: "updated@test.com",
      };

      const result = updateEmployee("employee-1", updateData);
      expect(result).toBe(true);

      const updated = mockEmployees.find((e) => e.id === "employee-1");
      expect(updated?.name).toBe("Updated Employee 1");
      expect(updated?.email).toBe("updated@test.com");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<EmployeeFormData> = {
        name: "Updated Employee",
      };

      const result = updateEmployee("employee-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteEmployee", () => {
    it("should delete employee when ID exists", () => {
      const initialLength = mockEmployees.length;
      const result = deleteEmployee("employee-1");

      expect(result).toBe(true);
      expect(mockEmployees).toHaveLength(initialLength - 1);
      expect(mockEmployees.find((e) => e.id === "employee-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockEmployees.length;
      const result = deleteEmployee("employee-nonexistent");

      expect(result).toBe(false);
      expect(mockEmployees).toHaveLength(initialLength);
    });
  });
});
