import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInventoryObservationsByItemId,
  getInventoryObservationById,
  addInventoryObservation,
  updateInventoryObservation,
  deleteInventoryObservation,
} from "../inventory-observations.service";

vi.mock("~/mocks/inventory-observations", () => ({
  mockInventoryObservations: [
    {
      id: "obs-1",
      itemId: "item-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockInventoryObservations } from "~/mocks/inventory-observations";

describe("inventory-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInventoryObservationsByItemId", () => {
    it("should find observations by inventory item id", () => {
      const result = getInventoryObservationsByItemId("item-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getInventoryObservationById", () => {
    it("should find observation by id", () => {
      const result = getInventoryObservationById("obs-1");
      expect(result).toEqual(mockInventoryObservations[0]);
    });
  });

  describe("addInventoryObservation", () => {
    it("should create new observation", () => {
      const formData = {
        itemId: "item-2",
        observation: "New observation",
      };

      const result = addInventoryObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockInventoryObservations).toContain(result);
    });
  });

  describe("updateInventoryObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateInventoryObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockInventoryObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteInventoryObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockInventoryObservations.length;
      const result = deleteInventoryObservation("obs-1");

      expect(result).toBe(true);
      expect(mockInventoryObservations).toHaveLength(initialLength - 1);
    });
  });
});
