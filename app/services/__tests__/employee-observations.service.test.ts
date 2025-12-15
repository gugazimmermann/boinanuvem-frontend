import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError, apiClient } from "../api-client";
import {
  getEmployeeObservationsByEmployeeId,
  getEmployeeObservationById,
  addEmployeeObservation,
  updateEmployeeObservation,
  deleteEmployeeObservation,
} from "../employee-observations.service";

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
    employeeId: "employee-1",
    observation: "Test observation 1",
    fileIds: ["file-1"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "obs-2",
    employeeId: "employee-1",
    observation: "Test observation 2",
    fileIds: [],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "obs-3",
    employeeId: "employee-2",
    observation: "Test observation 3",
    fileIds: ["file-2", "file-3"],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

type EmployeeObservationFormData = Parameters<typeof addEmployeeObservation>[0];

describe("employee-observations.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmployeeObservationsByEmployeeId", () => {
    it("should return empty array when employeeId is empty", async () => {
      const result = await getEmployeeObservationsByEmployeeId("");
      expect(result).toEqual([]);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observations by employee id", async () => {
      mockGet.mockResolvedValue(mockObservations);

      const result = await getEmployeeObservationsByEmployeeId("employee-1");

      expect(mockGet).toHaveBeenCalledWith("/employees/employee-1/observations");
      expect(result).toHaveLength(3);
      expect(result[0].employeeId).toBe("employee-1");
      expect(result[1].employeeId).toBe("employee-1");
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getEmployeeObservationsByEmployeeId("employee-1");

      expect(result).toEqual([]);
    });
  });

  describe("getEmployeeObservationById", () => {
    it("should return undefined when id is undefined", async () => {
      const result = await getEmployeeObservationById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observation by id", async () => {
      mockGet.mockResolvedValue(mockObservations[0]);

      const result = await getEmployeeObservationById("obs-1");

      expect(mockGet).toHaveBeenCalledWith("/employee-observations/obs-1");
      expect(result).toEqual(mockObservations[0]);
    });

    it("should return undefined on 404 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getEmployeeObservationById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined on 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getEmployeeObservationById("obs-1");

      expect(result).toBeUndefined();
    });
  });

  describe("addEmployeeObservation", () => {
    it("should create new observation", async () => {
      const formData: EmployeeObservationFormData = {
        employeeId: "employee-1",
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

      const result = await addEmployeeObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/employees/employee-1/observations", {
        observation: "New observation",
        fileIds: ["file-4"],
      });
      expect(result.id).toBe("obs-4");
      expect(result.employeeId).toBe("employee-1");
    });

    it("should create observation without fileIds", async () => {
      const formData: EmployeeObservationFormData = {
        employeeId: "employee-1",
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

      const result = await addEmployeeObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/employees/employee-1/observations", {
        observation: "Observation without files",
        fileIds: undefined,
      });
      expect(result.id).toBe("obs-5");
    });

    it("should handle error", async () => {
      const formData: EmployeeObservationFormData = {
        employeeId: "employee-1",
        observation: "New observation",
        fileIds: undefined,
      };

      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(addEmployeeObservation(formData)).rejects.toThrow();
    });
  });

  describe("updateEmployeeObservation", () => {
    it("should update observation", async () => {
      const updateData = { observation: "Updated observation" };
      const updatedObservation = {
        ...mockObservations[0],
        observation: "Updated observation",
        updatedAt: "2024-01-10T00:00:00Z",
      };

      mockPut.mockResolvedValue(updatedObservation);

      const result = await updateEmployeeObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/employee-observations/obs-1", {
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

      const result = await updateEmployeeObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/employee-observations/obs-1", {
        fileIds: ["file-5"],
      });
      expect(result.fileIds).toEqual(["file-5"]);
    });

    it("should handle error", async () => {
      const updateData = { observation: "Updated observation" };

      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateEmployeeObservation("nonexistent", updateData)).rejects.toThrow();
    });
  });

  describe("deleteEmployeeObservation", () => {
    it("should delete observation", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteEmployeeObservation("obs-1");

      expect(mockDelete).toHaveBeenCalledWith("/employee-observations/obs-1");
    });

    it("should handle error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(deleteEmployeeObservation("nonexistent")).rejects.toThrow();
    });
  });
});
