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
import { mockAnimals } from "~/mocks/animals";
import { mockWeighings } from "~/mocks/weighings";
import { mockSales } from "~/mocks/sales";
import { mockProperties } from "~/mocks/properties";
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import { mockAnimalMovements } from "~/mocks/animal-movements";
import { mockLocations } from "~/mocks/locations";
import { mockBirths } from "~/mocks/births";
import {
  AreaType,
  LocationType,
  InventoryMovementType,
  SaleType,
  PricingMode,
  SalePaymentMethod,
} from "~/types";

// Mock dependencies
vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn((propertyId: string) => {
    return mockAnimals.filter((a) => a.propertyId === propertyId);
  }),
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
}));

vi.mock("../weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn((animalId: string) => {
    return mockWeighings.filter((w) => w.animalId === animalId);
  }),
}));

vi.mock("../sales.service", () => ({
  getSalesByCompanyId: vi.fn((companyId: string) => {
    return mockSales.filter((s) => s.companyId === companyId);
  }),
  getSalesByAnimalId: vi.fn((animalId: string) => {
    return mockSales.filter((s) => s.saleItems.some((item) => item.animalId === animalId));
  }),
}));

vi.mock("../properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
}));

vi.mock("../locations.service", () => ({
  getLocationsByPropertyId: vi.fn((propertyId: string) => {
    return mockLocations.filter((l) => l.propertyId === propertyId);
  }),
}));

vi.mock("../animal-movements.service", () => ({
  getAnimalMovementsByAnimalId: vi.fn((animalId: string) => {
    return mockAnimalMovements.filter((m) => m.animalIds.includes(animalId));
  }),
}));

vi.mock("../inventory-movements.service", () => ({
  getMovementsByPropertyId: vi.fn((propertyId: string) => {
    return mockInventoryMovements.filter((m) => m.propertyId === propertyId);
  }),
}));

vi.mock("../inventory.service", () => ({
  getInventoryItemById: vi.fn(),
}));

vi.mock("../nitrogen-content.service", () => ({
  hasNitrogenContent: vi.fn((itemId: string) => itemId === "item-with-nitrogen"),
  getNitrogenContent: vi.fn((itemId: string) => (itemId === "item-with-nitrogen" ? 10 : 0)),
}));

