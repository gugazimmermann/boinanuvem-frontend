import { useMemo } from "react";
import type { AccountsPayable, AccountsReceivable } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { FinanceTransactionListPage } from "~/components/dashboard/finance/finance-transaction-list-page";
import { useFinanceTransactionList } from "~/hooks/use-finance-transaction-list";
import type { UseFinanceTransactionListOptions } from "~/hooks/use-finance-transaction-list";

export interface FinanceTransactionListRouteConfig<T extends AccountsPayable | AccountsReceivable> {
  readonly transactionType: "accounts-payable" | "accounts-receivable";
  readonly entityColumnKey: "supplier" | "buyer";
  readonly amountColorClass: "red" | "green";
  readonly getTransactionsByCompanyId: (companyId: string) => T[];
  readonly mockTransactions: T[];
  readonly routes: {
    readonly list: string;
    readonly new: string;
    readonly edit: (id: string) => string;
    readonly view: (id: string) => string;
  };
  readonly permissionResource: "accountsPayable" | "accountsReceivable";
  readonly translations: UseFinanceTransactionListOptions<T>["translations"];
}

export function FinanceTransactionListRoute<T extends AccountsPayable | AccountsReceivable>({
  config,
}: {
  readonly config: FinanceTransactionListRouteConfig<T>;
}) {
  const company = mockCompanies[0];
  const initialTransactions = useMemo(() => {
    if (company) {
      return config.getTransactionsByCompanyId(company.id);
    }
    return [...config.mockTransactions];
  }, [company, config]);

  const { properties, financeList, deleteHandler, columns, headerActions, filters, alertMessage } =
    useFinanceTransactionList<T>({
      initialTransactions,
      transactionType: config.transactionType,
      entityColumnKey: config.entityColumnKey,
      amountColorClass: config.amountColorClass,
      translations: config.translations,
      routes: config.routes,
      permissionResource: config.permissionResource,
    });

  return (
    <FinanceTransactionListPage<T>
      columns={columns}
      data={financeList.filteredData}
      filteredData={financeList.filteredData}
      paginatedData={financeList.paginatedData}
      totalPages={financeList.totalPages}
      currentPage={financeList.currentPage}
      onPageChange={financeList.setCurrentPage}
      searchValue={financeList.searchValue}
      onSearchChange={financeList.setSearchValue}
      activeFilter={financeList.activeFilter}
      onFilterChange={financeList.setActiveFilter}
      propertyFilter={financeList.propertyFilter}
      onPropertyFilterChange={financeList.setPropertyFilter}
      selectedYear={financeList.selectedYear}
      onYearChange={financeList.setSelectedYear}
      selectedMonth={financeList.selectedMonth}
      onMonthChange={financeList.setSelectedMonth}
      sortState={{
        column: financeList.sortState.column,
        direction: financeList.sortState.direction || "asc",
      }}
      onSort={financeList.handleSort}
      filters={filters}
      headerActions={headerActions}
      title={config.translations.title}
      description={config.translations.description}
      badgeLabel={(count) => config.translations.badge.transactions(count)}
      searchPlaceholder={config.translations.searchPlaceholder}
      emptyStateTitle={config.translations.emptyState.title}
      emptyStateDescriptionWithSearch={(search) =>
        config.translations.emptyState.descriptionWithSearch(search)
      }
      emptyStateDescriptionWithoutSearch={config.translations.emptyState.descriptionWithoutSearch}
      addNewRoute={config.routes.new}
      addNewLabel={config.translations.addTransaction}
      viewRoute={config.routes.view}
      properties={properties}
      deleteHandler={deleteHandler}
      deleteModalTitle={config.translations.deleteModal.title}
      deleteModalMessage={(description) => config.translations.deleteModal.message(description)}
      deleteModalConfirm={config.translations.deleteModal.confirm}
      deleteModalCancel={config.translations.deleteModal.cancel}
      alertMessage={alertMessage}
      totalAmount={financeList.totalAmount}
    />
  );
}
