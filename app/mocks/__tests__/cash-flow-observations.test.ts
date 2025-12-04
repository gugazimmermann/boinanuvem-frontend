import { describe, it, expect } from "vitest";
import { mockCashFlowObservations } from "../cash-flow-observations";
import { mockCashFlow } from "../cash-flow";

describe("cash-flow-observations", () => {
  describe("mockCashFlowObservations", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockCashFlowObservations)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockCashFlowObservations.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockCashFlowObservations.forEach((observation) => {
        expect(observation).toHaveProperty("id");
        expect(observation).toHaveProperty("cashFlowId");
        expect(observation).toHaveProperty("observation");
        expect(observation).toHaveProperty("createdAt");
        expect(observation).toHaveProperty("createdBy");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockCashFlowObservations.map((o) => o.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockCashFlowObservations.forEach((observation) => {
        expect(observation.id).toMatch(uuidRegex);
      });
    });

    it("should have valid ISO date format for createdAt", () => {
      mockCashFlowObservations.forEach((observation) => {
        expect(typeof observation.createdAt).toBe("string");
        expect(new Date(observation.createdAt).getTime()).not.toBeNaN();
      });
    });

    it("should have dates within expected range", () => {
      mockCashFlowObservations.forEach((observation) => {
        const date = new Date(observation.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should reference valid cash flow IDs", () => {
      const cashFlowIds = mockCashFlow.map((cf) => cf.id);
      mockCashFlowObservations.forEach((observation) => {
        expect(cashFlowIds).toContain(observation.cashFlowId);
      });
    });

    it("should have valid observation text", () => {
      mockCashFlowObservations.forEach((observation) => {
        expect(typeof observation.observation).toBe("string");
        expect(observation.observation.length).toBeGreaterThan(0);
      });
    });

    it("should have valid fileIds array when present", () => {
      mockCashFlowObservations.forEach((observation) => {
        if (observation.fileIds) {
          expect(Array.isArray(observation.fileIds)).toBe(true);
        }
      });
    });
  });
});
