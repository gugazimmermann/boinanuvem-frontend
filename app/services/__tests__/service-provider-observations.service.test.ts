import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError, apiClient } from "../api-client";
import {
  getServiceProviderObservationsByServiceProviderId,
  getServiceProviderObservationById,
  addServiceProviderObservation,
  updateServiceProviderObservation,
  deleteServiceProviderObservation,
} from "../service-provider-observations.service";

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

const mockObservations = [
  {
    id: "obs-1",
    serviceProviderId: "provider-1",
    observation: "Test observation 1",
    fileIds: ["file-1"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "obs-2",
    serviceProviderId: "provider-1",
    observation: "Test observation 2",
    fileIds: [],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "obs-3",
    serviceProviderId: "provider-2",
    observation: "Test observation 3",
    fileIds: ["file-2", "file-3"],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

type ServiceProviderObservationFormData = Parameters<typeof addServiceProviderObservation>[0];

describe("service-provider-observations.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getServiceProviderObservationsByServiceProviderId", () => {
    it("should return empty array when serviceProviderId is empty", async () => {
      const result = await getServiceProviderObservationsByServiceProviderId("");
      expect(result).toEqual([]);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observations by service provider id", async () => {
      mockGet.mockResolvedValue(mockObservations);

      const result = await getServiceProviderObservationsByServiceProviderId("provider-1");

      expect(mockGet).toHaveBeenCalledWith("/service-providers/provider-1/observations");
      expect(result).toHaveLength(3);
      expect(result[0].serviceProviderId).toBe("provider-1");
      expect(result[1].serviceProviderId).toBe("provider-1");
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getServiceProviderObservationsByServiceProviderId("provider-1");

      expect(result).toEqual([]);
    });
  });

  describe("getServiceProviderObservationById", () => {
    it("should return undefined when id is undefined", async () => {
      const result = await getServiceProviderObservationById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observation by id", async () => {
      mockGet.mockResolvedValue(mockObservations[0]);

      const result = await getServiceProviderObservationById("obs-1");

      expect(mockGet).toHaveBeenCalledWith("/service-provider-observations/obs-1");
      expect(result).toEqual(mockObservations[0]);
    });

    it("should return undefined on 404 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getServiceProviderObservationById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined on 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getServiceProviderObservationById("obs-1");

      expect(result).toBeUndefined();
    });
  });

  describe("addServiceProviderObservation", () => {
    it("should create new observation", async () => {
      const formData: ServiceProviderObservationFormData = {
        serviceProviderId: "provider-1",
        observation: "New observation",
        fileIds: ["file-4"],
      };

      const newObservation = {
        id: "obs-4",
        ...formData,
        createdAt: "2024-01-04T00:00:00Z",
        updatedAt: "2024-01-04T00:00:00Z",
      };

      mockPost.mockResolvedValue(newObservation);

      const result = await addServiceProviderObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/service-providers/provider-1/observations", {
        observation: "New observation",
        fileIds: ["file-4"],
      });
      expect(result.id).toBe("obs-4");
      expect(result.serviceProviderId).toBe("provider-1");
    });

    it("should create observation without fileIds", async () => {
      const formData: ServiceProviderObservationFormData = {
        serviceProviderId: "provider-1",
        observation: "Observation without files",
        fileIds: undefined,
      };

      const newObservation = {
        id: "obs-5",
        ...formData,
        fileIds: undefined,
        createdAt: "2024-01-05T00:00:00Z",
        updatedAt: "2024-01-05T00:00:00Z",
      };

      mockPost.mockResolvedValue(newObservation);

      const result = await addServiceProviderObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/service-providers/provider-1/observations", {
        observation: "Observation without files",
        fileIds: undefined,
      });
      expect(result.id).toBe("obs-5");
    });

    it("should handle error", async () => {
      const formData: ServiceProviderObservationFormData = {
        serviceProviderId: "provider-1",
        observation: "New observation",
        fileIds: undefined,
      };

      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(addServiceProviderObservation(formData)).rejects.toThrow();
    });
  });

  describe("updateServiceProviderObservation", () => {
    it("should update observation", async () => {
      const updateData = { observation: "Updated observation" };
      const updatedObservation = {
        ...mockObservations[0],
        observation: "Updated observation",
        updatedAt: "2024-01-10T00:00:00Z",
      };

      mockPut.mockResolvedValue(updatedObservation);

      const result = await updateServiceProviderObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/service-provider-observations/obs-1", {
        observation: "Updated observation",
      });
      expect(result.observation).toBe("Updated observation");
    });

    it("should update observation with fileIds", async () => {
      const updateData = { fileIds: ["file-5"] };
      const updatedObservation = {
        ...mockObservations[0],
        fileIds: ["file-5"],
        updatedAt: "2024-01-10T00:00:00Z",
      };

      mockPut.mockResolvedValue(updatedObservation);

      const result = await updateServiceProviderObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/service-provider-observations/obs-1", {
        fileIds: ["file-5"],
      });
      expect(result.fileIds).toEqual(["file-5"]);
    });

    it("should handle error", async () => {
      const updateData = { observation: "Updated observation" };

      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateServiceProviderObservation("nonexistent", updateData)).rejects.toThrow();
    });
  });

  describe("deleteServiceProviderObservation", () => {
    it("should delete observation", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteServiceProviderObservation("obs-1");

      expect(mockDelete).toHaveBeenCalledWith("/service-provider-observations/obs-1");
    });

    it("should handle error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(deleteServiceProviderObservation("nonexistent")).rejects.toThrow();
    });
  });
});
