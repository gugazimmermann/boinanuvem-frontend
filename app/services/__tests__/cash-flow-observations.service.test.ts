import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCashFlowObservationsByCashFlowId,
  getCashFlowObservationById,
  addCashFlowObservation,
  deleteCashFlowObservation,
  updateCashFlowObservation,
} from "../cash-flow-observations.service";
import { mockCashFlowObservations } from "~/mocks/cash-flow-observations";
import type { CashFlowObservationFormData } from "~/types/cash-flow-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-cf-obs"),
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
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        cashFlowId: "cf-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        cashFlowId: "cf-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getCashFlowObservationsByCashFlowId", () => {
    it("should return all observations for a cash flow", () => {
      const result = getCashFlowObservationsByCashFlowId("cf-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when cash flow has no observations", () => {
      const result = getCashFlowObservationsByCashFlowId("cf-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getCashFlowObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getCashFlowObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getCashFlowObservationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addCashFlowObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: CashFlowObservationFormData = {
        cashFlowId: "cf-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockCashFlowObservations.length;
      const result = addCashFlowObservation(formData);

      expect(mockCashFlowObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-cf-obs");
      expect(result.cashFlowId).toBe("cf-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should add observation with file IDs", () => {
      const formData: CashFlowObservationFormData = {
        cashFlowId: "cf-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addCashFlowObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });
  });

  describe("deleteCashFlowObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockCashFlowObservations.length;
      const result = deleteCashFlowObservation("obs-1");

      expect(result).toBe(true);
      expect(mockCashFlowObservations).toHaveLength(initialLength - 1);
      expect(mockCashFlowObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockCashFlowObservations.length;
      const result = deleteCashFlowObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockCashFlowObservations).toHaveLength(initialLength);
    });
  });

  describe("updateCashFlowObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<CashFlowObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateCashFlowObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockCashFlowObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<CashFlowObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateCashFlowObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });
});
