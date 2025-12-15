import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocationMovementType } from "~/types/location-movement";
import {
  getLocationMovementsByLocationId,
  getLocationMovementsByPropertyId,
  getLocationMovementsByCompanyId,
  getLocationMovementsByEmployeeId,
  getLocationMovementsByServiceProviderId,
  getLocationMovementsByType,
  getLocationMovementById,
  addLocationMovement,
  updateLocationMovement,
  deleteLocationMovement,
} from "../location-movements.service";

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

const mockLocationMovements = [
  {
    id: "movement-1",
    locationIds: ["location-1", "location-2"],
    propertyId: "property-1",
    companyId: "company-1",
    employeeIds: ["employee-1"],
    serviceProviderIds: ["provider-1"],
    type: LocationMovementType.SEEDING,
    date: "2024-01-15",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "movement-2",
    locationIds: ["location-1"],
    propertyId: "property-1",
    companyId: "company-1",
    employeeIds: ["employee-2"],
    type: LocationMovementType.HARVESTING,
    date: "2024-02-15",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
];

describe("location-movements.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLocationMovementsByLocationId", () => {
    it("should find movements by location id", async () => {
      mockGet.mockResolvedValue(mockLocationMovements);
      const result = await getLocationMovementsByLocationId("location-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/location/location-1");
      expect(result).toHaveLength(2);
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getLocationMovementsByLocationId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getLocationMovementsByPropertyId", () => {
    it("should find movements by property id", async () => {
      mockGet.mockResolvedValue(mockLocationMovements);
      const result = await getLocationMovementsByPropertyId("property-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/property/property-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getLocationMovementsByCompanyId", () => {
    it("should find movements by company id", async () => {
      mockGet.mockResolvedValue(mockLocationMovements);
      const result = await getLocationMovementsByCompanyId("company-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements");
      expect(result).toHaveLength(2);
    });
  });

  describe("getLocationMovementsByEmployeeId", () => {
    it("should find movements by employee id", async () => {
      mockGet.mockResolvedValue([mockLocationMovements[0]]);
      const result = await getLocationMovementsByEmployeeId("employee-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/employee/employee-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getLocationMovementsByServiceProviderId", () => {
    it("should find movements by service provider id", async () => {
      mockGet.mockResolvedValue([mockLocationMovements[0]]);
      const result = await getLocationMovementsByServiceProviderId("provider-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/service-provider/provider-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getLocationMovementsByType", () => {
    it("should find movements by type", async () => {
      mockGet.mockResolvedValue([mockLocationMovements[0]]);
      const result = await getLocationMovementsByType(LocationMovementType.SEEDING);
      expect(mockGet).toHaveBeenCalledWith("/location-movements/type/seeding");
      expect(result).toHaveLength(1);
    });
  });

  describe("getLocationMovementById", () => {
    it("should find movement by id", async () => {
      mockGet.mockResolvedValue(mockLocationMovements[0]);
      const result = await getLocationMovementById("movement-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/movement-1");
      expect(result).toEqual(mockLocationMovements[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getLocationMovementById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("addLocationMovement", () => {
    it("should create new movement", async () => {
      const formData = {
        locationIds: ["location-3"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        type: LocationMovementType.SEEDING,
        date: "2024-03-01",
      };

      const createdMovement = {
        ...formData,
        id: "movement-3",
        createdAt: "2024-03-01T00:00:00Z",
        updatedAt: "2024-03-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(createdMovement);
      const result = await addLocationMovement(formData);

      expect(mockPost).toHaveBeenCalledWith("/location-movements", formData);
      expect(result.id).toBe("movement-3");
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateLocationMovement", () => {
    it("should update movement", async () => {
      const updateData = { type: LocationMovementType.HARVESTING };
      const updatedMovement = {
        ...mockLocationMovements[0],
        ...updateData,
      };

      mockPut.mockResolvedValue(updatedMovement);
      const result = await updateLocationMovement("movement-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/location-movements/movement-1", updateData);
      expect(result.type).toBe(LocationMovementType.HARVESTING);
    });
  });

  describe("deleteLocationMovement", () => {
    it("should delete movement", async () => {
      mockDelete.mockResolvedValue(undefined);
      await deleteLocationMovement("movement-1");
      expect(mockDelete).toHaveBeenCalledWith("/location-movements/movement-1");
    });
  });

  describe("date transformations", () => {
    it("should transform date fields from Date objects to strings", async () => {
      const backendResponse = {
        id: "movement-1",
        locationIds: ["location-1"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        type: LocationMovementType.SEEDING,
        date: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15T00:00:00Z"),
        updatedAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getLocationMovementById("movement-1");
      expect(result?.date).toBe("2024-01-15");
      expect(typeof result?.createdAt).toBe("string");
      expect(typeof result?.updatedAt).toBe("string");
    });

    it("should transform date fields in list responses", async () => {
      const backendResponse = [
        {
          id: "movement-1",
          locationIds: ["location-1"],
          propertyId: "property-1",
          companyId: "company-1",
          employeeIds: [],
          serviceProviderIds: [],
          type: LocationMovementType.SEEDING,
          date: new Date("2024-01-15"),
          createdAt: new Date("2024-01-15T00:00:00Z"),
          updatedAt: new Date("2024-01-15T00:00:00Z"),
        },
      ];
      mockGet.mockResolvedValue(backendResponse);
      const result = await getLocationMovementsByLocationId("location-1");
      expect(result[0]?.date).toBe("2024-01-15");
      expect(typeof result[0]?.createdAt).toBe("string");
      expect(typeof result[0]?.updatedAt).toBe("string");
    });

    it("should handle missing date fields gracefully", async () => {
      const backendResponse = {
        id: "movement-1",
        locationIds: ["location-1"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        type: LocationMovementType.SEEDING,
        date: null,
        createdAt: null,
        updatedAt: null,
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getLocationMovementById("movement-1");
      expect(result).toBeDefined();
      expect(result?.date).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle 403 errors correctly", async () => {
      const { ApiError } = await import("../api-client");
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));
      const result = await getLocationMovementsByLocationId("location-1");
      expect(result).toEqual([]);
    });

    it("should handle 404 errors correctly", async () => {
      const { ApiError } = await import("../api-client");
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await getLocationMovementById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should handle network errors correctly", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));
      const result = await getLocationMovementsByLocationId("location-1");
      expect(result).toEqual([]);
    });
  });

  describe("endpoint verification", () => {
    it("should call correct endpoint for getLocationMovementsByCompanyId", async () => {
      mockGet.mockResolvedValue([]);
      await getLocationMovementsByCompanyId();
      expect(mockGet).toHaveBeenCalledWith("/location-movements");
    });

    it("should call correct endpoint for getLocationMovementsByLocationId", async () => {
      mockGet.mockResolvedValue([]);
      await getLocationMovementsByLocationId("location-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/location/location-1");
    });

    it("should call correct endpoint for getLocationMovementsByPropertyId", async () => {
      mockGet.mockResolvedValue([]);
      await getLocationMovementsByPropertyId("property-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/property/property-1");
    });

    it("should call correct endpoint for getLocationMovementsByEmployeeId", async () => {
      mockGet.mockResolvedValue([]);
      await getLocationMovementsByEmployeeId("employee-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/employee/employee-1");
    });

    it("should call correct endpoint for getLocationMovementsByServiceProviderId", async () => {
      mockGet.mockResolvedValue([]);
      await getLocationMovementsByServiceProviderId("provider-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/service-provider/provider-1");
    });

    it("should call correct endpoint for getLocationMovementsByType", async () => {
      mockGet.mockResolvedValue([]);
      await getLocationMovementsByType(LocationMovementType.SEEDING);
      expect(mockGet).toHaveBeenCalledWith("/location-movements/type/seeding");
    });

    it("should call correct endpoint for getLocationMovementById", async () => {
      mockGet.mockResolvedValue(mockLocationMovements[0]);
      await getLocationMovementById("movement-1");
      expect(mockGet).toHaveBeenCalledWith("/location-movements/movement-1");
    });

    it("should call correct endpoint for addLocationMovement", async () => {
      const formData = {
        locationIds: ["location-1"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        type: LocationMovementType.SEEDING,
        date: "2024-01-15",
      };
      mockPost.mockResolvedValue({ ...formData, id: "movement-1" });
      await addLocationMovement(formData);
      expect(mockPost).toHaveBeenCalledWith("/location-movements", formData);
    });

    it("should call correct endpoint for updateLocationMovement", async () => {
      const updateData = { type: LocationMovementType.HARVESTING };
      mockPut.mockResolvedValue({ ...mockLocationMovements[0], ...updateData });
      await updateLocationMovement("movement-1", updateData);
      expect(mockPut).toHaveBeenCalledWith("/location-movements/movement-1", updateData);
    });

    it("should call correct endpoint for deleteLocationMovement", async () => {
      mockDelete.mockResolvedValue(undefined);
      await deleteLocationMovement("movement-1");
      expect(mockDelete).toHaveBeenCalledWith("/location-movements/movement-1");
    });
  });
});
