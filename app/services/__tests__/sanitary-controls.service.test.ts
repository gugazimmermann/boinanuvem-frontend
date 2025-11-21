import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSanitaryControlById,
  getSanitaryControlsByAnimalId,
  getSanitaryControlsByCompanyId,
  addSanitaryControl,
  updateSanitaryControl,
  deleteSanitaryControl,
} from "../sanitary-controls.service";
import { mockSanitaryControls } from "~/mocks/sanitary-controls";
import type { SanitaryControlFormData } from "~/types/sanitary-control";

vi.mock("~/mocks/sanitary-controls", () => ({
  mockSanitaryControls: [],
}));

describe("sanitary-controls.service", () => {
  beforeEach(() => {
    mockSanitaryControls.length = 0;
    mockSanitaryControls.push(
      {
        id: "ma0e8400-e29b-41d4-a716-446655440010",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2020-01-15",
        appliedMedicines: [
          {
            itemId: "item-1",
            quantity: 1,
            calculatedDosage: 1,
          },
        ],
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Vacinação de rotina",
        createdAt: "2020-01-15",
      },
      {
        id: "ma0e8400-e29b-41d4-a716-446655440011",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2020-02-01",
        appliedMedicines: [
          {
            itemId: "item-2",
            quantity: 25.5,
            calculatedDosage: 25.5,
          },
        ],
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2020-02-01",
      },
      {
        id: "ma0e8400-e29b-41d4-a716-446655440012",
        animalId: "animal-2",
        companyId: "company-2",
        date: "2020-01-20",
        appliedMedicines: [
          {
            itemId: "item-1",
            quantity: 2,
            calculatedDosage: 2,
          },
        ],
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2020-01-20",
      }
    );
  });

  describe("getSanitaryControlById", () => {
    it("should return sanitary control when ID exists", () => {
      const result = getSanitaryControlById("ma0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
      expect(result?.appliedMedicines).toHaveLength(1);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getSanitaryControlById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getSanitaryControlById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getSanitaryControlsByAnimalId", () => {
    it("should return sanitary controls for specific animal", () => {
      const result = getSanitaryControlsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result.every((admin) => admin.animalId === "animal-1")).toBe(true);
    });

    it("should return empty array when animal has no sanitary controls", () => {
      const result = getSanitaryControlsByAnimalId("nonexistent-animal");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSanitaryControlsByCompanyId", () => {
    it("should return sanitary controls for specific company", () => {
      const result = getSanitaryControlsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((admin) => admin.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no sanitary controls", () => {
      const result = getSanitaryControlsByCompanyId("nonexistent-company");
      expect(result).toHaveLength(0);
    });
  });

  describe("addSanitaryControl", () => {
    it("should add new sanitary control", () => {
      const formData: SanitaryControlFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2020-03-01",
        appliedMedicines: [
          {
            itemId: "item-1",
            quantity: 1.5,
            calculatedDosage: 1.5,
          },
        ],
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Test observation",
      };

      const initialLength = mockSanitaryControls.length;
      const result = addSanitaryControl(formData);

      expect(mockSanitaryControls).toHaveLength(initialLength + 1);
      expect(result.animalId).toBe("animal-3");
      expect(result.appliedMedicines).toHaveLength(1);
      expect(result.appliedMedicines[0].quantity).toBe(1.5);
      expect(result.observation).toBe("Test observation");
    });

    it("should add medicine administration with multiple medicines", () => {
      const formData: SanitaryControlFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2020-03-01",
        appliedMedicines: [
          {
            itemId: "item-1",
            quantity: 1,
            calculatedDosage: 1,
          },
          {
            itemId: "item-2",
            quantity: 2,
            calculatedDosage: 2,
          },
        ],
        employeeIds: ["employee-1"],
        serviceProviderIds: ["provider-1"],
      };

      const result = addSanitaryControl(formData);
      expect(result.appliedMedicines).toHaveLength(2);
      expect(result.employeeIds).toHaveLength(1);
      expect(result.serviceProviderIds).toHaveLength(1);
    });

    it("should generate ID when adding new administration", () => {
      const formData: SanitaryControlFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2020-03-01",
        appliedMedicines: [
          {
            itemId: "item-1",
            quantity: 1,
            calculatedDosage: 1,
          },
        ],
        employeeIds: [],
        serviceProviderIds: [],
      };

      const result = addSanitaryControl(formData);
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^ma0e8400-e29b-41d4-a716-/);
    });
  });

  describe("updateSanitaryControl", () => {
    it("should update existing sanitary control", () => {
      const result = updateSanitaryControl("ma0e8400-e29b-41d4-a716-446655440010", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockSanitaryControls.find(
        (admin) => admin.id === "ma0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.observation).toBe("Updated observation");
    });

    it("should update applied medicines", () => {
      const result = updateSanitaryControl("ma0e8400-e29b-41d4-a716-446655440010", {
        appliedMedicines: [
          {
            itemId: "item-3",
            quantity: 3,
            calculatedDosage: 3,
          },
        ],
      });

      expect(result).toBe(true);
      const updated = mockSanitaryControls.find(
        (admin) => admin.id === "ma0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.appliedMedicines).toHaveLength(1);
      expect(updated?.appliedMedicines[0].itemId).toBe("item-3");
    });

    it("should return false when ID does not exist", () => {
      const result = updateSanitaryControl("nonexistent-id", {
        observation: "Test",
      });

      expect(result).toBe(false);
    });
  });

  describe("deleteSanitaryControl", () => {
    it("should delete existing sanitary control", () => {
      const initialLength = mockSanitaryControls.length;
      const result = deleteSanitaryControl("ma0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockSanitaryControls).toHaveLength(initialLength - 1);
      expect(
        mockSanitaryControls.find((admin) => admin.id === "ma0e8400-e29b-41d4-a716-446655440010")
      ).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockSanitaryControls.length;
      const result = deleteSanitaryControl("nonexistent-id");

      expect(result).toBe(false);
      expect(mockSanitaryControls).toHaveLength(initialLength);
    });
  });
});
