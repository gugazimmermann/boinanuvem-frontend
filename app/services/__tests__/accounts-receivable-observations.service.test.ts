import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsReceivableObservationsByAccountsReceivableId,
  getAccountsReceivableObservationById,
  addAccountsReceivableObservation,
  deleteAccountsReceivableObservation,
  updateAccountsReceivableObservation,
} from "../accounts-receivable-observations.service";
import { mockAccountsReceivableObservations } from "~/mocks/accounts-receivable-observations";
import type { AccountsReceivableObservationFormData } from "~/types/accounts-receivable-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-456"),
}));

describe("accounts-receivable-observations.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAccountsReceivableObservations.length = 0;
    mockAccountsReceivableObservations.push(
      {
        id: "obs-1",
        accountsReceivableId: "ar-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        accountsReceivableId: "ar-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        accountsReceivableId: "ar-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getAccountsReceivableObservationsByAccountsReceivableId", () => {
    it("should return all observations for a given accounts receivable ID", () => {
      const result = getAccountsReceivableObservationsByAccountsReceivableId("ar-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when no observations exist for the ID", () => {
      const result = getAccountsReceivableObservationsByAccountsReceivableId("ar-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should return observations with correct structure", () => {
      const result = getAccountsReceivableObservationsByAccountsReceivableId("ar-1");
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("accountsReceivableId");
      expect(result[0]).toHaveProperty("observation");
      expect(result[0]).toHaveProperty("fileIds");
      expect(result[0]).toHaveProperty("createdAt");
    });
  });

  describe("getAccountsReceivableObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getAccountsReceivableObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsReceivableObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAccountsReceivableObservationById(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is empty string", () => {
      const result = getAccountsReceivableObservationById("");
      expect(result).toBeUndefined();
    });
  });

  describe("addAccountsReceivableObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: AccountsReceivableObservationFormData = {
        accountsReceivableId: "ar-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockAccountsReceivableObservations.length;
      const result = addAccountsReceivableObservation(formData);

      expect(mockAccountsReceivableObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-456");
      expect(result.accountsReceivableId).toBe("ar-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should add observation with file IDs", () => {
      const formData: AccountsReceivableObservationFormData = {
        accountsReceivableId: "ar-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addAccountsReceivableObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });

    it("should add observation to the end of the array", () => {
      const formData: AccountsReceivableObservationFormData = {
        accountsReceivableId: "ar-3",
        observation: "Last observation",
        fileIds: [],
      };

      const result = addAccountsReceivableObservation(formData);
      const lastItem =
        mockAccountsReceivableObservations[mockAccountsReceivableObservations.length - 1];
      expect(lastItem.id).toBe(result.id);
    });
  });

  describe("deleteAccountsReceivableObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockAccountsReceivableObservations.length;
      const result = deleteAccountsReceivableObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAccountsReceivableObservations).toHaveLength(initialLength - 1);
      expect(mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAccountsReceivableObservations.length;
      const result = deleteAccountsReceivableObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockAccountsReceivableObservations).toHaveLength(initialLength);
    });

    it("should delete the correct observation", () => {
      deleteAccountsReceivableObservation("obs-2");
      expect(mockAccountsReceivableObservations.find((obs) => obs.id === "obs-2")).toBeUndefined();
      expect(mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1")).toBeDefined();
      expect(mockAccountsReceivableObservations.find((obs) => obs.id === "obs-3")).toBeDefined();
    });
  });

  describe("updateAccountsReceivableObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<AccountsReceivableObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateAccountsReceivableObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should update multiple fields", () => {
      const updateData: Partial<AccountsReceivableObservationFormData> = {
        observation: "Updated observation",
        fileIds: ["file-3"],
      };

      const result = updateAccountsReceivableObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.fileIds).toEqual(["file-3"]);
    });

    it("should preserve existing fields when updating", () => {
      const original = mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1");
      const originalAccountsReceivableId = original?.accountsReceivableId;

      const updateData: Partial<AccountsReceivableObservationFormData> = {
        observation: "Updated observation",
      };

      updateAccountsReceivableObservation("obs-1", updateData);

      const updated = mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.accountsReceivableId).toBe(originalAccountsReceivableId);
      expect(updated?.id).toBe("obs-1");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<AccountsReceivableObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateAccountsReceivableObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });

    it("should update updatedAt timestamp", () => {
      const original = mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1");
      const originalUpdatedAt = original?.updatedAt;

      // Wait a bit to ensure timestamp difference
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      const updateData: Partial<AccountsReceivableObservationFormData> = {
        observation: "Updated observation",
      };

      updateAccountsReceivableObservation("obs-1", updateData);
      vi.useRealTimers();

      const updated = mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });
});
