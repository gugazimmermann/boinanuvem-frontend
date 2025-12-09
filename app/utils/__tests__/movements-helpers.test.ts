import { describe, it, expect } from "vitest";
import {
  getLocationIds,
  getLocationNamesForSearch,
  getLocationNamesForSort,
  getEntityNames,
  getAnimalNames,
} from "../movements-helpers";
import { LocationMovementType } from "~/types";
import type { UnifiedMovement } from "~/components/dashboard/movements/movements-section";

describe("getLocationIds", () => {
  it("should return locationIds for location movement", () => {
    const movement: UnifiedMovement = {
      id: "mov-1",
      movementType: "location",
      locationIds: ["loc-1", "loc-2"],
      date: "2024-01-01",
      companyId: "company-1",
      propertyId: "prop-1",
      type: LocationMovementType.FEED_DELIVERY,
      employeeIds: [],
      serviceProviderIds: [],
    } as UnifiedMovement;
    expect(getLocationIds(movement)).toEqual(["loc-1", "loc-2"]);
  });

  it("should return locationId array for animal movement", () => {
    const movement: UnifiedMovement = {
      id: "mov-1",
      movementType: "animal",
      locationId: "loc-1",
      animalIds: ["animal-1"],
      date: "2024-01-01",
      companyId: "company-1",
      propertyId: "prop-1",
      employeeIds: [],
      serviceProviderIds: [],
    } as UnifiedMovement;
    expect(getLocationIds(movement)).toEqual(["loc-1"]);
  });
});

describe("getLocationNamesForSearch", () => {
  const getLocationById = (id: string) => {
    if (id === "loc-1") return { name: "Location One", code: "LOC-001" };
    if (id === "loc-2") return { name: "Location Two", code: "LOC-002" };
    return null;
  };

  it("should return lowercase location names and codes", () => {
    const result = getLocationNamesForSearch(["loc-1", "loc-2"], getLocationById);
    expect(result).toBe("location one loc-001 location two loc-002");
  });

  it("should handle missing locations", () => {
    const result = getLocationNamesForSearch(["loc-1", "non-existent"], getLocationById);
    expect(result).toContain("location one");
    expect(result).toContain("non-existent");
  });

  it("should handle empty array", () => {
    const result = getLocationNamesForSearch([], getLocationById);
    expect(result).toBe("");
  });
});

describe("getLocationNamesForSort", () => {
  const getLocationById = (id: string) => {
    if (id === "loc-1") return { name: "Location One", code: "LOC-001" };
    if (id === "loc-2") return { name: "Location Two", code: "LOC-002" };
    return null;
  };

  it("should return sorted location names with codes", () => {
    const result = getLocationNamesForSort(["loc-2", "loc-1"], getLocationById);
    expect(result).toBe("Location One (LOC-001), Location Two (LOC-002)");
  });

  it("should handle missing locations", () => {
    const result = getLocationNamesForSort(["non-existent"], getLocationById);
    expect(result).toBe("non-existent");
  });
});

describe("getEntityNames", () => {
  const getEntityById = (id: string) => {
    if (id === "emp-1") return { name: "Employee One" };
    return null;
  };

  it("should return lowercase entity names", () => {
    const result = getEntityNames(["emp-1"], getEntityById);
    expect(result).toBe("employee one");
  });

  it("should filter out empty names", () => {
    const result = getEntityNames(["emp-1", "non-existent"], getEntityById);
    expect(result).toBe("employee one");
  });

  it("should handle empty array", () => {
    const result = getEntityNames([], getEntityById);
    expect(result).toBe("");
  });
});

describe("getAnimalNames", () => {
  const getAnimalById = (id: string) => {
    if (id === "animal-1") return { code: "ANIMAL-001", registrationNumber: "REG-001" };
    return null;
  };

  it("should return lowercase animal codes and registration numbers", () => {
    const result = getAnimalNames(["animal-1"], getAnimalById);
    expect(result).toBe("animal-001 reg-001");
  });

  it("should filter out empty names", () => {
    const result = getAnimalNames(["animal-1", "non-existent"], getAnimalById);
    expect(result).toBe("animal-001 reg-001");
  });
});
