import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Table,
  StatusBadge,
  TableActionButtons,
  ConfirmationModal,
  AnimalRegistrationModal,
  Alert,
  Tooltip,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { mockAnimals, deleteAnimal } from "~/mocks/animals";
import type { Animal } from "~/types";
import { getPropertyById } from "~/mocks/properties";
import { getWeighingsByAnimalId } from "~/mocks/weighings";
import { getBirthByAnimalId } from "~/mocks/births";
import {
  ROUTES,
  getAnimalEditRoute,
  getAnimalViewRoute,
  getAnimalMovementNewRoute,
} from "~/routes.config";
import { Button } from "~/components/ui";

export function meta() {
  return [
    { title: "Animais - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de animais do Boi na Nuvem",
    },
  ];
}

export default function Animals() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([...mockAnimals]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "code", direction: "asc" });

  useEffect(() => {
    setAnimals([...mockAnimals]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAnimalRegistrationModalOpen, setIsAnimalRegistrationModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
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

  const handleDeleteClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAnimal = async () => {
    if (!selectedAnimal) return;
    const success = deleteAnimal(selectedAnimal.id);
    if (success) {
      setAnimals(animals.filter((a) => a.id !== selectedAnimal.id));
      showAlert(t.animals.success.deleted, "success");
    } else {
      showAlert(t.animals.errors.deleteFailed, "error");
    }
    setSelectedAnimal(null);
  };

  const filteredData = animals.filter((animal) => {
    const birth = getBirthByAnimalId(animal.id);
    const breedMatch = birth?.breed
      ? birth.breed.toLowerCase().includes(searchValue.toLowerCase())
      : false;
    const matchesSearch =
      animal.registrationNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      animal.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      breedMatch;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && animal.status === "active") ||
      (activeFilter === "inactive" && animal.status === "inactive");

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

  const columns: TableColumn<Animal>[] = [
    {
      key: "code",
      label: t.animals.table.registration,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.code}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            {row.registrationNumber}
          </p>
        </div>
      ),
    },
    {
      key: "breed",
      label: t.animals.table.breed,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth || !birth.breed) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {t.animals.breeds[birth.breed] || birth.breed}
          </span>
        );
      },
    },
    {
      key: "purity",
      label: t.animals.table.purity,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth || !birth.purity) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">{t.animals.purity[birth.purity]}</span>
        );
      },
    },
    {
      key: "gender",
      label: t.animals.table.gender,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth || !birth.gender) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {birth.gender ? t.animals.gender[birth.gender] : "-"}
          </span>
        );
      },
    },
    {
      key: "birthDate",
      label: t.animals.table.birthDate,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth || !birth.birthDate) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const birthDate = new Date(birth.birthDate);
        const today = new Date();
        const months = differenceInMonths(today, birthDate);
        const formattedDate = format(birthDate, "dd/MM/yyyy", { locale: ptBR });

        return (
          <Tooltip content={formattedDate}>
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {months} {months === 1 ? t.common.month : t.common.months}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "acquisitionDate",
      label: t.animals.table.acquisitionDate,
      sortable: true,
      render: (_, row) => {
        if (!row.acquisitionDate) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const acquisitionDate = new Date(row.acquisitionDate);
        const today = new Date();
        const months = differenceInMonths(today, acquisitionDate);
        const formattedDate = format(acquisitionDate, "dd/MM/yyyy", { locale: ptBR });

        return (
          <Tooltip content={formattedDate}>
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {months} {months === 1 ? t.common.month : t.common.months}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "weight",
      label: t.animals.table.weight,
      sortable: true,
      render: (_, row) => {
        const weighings = getWeighingsByAnimalId(row.id);
        const lastWeighing = weighings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {lastWeighing ? `${lastWeighing.weight}` : "-"}
          </span>
        );
      },
    },
    {
      key: "weightInArrobas",
      label: t.animals.table.weightInArrobas,
      sortable: true,
      render: (_, row) => {
        const weighings = getWeighingsByAnimalId(row.id);
        const lastWeighing = weighings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        const weightInArrobas = lastWeighing ? (lastWeighing.weight / 30).toFixed(2) : null;
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {weightInArrobas ? `${weightInArrobas}` : "-"}
          </span>
        );
      },
    },
    {
      key: "lastWeighingDate",
      label: t.animals.table.lastWeighingDate,
      sortable: true,
      render: (_, row) => {
        const weighings = getWeighingsByAnimalId(row.id);
        const lastWeighing = weighings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        if (!lastWeighing) return <span className="text-gray-700 dark:text-gray-300">-</span>;

        const formattedDate = format(new Date(lastWeighing.date), "dd/MM/yyyy", { locale: ptBR });
        const today = new Date();
        const weighingDate = new Date(lastWeighing.date);
        const daysAgo = differenceInDays(today, weighingDate);
        const tooltipText =
          daysAgo === 0 ? "Hoje" : daysAgo === 1 ? "Há 1 dia" : `Há ${daysAgo} dias`;

        return (
          <Tooltip content={tooltipText}>
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {formattedDate}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "gmd",
      label: (
        <Tooltip content={t.common.dailyAverageGain}>
          <span className="border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-help">
            {t.animals.table.gmd}
          </span>
        </Tooltip>
      ),
      sortable: true,
      render: (_, row) => {
        const weighings = getWeighingsByAnimalId(row.id);
        const sortedWeighings = weighings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        if (sortedWeighings.length < 2) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const lastWeighing = sortedWeighings[0];
        const previousWeighing = sortedWeighings[1];

        const weightDifference = lastWeighing.weight - previousWeighing.weight;
        const daysDifference = differenceInDays(
          new Date(lastWeighing.date),
          new Date(previousWeighing.date)
        );

        if (daysDifference === 0) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const gpd = (weightDifference / daysDifference).toFixed(2);
        return <span className="text-gray-700 dark:text-gray-300">{gpd}</span>;
      },
    },
    {
      key: "properties",
      label: t.animals.table.properties,
      sortable: false,
      render: (_, row) => {
        const property = getPropertyById(row.propertyId);
        return (
          <span className="text-gray-700 dark:text-gray-300">{property ? property.name : "-"}</span>
        );
      },
    },
    {
      key: "status",
      label: t.animals.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.status === "active" ? t.animals.table.active : t.animals.table.inactive}
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
          onEdit={() => navigate(getAnimalEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.animals.addAnimal,
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
      onClick: () => setIsAnimalRegistrationModalOpen(true),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.animals.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.animals.filters.active,
      value: "active",
      active: activeFilter === "active",
      onClick: () => setActiveFilter("active"),
    },
    {
      label: t.animals.filters.inactive,
      value: "inactive",
      active: activeFilter === "inactive",
      onClick: () => setActiveFilter("inactive"),
    },
  ];

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  const selectedCount = selectedAnimals.size;
  const selectedAnimalIds = Array.from(selectedAnimals);

  return (
    <div>
      <Table<Animal>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.animals.title,
          badge: {
            label: t.animals.badge.animals(filteredData.length),
            variant: "primary",
          },
          description: t.animals.description,
          actions: headerActions,
        }}
        filters={filters}
        selectedCountLabel={selectedCount > 0 ? t.animals.badge.selected(selectedCount) : undefined}
        selectedActionButton={
          selectedCount > 0 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const route = getAnimalMovementNewRoute(selectedAnimalIds);
                navigate(route.pathname, { state: route.state });
              }}
              leftIcon={
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
                    d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>
              }
            >
              {t.animals.movement.addButton}
            </Button>
          ) : undefined
        }
        search={{
          placeholder: t.animals.searchPlaceholder,
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
        onRowClick={(row) => navigate(getAnimalViewRoute(row.id))}
        selectable={{
          selectedRows: selectedAnimals,
          onSelectionChange: (newSelection) => {
            const stringSet = new Set<string>();
            newSelection.forEach((id) => {
              if (typeof id === "string") {
                stringSet.add(id);
              }
            });
            setSelectedAnimals(stringSet);
          },
          getRowId: (row) => row.id,
          allData: filteredData,
        }}
        emptyState={{
          title: t.animals.emptyState.title,
          description: searchValue
            ? t.animals.emptyState.descriptionWithSearch(searchValue)
            : t.animals.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => setIsAnimalRegistrationModalOpen(true),
          addNewLabel: t.animals.addAnimal,
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
          setSelectedAnimal(null);
        }}
        onConfirm={handleDeleteAnimal}
        title={t.animals.deleteModal.title}
        message={t.animals.deleteModal.message(selectedAnimal?.registrationNumber || "")}
        confirmLabel={t.animals.deleteModal.confirm}
        cancelLabel={t.animals.deleteModal.cancel}
        variant="danger"
      />

      <AnimalRegistrationModal
        isOpen={isAnimalRegistrationModalOpen}
        onClose={() => setIsAnimalRegistrationModalOpen(false)}
        onSelectBirth={() => navigate(ROUTES.BIRTHS_NEW)}
        onSelectAcquisition={() => navigate(ROUTES.ACQUISITIONS_NEW)}
      />
    </div>
  );
}
