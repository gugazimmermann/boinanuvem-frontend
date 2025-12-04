import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import React from "react";
import {
  createFinanceEditLoader,
  createFinanceEditMeta,
  useFinanceEditRoute,
} from "../finance-edit-route-helpers";
import * as routeGuard from "~/utils/route-guard";
import * as routeHelpers from "~/utils/route-helpers";
import type { AccountsReceivableFormData } from "~/types";
import { AccountsReceivableStatus } from "~/types";

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(),
}));

vi.mock("~/utils/route-helpers", () => ({
  createFormMeta: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

describe("finance-edit-route-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createFinanceEditLoader", () => {
    it("should create loader that calls createRouteGuard", async () => {
      const mockGuard = vi.fn(() => Promise.resolve(null));
      vi.mocked(routeGuard.createRouteGuard).mockReturnValue(mockGuard);

      const loader = await createFinanceEditLoader({ request: new Request("http://localhost") });

      expect(routeGuard.createRouteGuard).toHaveBeenCalledWith(undefined, "edit");
      expect(mockGuard).toHaveBeenCalledWith({ request: expect.any(Request) });
      expect(loader).toBeNull();
    });

    it("should handle loader errors", async () => {
      const mockGuard = vi.fn(() => Promise.reject(new Error("Test error")));
      vi.mocked(routeGuard.createRouteGuard).mockReturnValue(mockGuard);

      await expect(
        createFinanceEditLoader({ request: new Request("http://localhost") })
      ).rejects.toThrow("Test error");
    });
  });

  describe("createFinanceEditMeta", () => {
    it("should create meta function that calls createFormMeta", () => {
      const mockMeta = [
        { title: "Editar Conta a Receber - Boi na Nuvem" },
        { name: "description", content: "Edit account receivable" },
      ];
      vi.mocked(routeHelpers.createFormMeta).mockReturnValue(mockMeta);

      const metaFunction = createFinanceEditMeta("Conta a Receber", "Edit account receivable");
      const result = metaFunction();

      expect(routeHelpers.createFormMeta).toHaveBeenCalledWith(
        "Editar",
        "Conta a Receber",
        "Edit account receivable"
      );
      expect(result).toEqual(mockMeta);
    });

    it("should handle different entity names and descriptions", () => {
      const mockMeta = [
        { title: "Editar Conta a Pagar - Boi na Nuvem" },
        { name: "description", content: "Edit account payable" },
      ];
      vi.mocked(routeHelpers.createFormMeta).mockReturnValue(mockMeta);

      const metaFunction = createFinanceEditMeta("Conta a Pagar", "Edit account payable");
      const result = metaFunction();

      expect(routeHelpers.createFormMeta).toHaveBeenCalledWith(
        "Editar",
        "Conta a Pagar",
        "Edit account payable"
      );
      expect(result).toEqual(mockMeta);
    });
  });

  describe("useFinanceEditRoute", () => {
    const mockGetTransactionById = vi.fn();
    const mockMapToFormData = vi.fn();
    const mockUpdateTransaction = vi.fn();

    const defaultConfig = {
      transactionType: "accounts-receivable" as const,
      getTransactionById: mockGetTransactionById,
      mapToFormData: mockMapToFormData,
      updateTransaction: mockUpdateTransaction,
      backRoute: "/dashboard/finance/accounts-receivable",
      viewRoute: (id: string) => `/dashboard/finance/accounts-receivable/${id}`,
      translationKeys: {
        title: "Edit Account Receivable",
        description: "Edit account receivable",
        save: "Save",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        dueDateLabel: "Due Date",
        propertyLabel: "Property",
      },
      successMessage: "Account receivable updated",
      errorMessage: "Failed to update",
      emptyStateTitle: "Account receivable not found",
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/dashboard/finance/accounts-receivable/123/edit"] },
        children
      );

    beforeEach(() => {
      mockNavigate.mockClear();
      mockUseParams.mockReturnValue({ transactionId: "123" });
    });

    it("should return transactionId from params", () => {
      const { result } = renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      expect(result.current.transactionId).toBe("123");
    });

    it("should call getTransactionById with transactionId", () => {
      const mockTransaction = { id: "123", amount: 1000 };
      mockGetTransactionById.mockReturnValue(mockTransaction);
      mockMapToFormData.mockReturnValue({ amount: 1000 });

      renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      expect(mockGetTransactionById).toHaveBeenCalledWith("123");
    });

    it("should map transaction to form data using useMemo", () => {
      const mockTransaction = { id: "123", amount: 1000, description: "Test" };
      mockGetTransactionById.mockReturnValue(mockTransaction);
      mockMapToFormData.mockReturnValue({ amount: 1000, description: "Test" });

      const { result } = renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      expect(mockMapToFormData).toHaveBeenCalledWith(mockTransaction);
      expect(result.current.initialData).toEqual({ amount: 1000, description: "Test" });
    });

    it("should handle undefined transaction", () => {
      mockGetTransactionById.mockReturnValue(undefined);
      mockMapToFormData.mockReturnValue(undefined);

      const { result } = renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      expect(mockMapToFormData).toHaveBeenCalledWith(undefined);
      expect(result.current.initialData).toBeUndefined();
    });

    it("should call updateTransaction when handleSubmit is called", () => {
      const mockTransaction = { id: "123", amount: 1000 };
      mockGetTransactionById.mockReturnValue(mockTransaction);
      mockMapToFormData.mockReturnValue({ amount: 1000 });

      const { result } = renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      const formData: AccountsReceivableFormData = {
        amount: 2000,
        description: "Updated",
        companyId: "company-1",
        dueDate: "2024-12-31",
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "prop-1",
      };
      result.current.handleSubmit(formData);

      expect(mockUpdateTransaction).toHaveBeenCalledWith("123", formData);
    });

    it("should not call updateTransaction when transactionId is undefined", () => {
      mockUseParams.mockReturnValue({ transactionId: undefined });

      const { result } = renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      const formData: AccountsReceivableFormData = {
        amount: 2000,
        companyId: "company-1",
        dueDate: "2024-12-31",
        description: "",
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "prop-1",
      };
      result.current.handleSubmit(formData);

      expect(mockUpdateTransaction).not.toHaveBeenCalled();
    });

    it("should navigate to view route after success with delay", async () => {
      const mockTransaction = { id: "123", amount: 1000 };
      mockGetTransactionById.mockReturnValue(mockTransaction);
      mockMapToFormData.mockReturnValue({ amount: 1000 });

      const { result } = renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      result.current.handleSuccess();

      expect(mockNavigate).not.toHaveBeenCalled();

      await vi.runAllTimersAsync();

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/finance/accounts-receivable/123");
    });

    it("should not navigate when transactionId is undefined", async () => {
      mockUseParams.mockReturnValue({ transactionId: undefined });

      const { result } = renderHook(() => useFinanceEditRoute(defaultConfig), { wrapper });

      result.current.handleSuccess();

      await vi.runAllTimersAsync();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should handle different transaction types", () => {
      const accountsPayableConfig = {
        ...defaultConfig,
        transactionType: "accounts-payable" as const,
        viewRoute: (id: string) => `/dashboard/finance/accounts-payable/${id}`,
      };

      const mockTransaction = { id: "456", amount: 2000 };
      mockGetTransactionById.mockReturnValue(mockTransaction);
      mockMapToFormData.mockReturnValue({ amount: 2000 });

      mockUseParams.mockReturnValue({ transactionId: "456" });

      const { result } = renderHook(() => useFinanceEditRoute(accountsPayableConfig), { wrapper });

      expect(result.current.transactionId).toBe("456");
      expect(mockGetTransactionById).toHaveBeenCalledWith("456");
    });
  });
});
