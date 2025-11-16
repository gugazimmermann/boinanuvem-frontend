import { describe, it, expect } from "vitest";
import {
  mockWeighings,
  getWeighingById,
  getWeighingsByAnimalId,
  getWeighingsByCompanyId,
  addWeighing,
  deleteWeighing,
  updateWeighing,
} from "../weighings";
import type { WeighingFormData } from "~/types";

describe("Weighings Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const ANIMAL_ID = "bb0e8400-e29b-41d4-a716-446655440100";
  const EMPLOYEE_ID = "770e8400-e29b-41d4-a716-446655440010";

  describe("getWeighingById", () => {
    it("should return weighing by id", () => {
      if (mockWeighings.length > 0) {
        const weighing = getWeighingById(mockWeighings[0].id);
        expect(weighing).toBeDefined();
        expect(weighing?.id).toBe(mockWeighings[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const weighing = getWeighingById("non-existent-id");
      expect(weighing).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const weighing = getWeighingById(undefined);
      expect(weighing).toBeUndefined();
    });
  });

  describe("getWeighingsByAnimalId", () => {
    it("should return weighings for an animal", () => {
      if (mockWeighings.length > 0) {
        const animalId = mockWeighings[0].animalId;
        const weighings = getWeighingsByAnimalId(animalId);
        expect(Array.isArray(weighings)).toBe(true);
        weighings.forEach((weighing) => {
          expect(weighing.animalId).toBe(animalId);
        });
      }
    });

    it("should return empty array for non-existent animal", () => {
      const weighings = getWeighingsByAnimalId("non-existent-animal");
      expect(weighings).toEqual([]);
    });
  });

  describe("getWeighingsByCompanyId", () => {
    it("should return weighings for a company", () => {
      const weighings = getWeighingsByCompanyId(COMPANY_ID);
      expect(Array.isArray(weighings)).toBe(true);
      weighings.forEach((weighing) => {
        expect(weighing.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const weighings = getWeighingsByCompanyId("non-existent-company");
      expect(weighings).toEqual([]);
    });
  });

  describe("addWeighing", () => {
    it("should add a new weighing", () => {
      const initialCount = mockWeighings.length;
      const newWeighingData: WeighingFormData = {
        animalId: ANIMAL_ID,
        date: "2024-01-15",
        weight: 350,
        employeeIds: [EMPLOYEE_ID],
        companyId: COMPANY_ID,
      };

      const added = addWeighing(newWeighingData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.animalId).toBe(newWeighingData.animalId);
      expect(added.date).toBe(newWeighingData.date);
      expect(added.weight).toBe(newWeighingData.weight);
      expect(mockWeighings.length).toBe(initialCount + 1);
    });
  });

  describe("deleteWeighing", () => {
    it("should delete a weighing by id", () => {
      const newWeighingData: WeighingFormData = {
        animalId: ANIMAL_ID,
        date: "2024-01-20",
        weight: 400,
        employeeIds: [EMPLOYEE_ID],
        companyId: COMPANY_ID,
      };

      const added = addWeighing(newWeighingData);
      const initialCount = mockWeighings.length;
      const deleted = deleteWeighing(added.id);

      expect(deleted).toBe(true);
      expect(mockWeighings.length).toBe(initialCount - 1);
      expect(getWeighingById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteWeighing("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateWeighing", () => {
    it("should update a weighing", () => {
      const newWeighingData: WeighingFormData = {
        animalId: ANIMAL_ID,
        date: "2024-01-25",
        weight: 450,
        employeeIds: [EMPLOYEE_ID],
        companyId: COMPANY_ID,
      };

      const added = addWeighing(newWeighingData);
      const updated = updateWeighing(added.id, { weight: 500, observation: "Updated" });

      expect(updated).toBe(true);
      const weighing = getWeighingById(added.id);
      expect(weighing?.weight).toBe(500);
      expect(weighing?.observation).toBe("Updated");
    });

    it("should return false for non-existent id", () => {
      const updated = updateWeighing("non-existent-id", { weight: 600 });
      expect(updated).toBe(false);
    });
  });
});

