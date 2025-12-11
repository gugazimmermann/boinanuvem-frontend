import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBirthsByCompanyId } from "~/services/births.service";
import { getProperties } from "~/services/properties.service";
import { getLocations } from "~/services/locations.service";

vi.mock("~/services/animals.service");
vi.mock("~/services/births.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/locations.service");

describe("Async Data Loading Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle parallel async service calls", async () => {
    const mockAnimals = [
      {
        id: "animal-1",
        code: "A001",
        registrationNumber: "REG001",
        companyId: "company-1",
        propertyId: "property-1",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    const mockBirths = [
      {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "male" as const,
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    vi.mocked(getAnimalsByCompanyId).mockResolvedValue(mockAnimals);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue(mockBirths);

    const [animals, births] = await Promise.all([
      getAnimalsByCompanyId("company-1"),
      getBirthsByCompanyId("company-1"),
    ]);

    expect(animals).toEqual(mockAnimals);
    expect(births).toEqual(mockBirths);
    expect(getAnimalsByCompanyId).toHaveBeenCalledWith("company-1");
    expect(getBirthsByCompanyId).toHaveBeenCalledWith("company-1");
  });

  it("should create maps from async loaded data", async () => {
    const mockAnimals = [
      {
        id: "animal-1",
        code: "A001",
        registrationNumber: "REG001",
        companyId: "company-1",
        propertyId: "property-1",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    const mockBirths = [
      {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "male" as const,
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    vi.mocked(getAnimalsByCompanyId).mockResolvedValue(mockAnimals);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue(mockBirths);

    const animals = await getAnimalsByCompanyId("company-1");
    const births = await getBirthsByCompanyId("company-1");

    const animalsMap = new Map(animals.map((a) => [a.id, a]));
    const birthsMap = new Map((births || []).map((b) => [b.animalId, b]));

    expect(animalsMap.get("animal-1")).toBeDefined();
    expect(birthsMap.get("animal-1")).toBeDefined();
  });

  it("should handle service chain dependencies", async () => {
    const mockProperties = [
      {
        id: "property-1",
        name: "Property 1",
        code: "PROP-1",
        companyId: "company-1",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        area: { value: 100, type: "hectares" as const },
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ];
    const mockLocations = [
      {
        id: "location-1",
        name: "Location 1",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    vi.mocked(getProperties).mockResolvedValue(mockProperties);
    vi.mocked(getLocations).mockResolvedValue(mockLocations);

    const [properties, locations] = await Promise.all([getProperties(), getLocations()]);

    const propertiesMap = new Map(properties.map((p) => [p.id, p]));
    const locationsMap = new Map(locations.map((l) => [l.id, l]));

    expect(propertiesMap.size).toBeGreaterThan(0);
    expect(locationsMap.size).toBeGreaterThan(0);
  });

  it("should handle errors in async service chains", async () => {
    vi.mocked(getAnimalsByCompanyId).mockRejectedValue(new Error("Failed to load"));

    await expect(getAnimalsByCompanyId("company-1")).rejects.toThrow("Failed to load");
  });
});
