import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  TableActionButtons,
  AnimalRegistrationModal,
  Tooltip,
  Button,
  Table,
  StatusBadge,
  ConfirmationModal,
  FixedAlert,
  type TableColumn,
  type TableAction,
  type TableFilter,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockAnimals } from "~/mocks/animals";
import { deleteAnimal } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import type { Animal } from "~/types";
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
import { useDateLocale } from "~/hooks/use-date-locale";
import { createAnimalTableColumns } from "~/utils/animal-table-columns";

export function meta() {
  return createRegistrationMeta("Animais", "Gerenciamento de animais do Boi na Nuvem");
}

export async function loader({ request }: { request: Request }) {
  return createRegistrationLoader(undefined, "view")({ request });
}

export default function Animals() {
  const t = useTranslation();
  const { language } = useLanguage();
  const dateLocale = useDateLocale();
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
    return createAnimalTableColumns({
      language,
      dateLocale,
      translations: {
        table: {
          registration: t.animals.table.registration,
          breed: t.animals.table.breed,
          purity: t.animals.table.purity,
          gender: t.animals.table.gender,
          birthDate: t.animals.table.birthDate,
          acquisitionDate: t.animals.table.acquisitionDate,
          weight: t.animals.table.weight,
          weightInArrobas: t.animals.table.weightInArrobas,
          lastWeighingDate: t.animals.table.lastWeighingDate,
          gmd: t.animals.table.gmd,
          properties: t.animals.table.properties,
          breedingStatus: t.animals.table.breedingStatus,
          breedingStatusPregnant: t.animals.table.breedingStatusPregnant,
          status: t.animals.table.status,
          active: t.animals.table.active,
          inactive: t.animals.table.inactive,
          sold: t.animals.table.sold,
        },
        breeds: t.animals.breeds,
        purity: t.animals.purity,
        gender: t.animals.gender,
        common: {
          month: t.common.month,
          months: t.common.months,
          daysAgo: t.common.daysAgo,
          dailyAverageGain: t.common.dailyAverageGain,
        },
      },
      formatDateFn: formatDate,
      TooltipComponent: Tooltip as React.ComponentType<{
        content: string;
        position?: string;
        children: React.ReactNode;
      }>,
      StatusBadgeComponent: StatusBadge,
      includeProperties: true,
      includeActions: true,
      actionsColumn: {
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
      onStatusRender: (animal) => {
        let label: string = t.animals.table.active;
        let variant: "success" | "default" | "warning" = "success";
        if (animal.status === "inactive") {
          label = t.animals.table.inactive;
          variant = "default";
        } else if (animal.status === "sold") {
          label = t.animals.table.sold || "Vendido";
          variant = "warning";
        }
        return { label, variant };
      },
    });
  }, [t, language, dateLocale, navigate, canEdit, canRemove, deleteHandler]);

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
            for (const id of newSelection) {
              if (typeof id === "string") {
                stringSet.add(id);
              }
            }
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

      <FixedAlert alertMessage={alertMessage} />

      <ConfirmationModal
        isOpen={deleteHandler.isDeleteModalOpen}
        onClose={deleteHandler.handleCloseModal}
        onConfirm={deleteHandler.handleDelete}
        title={t.animals.deleteModal.title}
        message={t.animals.deleteModal.message(
          deleteHandler.selectedItem?.registrationNumber || ""
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
