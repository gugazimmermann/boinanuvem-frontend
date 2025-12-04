import { describe, it, expect, beforeEach } from "vitest";
import {
  getWeighingById,
  getWeighingsByAnimalId,
  getWeighingsByCompanyId,
  getWeighingsByAnimalIds,
  addWeighing,
  updateWeighing,
  deleteWeighing,
} from "../weighings.service";
import { mockWeighings } from "~/mocks/weighings";
import type { WeighingFormData } from "~/types";

describe("weighings.service", () => {
  beforeEach(() => {
    mockWeighings.length = 0;
    mockWeighings.push(
      {
        id: "ww0e8400-e29b-41d4-a716-446655440001",
        animalId: "animal-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: ["service-provider-1"],
        date: "2025-01-01",
        weight: 300,
        companyId: "company-1",
        createdAt: "2025-01-01",
      },
      {
        id: "ww0e8400-e29b-41d4-a716-446655440002",
        animalId: "animal-1",
        employeeIds: ["employee-2"],
        serviceProviderIds: [],
        date: "2025-02-01",
        weight: 350,
        companyId: "company-1",
        createdAt: "2025-02-01",
      },
      {
        id: "ww0e8400-e29b-41d4-a716-446655440003",
        animalId: "animal-2",
        employeeIds: ["employee-1"],
        serviceProviderIds: ["service-provider-2"],
        date: "2025-01-15",
        weight: 400,
        companyId: "company-1",
        createdAt: "2025-01-15",
      },
      {
        id: "ww0e8400-e29b-41d4-a716-446655440004",
        animalId: "animal-3",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2025-01-20",
        weight: 250,
        companyId: "company-2",
        createdAt: "2025-01-20",
      }
    );
  });

  describe("getWeighingById", () => {
    it("should return weighing when ID exists", () => {
      const result = getWeighingById("ww0e8400-e29b-41d4-a716-446655440001");
      expect(result).toBeDefined();
      expect(result?.id).toBe("ww0e8400-e29b-41d4-a716-446655440001");
      expect(result?.animalId).toBe("animal-1");
      expect(result?.weight).toBe(300);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getWeighingById("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getWeighingById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getWeighingsByAnimalId", () => {
    it("should return all weighings for an animal", () => {
      const result = getWeighingsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("ww0e8400-e29b-41d4-a716-446655440001");
      expect(result[1].id).toBe("ww0e8400-e29b-41d4-a716-446655440002");
    });

    it("should return empty array when no weighings exist for animal", () => {
      const result = getWeighingsByAnimalId("animal-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getWeighingsByCompanyId", () => {
    it("should return all weighings for a company", () => {
      const result = getWeighingsByCompanyId("company-1");
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("ww0e8400-e29b-41d4-a716-446655440001");
      expect(result[1].id).toBe("ww0e8400-e29b-41d4-a716-446655440002");
      expect(result[2].id).toBe("ww0e8400-e29b-41d4-a716-446655440003");
    });

    it("should return empty array when no weighings exist for company", () => {
      const result = getWeighingsByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getWeighingsByAnimalIds", () => {
    it("should return a map of weighings grouped by animal IDs", () => {
      const result = getWeighingsByAnimalIds(["animal-1", "animal-2", "animal-999"]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);

      const animal1Weighings = result.get("animal-1");
      expect(animal1Weighings).toHaveLength(2);
      expect(animal1Weighings?.[0].id).toBe("ww0e8400-e29b-41d4-a716-446655440001");
      expect(animal1Weighings?.[1].id).toBe("ww0e8400-e29b-41d4-a716-446655440002");

      const animal2Weighings = result.get("animal-2");
      expect(animal2Weighings).toHaveLength(1);
      expect(animal2Weighings?.[0].id).toBe("ww0e8400-e29b-41d4-a716-446655440003");

      const animal999Weighings = result.get("animal-999");
      expect(animal999Weighings).toHaveLength(0);
    });

    it("should return empty arrays for animal IDs with no weighings", () => {
      const result = getWeighingsByAnimalIds(["animal-999", "animal-998"]);

      expect(result.size).toBe(2);
      expect(result.get("animal-999")).toEqual([]);
      expect(result.get("animal-998")).toEqual([]);
    });

    it("should return empty map when no animal IDs provided", () => {
      const result = getWeighingsByAnimalIds([]);

      expect(result.size).toBe(0);
    });

    it("should only include weighings for specified animal IDs", () => {
      const result = getWeighingsByAnimalIds(["animal-1"]);

      expect(result.size).toBe(1);
      expect(result.get("animal-1")).toHaveLength(2);
      // animal-2, animal-3 should not be included
      expect(result.get("animal-2")).toBeUndefined();
      expect(result.get("animal-3")).toBeUndefined();
    });

    it("should handle case when weighingsMap.get returns undefined", () => {
      // Add a weighing for an animal that's not in the initial map
      mockWeighings.push({
        id: "ww0e8400-e29b-41d4-a716-446655440005",
        animalId: "animal-new",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2025-01-25",
        weight: 200,
        companyId: "company-1",
        createdAt: "2025-01-25",
      });

      const result = getWeighingsByAnimalIds(["animal-new"]);
      expect(result.size).toBe(1);
      expect(result.get("animal-new")).toHaveLength(1);
    });
  });

  describe("addWeighing", () => {
    it("should add a new weighing with generated ID", () => {
      const newWeighing: WeighingFormData = {
        animalId: "animal-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: ["service-provider-1"],
        date: "2025-03-01",
        weight: 380,
        companyId: "company-1",
      };

      const result = addWeighing(newWeighing);

      expect(result.id).toMatch(/^ww0e8400-e29b-41d4-a716-/);
      expect(result.animalId).toBe("animal-1");
      expect(result.weight).toBe(380);
      expect(result.date).toBe("2025-03-01");
      expect(result.employeeIds).toEqual(["employee-1"]);
      expect(result.serviceProviderIds).toEqual(["service-provider-1"]);
      expect(result.companyId).toBe("company-1");
      expect(result.createdAt).toBeDefined();
      expect(mockWeighings).toHaveLength(5);
    });

    it("should use default ID when no weighings exist", () => {
      mockWeighings.length = 0;
      const newWeighing: WeighingFormData = {
        animalId: "animal-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2025-01-01",
        weight: 300,
        companyId: "company-1",
      };

      const result = addWeighing(newWeighing);

      expect(result.id).toBe("ww0e8400-e29b-41d4-a716-446655440009");
    });

    it("should add weighing with optional fields", () => {
      const newWeighing: WeighingFormData = {
        animalId: "animal-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        date: "2025-03-01",
        weight: 380,
        observation: "Test observation",
        appliedMedicines: [{ itemId: "item-1", quantity: 10, calculatedDosage: 5.5 }],
        companyId: "company-1",
      };

      const result = addWeighing(newWeighing);

      expect(result.observation).toBe("Test observation");
      expect(result.appliedMedicines).toEqual([
        { itemId: "item-1", quantity: 10, calculatedDosage: 5.5 },
      ]);
    });
  });

  describe("updateWeighing", () => {
    it("should update an existing weighing", () => {
      const updateData: Partial<WeighingFormData> = {
        weight: 360,
        observation: "Updated observation",
      };

      const result = updateWeighing("ww0e8400-e29b-41d4-a716-446655440001", updateData);

      expect(result).toBe(true);
      const updated = mockWeighings.find((w) => w.id === "ww0e8400-e29b-41d4-a716-446655440001");
      expect(updated?.weight).toBe(360);
      expect(updated?.observation).toBe("Updated observation");
    });

    it("should return false when weighing does not exist", () => {
      const updateData: Partial<WeighingFormData> = {
        weight: 360,
      };

      const result = updateWeighing("non-existent-id", updateData);

      expect(result).toBe(false);
    });

    it("should update only provided fields", () => {
      const original = { ...mockWeighings[0] };
      const updateData: Partial<WeighingFormData> = {
        weight: 310,
      };

      updateWeighing("ww0e8400-e29b-41d4-a716-446655440001", updateData);

      const updated = mockWeighings.find((w) => w.id === "ww0e8400-e29b-41d4-a716-446655440001");
      expect(updated?.weight).toBe(310);
      expect(updated?.animalId).toBe(original.animalId);
      expect(updated?.date).toBe(original.date);
    });
  });

  describe("deleteWeighing", () => {
    it("should delete an existing weighing", () => {
      const result = deleteWeighing("ww0e8400-e29b-41d4-a716-446655440001");
      expect(result).toBe(true);
      expect(mockWeighings).toHaveLength(3);
      expect(
        mockWeighings.find((w) => w.id === "ww0e8400-e29b-41d4-a716-446655440001")
      ).toBeUndefined();
    });

    it("should return false when weighing does not exist", () => {
      const result = deleteWeighing("non-existent-id");
      expect(result).toBe(false);
      expect(mockWeighings).toHaveLength(4);
    });
  });
});
