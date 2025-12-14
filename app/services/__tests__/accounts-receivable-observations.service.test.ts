import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import {
  getAccountsReceivableObservations,
  getAccountsReceivableObservationsByAccountsReceivableId,
  getAccountsReceivableObservationById,
  addAccountsReceivableObservation,
  updateAccountsReceivableObservation,
  deleteAccountsReceivableObservation,
} from "../accounts-receivable-observations.service";

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

const mockObservations = [
  {
    id: "obs-1",
    accountsReceivableId: "ar-1",
    observation: "Test observation 1",
    fileIds: ["file-1"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "obs-2",
    accountsReceivableId: "ar-1",
    observation: "Test observation 2",
    fileIds: [],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "obs-3",
    accountsReceivableId: "ar-2",
    observation: "Test observation 3",
    fileIds: ["file-2", "file-3"],
    createdAt: "2024-01-03T00:00:00Z",
  },
];

describe("accounts-receivable-observations.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountsReceivableObservations", () => {
    it("should fetch all accounts receivable observations", async () => {
      mockGet.mockResolvedValue(mockObservations);

      const result = await getAccountsReceivableObservations();

      expect(mockGet).toHaveBeenCalledWith("/accounts-receivable-observations");
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("obs-1");
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAccountsReceivableObservations();

      expect(result).toEqual([]);
    });
  });

  describe("getAccountsReceivableObservationsByAccountsReceivableId", () => {
    it("should filter observations by accounts receivable id", async () => {
      mockGet.mockResolvedValue(mockObservations);

      const result = await getAccountsReceivableObservationsByAccountsReceivableId("ar-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-receivable-observations");
      expect(result).toHaveLength(2);
      expect(result[0].accountsReceivableId).toBe("ar-1");
      expect(result[1].accountsReceivableId).toBe("ar-1");
    });

    it("should return empty array when no matches", async () => {
      mockGet.mockResolvedValue(mockObservations);

      const result = await getAccountsReceivableObservationsByAccountsReceivableId("nonexistent");

      expect(result).toEqual([]);
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAccountsReceivableObservationsByAccountsReceivableId("ar-1");

      expect(result).toEqual([]);
    });
  });

  describe("getAccountsReceivableObservationById", () => {
    it("should fetch observation by id", async () => {
      mockGet.mockResolvedValue(mockObservations[0]);

      const result = await getAccountsReceivableObservationById("obs-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-receivable-observations/obs-1");
      expect(result).toEqual(mockObservations[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getAccountsReceivableObservationById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getAccountsReceivableObservationById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAccountsReceivableObservationById("obs-1");

      expect(result).toBeUndefined();
    });
  });

  describe("addAccountsReceivableObservation", () => {
    it("should create new observation", async () => {
      const formData = {
        accountsReceivableId: "ar-1",
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

      const result = await addAccountsReceivableObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/accounts-receivable-observations", {
        accountsReceivableId: "ar-1",
        observation: "New observation",
        fileIds: ["file-4"],
      });
      expect(result.id).toBe("obs-4");
      expect(result.accountsReceivableId).toBe("ar-1");
    });

    it("should create observation without fileIds", async () => {
      const formData = {
        accountsReceivableId: "ar-1",
        observation: "Observation without files",
      };

      const newObservation = {
        id: "obs-5",
        ...formData,
        createdAt: "2024-01-05T00:00:00Z",
      };

      mockPost.mockResolvedValue(newObservation);

      const result = await addAccountsReceivableObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/accounts-receivable-observations", {
        accountsReceivableId: "ar-1",
        observation: "Observation without files",
        fileIds: undefined,
      });
      expect(result.id).toBe("obs-5");
    });

    it("should handle error", async () => {
      const formData = {
        accountsReceivableId: "ar-1",
        observation: "New observation",
      };

      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(addAccountsReceivableObservation(formData)).rejects.toThrow();
    });
  });

  describe("updateAccountsReceivableObservation", () => {
    it("should update observation", async () => {
      const updateData = { observation: "Updated observation" };
      const updatedObservation = {
        ...mockObservations[0],
        observation: "Updated observation",
        updatedAt: "2024-01-10T00:00:00Z",
      };

      mockPut.mockResolvedValue(updatedObservation);

      const result = await updateAccountsReceivableObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/accounts-receivable-observations/obs-1", {
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

      const result = await updateAccountsReceivableObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/accounts-receivable-observations/obs-1", {
        fileIds: ["file-5"],
      });
      expect(result.fileIds).toEqual(["file-5"]);
    });

    it("should handle error", async () => {
      const updateData = { observation: "Updated observation" };

      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(
        updateAccountsReceivableObservation("nonexistent", updateData)
      ).rejects.toThrow();
    });
  });

  describe("deleteAccountsReceivableObservation", () => {
    it("should delete observation", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteAccountsReceivableObservation("obs-1");

      expect(mockDelete).toHaveBeenCalledWith("/accounts-receivable-observations/obs-1");
    });

    it("should handle error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(deleteAccountsReceivableObservation("nonexistent")).rejects.toThrow();
    });
  });
});
