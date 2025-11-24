import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import { parseISO } from "date-fns";

/**
 * Get transactions by status
 */
export function getTransactionsByStatus<T extends AccountsPayable | AccountsReceivable>(
  transactions: T[],
  status: string
): T[] {
  if (status === "all") return transactions;
  return transactions.filter((t) => t.status === status);
}

/**
 * Get transactions by type (for cash flow)
 */
export function getCashFlowByType(
  transactions: CashFlow[],
  type: "all" | "income" | "expense"
): CashFlow[] {
  if (type === "all") return transactions;
  return transactions.filter((t) => t.type === type);
}

/**
 * Get overdue transactions
 */
export function getOverdueTransactions<T extends AccountsPayable | AccountsReceivable>(
  transactions: T[]
): T[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return transactions.filter((transaction) => {
    const dueDate = parseISO(transaction.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const isUnpaidOrOverdue =
      transaction.status === AccountsPayableStatus.UNPAID ||
      transaction.status === AccountsPayableStatus.OVERDUE ||
      transaction.status === AccountsReceivableStatus.UNPAID ||
      transaction.status === AccountsReceivableStatus.OVERDUE;

    return isUnpaidOrOverdue && dueDate < today;
  });
}

/**
 * Get upcoming transactions within a date range
 */
export function getUpcomingTransactionsByDays<T extends AccountsPayable | AccountsReceivable>(
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

/**
 * Calculate status based on due date and payment
 */
export function calculateTransactionStatus(
  dueDate: string,
  paidAmount?: number,
  totalAmount: number = 0
): AccountsPayableStatus | AccountsReceivableStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(dueDate);
  due.setHours(0, 0, 0, 0);

  if (paidAmount === undefined || paidAmount === 0) {
    return due < today ? AccountsPayableStatus.OVERDUE : AccountsPayableStatus.UNPAID;
  }

  if (paidAmount >= totalAmount) {
    return AccountsPayableStatus.PAID;
  }

  return AccountsPayableStatus.PARTIAL;
}

/**
 * Aggregate transactions by month
 */
export function aggregateByMonth<T extends CashFlow | AccountsPayable | AccountsReceivable>(
  transactions: T[]
): Record<string, T[]> {
  const aggregated: Record<string, T[]> = {};

  transactions.forEach((transaction) => {
    const dateStr = ("date" in transaction ? transaction.date : transaction.dueDate) as string;
    const monthKey = dateStr.substring(0, 7); // YYYY-MM

    if (!aggregated[monthKey]) {
      aggregated[monthKey] = [];
    }

    aggregated[monthKey].push(transaction);
  });

  return aggregated;
}

/**
 * Aggregate transactions by category
 */
export function aggregateByCategory(transactions: CashFlow[]): Record<string, CashFlow[]> {
  const aggregated: Record<string, CashFlow[]> = {};

  transactions.forEach((transaction) => {
    const category = transaction.category || "other";

    if (!aggregated[category]) {
      aggregated[category] = [];
    }

    aggregated[category].push(transaction);
  });

  return aggregated;
}
