import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFinanceSort } from "../use-finance-sort";
import * as languageContext from "~/contexts/language-context";
import * as formattingUtils from "~/utils/formatting";
import { AccountsPayableStatus } from "~/types";

vi.mock("~/contexts/language-context");
vi.mock("~/utils/formatting");

describe("useFinanceSort", () => {
  const mockTransactions = [
    {
      id: "1",
      type: "income" as const,
      amount: 1000,
      date: "2024-01-15",
      description: "Transaction A",
      status: "completed",
      companyId: "company-1",
      propertyId: "prop-1",
      category: "other" as import("~/types").CashFlowCategory,
      paymentMethod: "pix" as import("~/types").PaymentMethod,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: "expense" as const,
      amount: 500,
      date: "2024-01-20",
      description: "Transaction B",
      status: "completed",
      companyId: "company-1",
      propertyId: "prop-1",
      category: "other" as import("~/types").CashFlowCategory,
      paymentMethod: "pix" as import("~/types").PaymentMethod,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      type: "income" as const,
      amount: 2000,
      date: "2024-01-10",
      description: "Transaction C",
      status: "completed",
      companyId: "company-1",
      propertyId: "prop-1",
      category: "other" as import("~/types").CashFlowCategory,
      paymentMethod: "pix" as import("~/types").PaymentMethod,
      createdAt: new Date().toISOString(),
    },
  ] as import("~/types").CashFlow[];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: { code: "en", name: "English", flag: "/flags/us.svg" },
    });
    vi.mocked(formattingUtils.getLocaleForDateTime).mockReturnValue("en-US");
  });

  it("should return unsorted data when no sort column", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: null, direction: "asc" })
    );

    expect(result.current).toEqual(mockTransactions);
  });

  it("should sort by amount ascending", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: "amount", direction: "asc" })
    );

    expect(result.current[0]?.amount).toBe(500);
    expect(result.current[1]?.amount).toBe(1000);
    expect(result.current[2]?.amount).toBe(2000);
  });

  it("should sort by amount descending", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: "amount", direction: "desc" })
    );

    expect(result.current[0]?.amount).toBe(2000);
    expect(result.current[1]?.amount).toBe(1000);
    expect(result.current[2]?.amount).toBe(500);
  });

  it("should sort by date ascending", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: "date", direction: "asc" })
    );

    expect(result.current[0]?.date).toBe("2024-01-10");
    expect(result.current[1]?.date).toBe("2024-01-15");
    expect(result.current[2]?.date).toBe("2024-01-20");
  });

  it("should sort by description ascending", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: "description", direction: "asc" })
    );

    expect(result.current[0]?.description).toBe("Transaction A");
    expect(result.current[1]?.description).toBe("Transaction B");
    expect(result.current[2]?.description).toBe("Transaction C");
  });

  it("should handle null values in sort", () => {
    const transactionsWithNull = [
      { ...mockTransactions[0], amount: null as unknown as number },
      mockTransactions[1],
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithNull, { column: "amount", direction: "asc" })
    );

    expect(result.current.length).toBe(2);
  });

  it("should use correct locale for sorting", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: { code: "pt", name: "Português", flag: "/flags/br.svg" },
    });
    vi.mocked(formattingUtils.getLocaleForDateTime).mockReturnValue("pt-BR");

    renderHook(() => useFinanceSort(mockTransactions, { column: "description", direction: "asc" }));

    expect(formattingUtils.getLocaleForDateTime).toHaveBeenCalledWith("pt");
  });

  it("should handle empty array", () => {
    const { result } = renderHook(() => useFinanceSort([], { column: "amount", direction: "asc" }));

    expect(result.current).toEqual([]);
  });

  it("should handle undefined sort direction", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: "amount", direction: null as unknown as "asc" })
    );

    expect(result.current).toEqual(mockTransactions);
  });

  it("should not mutate original array", () => {
    const original = [...mockTransactions];
    renderHook(() => useFinanceSort(mockTransactions, { column: "amount", direction: "asc" }));

    expect(mockTransactions).toEqual(original);
  });

  it("should sort by date descending", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: "date", direction: "desc" })
    );

    expect(result.current[0]?.date).toBe("2024-01-20");
    expect(result.current[1]?.date).toBe("2024-01-15");
    expect(result.current[2]?.date).toBe("2024-01-10");
  });

  it("should sort by description descending", () => {
    const { result } = renderHook(() =>
      useFinanceSort(mockTransactions, { column: "description", direction: "desc" })
    );

    expect(result.current[0]?.description).toBe("Transaction C");
    expect(result.current[1]?.description).toBe("Transaction B");
    expect(result.current[2]?.description).toBe("Transaction A");
  });

  it("should handle sorting with null values", () => {
    const transactionsWithNull = [
      { ...mockTransactions[0], amount: null as unknown as number },
      mockTransactions[1],
      { ...mockTransactions[2], amount: null as unknown as number },
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithNull, { column: "amount", direction: "asc" })
    );

    expect(result.current.length).toBe(3);
  });

  it("should handle sorting with undefined values", () => {
    const transactionsWithUndefined = [
      { ...mockTransactions[0], amount: undefined as unknown as number },
      mockTransactions[1],
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithUndefined, { column: "amount", direction: "asc" })
    );

    expect(result.current.length).toBe(2);
  });

  it("should handle sorting with both null values", () => {
    const transactionsWithNull = [
      { ...mockTransactions[0], amount: null as unknown as number },
      { ...mockTransactions[1], amount: null as unknown as number },
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithNull, { column: "amount", direction: "asc" })
    );

    expect(result.current.length).toBe(2);
  });

  it("should handle sorting by property field", () => {
    const transactionsWithProperty = [
      { ...mockTransactions[0], propertyId: "prop-2" },
      { ...mockTransactions[1], propertyId: "prop-1" },
      { ...mockTransactions[2], propertyId: "prop-3" },
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithProperty, { column: "propertyId", direction: "asc" })
    );

    expect(result.current[0]?.propertyId).toBe("prop-1");
    expect(result.current[1]?.propertyId).toBe("prop-2");
    expect(result.current[2]?.propertyId).toBe("prop-3");
  });

  it("should handle sorting by category field", () => {
    const transactionsWithCategory = [
      { ...mockTransactions[0], category: "feed" as import("~/types").CashFlowCategory },
      { ...mockTransactions[1], category: "salary" as import("~/types").CashFlowCategory },
      { ...mockTransactions[2], category: "other" as import("~/types").CashFlowCategory },
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithCategory, { column: "category", direction: "asc" })
    );

    expect(result.current.length).toBe(3);
  });

  it("should handle sorting by paymentMethod field", () => {
    const transactionsWithPaymentMethod = [
      { ...mockTransactions[0], paymentMethod: "pix" as import("~/types").PaymentMethod },
      { ...mockTransactions[1], paymentMethod: "cash" as import("~/types").PaymentMethod },
      { ...mockTransactions[2], paymentMethod: "transfer" as import("~/types").PaymentMethod },
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithPaymentMethod, { column: "paymentMethod", direction: "asc" })
    );

    expect(result.current.length).toBe(3);
  });

  it("should handle accounts payable sorting by status", () => {
    const payableTransactions = [
      {
        id: "ap-1",
        amount: 500,
        dueDate: "2024-01-15",
        status: AccountsPayableStatus.PAID,
        companyId: "company-1",
        propertyId: "prop-1",
        description: "Payable 1",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ap-2",
        amount: 300,
        dueDate: "2024-01-20",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        propertyId: "prop-1",
        description: "Payable 2",
        createdAt: new Date().toISOString(),
      },
    ] as import("~/types").AccountsPayable[];

    const { result } = renderHook(() =>
      useFinanceSort(payableTransactions, { column: "status", direction: "asc" })
    );

    expect(result.current.length).toBe(2);
  });

  it("should handle accounts receivable sorting by status", () => {
    const receivableTransactions = [
      {
        id: "ar-1",
        amount: 500,
        dueDate: "2024-01-15",
        status: "paid" as const,
        companyId: "company-1",
        propertyId: "prop-1",
        description: "Receivable 1",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ar-2",
        amount: 300,
        dueDate: "2024-01-20",
        status: "unpaid" as const,
        companyId: "company-1",
        propertyId: "prop-1",
        description: "Receivable 2",
        createdAt: new Date().toISOString(),
      },
    ] as import("~/types").AccountsReceivable[];

    const { result } = renderHook(() =>
      useFinanceSort(receivableTransactions, { column: "status", direction: "asc" })
    );

    expect(result.current.length).toBe(2);
  });

  it("should handle sorting by dueDate for accounts payable", () => {
    const payableTransactions = [
      {
        id: "ap-1",
        amount: 500,
        dueDate: "2024-01-20",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        propertyId: "prop-1",
        description: "Payable 1",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ap-2",
        amount: 300,
        dueDate: "2024-01-15",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        propertyId: "prop-1",
        description: "Payable 2",
        createdAt: new Date().toISOString(),
      },
    ] as import("~/types").AccountsPayable[];

    const { result } = renderHook(() =>
      useFinanceSort(payableTransactions, { column: "dueDate", direction: "asc" })
    );

    expect(result.current[0]?.dueDate).toBe("2024-01-15");
    expect(result.current[1]?.dueDate).toBe("2024-01-20");
  });

  it("should use correct locale for string comparison", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: { code: "pt", name: "Português", flag: "/flags/br.svg" },
    });
    vi.mocked(formattingUtils.getLocaleForDateTime).mockReturnValue("pt-BR");

    renderHook(() => useFinanceSort(mockTransactions, { column: "description", direction: "asc" }));

    expect(formattingUtils.getLocaleForDateTime).toHaveBeenCalledWith("pt");
  });

  it("should handle mixed number and string values", () => {
    const mixedTransactions = [
      { ...mockTransactions[0], amount: "1000" as unknown as number },
      mockTransactions[1],
    ];

    const { result } = renderHook(() =>
      useFinanceSort(mixedTransactions, { column: "amount", direction: "asc" })
    );

    expect(result.current.length).toBe(2);
  });

  it("should handle sorting with empty string values", () => {
    const transactionsWithEmpty = [
      { ...mockTransactions[0], description: "" },
      mockTransactions[1],
    ];

    const { result } = renderHook(() =>
      useFinanceSort(transactionsWithEmpty, { column: "description", direction: "asc" })
    );

    expect(result.current.length).toBe(2);
  });
});
