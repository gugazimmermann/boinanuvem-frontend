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

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

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

import { mockSanitaryControls as _mockSanitaryControls } from "~/mocks/sanitary-controls";
import { apiClient } from "../api-client";

describe("sanitary-controls.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  const mockControls = [
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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSanitaryControlById", () => {
    it("should find sanitary control by id", async () => {
      mockGet.mockResolvedValue(mockControls[0]);
      const result = await getSanitaryControlById("sc-1");
      expect(mockGet).toHaveBeenCalledWith("/sanitary-controls/sc-1");
      expect(result).toEqual(mockControls[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getSanitaryControlById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getSanitaryControlsByAnimalId", () => {
    it("should find sanitary controls by animal id", async () => {
      const animalControls = mockControls.filter((c) => c.animalId === "animal-1");
      mockGet.mockResolvedValue(animalControls);
      const result = await getSanitaryControlsByAnimalId("animal-1");
      expect(mockGet).toHaveBeenCalledWith("/sanitary-controls/animal/animal-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getSanitaryControlsByCompanyId", () => {
    it("should find sanitary controls by company id", async () => {
      mockGet.mockResolvedValue(mockControls);
      const result = await getSanitaryControlsByCompanyId("company-1");
      expect(mockGet).toHaveBeenCalledWith("/sanitary-controls");
      expect(result).toHaveLength(2);
    });
  });

  describe("addSanitaryControl", () => {
    it("should create new sanitary control", async () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        appliedMedicines: [],
        employeeIds: [],
        serviceProviderIds: [],
        propertyIds: [],
      };

      const newControl = {
        id: "sc-3",
        ...formData,
        createdAt: "2024-03-01T00:00:00Z",
      };
      mockPost.mockResolvedValue(newControl);

      const result = await addSanitaryControl(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/sanitary-controls",
        expect.objectContaining({
          animalId: "animal-3",
          date: "2024-03-01",
        })
      );
      expect(result.id).toBeDefined();
      expect(result.appliedMedicines).toEqual([]);
    });
  });

  describe("updateSanitaryControl", () => {
    it("should update sanitary control", async () => {
      const updateData = {
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
      };
      const updatedControl = {
        ...mockControls[0],
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
      };
      mockPut.mockResolvedValue(updatedControl);

      const result = await updateSanitaryControl("sc-1", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/sanitary-controls/sc-1",
        expect.objectContaining({
          itemId: "item-1",
          quantity: 1,
          calculatedDosage: 10,
        })
      );
      expect(result.appliedMedicines).toEqual([
        { itemId: "item-1", quantity: 1, calculatedDosage: 10 },
      ]);
    });
  });

  describe("deleteSanitaryControl", () => {
    it("should delete sanitary control", async () => {
      mockDelete.mockResolvedValue({});
      await deleteSanitaryControl("sc-1");
      expect(mockDelete).toHaveBeenCalledWith("/sanitary-controls/sc-1");
    });
  });

  describe("medicine administration aliases", () => {
    it("should use same function for getMedicineAdministrationById", async () => {
      mockGet.mockResolvedValue(mockControls[0]);
      const result = await getMedicineAdministrationById("sc-1");
      expect(result).toEqual(mockControls[0]);
    });

    it("should use same function for getMedicineAdministrationsByAnimalId", async () => {
      const animalControls = mockControls.filter((c) => c.animalId === "animal-1");
      mockGet.mockResolvedValue(animalControls);
      const result = await getMedicineAdministrationsByAnimalId("animal-1");
      expect(result).toHaveLength(1);
    });

    it("should use same function for getMedicineAdministrationsByCompanyId", async () => {
      mockGet.mockResolvedValue(mockControls);
      const result = await getMedicineAdministrationsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });

    it("should use same function for addMedicineAdministration", async () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
        employeeIds: [],
        serviceProviderIds: [],
        propertyIds: [],
      };

      const newControl = {
        id: "sc-3",
        ...formData,
        createdAt: "2024-03-01T00:00:00Z",
      };
      mockPost.mockResolvedValue(newControl);

      const result = await addMedicineAdministration(formData);
      expect(result.appliedMedicines).toEqual([
        { itemId: "item-1", quantity: 1, calculatedDosage: 10 },
      ]);
    });

    it("should use same function for updateMedicineAdministration", async () => {
      const updatedControl = {
        ...mockControls[0],
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
      };
      mockPut.mockResolvedValue(updatedControl);
      const result = await updateMedicineAdministration("sc-1", {
        appliedMedicines: [{ itemId: "item-1", quantity: 1, calculatedDosage: 10 }],
      });
      expect(result.appliedMedicines).toEqual([
        { itemId: "item-1", quantity: 1, calculatedDosage: 10 },
      ]);
    });

    it("should use same function for deleteMedicineAdministration", async () => {
      mockDelete.mockResolvedValue({});
      await deleteMedicineAdministration("sc-1");
      expect(mockDelete).toHaveBeenCalledWith("/sanitary-controls/sc-1");
    });
  });
});
