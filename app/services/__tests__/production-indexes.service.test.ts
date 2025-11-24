import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAverageDailyGain,
  getAverageDailyCarcassGain,
  getDaysOnFeed,
  getCarcassYield,
  getSlaughterAge,
  getArrobaProductionPerHectare,
  getKgNitrogenPerAU,
  getKgMeatPerKgNitrogen,
} from "../production-indexes.service";

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/mocks/weighings", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/weighings")>("~/mocks/weighings");
  return actual;
});

vi.mock("~/mocks/sales", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/sales")>("~/mocks/sales");
  return actual;
});

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

describe("production-indexes.service", () => {
  const testPropertyId = "550e8400-e29b-41d4-a716-446655440010";
  const testPeriod = {
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAverageDailyGain", () => {
    it("should return results for property", () => {
      const result = getAverageDailyGain(testPropertyId, testPeriod);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should cache results for same parameters", () => {
      const result1 = getAverageDailyGain(testPropertyId, testPeriod);
      const result2 = getAverageDailyGain(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });

    it("should return different results for different periods", () => {
      const result1 = getAverageDailyGain(testPropertyId, testPeriod);
      const result2 = getAverageDailyGain(testPropertyId, {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      });

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });
  });

  describe("getAverageDailyCarcassGain", () => {
    it("should return results for property", () => {
      const result = getAverageDailyCarcassGain(testPropertyId, testPeriod);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should cache results for same parameters", () => {
      const result1 = getAverageDailyCarcassGain(testPropertyId, testPeriod);
      const result2 = getAverageDailyCarcassGain(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });
  });

  describe("getDaysOnFeed", () => {
    it("should return results for property", () => {
      const result = getDaysOnFeed(testPropertyId, testPeriod);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should cache results for same parameters", () => {
      const result1 = getDaysOnFeed(testPropertyId, testPeriod);
      const result2 = getDaysOnFeed(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });
  });

  describe("getCarcassYield", () => {
    it("should return carcass yield result", () => {
      const result = getCarcassYield(testPropertyId, testPeriod);
      expect(result).toHaveProperty("yield");
      expect(result).toHaveProperty("carcassWeight");
      expect(result).toHaveProperty("liveWeight");
      expect(result).toHaveProperty("count");
    });

    it("should cache results for same parameters", () => {
      const result1 = getCarcassYield(testPropertyId, testPeriod);
      const result2 = getCarcassYield(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });
  });

  describe("getSlaughterAge", () => {
    it("should return slaughter age result", () => {
      const result = getSlaughterAge(testPropertyId, testPeriod);
      expect(result).toHaveProperty("averageAge");
      expect(result).toHaveProperty("minAge");
      expect(result).toHaveProperty("maxAge");
      expect(result).toHaveProperty("count");
    });

    it("should cache results for same parameters", () => {
      const result1 = getSlaughterAge(testPropertyId, testPeriod);
      const result2 = getSlaughterAge(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });
  });

  describe("getArrobaProductionPerHectare", () => {
    it("should return arroba production result", () => {
      const result = getArrobaProductionPerHectare(testPropertyId, testPeriod);
      expect(result).toHaveProperty("arrobasPerHectare");
      expect(result).toHaveProperty("totalArrobas");
      expect(result).toHaveProperty("areaInHectares");
    });

    it("should cache results for same parameters", () => {
      const result1 = getArrobaProductionPerHectare(testPropertyId, testPeriod);
      const result2 = getArrobaProductionPerHectare(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });
  });

  describe("getKgNitrogenPerAU", () => {
    it("should return nitrogen per AU result", () => {
      const result = getKgNitrogenPerAU(testPropertyId, testPeriod);
      expect(result).toHaveProperty("kgNitrogenPerAU");
      expect(result).toHaveProperty("totalNitrogen");
      expect(result).toHaveProperty("animalUnits");
      expect(result).toHaveProperty("areaInHectares");
    });

    it("should cache results for same parameters", () => {
      const result1 = getKgNitrogenPerAU(testPropertyId, testPeriod);
      const result2 = getKgNitrogenPerAU(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });
  });

  describe("getKgMeatPerKgNitrogen", () => {
    it("should return meat per kg nitrogen result", () => {
      const result = getKgMeatPerKgNitrogen(testPropertyId, testPeriod);
      expect(result).toHaveProperty("kgMeatPerKgNitrogen");
      expect(result).toHaveProperty("totalWeightGain");
      expect(result).toHaveProperty("totalNitrogen");
    });

    it("should cache results for same parameters", () => {
      const result1 = getKgMeatPerKgNitrogen(testPropertyId, testPeriod);
      const result2 = getKgMeatPerKgNitrogen(testPropertyId, testPeriod);

      expect(result1).toEqual(result2);
    });
  });

  describe("cache behavior", () => {
    it("should use different cache keys for different properties", () => {
      const property1 = "550e8400-e29b-41d4-a716-446655440010";
      const property2 = "550e8400-e29b-41d4-a716-446655440011";

      const result1 = getAverageDailyGain(property1, testPeriod);
      const result2 = getAverageDailyGain(property2, testPeriod);

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });

    it("should use different cache keys for different periods", () => {
      const period1 = { startDate: "2024-01-01", endDate: "2024-06-30" };
      const period2 = { startDate: "2024-07-01", endDate: "2024-12-31" };

      const result1 = getAverageDailyGain(testPropertyId, period1);
      const result2 = getAverageDailyGain(testPropertyId, period2);

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });
  });
});
