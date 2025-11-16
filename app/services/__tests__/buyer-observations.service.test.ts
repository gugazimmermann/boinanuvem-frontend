import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBuyerObservationsByBuyerId,
  getBuyerObservationById,
  addBuyerObservation,
  updateBuyerObservation,
  deleteBuyerObservation,
} from "../buyer-observations.service";
import { mockBuyerObservations } from "~/mocks/buyer-observations";
import type { BuyerObservationFormData } from "~/types/buyer-observation";

vi.mock("~/mocks/buyer-observations", () => ({
  mockBuyerObservations: [],
}));

describe("buyer-observations.service", () => {
  beforeEach(() => {
    mockBuyerObservations.length = 0;
    mockBuyerObservations.push(
      {
        id: "buy-obs-1",
        buyerId: "buyer-1",
        observation: "Buyer observation 1",
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
      },
      {
        id: "buy-obs-2",
        buyerId: "buyer-1",
        observation: "Buyer observation 2",
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
      }
    );
  });

  describe("getBuyerObservationsByBuyerId", () => {
    it("should return observations for specific buyer", () => {
      const result = getBuyerObservationsByBuyerId("buyer-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.buyerId === "buyer-1")).toBe(true);
    });
  });

  describe("getBuyerObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getBuyerObservationById("buy-obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("buy-obs-1");
    });
  });

  describe("addBuyerObservation", () => {
    it("should add new observation", () => {
      const formData: BuyerObservationFormData = {
        buyerId: "buyer-2",
        observation: "New buyer observation",
      };

      const initialLength = mockBuyerObservations.length;
      const result = addBuyerObservation(formData);

      expect(mockBuyerObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
    });
  });

  describe("updateBuyerObservation", () => {
    it("should update existing observation", () => {
      const result = updateBuyerObservation("buy-obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockBuyerObservations.find((obs) => obs.id === "buy-obs-1");
      expect(updated?.observation).toBe("Updated observation");
    });
  });

  describe("deleteBuyerObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockBuyerObservations.length;
      const result = deleteBuyerObservation("buy-obs-1");

      expect(result).toBe(true);
      expect(mockBuyerObservations).toHaveLength(initialLength - 1);
    });
  });
});
