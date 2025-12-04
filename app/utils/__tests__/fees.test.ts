import { describe, it, expect } from "vitest";
import { calculateTotalFees, migrateLegacyFees, getTotalFees } from "../fees";
import type { Fee } from "~/types";

describe("fees", () => {
  describe("calculateTotalFees", () => {
    it("should return 0 for empty array", () => {
      expect(calculateTotalFees([])).toBe(0);
    });

    it("should return 0 for undefined", () => {
      expect(calculateTotalFees(undefined)).toBe(0);
    });

    it("should calculate total for single fee", () => {
      const fees: Fee[] = [{ id: "1", name: "Fee 1", amount: 100 }];
      expect(calculateTotalFees(fees)).toBe(100);
    });

    it("should calculate total for multiple fees", () => {
      const fees: Fee[] = [
        { id: "1", name: "Fee 1", amount: 100 },
        { id: "2", name: "Fee 2", amount: 50 },
        { id: "3", name: "Fee 3", amount: 25 },
      ];
      expect(calculateTotalFees(fees)).toBe(175);
    });

    it("should handle negative amounts", () => {
      const fees: Fee[] = [
        { id: "1", name: "Fee 1", amount: 100 },
        { id: "2", name: "Fee 2", amount: -50 },
      ];
      expect(calculateTotalFees(fees)).toBe(50);
    });
  });

  describe("migrateLegacyFees", () => {
    it("should return empty array when all fees are zero or undefined", () => {
      expect(migrateLegacyFees()).toEqual([]);
      expect(migrateLegacyFees(0, 0, 0)).toEqual([]);
      expect(migrateLegacyFees(undefined, undefined, undefined)).toEqual([]);
    });

    it("should migrate transportation fee", () => {
      const fees = migrateLegacyFees(100, undefined, undefined);
      expect(fees).toHaveLength(1);
      expect(fees[0].name).toBe("Taxa de Transporte");
      expect(fees[0].amount).toBe(100);
      expect(fees[0].id).toContain("transport");
    });

    it("should migrate additional fees", () => {
      const fees = migrateLegacyFees(undefined, 50, undefined);
      expect(fees).toHaveLength(1);
      expect(fees[0].name).toBe("Taxas Adicionais");
      expect(fees[0].amount).toBe(50);
      expect(fees[0].id).toContain("additional");
    });

    it("should migrate handling fee", () => {
      const fees = migrateLegacyFees(undefined, undefined, 25);
      expect(fees).toHaveLength(1);
      expect(fees[0].name).toBe("Taxa de Manejo");
      expect(fees[0].amount).toBe(25);
      expect(fees[0].id).toContain("handling");
    });

    it("should migrate all fees", () => {
      const fees = migrateLegacyFees(100, 50, 25);
      expect(fees).toHaveLength(3);
      expect(fees.find((f) => f.name === "Taxa de Transporte")?.amount).toBe(100);
      expect(fees.find((f) => f.name === "Taxas Adicionais")?.amount).toBe(50);
      expect(fees.find((f) => f.name === "Taxa de Manejo")?.amount).toBe(25);
    });

    it("should not include zero fees", () => {
      const fees = migrateLegacyFees(100, 0, 25);
      expect(fees).toHaveLength(2);
      expect(fees.find((f) => f.name === "Taxas Adicionais")).toBeUndefined();
    });
  });

  describe("getTotalFees", () => {
    it("should return total from fees array when provided", () => {
      const fees: Fee[] = [
        { id: "1", name: "Fee 1", amount: 100 },
        { id: "2", name: "Fee 2", amount: 50 },
      ];
      expect(getTotalFees(fees)).toBe(150);
    });

    it("should calculate from legacy fees when fees array is empty", () => {
      expect(getTotalFees(undefined, 100, 50, 25)).toBe(175);
    });

    it("should calculate from legacy fees when fees array is undefined", () => {
      expect(getTotalFees(undefined, 100, 50, 25)).toBe(175);
    });

    it("should prioritize fees array over legacy fees", () => {
      const fees: Fee[] = [{ id: "1", name: "Fee 1", amount: 200 }];
      expect(getTotalFees(fees, 100, 50, 25)).toBe(200);
    });

    it("should return 0 when all are empty", () => {
      expect(getTotalFees()).toBe(0);
      expect(getTotalFees(undefined, undefined, undefined, undefined)).toBe(0);
    });

    it("should handle partial legacy fees", () => {
      expect(getTotalFees(undefined, 100, undefined, 25)).toBe(125);
      expect(getTotalFees(undefined, undefined, 50, undefined)).toBe(50);
    });
  });
});
