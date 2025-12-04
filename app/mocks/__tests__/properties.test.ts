import { describe, it, expect } from "vitest";
import { mockProperties } from "../properties";
import { mockCompanies } from "../companies";
import { AreaType } from "~/types";

describe("properties", () => {
  describe("mockProperties", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockProperties)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockProperties.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockProperties.forEach((property) => {
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
        expect(property).toHaveProperty("pasturePlanningModifiedByUser");
        expect(property).toHaveProperty("breedingSeasonModifiedByUser");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockProperties.map((property) => property.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockProperties.forEach((property) => {
        expect(property.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockProperties.forEach((property) => {
        expect(property.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockProperties.forEach((property) => {
        const date = new Date(property.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid area structure", () => {
      mockProperties.forEach((property) => {
        expect(property.area).toHaveProperty("value");
        expect(property.area).toHaveProperty("type");
        expect(typeof property.area.value).toBe("number");
        expect(property.area.value).toBeGreaterThan(0);
      });
    });

    it("should have valid area types", () => {
      const validAreaTypes = Object.values(AreaType);
      mockProperties.forEach((property) => {
        expect(validAreaTypes).toContain(property.area.type);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockProperties.forEach((property) => {
        expect(validStatuses).toContain(property.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockProperties.forEach((property) => {
        expect(companyIds).toContain(property.companyId);
      });
    });

    it("should have valid coordinates", () => {
      mockProperties.forEach((property) => {
        expect(typeof property.latitude).toBe("number");
        expect(typeof property.longitude).toBe("number");
        expect(property.latitude).toBeGreaterThanOrEqual(-90);
        expect(property.latitude).toBeLessThanOrEqual(90);
        expect(property.longitude).toBeGreaterThanOrEqual(-180);
        expect(property.longitude).toBeLessThanOrEqual(180);
      });
    });

    it("should have valid pasture planning structure", () => {
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
      mockProperties.forEach((property) => {
        if (property.pasturePlanning) {
          expect(Array.isArray(property.pasturePlanning)).toBe(true);
          expect(property.pasturePlanning.length).toBe(12);
          property.pasturePlanning.forEach((plan) => {
            expect(plan).toHaveProperty("month");
            expect(plan).toHaveProperty("min");
            expect(plan).toHaveProperty("max");
            expect(plan).toHaveProperty("precipitation");
            expect(plan).toHaveProperty("classification");
            expect(validMonths).toContain(plan.month);
            expect(typeof plan.min).toBe("number");
            expect(typeof plan.max).toBe("number");
            expect(typeof plan.precipitation).toBe("number");
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
      mockProperties.forEach((property) => {
        if (property.breedingMonths) {
          expect(Array.isArray(property.breedingMonths)).toBe(true);
          property.breedingMonths.forEach((month) => {
            expect(validMonths).toContain(month);
          });
        }
      });
    });

    it("should have boolean flags for user modifications", () => {
      mockProperties.forEach((property) => {
        expect(typeof property.pasturePlanningModifiedByUser).toBe("boolean");
        expect(typeof property.breedingSeasonModifiedByUser).toBe("boolean");
      });
    });
  });
});
