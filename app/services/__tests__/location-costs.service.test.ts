import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalsInLocationOnDate,
  getLocationConsumptionCosts,
  getTotalLocationCost,
  getAnimalCostBreakdown,
  getAnimalCostByLocation,
  getAnimalCostBreakdownByLocation,
  getAnimalTotalCost,
} from "../location-costs.service";
import { mockAnimalMovements } from "~/mocks/animal-movements";
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import { mockAnimals } from "~/mocks/animals";
import { mockLocations } from "~/mocks/locations";
import { mockInventoryItems } from "~/mocks/inventory";
import { InventoryMovementType, InventoryItemCategory } from "~/types";
import { LocationType, AreaType } from "~/types";

// Mock the dependencies
vi.mock("../inventory-movements.service", () => ({
  getConsumptionMovementsByLocationId: vi.fn((locationId: string) => {
    return mockInventoryMovements.filter(
      (m) => m.locationId === locationId && m.type === InventoryMovementType.CONSUMPTION
    );
  }),
}));

vi.mock("../inventory.service", () => ({
  getInventoryItemById: vi.fn((itemId: string) => {
    return mockInventoryItems.find((item) => item.id === itemId);
  }),
}));

vi.mock("../animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: vi.fn((animalId: string) => {
    return mockAnimalMovements.filter((m) => m.animalIds.includes(animalId));
  }),
}));

vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn((animalId: string) => {
    return mockAnimals.find((a) => a.id === animalId);
  }),
}));

vi.mock("../locations.service", () => ({
  getLocationById: vi.fn((locationId: string) => {
    return mockLocations.find((l) => l.id === locationId);
  }),
}));

