import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import {
  getAccountsPayableById,
  getAccountsPayableByCompanyId,
  getAccountsPayableBySupplierId,
  getAccountsPayableByPropertyId,
  getAccountsPayableByEmployeeId,
  getAccountsPayableByServiceProviderId,
  addAccountsPayable,
  updateAccountsPayable,
  deleteAccountsPayable,
} from "../accounts-payable.service";
import { CashFlowCategory, PaymentMethod, AccountsPayableStatus } from "~/types";
import type { AccountsPayableFormData } from "~/types";

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

const mockAccountsPayable = [
  {
    id: "ap-1",
    companyId: "company-1",
    supplierId: "supplier-1",
    propertyId: "property-1",
    employeeId: "employee-1",
    serviceProviderId: "provider-1",
    amount: 1000,
    dueDate: "2024-01-01",
    description: "Test AP 1",
    category: CashFlowCategory.ANIMAL_ACQUISITION,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsPayableStatus.UNPAID,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ap-2",
    companyId: "company-1",
    propertyId: "property-2",
    amount: 500,
    dueDate: "2024-01-02",
    description: "Test AP 2",
    category: CashFlowCategory.ANIMAL_ACQUISITION,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsPayableStatus.UNPAID,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

describe("accounts-payable.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountsPayableById", () => {
    it("should find account payable by id", async () => {
      mockGet.mockResolvedValue(mockAccountsPayable[0]);

      const result = await getAccountsPayableById("ap-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-payable/ap-1");
      expect(result).toEqual(mockAccountsPayable[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getAccountsPayableById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getAccountsPayableById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAccountsPayableById("ap-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsPayableByCompanyId", () => {
    it("should find accounts payable by company id", async () => {
      mockGet.mockResolvedValue(mockAccountsPayable);

      const result = await getAccountsPayableByCompanyId("company-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-payable");
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockAccountsPayable);
    });
  });

  describe("getAccountsPayableBySupplierId", () => {
    it("should find accounts payable by supplier id", async () => {
      mockGet.mockResolvedValue(mockAccountsPayable);

      const result = await getAccountsPayableBySupplierId("supplier-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-payable");
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe("supplier-1");
    });
  });

  describe("getAccountsPayableByPropertyId", () => {
    it("should find accounts payable by property id", async () => {
      mockGet.mockResolvedValue(mockAccountsPayable);

      const result = await getAccountsPayableByPropertyId("property-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-payable");
      expect(result).toHaveLength(1);
      expect(result[0].propertyId).toBe("property-1");
    });
  });

  describe("getAccountsPayableByEmployeeId", () => {
    it("should find accounts payable by employee id", async () => {
      mockGet.mockResolvedValue(mockAccountsPayable);

      const result = await getAccountsPayableByEmployeeId("employee-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-payable");
      expect(result).toHaveLength(1);
      expect(result[0].employeeId).toBe("employee-1");
    });
  });

  describe("getAccountsPayableByServiceProviderId", () => {
    it("should find accounts payable by service provider id", async () => {
      mockGet.mockResolvedValue(mockAccountsPayable);

      const result = await getAccountsPayableByServiceProviderId("provider-1");

      expect(mockGet).toHaveBeenCalledWith("/accounts-payable");
      expect(result).toHaveLength(1);
      expect(result[0].serviceProviderId).toBe("provider-1");
    });
  });

  describe("addAccountsPayable", () => {
    it("should create new account payable", async () => {
      const formData: AccountsPayableFormData = {
        companyId: "company-1",
        amount: 2000,
        dueDate: "2024-01-01",
        description: "Test",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        propertyId: "prop-1",
        bankAccountId: undefined,
        supplierId: undefined,
        employeeId: undefined,
        serviceProviderId: undefined,
        paidDate: undefined,
        paidAmount: undefined,
        referenceNumber: undefined,
      };

      const createdAccount = {
        id: "ap-3",
        ...formData,
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(createdAccount);

      const result = await addAccountsPayable(formData);

      expect(mockPost).toHaveBeenCalledWith("/accounts-payable", {
        amount: formData.amount,
        dueDate: formData.dueDate,
        description: formData.description,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        bankAccountId: formData.bankAccountId,
        propertyId: formData.propertyId,
        supplierId: formData.supplierId,
        employeeId: formData.employeeId,
        serviceProviderId: formData.serviceProviderId,
        paidDate: formData.paidDate,
        paidAmount: formData.paidAmount,
        referenceNumber: formData.referenceNumber,
      });
      expect(result.id).toBeDefined();
      expect(result.amount).toBe(2000);
    });
  });

  describe("updateAccountsPayable", () => {
    it("should update account payable", async () => {
      const updateData = { amount: 1500 };
      const updatedAccount = {
        ...mockAccountsPayable[0],
        amount: 1500,
      };

      mockPut.mockResolvedValue(updatedAccount);

      const result = await updateAccountsPayable("ap-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/accounts-payable/ap-1", updateData);
      expect(result).toEqual(updatedAccount);
      expect(result.amount).toBe(1500);
    });
  });

  describe("deleteAccountsPayable", () => {
    it("should delete account payable", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteAccountsPayable("ap-1");

      expect(mockDelete).toHaveBeenCalledWith("/accounts-payable/ap-1");
    });
  });
});
