import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsReceivableObservationsByAccountsReceivableId,
  getAccountsReceivableObservationById,
  addAccountsReceivableObservation,
  updateAccountsReceivableObservation,
  deleteAccountsReceivableObservation,
} from "../accounts-receivable-observations.service";
import { mockAccountsReceivableObservations } from "~/mocks/accounts-receivable-observations";
import type { AccountsReceivableObservationFormData } from "~/types/accounts-receivable-observation";

vi.mock("~/mocks/accounts-receivable-observations", () => ({
  mockAccountsReceivableObservations: [],
}));

describe("accounts-receivable-observations.service", () => {
  beforeEach(() => {
    mockAccountsReceivableObservations.length = 0;
    mockAccountsReceivableObservations.push(
      {
        id: "obs-1",
        accountsReceivableId: "ar-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
        createdBy: "user-1",
      },
      {
        id: "obs-2",
        accountsReceivableId: "ar-1",
        observation: "Test observation 2",
        fileIds: ["file-1"],
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
        createdBy: "user-1",
      },
      {
        id: "obs-3",
        accountsReceivableId: "ar-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2020-01-03",
        updatedAt: "2020-01-03",
        createdBy: "user-2",
      }
    );
  });

  describe("getAccountsReceivableObservationsByAccountsReceivableId", () => {
    it("should return observations for specific accounts receivable", () => {
      const result = getAccountsReceivableObservationsByAccountsReceivableId("ar-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.accountsReceivableId === "ar-1")).toBe(true);
    });

    it("should return empty array when accounts receivable has no observations", () => {
      const result = getAccountsReceivableObservationsByAccountsReceivableId("nonexistent-ar");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsReceivableObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getAccountsReceivableObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsReceivableObservationById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("addAccountsReceivableObservation", () => {
    it("should add new observation with generated ID and timestamps", () => {
      const formData: AccountsReceivableObservationFormData = {
        accountsReceivableId: "ar-3",
        observation: "New observation",
        fileIds: ["file-2"],
      };

      const initialLength = mockAccountsReceivableObservations.length;
      const result = addAccountsReceivableObservation(formData);

      expect(mockAccountsReceivableObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.observation).toBe("New observation");
      expect(result.accountsReceivableId).toBe("ar-3");
      expect(result.fileIds).toEqual(["file-2"]);
    });
  });

  describe("updateAccountsReceivableObservation", () => {
    it("should update existing observation and update timestamp", () => {
      const originalUpdatedAt = mockAccountsReceivableObservations[0].updatedAt;
      const result = updateAccountsReceivableObservation("obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockAccountsReceivableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("should return false when observation does not exist", () => {
      const result = updateAccountsReceivableObservation("nonexistent-id", {
        observation: "New observation",
      });
      expect(result).toBe(false);
    });
  });

  describe("deleteAccountsReceivableObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockAccountsReceivableObservations.length;
      const result = deleteAccountsReceivableObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAccountsReceivableObservations).toHaveLength(initialLength - 1);
    });

    it("should return false when observation does not exist", () => {
      const initialLength = mockAccountsReceivableObservations.length;
      const result = deleteAccountsReceivableObservation("nonexistent-id");

      expect(result).toBe(false);
      expect(mockAccountsReceivableObservations).toHaveLength(initialLength);
    });
  });
});
