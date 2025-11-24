import { useMemo } from "react";
import { parseISO, startOfMonth, endOfMonth } from "date-fns";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import {
  calculateCashFlowTotals,
  calculateAccountsTotal,
  calculateOverdueTotal,
  getUnpaidTransactions,
  getUpcomingTransactions,
} from "~/utils/finance";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

export interface FinanceCalculationsResult {
  // Cash flow totals
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  // Accounts totals
  totalAccountsPayable: number;
  totalAccountsReceivable: number;
  totalOverdue: number;
  // Filtered data
  unpaidPayable: AccountsPayable[];
  unpaidReceivable: AccountsReceivable[];
  overduePayable: AccountsPayable[];
  overdueReceivable: AccountsReceivable[];
  upcomingPayments: AccountsPayable[];
  upcomingReceivables: AccountsReceivable[];
}

/**
 * Hook for finance calculations
 */
export function useFinanceCalculations(
  cashFlowData: CashFlow[],
  accountsPayableData: AccountsPayable[],
  accountsReceivableData: AccountsReceivable[]
) {
  const currentDate = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const currentMonthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // Current month cash flow
  const currentMonthCashFlow = useMemo(() => {
    return cashFlowData.filter((transaction) => {
      const transactionDate = parseISO(transaction.date);
      return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
    });
  }, [cashFlowData, currentMonthStart, currentMonthEnd]);

  // Cash flow totals
  const {
    income: totalIncome,
    expenses: totalExpenses,
    net: netCashFlow,
  } = useMemo(() => calculateCashFlowTotals(currentMonthCashFlow), [currentMonthCashFlow]);

  // Accounts payable calculations
  const unpaidPayable = useMemo(
    () => getUnpaidTransactions(accountsPayableData),
    [accountsPayableData]
  );

  const totalAccountsPayable = useMemo(
    () => calculateAccountsTotal(unpaidPayable),
    [unpaidPayable]
  );

  const overduePayable = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return accountsPayableData.filter((ap) => {
      const dueDate = parseISO(ap.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return (
        (ap.status === AccountsPayableStatus.UNPAID ||
          ap.status === AccountsPayableStatus.OVERDUE) &&
        dueDate < today
      );
    });
  }, [accountsPayableData]);

  const upcomingPayments = useMemo(
    () => getUpcomingTransactions(accountsPayableData, 30),
    [accountsPayableData]
  );

  // Accounts receivable calculations
  const unpaidReceivable = useMemo(
    () => getUnpaidTransactions(accountsReceivableData),
    [accountsReceivableData]
  );

  const totalAccountsReceivable = useMemo(
    () => calculateAccountsTotal(unpaidReceivable),
    [unpaidReceivable]
  );

  const overdueReceivable = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return accountsReceivableData.filter((ar) => {
      const dueDate = parseISO(ar.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return (
        (ar.status === AccountsReceivableStatus.UNPAID ||
          ar.status === AccountsReceivableStatus.OVERDUE) &&
        dueDate < today
      );
    });
  }, [accountsReceivableData]);

  const upcomingReceivables = useMemo(
    () => getUpcomingTransactions(accountsReceivableData, 30),
    [accountsReceivableData]
  );

  // Overdue totals
  const totalOverduePayable = useMemo(
    () => calculateOverdueTotal(accountsPayableData),
    [accountsPayableData]
  );

  const totalOverdueReceivable = useMemo(
    () => calculateOverdueTotal(accountsReceivableData),
    [accountsReceivableData]
  );

  const totalOverdue = useMemo(
    () => totalOverduePayable + totalOverdueReceivable,
    [totalOverduePayable, totalOverdueReceivable]
  );

  return useMemo<FinanceCalculationsResult>(
    () => ({
      totalIncome,
      totalExpenses,
      netCashFlow,
      totalAccountsPayable,
      totalAccountsReceivable,
      totalOverdue,
      unpaidPayable,
      unpaidReceivable,
      overduePayable,
      overdueReceivable,
      upcomingPayments,
      upcomingReceivables,
    }),
    [
      totalIncome,
      totalExpenses,
      netCashFlow,
      totalAccountsPayable,
      totalAccountsReceivable,
      totalOverdue,
      unpaidPayable,
      unpaidReceivable,
      overduePayable,
      overdueReceivable,
      upcomingPayments,
      upcomingReceivables,
    ]
  );
}
