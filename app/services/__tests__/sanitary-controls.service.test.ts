import { describe, it, expect, beforeEach } from "vitest";
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
import { mockSanitaryControls } from "~/mocks/sanitary-controls";
import type { SanitaryControlFormData } from "~/types/sanitary-control";

describe("sanitary-controls.service", () => {
  beforeEach(() => {
    mockSanitaryControls.length = 0;
    mockSanitaryControls.push(
      {
        id: "control-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2025-01-01",
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 5 }],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        observation: "First dose",
        createdAt: "2025-01-01",
      },
      {
        id: "control-2",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2025-01-15",
        appliedMedicines: [{ itemId: "item-2", quantity: 1, calculatedDosage: 10 }],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        observation: "Regular deworming",
        createdAt: "2025-01-15",
      },
      {
        id: "control-3",
        animalId: "animal-2",
        companyId: "company-2",
        date: "2025-01-10",
        appliedMedicines: [{ itemId: "item-3", quantity: 1, calculatedDosage: 5 }],
        employeeIds: ["employee-2"],
        serviceProviderIds: [],
        observation: "Annual vaccination",
        createdAt: "2025-01-10",
      }
    );
  });

  describe("getSanitaryControlById", () => {
    it("should return control when ID exists", () => {
      const result = getSanitaryControlById("control-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("control-1");
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getSanitaryControlById("control-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getSanitaryControlById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getSanitaryControlsByAnimalId", () => {
    it("should return all controls for an animal", () => {
      const result = getSanitaryControlsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.animalId === "animal-1")).toBe(true);
    });

    it("should return empty array when animal has no controls", () => {
      const result = getSanitaryControlsByAnimalId("animal-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSanitaryControlsByCompanyId", () => {
    it("should return all controls for a company", () => {
      const result = getSanitaryControlsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no controls", () => {
      const result = getSanitaryControlsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addSanitaryControl", () => {
    it("should add a new control with generated ID", () => {
      const formData: SanitaryControlFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2025-01-20",
        appliedMedicines: [{ itemId: "item-4", quantity: 1, calculatedDosage: 5 }],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        observation: "New control",
      };

      const initialLength = mockSanitaryControls.length;
      const result = addSanitaryControl(formData);

      expect(mockSanitaryControls).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-3");
      expect(result.appliedMedicines).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: SanitaryControlFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2025-01-20",
        appliedMedicines: [{ itemId: "item-4", quantity: 1, calculatedDosage: 5 }],
        employeeIds: [],
        serviceProviderIds: [],
      };

      const result = addSanitaryControl(formData);
      expect(result.id).toContain("ma0e8400-e29b-41d4-a716");
    });
  });

  describe("updateSanitaryControl", () => {
    it("should update control when ID exists", () => {
      const updateData: Partial<SanitaryControlFormData> = {
        appliedMedicines: [{ itemId: "item-updated", quantity: 2, calculatedDosage: 10 }],
      };

      const result = updateSanitaryControl("control-1", updateData);
      expect(result).toBe(true);

      const updated = mockSanitaryControls.find((c) => c.id === "control-1");
      expect(updated?.appliedMedicines).toBeDefined();
      expect(updated?.appliedMedicines?.[0]?.itemId).toBe("item-updated");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<SanitaryControlFormData> = {
        observation: "Updated observation",
      };

      const result = updateSanitaryControl("control-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteSanitaryControl", () => {
    it("should delete control when ID exists", () => {
      const initialLength = mockSanitaryControls.length;
      const result = deleteSanitaryControl("control-1");

      expect(result).toBe(true);
      expect(mockSanitaryControls).toHaveLength(initialLength - 1);
      expect(mockSanitaryControls.find((c) => c.id === "control-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockSanitaryControls.length;
      const result = deleteSanitaryControl("control-nonexistent");

      expect(result).toBe(false);
      expect(mockSanitaryControls).toHaveLength(initialLength);
    });
  });

  describe("Medicine Administration aliases", () => {
    it("should use same functions as sanitary controls", () => {
      expect(getMedicineAdministrationById).toBe(getSanitaryControlById);
      expect(getMedicineAdministrationsByAnimalId).toBe(getSanitaryControlsByAnimalId);
      expect(getMedicineAdministrationsByCompanyId).toBe(getSanitaryControlsByCompanyId);
      expect(addMedicineAdministration).toBe(addSanitaryControl);
      expect(updateMedicineAdministration).toBe(updateSanitaryControl);
      expect(deleteMedicineAdministration).toBe(deleteSanitaryControl);
    });

    it("should work with medicine administration functions", () => {
      const result = getMedicineAdministrationById("control-1");
      expect(result?.id).toBe("control-1");

      const byAnimal = getMedicineAdministrationsByAnimalId("animal-1");
      expect(byAnimal).toHaveLength(2);
    });
  });
});
