import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSanitaryControlById,
  getSanitaryControlsByAnimalId,
  getSanitaryControlsByCompanyId,
  addSanitaryControl,
  updateSanitaryControl,
  deleteSanitaryControl,
  getMedicineAdministrationById,
  getMedicineAdministrationsByAnimalId,
  getMedicineAdministrationsByCompanyId,
  addMedicineAdministration,
  updateMedicineAdministration,
  deleteMedicineAdministration,
} from "../sanitary-controls.service";

vi.mock("~/mocks/sanitary-controls", () => ({
  mockSanitaryControls: [
    {
      id: "sc-1",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-15",
      appliedMedicines: [],
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "sc-2",
      animalId: "animal-2",
      companyId: "company-1",
      date: "2024-02-15",
      medicine: "Medicine B",
    },
  ],
}));

import { mockSanitaryControls } from "~/mocks/sanitary-controls";

describe("sanitary-controls.service", () => {
  beforeEach(() => {
    // Reset mock data to initial state
    mockSanitaryControls.length = 0;
    mockSanitaryControls.push(
      {
        id: "sc-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2024-01-15",
        appliedMedicines: [],
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "sc-2",
        animalId: "animal-2",
        companyId: "company-1",
        date: "2024-02-15",
        appliedMedicines: [],
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-02-15T00:00:00Z",
      }
    );
  });

  describe("getSanitaryControlById", () => {
    it("should find sanitary control by id", () => {
      const result = getSanitaryControlById("sc-1");
      expect(result).toEqual(mockSanitaryControls[0]);
    });

    it("should return undefined when not found", () => {
      const result = getSanitaryControlById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getSanitaryControlsByAnimalId", () => {
    it("should find sanitary controls by animal id", () => {
      const result = getSanitaryControlsByAnimalId("animal-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getSanitaryControlsByCompanyId", () => {
    it("should find sanitary controls by company id", () => {
      const result = getSanitaryControlsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("addSanitaryControl", () => {
    it("should create new sanitary control", () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        appliedMedicines: [],
        employeeIds: [],
        serviceProviderIds: [],
        propertyIds: [],
      };

      const result = addSanitaryControl(formData);

      expect(result.id).toBeDefined();
      expect(result.appliedMedicines).toEqual([]);
      expect(mockSanitaryControls).toContain(result);
    });
  });

  describe("updateSanitaryControl", () => {
    it("should update sanitary control", () => {
      const updateData = {
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
      };
      const result = updateSanitaryControl("sc-1", updateData);

      expect(result).toBe(true);
      expect(mockSanitaryControls[0].appliedMedicines).toEqual([
        { itemId: "item-1", quantity: 1, calculatedDosage: 10 },
      ]);
    });
  });

  describe("deleteSanitaryControl", () => {
    it("should delete sanitary control", () => {
      const initialLength = mockSanitaryControls.length;
      const result = deleteSanitaryControl("sc-1");

      expect(result).toBe(true);
      expect(mockSanitaryControls).toHaveLength(initialLength - 1);
    });
  });

  describe("medicine administration aliases", () => {
    it("should use same function for getMedicineAdministrationById", () => {
      const result = getMedicineAdministrationById("sc-1");
      expect(result).toEqual(mockSanitaryControls[0]);
    });

    it("should use same function for getMedicineAdministrationsByAnimalId", () => {
      const result = getMedicineAdministrationsByAnimalId("animal-1");
      expect(result).toHaveLength(1);
    });

    it("should use same function for getMedicineAdministrationsByCompanyId", () => {
      const result = getMedicineAdministrationsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });

    it("should use same function for addMedicineAdministration", () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
        employeeIds: [],
        serviceProviderIds: [],
        propertyIds: [],
      };

      const result = addMedicineAdministration(formData);
      expect(result.appliedMedicines).toEqual([
        { itemId: "item-1", quantity: 1, calculatedDosage: 10 },
      ]);
    });

    it("should use same function for updateMedicineAdministration", () => {
      const result = updateMedicineAdministration("sc-1", {
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
      });
      expect(result).toBe(true);
    });

    it("should use same function for deleteMedicineAdministration", () => {
      const result = deleteMedicineAdministration("sc-1");
      expect(result).toBe(true);
    });
  });
});
