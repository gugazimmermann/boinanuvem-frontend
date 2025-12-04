import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAcquisitions } from "../acquisitions";
import { mockAnimals } from "../animals";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { PricingMode, AcquisitionPaymentMethod, AnimalBreed, BirthPurity } from "~/types";
import * as acquisitionsService from "~/services/acquisitions.service";

describe("acquisitions", () => {
  beforeEach(() => {
    vi.spyOn(acquisitionsService, "generateAcquisitionId").mockImplementation((index: number) => {
      return `acq-${index}`;
    });
  });

  describe("mockAcquisitions", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockAcquisitions)).toBe(true);
    });

    it("should not be empty after initialization", () => {
      expect(mockAcquisitions.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockAcquisitions.forEach((acquisition) => {
        expect(acquisition).toHaveProperty("id");
        expect(acquisition).toHaveProperty("companyId");
        expect(acquisition).toHaveProperty("propertyId");
        expect(acquisition).toHaveProperty("acquisitionDate");
        expect(acquisition).toHaveProperty("pricingMode");
        expect(acquisition).toHaveProperty("paymentMethod");
        expect(acquisition).toHaveProperty("acquisitionItems");
        expect(acquisition).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockAcquisitions.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockAcquisitions.forEach((acquisition) => {
        expect(acquisition.acquisitionDate).toMatch(dateRegex);
        expect(acquisition.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockAcquisitions.forEach((acquisition) => {
        const date = new Date(acquisition.acquisitionDate);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2019);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid pricing modes", () => {
      const validModes = Object.values(PricingMode);
      mockAcquisitions.forEach((acquisition) => {
        expect(validModes).toContain(acquisition.pricingMode);
      });
    });

    it("should have valid payment methods", () => {
      const validMethods = Object.values(AcquisitionPaymentMethod);
      mockAcquisitions.forEach((acquisition) => {
        expect(validMethods).toContain(acquisition.paymentMethod);
      });
    });

    it("should have valid acquisition items", () => {
      mockAcquisitions.forEach((acquisition) => {
        expect(Array.isArray(acquisition.acquisitionItems)).toBe(true);
        expect(acquisition.acquisitionItems.length).toBeGreaterThan(0);
        acquisition.acquisitionItems.forEach((item) => {
          expect(item).toHaveProperty("animalId");
          expect(item).toHaveProperty("price");
          expect(item).toHaveProperty("weight");
          expect(typeof item.price).toBe("number");
          expect(typeof item.weight).toBe("number");
          expect(item.price).toBeGreaterThan(0);
          expect(item.weight).toBeGreaterThan(0);
        });
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockAcquisitions.forEach((acquisition) => {
        expect(companyIds).toContain(acquisition.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockAcquisitions.forEach((acquisition) => {
        expect(propertyIds).toContain(acquisition.propertyId);
      });
    });

    it("should reference valid animal IDs in acquisition items", () => {
      const animalIds = mockAnimals.map((a) => a.id);
      mockAcquisitions.forEach((acquisition) => {
        acquisition.acquisitionItems.forEach((item) => {
          expect(animalIds).toContain(item.animalId);
        });
      });
    });

    it("should have valid breeds when present", () => {
      const validBreeds = Object.values(AnimalBreed);
      mockAcquisitions.forEach((acquisition) => {
        acquisition.acquisitionItems.forEach((item) => {
          if (item.breed) {
            expect(validBreeds).toContain(item.breed);
          }
        });
      });
    });

    it("should have valid genders when present", () => {
      const validGenders = ["male", "female"];
      mockAcquisitions.forEach((acquisition) => {
        acquisition.acquisitionItems.forEach((item) => {
          if (item.gender) {
            expect(validGenders).toContain(item.gender);
          }
        });
      });
    });

    it("should have valid purity when present", () => {
      const validPurities = Object.values(BirthPurity);
      mockAcquisitions.forEach((acquisition) => {
        acquisition.acquisitionItems.forEach((item) => {
          if (item.purity) {
            expect(validPurities).toContain(item.purity);
          }
        });
      });
    });
  });
});
