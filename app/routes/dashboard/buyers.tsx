import { useState, useEffect } from "react";
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
import { mockBuyers, deleteBuyer } from "~/mocks/buyers";
import type { Buyer } from "~/types";
import { getPropertyById } from "~/mocks/properties";
import { ROUTES, getBuyerEditRoute, getBuyerViewRoute } from "~/routes.config";

export function meta() {
  return [
    { title: "Compradores - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de compradores do Boi na Nuvem",
    },
  ];
}

export default function Buyers() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState<Buyer[]>([...mockBuyers]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  useEffect(() => {
    setBuyers([...mockBuyers]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
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

  const handleDeleteClick = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBuyer = async () => {
    if (!selectedBuyer) return;
    const success = deleteBuyer(selectedBuyer.id);
    if (success) {
      setBuyers(buyers.filter((b) => b.id !== selectedBuyer.id));
      showAlert(t.buyers.success.deleted, "success");
    } else {
      showAlert(t.buyers.errors.deleteFailed, "error");
    }
    setSelectedBuyer(null);
  };

  const filteredData = buyers.filter((buyer) => {
    const matchesSearch =
      buyer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      buyer.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      (buyer.email?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (buyer.phone?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (buyer.cpf?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (buyer.cnpj?.toLowerCase().includes(searchValue.toLowerCase()) ?? false);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && buyer.status === "active") ||
      (activeFilter === "inactive" && buyer.status === "inactive");

    return matchesSearch && matchesFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortState.column || !sortState.direction) {
      return 0;
    }

    let aValue = a[sortState.column];
    let bValue = b[sortState.column];

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

  const columns: TableColumn<Buyer>[] = [
    {
      key: "name",
      label: t.buyers.table.name,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            {row.code}
          </p>
        </div>
      ),
    },
    {
      key: "cpf",
      label: t.buyers.table.cpf,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.cpf || "-"}</span>
      ),
    },
    {
      key: "cnpj",
      label: t.buyers.table.cnpj,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.cnpj || "-"}</span>
      ),
    },
    {
      key: "email",
      label: t.buyers.table.email,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
      ),
    },
    {
      key: "phone",
      label: t.buyers.table.phone,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
      ),
    },
    {
      key: "properties",
      label: t.buyers.table.properties,
      sortable: false,
      render: (_, row) => {
        const properties = row.propertyIds
          .map((id) => getPropertyById(id))
          .filter((p) => p !== undefined)
          .map((p) => p!.name);
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {properties.length > 0 ? properties.join(", ") : "-"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: t.buyers.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.status === "active" ? t.buyers.table.active : t.buyers.table.inactive}
          variant={row.status === "active" ? "success" : "default"}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getBuyerEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.buyers.addBuyer,
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
      onClick: () => navigate(ROUTES.BUYERS_NEW),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.buyers.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.buyers.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.buyers.filters.inactive,
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
      <Table<Buyer>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.buyers.title,
          badge: {
            label: t.buyers.badge.buyers(filteredData.length),
            variant: "primary",
          },
          description: t.buyers.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.buyers.searchPlaceholder,
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
        onRowClick={(row) => navigate(getBuyerViewRoute(row.id))}
        emptyState={{
          title: t.buyers.emptyState.title,
          description: searchValue
            ? t.buyers.emptyState.descriptionWithSearch(searchValue)
            : t.buyers.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.BUYERS_NEW),
          addNewLabel: t.buyers.addBuyer,
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
          setSelectedBuyer(null);
        }}
        onConfirm={handleDeleteBuyer}
        title={t.buyers.deleteModal.title}
        message={t.buyers.deleteModal.message(selectedBuyer?.name || "")}
        confirmLabel={t.buyers.deleteModal.confirm}
        cancelLabel={t.buyers.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}

