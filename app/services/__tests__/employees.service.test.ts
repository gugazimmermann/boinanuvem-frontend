import { describe, it, expect, beforeEach, vi } from "vitest";

// Create mock service using vi.hoisted to make it available in the mock factory
const { mockService } = vi.hoisted(() => {
  const mockService = {
    getAll: vi.fn(),
    getById: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  return { mockService };
});

// Mock entity-service-factory before importing the service
vi.mock("../entity-service-factory", () => {
  return {
    createEntityService: vi.fn(() => mockService),
  };
});

import {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../employees.service";

describe("employees.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmployees", () => {
    it("should fetch all employees", async () => {
      const mockEmployees = [
        { id: "1", code: "001", name: "Employee 1", status: "active", propertyIds: [] },
      ];
      mockService.getAll.mockResolvedValue(mockEmployees);

      const result = await getEmployees();

      expect(mockService.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockEmployees);
    });
  });

  describe("getEmployeeById", () => {
    it("should fetch employee by id", async () => {
      const mockEmployee = {
        id: "1",
        code: "001",
        name: "Employee 1",
        status: "active",
        propertyIds: [],
      };
      mockService.getById.mockResolvedValue(mockEmployee);

      const result = await getEmployeeById("1");

      expect(mockService.getById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockEmployee);
    });
  });

  describe("addEmployee", () => {
    it("should create employee", async () => {
      const formData = {
        code: "001",
        name: "New Employee",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: [],
      };
      const mockEmployee = { id: "1", ...formData };
      mockService.add.mockResolvedValue(mockEmployee);

      const result = await addEmployee(formData);

      expect(mockService.add).toHaveBeenCalledWith(formData);
      expect(result).toEqual(mockEmployee);
    });
  });

  describe("updateEmployee", () => {
    it("should update employee", async () => {
      const updateData = { name: "Updated Employee" };
      const mockEmployee = {
        id: "1",
        code: "001",
        name: "Updated Employee",
        status: "active",
        propertyIds: [],
      };
      mockService.update.mockResolvedValue(mockEmployee);

      const result = await updateEmployee("1", updateData);

      expect(mockService.update).toHaveBeenCalledWith("1", updateData);
      expect(result).toEqual(mockEmployee);
    });
  });

  describe("deleteEmployee", () => {
    it("should delete employee", async () => {
      mockService.remove.mockResolvedValue(undefined);

      await deleteEmployee("1");

      expect(mockService.remove).toHaveBeenCalledWith("1");
    });
  });
});
