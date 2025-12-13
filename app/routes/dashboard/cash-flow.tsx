import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { formatCurrency, getLocaleForCurrency } from "~/utils/formatting";
import {
  StatusBadge,
  Select,
  type TableColumn,
  type TableAction,
  type TableFilter,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getCashFlowByCompanyId } from "~/services/cash-flow.service";
import { getProperties } from "~/services/properties.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getBuyers } from "~/services/buyers.service";
import type { Property, Supplier, Buyer, CashFlow } from "~/types";
import { useAuth } from "~/contexts/auth-context";
import { ROUTES, getCashFlowEditRoute, getCashFlowViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useFinanceList } from "~/hooks/use-finance-list";
import { formatFinanceAmount } from "~/utils/finance";
import { useAlert } from "~/hooks/use-alert";
import { useFinanceTransactionDelete } from "~/hooks/use-finance-transaction-delete";
import {
  createPropertyColumn,
  createCategoryColumn,
  createDescriptionColumn,
  createEntityColumn,
  createDateColumn,
} from "~/utils/finance-column-helpers";
import { FinanceTransactionListPage } from "~/components/dashboard/finance/finance-transaction-list-page";
import { createActionColumn } from "~/utils/table-action-column";
import { createAddButtonAction } from "~/utils/header-action-helpers";