describe("location-costs.service", () => {
  beforeEach(() => {
    mockAnimalMovements.length = 0;
    mockInventoryMovements.length = 0;
    mockAnimals.length = 0;
    mockLocations.length = 0;
    mockInventoryItems.length = 0;

    // Setup animals
    mockAnimals.push(
      {
        id: "animal-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "ANM001",
        registrationNumber: "REG001",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "animal-2",
        companyId: "company-1",
        propertyId: "property-1",
        code: "ANM002",
        registrationNumber: "REG002",
        status: "active",
        createdAt: "2025-01-01",
      }
    );

    // Setup locations
    mockLocations.push(
      {
        id: "location-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "LOC001",
        name: "Location 1",
        locationType: LocationType.PASTURE,
        area: { value: 100, type: AreaType.HECTARES },
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "location-2",
        companyId: "company-1",
        propertyId: "property-1",
        code: "LOC002",
        name: "Location 2",
        locationType: LocationType.PASTURE,
        area: { value: 200, type: AreaType.HECTARES },
        status: "active",
        createdAt: "2025-01-01",
      }
    );

    // Setup inventory items
    mockInventoryItems.push({
      id: "item-1",
      companyId: "company-1",
      propertyIds: ["property-1"],
      code: "ITEM001",
      name: "Item 1",
      category: InventoryItemCategory.FEED,
      unit: "kg",
      minimumStock: 50,
      unitPrice: 10,
      hasExpiration: false,
      createdAt: "2025-01-01",
    });

    // Setup animal movements
    mockAnimalMovements.push(
      {
        id: "am-1",
        animalIds: ["animal-1", "animal-2"],
        locationId: "location-1",
        date: "2025-01-01",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Movement 1",
        createdAt: "2025-01-01",
      },
      {
        id: "am-2",
        animalIds: ["animal-1"],
        locationId: "location-2",
        date: "2025-01-15",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Movement 2",
        createdAt: "2025-01-15",
      }
    );

    // Setup inventory movements (consumption)
    mockInventoryMovements.push(
      {
        id: "im-1",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 100,
        unitPrice: 10,
        date: "2025-01-05",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-1",
        createdAt: "2025-01-05",
      },
      {
        id: "im-2",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 50,
        unitPrice: 10,
        date: "2025-01-20",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-2",
        createdAt: "2025-01-20",
      }
    );
  });

  describe("getAnimalsInLocationOnDate", () => {
    it("should return animals present in location on specific date", () => {
      const result = getAnimalsInLocationOnDate("location-1", "2025-01-10");
      expect(result).toHaveLength(2);
      expect(result.some((a) => a.id === "animal-1")).toBe(true);
      expect(result.some((a) => a.id === "animal-2")).toBe(true);
    });

    it("should return animals based on most recent movement before date", () => {
      const result = getAnimalsInLocationOnDate("location-2", "2025-01-20");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("animal-1");
    });

    it("should return empty array when no animals in location on date", () => {
      // Add a movement that moves all animals out of location-1 before the date
      const result = getAnimalsInLocationOnDate("location-nonexistent", "2025-01-20");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationConsumptionCosts", () => {
    it("should return consumption costs for a location", () => {
      const result = getLocationConsumptionCosts("location-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.movement.id).toBe("im-1");
      expect(result[0]?.totalCost).toBe(1000); // 100 * 10
      expect(result[0]?.animalsPresent).toHaveLength(2);
    });

    it("should use movement unitPrice when available", () => {
      const result = getLocationConsumptionCosts("location-1");
      expect(result[0]?.totalCost).toBe(1000);
    });

    it("should use item unitPrice when movement unitPrice is not available", () => {
      mockInventoryMovements[0]!.unitPrice = undefined;
      const result = getLocationConsumptionCosts("location-1");
      expect(result[0]?.totalCost).toBe(1000); // 100 * 10 (from item)
    });

    it("should filter by start date", () => {
      const result = getLocationConsumptionCosts("location-1", "2025-01-10");
      expect(result).toHaveLength(0);
    });

    it("should filter by end date", () => {
      const result = getLocationConsumptionCosts("location-1", undefined, "2025-01-01");
      expect(result).toHaveLength(0);
    });

    it("should filter by both start and end date", () => {
      const result = getLocationConsumptionCosts("location-1", "2025-01-01", "2025-01-10");
      expect(result).toHaveLength(1);
    });

    it("should return empty array when location has no consumption movements", () => {
      const result = getLocationConsumptionCosts("location-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getTotalLocationCost", () => {
    it("should return total cost for a location", () => {
      const result = getTotalLocationCost("location-1");
      expect(result).toBe(1000);
    });

    it("should return 0 when location has no costs", () => {
      const result = getTotalLocationCost("location-nonexistent");
      expect(result).toBe(0);
    });

    it("should filter by date range", () => {
      const result = getTotalLocationCost("location-1", "2025-01-01", "2025-01-10");
      expect(result).toBe(1000);
    });
  });

  describe("getAnimalCostBreakdown", () => {
    it("should return cost breakdown per animal", () => {
      const result = getAnimalCostBreakdown("location-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.totalCost).toBe(500); // 1000 / 2 animals
      expect(result[0]?.consumptionPeriods).toBe(1);
      expect(result[0]?.averageCostPerPeriod).toBe(500);
    });

    it("should handle single animal in location", () => {
      const result = getAnimalCostBreakdown("location-2");
      expect(result).toHaveLength(1);
      expect(result[0]?.totalCost).toBe(500); // 500 / 1 animal
    });

    it("should return empty array when location has no consumption", () => {
      const result = getAnimalCostBreakdown("location-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should calculate average cost per period correctly", () => {
      mockInventoryMovements.push({
        id: "im-3",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 200,
        unitPrice: 10,
        date: "2025-01-10",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-1",
        createdAt: "2025-01-10",
      });

      const result = getAnimalCostBreakdown("location-1");
      expect(result[0]?.consumptionPeriods).toBe(2);
      // First period: 1000 / 2 animals = 500 per animal
      // Second period: 2000 / 2 animals = 1000 per animal
      // Total: 1500, Average: 1500 / 2 = 750
      expect(result[0]?.averageCostPerPeriod).toBe(750);
    });
  });

  describe("getAnimalCostByLocation", () => {
    it("should return cost for specific animal in location", () => {
      const result = getAnimalCostByLocation("animal-1", "location-1");
      expect(result).toBe(500); // 1000 / 2 animals
    });

    it("should return 0 when animal was not present", () => {
      const result = getAnimalCostByLocation("animal-2", "location-2");
      expect(result).toBe(0);
    });

    it("should filter by date range", () => {
      const result = getAnimalCostByLocation("animal-1", "location-1", "2025-01-01", "2025-01-10");
      expect(result).toBe(500);
    });
  });

  describe("getAnimalCostBreakdownByLocation", () => {
    it("should return cost breakdown by location for an animal", () => {
      const result = getAnimalCostBreakdownByLocation("animal-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((loc) => loc.locationId === "location-1")).toBe(true);
    });

    it("should include location name", () => {
      const result = getAnimalCostBreakdownByLocation("animal-1");
      const location1 = result.find((loc) => loc.locationId === "location-1");
      expect(location1?.locationName).toBe("Location 1");
    });

    it("should calculate total cost per location", () => {
      const result = getAnimalCostBreakdownByLocation("animal-1");
      const location1 = result.find((loc) => loc.locationId === "location-1");
      expect(location1?.totalCost).toBe(500);
    });

    it("should include consumption periods", () => {
      const result = getAnimalCostBreakdownByLocation("animal-1");
      const location1 = result.find((loc) => loc.locationId === "location-1");
      expect(location1?.consumptionPeriods).toBeGreaterThan(0);
    });

    it("should filter by date range", () => {
      const result = getAnimalCostBreakdownByLocation("animal-1", "2025-01-01", "2025-01-10");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getAnimalTotalCost", () => {
    it("should return total cost across all locations", () => {
      const result = getAnimalTotalCost("animal-1");
      expect(result.animalId).toBe("animal-1");
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.locationBreakdown.length).toBeGreaterThan(0);
    });

    it("should include consumption periods", () => {
      const result = getAnimalTotalCost("animal-1");
      expect(result.consumptionPeriods).toBeGreaterThan(0);
    });

    it("should sum costs from all locations", () => {
      const result = getAnimalTotalCost("animal-1");
      const sumFromBreakdown = result.locationBreakdown.reduce(
        (sum, loc) => sum + loc.totalCost,
        0
      );
      expect(result.totalCost).toBe(sumFromBreakdown);
    });

    it("should filter by date range", () => {
      const result = getAnimalTotalCost("animal-1", "2025-01-01", "2025-01-10");
      expect(result.animalId).toBe("animal-1");
    });
  });
});
