import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSupplierObservationsBySupplierId,
  getSupplierObservationById,
  addSupplierObservation,
  updateSupplierObservation,
  deleteSupplierObservation,
} from "../supplier-observations.service";
import { mockSupplierObservations } from "~/mocks/supplier-observations";
import type { SupplierObservationFormData } from "~/types/supplier-observation";

vi.mock("~/mocks/supplier-observations", () => ({
  mockSupplierObservations: [],
}));

describe("supplier-observations.service", () => {
  beforeEach(() => {
    mockSupplierObservations.length = 0;
    mockSupplierObservations.push(
      {
        id: "sup-obs-1",
        supplierId: "supplier-1",
        observation: "Supplier observation 1",
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
      },
      {
        id: "sup-obs-2",
        supplierId: "supplier-1",
        observation: "Supplier observation 2",
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
      }
    );
  });

  describe("getSupplierObservationsBySupplierId", () => {
    it("should return observations for specific supplier", () => {
      const result = getSupplierObservationsBySupplierId("supplier-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.supplierId === "supplier-1")).toBe(true);
    });
  });

  describe("getSupplierObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getSupplierObservationById("sup-obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("sup-obs-1");
    });
  });

  describe("addSupplierObservation", () => {
    it("should add new observation", () => {
      const formData: SupplierObservationFormData = {
        supplierId: "supplier-2",
        observation: "New supplier observation",
      };

      const initialLength = mockSupplierObservations.length;
      const result = addSupplierObservation(formData);

      expect(mockSupplierObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
    });
  });

  describe("updateSupplierObservation", () => {
    it("should update existing observation", () => {
      const result = updateSupplierObservation("sup-obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockSupplierObservations.find((obs) => obs.id === "sup-obs-1");
      expect(updated?.observation).toBe("Updated observation");
    });
  });

  describe("deleteSupplierObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockSupplierObservations.length;
      const result = deleteSupplierObservation("sup-obs-1");

      expect(result).toBe(true);
      expect(mockSupplierObservations).toHaveLength(initialLength - 1);
    });
  });
});

