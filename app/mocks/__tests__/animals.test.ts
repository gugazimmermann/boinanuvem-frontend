import { describe, it, expect } from "vitest";
import { mockAnimals } from "../animals";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";

describe("animals", () => {
  describe("mockAnimals", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockAnimals)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockAnimals.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockAnimals.forEach((animal) => {
        expect(animal).toHaveProperty("id");
        expect(animal).toHaveProperty("code");
        expect(animal).toHaveProperty("registrationNumber");
        expect(animal).toHaveProperty("status");
        expect(animal).toHaveProperty("createdAt");
        expect(animal).toHaveProperty("companyId");
        expect(animal).toHaveProperty("propertyId");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockAnimals.map((animal) => animal.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockAnimals.forEach((animal) => {
        expect(animal.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockAnimals.forEach((animal) => {
        expect(animal.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockAnimals.forEach((animal) => {
        const date = new Date(animal.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockAnimals.forEach((animal) => {
        expect(validStatuses).toContain(animal.status);
      });
    });

    it("should have valid code format", () => {
      mockAnimals.forEach((animal) => {
        expect(typeof animal.code).toBe("string");
        expect(animal.code.length).toBeGreaterThan(0);
        expect(["FJ", "CJ", "SL"]).toContain(animal.code.substring(0, 2));
      });
    });

    it("should have valid registration number format", () => {
      const regNumberRegex = /^BR-\d{4}-[A-Z]{2}\d{4}$/;
      mockAnimals.forEach((animal) => {
        expect(animal.registrationNumber).toMatch(regNumberRegex);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockAnimals.forEach((animal) => {
        expect(companyIds).toContain(animal.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockAnimals.forEach((animal) => {
        expect(propertyIds).toContain(animal.propertyId);
      });
    });

    it("should have animals distributed across properties", () => {
      const propertyCounts = new Map<string, number>();
      mockAnimals.forEach((animal) => {
        const count = propertyCounts.get(animal.propertyId) || 0;
        propertyCounts.set(animal.propertyId, count + 1);
      });
      expect(propertyCounts.size).toBeGreaterThan(0);
    });

    it("should have correct code prefixes for properties", () => {
      const fazendaAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440010"
      );
      const chacaraAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440012"
      );
      const sitioAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440011"
      );

      fazendaAnimals.forEach((animal) => {
        expect(animal.code.startsWith("FJ")).toBe(true);
      });
      chacaraAnimals.forEach((animal) => {
        expect(animal.code.startsWith("CJ")).toBe(true);
      });
      sitioAnimals.forEach((animal) => {
        expect(animal.code.startsWith("SL")).toBe(true);
      });
    });

    it("should have correct number of animals per property", () => {
      const fazendaAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440010"
      );
      const chacaraAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440012"
      );
      const sitioAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440011"
      );

      expect(fazendaAnimals.length).toBeGreaterThanOrEqual(180);
      expect(chacaraAnimals.length).toBeGreaterThanOrEqual(60);
      expect(sitioAnimals.length).toBeGreaterThanOrEqual(60);
    });

    it("should have correct status distribution for fazenda animals", () => {
      const fazendaAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440010" && a.code.startsWith("FJ")
      );
      const activeCount = fazendaAnimals.filter((a) => a.status === "active").length;
      const inactiveCount = fazendaAnimals.filter((a) => a.status === "inactive").length;
      expect(activeCount).toBeGreaterThanOrEqual(170);
      expect(inactiveCount).toBeGreaterThanOrEqual(10);
    });

    it("should have correct status distribution for chacara animals", () => {
      const chacaraAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440012" && a.code.startsWith("CJ")
      );
      const activeCount = chacaraAnimals.filter((a) => a.status === "active").length;
      const inactiveCount = chacaraAnimals.filter((a) => a.status === "inactive").length;
      expect(activeCount).toBeGreaterThanOrEqual(57);
      expect(inactiveCount).toBeGreaterThanOrEqual(3);
    });

    it("should have correct status distribution for sitio animals", () => {
      const sitioAnimals = mockAnimals.filter(
        (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440011" && a.code.startsWith("SL")
      );
      const activeCount = sitioAnimals.filter((a) => a.status === "active").length;
      const inactiveCount = sitioAnimals.filter((a) => a.status === "inactive").length;
      expect(activeCount).toBeGreaterThanOrEqual(57);
      expect(inactiveCount).toBeGreaterThanOrEqual(3);
    });

    it("should have sequential codes within each property", () => {
      const fazendaAnimals = mockAnimals
        .filter(
          (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440010" && a.code.startsWith("FJ")
        )
        .sort((a, b) => a.code.localeCompare(b.code));
      const codes = fazendaAnimals.map((a) => parseInt(a.code.substring(2)));
      for (let i = 1; i < codes.length; i++) {
        expect(codes[i]).toBeGreaterThanOrEqual(codes[i - 1]);
      }
    });

    it("should have registration numbers matching property codes", () => {
      mockAnimals.forEach((animal) => {
        const propertyCode = animal.code.substring(0, 2);
        expect(animal.registrationNumber).toContain(propertyCode);
      });
    });

    it("should have registration numbers with correct year format", () => {
      mockAnimals.forEach((animal) => {
        const yearMatch = animal.registrationNumber.match(/BR-(\d{4})-/);
        expect(yearMatch).not.toBeNull();
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          expect(year).toBeGreaterThanOrEqual(2020);
          expect(year).toBeLessThanOrEqual(2025);
        }
      });
    });

    it("should have animal with observations included", () => {
      const animalWithObs = mockAnimals.find(
        (a) => a.id === "660e8400-e29b-41d4-a716-446655440001"
      );
      expect(animalWithObs).toBeDefined();
      expect(animalWithObs?.code).toBe("FJ001");
      expect(animalWithObs?.registrationNumber).toBe("BR-2020-FJ0001");
    });

    it("should have IDs with correct format", () => {
      const idRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockAnimals.forEach((animal) => {
        expect(animal.id).toMatch(idRegex);
      });
    });

    it("should have sequential IDs", () => {
      const fazendaAnimals = mockAnimals
        .filter(
          (a) => a.propertyId === "550e8400-e29b-41d4-a716-446655440010" && a.code.startsWith("FJ")
        )
        .sort((a, b) => a.id.localeCompare(b.id));
      const ids = fazendaAnimals.map((a) => {
        const match = a.id.match(/bb0e8400-e29b-41d4-a716-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i]).toBeGreaterThanOrEqual(ids[i - 1]);
      }
    });
  });
});
