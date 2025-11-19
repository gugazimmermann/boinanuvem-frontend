import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCashFlowObservationsByCashFlowId,
  getCashFlowObservationById,
  addCashFlowObservation,
  updateCashFlowObservation,
  deleteCashFlowObservation,
} from "../cash-flow-observations.service";
import { mockCashFlowObservations } from "~/mocks/cash-flow-observations";
import type { CashFlowObservationFormData } from "~/types/cash-flow-observation";

vi.mock("~/mocks/cash-flow-observations", () => ({
  mockCashFlowObservations: [],
}));

describe("cash-flow-observations.service", () => {
  beforeEach(() => {
    mockCashFlowObservations.length = 0;
    mockCashFlowObservations.push(
      {
        id: "obs-1",
        cashFlowId: "cf-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
        createdBy: "user-1",
      },
      {
        id: "obs-2",
        cashFlowId: "cf-1",
        observation: "Test observation 2",
        fileIds: ["file-1"],
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
        createdBy: "user-1",
      },
      {
        id: "obs-3",
        cashFlowId: "cf-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2020-01-03",
        updatedAt: "2020-01-03",
        createdBy: "user-2",
      }
    );
  });

  describe("getCashFlowObservationsByCashFlowId", () => {
    it("should return observations for specific cash flow", () => {
      const result = getCashFlowObservationsByCashFlowId("cf-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.cashFlowId === "cf-1")).toBe(true);
    });

    it("should return empty array when cash flow has no observations", () => {
      const result = getCashFlowObservationsByCashFlowId("nonexistent-cf");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getCashFlowObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getCashFlowObservationById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("addCashFlowObservation", () => {
    it("should add new observation with generated ID and timestamps", () => {
      const formData: CashFlowObservationFormData = {
        cashFlowId: "cf-3",
        observation: "New observation",
        fileIds: ["file-2"],
      };

      const initialLength = mockCashFlowObservations.length;
      const result = addCashFlowObservation(formData);

      expect(mockCashFlowObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.observation).toBe("New observation");
      expect(result.cashFlowId).toBe("cf-3");
      expect(result.fileIds).toEqual(["file-2"]);
    });
  });

  describe("updateCashFlowObservation", () => {
    it("should update existing observation and update timestamp", () => {
      const originalUpdatedAt = mockCashFlowObservations[0].updatedAt;
      const result = updateCashFlowObservation("obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockCashFlowObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("should return false when observation does not exist", () => {
      const result = updateCashFlowObservation("nonexistent-id", {
        observation: "New observation",
      });
      expect(result).toBe(false);
    });
  });

  describe("deleteCashFlowObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockCashFlowObservations.length;
      const result = deleteCashFlowObservation("obs-1");

      expect(result).toBe(true);
      expect(mockCashFlowObservations).toHaveLength(initialLength - 1);
    });

    it("should return false when observation does not exist", () => {
      const initialLength = mockCashFlowObservations.length;
      const result = deleteCashFlowObservation("nonexistent-id");

      expect(result).toBe(false);
      expect(mockCashFlowObservations).toHaveLength(initialLength);
    });
  });
});
