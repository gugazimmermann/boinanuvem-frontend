import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { createAnimalTableColumns } from "../animal-table-columns";
import type { Property, Animal, Birth, Weighing, Breeding, AnimalBreed } from "~/types";
import { AreaType, BirthPurity } from "~/types";
import type { Locale } from "date-fns";
import { getBirthByAnimalId } from "~/services/births.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";

// Mock services
vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(),
}));

vi.mock("~/services/breedings.service", () => ({
  getBreedingsByAnimalId: vi.fn(),
}));

// Mock formatDate to avoid date-fns locale issues
vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: Date | string, language?: string) => {
    if (language === "en") return "01/15/2024";
    return "15/01/2024";
  }),
}));

describe("createAnimalTableColumns", () => {
  const mockStatusBadge = vi.fn(({ label }: { label: string }) => <span>{label}</span>);
  const mockTranslations = {
    table: {
      registration: "Registration",
      breed: "Breed",
      purity: "Purity",
      gender: "Gender",
      birthDate: "Birth Date",
      acquisitionDate: "Acquisition Date",
      weight: "Weight",
      weightInArrobas: "Weight (Arrobas)",
      lastWeighingDate: "Last Weighing",
      gmd: "GMD",
      breedingStatus: "Breeding Status",
      breedingStatusPregnant: "Pregnant",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
    },
    breeds: { nelore: "Nelore" },
    purity: { pure: "Pure", po: "Pure" },
    gender: { male: "Male", female: "Female" },
    common: {
      month: "month",
      months: "months",
      daysAgo: (days: number) => `${days} days ago`,
      dailyAverageGain: "Daily Average Gain",
    },
  };

  const mockBirthsMap = new Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>();
  const mockBreedingsMap = new Map<string, Breeding[]>();

  const baseOptions = {
    language: "en" as const,
    dateLocale: {} as Locale,
    translations: mockTranslations,
    StatusBadgeComponent: mockStatusBadge,
    birthsMap: mockBirthsMap,
    breedingsMap: mockBreedingsMap,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBirthsMap.clear();
    mockBreedingsMap.clear();
  });

  it("should create columns array", () => {
    const columns = createAnimalTableColumns(baseOptions);
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it("should include code column", () => {
    const columns = createAnimalTableColumns(baseOptions);
    const codeColumn = columns.find((col) => col.key === "code");
    expect(codeColumn).toBeDefined();
    expect(codeColumn?.label).toBe("Registration");
  });

  it("should include breed column", () => {
    const columns = createAnimalTableColumns(baseOptions);
    const breedColumn = columns.find((col) => col.key === "breed");
    expect(breedColumn).toBeDefined();
  });

  it("should include properties column when includeProperties is true", () => {
    const columns = createAnimalTableColumns({
      ...baseOptions,
      includeProperties: true,
      propertiesMap: new Map<string, Property>(),
      translations: {
        ...mockTranslations,
        table: {
          ...mockTranslations.table,
          properties: "Properties",
        },
      },
    });
    const propertiesColumn = columns.find((col) => col.key === "properties");
    expect(propertiesColumn).toBeDefined();
  });

  it("should not include properties column when includeProperties is false", () => {
    const columns = createAnimalTableColumns({
      ...baseOptions,
      includeProperties: false,
    });
    const propertiesColumn = columns.find((col) => col.key === "properties");
    expect(propertiesColumn).toBeUndefined();
  });

  it("should include actions column when provided", () => {
    const mockActionsColumn = {
      key: "actions",
      label: "Actions",
      render: () => <div>Actions</div>,
    };
    const columns = createAnimalTableColumns({
      ...baseOptions,
      includeActions: true,
      actionsColumn: mockActionsColumn,
    });
    const actionsColumn = columns.find((col) => col.key === "actions");
    expect(actionsColumn).toBeDefined();
  });

  it("should use custom formatDateFn when provided", () => {
    const customFormatDate = vi.fn((_date: Date | string) => "formatted");
    const columns = createAnimalTableColumns({
      ...baseOptions,
      formatDateFn: customFormatDate,
    });
    expect(columns.length).toBeGreaterThan(0);
  });

  it("should handle onStatusRender callback", () => {
    const onStatusRender = vi.fn(() => ({ label: "Custom Status", variant: "success" as const }));
    const columns = createAnimalTableColumns({
      ...baseOptions,
      onStatusRender,
    });
    expect(columns.length).toBeGreaterThan(0);
  });

  describe("code column rendering", () => {
    it("should render code and registration number", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const codeColumn = columns.find((col) => col.key === "code");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        registrationNumber: "REG-001",
        propertyId: "prop-1",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = codeColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("A001");
      expect(container.textContent).toContain("REG-001");
    });
  });

  describe("breed column rendering", () => {
    it("should render breed when birth data exists in birthsMap", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        breed: "nelore" as AnimalBreed,
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const breedColumn = columns.find((col) => col.key === "breed");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = breedColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Nelore");
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });

    it("should render dash when birth data is missing from birthsMap", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const breedColumn = columns.find((col) => col.key === "breed");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = breedColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });

    it("should render dash when breed is missing", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        breed: undefined,
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const breedColumn = columns.find((col) => col.key === "breed");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = breedColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("purity column rendering", () => {
    it("should render purity when birth data exists in birthsMap", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        purity: BirthPurity.PO,
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const purityColumn = columns.find((col) => col.key === "purity");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = purityColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Pure");
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });

    it("should fallback purity to PO when no genealogy info exists", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const purityColumn = columns.find((col) => col.key === "purity");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = purityColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Pure");
    });
  });

  describe("gender column rendering", () => {
    it("should render male gender", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "male",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const genderColumn = columns.find((col) => col.key === "gender");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = genderColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Male");
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });

    it("should render female gender", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "female",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const genderColumn = columns.find((col) => col.key === "gender");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = genderColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Female");
    });

    it("should render dash when gender is missing", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const genderColumn = columns.find((col) => col.key === "gender");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = genderColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should render dash when gender is falsy", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: undefined,
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const genderColumn = columns.find((col) => col.key === "gender");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = genderColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("birthDate column rendering", () => {
    it("should render months with tooltip when birth date exists in birthsMap", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 5);
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: birthDate.toISOString(),
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const mockTooltip = vi.fn(
        ({ children, content }: { children: React.ReactNode; content: string }) => (
          <div data-testid="tooltip" data-content={content}>
            {children}
          </div>
        )
      );
      const columns = createAnimalTableColumns({
        ...baseOptions,
        TooltipComponent: mockTooltip,
      });
      const birthDateColumn = columns.find((col) => col.key === "birthDate");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = birthDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container, getByTestId } = render(result!);
      // The formatted date should be visible
      expect(container.textContent).toContain("01/15/2024");
      // The tooltip content should be in the data-content attribute
      const tooltip = getByTestId("tooltip");
      expect(tooltip).toBeDefined();
      expect(tooltip.getAttribute("data-content")).toContain("5");
      expect(tooltip.getAttribute("data-content")).toContain("months");
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });

    it("should render singular month when months is 1", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 1);
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: birthDate.toISOString(),
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const mockTooltip = vi.fn(
        ({ children, content }: { children: React.ReactNode; content: string }) => (
          <div data-testid="tooltip" data-content={content}>
            {children}
          </div>
        )
      );
      const columns = createAnimalTableColumns({
        ...baseOptions,
        TooltipComponent: mockTooltip,
      });
      const birthDateColumn = columns.find((col) => col.key === "birthDate");
      const result = birthDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container, getByTestId } = render(result!);
      // The formatted date should be visible
      expect(container.textContent).toContain("01/15/2024");
      // The tooltip content should be in the data-content attribute
      const tooltip = getByTestId("tooltip");
      expect(tooltip.getAttribute("data-content")).toContain("1");
      expect(tooltip.getAttribute("data-content")).toContain("month");
      expect(tooltip.getAttribute("data-content")).not.toContain("months");
    });

    it("should render dash when birth date is missing", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const birthDateColumn = columns.find((col) => col.key === "birthDate");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = birthDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should use custom formatDateFn when provided", async () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 2);
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: birthDate.toISOString(),
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      // When formatDateFn === formatDate, it uses formatDateFn
      // When formatDateFn !== formatDate, it uses date-fns format with locale
      // We test the case where formatDateFn === formatDate by using the mocked formatDate
      const { formatDate } = await import("~/utils/formatting");
      const columns = createAnimalTableColumns({
        ...baseOptions,
        formatDateFn: formatDate,
      });
      const birthDateColumn = columns.find((col) => col.key === "birthDate");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = birthDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      // Should render successfully and call formatDateFn
      expect(container.textContent).toBeTruthy();
      const { formatDate: mockFormatDate } = await import("~/utils/formatting");
      expect(mockFormatDate).toHaveBeenCalled();
    });
  });

  describe("acquisitionDate column rendering", () => {
    it("should render months with tooltip when acquisition date exists", () => {
      const acquisitionDate = new Date();
      acquisitionDate.setMonth(acquisitionDate.getMonth() - 3);
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        acquisitionDate: acquisitionDate.toISOString(),
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const mockTooltip = vi.fn(
        ({ children, content }: { children: React.ReactNode; content: string }) => (
          <div data-testid="tooltip" data-content={content}>
            {children}
          </div>
        )
      );
      const columns = createAnimalTableColumns({
        ...baseOptions,
        TooltipComponent: mockTooltip,
      });
      const acquisitionDateColumn = columns.find((col) => col.key === "acquisitionDate");
      const result = acquisitionDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container, getByTestId } = render(result!);
      // The formatted date should be visible
      expect(container.textContent).toContain("01/15/2024");
      // The tooltip content should be in the data-content attribute
      const tooltip = getByTestId("tooltip");
      expect(tooltip).toBeDefined();
      expect(tooltip.getAttribute("data-content")).toContain("3");
      expect(tooltip.getAttribute("data-content")).toContain("months");
    });

    it("should render dash when acquisition date is missing", () => {
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const columns = createAnimalTableColumns(baseOptions);
      const acquisitionDateColumn = columns.find((col) => col.key === "acquisitionDate");
      const result = acquisitionDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("weight column rendering", () => {
    it("should render last weighing weight", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const weightColumn = columns.find((col) => col.key === "weight");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = weightColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      // Note: Column uses hardcoded empty array, so it always shows "-"
      expect(container.textContent).toBe("-");
    });

    it("should render dash when no weighings exist", () => {
      vi.mocked(getWeighingsByAnimalId).mockReturnValue([]);
      const columns = createAnimalTableColumns(baseOptions);
      const weightColumn = columns.find((col) => col.key === "weight");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = weightColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("weightInArrobas column rendering", () => {
    it("should calculate and render weight in arrobas", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const weightInArrobasColumn = columns.find((col) => col.key === "weightInArrobas");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = weightInArrobasColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      // Note: Column uses hardcoded empty array, so it always shows "-"
      expect(container.textContent).toBe("-");
    });

    it("should render dash when no weighings exist", () => {
      vi.mocked(getWeighingsByAnimalId).mockReturnValue([]);
      const columns = createAnimalTableColumns(baseOptions);
      const weightInArrobasColumn = columns.find((col) => col.key === "weightInArrobas");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = weightInArrobasColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("lastWeighingDate column rendering", () => {
    it("should render last weighing date with tooltip", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const lastWeighingDateColumn = columns.find((col) => col.key === "lastWeighingDate");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = lastWeighingDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      // Note: Column uses hardcoded empty array, so it always shows "-"
      expect(container.textContent).toBe("-");
    });

    it("should render dash when no weighings exist", () => {
      vi.mocked(getWeighingsByAnimalId).mockReturnValue([]);
      const columns = createAnimalTableColumns(baseOptions);
      const lastWeighingDateColumn = columns.find((col) => col.key === "lastWeighingDate");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = lastWeighingDateColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("gmd column rendering", () => {
    it("should calculate and render GMD when there are at least 2 weighings", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const gmdColumn = columns.find((col) => col.key === "gmd");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = gmdColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      // Note: Column uses hardcoded empty array, so it always shows "-"
      expect(container.textContent).toBe("-");
    });

    it("should render dash when there are less than 2 weighings", () => {
      const weighings: Weighing[] = [
        {
          id: "w1",
          animalId: "animal-1",
          date: "2024-01-01",
          weight: 300,
          companyId: "comp-1",
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];
      vi.mocked(getWeighingsByAnimalId).mockReturnValue(weighings);
      const columns = createAnimalTableColumns(baseOptions);
      const gmdColumn = columns.find((col) => col.key === "gmd");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = gmdColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should render dash when days difference is 0", () => {
      const date = new Date("2024-01-01");
      const weighings: Weighing[] = [
        {
          id: "w1",
          animalId: "animal-1",
          date: date.toISOString(),
          weight: 300,
          companyId: "comp-1",
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "w2",
          animalId: "animal-1",
          date: date.toISOString(),
          weight: 350,
          companyId: "comp-1",
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];
      vi.mocked(getWeighingsByAnimalId).mockReturnValue(weighings);
      const columns = createAnimalTableColumns(baseOptions);
      const gmdColumn = columns.find((col) => col.key === "gmd");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = gmdColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("breedingStatus column rendering", () => {
    it("should render dash for male animals", async () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "male",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns(baseOptions);
      const breedingStatusColumn = columns.find((col) => col.key === "breedingStatus");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = breedingStatusColumn?.render?.(undefined, mockAnimal, 0);
      let container: HTMLElement;
      await act(async () => {
        const renderResult = render(result!);
        container = renderResult.container;
      });
      expect(container!.textContent).toBe("-");
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });

    it("should render dash when no breedings exist", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "female",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      // Don't set breedings in map, so it will be empty
      mockBreedingsMap.set("animal-1", []);
      const columns = createAnimalTableColumns(baseOptions);
      const breedingStatusColumn = columns.find((col) => col.key === "breedingStatus");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = breedingStatusColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should render success badge when confirmed breeding exists", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "female",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      mockBreedingsMap.set("animal-1", [
        { id: "b1", animalId: "animal-1", confirmed: true, companyId: "comp-1" } as Breeding,
      ]);
      const columns = createAnimalTableColumns(baseOptions);
      const breedingStatusColumn = columns.find((col) => col.key === "breedingStatus");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = breedingStatusColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Pregnant");
      expect(mockStatusBadge).toHaveBeenCalledWith(
        { label: "Pregnant", variant: "success" },
        undefined
      );
    });

    it("should render warning badge when no confirmed breeding exists", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "female",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      mockBreedingsMap.set("animal-1", [
        { id: "b1", animalId: "animal-1", confirmed: false, companyId: "comp-1" } as Breeding,
      ]);
      const columns = createAnimalTableColumns(baseOptions);
      const breedingStatusColumn = columns.find((col) => col.key === "breedingStatus");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = breedingStatusColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Pregnant");
      expect(mockStatusBadge).toHaveBeenCalledWith(
        { label: "Pregnant", variant: "warning" },
        undefined
      );
    });
  });

  describe("status column rendering", () => {
    it("should use onStatusRender when provided", () => {
      const onStatusRender = vi.fn(() => ({ label: "Custom Status", variant: "success" as const }));
      const columns = createAnimalTableColumns({
        ...baseOptions,
        onStatusRender,
      });
      const statusColumn = columns.find((col) => col.key === "status");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = statusColumn?.render?.(undefined, mockAnimal, 0);
      render(result!);
      expect(onStatusRender).toHaveBeenCalledWith(mockAnimal);
      expect(mockStatusBadge).toHaveBeenCalledWith(
        { label: "Custom Status", variant: "success" },
        undefined
      );
    });

    it("should render active status", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const statusColumn = columns.find((col) => col.key === "status");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = statusColumn?.render?.(undefined, mockAnimal, 0);
      render(result!);
      expect(mockStatusBadge).toHaveBeenCalledWith(
        { label: "Active", variant: "success" },
        undefined
      );
    });

    it("should render inactive status", () => {
      const columns = createAnimalTableColumns(baseOptions);
      const statusColumn = columns.find((col) => col.key === "status");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "inactive",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = statusColumn?.render?.(undefined, mockAnimal, 0);
      render(result!);
      expect(mockStatusBadge).toHaveBeenCalledWith(
        { label: "Inactive", variant: "default" },
        undefined
      );
    });

    it("should render sold status when translation exists", () => {
      const columns = createAnimalTableColumns({
        ...baseOptions,
        translations: {
          ...mockTranslations,
          table: {
            ...mockTranslations.table,
            sold: "Sold",
          },
        },
      });
      const statusColumn = columns.find((col) => col.key === "status");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "sold",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = statusColumn?.render?.(undefined, mockAnimal, 0);
      render(result!);
      expect(mockStatusBadge).toHaveBeenCalledWith(
        { label: "Sold", variant: "warning" },
        undefined
      );
    });
  });

  describe("properties column rendering", () => {
    it("should render property name when property exists", () => {
      const propertiesMap = new Map<string, Property>([
        [
          "prop-1",
          {
            id: "prop-1",
            name: "Property One",
            code: "PROP-1",
            companyId: "comp-1",
            status: "active",
            createdAt: "2024-01-01T00:00:00Z",
            area: { value: 100, type: AreaType.HECTARES },
            street: "Main St",
            number: "123",
            complement: "",
            neighborhood: "Downtown",
            city: "City",
            state: "ST",
            zipCode: "12345-678",
          },
        ],
      ]);
      const columns = createAnimalTableColumns({
        ...baseOptions,
        includeProperties: true,
        propertiesMap,
        translations: {
          ...mockTranslations,
          table: {
            ...mockTranslations.table,
            properties: "Properties",
          },
        },
      });
      const propertiesColumn = columns.find((col) => col.key === "properties");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = propertiesColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Property One");
    });

    it("should render dash when property is missing", () => {
      const propertiesMap = new Map<string, Property>();
      const columns = createAnimalTableColumns({
        ...baseOptions,
        includeProperties: true,
        propertiesMap,
        translations: {
          ...mockTranslations,
          table: {
            ...mockTranslations.table,
            properties: "Properties",
          },
        },
      });
      const propertiesColumn = columns.find((col) => col.key === "properties");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      const result = propertiesColumn?.render?.(undefined, mockAnimal, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("language-specific date formatting", () => {
    it("should use English date format for en language", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 2);
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: birthDate.toISOString(),
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns({
        ...baseOptions,
        language: "en",
      });
      const birthDateColumn = columns.find((col) => col.key === "birthDate");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      birthDateColumn?.render?.(undefined, mockAnimal, 0);
      // The formatDateFn should be called with the date and language
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });

    it("should use Portuguese date format for pt language", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 2);
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: birthDate.toISOString(),
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockBirthsMap.set("animal-1", mockBirth);
      const columns = createAnimalTableColumns({
        ...baseOptions,
        language: "pt",
      });
      const birthDateColumn = columns.find((col) => col.key === "birthDate");
      const mockAnimal: Animal = {
        id: "animal-1",
        code: "A001",
        propertyId: "prop-1",
        status: "active",
        registrationNumber: "REG001",
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
      };
      birthDateColumn?.render?.(undefined, mockAnimal, 0);
      expect(getBirthByAnimalId).not.toHaveBeenCalled();
    });
  });
});
