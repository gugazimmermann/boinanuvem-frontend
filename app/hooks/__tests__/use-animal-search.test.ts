import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnimalSearch } from "../use-animal-search";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBirthsByCompanyId } from "~/services/births.service";

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(),
}));

vi.mock("~/services/births.service", () => ({
  getBirthsByCompanyId: vi.fn(),
}));

describe("useAnimalSearch", () => {
  const mockAnimals = [
    { id: "1", code: "A001", registrationNumber: "REG001", companyId: "C001" },
    { id: "2", code: "A002", registrationNumber: "REG002", companyId: "C001" },
    { id: "3", code: "A003", registrationNumber: "REG003", companyId: "C001" },
  ];

  const mockBirths = [
    {
      id: "birth-1",
      animalId: "1",
      gender: "male",
      breed: "nelore",
      birthDate: "2024-01-01",
      companyId: "C001",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "birth-2",
      animalId: "2",
      gender: "female",
      breed: "angus",
      birthDate: "2024-01-02",
      companyId: "C001",
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "birth-3",
      animalId: "3",
      gender: "male",
      breed: "nelore",
      birthDate: "2024-01-03",
      companyId: "C001",
      createdAt: "2024-01-03T00:00:00Z",
    },
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
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue(mockAnimals);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue(mockBirths);
  });

  it("should initialize with empty search value", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    expect(result.current.searchValue).toBe("");
    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });
  });

  it("should return all animals when no search value", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.filteredAnimals).toEqual(mockAnimals);
    });
  });

  it("should filter animals by code", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0].code).toBe("A001");
  });

  it("should filter animals by registration number", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("REG001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0].registrationNumber).toBe("REG001");
  });

  it("should filter animals by breed", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("Nelore");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);
  });

  it("should filter by gender when provided", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        gender: "male",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    expect(result.current.allAnimals.length).toBeLessThanOrEqual(mockAnimals.length);
    expect(
      result.current.filteredAnimals.every((animal) => {
        const birth = result.current.birthsMap.get(animal.id);
        return birth?.gender === "male";
      })
    ).toBe(true);
  });

  it("should return all animals when gender filter is not provided", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals).toEqual(mockAnimals);
    });
  });

  it("should be case insensitive", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("a001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
  });

  it("should update search value", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("test");
    });

    expect(result.current.searchValue).toBe("test");
  });

  it("should handle empty search value", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("   ");
    });

    expect(result.current.filteredAnimals).toEqual(mockAnimals);
  });

  it("should handle animals without birth data", async () => {
    vi.mocked(getBirthsByCompanyId).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);
  });

  it("should handle breed not in translation", async () => {
    vi.mocked(getBirthsByCompanyId).mockResolvedValue([
      {
        id: "birth-1",
        animalId: "1",
        birthDate: "2024-01-01",
        gender: "male",
        breed: undefined, // Breed not available
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);
  });

  it("should return birthsMap", async () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: "C001",
        t: mockTranslation,
      })
    );

    await waitFor(() => {
      expect(result.current.birthsMap.size).toBeGreaterThan(0);
    });

    expect(result.current.birthsMap.get("1")).toBeDefined();
  });
});
