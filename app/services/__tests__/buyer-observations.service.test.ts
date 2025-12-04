import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBuyerObservationsByBuyerId,
  getBuyerObservationById,
  addBuyerObservation,
  deleteBuyerObservation,
  updateBuyerObservation,
} from "../buyer-observations.service";
import { mockBuyerObservations } from "~/mocks/buyer-observations";
import type { BuyerObservationFormData } from "~/types/buyer-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-buyer-obs"),
}));

describe("buyer-observations.service", () => {
  beforeEach(() => {
    mockBuyerObservations.length = 0;
    mockBuyerObservations.push(
      {
        id: "obs-1",
        buyerId: "buyer-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        buyerId: "buyer-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        buyerId: "buyer-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getBuyerObservationsByBuyerId", () => {
    it("should return all observations for a buyer", () => {
      const result = getBuyerObservationsByBuyerId("buyer-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when buyer has no observations", () => {
      const result = getBuyerObservationsByBuyerId("buyer-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getBuyerObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getBuyerObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBuyerObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getBuyerObservationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addBuyerObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: BuyerObservationFormData = {
        buyerId: "buyer-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockBuyerObservations.length;
      const result = addBuyerObservation(formData);

      expect(mockBuyerObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-buyer-obs");
      expect(result.buyerId).toBe("buyer-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should add observation with file IDs", () => {
      const formData: BuyerObservationFormData = {
        buyerId: "buyer-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addBuyerObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });
  });

  describe("deleteBuyerObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockBuyerObservations.length;
      const result = deleteBuyerObservation("obs-1");

      expect(result).toBe(true);
      expect(mockBuyerObservations).toHaveLength(initialLength - 1);
      expect(mockBuyerObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockBuyerObservations.length;
      const result = deleteBuyerObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockBuyerObservations).toHaveLength(initialLength);
    });
  });

  describe("updateBuyerObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<BuyerObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateBuyerObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockBuyerObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<BuyerObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateBuyerObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });
});
