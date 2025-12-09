import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCashFlowObservationsByCashFlowId,
  getCashFlowObservationById,
  addCashFlowObservation,
  updateCashFlowObservation,
  deleteCashFlowObservation,
} from "../cash-flow-observations.service";

vi.mock("~/mocks/cash-flow-observations", () => ({
  mockCashFlowObservations: [
    {
      id: "obs-1",
      cashFlowId: "cf-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockCashFlowObservations } from "~/mocks/cash-flow-observations";

describe("cash-flow-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCashFlowObservationsByCashFlowId", () => {
    it("should find observations by cash flow id", () => {
      const result = getCashFlowObservationsByCashFlowId("cf-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getCashFlowObservationById", () => {
    it("should find observation by id", () => {
      const result = getCashFlowObservationById("obs-1");
      expect(result).toEqual(mockCashFlowObservations[0]);
    });
  });

  describe("addCashFlowObservation", () => {
    it("should create new observation", () => {
      const formData = {
        cashFlowId: "cf-2",
        observation: "New observation",
      };

      const result = addCashFlowObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockCashFlowObservations).toContain(result);
    });
  });

  describe("updateCashFlowObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateCashFlowObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockCashFlowObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteCashFlowObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockCashFlowObservations.length;
      const result = deleteCashFlowObservation("obs-1");

      expect(result).toBe(true);
      expect(mockCashFlowObservations).toHaveLength(initialLength - 1);
    });
  });
});
