import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { differenceInMonths, differenceInDays } from "date-fns";
import {
  TableActionButtons,
  AnimalRegistrationModal,
  Tooltip,
  Button,
  type TableColumn,
  type TableAction,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockAnimals } from "~/mocks/animals";
import { deleteAnimal } from "~/services/animals.service";
import type { Animal } from "~/types";
import { getPropertyById } from "~/services/properties.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getBreedingsByAnimalId } from "~/services/breedings.service";
import {
  ROUTES,
  getAnimalEditRoute,
  getAnimalViewRoute,
  getAnimalMovementNewRoute,
} from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { formatDate } from "~/utils/formatting";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";
import { useAlert } from "~/hooks/use-alert";
import { useDeleteHandler } from "~/hooks/use-delete-handler";
import { useListPage } from "~/hooks/use-list-page";
import { Table, StatusBadge, ConfirmationModal, Alert, type TableFilter } from "~/components/ui";

export function meta() {
  return createRegistrationMeta("Animais", "Gerenciamento de animais do Boi na Nuvem");
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function Animals() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const [animals, setAnimals] = useState<Animal[]>([...mockAnimals]);
  const [isAnimalRegistrationModalOpen, setIsAnimalRegistrationModalOpen] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const { alertMessage, showAlert } = useAlert();

  const deleteHandler = useDeleteHandler({
    onDelete: (animal: Animal) => {
      const success = deleteAnimal(animal.id);
      if (success) {
        setAnimals(animals.filter((a) => a.id !== animal.id));
      }
      return success;
    },
    showAlert,
    successMessage: t.animals.success.deleted,
    errorMessage: t.animals.errors.deleteFailed,
    onSuccess: (animal) => {
      setAnimals(animals.filter((a) => a.id !== animal.id));
    },
  });

  const listPage = useListPage({
    data: animals,
    itemsPerPage: 10,
    initialSortColumn: "code",
    initialSortDirection: "asc",
    language,
    searchFields: [
      "code",
      "registrationNumber",
      (animal) => {
        const birth = getBirthByAnimalId(animal.id);
        return birth?.breed || "";
      },
    ],
    customFilter: (animal, searchValue, activeFilter) => {
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
        (activeFilter === "inactive" && animal.status === "inactive") ||
        (activeFilter === "sold" && animal.status === "sold");

      return matchesSearch && matchesFilter;
    },
  });

  const columns: TableColumn<Animal>[] = useMemo(() => {
    return [
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
            <span className="text-gray-700 dark:text-gray-300">
              {t.animals.purity[birth.purity]}
            </span>
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
          const formattedDate = formatDate(birthDate, language);

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
          const formattedDate = formatDate(acquisitionDate, language);

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

          const formattedDate = formatDate(new Date(lastWeighing.date), language);
          const today = new Date();
          const weighingDate = new Date(lastWeighing.date);
          const daysAgo = differenceInDays(today, weighingDate);
          const tooltipText = t.common.daysAgo(daysAgo);

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
          <Tooltip content={t.common.dailyAverageGain} position="bottom">
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
            <span className="text-gray-700 dark:text-gray-300">
              {property ? property.name : "-"}
            </span>
          );
        },
      },
      {
        key: "breedingStatus",
        label: t.animals.table.breedingStatus,
        sortable: false,
        render: (_, row) => {
          const birth = getBirthByAnimalId(row.id);
          if (!birth || birth.gender !== "female") {
            return <span className="text-gray-700 dark:text-gray-300">-</span>;
          }
          const breedings = getBreedingsByAnimalId(row.id);
          if (breedings.length === 0) {
            return <span className="text-gray-700 dark:text-gray-300">-</span>;
          }
          const hasConfirmed = breedings.some((b) => b.confirmed === true);

          if (hasConfirmed) {
            return <StatusBadge label={t.animals.table.breedingStatusPregnant} variant="success" />;
          } else {
            return <StatusBadge label={t.animals.table.breedingStatusPregnant} variant="warning" />;
          }
        },
      },
      {
        key: "status",
        label: t.animals.table.status,
        sortable: true,
        render: (_, row) => {
          let label: string = t.animals.table.active;
          let variant: "success" | "default" | "warning" = "success";
          if (row.status === "inactive") {
            label = t.animals.table.inactive;
            variant = "default";
          } else if (row.status === "sold") {
            label = t.animals.table.sold || "Vendido";
            variant = "warning";
          }
          return <StatusBadge label={label} variant={variant} />;
        },
      },
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => navigate(getAnimalEditRoute(row.id))}
            onDelete={() => deleteHandler.handleDeleteClick(row)}
            canEdit={canEdit("registration", "animals")}
            canDelete={canRemove("registration", "animals")}
          />
        ),
      },
    ];
  }, [t, language, navigate, canEdit, canRemove, deleteHandler]);

  const headerActions: TableAction[] = canAdd("registration", "animals")
    ? [
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
      ]
    : [];

  const filterOptions = useMemo(
    () => [
      { label: t.animals.filters.all, value: "all" },
      { label: t.animals.filters.active, value: "active" },
      { label: t.animals.filters.inactive, value: "inactive" },
      { label: t.animals.filters.sold || "Vendidos", value: "sold" },
    ],
    [t]
  );

  const filters: TableFilter[] = useMemo(
    () =>
      filterOptions.map((filter) => ({
        ...filter,
        active: listPage.activeFilter === filter.value,
        onClick: () => listPage.setActiveFilter(filter.value),
      })),
    [filterOptions, listPage]
  );

  const selectedCount = selectedAnimals.size;
  const selectedAnimalIds = Array.from(selectedAnimals);

  return (
    <div>
      <Table<Animal>
        columns={columns}
        data={listPage.paginatedData}
        header={{
          title: t.animals.title,
          badge: {
            label: t.animals.badge.animals(listPage.filteredData.length),
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
          value: listPage.searchValue,
          onChange: listPage.setSearchValue,
        }}
        pagination={{
          currentPage: listPage.currentPage,
          totalPages: listPage.totalPages || 1,
          onPageChange: listPage.setCurrentPage,
          showInfo: false,
        }}
        sortState={listPage.sortState}
        onSort={listPage.handleSort}
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
          allData: listPage.filteredData,
        }}
        emptyState={{
          title: t.animals.emptyState.title,
          description: listPage.searchValue
            ? t.animals.emptyState.descriptionWithSearch(listPage.searchValue)
            : t.animals.emptyState.descriptionWithoutSearch,
          onClearSearch: listPage.clearSearch,
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
        isOpen={deleteHandler.isDeleteModalOpen}
        onClose={deleteHandler.handleCloseModal}
        onConfirm={deleteHandler.handleDelete}
        title={t.animals.deleteModal.title}
        message={t.animals.deleteModal.message(
          (deleteHandler.selectedItem as Animal | null)?.registrationNumber || ""
        )}
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
