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
import { mockProperties, deleteProperty } from "~/mocks/properties";
import type { Property } from "~/types";
import { getLocationsByPropertyId } from "~/mocks/locations";
import { ROUTES, getPropertyEditRoute, getPropertyViewRoute } from "~/routes.config";

export function meta() {
  return [
    { title: "Propriedades - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de propriedades do Boi na Nuvem",
    },
  ];
}

export default function Properties() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([...mockProperties]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  useEffect(() => {
    setProperties([...mockProperties]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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

  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    const success = deleteProperty(selectedProperty.id);
    if (success) {
      setProperties(properties.filter((p) => p.id !== selectedProperty.id));
      showAlert(t.properties.success.deleted, "success");
    } else {
      showAlert(t.properties.errors.deleteFailed, "error");
    }
    setSelectedProperty(null);
  };

  const filteredData = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      property.city.toLowerCase().includes(searchValue.toLowerCase()) ||
      property.state.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && property.status === "active") ||
      (activeFilter === "inactive" && property.status === "inactive");

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

  const columns: TableColumn<Property>[] = [
    {
      key: "name",
      label: t.properties.table.name,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            {row.city}, {row.state}
          </p>
        </div>
      ),
    },
    {
      key: "area",
      label: t.properties.table.area,
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">
          {(value as number).toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{" "}
          ha
        </span>
      ),
    },
    {
      key: "pastures",
      label: t.properties.table.locations,
      sortable: true,
      render: (_, row) => {
        const locations = getLocationsByPropertyId(row.id);
        return <span className="text-gray-700 dark:text-gray-300">{locations.length}</span>;
      },
    },
    {
      key: "animals",
      label: t.properties.table.animals,
      sortable: true,
      render: () => <span className="text-gray-700 dark:text-gray-300">0</span>,
    },
    {
      key: "status",
      label: t.properties.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.status === "active" ? t.properties.table.active : t.properties.table.inactive}
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
          onEdit={() => navigate(getPropertyEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.properties.addProperty,
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
      onClick: () => navigate(ROUTES.PROPERTIES_NEW),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.properties.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.properties.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.properties.filters.inactive,
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
      <Table<Property>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.properties.title,
          badge: {
            label: t.properties.badge.properties(filteredData.length),
            variant: "primary",
          },
          description: t.properties.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.properties.searchPlaceholder,
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
        onRowClick={(row) => navigate(getPropertyViewRoute(row.id))}
        emptyState={{
          title: t.properties.emptyState.title,
          description: searchValue
            ? t.properties.emptyState.descriptionWithSearch(searchValue)
            : t.properties.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.PROPERTIES_NEW),
          addNewLabel: t.properties.addProperty,
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
          setSelectedProperty(null);
        }}
        onConfirm={handleDeleteProperty}
        title={t.properties.deleteModal.title}
        message={t.properties.deleteModal.message(selectedProperty?.name || "")}
        confirmLabel={t.properties.deleteModal.confirm}
        cancelLabel={t.properties.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
