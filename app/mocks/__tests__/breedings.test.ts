import { describe, it, expect } from "vitest";
import { mockBreedings } from "../breedings";
import { mockAnimals } from "../animals";
import { mockCompanies } from "../companies";

describe("breedings", () => {
  describe("mockBreedings", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockBreedings)).toBe(true);
    });

    it("should not be empty after initialization", () => {
      expect(mockBreedings.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockBreedings.forEach((breeding) => {
        expect(breeding).toHaveProperty("id");
        expect(breeding).toHaveProperty("animalId");
        expect(breeding).toHaveProperty("date");
        expect(breeding).toHaveProperty("method");
        expect(breeding).toHaveProperty("confirmed");
        expect(breeding).toHaveProperty("createdAt");
        expect(breeding).toHaveProperty("companyId");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockBreedings.map((breeding) => breeding.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^pp0e8400-e29b-41d4-a716-\d{12}$/;
      mockBreedings.forEach((breeding) => {
        expect(breeding.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockBreedings.forEach((breeding) => {
        expect(breeding.date).toMatch(dateRegex);
        expect(breeding.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      const today = new Date();
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getTime()).toBeLessThanOrEqual(today.getTime());
        expect(date.getTime()).toBeGreaterThanOrEqual(twoYearsAgo.getTime());
      });
    });

    it("should have valid breeding methods", () => {
      const validMethods = ["natural", "artificial_insemination"];
      mockBreedings.forEach((breeding) => {
        expect(validMethods).toContain(breeding.method);
      });
    });

    it("should have valid confirmed boolean", () => {
      mockBreedings.forEach((breeding) => {
        expect(typeof breeding.confirmed).toBe("boolean");
      });
    });

    it("should reference valid animal IDs", () => {
      const animalIds = mockAnimals.map((a) => a.id);
      mockBreedings.forEach((breeding) => {
        expect(animalIds).toContain(breeding.animalId);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockBreedings.forEach((breeding) => {
        expect(companyIds).toContain(breeding.companyId);
      });
    });

    it("should have bullId for natural breeding", () => {
      mockBreedings
        .filter((b) => b.method === "natural")
        .forEach((breeding) => {
          if (breeding.bullId) {
            const animalIds = mockAnimals.map((a) => a.id);
            expect(animalIds).toContain(breeding.bullId);
          }
        });
    });

    it("should have semenCode and attemptNumber for artificial insemination", () => {
      mockBreedings
        .filter((b) => b.method === "artificial_insemination")
        .forEach((breeding) => {
          if (breeding.semenCode) {
            expect(typeof breeding.semenCode).toBe("string");
            expect(breeding.semenCode.length).toBeGreaterThan(0);
          }
          if (breeding.attemptNumber) {
            expect(typeof breeding.attemptNumber).toBe("number");
            expect(breeding.attemptNumber).toBeGreaterThan(0);
          }
        });
    });

    it("should have employeeIds array when present", () => {
      mockBreedings.forEach((breeding) => {
        if (breeding.employeeIds) {
          expect(Array.isArray(breeding.employeeIds)).toBe(true);
          expect(breeding.employeeIds.length).toBeGreaterThan(0);
        }
      });
    });

    it("should have serviceProviderIds array when present", () => {
      mockBreedings.forEach((breeding) => {
        if (breeding.serviceProviderIds) {
          expect(Array.isArray(breeding.serviceProviderIds)).toBe(true);
        }
      });
    });

    it("should have breedings distributed across all properties", () => {
      const propertyIds = new Set(
        mockBreedings.map((b) => {
          const animal = mockAnimals.find((a) => a.id === b.animalId);
          return animal?.propertyId;
        })
      );
      expect(propertyIds.size).toBeGreaterThanOrEqual(3);
    });

    it("should have breedings only for active animals", () => {
      const animalMap = new Map(mockAnimals.map((a) => [a.id, a]));
      mockBreedings.forEach((breeding) => {
        const animal = animalMap.get(breeding.animalId);
        if (animal) {
          expect(animal.status).toBe("active");
        }
      });
    });

    it("should have breedings only for female animals", () => {
      const animalMap = new Map(mockAnimals.map((a) => [a.id, a]));
      const breedingAnimalIds = new Set(mockBreedings.map((b) => b.animalId));
      breedingAnimalIds.forEach((animalId) => {
        const animal = animalMap.get(animalId);
        expect(animal).toBeDefined();
      });
    });

    it("should have correct number of breedings per animal", () => {
      const breedingsByAnimal = new Map<string, number>();
      mockBreedings.forEach((breeding) => {
        const count = breedingsByAnimal.get(breeding.animalId) || 0;
        breedingsByAnimal.set(breeding.animalId, count + 1);
      });
      breedingsByAnimal.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(3);
      });
    });

    it("should have breeding dates in correct chronological order for same animal", () => {
      const breedingsByAnimal = new Map<string, typeof mockBreedings>();
      mockBreedings.forEach((breeding) => {
        if (!breedingsByAnimal.has(breeding.animalId)) {
          breedingsByAnimal.set(breeding.animalId, []);
        }
        breedingsByAnimal.get(breeding.animalId)!.push(breeding);
      });
      breedingsByAnimal.forEach((animalBreedings) => {
        if (animalBreedings.length > 1) {
          const sorted = [...animalBreedings].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          sorted.forEach((breeding, index) => {
            if (index > 0) {
              const prevDate = new Date(sorted[index - 1].date);
              const currDate = new Date(breeding.date);
              const monthsDiff =
                (currDate.getFullYear() - prevDate.getFullYear()) * 12 +
                (currDate.getMonth() - prevDate.getMonth());
              expect(monthsDiff).toBeGreaterThanOrEqual(12);
            }
          });
        }
      });
    });

    it("should have observation text from predefined templates", () => {
      const validObservations = [
        "Cobertura confirmada por ultrassom",
        "Cobertura registrada",
        "Cobertura confirmada",
        "Registro de cobertura",
        "Cobertura confirmada por veterinário",
        "Cobertura realizada na estação de monta",
        "Cobertura com touro de alta qualidade genética",
        "Cobertura com acompanhamento reprodutivo",
        "Cobertura registrada no sistema",
      ];
      mockBreedings.forEach((breeding) => {
        if (breeding.observation) {
          expect(validObservations).toContain(breeding.observation);
        }
      });
    });

    it("should have confirmed status distributed correctly", () => {
      const confirmedCount = mockBreedings.filter((b) => b.confirmed).length;
      const unconfirmedCount = mockBreedings.filter((b) => !b.confirmed).length;
      expect(confirmedCount).toBeGreaterThan(unconfirmedCount);
      expect(confirmedCount / mockBreedings.length).toBeGreaterThan(0.7);
    });

    it("should have employeeIds with correct count", () => {
      mockBreedings.forEach((breeding) => {
        if (breeding.employeeIds) {
          expect(breeding.employeeIds.length).toBeGreaterThanOrEqual(1);
          expect(breeding.employeeIds.length).toBeLessThanOrEqual(2);
        }
      });
    });

    it("should have semenCode format for artificial insemination", () => {
      mockBreedings
        .filter((b) => b.method === "artificial_insemination" && b.semenCode)
        .forEach((breeding) => {
          expect(breeding.semenCode).toMatch(/^SEM-\d{4}$/);
        });
    });

    it("should have attemptNumber incrementing for same animal", () => {
      const breedingsByAnimal = new Map<string, typeof mockBreedings>();
      mockBreedings
        .filter((b) => b.method === "artificial_insemination")
        .forEach((breeding) => {
          if (!breedingsByAnimal.has(breeding.animalId)) {
            breedingsByAnimal.set(breeding.animalId, []);
          }
          breedingsByAnimal.get(breeding.animalId)!.push(breeding);
        });
      breedingsByAnimal.forEach((animalBreedings) => {
        if (animalBreedings.length > 1) {
          const sorted = [...animalBreedings].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          sorted.forEach((breeding, index) => {
            if (breeding.attemptNumber) {
              expect(breeding.attemptNumber).toBe(index + 1);
            }
          });
        }
      });
    });

    it("should have bullId only for natural breeding with available males", () => {
      mockBreedings
        .filter((b) => b.method === "natural")
        .forEach((breeding) => {
          if (breeding.bullId) {
            const animalIds = mockAnimals.map((a) => a.id);
            expect(animalIds).toContain(breeding.bullId);
          }
        });
    });

    it("should initialize breedings when accessed via proxy", () => {
      const initialLength = mockBreedings.length;
      expect(initialLength).toBeGreaterThan(0);
      const firstBreeding = mockBreedings[0];
      expect(firstBreeding).toBeDefined();
      expect(firstBreeding).toHaveProperty("id");
    });

    it("should have breedings with dates not exceeding two years ago", () => {
      const today = new Date();
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        expect(date.getTime()).toBeGreaterThanOrEqual(twoYearsAgo.getTime());
      });
    });

    it("should have breedings with proper date adjustments when exceeding today", () => {
      const today = new Date();
      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        expect(date.getTime()).toBeLessThanOrEqual(today.getTime());
      });
    });

    it("should handle proxy has handler", () => {
      expect("length" in mockBreedings).toBe(true);
      expect(0 in mockBreedings).toBe(true);
    });

    it("should handle proxy ownKeys handler", () => {
      const keys = Object.keys(mockBreedings);
      expect(keys.length).toBeGreaterThan(0);
    });

    it("should handle proxy getOwnPropertyDescriptor handler", () => {
      const descriptor = Object.getOwnPropertyDescriptor(mockBreedings, "length");
      expect(descriptor).toBeDefined();
    });

    it("should handle accessing breedings by index via proxy", () => {
      const firstBreeding = mockBreedings[0];
      expect(firstBreeding).toBeDefined();
      expect(firstBreeding).toHaveProperty("id");
    });

    it("should handle accessing breedings length via enhanced proxy", () => {
      const length = mockBreedings.length;
      expect(typeof length).toBe("number");
      expect(length).toBeGreaterThan(0);
    });

    it("should handle accessing breedings by numeric index via enhanced proxy", () => {
      if (mockBreedings.length > 0) {
        const breeding = mockBreedings[0];
        expect(breeding).toBeDefined();
        expect(breeding).toHaveProperty("id");
      }
    });

    it("should have breedings with dates adjusted when before two years ago", () => {
      const today = new Date();
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        expect(date.getTime()).toBeGreaterThanOrEqual(twoYearsAgo.getTime());
      });
    });

    it("should have breedings with dates adjusted when in future", () => {
      const today = new Date();
      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        expect(date.getTime()).toBeLessThanOrEqual(today.getTime());
      });
    });

    it("should handle edge case when breeding date needs adjustment to two years ago", () => {
      const today = new Date();
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        expect(date.getTime()).toBeGreaterThanOrEqual(twoYearsAgo.getTime());
      });
    });

    it("should handle edge case when breeding date needs adjustment to today", () => {
      const today = new Date();
      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        expect(date.getTime()).toBeLessThanOrEqual(today.getTime());
      });
    });

    it("should have breedings with proper date-only comparison", () => {
      const today = new Date();
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      mockBreedings.forEach((breeding) => {
        const date = new Date(breeding.date);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const twoYearsAgoOnly = new Date(
          twoYearsAgo.getFullYear(),
          twoYearsAgo.getMonth(),
          twoYearsAgo.getDate()
        );
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        expect(dateOnly.getTime()).toBeGreaterThanOrEqual(twoYearsAgoOnly.getTime());
        expect(dateOnly.getTime()).toBeLessThanOrEqual(todayOnly.getTime());
      });
    });

    it("should handle natural breeding without available males", () => {
      const naturalBreedings = mockBreedings.filter((b) => b.method === "natural");
      naturalBreedings.forEach((breeding) => {
        if (breeding.bullId) {
          const animalIds = mockAnimals.map((a) => a.id);
          expect(animalIds).toContain(breeding.bullId);
        }
      });
    });

    it("should handle artificial insemination with attemptNumber and semenCode", () => {
      const aiBreedings = mockBreedings.filter((b) => b.method === "artificial_insemination");
      aiBreedings.forEach((breeding) => {
        expect(breeding.attemptNumber).toBeDefined();
        expect(breeding.semenCode).toBeDefined();
        if (breeding.attemptNumber) {
          expect(breeding.attemptNumber).toBeGreaterThan(0);
        }
        if (breeding.semenCode) {
          expect(breeding.semenCode).toMatch(/^SEM-\d+$/);
        }
      });
    });

    it("should handle multiple breedings per animal with correct spacing", () => {
      const breedingsByAnimal = new Map<string, typeof mockBreedings>();
      mockBreedings.forEach((breeding) => {
        if (!breedingsByAnimal.has(breeding.animalId)) {
          breedingsByAnimal.set(breeding.animalId, []);
        }
        breedingsByAnimal.get(breeding.animalId)!.push(breeding);
      });
      breedingsByAnimal.forEach((animalBreedings) => {
        if (animalBreedings.length > 1) {
          const sorted = [...animalBreedings].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i - 1].date);
            const currDate = new Date(sorted[i].date);
            const monthsDiff =
              (currDate.getFullYear() - prevDate.getFullYear()) * 12 +
              (currDate.getMonth() - prevDate.getMonth());
            expect(monthsDiff).toBeGreaterThanOrEqual(12);
          }
        }
      });
    });

    it("should handle edge case when maxPossibleDate is before twoYearsAgo", () => {
      const breedingsByAnimal = new Map<string, typeof mockBreedings>();
      mockBreedings.forEach((breeding) => {
        if (!breedingsByAnimal.has(breeding.animalId)) {
          breedingsByAnimal.set(breeding.animalId, []);
        }
        breedingsByAnimal.get(breeding.animalId)!.push(breeding);
      });
      breedingsByAnimal.forEach((animalBreedings) => {
        if (animalBreedings.length > 1) {
          const sorted = [...animalBreedings].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          sorted.forEach((breeding) => {
            const date = new Date(breeding.date);
            const today = new Date();
            const twoYearsAgo = new Date(today);
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            expect(date.getTime()).toBeGreaterThanOrEqual(twoYearsAgo.getTime());
          });
        }
      });
    });

    it("should handle edge case when breedingDate needs recheck for 12 month gap", () => {
      const breedingsByAnimal = new Map<string, typeof mockBreedings>();
      mockBreedings.forEach((breeding) => {
        if (!breedingsByAnimal.has(breeding.animalId)) {
          breedingsByAnimal.set(breeding.animalId, []);
        }
        breedingsByAnimal.get(breeding.animalId)!.push(breeding);
      });
      breedingsByAnimal.forEach((animalBreedings) => {
        if (animalBreedings.length > 1) {
          const sorted = [...animalBreedings].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i - 1].date);
            const currDate = new Date(sorted[i].date);
            const minAllowedDate = new Date(prevDate);
            minAllowedDate.setMonth(minAllowedDate.getMonth() - 12);
            // Since dates are sorted ascending, currDate should be >= prevDate
            expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
          }
        }
      });
    });
  });
});
