import { describe, it, expect } from "vitest";
import { mockAnimalMovements } from "../animal-movements";
import type { AnimalMovement } from "~/types";

describe("animal-movements mock", () => {
  it("should export mockAnimalMovements array", () => {
    expect(Array.isArray(mockAnimalMovements)).toBe(true);
    expect(mockAnimalMovements.length).toBeGreaterThan(0);
  });

  it("should have valid movement structure", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      expect(movement).toHaveProperty("id");
      expect(movement).toHaveProperty("date");
      expect(movement).toHaveProperty("propertyId");
      expect(movement).toHaveProperty("locationId");
      expect(movement).toHaveProperty("animalIds");
      expect(movement).toHaveProperty("companyId");
      expect(movement).toHaveProperty("createdAt");

      expect(typeof movement.id).toBe("string");
      expect(typeof movement.date).toBe("string");
      expect(typeof movement.propertyId).toBe("string");
      expect(typeof movement.locationId).toBe("string");
      expect(Array.isArray(movement.animalIds)).toBe(true);
      expect(typeof movement.companyId).toBe("string");
      expect(typeof movement.createdAt).toBe("string");
    });
  });

  it("should have valid date format (2020-2025)", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      expect(movement.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(movement.date);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have unique IDs", () => {
    const ids = mockAnimalMovements.map((movement) => movement.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have movements for animals", () => {
    const uniqueAnimalIds = new Set<string>();
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      movement.animalIds.forEach((id: string) => uniqueAnimalIds.add(id));
    });

    expect(uniqueAnimalIds.size).toBeGreaterThan(0);
    expect(mockAnimalMovements.length).toBeGreaterThan(0);
  });

  it("should have movements sorted by date (most recent first)", () => {
    const sortedMovements = [...mockAnimalMovements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    expect(sortedMovements).toEqual(mockAnimalMovements);
  });

  it("should have movements with valid dates", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      const movementDate = new Date(movement.date);
      expect(movementDate.toString()).not.toBe("Invalid Date");
      expect(movementDate.getFullYear()).toBeGreaterThanOrEqual(2020);
      expect(movementDate.getFullYear()).toBeLessThanOrEqual(2025);
    });
  });
});
