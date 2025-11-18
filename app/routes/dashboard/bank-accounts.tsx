import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  StatusBadge,
  TableActionButtons,
  ConfirmationModal,
  Alert,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { mockCompanies } from "~/mocks/companies";
import { deleteBankAccount, getBankAccountsByCompanyId } from "~/services/bank-account.service";
import type { BankAccount } from "~/types";
import { ROUTES, getBankAccountEditRoute, getBankAccountViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";

export function meta() {
  return [
    { title: "Contas Bancárias - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de contas bancárias do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function BankAccounts() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const company = mockCompanies[0];
  const initialBankAccounts = useMemo(() => {
    if (company) {
      return getBankAccountsByCompanyId(company.id);
    }
    return [];
  }, [company]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "bankName", direction: "asc" });

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const itemsPerPage = 10;

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteClick = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBankAccount = async () => {
    if (!selectedBankAccount) return;
    const success = deleteBankAccount(selectedBankAccount.id);
    if (success) {
      setBankAccounts(bankAccounts.filter((ba) => ba.id !== selectedBankAccount.id));
      showAlert(t.bankAccounts.success.deleted, "success");
    } else {
      showAlert(t.bankAccounts.errors.deleteFailed, "error");
    }
    setSelectedBankAccount(null);
  };

  const filteredData = bankAccounts.filter((bankAccount) => {
    const matchesSearch =
      bankAccount.bankName.toLowerCase().includes(searchValue.toLowerCase()) ||
      bankAccount.accountNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      bankAccount.accountHolderName.toLowerCase().includes(searchValue.toLowerCase()) ||
      false;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && bankAccount.status === "active") ||
      (activeFilter === "inactive" && bankAccount.status === "inactive");

    return matchesSearch && matchesFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortState.column || !sortState.direction) {
      return 0;
    }

    const aValue = a[sortState.column];
    const bValue = b[sortState.column];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue, "pt-BR", {
        sensitivity: "base",
      });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      default:
        return "default";
    }
  };

  const columns: TableColumn<BankAccount>[] = [
    {
      key: "bankName",
      label: t.bankAccounts.table.bankName,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">{row.bankName}</span>
      ),
    },
    {
      key: "accountNumber",
      label: t.bankAccounts.table.accountNumber,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.branch} - {row.accountNumber}
        </span>
      ),
    },
    {
      key: "accountType",
      label: t.bankAccounts.table.accountType,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.accountType === "checking"
            ? t.bankAccounts.accountTypes.checking
            : t.bankAccounts.accountTypes.savings}
        </span>
      ),
    },
    {
      key: "accountHolderName",
      label: t.bankAccounts.table.accountHolderName,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.accountHolderName}</span>
      ),
    },
    {
      key: "status",
      label: t.bankAccounts.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={t.bankAccounts.status[row.status] || row.status}
          variant={getStatusVariant(row.status)}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getBankAccountEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
          canEdit={canEdit("finances", "bankAccounts")}
          canDelete={canRemove("finances", "bankAccounts")}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = canAdd("finances", "bankAccounts")
    ? [
        {
          label: t.bankAccounts.addBankAccount,
          variant: "primary",
          leftIcon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          onClick: () => navigate(ROUTES.BANK_ACCOUNTS_NEW),
        },
      ]
    : [];

  const filters: TableFilter[] = [
    {
      label: t.bankAccounts.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.bankAccounts.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.bankAccounts.filters.inactive,
      value: "inactive",
      active: activeFilter === "inactive",
      onClick: () => setActiveFilter("inactive"),
    },
  ];

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  return (
    <div>
      <Table<BankAccount>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.bankAccounts.title,
          badge: {
            label: t.bankAccounts.badge.accounts(filteredData.length),
            variant: "primary",
          },
          description: t.bankAccounts.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.bankAccounts.searchPlaceholder,
          value: searchValue,
          onChange: setSearchValue,
        }}
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange: setCurrentPage,
          showInfo: false,
        }}
        sortState={sortState}
        onSort={handleSort}
        onRowClick={(row) => navigate(getBankAccountViewRoute(row.id))}
        emptyState={{
          title: t.bankAccounts.emptyState.title,
          description: searchValue
            ? t.bankAccounts.emptyState.descriptionWithSearch(searchValue)
            : t.bankAccounts.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.BANK_ACCOUNTS_NEW),
          addNewLabel: t.bankAccounts.addBankAccount,
        }}
      />

      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBankAccount(null);
        }}
        onConfirm={handleDeleteBankAccount}
        title={t.bankAccounts.deleteModal.title}
        message={t.bankAccounts.deleteModal.message(selectedBankAccount?.bankName || "")}
        confirmLabel={t.bankAccounts.deleteModal.confirm}
        cancelLabel={t.bankAccounts.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
