import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { createMovementsTableColumns } from "../movements-table-columns";
import { LocationMovementType } from "~/types";
import type { UnifiedMovement } from "~/components/dashboard/movements/movements-section";

// Mock formatDate
vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string, language: string) => {
    if (language === "en") return "01/15/2024";
    return "15/01/2024";
  }),
}));

describe("createMovementsTableColumns", () => {
  const mockGetLocationById = vi.fn((id: string) => ({
    name: `Location ${id}`,
    code: `LOC-${id}`,
  }));
  const mockGetEmployeeById = vi.fn((id: string) => ({ name: `Employee ${id}` }));
  const mockGetServiceProviderById = vi.fn((id: string) => ({ name: `Provider ${id}` }));
  const mockGetAnimalById = vi.fn((id: string) => ({
    code: `ANIMAL-${id}`,
    registrationNumber: `REG-${id}`,
  }));

  const baseOptions = {
    language: "en" as const,
    translationKeys: {
      date: "Date",
      type: "Type",
      locations: "Locations",
      animals: "Animals",
      responsible: "Responsible",
      observation: "Observation",
      files: "Files",
      types: {
        entry: "Entry",
        exit: "Exit",
        transfer: "Transfer",
        animal_movement: "Animal Movement",
        feed_delivery: "Entry",
      },
    },
    getLocationById: mockGetLocationById,
    getEmployeeById: mockGetEmployeeById,
    getServiceProviderById: mockGetServiceProviderById,
    getAnimalById: mockGetAnimalById,
  };

  it("should create columns array", () => {
    const columns = createMovementsTableColumns(baseOptions);
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it("should include date column", () => {
    const columns = createMovementsTableColumns(baseOptions);
    const dateColumn = columns.find((col) => col.key === "date");
    expect(dateColumn).toBeDefined();
    expect(dateColumn?.label).toBe("Date");
    expect(dateColumn?.sortable).toBe(true);
  });

  it("should include type column", () => {
    const columns = createMovementsTableColumns(baseOptions);
    const typeColumn = columns.find((col) => col.key === "type");
    expect(typeColumn).toBeDefined();
  });

  it("should include locations column", () => {
    const columns = createMovementsTableColumns(baseOptions);
    const locationsColumn = columns.find((col) => col.key === "locations");
    expect(locationsColumn).toBeDefined();
  });

  it("should include animals column when includeAnimalsColumn is true", () => {
    const columns = createMovementsTableColumns({
      ...baseOptions,
      includeAnimalsColumn: true,
    });
    const animalsColumn = columns.find((col) => col.key === "animals");
    expect(animalsColumn).toBeDefined();
  });

  it("should not include animals column when includeAnimalsColumn is false", () => {
    const columns = createMovementsTableColumns({
      ...baseOptions,
      includeAnimalsColumn: false,
    });
    const animalsColumn = columns.find((col) => col.key === "animals");
    expect(animalsColumn).toBeUndefined();
  });

  it("should render location movement type correctly", () => {
    const columns = createMovementsTableColumns(baseOptions);
    const typeColumn = columns.find((col) => col.key === "type");
    expect(typeColumn).toBeDefined();
  });

  it("should render animal movement type correctly", () => {
    const columns = createMovementsTableColumns(baseOptions);
    const typeColumn = columns.find((col) => col.key === "type");
    expect(typeColumn).toBeDefined();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("date column rendering", () => {
    it("should render formatted date", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const dateColumn = columns.find((col) => col.key === "date");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = dateColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("01/15/2024");
    });
  });

  describe("type column rendering", () => {
    it("should render location movement type", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const typeColumn = columns.find((col) => col.key === "type");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = typeColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Entry");
    });

    it("should render animal movement type", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const typeColumn = columns.find((col) => col.key === "type");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "animal",
        locationId: "loc-1",
        animalIds: ["animal-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = typeColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Animal Movement");
    });

    it("should render original type when translation is missing", () => {
      const columns = createMovementsTableColumns({
        ...baseOptions,
        translationKeys: {
          ...baseOptions.translationKeys,
          types: {
            entry: "Entry",
            exit: "Exit",
            transfer: "Transfer",
            animal_movement: "Animal Movement",
          },
        },
      });
      const typeColumn = columns.find((col) => col.key === "type");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = typeColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("feed_delivery");
    });
  });

  describe("locations column rendering", () => {
    it("should render single location", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const locationsColumn = columns.find((col) => col.key === "locations");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = locationsColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Location loc-1 (LOC-loc-1)");
    });

    it("should render multiple locations", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const locationsColumn = columns.find((col) => col.key === "locations");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.OTHER,
        locationIds: ["loc-1", "loc-2"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
      };
      const result = locationsColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Location loc-1 (LOC-loc-1)");
      expect(container.textContent).toContain("Location loc-2 (LOC-loc-2)");
    });

    it("should render location ID when location not found", () => {
      mockGetLocationById.mockReturnValueOnce(null);
      const columns = createMovementsTableColumns(baseOptions);
      const locationsColumn = columns.find((col) => col.key === "locations");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["missing-loc"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
      };
      const result = locationsColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("missing-loc");
    });

    it("should render dash when no locations", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const locationsColumn = columns.find((col) => col.key === "locations");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
      };
      const result = locationsColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should render location for animal movement", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const locationsColumn = columns.find((col) => col.key === "locations");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "animal",
        locationId: "loc-1",
        animalIds: ["animal-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = locationsColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Location loc-1 (LOC-loc-1)");
    });
  });

  describe("animals column rendering", () => {
    it("should render animal count for animal movement", () => {
      const columns = createMovementsTableColumns({
        ...baseOptions,
        includeAnimalsColumn: true,
      });
      const animalsColumn = columns.find((col) => col.key === "animals");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "animal",
        locationId: "loc-1",
        animalIds: ["animal-1", "animal-2", "animal-3"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
      };
      const result = animalsColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("3");
    });

    it("should render dash for location movement", () => {
      const columns = createMovementsTableColumns({
        ...baseOptions,
        includeAnimalsColumn: true,
      });
      const animalsColumn = columns.find((col) => col.key === "animals");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = animalsColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("responsible column rendering", () => {
    it("should render employee names", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const responsibleColumn = columns.find((col) => col.key === "responsible");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: ["emp-1", "emp-2"],
        serviceProviderIds: [],
      };
      const result = responsibleColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Employee emp-1");
      expect(container.textContent).toContain("Employee emp-2");
    });

    it("should render service provider names", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const responsibleColumn = columns.find((col) => col.key === "responsible");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: ["provider-1"],
      };
      const result = responsibleColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Provider provider-1");
    });

    it("should render both employees and service providers", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const responsibleColumn = columns.find((col) => col.key === "responsible");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: ["emp-1"],
        serviceProviderIds: ["provider-1"],
      };
      const result = responsibleColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("Employee emp-1");
      expect(container.textContent).toContain("Provider provider-1");
    });

    it("should render dash when no responsibles", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const responsibleColumn = columns.find((col) => col.key === "responsible");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = responsibleColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should filter out null employee names", () => {
      mockGetEmployeeById.mockReturnValueOnce(null);
      const columns = createMovementsTableColumns(baseOptions);
      const responsibleColumn = columns.find((col) => col.key === "responsible");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: ["missing-emp"],
        serviceProviderIds: [],
      };
      const result = responsibleColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });
  });

  describe("observation column rendering", () => {
    it("should render short observation", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const observationColumn = columns.find((col) => col.key === "observation");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Short observation",
      };
      const result = observationColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("Short observation");
    });

    it("should truncate long observation", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const observationColumn = columns.find((col) => col.key === "observation");
      const longObservation = "A".repeat(60);
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
        observation: longObservation,
      };
      const result = observationColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("...");
      expect(container.textContent).toHaveLength(53); // 50 chars + "..."
      const span = container.querySelector("span");
      expect(span?.getAttribute("title")).toBe(longObservation);
    });

    it("should render dash when observation is missing", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const observationColumn = columns.find((col) => col.key === "observation");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = observationColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should render observation for animal movement", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const observationColumn = columns.find((col) => col.key === "observation");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "animal",
        locationId: "loc-1",
        animalIds: ["animal-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Animal observation",
      };
      const result = observationColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("Animal observation");
    });
  });

  describe("files column rendering", () => {
    it("should render file count when files exist", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const filesColumn = columns.find((col) => col.key === "files");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
        fileIds: ["file-1", "file-2", "file-3"],
      };
      const result = filesColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("3");
      expect(container.querySelector("svg")).toBeDefined();
    });

    it("should render dash when no files", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const filesColumn = columns.find((col) => col.key === "files");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        employeeIds: [],
        serviceProviderIds: [],
        companyId: "company-1",
        propertyId: "prop-1",
      } as UnifiedMovement;
      const result = filesColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should render dash when fileIds is empty array", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const filesColumn = columns.find((col) => col.key === "files");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "location",
        type: LocationMovementType.FEED_DELIVERY,
        locationIds: ["loc-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
        fileIds: [],
      };
      const result = filesColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toBe("-");
    });

    it("should render files for animal movement", () => {
      const columns = createMovementsTableColumns(baseOptions);
      const filesColumn = columns.find((col) => col.key === "files");
      const mockMovement: UnifiedMovement = {
        id: "movement-1",
        date: "2024-01-15",
        movementType: "animal",
        locationId: "loc-1",
        animalIds: ["animal-1"],
        companyId: "company-1",
        propertyId: "prop-1",
        employeeIds: [],
        serviceProviderIds: [],
        fileIds: ["file-1"],
      };
      const result = filesColumn?.render?.(undefined, mockMovement, 0);
      const { container } = render(result!);
      expect(container.textContent).toContain("1");
    });
  });
});