export function meta() {
  return [
    { title: "Fluxo de Caixa - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de fluxo de caixa do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function CashFlow() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [transactions, setTransactions] = useState<CashFlow[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const { alertMessage, showAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      if (companyId) {
        try {
          const [transactionsData, propertiesData, suppliersData, buyersData] = await Promise.all([
            Promise.resolve(getCashFlowByCompanyId(companyId)),
            getProperties(),
            getSuppliers(),
            getBuyers(),
          ]);
          setTransactions(transactionsData);
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
          setSuppliers(suppliersData.filter((sup) => sup.companyId === companyId));
          setBuyers(buyersData.filter((buy) => buy.companyId === companyId));
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    fetchData();
  }, [companyId]);

  const localeForCurrency = getLocaleForCurrency(language);

  const {
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    propertyFilter,
    setPropertyFilter,
    selectedSupplier,
    setSelectedSupplier,
    selectedBuyer,
    setSelectedBuyer,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    sortState,
    handleSort,
    currentPage,
    setCurrentPage,
    filteredData,
    paginatedData,
    totalPages,
  } = useFinanceList<CashFlow>({
    data: transactions,
    initialSort: { column: "date", direction: "desc" },
    filterConfig: {
      enableTypeFilter: true,
      enableSupplierFilter: true,
      enableBuyerFilter: true,
    },
  });

  const totalIncome = useMemo(
    () => filteredData.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    [filteredData]
  );
  const totalExpenses = useMemo(
    () => filteredData.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    [filteredData]
  );
  const netTotal = totalIncome - totalExpenses;

  const deleteHandler = useFinanceTransactionDelete({
    transactionType: "cash-flow",
    onSuccess: (message) => showAlert(message, "success"),
    onError: (message) => showAlert(message, "error"),
    successMessage: t.cashFlow.success.deleted,
    errorMessage: t.cashFlow.errors.deleteFailed,
    onDeleteSuccess: (transaction) => {
      setTransactions(transactions.filter((t) => t.id !== transaction.id));
    },
  });

  const columns: TableColumn<CashFlow>[] = [
    {
      key: "type",
      label: t.cashFlow.table.type,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.type === "income" ? t.cashFlow.table.income : t.cashFlow.table.expense}
          variant={row.type === "income" ? "success" : "default"}
        />
      ),
    },
    {
      key: "amount",
      label: t.cashFlow.table.amount,
      sortable: true,
      render: (_, row) => (
        <span
          className={`font-medium ${
            row.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatFinanceAmount(row.amount, row.type, localeForCurrency)}
        </span>
      ),
    },
    createDateColumn<CashFlow>({
      label: t.cashFlow.table.date,
      language,
      dateField: "date",
    }),
    createPropertyColumn<CashFlow>({
      label: t.cashFlow.table.property,
      language,
    }),
    createCategoryColumn<CashFlow>({
      label: t.cashFlow.table.category,
      categories: t.cashFlow.categories,
    }),
    createDescriptionColumn<CashFlow>({
      label: t.cashFlow.table.description,
    }),
    createEntityColumn<CashFlow>({
      key: "supplierBuyer",
    }),
    {
      key: "paymentMethod",
      label: t.cashFlow.table.paymentMethod,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {t.cashFlow.paymentMethods[row.paymentMethod] || row.paymentMethod}
        </span>
      ),
    },
    {
      key: "referenceNumber",
      label: t.cashFlow.table.referenceNumber,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.referenceNumber || "-"}</span>
      ),
    },
    {
      key: "status",
      label: t.cashFlow.table.status,
      sortable: true,
      render: (_, _row) => <StatusBadge label={t.cashFlow.table.completed} variant="success" />,
    },
    createActionColumn<CashFlow>({
      onEdit: (row) => {
        navigate(getCashFlowEditRoute(row.id));
      },
      onDelete: (row) => {
        deleteHandler.handleDeleteClick(row);
      },
      canEdit: canEdit("finances", "cashFlow"),
      canDelete: canRemove("finances", "cashFlow"),
    }),
  ];

  const headerActions: TableAction[] = canAdd("finances", "cashFlow")
    ? [
        createAddButtonAction({
          label: t.cashFlow.addTransaction,
          onClick: () => {
            navigate(ROUTES.CASH_FLOW_NEW);
          },
        }),
      ]
    : [];

  const filters: TableFilter[] = [
    {
      label: t.cashFlow.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => {
        setActiveFilter("all");
        setSelectedSupplier("all");
        setSelectedBuyer("all");
      },
    },
    {
      label: t.cashFlow.filters.income,
      value: "income",
      active: activeFilter === "income",
      onClick: () => {
        setActiveFilter("income");
        setSelectedSupplier("all");
      },
    },
    {
      label: t.cashFlow.filters.expense,
      value: "expense",
      active: activeFilter === "expense",
      onClick: () => {
        setActiveFilter("expense");
        setSelectedBuyer("all");
      },
    },
  ];

  const additionalContent = (
    <div className="flex items-center gap-2">
      {activeFilter === "expense" && (
        <div className="w-48">
          <Select
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              {
                value: "all",
                label: t.cashFlow.filters.allSuppliers || "Todos os fornecedores",
              },
              ...suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              })),
            ]}
            selectClassName="text-xs sm:text-sm py-2"
          />
        </div>
      )}
      {activeFilter === "income" && (
        <div className="w-48">
          <Select
            value={selectedBuyer}
            onChange={(e) => {
              setSelectedBuyer(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: t.cashFlow.filters.allBuyers || "Todos os compradores" },
              ...buyers.map((buyer) => ({
                value: buyer.id,
                label: buyer.name,
              })),
            ]}
            selectClassName="text-xs sm:text-sm py-2"
          />
        </div>
      )}
    </div>
  );

  const belowContent = (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {t.cashFlow.filters.income}
        </span>
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(totalIncome)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {t.cashFlow.filters.expense}
        </span>
        <span className="font-semibold text-red-600 dark:text-red-400">
          {formatCurrency(totalExpenses)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-xs">{t.common.total}</span>
        <span
          className={`font-semibold ${
            netTotal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(netTotal)}
        </span>
      </div>
    </div>
  );

  return (
    <FinanceTransactionListPage<CashFlow>
      columns={columns}
      data={transactions}
      filteredData={filteredData}
      paginatedData={paginatedData}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      propertyFilter={propertyFilter}
      onPropertyFilterChange={setPropertyFilter}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
      sortState={{ column: sortState.column, direction: sortState.direction || "asc" }}
      onSort={handleSort}
      filters={filters}
      headerActions={headerActions}
      title={t.cashFlow.title}
      description={t.cashFlow.description}
      badgeLabel={(count) => t.cashFlow.badge.transactions(count)}
      searchPlaceholder={t.cashFlow.searchPlaceholder}
      emptyStateTitle={t.cashFlow.emptyState.title}
      emptyStateDescriptionWithSearch={(search) =>
        t.cashFlow.emptyState.descriptionWithSearch(search)
      }
      emptyStateDescriptionWithoutSearch={t.cashFlow.emptyState.descriptionWithoutSearch}
      addNewRoute={ROUTES.CASH_FLOW_NEW}
      addNewLabel={t.cashFlow.addTransaction}
      viewRoute={getCashFlowViewRoute}
      properties={properties}
      deleteHandler={deleteHandler}
      deleteModalTitle={t.cashFlow.deleteModal.title}
      deleteModalMessage={(description) => t.cashFlow.deleteModal.message(description)}
      deleteModalConfirm={t.cashFlow.deleteModal.confirm}
      deleteModalCancel={t.cashFlow.deleteModal.cancel}
      alertMessage={alertMessage}
      additionalContent={additionalContent}
      belowContent={belowContent}
    />
  );
}
