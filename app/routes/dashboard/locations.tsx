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
import { mockLocations, deleteLocation } from "~/mocks/locations";
import type { Location } from "~/types";
import { AreaType } from "~/types";
import { getPropertyById } from "~/mocks/properties";
import { ROUTES, getLocationEditRoute, getLocationViewRoute } from "~/routes.config";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";
import { getLocationMovementsByLocationId } from "~/mocks/location-movements";
import { getLocationObservationsByLocationId } from "~/mocks/location-observations";

const formatAreaType = (type: AreaType): string => {
  const typeMap: Record<AreaType, string> = {
    [AreaType.HECTARES]: "ha",
    [AreaType.SQUARE_METERS]: "m²",
    [AreaType.SQUARE_FEET]: "ft²",
    [AreaType.ACRES]: "ac",
    [AreaType.SQUARE_KILOMETERS]: "km²",
    [AreaType.SQUARE_MILES]: "mi²",
  };
  return typeMap[type] || type;
};

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
    { title: "Localizações - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de localizações do Boi na Nuvem",
    },
  ];
}

export default function Locations() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([...mockLocations]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  useEffect(() => {
    setLocations([...mockLocations]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
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

  const handleDeleteClick = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    const success = deleteLocation(selectedLocation.id);
    if (success) {
      setLocations(locations.filter((l) => l.id !== selectedLocation.id));
      showAlert(t.locations.success.deleted, "success");
    } else {
      showAlert(t.locations.errors.deleteFailed, "error");
    }
    setSelectedLocation(null);
  };

  const filteredData = locations.filter((location) => {
    const property = getPropertyById(location.propertyId);
    const matchesSearch =
      location.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (property?.name.toLowerCase().includes(searchValue.toLowerCase()) ?? false);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && location.status === "active") ||
      (activeFilter === "inactive" && location.status === "inactive");

    return matchesSearch && matchesFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortState.column || !sortState.direction) {
      return 0;
    }

    let aValue = a[sortState.column];
    let bValue = b[sortState.column];

    if (sortState.column === "area") {
      aValue = a.area.value;
      bValue = b.area.value;
    }

    if (sortState.column === "locationType") {
      aValue = a.locationType;
      bValue = b.locationType;
    }

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

  const columns: TableColumn<Location>[] = [
    {
      key: "name",
      label: t.locations.table.name,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
        </div>
      ),
    },
    {
      key: "property",
      label: t.locations.table.property,
      sortable: true,
      render: (_, row) => {
        const property = getPropertyById(row.propertyId);
        return <span className="text-gray-700 dark:text-gray-300">{property?.name || "-"}</span>;
      },
    },
    {
      key: "locationType",
      label: t.locations.table.locationType,
      sortable: true,
      render: (_, row) => (
        <LocationTypeBadge
          locationType={row.locationType}
          label={
            t.locations.types[row.locationType as keyof typeof t.locations.types] ||
            row.locationType
          }
        />
      ),
    },
    {
      key: "area",
      label: t.locations.table.area,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.area.value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {formatAreaType(row.area.type)}
        </span>
      ),
    },
    {
      key: "status",
      label: t.locations.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.status === "active" ? t.locations.table.active : t.locations.table.inactive}
          variant={row.status === "active" ? "success" : "default"}
        />
      ),
    },
    {
      key: "lastMovement",
      label: t.locations.table.lastMovement || "Última Movimentação",
      sortable: false,
      render: (_, row) => {
        const movements = getLocationMovementsByLocationId(row.id);
        if (movements.length === 0) {
          return <span className="text-gray-400 dark:text-gray-500">-</span>;
        }
        const lastMovement = movements.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        const movementTypeLabel =
          t.properties.details.movements.types[
            lastMovement.type as keyof typeof t.properties.details.movements.types
          ] || lastMovement.type;
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">{movementTypeLabel}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(lastMovement.date)}
            </p>
          </div>
        );
      },
    },
    {
      key: "lastObservation",
      label: t.locations.table.lastObservation || "Última Observação",
      sortable: false,
      render: (_, row) => {
        const observations = getLocationObservationsByLocationId(row.id);
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
            <p
              className="text-sm text-gray-700 dark:text-gray-300"
              title={lastObservation.observation}
            >
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
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getLocationEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.locations.addLocation,
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
      onClick: () => navigate(ROUTES.LOCATIONS_NEW),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.locations.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.locations.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.locations.filters.inactive,
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
      <Table<Location>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.locations.title,
          badge: {
            label: t.locations.badge.locations(filteredData.length),
            variant: "primary",
          },
          description: t.locations.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.locations.searchPlaceholder,
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
        onRowClick={(row) => navigate(getLocationViewRoute(row.id))}
        emptyState={{
          title: t.locations.emptyState.title,
          description: searchValue
            ? t.locations.emptyState.descriptionWithSearch(searchValue)
            : t.locations.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.LOCATIONS_NEW),
          addNewLabel: t.locations.addLocation,
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
          setSelectedLocation(null);
        }}
        onConfirm={handleDeleteLocation}
        title={t.locations.deleteModal.title}
        message={t.locations.deleteModal.message(selectedLocation?.name || "")}
        confirmLabel={t.locations.deleteModal.confirm}
        cancelLabel={t.locations.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
