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

vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn(),
  getAnimalById: vi.fn(),
}));

vi.mock("../weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(),
}));

vi.mock("../sales.service", () => ({
  getSalesByCompanyId: vi.fn(),
  getSalesByAnimalId: vi.fn(() => []),
}));

vi.mock("../births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("../properties.service", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("../locations.service", () => ({
  getLocations: vi.fn(),
}));

vi.mock("../animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: vi.fn(),
}));

vi.mock("../inventory-movements.service", () => ({
  getMovementsByPropertyId: vi.fn(),
}));

vi.mock("../nitrogen-content.service", () => ({
  hasNitrogenContent: vi.fn(),
  getNitrogenContent: vi.fn(),
}));

import { getAnimalsByPropertyId, getAnimalById } from "../animals.service";
import { getWeighingsByAnimalId } from "../weighings.service";
import { getSalesByCompanyId, getSalesByAnimalId } from "../sales.service";
import { getPropertyById } from "../properties.service";
import { getLocations } from "../locations.service";
import { getAnimalMovementsByAnimalId } from "../animal-movements.service";
import { getMovementsByPropertyId } from "../inventory-movements.service";
import { hasNitrogenContent, getNitrogenContent } from "../nitrogen-content.service";
import { getBirthByAnimalId } from "../births.service";
import { AreaType, LocationType, InventoryMovementType } from "~/types";

