import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSupplierObservationsBySupplierId,
  getSupplierObservationById,
  addSupplierObservation,
  deleteSupplierObservation,
  updateSupplierObservation,
} from "../supplier-observations.service";
import { mockSupplierObservations } from "~/mocks/supplier-observations";
import type { SupplierObservationFormData } from "~/types/supplier-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-supplier-obs"),
}));

describe("supplier-observations.service", () => {
  beforeEach(() => {
    mockSupplierObservations.length = 0;
    mockSupplierObservations.push(
      {
        id: "obs-1",
        supplierId: "supplier-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        supplierId: "supplier-1",
        observation: "Test observation 2",
        fileIds: ["file-1"],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        supplierId: "supplier-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getSupplierObservationsBySupplierId", () => {
    it("should return all observations for a supplier", () => {
      const result = getSupplierObservationsBySupplierId("supplier-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("obs-1");
      expect(result[1].id).toBe("obs-2");
    });

    it("should return empty array when no observations exist for supplier", () => {
      const result = getSupplierObservationsBySupplierId("supplier-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSupplierObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getSupplierObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.supplierId).toBe("supplier-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getSupplierObservationById("obs-999");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getSupplierObservationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addSupplierObservation", () => {
    it("should add a new observation", () => {
      const newObservation: SupplierObservationFormData = {
        supplierId: "supplier-1",
        observation: "New observation",
        fileIds: ["file-2"],
      };

      const result = addSupplierObservation(newObservation);

      expect(result.id).toBe("test-uuid-supplier-obs");
      expect(result.supplierId).toBe("supplier-1");
      expect(result.observation).toBe("New observation");
      expect(result.fileIds).toEqual(["file-2"]);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockSupplierObservations).toHaveLength(4);
    });

    it("should add observation without fileIds", () => {
      const newObservation: SupplierObservationFormData = {
        supplierId: "supplier-2",
        observation: "Observation without files",
      };

      const result = addSupplierObservation(newObservation);

      expect(result.fileIds).toBeUndefined();
      expect(mockSupplierObservations).toHaveLength(4);
    });
  });

  describe("deleteSupplierObservation", () => {
    it("should delete an existing observation", () => {
      const result = deleteSupplierObservation("obs-1");
      expect(result).toBe(true);
      expect(mockSupplierObservations).toHaveLength(2);
      expect(mockSupplierObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when observation does not exist", () => {
      const result = deleteSupplierObservation("obs-999");
      expect(result).toBe(false);
      expect(mockSupplierObservations).toHaveLength(3);
    });
  });

  describe("updateSupplierObservation", () => {
    it("should update an existing observation", () => {
      const updateData: Partial<SupplierObservationFormData> = {
        observation: "Updated observation",
        fileIds: ["file-3"],
      };

      const result = updateSupplierObservation("obs-1", updateData);

      expect(result).toBe(true);
      const updated = mockSupplierObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.fileIds).toEqual(["file-3"]);
      expect(updated?.updatedAt).toBeDefined();
    });

    it("should return false when observation does not exist", () => {
      const updateData: Partial<SupplierObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateSupplierObservation("obs-999", updateData);

      expect(result).toBe(false);
    });

    it("should update only provided fields", () => {
      const original = { ...mockSupplierObservations[0] };
      const updateData: Partial<SupplierObservationFormData> = {
        observation: "Partially updated",
      };

      updateSupplierObservation("obs-1", updateData);

      const updated = mockSupplierObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Partially updated");
      expect(updated?.supplierId).toBe(original.supplierId);
      expect(updated?.fileIds).toEqual(original.fileIds);
    });
  });
});
