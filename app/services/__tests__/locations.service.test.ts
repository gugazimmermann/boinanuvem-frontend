import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import { AreaType, LocationType } from "~/types";
import {
  getLocations,
  getLocationById,
  addLocation,
  updateLocation,
  deleteLocation,
} from "../locations.service";

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

describe("locations.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLocations", () => {
    it("should fetch all locations", async () => {
      const mockLocations = [{ id: "1", code: "001", name: "Location 1", status: "active" }];
      mockGet.mockResolvedValue(mockLocations);

      const result = await getLocations();

      expect(mockGet).toHaveBeenCalledWith("/locations", undefined);
      expect(result).toEqual(mockLocations);
    });

    it("should fetch locations with propertyId filter", async () => {
      const mockLocations = [{ id: "1", code: "001", name: "Location 1", status: "active" }];
      mockGet.mockResolvedValue(mockLocations);

      const result = await getLocations("property-1");

      expect(mockGet).toHaveBeenCalledWith("/locations", { propertyId: "property-1" });
      expect(result).toEqual(mockLocations);
    });

    it("should fetch locations with empty string propertyId", async () => {
      const mockLocations = [{ id: "1", code: "001", name: "Location 1", status: "active" }];
      mockGet.mockResolvedValue(mockLocations);

      const result = await getLocations("");

      // Empty string is falsy, so it should pass undefined
      expect(mockGet).toHaveBeenCalledWith("/locations", undefined);
      expect(result).toEqual(mockLocations);
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getLocations()).rejects.toThrow(
        "Você não tem permissão para visualizar localizações"
      );
    });

    it("should handle 401 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(getLocations()).rejects.toThrow("Autenticação necessária");
    });

    it("should rethrow non-ApiError errors", async () => {
      const genericError = new Error("Network error");
      mockGet.mockRejectedValue(genericError);

      await expect(getLocations()).rejects.toThrow("Network error");
    });
  });

  describe("getLocationById", () => {
    it("should fetch location by id", async () => {
      const mockLocation = { id: "1", code: "001", name: "Location 1", status: "active" };
      mockGet.mockResolvedValue(mockLocation);

      const result = await getLocationById("1");

      expect(mockGet).toHaveBeenCalledWith("/locations/1");
      expect(result).toEqual(mockLocation);
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getLocationById("1")).rejects.toThrow(
        "Você não tem permissão para visualizar esta localização"
      );
    });

    it("should handle 404 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(getLocationById("1")).rejects.toThrow("Localização não encontrada");
    });

    it("should handle 401 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(getLocationById("1")).rejects.toThrow("Autenticação necessária");
    });

    it("should rethrow non-ApiError errors", async () => {
      const genericError = new Error("Network error");
      mockGet.mockRejectedValue(genericError);

      await expect(getLocationById("1")).rejects.toThrow("Network error");
    });
  });

  describe("addLocation", () => {
    const formData = {
      code: "001",
      name: "New Location",
      locationType: LocationType.PASTURE,
      area: { value: 50, type: AreaType.HECTARES },
      status: "active" as const,
      companyId: "company-1",
      propertyId: "property-1",
    };

    it("should create location successfully", async () => {
      const mockLocation = { id: "1", ...formData };
      mockPost.mockResolvedValue(mockLocation);

      const result = await addLocation(formData);

      expect(mockPost).toHaveBeenCalledWith("/locations", {
        code: "001",
        name: "New Location",
        locationType: LocationType.PASTURE,
        area: { value: 50, type: AreaType.HECTARES },
        status: "active",
        propertyId: "property-1",
      });
      expect(result).toEqual(mockLocation);
    });

    it("should handle 403 error", async () => {
      mockPost.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(addLocation(formData)).rejects.toThrow(
        "Você não tem permissão para adicionar localizações"
      );
    });

    it("should handle 404 error", async () => {
      mockPost.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(addLocation(formData)).rejects.toThrow("Propriedade não encontrada");
    });

    it("should handle 409 error", async () => {
      mockPost.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(addLocation(formData)).rejects.toThrow(
        "Já existe uma localização com este código"
      );
    });

    it("should handle 400 error", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(addLocation(formData)).rejects.toThrow(
        "Dados inválidos. Verifique os campos preenchidos"
      );
    });

    it("should rethrow non-ApiError errors", async () => {
      const genericError = new Error("Network error");
      mockPost.mockRejectedValue(genericError);

      await expect(addLocation(formData)).rejects.toThrow("Network error");
    });
  });

  describe("updateLocation", () => {
    const updateData = {
      name: "Updated Location",
    };

    it("should update location successfully", async () => {
      const mockLocation = { id: "1", code: "001", name: "Updated Location", status: "active" };
      mockPut.mockResolvedValue(mockLocation);

      const result = await updateLocation("1", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/locations/1",
        expect.objectContaining({
          name: "Updated Location",
        })
      );
      expect(result).toEqual(mockLocation);
    });

    it("should handle 403 error", async () => {
      mockPut.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(updateLocation("1", updateData)).rejects.toThrow(
        "Você não tem permissão para editar localizações"
      );
    });

    it("should handle 404 error", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateLocation("1", updateData)).rejects.toThrow("Localização não encontrada");
    });

    it("should handle 409 error", async () => {
      mockPut.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(updateLocation("1", updateData)).rejects.toThrow(
        "Já existe uma localização com este código"
      );
    });

    it("should handle 400 error", async () => {
      mockPut.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(updateLocation("1", updateData)).rejects.toThrow(
        "Dados inválidos. Verifique os campos preenchidos"
      );
    });

    it("should rethrow non-ApiError errors", async () => {
      const genericError = new Error("Network error");
      mockPut.mockRejectedValue(genericError);

      await expect(updateLocation("1", updateData)).rejects.toThrow("Network error");
    });

    it("should update location with partial data (only some fields)", async () => {
      const mockLocation = { id: "1", code: "001", name: "Updated Name", status: "active" };
      mockPut.mockResolvedValue(mockLocation);

      const partialData = {
        name: "Updated Name",
        status: "inactive" as const,
      };

      const result = await updateLocation("1", partialData);

      expect(mockPut).toHaveBeenCalledWith("/locations/1", {
        code: undefined,
        name: "Updated Name",
        locationType: undefined,
        area: undefined,
        status: "inactive",
        propertyId: undefined,
      });
      expect(result).toEqual(mockLocation);
    });

    it("should update location with all fields undefined", async () => {
      const mockLocation = { id: "1", code: "001", name: "Location 1", status: "active" };
      mockPut.mockResolvedValue(mockLocation);

      const emptyData = {};

      const result = await updateLocation("1", emptyData);

      expect(mockPut).toHaveBeenCalledWith("/locations/1", {
        code: undefined,
        name: undefined,
        locationType: undefined,
        area: undefined,
        status: undefined,
        propertyId: undefined,
      });
      expect(result).toEqual(mockLocation);
    });

    it("should update location with only code field", async () => {
      const mockLocation = { id: "1", code: "NEW-001", name: "Location 1", status: "active" };
      mockPut.mockResolvedValue(mockLocation);

      const result = await updateLocation("1", { code: "NEW-001" });

      expect(mockPut).toHaveBeenCalledWith("/locations/1", {
        code: "NEW-001",
        name: undefined,
        locationType: undefined,
        area: undefined,
        status: undefined,
        propertyId: undefined,
      });
      expect(result).toEqual(mockLocation);
    });
  });

  describe("deleteLocation", () => {
    it("should delete location successfully", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteLocation("1");

      expect(mockDelete).toHaveBeenCalledWith("/locations/1");
    });

    it("should handle 403 error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(deleteLocation("1")).rejects.toThrow(
        "Você não tem permissão para excluir localizações"
      );
    });

    it("should handle 404 error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(deleteLocation("1")).rejects.toThrow("Localização não encontrada");
    });

    it("should handle 401 error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(deleteLocation("1")).rejects.toThrow("Autenticação necessária");
    });

    it("should rethrow non-ApiError errors", async () => {
      const genericError = new Error("Network error");
      mockDelete.mockRejectedValue(genericError);

      await expect(deleteLocation("1")).rejects.toThrow("Network error");
    });
  });
});
