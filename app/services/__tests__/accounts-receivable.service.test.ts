import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import {
  getAccountsReceivableById,
  getAccountsReceivableByCompanyId,
  getAccountsReceivableByBuyerId,
  getAccountsReceivableByPropertyId,
  addAccountsReceivable,
  updateAccountsReceivable,
  deleteAccountsReceivable,
} from "../accounts-receivable.service";
import { CashFlowCategory, PaymentMethod, AccountsReceivableStatus } from "~/types";
import type { AccountsReceivableFormData } from "~/types";

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

const mockAccountsReceivable = [
  {
    id: "ar-1",
    companyId: "company-1",
    buyerId: "buyer-1",
    propertyId: "property-1",
    amount: 1000,
    dueDate: "2024-01-01",
    description: "Test AR 1",
    category: CashFlowCategory.CATTLE_SALES,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsReceivableStatus.UNPAID,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ar-2",
    companyId: "company-1",
    propertyId: "property-2",
    amount: 500,
    dueDate: "2024-01-02",
    description: "Test AR 2",
    category: CashFlowCategory.CATTLE_SALES,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsReceivableStatus.UNPAID,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

describe("accounts-receivable.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountsReceivableById", () => {
    it("should find account receivable by id", async () => {
      mockGet.mockResolvedValue(mockAccountsReceivable[0]);

      const result = await getAccountsReceivableById("ar-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-receivable/ar-1");
      expect(result).toEqual(mockAccountsReceivable[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getAccountsReceivableById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getAccountsReceivableById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAccountsReceivableById("ar-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsReceivableByCompanyId", () => {
    it("should find accounts receivable by company id", async () => {
      mockGet.mockResolvedValue(mockAccountsReceivable);

      const result = await getAccountsReceivableByCompanyId("company-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-receivable");
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockAccountsReceivable);
    });
  });

  describe("getAccountsReceivableByBuyerId", () => {
    it("should find accounts receivable by buyer id", async () => {
      mockGet.mockResolvedValue(mockAccountsReceivable);

      const result = await getAccountsReceivableByBuyerId("buyer-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-receivable");
      expect(result).toHaveLength(1);
      expect(result[0].buyerId).toBe("buyer-1");
    });
  });

  describe("getAccountsReceivableByPropertyId", () => {
    it("should find accounts receivable by property id", async () => {
      mockGet.mockResolvedValue(mockAccountsReceivable);

      const result = await getAccountsReceivableByPropertyId("property-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-receivable");
      expect(result).toHaveLength(1);
      expect(result[0].propertyId).toBe("property-1");
    });
  });

  describe("addAccountsReceivable", () => {
    it("should create new account receivable", async () => {
      const formData: AccountsReceivableFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 2000,
        dueDate: "2024-01-01",
        description: "Test",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "property-1",
      };

      const createdAccount = {
        id: "ar-3",
        ...formData,
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(createdAccount);

      const result = await addAccountsReceivable(formData);

      expect(mockPost).toHaveBeenCalledWith("/accounts-receivable", {
        amount: formData.amount,
        dueDate: formData.dueDate,
        description: formData.description,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        bankAccountId: formData.bankAccountId,
        propertyId: formData.propertyId,
        buyerId: formData.buyerId,
        paidDate: formData.paidDate,
        paidAmount: formData.paidAmount,
        referenceNumber: formData.referenceNumber,
      });
      expect(result.id).toBeDefined();
      expect(result.amount).toBe(2000);
    });
  });

  describe("updateAccountsReceivable", () => {
    it("should update account receivable", async () => {
      const updateData = { amount: 1500 };
      const updatedAccount = {
        ...mockAccountsReceivable[0],
        amount: 1500,
      };

      mockPut.mockResolvedValue(updatedAccount);

      const result = await updateAccountsReceivable("ar-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/accounts-receivable/ar-1", updateData);
      expect(result).toEqual(updatedAccount);
      expect(result.amount).toBe(1500);
    });
  });

  describe("deleteAccountsReceivable", () => {
    it("should delete account receivable", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteAccountsReceivable("ar-1");

      expect(mockDelete).toHaveBeenCalledWith("/accounts-receivable/ar-1");
    });
  });
});
