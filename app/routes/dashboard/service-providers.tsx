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
import { mockServiceProviders, deleteServiceProvider } from "~/mocks/service-providers";
import type { ServiceProvider } from "~/types";
import { getPropertyById } from "~/mocks/properties";
import { ROUTES, getServiceProviderEditRoute, getServiceProviderViewRoute } from "~/routes.config";

export function meta() {
  return [
    { title: "Prestadores de Serviço - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de prestadores de serviço do Boi na Nuvem",
    },
  ];
}

export default function ServiceProviders() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([
    ...mockServiceProviders,
  ]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  useEffect(() => {
    setServiceProviders([...mockServiceProviders]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedServiceProvider, setSelectedServiceProvider] = useState<ServiceProvider | null>(
    null
  );
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

  const handleDeleteClick = (serviceProvider: ServiceProvider) => {
    setSelectedServiceProvider(serviceProvider);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteServiceProvider = async () => {
    if (!selectedServiceProvider) return;
    const success = deleteServiceProvider(selectedServiceProvider.id);
    if (success) {
      setServiceProviders(serviceProviders.filter((sp) => sp.id !== selectedServiceProvider.id));
      showAlert(t.serviceProviders.success.deleted, "success");
    } else {
      showAlert(t.serviceProviders.errors.deleteFailed, "error");
    }
    setSelectedServiceProvider(null);
  };

  const filteredData = serviceProviders.filter((serviceProvider) => {
    const matchesSearch =
      serviceProvider.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      serviceProvider.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      (serviceProvider.email?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (serviceProvider.phone?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (serviceProvider.cpf?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (serviceProvider.cnpj?.toLowerCase().includes(searchValue.toLowerCase()) ?? false);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && serviceProvider.status === "active") ||
      (activeFilter === "inactive" && serviceProvider.status === "inactive");

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

  const columns: TableColumn<ServiceProvider>[] = [
    {
      key: "name",
      label: t.serviceProviders.table.name,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
        </div>
      ),
    },
    {
      key: "cpf",
      label: t.serviceProviders.table.cpf,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.cpf || "-"}</span>
      ),
    },
    {
      key: "cnpj",
      label: t.serviceProviders.table.cnpj,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.cnpj || "-"}</span>
      ),
    },
    {
      key: "email",
      label: t.serviceProviders.table.email,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
      ),
    },
    {
      key: "phone",
      label: t.serviceProviders.table.phone,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
      ),
    },
    {
      key: "properties",
      label: t.serviceProviders.table.properties,
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
      label: t.serviceProviders.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={
            row.status === "active"
              ? t.serviceProviders.table.active
              : t.serviceProviders.table.inactive
          }
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
          onEdit={() => navigate(getServiceProviderEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.serviceProviders.addServiceProvider,
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
      onClick: () => navigate(ROUTES.SERVICE_PROVIDERS_NEW),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.serviceProviders.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.serviceProviders.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.serviceProviders.filters.inactive,
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
      <Table<ServiceProvider>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.serviceProviders.title,
          badge: {
            label: t.serviceProviders.badge.serviceProviders(filteredData.length),
            variant: "primary",
          },
          description: t.serviceProviders.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.serviceProviders.searchPlaceholder,
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
        onRowClick={(row) => navigate(getServiceProviderViewRoute(row.id))}
        emptyState={{
          title: t.serviceProviders.emptyState.title,
          description: searchValue
            ? t.serviceProviders.emptyState.descriptionWithSearch(searchValue)
            : t.serviceProviders.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.SERVICE_PROVIDERS_NEW),
          addNewLabel: t.serviceProviders.addServiceProvider,
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
          setSelectedServiceProvider(null);
        }}
        onConfirm={handleDeleteServiceProvider}
        title={t.serviceProviders.deleteModal.title}
        message={t.serviceProviders.deleteModal.message(selectedServiceProvider?.name || "")}
        confirmLabel={t.serviceProviders.deleteModal.confirm}
        cancelLabel={t.serviceProviders.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
