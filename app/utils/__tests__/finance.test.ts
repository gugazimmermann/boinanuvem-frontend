import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateRemainingAmount,
  getStatusVariant,
  isOverdue,
  calculateCashFlowTotals,
  calculateAccountsTotal,
  calculateOverdueTotal,
  filterByDateRange,
  formatFinanceAmount,
  getUnpaidTransactions,
  getUpcomingTransactions,
} from "../finance";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import {
  AccountsPayableStatus,
  AccountsReceivableStatus,
  CashFlowCategory,
  PaymentMethod,
} from "~/types";

describe("calculateRemainingAmount", () => {
  it("should return amount when paidAmount is undefined", () => {
    expect(calculateRemainingAmount(1000)).toBe(1000);
    expect(calculateRemainingAmount(500)).toBe(500);
  });

  it("should calculate remaining amount", () => {
    expect(calculateRemainingAmount(1000, 300)).toBe(700);
    expect(calculateRemainingAmount(1000, 1000)).toBe(0);
  });

  it("should handle zero amounts", () => {
    expect(calculateRemainingAmount(0, 0)).toBe(0);
    expect(calculateRemainingAmount(0)).toBe(0);
  });

  it("should handle negative remaining (overpaid)", () => {
    expect(calculateRemainingAmount(1000, 1500)).toBe(-500);
  });
});

describe("getStatusVariant", () => {
  it("should return success for paid status", () => {
    expect(getStatusVariant(AccountsPayableStatus.PAID)).toBe("success");
    expect(getStatusVariant(AccountsReceivableStatus.PAID)).toBe("success");
    expect(getStatusVariant("completed")).toBe("success");
  });

  it("should return danger for overdue status", () => {
    expect(getStatusVariant(AccountsPayableStatus.OVERDUE)).toBe("danger");
    expect(getStatusVariant(AccountsReceivableStatus.OVERDUE)).toBe("danger");
  });

  it("should return warning for partial status", () => {
    expect(getStatusVariant(AccountsPayableStatus.PARTIAL)).toBe("warning");
    expect(getStatusVariant(AccountsReceivableStatus.PARTIAL)).toBe("warning");
  });

  it("should return default for unknown status", () => {
    expect(getStatusVariant("unknown")).toBe("default");
    expect(getStatusVariant(AccountsPayableStatus.UNPAID)).toBe("default");
  });
});

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true for overdue unpaid transaction", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const dueDate = "2024-01-10";
    expect(isOverdue(dueDate, AccountsPayableStatus.UNPAID)).toBe(true);
    expect(isOverdue(dueDate, AccountsPayableStatus.OVERDUE)).toBe(true);
  });

  it("should return false for future due date", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const dueDate = "2024-01-20";
    expect(isOverdue(dueDate, AccountsPayableStatus.UNPAID)).toBe(false);
  });

  it("should return false for paid transactions", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const dueDate = "2024-01-10";
    expect(isOverdue(dueDate, AccountsPayableStatus.PAID)).toBe(false);
  });

  it("should return false for today's due date", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const dueDate = "2024-01-15";
    expect(isOverdue(dueDate, AccountsPayableStatus.UNPAID)).toBe(false);
  });

  it("should handle AccountsReceivableStatus", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const dueDate = "2024-01-10";
    expect(isOverdue(dueDate, AccountsReceivableStatus.UNPAID)).toBe(true);
    expect(isOverdue(dueDate, AccountsReceivableStatus.OVERDUE)).toBe(true);
  });
});

