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
import { mockSuppliers, deleteSupplier } from "~/mocks/suppliers";
import type { Supplier } from "~/types";
import { getPropertyById } from "~/mocks/properties";
import { ROUTES, getSupplierEditRoute, getSupplierViewRoute } from "~/routes.config";
import { getSupplierObservationsBySupplierId } from "~/mocks/supplier-observations";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export function meta() {
  return [
    { title: "Fornecedores - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de fornecedores do Boi na Nuvem",
    },
  ];
}

export default function Suppliers() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([...mockSuppliers]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  useEffect(() => {
    setSuppliers([...mockSuppliers]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
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

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    const success = deleteSupplier(selectedSupplier.id);
    if (success) {
      setSuppliers(suppliers.filter((s) => s.id !== selectedSupplier.id));
      showAlert(t.suppliers.success.deleted, "success");
    } else {
      showAlert(t.suppliers.errors.deleteFailed, "error");
    }
    setSelectedSupplier(null);
  };

  const filteredData = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      (supplier.email?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (supplier.phone?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (supplier.cpf?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (supplier.cnpj?.toLowerCase().includes(searchValue.toLowerCase()) ?? false);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && supplier.status === "active") ||
      (activeFilter === "inactive" && supplier.status === "inactive");

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

  const columns: TableColumn<Supplier>[] = [
    {
      key: "name",
      label: t.suppliers.table.name,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
        </div>
      ),
    },
    {
      key: "document",
      label: t.suppliers.table.document || "Documento",
      sortable: false,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.cpf || row.cnpj || "-"}
        </span>
      ),
    },
    {
      key: "email",
      label: t.suppliers.table.email,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
      ),
    },
    {
      key: "phone",
      label: t.suppliers.table.phone,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
      ),
    },
    {
      key: "properties",
      label: t.suppliers.table.properties,
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
      key: "lastObservation",
      label: t.suppliers.table.lastObservation || "Última Observação",
      sortable: false,
      render: (_, row) => {
        const observations = getSupplierObservationsBySupplierId(row.id);
        if (observations.length === 0) {
          return <span className="text-gray-400 dark:text-gray-500">-</span>;
        }
        const lastObservation = observations.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        const truncated =
          lastObservation.observation.length > 60
            ? `${lastObservation.observation.substring(0, 60)}...`
            : lastObservation.observation;
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-300" title={lastObservation.observation}>
              {truncated}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(lastObservation.createdAt)}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      label: t.suppliers.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.status === "active" ? t.suppliers.table.active : t.suppliers.table.inactive}
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
          onEdit={() => navigate(getSupplierEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.suppliers.addSupplier,
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
      onClick: () => navigate(ROUTES.SUPPLIERS_NEW),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.suppliers.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.suppliers.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.suppliers.filters.inactive,
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
      <Table<Supplier>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.suppliers.title,
          badge: {
            label: t.suppliers.badge.suppliers(filteredData.length),
            variant: "primary",
          },
          description: t.suppliers.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.suppliers.searchPlaceholder,
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
        onRowClick={(row) => navigate(getSupplierViewRoute(row.id))}
        emptyState={{
          title: t.suppliers.emptyState.title,
          description: searchValue
            ? t.suppliers.emptyState.descriptionWithSearch(searchValue)
            : t.suppliers.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.SUPPLIERS_NEW),
          addNewLabel: t.suppliers.addSupplier,
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
          setSelectedSupplier(null);
        }}
        onConfirm={handleDeleteSupplier}
        title={t.suppliers.deleteModal.title}
        message={t.suppliers.deleteModal.message(selectedSupplier?.name || "")}
        confirmLabel={t.suppliers.deleteModal.confirm}
        cancelLabel={t.suppliers.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
