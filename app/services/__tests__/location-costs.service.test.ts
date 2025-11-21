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
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import { mockAnimalMovements } from "~/mocks/animal-movements";
import { mockInventoryItems } from "~/mocks/inventory";
import { mockLocations } from "~/mocks/locations";
import { mockAnimals } from "~/mocks/animals";
import { InventoryMovementType, InventoryItemCategory, LocationType, AreaType } from "~/types";

vi.mock("~/mocks/inventory-movements", () => ({
  mockInventoryMovements: [],
}));

vi.mock("~/mocks/animal-movements", () => ({
  mockAnimalMovements: [],
}));

vi.mock("~/mocks/inventory", () => ({
  mockInventoryItems: [],
}));

vi.mock("~/mocks/locations", () => ({
  mockLocations: [],
}));

vi.mock("~/mocks/animals", () => ({
  mockAnimals: [],
}));

const mockGetInventoryItemById = vi.fn();
const mockGetAnimalById = vi.fn();
const mockGetLocationById = vi.fn();
const mockGetAnimalMovementsByAnimalId = vi.fn(() => []);
const mockGetConsumptionMovementsByLocationId = vi.fn(() => []);

vi.mock("../inventory.service", () => ({
  getInventoryItemById: (...args: unknown[]) => mockGetInventoryItemById(...args),
}));

vi.mock("../animals.service", () => ({
  getAnimalById: (...args: unknown[]) => mockGetAnimalById(...args),
}));

vi.mock("../locations.service", () => ({
  getLocationById: (...args: unknown[]) => mockGetLocationById(...args),
}));

vi.mock("../animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: (...args: unknown[]) => mockGetAnimalMovementsByAnimalId(...args),
}));

vi.mock("../inventory-movements.service", () => ({
  getConsumptionMovementsByLocationId: (...args: unknown[]) =>
    mockGetConsumptionMovementsByLocationId(...args),
}));

