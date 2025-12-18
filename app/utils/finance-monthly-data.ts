import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import type { CashFlow } from "~/types";

const monthNames = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export interface MonthlyFinanceData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

/**
 * Calculates monthly finance data from cash flow transactions for the last 12 months.
 * @param cashFlowData Array of cash flow transactions
 * @param currentDate The current date to calculate months from
 * @returns Array of monthly data with income, expenses, and net values
 */
export function calculateMonthlyFinanceData(
  cashFlowData: CashFlow[],
  currentDate: Date
): MonthlyFinanceData[] {
  const months: Record<string, { month: string; income: number; expenses: number; net: number }> =
    {};

  const parseTransactionDate = (value: string): Date => {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
    return parseISO(value);
  };

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(currentDate, i);
    const monthKey = format(monthDate, "yyyy-MM");
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    months[monthKey] = {
      month: monthNames[monthDate.getMonth()],
      income: 0,
      expenses: 0,
      net: 0,
    };

    for (const transaction of cashFlowData) {
      const transactionDate = parseTransactionDate(transaction.date);
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        if (transaction.type === "income") {
          months[monthKey].income += transaction.amount;
        } else {
          months[monthKey].expenses += transaction.amount;
        }
      }
    }

    months[monthKey].net = months[monthKey].income - months[monthKey].expenses;
  }

  return Object.values(months);
}
