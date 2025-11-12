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
import { mockEmployees, deleteEmployee } from "~/mocks/employees";
import type { Employee } from "~/types";
import { getPropertyById } from "~/mocks/properties";
import { ROUTES, getEmployeeEditRoute, getEmployeeViewRoute } from "~/routes.config";

export function meta() {
  return [
    { title: "Funcionários - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de funcionários do Boi na Nuvem",
    },
  ];
}

export default function Employees() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([...mockEmployees]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  useEffect(() => {
    setEmployees([...mockEmployees]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
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

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    const success = deleteEmployee(selectedEmployee.id);
    if (success) {
      setEmployees(employees.filter((e) => e.id !== selectedEmployee.id));
      showAlert(t.employees.success.deleted, "success");
    } else {
      showAlert(t.employees.errors.deleteFailed, "error");
    }
    setSelectedEmployee(null);
  };

  const filteredData = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      (employee.email?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      (employee.phone?.toLowerCase().includes(searchValue.toLowerCase()) ?? false);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && employee.status === "active") ||
      (activeFilter === "inactive" && employee.status === "inactive");

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

  const columns: TableColumn<Employee>[] = [
    {
      key: "name",
      label: t.employees.table.name,
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
      label: t.employees.table.cpf,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.cpf || "-"}</span>
      ),
    },
    {
      key: "email",
      label: t.employees.table.email,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
      ),
    },
    {
      key: "phone",
      label: t.employees.table.phone,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
      ),
    },
    {
      key: "properties",
      label: t.employees.table.properties,
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
      label: t.employees.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.status === "active" ? t.employees.table.active : t.employees.table.inactive}
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
          onEdit={() => navigate(getEmployeeEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.employees.addEmployee,
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
      onClick: () => navigate(ROUTES.EMPLOYEES_NEW),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.employees.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.employees.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.employees.filters.inactive,
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
      <Table<Employee>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.employees.title,
          badge: {
            label: t.employees.badge.employees(filteredData.length),
            variant: "primary",
          },
          description: t.employees.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.employees.searchPlaceholder,
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
        onRowClick={(row) => navigate(getEmployeeViewRoute(row.id))}
        emptyState={{
          title: t.employees.emptyState.title,
          description: searchValue
            ? t.employees.emptyState.descriptionWithSearch(searchValue)
            : t.employees.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.EMPLOYEES_NEW),
          addNewLabel: t.employees.addEmployee,
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
          setSelectedEmployee(null);
        }}
        onConfirm={handleDeleteEmployee}
        title={t.employees.deleteModal.title}
        message={t.employees.deleteModal.message(selectedEmployee?.name || "")}
        confirmLabel={t.employees.deleteModal.confirm}
        cancelLabel={t.employees.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
