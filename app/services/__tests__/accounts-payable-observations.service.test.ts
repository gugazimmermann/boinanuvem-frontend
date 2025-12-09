import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsPayableObservationsByAccountsPayableId,
  getAccountsPayableObservationById,
  addAccountsPayableObservation,
  updateAccountsPayableObservation,
  deleteAccountsPayableObservation,
} from "../accounts-payable-observations.service";

vi.mock("~/mocks/accounts-payable-observations", () => ({
  mockAccountsPayableObservations: [
    {
      id: "obs-1",
      accountsPayableId: "ap-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockAccountsPayableObservations } from "~/mocks/accounts-payable-observations";

describe("accounts-payable-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountsPayableObservationsByAccountsPayableId", () => {
    it("should find observations by accounts payable id", () => {
      const result = getAccountsPayableObservationsByAccountsPayableId("ap-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAccountsPayableObservationById", () => {
    it("should find observation by id", () => {
      const result = getAccountsPayableObservationById("obs-1");
      expect(result).toEqual(mockAccountsPayableObservations[0]);
    });
  });

  describe("addAccountsPayableObservation", () => {
    it("should create new observation", () => {
      const formData = {
        accountsPayableId: "ap-2",
        observation: "New observation",
      };

      const result = addAccountsPayableObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockAccountsPayableObservations).toContain(result);
    });
  });

  describe("updateAccountsPayableObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateAccountsPayableObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockAccountsPayableObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteAccountsPayableObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockAccountsPayableObservations.length;
      const result = deleteAccountsPayableObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAccountsPayableObservations).toHaveLength(initialLength - 1);
    });
  });
});
