import { describe, it, expect } from "vitest";
import { mockWeighings } from "../weighings";
import type { Weighing } from "~/types";

describe("weighings mock", () => {
  it("should export mockWeighings array", () => {
    expect(Array.isArray(mockWeighings)).toBe(true);
    expect(mockWeighings.length).toBeGreaterThan(0);
  });

  it("should have valid weighing structure", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing).toHaveProperty("id");
      expect(weighing).toHaveProperty("animalId");
      expect(weighing).toHaveProperty("date");
      expect(weighing).toHaveProperty("weight");
      expect(weighing).toHaveProperty("createdAt");
      expect(weighing).toHaveProperty("companyId");

      expect(typeof weighing.id).toBe("string");
      expect(typeof weighing.animalId).toBe("string");
      expect(typeof weighing.date).toBe("string");
      expect(typeof weighing.weight).toBe("number");
      expect(typeof weighing.createdAt).toBe("string");
      expect(typeof weighing.companyId).toBe("string");
    });
  });

  it("should have valid date format (2020-2025)", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(weighing.date);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have realistic weights (20-1000 kg)", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing.weight).toBeGreaterThanOrEqual(20);
      expect(weighing.weight).toBeLessThanOrEqual(1000);
      expect(Number.isFinite(weighing.weight)).toBe(true);
    });
  });

  it("should have unique IDs", () => {
    const ids = mockWeighings.map((weighing) => weighing.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid weighing dates", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      const weighingDate = new Date(weighing.date);
      expect(weighingDate.toString()).not.toBe("Invalid Date");
      expect(weighingDate.getFullYear()).toBeGreaterThanOrEqual(2020);
      expect(weighingDate.getFullYear()).toBeLessThanOrEqual(2025);
    });
  });

  it("should have weighings for animals", () => {
    const uniqueAnimalIds = new Set(mockWeighings.map((w: Weighing) => w.animalId));
    expect(uniqueAnimalIds.size).toBeGreaterThan(0);
    expect(mockWeighings.length).toBeGreaterThan(0);
  });

  it("should have weighings sorted by date (most recent first)", () => {
    const animalIds = new Set(mockWeighings.map((w: Weighing) => w.animalId));

    animalIds.forEach((animalId: string) => {
      const animalWeighings = mockWeighings
        .filter((w: Weighing) => w.animalId === animalId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      for (let i = 1; i < animalWeighings.length; i++) {
        const prevDate = new Date(animalWeighings[i - 1].date);
        const currDate = new Date(animalWeighings[i].date);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });
  });

  it("should have realistic weight progression", () => {
    const animalIds = new Set(mockWeighings.map((w: Weighing) => w.animalId));

    let checkedAnimals = 0;
    let validProgressions = 0;
    animalIds.forEach((animalId: string) => {
      const animalWeighings = mockWeighings
        .filter((w: Weighing) => w.animalId === animalId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (animalWeighings.length >= 2) {
        checkedAnimals++;
        let allValid = true;
        for (let i = 1; i < animalWeighings.length; i++) {
          const prevWeight = animalWeighings[i - 1].weight;
          const currWeight = animalWeighings[i].weight;
          const prevDate = new Date(animalWeighings[i - 1].date);
          const currDate = new Date(animalWeighings[i].date);
          const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysDiff > 0) {
            const weightGain = currWeight - prevWeight;
            const dailyGain = weightGain / daysDiff;
            if (dailyGain < -2.0 || dailyGain > 5.0) {
              allValid = false;
              break;
            }
          }
        }
        if (allValid) validProgressions++;
      }
    });

    expect(checkedAnimals).toBeGreaterThan(0);
    expect(validProgressions).toBeGreaterThan(0);
  });
});
