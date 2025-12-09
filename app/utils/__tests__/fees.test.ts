import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateTotalFees, migrateLegacyFees, getTotalFees } from "../fees";
import type { Fee } from "~/types";

describe("calculateTotalFees", () => {
  it("should return 0 for empty array", () => {
    expect(calculateTotalFees([])).toBe(0);
  });

  it("should return 0 for undefined", () => {
    expect(calculateTotalFees(undefined)).toBe(0);
  });

  it("should calculate total of single fee", () => {
    const fees: Fee[] = [{ id: "1", name: "Fee 1", amount: 100 }];
    expect(calculateTotalFees(fees)).toBe(100);
  });

  it("should calculate total of multiple fees", () => {
    const fees: Fee[] = [
      { id: "1", name: "Fee 1", amount: 100 },
      { id: "2", name: "Fee 2", amount: 200 },
      { id: "3", name: "Fee 3", amount: 50 },
    ];
    expect(calculateTotalFees(fees)).toBe(350);
  });

  it("should handle negative fees", () => {
    const fees: Fee[] = [
      { id: "1", name: "Fee 1", amount: 100 },
      { id: "2", name: "Fee 2", amount: -50 },
    ];
    expect(calculateTotalFees(fees)).toBe(50);
  });

  it("should handle zero fees", () => {
    const fees: Fee[] = [
      { id: "1", name: "Fee 1", amount: 0 },
      { id: "2", name: "Fee 2", amount: 100 },
    ];
    expect(calculateTotalFees(fees)).toBe(100);
  });
});

describe("migrateLegacyFees", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return empty array when all fees are zero or undefined", () => {
    expect(migrateLegacyFees()).toEqual([]);
    expect(migrateLegacyFees(0, 0, 0)).toEqual([]);
    expect(migrateLegacyFees(undefined, undefined, undefined)).toEqual([]);
  });

  it("should migrate transportation fee", () => {
    const result = migrateLegacyFees(100, undefined, undefined);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Taxa de Transporte");
    expect(result[0].amount).toBe(100);
    expect(result[0].id).toContain("transport");
  });

  it("should migrate additional fees", () => {
    const result = migrateLegacyFees(undefined, 200, undefined);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Taxas Adicionais");
    expect(result[0].amount).toBe(200);
    expect(result[0].id).toContain("additional");
  });

  it("should migrate handling fee", () => {
    const result = migrateLegacyFees(undefined, undefined, 50);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Taxa de Manejo");
    expect(result[0].amount).toBe(50);
    expect(result[0].id).toContain("handling");
  });

  it("should migrate all fees", () => {
    const result = migrateLegacyFees(100, 200, 50);
    expect(result).toHaveLength(3);
    expect(result.find((f) => f.name === "Taxa de Transporte")?.amount).toBe(100);
    expect(result.find((f) => f.name === "Taxas Adicionais")?.amount).toBe(200);
    expect(result.find((f) => f.name === "Taxa de Manejo")?.amount).toBe(50);
  });

  it("should not include negative fees", () => {
    const result = migrateLegacyFees(-100, -200, -50);
    expect(result).toEqual([]);
  });

  it("should generate unique IDs", () => {
    const result1 = migrateLegacyFees(100, undefined, undefined);
    vi.advanceTimersByTime(1);
    const result2 = migrateLegacyFees(100, undefined, undefined);
    expect(result1[0].id).not.toBe(result2[0].id);
  });
});

describe("getTotalFees", () => {
  it("should return total from fees array when provided", () => {
    const fees: Fee[] = [
      { id: "1", name: "Fee 1", amount: 100 },
      { id: "2", name: "Fee 2", amount: 200 },
    ];
    expect(getTotalFees(fees)).toBe(300);
  });

  it("should calculate from legacy fees when fees array is empty", () => {
    expect(getTotalFees([], 100, 200, 50)).toBe(350);
  });

  it("should calculate from legacy fees when fees array is undefined", () => {
    expect(getTotalFees(undefined, 100, 200, 50)).toBe(350);
  });

  it("should prioritize fees array over legacy fees", () => {
    const fees: Fee[] = [{ id: "1", name: "Fee 1", amount: 500 }];
    expect(getTotalFees(fees, 100, 200, 50)).toBe(500);
  });

  it("should handle partial legacy fees", () => {
    expect(getTotalFees(undefined, 100, undefined, 50)).toBe(150);
    expect(getTotalFees(undefined, undefined, 200, undefined)).toBe(200);
  });

  it("should return 0 when all are empty", () => {
    expect(getTotalFees()).toBe(0);
    expect(getTotalFees([], 0, 0, 0)).toBe(0);
  });
});
