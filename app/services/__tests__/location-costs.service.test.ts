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

vi.mock("../inventory-movements.service", () => ({
  getConsumptionMovementsByLocationId: vi.fn(),
}));

vi.mock("../inventory.service", () => ({
  getInventoryItemById: vi.fn(),
}));

vi.mock("../animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: vi.fn(),
}));

vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn(),
}));

vi.mock("../locations.service", () => ({
  getLocationById: vi.fn(),
}));

vi.mock("~/mocks/animal-movements", () => ({
  mockAnimalMovements: [
    {
      id: "movement-1",
      animalIds: ["animal-1"],
      locationId: "location-1",
      date: "2024-01-15",
    },
  ],
}));

vi.mock("~/mocks/inventory-movements", () => ({
  mockInventoryMovements: [
    {
      id: "inv-movement-1",
      itemId: "item-1",
      locationId: "location-1",
      type: "consumption",
      quantity: 100,
      unitPrice: 10,
      date: "2024-01-15",
    },
  ],
}));

import { getConsumptionMovementsByLocationId } from "../inventory-movements.service";
import { getInventoryItemById } from "../inventory.service";
import { getAnimalMovementsByAnimalId } from "../animal-movements.service";
import { getAnimalById } from "../animals.service";

describe("location-costs.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalsInLocationOnDate", () => {
    it("should return animals in location on date", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-15",
        },
      ]);

      const result = await getAnimalsInLocationOnDate("location-1", "2024-01-15");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getLocationConsumptionCosts", () => {
    it("should calculate consumption costs for location", async () => {
      const getMovements = getConsumptionMovementsByLocationId as ReturnType<typeof vi.fn>;
      const getItem = getInventoryItemById as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getAnimalMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;

      getMovements.mockReturnValue([
        {
          id: "inv-movement-1",
          itemId: "item-1",
          locationId: "location-1",
          type: "consumption",
          quantity: 100,
          unitPrice: 10,
          date: "2024-01-15",
        },
      ]);
      getItem.mockReturnValue({ id: "item-1", name: "Feed", unitPrice: 10 });
      getAnimal.mockResolvedValue({ id: "animal-1" });
      getAnimalMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-15",
        },
      ]);

      const result = await getLocationConsumptionCosts("location-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].totalCost).toBe(1000); // 100 * 10
    });

    it("should filter by date range", async () => {
      const getMovements = getConsumptionMovementsByLocationId as ReturnType<typeof vi.fn>;
      const getItem = getInventoryItemById as ReturnType<typeof vi.fn>;
      getMovements.mockReturnValue([
        {
          id: "inv-movement-1",
          itemId: "item-1",
          locationId: "location-1",
          type: "consumption",
          quantity: 100,
          date: "2024-01-15",
        },
        {
          id: "inv-movement-2",
          itemId: "item-1",
          locationId: "location-1",
          type: "consumption",
          quantity: 50,
          date: "2024-03-15",
        },
      ]);
      getItem.mockReturnValue({ id: "item-1", name: "Feed", unitPrice: 10 });

      const result = await getLocationConsumptionCosts("location-1", "2024-01-01", "2024-01-31");
      expect(result).toHaveLength(1);
    });
  });

  describe("getTotalLocationCost", () => {
    it("should calculate total location cost", async () => {
      const getMovements = getConsumptionMovementsByLocationId as ReturnType<typeof vi.fn>;
      const getItem = getInventoryItemById as ReturnType<typeof vi.fn>;
      getMovements.mockReturnValue([
        {
          id: "inv-movement-1",
          itemId: "item-1",
          locationId: "location-1",
          type: "consumption",
          quantity: 100,
          unitPrice: 10,
          date: "2024-01-15",
        },
      ]);
      getItem.mockReturnValue({ id: "item-1", name: "Feed", unitPrice: 10 });

      const result = await getTotalLocationCost("location-1");
      expect(result).toBe(1000);
    });
  });

  describe("getAnimalCostBreakdown", () => {
    it("should calculate animal cost breakdown", async () => {
      const getMovements = getConsumptionMovementsByLocationId as ReturnType<typeof vi.fn>;
      const getItem = getInventoryItemById as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getAnimalMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;

      getMovements.mockReturnValue([
        {
          id: "inv-movement-1",
          itemId: "item-1",
          locationId: "location-1",
          type: "consumption",
          quantity: 100,
          unitPrice: 10,
          date: "2024-01-15",
        },
      ]);
      getItem.mockReturnValue({ id: "item-1", name: "Feed", unitPrice: 10 });
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getAnimalMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-15",
        },
      ]);

      const result = await getAnimalCostBreakdown("animal-1", "location-1");
      expect(result).toBeDefined();
    });
  });

  describe("getAnimalCostByLocation", () => {
    it("should calculate animal cost by location", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getAnimalMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getAnimalMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-15",
        },
      ]);

      const result = await getAnimalCostByLocation("animal-1", "location-1");
      expect(result).toBeDefined();
    });
  });

  describe("getAnimalCostBreakdownByLocation", () => {
    it("should calculate animal cost breakdown by location", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getAnimalMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getAnimalMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-15",
        },
      ]);

      const result = await getAnimalCostBreakdownByLocation("animal-1");
      expect(result).toBeDefined();
    });
  });

  describe("getAnimalTotalCost", () => {
    it("should calculate total animal cost", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getAnimalMovements = getAnimalMovementsByAnimalId as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getAnimalMovements.mockReturnValue([
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          date: "2024-01-15",
        },
      ]);

      const result = await getAnimalTotalCost("animal-1");
      expect(result).toBeDefined();
    });
  });
});
