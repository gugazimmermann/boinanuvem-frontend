import { describe, it, expect } from "vitest";
import {
  mockSupplierObservations,
  getSupplierObservationsBySupplierId,
  getSupplierObservationById,
  addSupplierObservation,
  deleteSupplierObservation,
  updateSupplierObservation,
} from "../supplier-observations";
import type { SupplierObservationFormData } from "~/types/supplier-observation";

describe("Supplier Observations Mock Functions", () => {
  const SUPPLIER_ID = "990e8400-e29b-41d4-a716-446655440010";

  describe("getSupplierObservationsBySupplierId", () => {
    it("should return observations for a supplier", () => {
      const observations = getSupplierObservationsBySupplierId(SUPPLIER_ID);
      expect(Array.isArray(observations)).toBe(true);
      observations.forEach((obs) => {
        expect(obs.supplierId).toBe(SUPPLIER_ID);
      });
    });

    it("should return empty array for non-existent supplier", () => {
      const observations = getSupplierObservationsBySupplierId("non-existent-supplier");
      expect(observations).toEqual([]);
    });
  });

  describe("getSupplierObservationById", () => {
    it("should return observation by id", () => {
      if (mockSupplierObservations.length > 0) {
        const observation = getSupplierObservationById(mockSupplierObservations[0].id);
        expect(observation).toBeDefined();
        expect(observation?.id).toBe(mockSupplierObservations[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const observation = getSupplierObservationById("non-existent-id");
      expect(observation).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const observation = getSupplierObservationById(undefined);
      expect(observation).toBeUndefined();
    });
  });

  describe("addSupplierObservation", () => {
    it("should add a new observation", () => {
      const initialCount = mockSupplierObservations.length;
      const newObservationData: SupplierObservationFormData = {
        supplierId: SUPPLIER_ID,
        observation: "Test observation",
        fileIds: ["file-1"],
        createdBy: "user-001",
      };

      const added = addSupplierObservation(newObservationData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
      expect(added.supplierId).toBe(newObservationData.supplierId);
      expect(mockSupplierObservations.length).toBe(initialCount + 1);
    });
  });

  describe("deleteSupplierObservation", () => {
    it("should delete an observation by id", () => {
      const newObservationData: SupplierObservationFormData = {
        supplierId: SUPPLIER_ID,
        observation: "Delete test",
        createdBy: "user-001",
      };

      const added = addSupplierObservation(newObservationData);
      const initialCount = mockSupplierObservations.length;
      const deleted = deleteSupplierObservation(added.id);

      expect(deleted).toBe(true);
      expect(mockSupplierObservations.length).toBe(initialCount - 1);
      expect(getSupplierObservationById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteSupplierObservation("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateSupplierObservation", () => {
    it("should update an observation", () => {
      const newObservationData: SupplierObservationFormData = {
        supplierId: SUPPLIER_ID,
        observation: "Update test",
        createdBy: "user-001",
      };

      const added = addSupplierObservation(newObservationData);
      const updated = updateSupplierObservation(added.id, {
        observation: "Updated observation",
      });

      expect(updated).toBe(true);
      const observation = getSupplierObservationById(added.id);
      expect(observation?.observation).toBe("Updated observation");
      expect(observation?.updatedAt).toBeDefined();
    });

    it("should return false for non-existent id", () => {
      const updated = updateSupplierObservation("non-existent-id", {
        observation: "Test",
      });
      expect(updated).toBe(false);
    });
  });
});

