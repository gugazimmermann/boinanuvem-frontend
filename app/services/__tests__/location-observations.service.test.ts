import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError, apiClient } from "../api-client";
import {
  getLocationObservationsByLocationId,
  getLocationObservationById,
  addLocationObservation,
  updateLocationObservation,
  deleteLocationObservation,
} from "../location-observations.service";

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
    locationId: "location-1",
    observation: "Test observation 1",
    fileIds: ["file-1"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "obs-2",
    locationId: "location-1",
    observation: "Test observation 2",
    fileIds: [],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "obs-3",
    locationId: "location-2",
    observation: "Test observation 3",
    fileIds: ["file-2", "file-3"],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

type LocationObservationFormData = Parameters<typeof addLocationObservation>[0];

describe("location-observations.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLocationObservationsByLocationId", () => {
    it("should return empty array when locationId is empty", async () => {
      const result = await getLocationObservationsByLocationId("");
      expect(result).toEqual([]);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observations by location id", async () => {
      mockGet.mockResolvedValue(mockObservations);

      const result = await getLocationObservationsByLocationId("location-1");

      expect(mockGet).toHaveBeenCalledWith("/locations/location-1/observations");
      expect(result).toHaveLength(3);
      expect(result[0].locationId).toBe("location-1");
      expect(result[1].locationId).toBe("location-1");
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getLocationObservationsByLocationId("location-1");

      expect(result).toEqual([]);
    });
  });

  describe("getLocationObservationById", () => {
    it("should return undefined when id is undefined", async () => {
      const result = await getLocationObservationById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observation by id", async () => {
      mockGet.mockResolvedValue(mockObservations[0]);

      const result = await getLocationObservationById("obs-1");

      expect(mockGet).toHaveBeenCalledWith("/location-observations/obs-1");
      expect(result).toEqual(mockObservations[0]);
    });

    it("should return undefined on 404 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getLocationObservationById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined on 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getLocationObservationById("obs-1");

      expect(result).toBeUndefined();
    });
  });

  describe("addLocationObservation", () => {
    it("should create new observation", async () => {
      const formData: LocationObservationFormData = {
        locationId: "location-1",
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

      const result = await addLocationObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/locations/location-1/observations", {
        observation: "New observation",
        fileIds: ["file-4"],
      });
      expect(result.id).toBe("obs-4");
      expect(result.locationId).toBe("location-1");
    });

    it("should create observation without fileIds", async () => {
      const formData: LocationObservationFormData = {
        locationId: "location-1",
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

      const result = await addLocationObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/locations/location-1/observations", {
        observation: "Observation without files",
        fileIds: undefined,
      });
      expect(result.id).toBe("obs-5");
    });

    it("should handle error", async () => {
      const formData: LocationObservationFormData = {
        locationId: "location-1",
        observation: "New observation",
        fileIds: undefined,
      };

      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(addLocationObservation(formData)).rejects.toThrow();
    });
  });

  describe("updateLocationObservation", () => {
    it("should update observation", async () => {
      const updateData = { observation: "Updated observation" };
      const updatedObservation = {
        ...mockObservations[0],
        observation: "Updated observation",
        updatedAt: "2024-01-10T00:00:00Z",
      };

      mockPut.mockResolvedValue(updatedObservation);

      const result = await updateLocationObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/location-observations/obs-1", {
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

      const result = await updateLocationObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/location-observations/obs-1", {
        fileIds: ["file-5"],
      });
      expect(result.fileIds).toEqual(["file-5"]);
    });

    it("should handle error", async () => {
      const updateData = { observation: "Updated observation" };

      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateLocationObservation("nonexistent", updateData)).rejects.toThrow();
    });
  });

  describe("deleteLocationObservation", () => {
    it("should delete observation", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteLocationObservation("obs-1");

      expect(mockDelete).toHaveBeenCalledWith("/location-observations/obs-1");
    });

    it("should handle error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(deleteLocationObservation("nonexistent")).rejects.toThrow();
    });
  });
});
