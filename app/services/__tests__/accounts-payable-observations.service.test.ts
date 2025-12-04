import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsPayableObservationsByAccountsPayableId,
  getAccountsPayableObservationById,
  addAccountsPayableObservation,
  deleteAccountsPayableObservation,
  updateAccountsPayableObservation,
} from "../accounts-payable-observations.service";
import { mockAccountsPayableObservations } from "~/mocks/accounts-payable-observations";
import type { AccountsPayableObservationFormData } from "~/types/accounts-payable-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-123"),
}));

describe("accounts-payable-observations.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAccountsPayableObservations.length = 0;
    mockAccountsPayableObservations.push(
      {
        id: "obs-1",
        accountsPayableId: "ap-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        accountsPayableId: "ap-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        accountsPayableId: "ap-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getAccountsPayableObservationsByAccountsPayableId", () => {
    it("should return all observations for a given accounts payable ID", () => {
      const result = getAccountsPayableObservationsByAccountsPayableId("ap-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when no observations exist for the ID", () => {
      const result = getAccountsPayableObservationsByAccountsPayableId("ap-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should return observations with correct structure", () => {
      const result = getAccountsPayableObservationsByAccountsPayableId("ap-1");
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("accountsPayableId");
      expect(result[0]).toHaveProperty("observation");
      expect(result[0]).toHaveProperty("fileIds");
      expect(result[0]).toHaveProperty("createdAt");
    });
  });

  describe("getAccountsPayableObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getAccountsPayableObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsPayableObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAccountsPayableObservationById(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is empty string", () => {
      const result = getAccountsPayableObservationById("");
      expect(result).toBeUndefined();
    });
  });

  describe("addAccountsPayableObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: AccountsPayableObservationFormData = {
        accountsPayableId: "ap-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockAccountsPayableObservations.length;
      const result = addAccountsPayableObservation(formData);

      expect(mockAccountsPayableObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-123");
      expect(result.accountsPayableId).toBe("ap-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should add observation with file IDs", () => {
      const formData: AccountsPayableObservationFormData = {
        accountsPayableId: "ap-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addAccountsPayableObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });

    it("should add observation to the end of the array", () => {
      const formData: AccountsPayableObservationFormData = {
        accountsPayableId: "ap-3",
        observation: "Last observation",
        fileIds: [],
      };

      const result = addAccountsPayableObservation(formData);
      const lastItem = mockAccountsPayableObservations[mockAccountsPayableObservations.length - 1];
      expect(lastItem.id).toBe(result.id);
    });
  });

  describe("deleteAccountsPayableObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockAccountsPayableObservations.length;
      const result = deleteAccountsPayableObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAccountsPayableObservations).toHaveLength(initialLength - 1);
      expect(mockAccountsPayableObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAccountsPayableObservations.length;
      const result = deleteAccountsPayableObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockAccountsPayableObservations).toHaveLength(initialLength);
    });

    it("should delete the correct observation", () => {
      deleteAccountsPayableObservation("obs-2");
      expect(mockAccountsPayableObservations.find((obs) => obs.id === "obs-2")).toBeUndefined();
      expect(mockAccountsPayableObservations.find((obs) => obs.id === "obs-1")).toBeDefined();
      expect(mockAccountsPayableObservations.find((obs) => obs.id === "obs-3")).toBeDefined();
    });
  });

  describe("updateAccountsPayableObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<AccountsPayableObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateAccountsPayableObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockAccountsPayableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should update multiple fields", () => {
      const updateData: Partial<AccountsPayableObservationFormData> = {
        observation: "Updated observation",
        fileIds: ["file-3"],
      };

      const result = updateAccountsPayableObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockAccountsPayableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.fileIds).toEqual(["file-3"]);
    });

    it("should preserve existing fields when updating", () => {
      const original = mockAccountsPayableObservations.find((obs) => obs.id === "obs-1");
      const originalAccountsPayableId = original?.accountsPayableId;

      const updateData: Partial<AccountsPayableObservationFormData> = {
        observation: "Updated observation",
      };

      updateAccountsPayableObservation("obs-1", updateData);

      const updated = mockAccountsPayableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.accountsPayableId).toBe(originalAccountsPayableId);
      expect(updated?.id).toBe("obs-1");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<AccountsPayableObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateAccountsPayableObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });

    it("should update updatedAt timestamp", () => {
      const original = mockAccountsPayableObservations.find((obs) => obs.id === "obs-1");
      const originalUpdatedAt = original?.updatedAt;

      // Wait a bit to ensure timestamp difference
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      const updateData: Partial<AccountsPayableObservationFormData> = {
        observation: "Updated observation",
      };

      updateAccountsPayableObservation("obs-1", updateData);
      vi.useRealTimers();

      const updated = mockAccountsPayableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });
});