describe("calculateCashFlowTotals", () => {
  const transactions: CashFlow[] = [
    {
      id: "1",
      type: "income",
      amount: 1000,
      date: "2024-01-01",
      companyId: "company-1",
      description: "Test income",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      type: "expense",
      amount: 300,
      date: "2024-01-02",
      companyId: "company-1",
      description: "Test expense",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "3",
      type: "income",
      amount: 500,
      date: "2024-01-03",
      companyId: "company-1",
      description: "Test income",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-01-03T00:00:00Z",
    },
    {
      id: "4",
      type: "expense",
      amount: 200,
      date: "2024-01-04",
      companyId: "company-1",
      description: "Test expense",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-01-04T00:00:00Z",
    },
  ];

  it("should calculate totals correctly", () => {
    const result = calculateCashFlowTotals(transactions);
    expect(result.income).toBe(1500);
    expect(result.expenses).toBe(500);
    expect(result.net).toBe(1000);
  });

  it("should handle empty array", () => {
    const result = calculateCashFlowTotals([]);
    expect(result.income).toBe(0);
    expect(result.expenses).toBe(0);
    expect(result.net).toBe(0);
  });

  it("should handle only income", () => {
    const onlyIncome: CashFlow[] = [
      {
        id: "1",
        type: "income",
        amount: 1000,
        date: "2024-01-01",
        companyId: "company-1",
        description: "Test income",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    const result = calculateCashFlowTotals(onlyIncome);
    expect(result.income).toBe(1000);
    expect(result.expenses).toBe(0);
    expect(result.net).toBe(1000);
  });

  it("should handle only expenses", () => {
    const onlyExpenses: CashFlow[] = [
      {
        id: "1",
        type: "expense",
        amount: 500,
        date: "2024-01-01",
        companyId: "company-1",
        description: "Test expense",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    const result = calculateCashFlowTotals(onlyExpenses);
    expect(result.income).toBe(0);
    expect(result.expenses).toBe(500);
    expect(result.net).toBe(-500);
  });
});

describe("calculateAccountsTotal", () => {
  const accountsPayable: AccountsPayable[] = [
    {
      id: "1",
      amount: 1000,
      paidAmount: 300,
      dueDate: "2024-01-01",
      status: AccountsPayableStatus.PARTIAL,
      companyId: "company-1",
      description: "Test payable",
      propertyId: "property-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      amount: 500,
      dueDate: "2024-01-02",
      status: AccountsPayableStatus.UNPAID,
      companyId: "company-1",
      description: "Test payable",
      propertyId: "property-1",
      createdAt: "2024-01-02T00:00:00Z",
    },
  ];

  it("should calculate total remaining amounts", () => {
    const result = calculateAccountsTotal(accountsPayable);
    expect(result).toBe(1200); // 700 + 500
  });

  it("should handle empty array", () => {
    expect(calculateAccountsTotal([])).toBe(0);
  });

  it("should handle fully paid accounts", () => {
    const paid: AccountsPayable[] = [
      {
        id: "1",
        amount: 1000,
        paidAmount: 1000,
        dueDate: "2024-01-01",
        status: AccountsPayableStatus.PAID,
        companyId: "company-1",
        description: "Test payable",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    expect(calculateAccountsTotal(paid)).toBe(0);
  });
});

describe("calculateOverdueTotal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate total of overdue transactions", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const transactions: AccountsPayable[] = [
      {
        id: "1",
        amount: 1000,
        paidAmount: 300,
        dueDate: "2024-01-10",
        status: AccountsPayableStatus.OVERDUE,
        companyId: "company-1",
        description: "Test payable",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        amount: 500,
        dueDate: "2024-01-20",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        description: "Test payable",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    const result = calculateOverdueTotal(transactions);
    expect(result).toBe(700); // Only first transaction is overdue
  });

  it("should handle empty array", () => {
    expect(calculateOverdueTotal([])).toBe(0);
  });
});

describe("filterByDateRange", () => {
  const transactions = [
    { id: "1", date: "2024-01-05" },
    { id: "2", date: "2024-01-15" },
    { id: "3", date: "2024-01-25" },
    { id: "4", dueDate: "2024-02-05" },
  ];

  it("should return all transactions when no date range", () => {
    const result = filterByDateRange(transactions);
    expect(result).toEqual(transactions);
  });

  it("should filter by start date", () => {
    const startDate = new Date("2024-01-10");
    const result = filterByDateRange(transactions, startDate);
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((t) => {
        const dateStr =
          (t as { date?: string; dueDate?: string }).date ||
          (t as { date?: string; dueDate?: string }).dueDate;
        return dateStr && new Date(dateStr) >= startDate;
      })
    ).toBe(true);
  });

  it("should filter by end date", () => {
    const endDate = new Date("2024-01-20");
    const result = filterByDateRange(transactions, undefined, endDate);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should filter by both start and end date", () => {
    const startDate = new Date("2024-01-10");
    const endDate = new Date("2024-01-20");
    const result = filterByDateRange(transactions, startDate, endDate);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should exclude transactions without date", () => {
    const transactionsWithoutDate: Array<{ id: string; date?: string; dueDate?: string }> = [
      { id: "1", date: undefined, dueDate: undefined },
    ];
    const startDate = new Date("2024-01-10");
    const result = filterByDateRange(transactionsWithoutDate, startDate);
    expect(result).toEqual([]);
  });
});

describe("formatFinanceAmount", () => {
  it("should format amount with income prefix", () => {
    const result = formatFinanceAmount(1000, "income");
    expect(result).toContain("+");
    expect(result).toContain("R$");
  });

  it("should format amount with expense prefix", () => {
    const result = formatFinanceAmount(1000, "expense");
    expect(result).toContain("-");
    expect(result).toContain("R$");
  });

  it("should format amount without prefix when type not specified", () => {
    const result = formatFinanceAmount(1000);
    expect(result).not.toContain("+");
    expect(result).not.toContain("-");
    expect(result).toContain("R$");
  });

  it("should use custom locale", () => {
    const result = formatFinanceAmount(1000, undefined, "en-US");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });
});

describe("getUnpaidTransactions", () => {
  const transactions: AccountsPayable[] = [
    {
      id: "1",
      amount: 1000,
      dueDate: "2024-01-01",
      status: AccountsPayableStatus.PAID,
      companyId: "company-1",
      description: "Test payable",
      propertyId: "property-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      amount: 500,
      dueDate: "2024-01-02",
      status: AccountsPayableStatus.UNPAID,
      companyId: "company-1",
      description: "Test payable",
      propertyId: "property-1",
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "3",
      amount: 300,
      dueDate: "2024-01-03",
      status: AccountsPayableStatus.OVERDUE,
      companyId: "company-1",
      description: "Test payable",
      propertyId: "property-1",
      createdAt: "2024-01-03T00:00:00Z",
    },
    {
      id: "4",
      amount: 200,
      dueDate: "2024-01-04",
      status: AccountsPayableStatus.PARTIAL,
      companyId: "company-1",
      description: "Test payable",
      propertyId: "property-1",
      createdAt: "2024-01-04T00:00:00Z",
    },
  ];

  it("should return only unpaid transactions", () => {
    const result = getUnpaidTransactions(transactions);
    expect(result).toHaveLength(3);
    expect(
      result.every(
        (t) =>
          t.status === AccountsPayableStatus.UNPAID ||
          t.status === AccountsPayableStatus.OVERDUE ||
          t.status === AccountsPayableStatus.PARTIAL
      )
    ).toBe(true);
  });

  it("should handle AccountsReceivable", () => {
    const arTransactions: AccountsReceivable[] = [
      {
        id: "1",
        amount: 1000,
        dueDate: "2024-01-01",
        status: AccountsReceivableStatus.PAID,
        companyId: "company-1",
        description: "Test receivable",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        amount: 500,
        dueDate: "2024-01-02",
        status: AccountsReceivableStatus.UNPAID,
        companyId: "company-1",
        description: "Test receivable",
        propertyId: "property-1",
        createdAt: "2024-01-02T00:00:00Z",
      },
    ];
    const result = getUnpaidTransactions(arTransactions);
    expect(result).toHaveLength(1);
  });
});

describe("getUpcomingTransactions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return transactions due within specified days", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const transactions: AccountsPayable[] = [
      {
        id: "1",
        amount: 1000,
        dueDate: "2024-01-20",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        description: "Test payable",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        amount: 500,
        dueDate: "2024-02-20",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        description: "Test payable",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    const result = getUpcomingTransactions(transactions, 30);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should use default 30 days", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const transactions: AccountsPayable[] = [
      {
        id: "1",
        amount: 1000,
        dueDate: "2024-01-20",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        description: "Test payable",
        propertyId: "property-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    const result1 = getUpcomingTransactions(transactions);
    const result2 = getUpcomingTransactions(transactions, 30);
    expect(result1.length).toBe(result2.length);
  });

  it("should only include unpaid or partial transactions", () => {
    const today = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(today);

    const transactions: AccountsPayable[] = [
      {
        id: "1",
        amount: 1000,
        dueDate: "2024-01-20",
        status: AccountsPayableStatus.PAID,
        companyId: "company-1",
        description: "Test payable 1",
        propertyId: "prop-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        amount: 500,
        dueDate: "2024-01-20",
        status: AccountsPayableStatus.UNPAID,
        companyId: "company-1",
        description: "Test payable 2",
        propertyId: "prop-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    const result = getUpcomingTransactions(transactions);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});
