import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInventoryObservationsByItemId,
  getInventoryObservationById,
  addInventoryObservation,
  deleteInventoryObservation,
  updateInventoryObservation,
} from "../inventory-observations.service";
import { mockInventoryObservations } from "~/mocks/inventory-observations";
import type { InventoryObservationFormData } from "~/types/inventory-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-inv-obs"),
}));

describe("inventory-observations.service", () => {
  beforeEach(() => {
    mockInventoryObservations.length = 0;
    mockInventoryObservations.push(
      {
        id: "obs-1",
        itemId: "item-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        itemId: "item-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        itemId: "item-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getInventoryObservationsByItemId", () => {
    it("should return all observations for an item", () => {
      const result = getInventoryObservationsByItemId("item-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when item has no observations", () => {
      const result = getInventoryObservationsByItemId("item-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getInventoryObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getInventoryObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getInventoryObservationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addInventoryObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: InventoryObservationFormData = {
        itemId: "item-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockInventoryObservations.length;
      const result = addInventoryObservation(formData);

      expect(mockInventoryObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-inv-obs");
      expect(result.itemId).toBe("item-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should add observation with file IDs", () => {
      const formData: InventoryObservationFormData = {
        itemId: "item-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addInventoryObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });
  });

  describe("deleteInventoryObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockInventoryObservations.length;
      const result = deleteInventoryObservation("obs-1");

      expect(result).toBe(true);
      expect(mockInventoryObservations).toHaveLength(initialLength - 1);
      expect(mockInventoryObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockInventoryObservations.length;
      const result = deleteInventoryObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockInventoryObservations).toHaveLength(initialLength);
    });
  });

  describe("updateInventoryObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<InventoryObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateInventoryObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockInventoryObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<InventoryObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateInventoryObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });
});
