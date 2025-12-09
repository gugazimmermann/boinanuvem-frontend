import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getEmployeeObservationsByEmployeeId,
  getEmployeeObservationById,
  addEmployeeObservation,
  updateEmployeeObservation,
  deleteEmployeeObservation,
} from "../employee-observations.service";

vi.mock("~/mocks/employee-observations", () => ({
  mockEmployeeObservations: [
    {
      id: "obs-1",
      employeeId: "employee-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockEmployeeObservations } from "~/mocks/employee-observations";

describe("employee-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmployeeObservationsByEmployeeId", () => {
    it("should find observations by employee id", () => {
      const result = getEmployeeObservationsByEmployeeId("employee-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getEmployeeObservationById", () => {
    it("should find observation by id", () => {
      const result = getEmployeeObservationById("obs-1");
      expect(result).toEqual(mockEmployeeObservations[0]);
    });
  });

  describe("addEmployeeObservation", () => {
    it("should create new observation", () => {
      const formData = {
        employeeId: "employee-2",
        observation: "New observation",
      };

      const result = addEmployeeObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockEmployeeObservations).toContain(result);
    });
  });

  describe("updateEmployeeObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateEmployeeObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockEmployeeObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteEmployeeObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockEmployeeObservations.length;
      const result = deleteEmployeeObservation("obs-1");

      expect(result).toBe(true);
      expect(mockEmployeeObservations).toHaveLength(initialLength - 1);
    });
  });
});
