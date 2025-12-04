import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLocationIds,
  getLocationNamesForSearch,
  getLocationNamesForSort,
  getEntityNames,
  getAnimalNames,
} from "../movements-helpers";
import type { LocationMovement, AnimalMovement } from "~/types";
import { LocationMovementType } from "~/types";

describe("movements-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLocationIds", () => {
    it("should return locationIds for location movement", () => {
      const movement = {
        id: "movement-1",
        movementType: "location" as const,
        locationIds: ["loc-1", "loc-2", "loc-3"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
        type: LocationMovementType.OTHER,
        date: "2024-01-01",
      } as LocationMovement & { movementType: "location" } & Record<string, unknown>;

      const result = getLocationIds(movement);
      expect(result).toEqual(["loc-1", "loc-2", "loc-3"]);
    });

    it("should return single locationId for animal movement", () => {
      const movement = {
        id: "movement-1",
        movementType: "animal" as const,
        locationId: "loc-1",
        date: "2024-01-01",
        companyId: "company-1",
        propertyId: "prop-1",
        animalIds: [],
        employeeIds: [],
        serviceProviderIds: [],
      } as AnimalMovement & { movementType: "animal" } & Record<string, unknown>;

      const result = getLocationIds(movement);
      expect(result).toEqual(["loc-1"]);
    });
  });

  describe("getLocationNamesForSearch", () => {
    it("should return location names and codes for search", () => {
      const getLocationById = vi.fn((id: string) => {
        const locations: Record<string, { name: string; code: string }> = {
          "loc-1": { name: "Location One", code: "LOC1" },
          "loc-2": { name: "Location Two", code: "LOC2" },
        };
        return locations[id] || null;
      });

      const result = getLocationNamesForSearch(["loc-1", "loc-2"], getLocationById);
      expect(result).toBe("location one loc1 location two loc2");
    });

    it("should return id when location not found", () => {
      const getLocationById = vi.fn(() => null);

      const result = getLocationNamesForSearch(["loc-1"], getLocationById);
      expect(result).toBe("loc-1");
    });

    it("should handle empty array", () => {
      const getLocationById = vi.fn();
      const result = getLocationNamesForSearch([], getLocationById);
      expect(result).toBe("");
    });

    it("should handle mixed found and not found locations", () => {
      const getLocationById = vi.fn((id: string) => {
        if (id === "loc-1") {
          return { name: "Location One", code: "LOC1" };
        }
        return null;
      });

      const result = getLocationNamesForSearch(["loc-1", "loc-unknown"], getLocationById);
      expect(result).toBe("location one loc1 loc-unknown");
    });
  });

  describe("getLocationNamesForSort", () => {
    it("should return sorted location names with codes", () => {
      const getLocationById = vi.fn((id: string) => {
        const locations: Record<string, { name: string; code: string }> = {
          "loc-2": { name: "Location Two", code: "LOC2" },
          "loc-1": { name: "Location One", code: "LOC1" },
        };
        return locations[id] || null;
      });

      const result = getLocationNamesForSort(["loc-2", "loc-1"], getLocationById);
      expect(result).toBe("Location One (LOC1), Location Two (LOC2)");
    });

    it("should return id when location not found", () => {
      const getLocationById = vi.fn(() => null);

      const result = getLocationNamesForSort(["loc-1"], getLocationById);
      expect(result).toBe("loc-1");
    });

    it("should handle empty array", () => {
      const getLocationById = vi.fn();
      const result = getLocationNamesForSort([], getLocationById);
      expect(result).toBe("");
    });

    it("should sort locations alphabetically", () => {
      const getLocationById = vi.fn((id: string) => {
        const locations: Record<string, { name: string; code: string }> = {
          "loc-3": { name: "Zebra Location", code: "ZEB" },
          "loc-1": { name: "Alpha Location", code: "ALP" },
          "loc-2": { name: "Beta Location", code: "BET" },
        };
        return locations[id] || null;
      });

      const result = getLocationNamesForSort(["loc-3", "loc-1", "loc-2"], getLocationById);
      expect(result).toBe("Alpha Location (ALP), Beta Location (BET), Zebra Location (ZEB)");
    });
  });

  describe("getEntityNames", () => {
    it("should return entity names in lowercase", () => {
      const getEntityById = vi.fn((id: string) => {
        const entities: Record<string, { name: string }> = {
          "entity-1": { name: "Entity One" },
          "entity-2": { name: "Entity Two" },
        };
        return entities[id] || null;
      });

      const result = getEntityNames(["entity-1", "entity-2"], getEntityById);
      expect(result).toBe("entity one entity two");
    });

    it("should filter out empty names", () => {
      const getEntityById = vi.fn((id: string) => {
        if (id === "entity-1") {
          return { name: "Entity One" };
        }
        return null;
      });

      const result = getEntityNames(["entity-1", "entity-unknown"], getEntityById);
      expect(result).toBe("entity one");
    });

    it("should handle empty array", () => {
      const getEntityById = vi.fn();
      const result = getEntityNames([], getEntityById);
      expect(result).toBe("");
    });
  });

  describe("getAnimalNames", () => {
    it("should return animal codes and registration numbers", () => {
      const getAnimalById = vi.fn((id: string) => {
        const animals: Record<string, { code: string; registrationNumber: string }> = {
          "animal-1": { code: "A001", registrationNumber: "REG001" },
          "animal-2": { code: "A002", registrationNumber: "REG002" },
        };
        return animals[id] || null;
      });

      const result = getAnimalNames(["animal-1", "animal-2"], getAnimalById);
      expect(result).toBe("a001 reg001 a002 reg002");
    });

    it("should filter out animals not found", () => {
      const getAnimalById = vi.fn((id: string) => {
        if (id === "animal-1") {
          return { code: "A001", registrationNumber: "REG001" };
        }
        return null;
      });

      const result = getAnimalNames(["animal-1", "animal-unknown"], getAnimalById);
      expect(result).toBe("a001 reg001");
    });

    it("should handle empty array", () => {
      const getAnimalById = vi.fn();
      const result = getAnimalNames([], getAnimalById);
      expect(result).toBe("");
    });

    it("should handle animals with empty registration numbers", () => {
      const getAnimalById = vi.fn((id: string) => {
        if (id === "animal-1") {
          return { code: "A001", registrationNumber: "" };
        }
        return null;
      });

      const result = getAnimalNames(["animal-1"], getAnimalById);
      expect(result).toBe("a001 ");
    });
  });
});
