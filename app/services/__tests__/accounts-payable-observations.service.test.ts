import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsPayableObservationsByAccountsPayableId,
  getAccountsPayableObservationById,
  addAccountsPayableObservation,
  updateAccountsPayableObservation,
  deleteAccountsPayableObservation,
} from "../accounts-payable-observations.service";
import { mockAccountsPayableObservations } from "~/mocks/accounts-payable-observations";
import type { AccountsPayableObservationFormData } from "~/types/accounts-payable-observation";

vi.mock("~/mocks/accounts-payable-observations", () => ({
  mockAccountsPayableObservations: [],
}));

describe("accounts-payable-observations.service", () => {
  beforeEach(() => {
    mockAccountsPayableObservations.length = 0;
    mockAccountsPayableObservations.push(
      {
        id: "obs-1",
        accountsPayableId: "ap-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
        createdBy: "user-1",
      },
      {
        id: "obs-2",
        accountsPayableId: "ap-1",
        observation: "Test observation 2",
        fileIds: ["file-1"],
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
        createdBy: "user-1",
      },
      {
        id: "obs-3",
        accountsPayableId: "ap-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2020-01-03",
        updatedAt: "2020-01-03",
        createdBy: "user-2",
      }
    );
  });

  describe("getAccountsPayableObservationsByAccountsPayableId", () => {
    it("should return observations for specific accounts payable", () => {
      const result = getAccountsPayableObservationsByAccountsPayableId("ap-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.accountsPayableId === "ap-1")).toBe(true);
    });

    it("should return empty array when accounts payable has no observations", () => {
      const result = getAccountsPayableObservationsByAccountsPayableId("nonexistent-ap");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsPayableObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getAccountsPayableObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsPayableObservationById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("addAccountsPayableObservation", () => {
    it("should add new observation with generated ID and timestamps", () => {
      const formData: AccountsPayableObservationFormData = {
        accountsPayableId: "ap-3",
        observation: "New observation",
        fileIds: ["file-2"],
      };

      const initialLength = mockAccountsPayableObservations.length;
      const result = addAccountsPayableObservation(formData);

      expect(mockAccountsPayableObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.observation).toBe("New observation");
      expect(result.accountsPayableId).toBe("ap-3");
      expect(result.fileIds).toEqual(["file-2"]);
    });
  });

  describe("updateAccountsPayableObservation", () => {
    it("should update existing observation and update timestamp", () => {
      const originalUpdatedAt = mockAccountsPayableObservations[0].updatedAt;
      const result = updateAccountsPayableObservation("obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockAccountsPayableObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("should return false when observation does not exist", () => {
      const result = updateAccountsPayableObservation("nonexistent-id", {
        observation: "New observation",
      });
      expect(result).toBe(false);
    });
  });

  describe("deleteAccountsPayableObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockAccountsPayableObservations.length;
      const result = deleteAccountsPayableObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAccountsPayableObservations).toHaveLength(initialLength - 1);
    });

    it("should return false when observation does not exist", () => {
      const initialLength = mockAccountsPayableObservations.length;
      const result = deleteAccountsPayableObservation("nonexistent-id");

      expect(result).toBe(false);
      expect(mockAccountsPayableObservations).toHaveLength(initialLength);
    });
  });
});
