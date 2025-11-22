import { describe, it, expect } from "vitest";
import { calculateTotalFees, migrateLegacyFees, getTotalFees } from "../fees";
import type { Fee } from "~/types";

describe("fees utility", () => {
  describe("calculateTotalFees", () => {
    it("should return 0 for empty array", () => {
      expect(calculateTotalFees([])).toBe(0);
    });

    it("should return 0 for undefined", () => {
      expect(calculateTotalFees(undefined)).toBe(0);
    });

    it("should calculate total from fees array", () => {
      const fees: Fee[] = [
        { id: "fee-1", name: "Transport", amount: 100 },
        { id: "fee-2", name: "Handling", amount: 50 },
        { id: "fee-3", name: "Insurance", amount: 25 },
      ];
      expect(calculateTotalFees(fees)).toBe(175);
    });

    it("should handle zero amounts", () => {
      const fees: Fee[] = [
        { id: "fee-1", name: "Transport", amount: 0 },
        { id: "fee-2", name: "Handling", amount: 50 },
      ];
      expect(calculateTotalFees(fees)).toBe(50);
    });

    it("should handle negative amounts", () => {
      const fees: Fee[] = [
        { id: "fee-1", name: "Discount", amount: -20 },
        { id: "fee-2", name: "Fee", amount: 50 },
      ];
      expect(calculateTotalFees(fees)).toBe(30);
    });
  });

  describe("migrateLegacyFees", () => {
    it("should return empty array when no legacy fees", () => {
      expect(migrateLegacyFees()).toEqual([]);
      expect(migrateLegacyFees(undefined, undefined, undefined)).toEqual([]);
    });

    it("should migrate transportation fee", () => {
      const result = migrateLegacyFees(100);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Taxa de Transporte");
      expect(result[0].amount).toBe(100);
      expect(result[0].id).toContain("transport");
    });

    it("should migrate additional fees", () => {
      const result = migrateLegacyFees(undefined, 50);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Taxas Adicionais");
      expect(result[0].amount).toBe(50);
      expect(result[0].id).toContain("additional");
    });

    it("should migrate handling fee", () => {
      const result = migrateLegacyFees(undefined, undefined, 75);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Taxa de Manejo");
      expect(result[0].amount).toBe(75);
      expect(result[0].id).toContain("handling");
    });

    it("should migrate all legacy fees", () => {
      const result = migrateLegacyFees(100, 50, 25);
      expect(result).toHaveLength(3);
      expect(result.find((f) => f.name === "Taxa de Transporte")?.amount).toBe(100);
      expect(result.find((f) => f.name === "Taxas Adicionais")?.amount).toBe(50);
      expect(result.find((f) => f.name === "Taxa de Manejo")?.amount).toBe(25);
    });

    it("should ignore zero values", () => {
      const result = migrateLegacyFees(0, 0, 0);
      expect(result).toEqual([]);
    });
  });

  describe("getTotalFees", () => {
    it("should use fees array when available", () => {
      const fees: Fee[] = [
        { id: "fee-1", name: "Transport", amount: 100 },
        { id: "fee-2", name: "Handling", amount: 50 },
      ];
      expect(getTotalFees(fees, 200, 100, 75)).toBe(150);
    });

    it("should fall back to legacy fields when fees array is empty", () => {
      expect(getTotalFees([], 100, 50, 25)).toBe(175);
      expect(getTotalFees(undefined, 100, 50, 25)).toBe(175);
    });

    it("should use legacy fields when fees array is undefined", () => {
      expect(getTotalFees(undefined, 100, 50)).toBe(150);
      expect(getTotalFees(undefined, 100, undefined, 25)).toBe(125);
    });

    it("should return 0 when no fees provided", () => {
      expect(getTotalFees()).toBe(0);
      expect(getTotalFees([], undefined, undefined, undefined)).toBe(0);
    });

    it("should handle mixed scenarios", () => {
      const fees: Fee[] = [{ id: "fee-1", name: "Custom", amount: 30 }];

      expect(getTotalFees(fees, 100, 50, 25)).toBe(30);
    });

    it("should handle sales fees (no handling fee)", () => {
      const fees: Fee[] = [{ id: "fee-1", name: "Transport", amount: 100 }];
      expect(getTotalFees(fees, 200, 50)).toBe(100);
      expect(getTotalFees(undefined, 200, 50)).toBe(250);
    });

    it("should handle acquisition fees (no additional fees)", () => {
      const fees: Fee[] = [{ id: "fee-1", name: "Transport", amount: 100 }];
      expect(getTotalFees(fees, 200, undefined, 50)).toBe(100);
      expect(getTotalFees(undefined, 200, undefined, 50)).toBe(250);
    });
  });
});