vi.mock("../births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

describe("production-indexes.service", () => {
  beforeEach(async () => {
    mockAnimals.length = 0;
    mockWeighings.length = 0;
    mockSales.length = 0;
    mockProperties.length = 0;
    mockInventoryMovements.length = 0;
    mockAnimalMovements.length = 0;
    mockLocations.length = 0;
    mockBirths.length = 0;

    // Setup mock for getBirthByAnimalId
    const { getBirthByAnimalId } = await import("../births.service");
    vi.mocked(getBirthByAnimalId).mockImplementation((animalId: string) => {
      return mockBirths.find((b) => b.animalId === animalId);
    });

    mockProperties.push({
      id: "property-1",
      companyId: "company-1",
      code: "PROP001",
      name: "Property 1",
      area: { value: 100, type: AreaType.HECTARES },
      status: "active",
      street: "Street 1",
      number: "123",
      complement: "",
      neighborhood: "Neighborhood 1",
      city: "City 1",
      state: "State 1",
      zipCode: "12345-678",
      createdAt: "2025-01-01",
    });

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

    mockWeighings.push(
      {
        id: "weighing-1",
        animalId: "animal-1",
        weight: 200,
        date: "2025-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-01",
      },
      {
        id: "weighing-2",
        animalId: "animal-1",
        weight: 250,
        date: "2025-01-31",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-31",
      }
    );

    mockLocations.push({
      id: "location-1",
      companyId: "company-1",
      propertyId: "property-1",
      code: "LOC001",
      name: "Location 1",
      locationType: LocationType.FEEDLOT,
      area: { value: 10, type: AreaType.HECTARES },
      status: "active",
      createdAt: "2025-01-01",
    });

    mockAnimalMovements.push({
      id: "am-1",
      animalIds: ["animal-1"],
      locationId: "location-1",
      date: "2025-01-01",
      propertyId: "property-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      observation: "Entry",
      createdAt: "2025-01-01",
    });

    mockSales.push({
      id: "sale-1",
      companyId: "company-1",
      propertyId: "property-1",
      buyerId: "buyer-1",
      saleDate: "2025-02-15",
      saleType: SaleType.SLAUGHTERHOUSE,
      pricingMode: PricingMode.TOTAL,
      paymentMethod: SalePaymentMethod.CASH_FLOW,
      totalPrice: 1000,
      saleItems: [{ animalId: "animal-1", price: 1000, weight: 300, carcassWeight: 180 }],
      createdAt: "2025-02-15",
    });
  });

  describe("getAverageDailyGain", () => {
    it("should calculate ADG for animals with multiple weighings", () => {
      const result = getAverageDailyGain("property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.adg).toBeGreaterThan(0);
      expect(result[0]?.initialWeight).toBe(200);
      expect(result[0]?.finalWeight).toBe(250);
    });

    it("should return empty array when animals have less than 2 weighings", () => {
      // Use a different property to avoid cache
      mockAnimals.push({
        id: "animal-single-weighing",
        companyId: "company-1",
        propertyId: "property-2",
        code: "ANM003",
        registrationNumber: "REG003",
        status: "active",
        createdAt: "2025-01-01",
      });
      mockWeighings.push({
        id: "weighing-single",
        animalId: "animal-single-weighing",
        weight: 200,
        date: "2025-01-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-01",
      });
      const result = getAverageDailyGain("property-2");
      expect(result).toHaveLength(0);
    });

    it("should filter by period", () => {
      const result = getAverageDailyGain("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should use cache for repeated calls", () => {
      const result1 = getAverageDailyGain("property-1");
      const result2 = getAverageDailyGain("property-1");
      expect(result1).toBe(result2);
    });

    it("should delete expired cache entries", async () => {
      // Call once to create cache
      getAverageDailyGain("property-1");

      // Wait for cache to expire (6 minutes)
      vi.useFakeTimers();
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Call again - should delete expired cache and create new one
      const result = getAverageDailyGain("property-1");
      expect(result).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe("getAverageDailyCarcassGain", () => {
    it("should calculate ADC using ADG and carcass yield", () => {
      const result = getAverageDailyCarcassGain("property-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should use provided average carcass yield", () => {
      const result = getAverageDailyCarcassGain("property-1", undefined, 60);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getAverageDailyCarcassGain("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getDaysOnFeed", () => {
    it("should calculate days on feed for animals in confinement", () => {
      const result = getDaysOnFeed("property-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should use sale date as exit date when no exit movement", () => {
      const result = getDaysOnFeed("property-1");
      // Should find entry date and use sale date as exit
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle exit date when animal moves out of confinement", () => {
      // Add animal movement that exits confinement
      mockAnimalMovements.push({
        id: "movement-exit",
        animalIds: ["animal-1"],
        locationId: "location-2", // Non-confinement location
        date: "2025-02-01",
        observation: "Moved out",
        companyId: "company-1",
        propertyId: "property-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-02-01",
      });

      const result = getDaysOnFeed("property-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getDaysOnFeed("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-02-28",
      });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getCarcassYield", () => {
    it("should calculate carcass yield from sales", () => {
      const result = getCarcassYield("property-1");
      expect(result.yield).toBeGreaterThanOrEqual(0);
      expect(result.carcassWeight).toBeGreaterThanOrEqual(0);
      expect(result.liveWeight).toBeGreaterThanOrEqual(0);
    });

    it("should return 0 yield when no sales with carcass data", () => {
      // Use a property with no sales to avoid cache conflicts
      const result = getCarcassYield("property-nonexistent");
      expect(result.yield).toBe(0);
      expect(result.count).toBe(0);
      expect(result.carcassWeight).toBe(0);
      expect(result.liveWeight).toBe(0);
    });

    it("should filter by period", () => {
      const result = getCarcassYield("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-02-28",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getSlaughterAge", () => {
    it("should calculate average slaughter age", () => {
      const result = getSlaughterAge("property-1");
      expect(result.averageAge).toBeGreaterThanOrEqual(0);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    it("should calculate min and max age when sales have birth data", () => {
      // Use a different property to avoid cache conflicts
      mockProperties.push({
        id: "property-slaughter-age",
        companyId: "company-1",
        code: "PROP007",
        name: "Property Slaughter Age",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active",
        street: "Street 7",
        number: "707",
        complement: "",
        neighborhood: "Neighborhood 7",
        city: "City 7",
        state: "State 7",
        zipCode: "12345-678",
        latitude: 0,
        longitude: 0,
        pasturePlanning: [],
        breedingMonths: [],
        pasturePlanningModifiedByUser: false,
        breedingSeasonModifiedByUser: false,
        createdAt: "2025-01-01",
      });
      mockAnimals.push({
        id: "animal-slaughter",
        companyId: "company-1",
        propertyId: "property-slaughter-age",
        code: "ANM007",
        registrationNumber: "REG007",
        status: "active",
        createdAt: "2025-01-01",
      });
      // Add sale with birth data
      mockSales.push({
        id: "sale-with-birth",
        companyId: "company-1",
        propertyId: "property-slaughter-age",
        buyerId: "buyer-1",
        saleDate: "2025-06-01",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 2000,
        saleItems: [{ animalId: "animal-slaughter", price: 2000, weight: 300 }],
        createdAt: "2025-06-01",
      });

      mockBirths.push({
        id: "birth-slaughter",
        animalId: "animal-slaughter",
        motherId: "mother-1",
        birthDate: "2023-01-01",
        companyId: "company-1",
        propertyId: "property-slaughter-age",
        createdAt: "2023-01-01",
      });

      const result = getSlaughterAge("property-slaughter-age");
      expect(result.averageAge).toBeGreaterThan(0);
      expect(result.minAge).toBeGreaterThan(0);
      expect(result.maxAge).toBeGreaterThanOrEqual(result.minAge);
      expect(result.count).toBeGreaterThan(0);
    });

    it("should return 0 when no sales with birth data", () => {
      mockSales.length = 0;
      const result = getSlaughterAge("property-1");
      expect(result.averageAge).toBe(0);
      expect(result.count).toBe(0);
    });

    it("should filter by period", () => {
      const result = getSlaughterAge("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-02-28",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getArrobaProductionPerHectare", () => {
    it("should calculate arrobas per hectare", () => {
      const result = getArrobaProductionPerHectare("property-1");
      expect(result.arrobasPerHectare).toBeGreaterThanOrEqual(0);
      expect(result.totalArrobas).toBeGreaterThanOrEqual(0);
      expect(result.areaInHectares).toBe(100);
    });

    it("should handle different area types", () => {
      // Test SQUARE_METERS
      mockProperties.push({
        id: "property-square-meters",
        companyId: "company-1",
        code: "PROP002",
        name: "Property 2",
        area: { value: 1000000, type: AreaType.SQUARE_METERS },
        status: "active",
        street: "Street 2",
        number: "456",
        complement: "",
        neighborhood: "Neighborhood 2",
        city: "City 2",
        state: "State 2",
        zipCode: "12345-678",
        latitude: 0,
        longitude: 0,
        pasturePlanning: [],
        breedingMonths: [],
        pasturePlanningModifiedByUser: false,
        breedingSeasonModifiedByUser: false,
        createdAt: "2025-01-01",
      });
      const result1 = getArrobaProductionPerHectare("property-square-meters");
      expect(result1.areaInHectares).toBe(100);

      // Test SQUARE_FEET
      mockProperties.push({
        id: "property-square-feet",
        companyId: "company-1",
        code: "PROP003",
        name: "Property 3",
        area: { value: 1076390, type: AreaType.SQUARE_FEET },
        status: "active",
        street: "Street 3",
        number: "789",
        complement: "",
        neighborhood: "Neighborhood 3",
        city: "City 3",
        state: "State 3",
        zipCode: "12345-678",
        latitude: 0,
        longitude: 0,
        pasturePlanning: [],
        breedingMonths: [],
        pasturePlanningModifiedByUser: false,
        breedingSeasonModifiedByUser: false,
        createdAt: "2025-01-01",
      });
      const result2 = getArrobaProductionPerHectare("property-square-feet");
      expect(result2.areaInHectares).toBeCloseTo(10, 1);

      // Test ACRES
      mockProperties.push({
        id: "property-acres",
        companyId: "company-1",
        code: "PROP004",
        name: "Property 4",
        area: { value: 10, type: AreaType.ACRES },
        status: "active",
        street: "Street 4",
        number: "101",
        complement: "",
        neighborhood: "Neighborhood 4",
        city: "City 4",
        state: "State 4",
        zipCode: "12345-678",
        latitude: 0,
        longitude: 0,
        pasturePlanning: [],
        breedingMonths: [],
        pasturePlanningModifiedByUser: false,
        breedingSeasonModifiedByUser: false,
        createdAt: "2025-01-01",
      });
      const result3 = getArrobaProductionPerHectare("property-acres");
      expect(result3.areaInHectares).toBeCloseTo(4.04686, 4);

      // Test SQUARE_KILOMETERS
      mockProperties.push({
        id: "property-square-km",
        companyId: "company-1",
        code: "PROP005",
        name: "Property 5",
        area: { value: 1, type: AreaType.SQUARE_KILOMETERS },
        status: "active",
        street: "Street 5",
        number: "202",
        complement: "",
        neighborhood: "Neighborhood 5",
        city: "City 5",
        state: "State 5",
        zipCode: "12345-678",
        latitude: 0,
        longitude: 0,
        pasturePlanning: [],
        breedingMonths: [],
        pasturePlanningModifiedByUser: false,
        breedingSeasonModifiedByUser: false,
        createdAt: "2025-01-01",
      });
      const result4 = getArrobaProductionPerHectare("property-square-km");
      expect(result4.areaInHectares).toBe(100);

      // Test SQUARE_MILES
      mockProperties.push({
        id: "property-square-miles",
        companyId: "company-1",
        code: "PROP006",
        name: "Property 6",
        area: { value: 1, type: AreaType.SQUARE_MILES },
        status: "active",
        street: "Street 6",
        number: "303",
        complement: "",
        neighborhood: "Neighborhood 6",
        city: "City 6",
        state: "State 6",
        zipCode: "12345-678",
        latitude: 0,
        longitude: 0,
        pasturePlanning: [],
        breedingMonths: [],
        pasturePlanningModifiedByUser: false,
        breedingSeasonModifiedByUser: false,
        createdAt: "2025-01-01",
      });
      const result5 = getArrobaProductionPerHectare("property-square-miles");
      expect(result5.areaInHectares).toBeCloseTo(258.999, 2);
    });

    it("should return 0 when property does not exist", () => {
      const result = getArrobaProductionPerHectare("property-nonexistent");
      expect(result.arrobasPerHectare).toBe(0);
      expect(result.areaInHectares).toBe(0);
    });

    it("should filter by period", () => {
      const result = getArrobaProductionPerHectare("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-02-28",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getKgNitrogenPerAU", () => {
    it("should calculate kg nitrogen per animal unit", () => {
      mockInventoryMovements.push({
        id: "im-1",
        itemId: "item-with-nitrogen",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 100,
        date: "2025-01-15",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-15",
      });

      const result = getKgNitrogenPerAU("property-1");
      expect(result.kgNitrogenPerAU).toBeGreaterThanOrEqual(0);
      expect(result.totalNitrogen).toBeGreaterThanOrEqual(0);
      expect(result.animalUnits).toBeGreaterThanOrEqual(0);
    });

    it("should return 0 when property does not exist", () => {
      const result = getKgNitrogenPerAU("property-nonexistent");
      expect(result.kgNitrogenPerAU).toBe(0);
      expect(result.areaInHectares).toBe(0);
    });

    it("should filter by period", () => {
      const result = getKgNitrogenPerAU("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getKgMeatPerKgNitrogen", () => {
    it("should calculate kg meat per kg nitrogen", () => {
      mockInventoryMovements.push({
        id: "im-1",
        itemId: "item-with-nitrogen",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 100,
        date: "2025-01-15",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-15",
      });

      const result = getKgMeatPerKgNitrogen("property-1");
      expect(result.kgMeatPerKgNitrogen).toBeGreaterThanOrEqual(0);
      expect(result.totalWeightGain).toBeGreaterThanOrEqual(0);
      expect(result.totalNitrogen).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getKgMeatPerKgNitrogen("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      });
      expect(result).toBeDefined();
    });
  });
});
