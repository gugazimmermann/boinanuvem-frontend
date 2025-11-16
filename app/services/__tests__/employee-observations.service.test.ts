import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getEmployeeObservationsByEmployeeId,
  getEmployeeObservationById,
  addEmployeeObservation,
  updateEmployeeObservation,
  deleteEmployeeObservation,
} from "../employee-observations.service";
import { mockEmployeeObservations } from "~/mocks/employee-observations";
import type { EmployeeObservationFormData } from "~/types/employee-observation";

vi.mock("~/mocks/employee-observations", () => ({
  mockEmployeeObservations: [],
}));

describe("employee-observations.service", () => {
  beforeEach(() => {
    mockEmployeeObservations.length = 0;
    mockEmployeeObservations.push(
      {
        id: "emp-obs-1",
        employeeId: "employee-1",
        observation: "Employee observation 1",
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
      },
      {
        id: "emp-obs-2",
        employeeId: "employee-1",
        observation: "Employee observation 2",
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
      }
    );
  });

  describe("getEmployeeObservationsByEmployeeId", () => {
    it("should return observations for specific employee", () => {
      const result = getEmployeeObservationsByEmployeeId("employee-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.employeeId === "employee-1")).toBe(true);
    });
  });

  describe("getEmployeeObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getEmployeeObservationById("emp-obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("emp-obs-1");
    });
  });

  describe("addEmployeeObservation", () => {
    it("should add new observation", () => {
      const formData: EmployeeObservationFormData = {
        employeeId: "employee-2",
        observation: "New employee observation",
      };

      const initialLength = mockEmployeeObservations.length;
      const result = addEmployeeObservation(formData);

      expect(mockEmployeeObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
    });
  });

  describe("updateEmployeeObservation", () => {
    it("should update existing observation", () => {
      const result = updateEmployeeObservation("emp-obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockEmployeeObservations.find((obs) => obs.id === "emp-obs-1");
      expect(updated?.observation).toBe("Updated observation");
    });
  });

  describe("deleteEmployeeObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockEmployeeObservations.length;
      const result = deleteEmployeeObservation("emp-obs-1");

      expect(result).toBe(true);
      expect(mockEmployeeObservations).toHaveLength(initialLength - 1);
    });
  });
});
