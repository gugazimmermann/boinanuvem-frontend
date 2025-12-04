import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getEmployeeObservationsByEmployeeId,
  getEmployeeObservationById,
  addEmployeeObservation,
  deleteEmployeeObservation,
  updateEmployeeObservation,
} from "../employee-observations.service";
import { mockEmployeeObservations } from "~/mocks/employee-observations";
import type { EmployeeObservationFormData } from "~/types/employee-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-employee-obs"),
}));

describe("employee-observations.service", () => {
  beforeEach(() => {
    mockEmployeeObservations.length = 0;
    mockEmployeeObservations.push(
      {
        id: "obs-1",
        employeeId: "employee-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        employeeId: "employee-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        employeeId: "employee-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getEmployeeObservationsByEmployeeId", () => {
    it("should return all observations for an employee", () => {
      const result = getEmployeeObservationsByEmployeeId("employee-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when employee has no observations", () => {
      const result = getEmployeeObservationsByEmployeeId("employee-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getEmployeeObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getEmployeeObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getEmployeeObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getEmployeeObservationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addEmployeeObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: EmployeeObservationFormData = {
        employeeId: "employee-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockEmployeeObservations.length;
      const result = addEmployeeObservation(formData);

      expect(mockEmployeeObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-employee-obs");
      expect(result.employeeId).toBe("employee-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should add observation with file IDs", () => {
      const formData: EmployeeObservationFormData = {
        employeeId: "employee-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addEmployeeObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });
  });

  describe("deleteEmployeeObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockEmployeeObservations.length;
      const result = deleteEmployeeObservation("obs-1");

      expect(result).toBe(true);
      expect(mockEmployeeObservations).toHaveLength(initialLength - 1);
      expect(mockEmployeeObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockEmployeeObservations.length;
      const result = deleteEmployeeObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockEmployeeObservations).toHaveLength(initialLength);
    });
  });

  describe("updateEmployeeObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<EmployeeObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateEmployeeObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockEmployeeObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<EmployeeObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateEmployeeObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });
});