describe("location-costs.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInventoryMovements.length = 0;
    mockAnimalMovements.length = 0;
    mockInventoryItems.length = 0;
    mockLocations.length = 0;
    mockAnimals.length = 0;

    // Setup mock inventory items
    mockInventoryItems.push({
      id: "item-1",
      code: "ITEM001",
      name: "Test Feed",
      category: InventoryItemCategory.FEED,
      unit: "kg",
      minimumStock: 100,
      unitPrice: 2.5,
      hasExpiration: false,
      companyId: "company-1",
      propertyIds: ["property-1"],
      createdAt: "2025-01-01",
    });

    // Setup mock animals
    mockAnimals.push(
      {
        id: "animal-1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-01-01",
      },
      {
        id: "animal-2",
        code: "A002",
        registrationNumber: "REG002",
        status: "active",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-01-01",
      }
    );

    // Setup mock locations
    mockLocations.push({
      id: "location-1",
      code: "LOC001",
      name: "Test Location",
      locationType: LocationType.PASTURE,
      area: { value: 10, type: AreaType.HECTARES },
      status: "active",
      companyId: "company-1",
      propertyId: "property-1",
      createdAt: "2025-01-01",
    });

    // Setup mock animal movements
    mockAnimalMovements.push(
      {
        id: "am-1",
        animalIds: ["animal-1", "animal-2"],
        locationId: "location-1",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2025-01-10",
        createdAt: "2025-01-10",
      },
      {
        id: "am-2",
        animalIds: ["animal-1"],
        locationId: "location-2",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2025-01-20",
        createdAt: "2025-01-20",
      }
    );

    // Setup mock inventory movements
    mockInventoryMovements.push(
      {
        id: "im-1",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 100,
        unitPrice: 2.5,
        date: "2025-01-15",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-1",
        createdAt: "2025-01-15",
      },
      {
        id: "im-2",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 50,
        unitPrice: 2.5,
        date: "2025-01-18",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-1",
        createdAt: "2025-01-18",
      }
    );

    // Setup service mocks
    mockGetInventoryItemById.mockImplementation((id: string) => {
      return mockInventoryItems.find((item) => item.id === id);
    });

    mockGetAnimalById.mockImplementation((id: string) => {
      return mockAnimals.find((animal) => animal.id === id);
    });

    mockGetLocationById.mockImplementation((id: string) => {
      return mockLocations.find((location) => location.id === id);
    });

    mockGetAnimalMovementsByAnimalId.mockImplementation((animalId: string) => {
      return mockAnimalMovements.filter((movement) => movement.animalIds.includes(animalId));
    });

    mockGetConsumptionMovementsByLocationId.mockImplementation((locationId: string) => {
      return mockInventoryMovements.filter(
        (movement) =>
          movement.locationId === locationId && movement.type === InventoryMovementType.CONSUMPTION
      );
    });
  });

  describe("getAnimalsInLocationOnDate", () => {
    it("should return animals present in location on specific date", () => {
      const result = getAnimalsInLocationOnDate("location-1", "2025-01-15");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((animal) => animal.id === "animal-1")).toBe(true);
      expect(result.some((animal) => animal.id === "animal-2")).toBe(true);
    });

    it("should return empty array when no animals in location on date", () => {
      const result = getAnimalsInLocationOnDate("location-1", "2025-01-05");
      expect(result).toHaveLength(0);
    });

    it("should handle animals moved to different location", () => {
      const result = getAnimalsInLocationOnDate("location-1", "2025-01-25");
      // animal-1 was moved to location-2 on 2025-01-20, so should not be in location-1 on 2025-01-25
      expect(result.some((animal) => animal.id === "animal-1")).toBe(false);
    });
  });

  describe("getLocationConsumptionCosts", () => {
    it("should return consumption costs with calculated totals", () => {
      const result = getLocationConsumptionCosts("location-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].totalCost).toBe(100 * 2.5); // quantity * unitPrice
      expect(result[0].item).toBeDefined();
      expect(result[0].animalsPresent.length).toBeGreaterThan(0);
    });

    it("should use item unitPrice when movement unitPrice is not set", () => {
      mockInventoryMovements[0].unitPrice = undefined;
      const result = getLocationConsumptionCosts("location-1");
      expect(result[0].totalCost).toBe(100 * 2.5); // Uses item's unitPrice
    });

    it("should filter by date range when provided", () => {
      const result = getLocationConsumptionCosts("location-1", "2025-01-16", "2025-01-20");
      expect(result.length).toBe(1); // Only the second consumption
      expect(result[0].movement.date).toBe("2025-01-18");
    });

    it("should return empty array when location has no consumption", () => {
      const result = getLocationConsumptionCosts("nonexistent-location");
      expect(result).toHaveLength(0);
    });
  });

  describe("getTotalLocationCost", () => {
    it("should calculate total cost for location", () => {
      const result = getTotalLocationCost("location-1");
      expect(result).toBe(100 * 2.5 + 50 * 2.5); // Both consumptions
    });

    it("should return 0 when location has no consumption", () => {
      const result = getTotalLocationCost("nonexistent-location");
      expect(result).toBe(0);
    });

    it("should filter by date range when provided", () => {
      const result = getTotalLocationCost("location-1", "2025-01-16", "2025-01-20");
      expect(result).toBe(50 * 2.5); // Only the second consumption
    });
  });

  describe("getAnimalCostBreakdown", () => {
    it("should return cost breakdown per animal", () => {
      const result = getAnimalCostBreakdown("location-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].animal).toBeDefined();
      expect(result[0].totalCost).toBeGreaterThan(0);
      expect(result[0].consumptionPeriods).toBeGreaterThan(0);
    });

    it("should divide costs equally among animals present", () => {
      const result = getAnimalCostBreakdown("location-1");
      // Both animals were present, so each should get half of the total cost
      const totalCost = 100 * 2.5 + 50 * 2.5;
      const costPerAnimal = totalCost / 2; // 2 animals present
      const animal1Cost = result.find((r) => r.animal.id === "animal-1");
      expect(animal1Cost?.totalCost).toBe(costPerAnimal);
    });

    it("should calculate average cost per period", () => {
      const result = getAnimalCostBreakdown("location-1");
      expect(result[0].averageCostPerPeriod).toBeGreaterThan(0);
      expect(result[0].averageCostPerPeriod).toBe(
        result[0].totalCost / result[0].consumptionPeriods
      );
    });
  });

  describe("getAnimalCostByLocation", () => {
    it("should calculate cost for specific animal in location", () => {
      const result = getAnimalCostByLocation("animal-1", "location-1");
      expect(result).toBeGreaterThan(0);
    });

    it("should return 0 when animal was not in location", () => {
      const result = getAnimalCostByLocation("animal-1", "nonexistent-location");
      expect(result).toBe(0);
    });

    it("should divide cost equally among animals present", () => {
      const totalCost = 100 * 2.5 + 50 * 2.5;
      const costPerAnimal = totalCost / 2; // 2 animals present
      const result = getAnimalCostByLocation("animal-1", "location-1");
      expect(result).toBe(costPerAnimal);
    });
  });

  describe("getAnimalCostBreakdownByLocation", () => {
    it("should return cost breakdown grouped by location", () => {
      const result = getAnimalCostBreakdownByLocation("animal-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].locationId).toBeDefined();
      expect(result[0].locationName).toBeDefined();
      expect(result[0].totalCost).toBeGreaterThan(0);
      expect(result[0].consumptionPeriods).toBeGreaterThan(0);
    });

    it("should include consumption details for each location", () => {
      const result = getAnimalCostBreakdownByLocation("animal-1");
      expect(result[0].consumptionDetails.length).toBeGreaterThan(0);
    });

    it("should return empty array when animal has no costs", () => {
      const result = getAnimalCostBreakdownByLocation("nonexistent-animal");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalTotalCost", () => {
    it("should return total cost across all locations", () => {
      const result = getAnimalTotalCost("animal-1");
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.locationBreakdown.length).toBeGreaterThan(0);
      expect(result.consumptionPeriods).toBeGreaterThan(0);
    });

    it("should sum costs from all locations", () => {
      const result = getAnimalTotalCost("animal-1");
      const sumFromLocations = result.locationBreakdown.reduce(
        (sum, location) => sum + location.totalCost,
        0
      );
      expect(result.totalCost).toBe(sumFromLocations);
    });

    it("should return zero cost for animal with no consumption", () => {
      const result = getAnimalTotalCost("nonexistent-animal");
      expect(result.totalCost).toBe(0);
      expect(result.locationBreakdown).toHaveLength(0);
      expect(result.consumptionPeriods).toBe(0);
    });

    it("should filter by date range when provided", () => {
      const result = getAnimalTotalCost("animal-1", "2025-01-16", "2025-01-20");
      expect(result.consumptionPeriods).toBe(1); // Only one consumption in date range
    });
  });
});
