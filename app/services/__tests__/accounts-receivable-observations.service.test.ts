import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsReceivableObservationsByAccountsReceivableId,
  getAccountsReceivableObservationById,
  addAccountsReceivableObservation,
  updateAccountsReceivableObservation,
  deleteAccountsReceivableObservation,
} from "../accounts-receivable-observations.service";

vi.mock("~/mocks/accounts-receivable-observations", () => ({
  mockAccountsReceivableObservations: [
    {
      id: "obs-1",
      accountsReceivableId: "ar-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockAccountsReceivableObservations } from "~/mocks/accounts-receivable-observations";

describe("accounts-receivable-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountsReceivableObservationsByAccountsReceivableId", () => {
    it("should find observations by accounts receivable id", () => {
      const result = getAccountsReceivableObservationsByAccountsReceivableId("ar-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAccountsReceivableObservationById", () => {
    it("should find observation by id", () => {
      const result = getAccountsReceivableObservationById("obs-1");
      expect(result).toEqual(mockAccountsReceivableObservations[0]);
    });
  });

  describe("addAccountsReceivableObservation", () => {
    it("should create new observation", () => {
      const formData = {
        accountsReceivableId: "ar-2",
        observation: "New observation",
      };

      const result = addAccountsReceivableObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockAccountsReceivableObservations).toContain(result);
    });
  });

  describe("updateAccountsReceivableObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateAccountsReceivableObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockAccountsReceivableObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteAccountsReceivableObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockAccountsReceivableObservations.length;
      const result = deleteAccountsReceivableObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAccountsReceivableObservations).toHaveLength(initialLength - 1);
    });
  });
});
