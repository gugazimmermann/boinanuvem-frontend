import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnimalSearch } from "../use-animal-search";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

describe("useAnimalSearch", () => {
  const mockAnimals = [
    { id: "1", code: "A001", registrationNumber: "REG001", companyId: "C001" },
    { id: "2", code: "A002", registrationNumber: "REG002", companyId: "C001" },
    { id: "3", code: "A003", registrationNumber: "REG003", companyId: "C001" },
  ];

  const mockTranslation = {
    animals: {
      breeds: {
        nelore: "Nelore",
        angus: "Angus",
      },
    },
  } as unknown as import("~/i18n").TranslationKey;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnimalsByCompanyId).mockReturnValue(mockAnimals);
    vi.mocked(getBirthByAnimalId).mockReturnValue({
      id: "1",
      animalId: "1",
      gender: "male",
      breed: "nelore",
    } as import("~/types").Birth);
  });

  it("should initialize with empty search value", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    expect(result.current.searchValue).toBe("");
  });

  it("should return all animals when no search value", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    expect(result.current.filteredAnimals).toEqual(mockAnimals);
  });

  it("should filter animals by code", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0].code).toBe("A001");
  });

  it("should filter animals by registration number", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("REG001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0].registrationNumber).toBe("REG001");
  });

  it("should filter animals by breed", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("Nelore");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);
  });

  it("should filter by gender when provided", () => {
    vi.mocked(getBirthByAnimalId).mockImplementation((animalId: string) => {
      if (animalId === "1") {
        return {
          id: "1",
          animalId: "1",
          gender: "male",
          breed: "nelore",
        } as import("~/types").Birth;
      }
      return {
        id: "2",
        animalId: "2",
        gender: "female",
        breed: "angus",
      } as import("~/types").Birth;
    });

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        gender: "male",
        t: mockTranslation,
      })
    );

    expect(result.current.allAnimals.length).toBeLessThanOrEqual(mockAnimals.length);
    expect(
      result.current.filteredAnimals.every((animal) => {
        const birth = getBirthByAnimalId(animal.id);
        return birth?.gender === "male";
      })
    ).toBe(true);
  });

  it("should return all animals when gender filter is not provided", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    expect(result.current.allAnimals).toEqual(mockAnimals);
  });

  it("should be case insensitive", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("a001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
  });

  it("should update search value", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    expect(result.current.searchValue).toBe("test");
  });

  it("should handle empty search value", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("   ");
    });

    expect(result.current.filteredAnimals).toEqual(mockAnimals);
  });

  it("should handle animals without birth data", () => {
    vi.mocked(getBirthByAnimalId).mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);
  });

  it("should handle breed not in translation", () => {
    vi.mocked(getBirthByAnimalId).mockReturnValue({
      id: "1",
      animalId: "1",
      birthDate: "2024-01-01",
      gender: "male",
      breed: undefined, // Breed not available
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    } as import("~/types").Birth);

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);
  });
});
