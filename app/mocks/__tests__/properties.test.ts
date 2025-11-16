import { describe, it, expect } from "vitest";
import { mockProperties } from "../properties";
import type { Property } from "~/types";
import { AreaType } from "~/types";

describe("properties mock", () => {
  it("should export mockProperties array", () => {
    expect(Array.isArray(mockProperties)).toBe(true);
    expect(mockProperties.length).toBeGreaterThan(0);
  });

  it("should have valid property structure", () => {
    mockProperties.forEach((property: Property) => {
      expect(property).toHaveProperty("id");
      expect(property).toHaveProperty("code");
      expect(property).toHaveProperty("name");
      expect(property).toHaveProperty("area");
      expect(property).toHaveProperty("status");
      expect(property).toHaveProperty("createdAt");
      expect(property).toHaveProperty("companyId");
      expect(property).toHaveProperty("street");
      expect(property).toHaveProperty("number");
      expect(property).toHaveProperty("neighborhood");
      expect(property).toHaveProperty("city");
      expect(property).toHaveProperty("state");
      expect(property).toHaveProperty("zipCode");
      expect(property).toHaveProperty("latitude");
      expect(property).toHaveProperty("longitude");
      expect(property).toHaveProperty("pasturePlanning");
      expect(property).toHaveProperty("breedingMonths");

      expect(typeof property.id).toBe("string");
      expect(typeof property.code).toBe("string");
      expect(typeof property.name).toBe("string");
      expect(typeof property.status).toBe("string");
      expect(typeof property.createdAt).toBe("string");
      expect(typeof property.companyId).toBe("string");
      expect(typeof property.street).toBe("string");
      expect(typeof property.number).toBe("string");
      expect(typeof property.neighborhood).toBe("string");
      expect(typeof property.city).toBe("string");
      expect(typeof property.state).toBe("string");
      expect(typeof property.zipCode).toBe("string");
      expect(typeof property.latitude).toBe("number");
      expect(typeof property.longitude).toBe("number");
      expect(Array.isArray(property.pasturePlanning)).toBe(true);
      expect(Array.isArray(property.breedingMonths)).toBe(true);
    });
  });

  it("should have valid area structure", () => {
    mockProperties.forEach((property: Property) => {
      expect(property.area).toHaveProperty("value");
      expect(property.area).toHaveProperty("type");
      expect(typeof property.area.value).toBe("number");
      expect(typeof property.area.type).toBe("string");
      expect(property.area.value).toBeGreaterThan(0);
      expect(Object.values(AreaType)).toContain(property.area.type);
    });
  });

  it("should have valid coordinates", () => {
    mockProperties.forEach((property: Property) => {
      expect(property.latitude).toBeGreaterThanOrEqual(-90);
      expect(property.latitude).toBeLessThanOrEqual(90);
      expect(property.longitude).toBeGreaterThanOrEqual(-180);
      expect(property.longitude).toBeLessThanOrEqual(180);
    });
  });

  it("should have valid pasture planning structure", () => {
    mockProperties.forEach((property: Property) => {
      expect(property.pasturePlanning?.length).toBe(12);
      property.pasturePlanning?.forEach((plan) => {
        expect(plan).toHaveProperty("month");
        expect(plan).toHaveProperty("min");
        expect(plan).toHaveProperty("max");
        expect(plan).toHaveProperty("precipitation");
        expect(plan).toHaveProperty("classification");
        expect(typeof plan.month).toBe("string");
        expect(typeof plan.min).toBe("number");
        expect(typeof plan.max).toBe("number");
        expect(typeof plan.precipitation).toBe("number");
        expect(typeof plan.classification).toBe("string");
      });
    });
  });

  it("should have all 12 months in pasture planning", () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    mockProperties.forEach((property: Property) => {
      const planningMonths = property.pasturePlanning?.map((p) => p.month);
      months.forEach((month) => {
        expect(planningMonths).toContain(month);
      });
    });
  });

  it("should have valid classification in pasture planning", () => {
    const validClassifications = ["Excellent", "Good", "Fair", "Poor"];
    mockProperties.forEach((property: Property) => {
      if (property.pasturePlanning) {
        property.pasturePlanning.forEach((plan) => {
          expect(validClassifications).toContain(plan.classification);
        });
      }
    });
  });

  it("should have valid breeding months", () => {
    const validMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    mockProperties.forEach((property: Property) => {
      property.breedingMonths?.forEach((month) => {
        expect(validMonths).toContain(month);
      });
    });
  });

  it("should have valid date format", () => {
    mockProperties.forEach((property: Property) => {
      expect(property.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(property.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockProperties.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique codes", () => {
    const codes = mockProperties.map((p) => p.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});
