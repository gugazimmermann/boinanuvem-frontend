import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSupplierObservationsBySupplierId,
  getSupplierObservationById,
  addSupplierObservation,
  updateSupplierObservation,
  deleteSupplierObservation,
} from "../supplier-observations.service";

vi.mock("~/mocks/supplier-observations", () => ({
  mockSupplierObservations: [
    {
      id: "obs-1",
      supplierId: "supplier-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockSupplierObservations } from "~/mocks/supplier-observations";

describe("supplier-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSupplierObservationsBySupplierId", () => {
    it("should find observations by supplier id", () => {
      const result = getSupplierObservationsBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getSupplierObservationById", () => {
    it("should find observation by id", () => {
      const result = getSupplierObservationById("obs-1");
      expect(result).toEqual(mockSupplierObservations[0]);
    });
  });

  describe("addSupplierObservation", () => {
    it("should create new observation", () => {
      const formData = {
        supplierId: "supplier-2",
        observation: "New observation",
      };

      const result = addSupplierObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockSupplierObservations).toContain(result);
    });
  });

  describe("updateSupplierObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateSupplierObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockSupplierObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteSupplierObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockSupplierObservations.length;
      const result = deleteSupplierObservation("obs-1");

      expect(result).toBe(true);
      expect(mockSupplierObservations).toHaveLength(initialLength - 1);
    });
  });
});
