import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnimalSearch } from "../use-animal-search";
import * as animalsService from "~/services/animals.service";
import * as birthsService from "~/services/births.service";

vi.mock("~/services/animals.service");
vi.mock("~/services/births.service");

describe("useAnimalSearch", () => {
  const mockCompanyId = "company-123";
  const mockTranslation = {
    animals: {
      breeds: {
        nelore: "Nelore",
        angus: "Angus",
        brahman: "Brahman",
      },
    },
  };

  const mockAnimals = [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: mockCompanyId,
      status: "active",
    },
    {
      id: "animal-2",
      code: "A002",
      registrationNumber: "REG002",
      companyId: mockCompanyId,
      status: "active",
    },
    {
      id: "animal-3",
      code: "B001",
      registrationNumber: "REG003",
      companyId: mockCompanyId,
      status: "active",
    },
  ];

  const mockBirths = [
    {
      id: "birth-1",
      animalId: "animal-1",
      gender: "female" as const,
      breed: "nelore",
    },
    {
      id: "birth-2",
      animalId: "animal-2",
      gender: "male" as const,
      breed: "angus",
    },
    {
      id: "birth-3",
      animalId: "animal-3",
      gender: "female" as const,
      breed: "brahman",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(animalsService.getAnimalsByCompanyId).mockReturnValue(mockAnimals);
    vi.mocked(birthsService.getBirthByAnimalId).mockImplementation((animalId: string) => {
      return mockBirths.find((b) => b.animalId === animalId);
    });
  });

  it("should initialize with empty search value", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.searchValue).toBe("");
    expect(result.current.filteredAnimals).toEqual(mockAnimals);
    expect(result.current.allAnimals).toEqual(mockAnimals);
  });

  it("should filter animals by code", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0]?.code).toBe("A001");
  });

  it("should filter animals by registration number", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("REG002");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0]?.registrationNumber).toBe("REG002");
  });

  it("should filter animals by breed", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("Nelore");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0]?.id).toBe("animal-1");
  });

  it("should filter animals case-insensitively", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("a001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0]?.code).toBe("A001");
  });

  it("should return all animals when search is empty", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("A001");
    });

    act(() => {
      result.current.setSearchValue("");
    });

    expect(result.current.filteredAnimals).toEqual(mockAnimals);
  });

  it("should return all animals when search is only whitespace", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("   ");
    });

    expect(result.current.filteredAnimals).toEqual(mockAnimals);
  });

  it("should filter by gender when provided", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        gender: "female",
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.filteredAnimals).toHaveLength(2);
    expect(
      result.current.filteredAnimals.every((animal) => {
        const birth = birthsService.getBirthByAnimalId(animal.id);
        return birth?.gender === "female";
      })
    ).toBe(true);
  });

  it("should filter by gender and search value", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        gender: "female",
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("A001");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0]?.code).toBe("A001");
  });

  it("should return filtered allAnimals when gender is provided", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        gender: "male",
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.allAnimals).toHaveLength(1);
    expect(result.current.allAnimals[0]?.id).toBe("animal-2");
  });

  it("should return all animals when gender is not provided", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.allAnimals).toEqual(mockAnimals);
  });

  it("should handle animals without birth data", () => {
    const animalsWithoutBirth = [
      {
        id: "animal-4",
        code: "A004",
        registrationNumber: "REG004",
        companyId: mockCompanyId,
        status: "active",
      },
    ];

    vi.mocked(animalsService.getAnimalsByCompanyId).mockReturnValue(animalsWithoutBirth);
    vi.mocked(birthsService.getBirthByAnimalId).mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        gender: "female",
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.filteredAnimals).toHaveLength(0);
  });

  it("should handle breed not found in translations", () => {
    const animalWithUnknownBreed = {
      id: "animal-4",
      code: "A004",
      registrationNumber: "REG004",
      companyId: mockCompanyId,
      status: "active",
    };

    const birthWithUnknownBreed = {
      id: "birth-4",
      animalId: "animal-4",
      gender: "female" as const,
      breed: "unknown_breed",
    };

    vi.mocked(animalsService.getAnimalsByCompanyId).mockReturnValue([
      ...mockAnimals,
      animalWithUnknownBreed,
    ]);
    vi.mocked(birthsService.getBirthByAnimalId).mockImplementation((animalId: string) => {
      if (animalId === "animal-4") return birthWithUnknownBreed;
      return mockBirths.find((b) => b.animalId === animalId);
    });

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("unknown_breed");
    });

    expect(result.current.filteredAnimals).toHaveLength(1);
    expect(result.current.filteredAnimals[0]?.id).toBe("animal-4");
  });

  it("should update filtered animals when search value changes", () => {
    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    act(() => {
      result.current.setSearchValue("A");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);

    act(() => {
      result.current.setSearchValue("B");
    });

    expect(result.current.filteredAnimals.length).toBeGreaterThan(0);
    expect(result.current.filteredAnimals.some((a) => a.code.startsWith("B"))).toBe(true);
  });

  it("should call getAnimalsByCompanyId with correct companyId", () => {
    renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(animalsService.getAnimalsByCompanyId).toHaveBeenCalledWith(mockCompanyId);
  });

  it("should handle empty animals array", () => {
    vi.mocked(animalsService.getAnimalsByCompanyId).mockReturnValue([]);

    const { result } = renderHook(() =>
      useAnimalSearch({
        companyId: mockCompanyId,
        t: mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>,
      })
    );

    expect(result.current.filteredAnimals).toEqual([]);
    expect(result.current.allAnimals).toEqual([]);
  });
});
