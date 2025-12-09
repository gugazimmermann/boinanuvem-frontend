import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBuyerObservationsByBuyerId,
  getBuyerObservationById,
  addBuyerObservation,
  updateBuyerObservation,
  deleteBuyerObservation,
} from "../buyer-observations.service";

vi.mock("~/mocks/buyer-observations", () => ({
  mockBuyerObservations: [
    {
      id: "obs-1",
      buyerId: "buyer-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockBuyerObservations } from "~/mocks/buyer-observations";

describe("buyer-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBuyerObservationsByBuyerId", () => {
    it("should find observations by buyer id", () => {
      const result = getBuyerObservationsByBuyerId("buyer-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getBuyerObservationById", () => {
    it("should find observation by id", () => {
      const result = getBuyerObservationById("obs-1");
      expect(result).toEqual(mockBuyerObservations[0]);
    });
  });

  describe("addBuyerObservation", () => {
    it("should create new observation", () => {
      const formData = {
        buyerId: "buyer-2",
        observation: "New observation",
      };

      const result = addBuyerObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockBuyerObservations).toContain(result);
    });
  });

  describe("updateBuyerObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateBuyerObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockBuyerObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteBuyerObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockBuyerObservations.length;
      const result = deleteBuyerObservation("obs-1");

      expect(result).toBe(true);
      expect(mockBuyerObservations).toHaveLength(initialLength - 1);
    });
  });
});
