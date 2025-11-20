import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInventoryObservationsByItemId,
  getInventoryObservationById,
  addInventoryObservation,
  updateInventoryObservation,
  deleteInventoryObservation,
} from "../inventory-observations.service";
import { mockInventoryObservations } from "~/mocks/inventory-observations";
import type { InventoryObservationFormData } from "~/types/inventory-observation";

vi.mock("~/mocks/inventory-observations", () => ({
  mockInventoryObservations: [],
}));

describe("inventory-observations.service", () => {
  beforeEach(() => {
    mockInventoryObservations.length = 0;
    mockInventoryObservations.push(
      {
        id: "inv-obs-1",
        itemId: "item-1",
        observation: "Inventory observation 1",
        fileIds: ["file-1"],
        createdAt: "2020-01-01T10:00:00Z",
        updatedAt: "2020-01-01T10:00:00Z",
        createdBy: "user-1",
      },
      {
        id: "inv-obs-2",
        itemId: "item-1",
        observation: "Inventory observation 2",
        fileIds: ["file-2", "file-3"],
        createdAt: "2020-01-02T10:00:00Z",
        updatedAt: "2020-01-02T10:00:00Z",
        createdBy: "user-1",
      },
      {
        id: "inv-obs-3",
        itemId: "item-2",
        observation: "Inventory observation 3",
        fileIds: [],
        createdAt: "2020-01-03T10:00:00Z",
        updatedAt: "2020-01-03T10:00:00Z",
        createdBy: "user-2",
      }
    );
  });

  describe("getInventoryObservationsByItemId", () => {
    it("should return observations for specific item", () => {
      const result = getInventoryObservationsByItemId("item-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.itemId === "item-1")).toBe(true);
    });

    it("should return empty array when item has no observations", () => {
      const result = getInventoryObservationsByItemId("nonexistent-item");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getInventoryObservationById("inv-obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("inv-obs-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getInventoryObservationById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("addInventoryObservation", () => {
    it("should add new observation with generated ID", () => {
      const formData: InventoryObservationFormData = {
        itemId: "item-3",
        observation: "New inventory observation",
        fileIds: ["file-4"],
      };

      const initialLength = mockInventoryObservations.length;
      const result = addInventoryObservation(formData);

      expect(mockInventoryObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.observation).toBe("New inventory observation");
      expect(result.itemId).toBe("item-3");
      expect(result.fileIds).toEqual(["file-4"]);
    });

    it("should add observation without fileIds when not provided", () => {
      const formData: InventoryObservationFormData = {
        itemId: "item-3",
        observation: "New observation without files",
      };

      const result = addInventoryObservation(formData);
      expect(result.fileIds).toBeUndefined();
    });
  });

  describe("updateInventoryObservation", () => {
    it("should update existing observation and update timestamp", () => {
      const originalUpdatedAt = mockInventoryObservations[0].updatedAt;
      const result = updateInventoryObservation("inv-obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockInventoryObservations.find((obs) => obs.id === "inv-obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("should return false when observation does not exist", () => {
      const result = updateInventoryObservation("nonexistent-id", {
        observation: "New observation",
      });
      expect(result).toBe(false);
    });
  });

  describe("deleteInventoryObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockInventoryObservations.length;
      const result = deleteInventoryObservation("inv-obs-1");

      expect(result).toBe(true);
      expect(mockInventoryObservations).toHaveLength(initialLength - 1);
      expect(mockInventoryObservations.find((obs) => obs.id === "inv-obs-1")).toBeUndefined();
    });

    it("should return false when observation does not exist", () => {
      const result = deleteInventoryObservation("nonexistent-id");
      expect(result).toBe(false);
    });
  });
});
