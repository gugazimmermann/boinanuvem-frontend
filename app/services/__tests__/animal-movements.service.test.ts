import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalMovementsByAnimalId,
  getAnimalMovementsByLocationId,
  getAnimalMovementsByPropertyId,
  getAnimalMovementsByCompanyId,
  getAnimalMovementsByEmployeeId,
  getAnimalMovementsByServiceProviderId,
  getAnimalMovementById,
  getAnimalsByLastMovementLocation,
  addAnimalMovement,
  deleteAnimalMovement,
} from "../animal-movements.service";

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

const mockAnimalMovements = [
  {
    id: "movement-1",
    animalIds: ["animal-1", "animal-2"],
    locationId: "location-1",
    propertyId: "property-1",
    companyId: "company-1",
    employeeIds: ["employee-1"],
    serviceProviderIds: ["provider-1"],
    date: "2024-01-15",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "movement-2",
    animalIds: ["animal-1"],
    locationId: "location-2",
    propertyId: "property-1",
    companyId: "company-1",
    employeeIds: ["employee-2"],
    date: "2024-02-15",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
];

describe("animal-movements.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalMovementsByAnimalId", () => {
    it("should find movements by animal id", async () => {
      mockGet.mockResolvedValue([mockAnimalMovements[0], mockAnimalMovements[1]]);
      const result = await getAnimalMovementsByAnimalId("animal-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/animal/animal-1");
      expect(result).toHaveLength(2);
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getAnimalMovementsByAnimalId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getAnimalMovementsByLocationId", () => {
    it("should find movements by location id", async () => {
      mockGet.mockResolvedValue([mockAnimalMovements[0]]);
      const result = await getAnimalMovementsByLocationId("location-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/location/location-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAnimalMovementsByPropertyId", () => {
    it("should find movements by property id", async () => {
      mockGet.mockResolvedValue(mockAnimalMovements);
      const result = await getAnimalMovementsByPropertyId("property-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/property/property-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getAnimalMovementsByCompanyId", () => {
    it("should find movements by company id", async () => {
      mockGet.mockResolvedValue(mockAnimalMovements);
      const result = await getAnimalMovementsByCompanyId("company-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements");
      expect(result).toHaveLength(2);
    });
  });

  describe("getAnimalMovementsByEmployeeId", () => {
    it("should find movements by employee id", async () => {
      mockGet.mockResolvedValue([mockAnimalMovements[0]]);
      const result = await getAnimalMovementsByEmployeeId("employee-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/employee/employee-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAnimalMovementsByServiceProviderId", () => {
    it("should find movements by service provider id", async () => {
      mockGet.mockResolvedValue([mockAnimalMovements[0]]);
      const result = await getAnimalMovementsByServiceProviderId("provider-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/service-provider/provider-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAnimalMovementById", () => {
    it("should find movement by id", async () => {
      mockGet.mockResolvedValue(mockAnimalMovements[0]);
      const result = await getAnimalMovementById("movement-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/movement-1");
      expect(result).toEqual(mockAnimalMovements[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getAnimalMovementById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByLastMovementLocation", () => {
    it("should return animals by last movement location", async () => {
      mockGet.mockResolvedValue(["animal-1"]);
      const result = await getAnimalsByLastMovementLocation("location-2");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/last-location/location-2/animals");
      expect(result).toContain("animal-1");
    });
  });

  describe("addAnimalMovement", () => {
    it("should create new movement", async () => {
      const movementData = {
        animalIds: ["animal-3"],
        locationId: "location-3",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2024-03-01",
      };

      const createdMovement = {
        ...movementData,
        id: "movement-3",
        createdAt: "2024-03-01T00:00:00Z",
        updatedAt: "2024-03-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(createdMovement);
      const result = await addAnimalMovement(movementData);

      expect(mockPost).toHaveBeenCalledWith("/animal-movements", movementData);
      expect(result.id).toBe("movement-3");
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("deleteAnimalMovement", () => {
    it("should delete movement", async () => {
      mockDelete.mockResolvedValue(undefined);
      await deleteAnimalMovement("movement-1");
      expect(mockDelete).toHaveBeenCalledWith("/animal-movements/movement-1");
    });
  });

  describe("date transformations", () => {
    it("should transform date fields from Date objects to strings", async () => {
      const backendResponse = {
        id: "movement-1",
        animalIds: ["animal-1"],
        locationId: "location-1",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15T00:00:00Z"),
        updatedAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getAnimalMovementById("movement-1");
      expect(result?.date).toBe("2024-01-15");
      expect(typeof result?.createdAt).toBe("string");
      expect(typeof result?.updatedAt).toBe("string");
    });

    it("should transform date fields in list responses", async () => {
      const backendResponse = [
        {
          id: "movement-1",
          animalIds: ["animal-1"],
          locationId: "location-1",
          propertyId: "property-1",
          companyId: "company-1",
          employeeIds: [],
          serviceProviderIds: [],
          date: new Date("2024-01-15"),
          createdAt: new Date("2024-01-15T00:00:00Z"),
          updatedAt: new Date("2024-01-15T00:00:00Z"),
        },
      ];
      mockGet.mockResolvedValue(backendResponse);
      const result = await getAnimalMovementsByAnimalId("animal-1");
      expect(result[0]?.date).toBe("2024-01-15");
      expect(typeof result[0]?.createdAt).toBe("string");
      expect(typeof result[0]?.updatedAt).toBe("string");
    });

    it("should handle missing date fields gracefully", async () => {
      const backendResponse = {
        id: "movement-1",
        animalIds: ["animal-1"],
        locationId: "location-1",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: null,
        createdAt: null,
        updatedAt: null,
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getAnimalMovementById("movement-1");
      expect(result).toBeDefined();
      expect(result?.date).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle 403 errors correctly", async () => {
      const { ApiError } = await import("../api-client");
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));
      const result = await getAnimalMovementsByAnimalId("animal-1");
      expect(result).toEqual([]);
    });

    it("should handle 404 errors correctly", async () => {
      const { ApiError } = await import("../api-client");
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await getAnimalMovementById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should handle network errors correctly", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));
      const result = await getAnimalMovementsByAnimalId("animal-1");
      expect(result).toEqual([]);
    });
  });

  describe("endpoint verification", () => {
    it("should call correct endpoint for getAnimalMovementsByCompanyId", async () => {
      mockGet.mockResolvedValue([]);
      await getAnimalMovementsByCompanyId();
      expect(mockGet).toHaveBeenCalledWith("/animal-movements");
    });

    it("should call correct endpoint for getAnimalMovementsByAnimalId", async () => {
      mockGet.mockResolvedValue([]);
      await getAnimalMovementsByAnimalId("animal-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/animal/animal-1");
    });

    it("should call correct endpoint for getAnimalMovementsByLocationId", async () => {
      mockGet.mockResolvedValue([]);
      await getAnimalMovementsByLocationId("location-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/location/location-1");
    });

    it("should call correct endpoint for getAnimalMovementsByPropertyId", async () => {
      mockGet.mockResolvedValue([]);
      await getAnimalMovementsByPropertyId("property-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/property/property-1");
    });

    it("should call correct endpoint for getAnimalMovementsByEmployeeId", async () => {
      mockGet.mockResolvedValue([]);
      await getAnimalMovementsByEmployeeId("employee-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/employee/employee-1");
    });

    it("should call correct endpoint for getAnimalMovementsByServiceProviderId", async () => {
      mockGet.mockResolvedValue([]);
      await getAnimalMovementsByServiceProviderId("provider-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/service-provider/provider-1");
    });

    it("should call correct endpoint for getAnimalMovementById", async () => {
      mockGet.mockResolvedValue(mockAnimalMovements[0]);
      await getAnimalMovementById("movement-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/movement-1");
    });

    it("should call correct endpoint for getAnimalsByLastMovementLocation", async () => {
      mockGet.mockResolvedValue(["animal-1"]);
      await getAnimalsByLastMovementLocation("location-1");
      expect(mockGet).toHaveBeenCalledWith("/animal-movements/last-location/location-1/animals");
    });

    it("should call correct endpoint for addAnimalMovement", async () => {
      const formData = {
        animalIds: ["animal-1"],
        locationId: "location-1",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2024-01-15",
      };
      mockPost.mockResolvedValue({ ...formData, id: "movement-1" });
      await addAnimalMovement(formData);
      expect(mockPost).toHaveBeenCalledWith("/animal-movements", formData);
    });

    it("should call correct endpoint for deleteAnimalMovement", async () => {
      mockDelete.mockResolvedValue(undefined);
      await deleteAnimalMovement("movement-1");
      expect(mockDelete).toHaveBeenCalledWith("/animal-movements/movement-1");
    });
  });
});