describe("production-indexes.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAverageDailyGain", () => {
    beforeEach(() => {
      // Reset all mocks between tests
      vi.clearAllMocks();
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      getAnimals.mockReset();
      getWeighings.mockReset();
    });

    it("should calculate ADG for animals with multiple weighings", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);

      const result = getAverageDailyGain("property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].adg).toBeGreaterThan(0);
    });

    it("should return empty array when less than 2 weighings", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
      ]);

      // Use a different property ID to avoid cache
      const result = getAverageDailyGain("property-2");
      expect(result).toEqual([]);
    });

    it("should use cache for subsequent calls", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);

      getAverageDailyGain("property-1");
      vi.clearAllMocks();

      getAverageDailyGain("property-1");
      expect(getWeighings).not.toHaveBeenCalled();
    });

    it("should filter weighings by period", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-20", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-10", weight: 450 },
        { id: "w3", animalId: "animal-1", date: "2024-03-01", weight: 500 },
      ]);

      const result = getAverageDailyGain("property-period-filter", {
        startDate: "2024-01-15",
        endDate: "2024-02-15",
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return empty array when no animals", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      getAnimals.mockReturnValue([]);

      const result = getAverageDailyGain("property-4");
      expect(result).toEqual([]);
    });

    it("should skip animals with days <= 0", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-01-01", weight: 450 }, // Same date
      ]);

      const result = getAverageDailyGain("property-5");
      expect(result).toEqual([]);
    });

    it("should handle multiple animals", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([
        { id: "animal-1", code: "001", companyId: "company-1" },
        { id: "animal-2", code: "002", companyId: "company-1" },
      ]);
      getWeighings.mockImplementation((animalId: string) => {
        if (animalId === "animal-1") {
          return [
            { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
            { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
          ];
        }
        return [
          { id: "w3", animalId: "animal-2", date: "2024-01-01", weight: 500 },
          { id: "w4", animalId: "animal-2", date: "2024-02-01", weight: 550 },
        ];
      });

      const result = getAverageDailyGain("property-6");
      expect(result.length).toBe(2);
    });
  });

  describe("getAverageDailyCarcassGain", () => {
    it("should calculate ADC using ADG and carcass yield", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);

      const result = getAverageDailyCarcassGain("property-7", undefined, 50);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].carcassYield).toBe(50);
    });

    it("should handle zero carcass yield", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);
      getSales.mockReturnValue([]);

      const result = getAverageDailyCarcassGain("property-7a", undefined, 0);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].carcassYield).toBe(0);
      expect(result[0].adc).toBe(0);
    });

    it("should handle null carcass yield by calculating from sales", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-7b",
          saleItems: [{ animalId: "animal-1", weight: 500, carcassWeight: 250 }],
        },
      ]);

      const result = getAverageDailyCarcassGain("property-7b", undefined, undefined);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should calculate carcass yield when not provided", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-8",
          saleItems: [{ animalId: "animal-1", weight: 500, carcassWeight: 300 }],
        },
      ]);

      const result = getAverageDailyCarcassGain("property-8");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle period filtering", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);

      const result = getAverageDailyCarcassGain(
        "property-9",
        {
          startDate: "2024-01-01",
          endDate: "2024-02-01",
        },
        50
      );
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getDaysOnFeed", () => {
    it("should calculate days on feed", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      const getLocs = getLocations as ReturnType<typeof vi.fn>;
      const getSalesByAnimal = getSalesByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-01",
          companyId: "company-1",
          propertyId: "property-1",
        },
        {
          id: "movement-2",
          animalIds: ["animal-1"],
          locationId: "location-2",
          date: "2024-02-01",
          companyId: "company-1",
          propertyId: "property-1",
        },
      ]);
      getLocs.mockResolvedValue([
        {
          id: "location-1",
          propertyId: "property-1",
          locationType: LocationType.FEEDLOT,
        },
        {
          id: "location-2",
          propertyId: "property-1",
          locationType: LocationType.PASTURE,
        },
      ]);
      getSalesByAnimal.mockReturnValue([]);

      const result = await getDaysOnFeed("property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].days).toBeGreaterThan(0);
    });

    it("should handle entry with exit from sales", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      const getLocs = getLocations as ReturnType<typeof vi.fn>;
      const getSalesByAnimal = getSalesByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-01",
          companyId: "company-1",
          propertyId: "property-1a",
        },
      ]);
      getLocs.mockResolvedValue([
        {
          id: "location-1",
          propertyId: "property-1a",
          locationType: LocationType.FEEDLOT,
        },
      ]);
      getSalesByAnimal.mockReturnValue([
        {
          id: "sale-1",
          saleDate: "2024-02-15",
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
      ]);

      const result = await getDaysOnFeed("property-1a");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle semi-feedlot location type", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      const getLocs = getLocations as ReturnType<typeof vi.fn>;
      const getSalesByAnimal = getSalesByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-01",
          companyId: "company-1",
          propertyId: "property-1",
        },
        {
          id: "movement-2",
          animalIds: ["animal-1"],
          locationId: "location-2",
          date: "2024-02-01",
          companyId: "company-1",
          propertyId: "property-1",
        },
      ]);
      getLocs.mockResolvedValue([
        {
          id: "location-1",
          propertyId: "property-1b",
          locationType: LocationType.SEMI_FEEDLOT,
        },
        {
          id: "location-2",
          propertyId: "property-1b",
          locationType: LocationType.PASTURE,
        },
      ]);
      getSalesByAnimal.mockReturnValue([]);

      const result = await getDaysOnFeed("property-1b");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle corral location type", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      const getLocs = getLocations as ReturnType<typeof vi.fn>;
      const getSalesByAnimal = getSalesByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-01",
          companyId: "company-1",
          propertyId: "property-1",
        },
        {
          id: "movement-2",
          animalIds: ["animal-1"],
          locationId: "location-2",
          date: "2024-02-01",
          companyId: "company-1",
          propertyId: "property-1",
        },
      ]);
      getLocs.mockResolvedValue([
        {
          id: "location-1",
          propertyId: "property-1c",
          locationType: LocationType.CORRAL,
        },
        {
          id: "location-2",
          propertyId: "property-1c",
          locationType: LocationType.PASTURE,
        },
      ]);
      getSalesByAnimal.mockReturnValue([]);

      const result = await getDaysOnFeed("property-1c");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should filter by period", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      const getLocs = getLocations as ReturnType<typeof vi.fn>;
      const getSalesByAnimal = getSalesByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-01",
          companyId: "company-1",
          propertyId: "property-1d",
        },
        {
          id: "movement-2",
          animalIds: ["animal-1"],
          locationId: "location-2",
          date: "2024-03-01",
          companyId: "company-1",
          propertyId: "property-1d",
        },
      ]);
      getLocs.mockResolvedValue([
        {
          id: "location-1",
          propertyId: "property-1d",
          locationType: LocationType.FEEDLOT,
        },
        {
          id: "location-2",
          propertyId: "property-1d",
          locationType: LocationType.PASTURE,
        },
      ]);
      getSalesByAnimal.mockReturnValue([]);

      const result = await getDaysOnFeed("property-1d", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result).toBeDefined();
    });

    it("should return empty array when no movements", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      const getLocs = getLocations as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getMovements.mockReturnValue([]);
      getLocs.mockResolvedValue([]);

      const result = await getDaysOnFeed("property-1e");
      expect(result).toEqual([]);
    });

    it("should return empty array when no entry date", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      const getLocs = getLocations as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-01",
          companyId: "company-1",
          propertyId: "property-1b",
        },
      ]);
      getLocs.mockResolvedValue([
        {
          id: "location-1",
          propertyId: "property-1f",
          locationType: LocationType.PASTURE,
        },
      ]);

      const result = await getDaysOnFeed("property-1f");
      expect(result).toEqual([]);
    });
  });

  describe("getCarcassYield", () => {
    it("should calculate carcass yield", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1",
          saleItems: [
            {
              animalId: "animal-1",
              weight: 500,
              carcassWeight: 300,
            },
          ],
        },
      ]);

      const result = getCarcassYield("property-1");
      expect(result.yield).toBe(60); // (300 / 500) * 100
      expect(result.count).toBe(1);
    });

    it("should return zero yield when no sales", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([]);

      const result = getCarcassYield("property-1a");
      expect(result.yield).toBe(0);
      expect(result.count).toBe(0);
    });

    it("should return zero yield when no items with carcass weight", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1b",
          saleItems: [
            {
              animalId: "animal-1",
              weight: 500,
            },
          ],
        },
      ]);

      const result = getCarcassYield("property-1b");
      expect(result.yield).toBe(0);
      expect(result.count).toBe(0);
    });

    it("should return zero yield when zero live weight", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1c",
          saleItems: [
            {
              animalId: "animal-1",
              weight: 0,
              carcassWeight: 0,
            },
          ],
        },
      ]);

      const result = getCarcassYield("property-1c");
      expect(result.yield).toBe(0);
    });

    it("should filter sales by period", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1d",
          saleDate: "2024-01-15",
          saleItems: [
            {
              animalId: "animal-1",
              weight: 500,
              carcassWeight: 300,
            },
          ],
        },
        {
          id: "sale-2",
          companyId: "company-1",
          propertyId: "property-1d",
          saleDate: "2024-03-15",
          saleItems: [
            {
              animalId: "animal-1",
              weight: 500,
              carcassWeight: 300,
            },
          ],
        },
      ]);

      const result = getCarcassYield("property-1d", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.count).toBe(1);
    });
  });

  describe("getSlaughterAge", () => {
    it("should calculate slaughter age", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1",
          saleDate: "2024-01-15",
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
      ]);
      getAnimal.mockReturnValue({ id: "animal-1" });
      getBirth.mockReturnValue({ birthDate: "2022-01-15" });

      const result = getSlaughterAge("property-1");
      expect(result.averageAge).toBeGreaterThan(0);
      expect(result.count).toBe(1);
    });

    it("should return zero when no ages", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1a",
          saleDate: "2024-01-15",
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
      ]);
      getAnimal.mockReturnValue(null);

      const result = getSlaughterAge("property-1a");
      expect(result.averageAge).toBe(0);
      expect(result.count).toBe(0);
      expect(result.minAge).toBe(0);
      expect(result.maxAge).toBe(0);
    });

    it("should handle animals without births", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1b",
          saleDate: "2024-01-15",
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
      ]);
      getAnimal.mockReturnValue({ id: "animal-1" });
      getBirth.mockReturnValue(null);

      const result = getSlaughterAge("property-1b");
      expect(result.count).toBe(0);
    });

    it("should filter sales by period", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1c",
          saleDate: "2024-01-15",
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
        {
          id: "sale-2",
          companyId: "company-1",
          propertyId: "property-1c",
          saleDate: "2024-03-15",
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
      ]);
      getAnimal.mockReturnValue({ id: "animal-1" });
      getBirth.mockReturnValue({ birthDate: "2022-01-15" });

      const result = getSlaughterAge("property-1c", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.count).toBe(1);
    });

    it("should calculate min and max ages correctly", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([
        { id: "animal-1", code: "001", companyId: "company-1" },
        { id: "animal-2", code: "002", companyId: "company-1" },
      ]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1d",
          saleDate: "2024-01-15",
          saleItems: [
            { animalId: "animal-1", weight: 500 },
            { animalId: "animal-2", weight: 500 },
          ],
        },
      ]);
      getAnimal.mockImplementation((id: string) => ({ id }));
      getBirth.mockImplementation((id: string) => {
        if (id === "animal-1") return { birthDate: "2022-01-15" };
        if (id === "animal-2") return { birthDate: "2021-01-15" };
        return null;
      });

      const result = getSlaughterAge("property-1d");
      expect(result.count).toBe(2);
      expect(result.minAge).toBeLessThanOrEqual(result.maxAge);
    });
  });

  describe("getArrobaProductionPerHectare", () => {
    it("should calculate arroba production per hectare", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1",
          saleItems: [{ animalId: "animal-1", weight: 450 }], // 15 arrobas
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1");
      expect(result.arrobasPerHectare).toBe(0.15); // 15 / 100
      expect(result.totalArrobas).toBe(15);
    });

    it("should handle property not found", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue(null);

      const result = await getArrobaProductionPerHectare("property-1a");
      expect(result.arrobasPerHectare).toBe(0);
      expect(result.totalArrobas).toBe(0);
      expect(result.areaInHectares).toBe(0);
    });

    it("should handle zero area", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1b",
        area: { value: 0, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1b",
          saleItems: [{ animalId: "animal-1", weight: 450 }],
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1b");
      expect(result.arrobasPerHectare).toBe(0);
    });

    it("should handle no sales", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1c",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([]);

      const result = await getArrobaProductionPerHectare("property-1c");
      expect(result.totalArrobas).toBe(0);
      expect(result.arrobasPerHectare).toBe(0);
    });

    it("should convert square meters to hectares", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1d",
        area: { value: 10000, type: AreaType.SQUARE_METERS }, // 1 hectare
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1d",
          saleItems: [{ animalId: "animal-1", weight: 450 }], // 15 arrobas
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1d");
      expect(result.areaInHectares).toBe(1);
      expect(result.arrobasPerHectare).toBe(15);
    });

    it("should convert square feet to hectares", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1e",
        area: { value: 107639, type: AreaType.SQUARE_FEET }, // ~1 hectare
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1e",
          saleItems: [{ animalId: "animal-1", weight: 450 }],
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1e");
      expect(result.areaInHectares).toBeCloseTo(1, 1);
    });

    it("should convert acres to hectares", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1f",
        area: { value: 1, type: AreaType.ACRES }, // ~0.404686 hectares
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1f",
          saleItems: [{ animalId: "animal-1", weight: 450 }],
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1f");
      expect(result.areaInHectares).toBeCloseTo(0.404686, 5);
    });

    it("should convert square kilometers to hectares", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1g",
        area: { value: 1, type: AreaType.SQUARE_KILOMETERS }, // 100 hectares
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1g",
          saleItems: [{ animalId: "animal-1", weight: 450 }],
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1g");
      expect(result.areaInHectares).toBe(100);
    });

    it("should convert square miles to hectares", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1h",
        area: { value: 1, type: AreaType.SQUARE_MILES }, // ~258.999 hectares
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1h",
          saleItems: [{ animalId: "animal-1", weight: 450 }],
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1h");
      expect(result.areaInHectares).toBeCloseTo(258.999, 1);
    });

    it("should filter sales by period", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1i",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getSales.mockReturnValue([
        {
          id: "sale-1",
          companyId: "company-1",
          propertyId: "property-1i",
          saleDate: "2024-01-15",
          saleItems: [{ animalId: "animal-1", weight: 450 }],
        },
        {
          id: "sale-2",
          companyId: "company-1",
          propertyId: "property-1i",
          saleDate: "2024-03-15",
          saleItems: [{ animalId: "animal-1", weight: 450 }],
        },
      ]);

      const result = await getArrobaProductionPerHectare("property-1i", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.totalArrobas).toBe(15);
    });
  });

  describe("getKgNitrogenPerAU", () => {
    it("should calculate kg nitrogen per AU", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 450 },
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5); // 5kg per unit

      const result = await getKgNitrogenPerAU("property-1");
      expect(result.kgNitrogenPerAU).toBeGreaterThan(0);
    });

    it("should handle property not found", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue(null);

      const result = await getKgNitrogenPerAU("property-1a");
      expect(result.kgNitrogenPerAU).toBe(0);
      expect(result.totalNitrogen).toBe(0);
      expect(result.animalUnits).toBe(0);
      expect(result.areaInHectares).toBe(0);
    });

    it("should handle zero animal units (no animals with weights)", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1b",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([]); // No weighings
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = await getKgNitrogenPerAU("property-1b");
      expect(result.animalUnits).toBe(0);
      expect(result.kgNitrogenPerAU).toBe(0);
    });

    it("should handle empty animals array", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1c",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([]);
      getMovements.mockReturnValue([]);

      const result = await getKgNitrogenPerAU("property-1c");
      expect(result.animalUnits).toBe(0);
    });

    it("should handle multiple animals for animal units calculation", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1d",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([
        { id: "animal-1", code: "001", companyId: "company-1" },
        { id: "animal-2", code: "002", companyId: "company-1" },
      ]);
      getWeighings.mockImplementation((animalId: string) => {
        if (animalId === "animal-1") {
          return [{ id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 450 }];
        }
        return [{ id: "w2", animalId: "animal-2", date: "2024-01-01", weight: 450 }];
      });
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = await getKgNitrogenPerAU("property-1d");
      expect(result.animalUnits).toBe(2); // (450 + 450) / 450
    });

    it("should handle zero weight animals", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1e",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 0 },
      ]);
      getMovements.mockReturnValue([]);

      const result = await getKgNitrogenPerAU("property-1e");
      expect(result.animalUnits).toBe(0);
    });

    it("should handle no nitrogen content in movements", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1f",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 450 },
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(false);

      const result = await getKgNitrogenPerAU("property-1f");
      expect(result.totalNitrogen).toBe(0);
    });

    it("should filter movements by period", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1g",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 450 },
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
        {
          id: "movement-2",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-03-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = await getKgNitrogenPerAU("property-1g", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.totalNitrogen).toBe(50); // Only first movement
    });

    it("should filter weighings by period", async () => {
      const getProperty = getPropertyById as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getProperty.mockResolvedValue({
        id: "property-1h",
        area: { value: 100, type: AreaType.HECTARES },
      });
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-03-01", weight: 450 },
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = await getKgNitrogenPerAU("property-1h", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.animalUnits).toBeCloseTo(400 / 450, 2);
    });
  });

  describe("getKgMeatPerKgNitrogen", () => {
    it("should calculate kg meat per kg nitrogen", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = getKgMeatPerKgNitrogen("property-1");
      expect(result.kgMeatPerKgNitrogen).toBeGreaterThan(0);
    });

    it("should return zero when zero nitrogen", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(false);

      const result = getKgMeatPerKgNitrogen("property-1a");
      expect(result.kgMeatPerKgNitrogen).toBe(0);
      expect(result.totalNitrogen).toBe(0);
    });

    it("should return zero when zero weight gain", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 400 }, // No gain
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = getKgMeatPerKgNitrogen("property-1b");
      expect(result.totalWeightGain).toBe(0);
      expect(result.kgMeatPerKgNitrogen).toBe(0);
    });

    it("should filter by period", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
        { id: "w3", animalId: "animal-1", date: "2024-03-01", weight: 500 },
      ]);
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
        {
          id: "movement-2",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-03-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = getKgMeatPerKgNitrogen("property-1c", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.totalWeightGain).toBe(50); // Only from first two weighings
    });

    it("should handle no ADG results", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;
      const getMovements = getMovementsByPropertyId as ReturnType<typeof vi.fn>;
      const hasNitrogen = hasNitrogenContent as ReturnType<typeof vi.fn>;
      const getNitrogen = getNitrogenContent as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
      ]); // Only one weighing
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 10,
          date: "2024-01-15",
        },
      ]);
      hasNitrogen.mockReturnValue(true);
      getNitrogen.mockReturnValue(5);

      const result = getKgMeatPerKgNitrogen("property-1d");
      expect(result.totalWeightGain).toBe(0);
    });
  });

  describe("cache functionality", () => {
    it("should use cache for same property and period", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);

      // First call
      const result1 = getAverageDailyGain("property-cache-1");
      expect(result1.length).toBeGreaterThan(0);

      // Clear mocks but keep cache
      vi.clearAllMocks();
      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);

      // Second call should use cache
      const result2 = getAverageDailyGain("property-cache-1");
      expect(result2).toEqual(result1);
      // Note: Cache is internal, so we can't directly verify it wasn't called
      // but we can verify the results are the same
    });
  });

  describe("period filtering edge cases", () => {
    it("should handle filterByPeriod with no period", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
      ]);

      const result = getAverageDailyGain("property-period-1", undefined);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle filterByPeriod with startDate only", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
        { id: "w3", animalId: "animal-1", date: "2024-03-01", weight: 500 },
      ]);

      const result = getAverageDailyGain("property-period-2", {
        startDate: "2024-02-01",
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle filterByPeriod with endDate only", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-01", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-01", weight: 450 },
        { id: "w3", animalId: "animal-1", date: "2024-03-01", weight: 500 },
      ]);

      const result = getAverageDailyGain("property-period-3", {
        endDate: "2024-02-28",
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle filterByPeriod with both dates", () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockReturnValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "animal-1", date: "2024-01-20", weight: 400 },
        { id: "w2", animalId: "animal-1", date: "2024-02-10", weight: 450 },
        { id: "w3", animalId: "animal-1", date: "2024-03-01", weight: 500 },
      ]);

      const result = getAverageDailyGain("property-period-4", {
        startDate: "2024-01-15",
        endDate: "2024-02-15",
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
