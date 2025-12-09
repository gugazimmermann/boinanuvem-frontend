import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import {
  getProperties,
  getPropertyById,
  addProperty,
  updateProperty,
  deleteProperty,
} from "../properties.service";
import { AreaType } from "~/types";

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

vi.mock("~/components/site/utils/masks", () => ({
  unmaskCEP: vi.fn((val: string | undefined) => val?.replace(/\D/g, "") || ""),
}));

import { apiClient } from "../api-client";

describe("properties.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProperties", () => {
    it("should fetch all properties", async () => {
      const mockProperties = [{ id: "1", code: "001", name: "Property 1", status: "active" }];
      mockGet.mockResolvedValue(mockProperties);

      const result = await getProperties();

      expect(mockGet).toHaveBeenCalledWith("/properties");
      expect(result).toEqual(mockProperties);
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getProperties()).rejects.toThrow(
        "Você não tem permissão para visualizar propriedades"
      );
    });
  });

  describe("getPropertyById", () => {
    it("should fetch property by id", async () => {
      const mockProperty = { id: "1", code: "001", name: "Property 1", status: "active" };
      mockGet.mockResolvedValue(mockProperty);

      const result = await getPropertyById("1");

      expect(mockGet).toHaveBeenCalledWith("/properties/1");
      expect(result).toEqual(mockProperty);
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getPropertyById("1")).rejects.toThrow(
        "Você não tem permissão para visualizar esta propriedade"
      );
    });
  });

  describe("addProperty", () => {
    const formData = {
      code: "001",
      name: "New Property",
      area: { value: 100, type: AreaType.HECTARES },
      status: "active" as const,
      street: "Main St",
      number: "123",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "sp",
      zipCode: "01234-567",
      pasturePlanning: [],
      breedingMonths: [],
      pasturePlanningModifiedByUser: false,
      breedingSeasonModifiedByUser: false,
      companyId: "company-1",
      complement: "",
    };

    it("should create property successfully", async () => {
      const mockProperty = { id: "1", ...formData };
      mockPost.mockResolvedValue(mockProperty);

      const result = await addProperty(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/properties",
        expect.objectContaining({
          code: "001",
          name: "New Property",
          state: "SP",
          zipCode: "01234567",
        })
      );
      expect(result).toEqual(mockProperty);
    });

    it("should handle 409 error", async () => {
      mockPost.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(addProperty(formData)).rejects.toThrow(
        "Já existe uma propriedade com este código"
      );
    });
  });

  describe("updateProperty", () => {
    const updateData = {
      name: "Updated Property",
      state: "rj",
    };

    it("should update property successfully", async () => {
      const mockProperty = { id: "1", code: "001", name: "Updated Property", status: "active" };
      mockPut.mockResolvedValue(mockProperty);

      const result = await updateProperty("1", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/properties/1",
        expect.objectContaining({
          name: "Updated Property",
          state: "RJ",
        })
      );
      expect(result).toEqual(mockProperty);
    });
  });

  describe("deleteProperty", () => {
    it("should delete property successfully", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteProperty("1");

      expect(mockDelete).toHaveBeenCalledWith("/properties/1");
    });

    it("should handle 403 error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(deleteProperty("1")).rejects.toThrow(
        "Você não tem permissão para excluir propriedades"
      );
    });
  });
});
