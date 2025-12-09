import { describe, it, expect } from "vitest";
import { createEntityGetters } from "../entity-getters";
import type { Location, Employee, ServiceProvider, Animal } from "~/types";
import { LocationType, AreaType } from "~/types";

describe("createEntityGetters", () => {
  const mockLocations: Location[] = [
    {
      id: "loc-1",
      name: "Location One",
      code: "LOC-001",
      companyId: "company-1",
      locationType: LocationType.PASTURE,
      area: { value: 100, type: AreaType.HECTARES },
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      propertyId: "prop-1",
    },
  ];

  const mockEmployees: Employee[] = [
    {
      id: "emp-1",
      code: "EMP-001",
      name: "Employee One",
      companyId: "company-1",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      propertyIds: [],
    },
  ];

  const mockServiceProviders: ServiceProvider[] = [
    {
      id: "sp-1",
      code: "SP-001",
      name: "Service Provider One",
      companyId: "company-1",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      propertyIds: [],
    },
  ];

  const mockAnimals: Animal[] = [
    {
      id: "animal-1",
      code: "ANIMAL-001",
      registrationNumber: "REG-001",
      companyId: "company-1",
      propertyId: "prop-1",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  it("should create getters for all entity types", () => {
    const getters = createEntityGetters({
      locations: mockLocations,
      employees: mockEmployees,
      serviceProviders: mockServiceProviders,
      animals: mockAnimals,
    });

    expect(getters.getLocationById).toBeDefined();
    expect(getters.getEmployeeById).toBeDefined();
    expect(getters.getServiceProviderById).toBeDefined();
    expect(getters.getAnimalById).toBeDefined();
  });

  it("should return location name and code", () => {
    const getters = createEntityGetters({ locations: mockLocations });
    const result = getters.getLocationById("loc-1");
    expect(result).toEqual({ name: "Location One", code: "LOC-001" });
  });

  it("should return null for non-existent location", () => {
    const getters = createEntityGetters({ locations: mockLocations });
    expect(getters.getLocationById("non-existent")).toBeNull();
  });

  it("should return employee name", () => {
    const getters = createEntityGetters({ employees: mockEmployees });
    const result = getters.getEmployeeById("emp-1");
    expect(result).toEqual({ name: "Employee One" });
  });

  it("should return service provider name", () => {
    const getters = createEntityGetters({ serviceProviders: mockServiceProviders });
    const result = getters.getServiceProviderById("sp-1");
    expect(result).toEqual({ name: "Service Provider One" });
  });

  it("should return animal code and registration number", () => {
    const getters = createEntityGetters({ animals: mockAnimals });
    const result = getters.getAnimalById("animal-1");
    expect(result).toEqual({ code: "ANIMAL-001", registrationNumber: "REG-001" });
  });

  it("should return null when entities not provided", () => {
    const getters = createEntityGetters();
    expect(getters.getLocationById("loc-1")).toBeNull();
    expect(getters.getEmployeeById("emp-1")).toBeNull();
    expect(getters.getServiceProviderById("sp-1")).toBeNull();
    expect(getters.getAnimalById("animal-1")).toBeNull();
  });

  it("should handle empty arrays", () => {
    const getters = createEntityGetters({
      locations: [],
      employees: [],
      serviceProviders: [],
      animals: [],
    });
    expect(getters.getLocationById("loc-1")).toBeNull();
  });
});
