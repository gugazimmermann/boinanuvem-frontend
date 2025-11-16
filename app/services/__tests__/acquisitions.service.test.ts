import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAcquisitionById,
  getAcquisitionByAnimalId,
  getAcquisitionsByCompanyId,
  addAcquisition,
  updateAcquisition,
  deleteAcquisition,
  generateAcquisitionId,
} from "../acquisitions.service";
import { mockAcquisitions } from "~/mocks/acquisitions";
import type { AcquisitionFormData } from "~/types";

vi.mock("~/mocks/acquisitions", () => ({
  mockAcquisitions: [],
}));

describe("acquisitions.service", () => {
  beforeEach(() => {
    mockAcquisitions.length = 0;
    mockAcquisitions.push(
      {
        id: "ac0e8400-e29b-41d4-a716-446655440100",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2020-01-01",
        createdAt: "2020-01-01",
      },
      {
        id: "ac0e8400-e29b-41d4-a716-446655440101",
        animalId: "animal-2",
        companyId: "company-1",
        date: "2020-01-02",
        createdAt: "2020-01-02",
      }
    );
  });

  describe("getAcquisitionById", () => {
    it("should return acquisition when ID exists", () => {
      const result = getAcquisitionById("ac0e8400-e29b-41d4-a716-446655440100");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAcquisitionById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getAcquisitionByAnimalId", () => {
    it("should return acquisition for specific animal", () => {
      const result = getAcquisitionByAnimalId("animal-1");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when animal has no acquisition", () => {
      const result = getAcquisitionByAnimalId("nonexistent-animal");
      expect(result).toBeUndefined();
    });
  });

  describe("getAcquisitionsByCompanyId", () => {
    it("should return acquisitions for specific company", () => {
      const result = getAcquisitionsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((acquisition) => acquisition.companyId === "company-1")).toBe(true);
    });
  });

  describe("addAcquisition", () => {
    it("should add new acquisition", () => {
      const formData: AcquisitionFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2020-03-01",
      };

      const initialLength = mockAcquisitions.length;
      const result = addAcquisition(formData);

      expect(mockAcquisitions).toHaveLength(initialLength + 1);
      expect(result.animalId).toBe("animal-3");
    });
  });

  describe("updateAcquisition", () => {
    it("should update existing acquisition", () => {
      const result = updateAcquisition("ac0e8400-e29b-41d4-a716-446655440100", {
        date: "2020-01-15",
      });

      expect(result).toBe(true);
      const updated = mockAcquisitions.find(
        (a) => a.id === "ac0e8400-e29b-41d4-a716-446655440100"
      );
      expect(updated?.date).toBe("2020-01-15");
    });
  });

  describe("deleteAcquisition", () => {
    it("should delete existing acquisition", () => {
      const initialLength = mockAcquisitions.length;
      const result = deleteAcquisition("ac0e8400-e29b-41d4-a716-446655440100");

      expect(result).toBe(true);
      expect(mockAcquisitions).toHaveLength(initialLength - 1);
    });
  });

  describe("generateAcquisitionId", () => {
    it("should generate acquisition ID with correct format", () => {
      const result = generateAcquisitionId(0);
      expect(result).toBe("ac0e8400-e29b-41d4-a716-446655440100");
    });

    it("should generate sequential IDs", () => {
      const id1 = generateAcquisitionId(0);
      const id2 = generateAcquisitionId(1);
      expect(id1).not.toBe(id2);
    });
  });
});

