import { useState } from "react";
import {
  Table,
  StatusBadge,
  TableActionButtons,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";

interface Property extends Record<string, unknown> {
  id: string;
  name: string;
  location: string;
  area: number;
  status: "active" | "inactive";
  animals: number;
  pastures: number;
  createdAt: string;
}

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Fazenda São João",
    location: "São Paulo, SP",
    area: 150.5,
    status: "active",
    animals: 120,
    pastures: 8,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Sítio Bela Vista",
    location: "Minas Gerais, MG",
    area: 85.2,
    status: "active",
    animals: 65,
    pastures: 5,
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Chácara Verde",
    location: "Rio de Janeiro, RJ",
    area: 45.8,
    status: "inactive",
    animals: 0,
    pastures: 2,
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Fazenda Esperança",
    location: "Goiás, GO",
    area: 320.0,
    status: "active",
    animals: 250,
    pastures: 15,
    createdAt: "2023-11-05",
  },
  {
    id: "5",
    name: "Rancho dos Ventos",
    location: "Mato Grosso, MT",
    area: 500.0,
    status: "active",
    animals: 380,
    pastures: 20,
    createdAt: "2023-09-12",
  },
];

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
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "animals", direction: "desc" });

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = mockProperties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      property.location.toLowerCase().includes(searchValue.toLowerCase());

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

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle different data types
    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue, "pt-BR", {
        sensitivity: "base",
      });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      // Fallback to string comparison
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
      label: "Nome",
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800">
            {row.name}
          </h2>
          <p className="text-sm font-normal text-gray-600">
            {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "area",
      label: "Área",
      sortable: true,
      render: (value) => (
        <span className="text-gray-700">
          {(value as number).toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} ha
        </span>
      ),
    },
    {
      key: "pastures",
      label: "Localizações",
      sortable: true,
      render: (value) => (
        <span className="text-gray-700">{value as number}</span>
      ),
    },
    {
      key: "animals",
      label: "Animais",
      sortable: true,
      render: (value) => (
        <span className="text-gray-700">{value as number}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.status === "active" ? "Ativa" : "Inativa"}
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
          onEdit={() => console.log("Edit clicked for", row.name)}
          onDelete={() => console.log("Delete clicked for", row.name)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: "Adicionar Propriedade",
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
      onClick: () => console.log("Add property clicked"),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: "Todas",
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: "Ativas",
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: "Inativas",
      value: "inactive",
      active: activeFilter === "inactive",
      onClick: () => setActiveFilter("inactive"),
    },
  ];

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  return (
    <Table<Property>
      columns={columns}
      data={paginatedData}
      header={{
        title: "Propriedades",
        badge: {
          label: `${filteredData.length} propriedades`,
          variant: "primary",
        },
        description: "Gerencie todas as suas propriedades rurais.",
        actions: headerActions,
      }}
      filters={filters}
      search={{
        placeholder: "Buscar propriedades...",
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
      emptyState={{
        title: "Nenhuma propriedade encontrada",
        description: searchValue
          ? `Sua busca "${searchValue}" não encontrou propriedades. Tente novamente ou adicione uma nova propriedade.`
          : "Você ainda não possui propriedades cadastradas. Adicione sua primeira propriedade para começar.",
        onClearSearch: () => setSearchValue(""),
        onAddNew: () => console.log("Add new property clicked"),
        addNewLabel: "Adicionar Propriedade",
      }}
    />
  );
}

