import { parseISO } from "date-fns";
import type { AccountsPayable, AccountsReceivable, CashFlow } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

/**
 * Calculate remaining amount for accounts payable or receivable
 */
export function calculateRemainingAmount(amount: number, paidAmount?: number): number {
  return paidAmount ? amount - paidAmount : amount;
}

/**
 * Get status variant for badge display
 */
export function getStatusVariant(status: string): "success" | "danger" | "warning" | "default" {
  switch (status) {
    case AccountsPayableStatus.PAID:
    case AccountsReceivableStatus.PAID:
    case "completed":
      return "success";
    case AccountsPayableStatus.OVERDUE:
    case AccountsReceivableStatus.OVERDUE:
      return "danger";
    case AccountsPayableStatus.PARTIAL:
    case AccountsReceivableStatus.PARTIAL:
      return "warning";
    default:
      return "default";
  }
}

/**
 * Check if a transaction is overdue
 */
export function isOverdue(dueDate: string, status: string): boolean {
  const due = parseISO(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isUnpaidOrOverdue =
    status === AccountsPayableStatus.UNPAID ||
    status === AccountsPayableStatus.OVERDUE ||
    status === AccountsReceivableStatus.UNPAID ||
    status === AccountsReceivableStatus.OVERDUE;

  return isUnpaidOrOverdue && due < today;
}

/**
 * Calculate totals for cash flow transactions
 */
export function calculateCashFlowTotals(transactions: CashFlow[]): {
  income: number;
  expenses: number;
  net: number;
} {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expenses,
    net: income - expenses,
  };
}

/**
 * Calculate total for accounts payable or receivable
 */
export function calculateAccountsTotal<T extends AccountsPayable | AccountsReceivable>(
  transactions: T[]
): number {
  return transactions.reduce((sum, t) => {
    const remaining = calculateRemainingAmount(t.amount, t.paidAmount);
    return sum + remaining;
  }, 0);
}

/**
 * Calculate overdue total for accounts payable or receivable
 */
export function calculateOverdueTotal<T extends AccountsPayable | AccountsReceivable>(
  transactions: T[]
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return transactions.reduce((sum, t) => {
    if (isOverdue(t.dueDate, t.status)) {
      const remaining = calculateRemainingAmount(t.amount, t.paidAmount);
      return sum + remaining;
    }
    return sum;
  }, 0);
}

/**
 * Filter transactions by date range
 */
export function filterByDateRange<T extends { date?: string; dueDate?: string }>(
  transactions: T[],
  startDate?: Date,
  endDate?: Date
): T[] {
  if (!startDate && !endDate) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const dateStr = transaction.date || transaction.dueDate;
    if (!dateStr) return false;

    const transactionDate = parseISO(dateStr);
    transactionDate.setHours(0, 0, 0, 0);

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (transactionDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (transactionDate > end) return false;
    }

    return true;
  });
}

/**
 * Format finance amount with type indicator
 */
export function formatFinanceAmount(
  amount: number,
  type?: "income" | "expense",
  locale: string = "pt-BR"
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(amount);

  if (type === "income") {
    return `+ ${formatted}`;
  } else if (type === "expense") {
    return `- ${formatted}`;
  }
  return formatted;
}

/**
 * Get unpaid transactions (excluding paid)
 */
export function getUnpaidTransactions<T extends AccountsPayable | AccountsReceivable>(
  transactions: T[]
): T[] {
  return transactions.filter(
    (t) =>
      t.status === AccountsPayableStatus.UNPAID ||
      t.status === AccountsPayableStatus.OVERDUE ||
      t.status === AccountsPayableStatus.PARTIAL ||
      t.status === AccountsReceivableStatus.UNPAID ||
      t.status === AccountsReceivableStatus.OVERDUE ||
      t.status === AccountsReceivableStatus.PARTIAL
  );
}

/**
 * Get upcoming transactions within a date range
 */
export function getUpcomingTransactions<T extends AccountsPayable | AccountsReceivable>(
  transactions: T[],
  days: number = 30
): T[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  futureDate.setHours(23, 59, 59, 999);

  return transactions.filter((transaction) => {
    const dueDate = parseISO(transaction.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const isUnpaidOrPartial =
      transaction.status === AccountsPayableStatus.UNPAID ||
      transaction.status === AccountsPayableStatus.PARTIAL ||
      transaction.status === AccountsReceivableStatus.UNPAID ||
      transaction.status === AccountsReceivableStatus.PARTIAL;

    return isUnpaidOrPartial && dueDate >= today && dueDate <= futureDate;
  });
}
