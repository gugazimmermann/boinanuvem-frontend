import { describe, it, expect, beforeEach, vi } from "vitest";
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

vi.mock("~/mocks/employees", () => ({
  mockEmployees: [],
}));

describe("employees.service", () => {
  beforeEach(() => {
    mockEmployees.length = 0;
    mockEmployees.push(
      {
        id: "770e8400-e29b-41d4-a716-446655440010",
        code: "EM001",
        name: "Employee One",
        status: "active",
        cpf: "11122233344",
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        createdAt: "2020-01-01",
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440011",
        code: "EM002",
        name: "Employee Two",
        status: "active",
        cpf: "22233344455",
        companyId: "company-1",
        propertyIds: ["property-1"],
        createdAt: "2020-01-02",
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440012",
        code: "EM003",
        name: "Employee Three",
        status: "active",
        cpf: "33344455566",
        companyId: "company-2",
        propertyIds: ["property-3"],
        createdAt: "2020-01-03",
      }
    );
  });

  describe("getEmployeeById", () => {
    it("should return employee when ID exists", () => {
      const result = getEmployeeById("770e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Employee One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getEmployeeById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getEmployeeById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getEmployeesByCompanyId", () => {
    it("should return employees for specific company", () => {
      const result = getEmployeesByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((employee) => employee.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no employees", () => {
      const result = getEmployeesByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getEmployeesByPropertyId", () => {
    it("should return employees for specific property", () => {
      const result = getEmployeesByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result.every((employee) => employee.propertyIds?.includes("property-1"))).toBe(true);
    });

    it("should return empty array when property has no employees", () => {
      const result = getEmployeesByPropertyId("property-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("addEmployee", () => {
    it("should add new employee with generated ID", () => {
      const formData: EmployeeFormData = {
        code: "EM004",
        name: "New Employee",
        status: "active",
        cpf: "44455566677",
        companyId: "company-1",
        propertyIds: ["property-1"],
      };

      const initialLength = mockEmployees.length;
      const result = addEmployee(formData);

      expect(mockEmployees).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.name).toBe("New Employee");
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateEmployee", () => {
    it("should update existing employee", () => {
      const result = updateEmployee("770e8400-e29b-41d4-a716-446655440010", {
        name: "Updated Employee",
      });

      expect(result).toBe(true);
      const updated = mockEmployees.find((e) => e.id === "770e8400-e29b-41d4-a716-446655440010");
      expect(updated?.name).toBe("Updated Employee");
    });

    it("should return false when employee does not exist", () => {
      const result = updateEmployee("nonexistent-id", { name: "New Name" });
      expect(result).toBe(false);
    });
  });

  describe("deleteEmployee", () => {
    it("should delete existing employee", () => {
      const initialLength = mockEmployees.length;
      const result = deleteEmployee("770e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockEmployees).toHaveLength(initialLength - 1);
      expect(
        mockEmployees.find((e) => e.id === "770e8400-e29b-41d4-a716-446655440010")
      ).toBeUndefined();
    });

    it("should return false when employee does not exist", () => {
      const initialLength = mockEmployees.length;
      const result = deleteEmployee("nonexistent-id");

      expect(result).toBe(false);
      expect(mockEmployees).toHaveLength(initialLength);
    });
  });
});
