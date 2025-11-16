import { describe, it, expect } from "vitest";
import {
  mockEmployeeObservations,
  getEmployeeObservationsByEmployeeId,
  getEmployeeObservationById,
  addEmployeeObservation,
  deleteEmployeeObservation,
  updateEmployeeObservation,
} from "../employee-observations";
import type { EmployeeObservationFormData } from "~/types/employee-observation";

describe("Employee Observations Mock Functions", () => {
  const EMPLOYEE_ID = "770e8400-e29b-41d4-a716-446655440010";

  describe("getEmployeeObservationsByEmployeeId", () => {
    it("should return observations for an employee", () => {
      const observations = getEmployeeObservationsByEmployeeId(EMPLOYEE_ID);
      expect(Array.isArray(observations)).toBe(true);
      observations.forEach((obs) => {
        expect(obs.employeeId).toBe(EMPLOYEE_ID);
      });
    });

    it("should return empty array for non-existent employee", () => {
      const observations = getEmployeeObservationsByEmployeeId("non-existent-employee");
      expect(observations).toEqual([]);
    });
  });

  describe("getEmployeeObservationById", () => {
    it("should return observation by id", () => {
      if (mockEmployeeObservations.length > 0) {
        const observation = getEmployeeObservationById(mockEmployeeObservations[0].id);
        expect(observation).toBeDefined();
        expect(observation?.id).toBe(mockEmployeeObservations[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const observation = getEmployeeObservationById("non-existent-id");
      expect(observation).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const observation = getEmployeeObservationById(undefined);
      expect(observation).toBeUndefined();
    });
  });

  describe("addEmployeeObservation", () => {
    it("should add a new observation", () => {
      const initialCount = mockEmployeeObservations.length;
      const newObservationData: EmployeeObservationFormData = {
        employeeId: EMPLOYEE_ID,
        observation: "Test observation",
        fileIds: ["file-1"],
        createdBy: "user-001",
      };

      const added = addEmployeeObservation(newObservationData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
      expect(added.employeeId).toBe(newObservationData.employeeId);
      expect(mockEmployeeObservations.length).toBe(initialCount + 1);
    });
  });

  describe("deleteEmployeeObservation", () => {
    it("should delete an observation by id", () => {
      const newObservationData: EmployeeObservationFormData = {
        employeeId: EMPLOYEE_ID,
        observation: "Delete test",
        createdBy: "user-001",
      };

      const added = addEmployeeObservation(newObservationData);
      const initialCount = mockEmployeeObservations.length;
      const deleted = deleteEmployeeObservation(added.id);

      expect(deleted).toBe(true);
      expect(mockEmployeeObservations.length).toBe(initialCount - 1);
      expect(getEmployeeObservationById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteEmployeeObservation("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateEmployeeObservation", () => {
    it("should update an observation", () => {
      const newObservationData: EmployeeObservationFormData = {
        employeeId: EMPLOYEE_ID,
        observation: "Update test",
        createdBy: "user-001",
      };

      const added = addEmployeeObservation(newObservationData);
      const updated = updateEmployeeObservation(added.id, {
        observation: "Updated observation",
      });

      expect(updated).toBe(true);
      const observation = getEmployeeObservationById(added.id);
      expect(observation?.observation).toBe("Updated observation");
      expect(observation?.updatedAt).toBeDefined();
    });

    it("should return false for non-existent id", () => {
      const updated = updateEmployeeObservation("non-existent-id", {
        observation: "Test",
      });
      expect(updated).toBe(false);
    });
  });
});

