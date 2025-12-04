import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  StatusBadge,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { DeleteModalSection } from "~/components/dashboard/common/delete-modal-section";
import { createActionColumn } from "~/utils/table-action-column";
import { createAddButtonAction } from "~/utils/header-action-helpers";
import { createEmptyStateConfig } from "~/utils/empty-state-config";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { sortItems } from "~/utils/table-helpers";
import { mockCompanies } from "~/mocks/companies";
import { deleteBankAccount, getBankAccountsByCompanyId } from "~/services/bank-account.service";
import type { BankAccount } from "~/types";
import { ROUTES, getBankAccountEditRoute, getBankAccountViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useAlert } from "~/hooks/use-alert";

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
  const { language } = useLanguage();
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
  const { alertMessage, showAlert } = useAlert();
  const itemsPerPage = 10;

  const getLocaleForDateTime = () => {
    if (language === "en") return "en-US";
    if (language === "es") return "es-ES";
    return "pt-BR";
  };
  const localeForDateTime = getLocaleForDateTime();

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

  const sortedData = sortItems({
    items: filteredData,
    sortState,
    locale: localeForDateTime,
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
    createActionColumn<BankAccount>({
      onEdit: (row) => {
        navigate(getBankAccountEditRoute(row.id));
      },
      onDelete: (row) => {
        handleDeleteClick(row);
      },
      canEdit: canEdit("finances", "bankAccounts"),
      canDelete: canRemove("finances", "bankAccounts"),
    }),
  ];

  const headerActions: TableAction[] = canAdd("finances", "bankAccounts")
    ? [
        createAddButtonAction({
          label: t.bankAccounts.addBankAccount,
          onClick: () => {
            navigate(ROUTES.BANK_ACCOUNTS_NEW);
          },
        }),
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
        emptyState={createEmptyStateConfig({
          title: t.bankAccounts.emptyState.title,
          descriptionWithSearch: (search) =>
            t.bankAccounts.emptyState.descriptionWithSearch(search),
          descriptionWithoutSearch: t.bankAccounts.emptyState.descriptionWithoutSearch,
          searchValue,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => {
            navigate(ROUTES.BANK_ACCOUNTS_NEW);
          },
          addNewLabel: t.bankAccounts.addBankAccount,
        })}
      />

      <DeleteModalSection
        alertMessage={alertMessage}
        isDeleteModalOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBankAccount(null);
        }}
        onConfirm={handleDeleteBankAccount}
        title={t.bankAccounts.deleteModal.title}
        message={t.bankAccounts.deleteModal.message(selectedBankAccount?.bankName || "")}
        confirmLabel={t.bankAccounts.deleteModal.confirm}
        cancelLabel={t.bankAccounts.deleteModal.cancel}
      />
    </div>
  );
}
