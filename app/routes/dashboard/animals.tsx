import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
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
import { useAuth } from "~/contexts/auth-context";
import { deleteAnimal, getAnimalsByCompanyId } from "~/services/animals.service";
import { getBirthsByCompanyId } from "~/services/births.service";
import type { Animal, Birth } from "~/types";
import { ROUTES, getAnimalViewRoute, getAnimalMovementNewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { createRegistrationMeta, createRegistrationLoader } from "~/utils/route-helpers";
import { useAlert } from "~/hooks/use-alert";
import { useDeleteHandler } from "~/hooks/use-delete-handler";
import { useListPage } from "~/hooks/use-list-page";
import { useDateLocale } from "~/hooks/use-date-locale";
import { createAnimalTableColumnsWithConfig } from "~/utils/animal-table-config";

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
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [births, setBirths] = useState<Birth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimalRegistrationModalOpen, setIsAnimalRegistrationModalOpen] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const { alertMessage, showAlert } = useAlert();

  // Load animals and births from API
  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return;
      setIsLoading(true);
      try {
        const [animalsData, birthsData] = await Promise.all([
          getAnimalsByCompanyId(companyId),
          getBirthsByCompanyId(companyId),
        ]);
        setAnimals(animalsData || []);
        setBirths(birthsData || []);
      } catch (error) {
        console.error("Failed to load animals:", error);
        showAlert("Erro ao carregar animais", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [companyId, showAlert]);

  // Create a map of births by animal ID for quick lookup
  const birthsByAnimalId = useMemo(() => {
    const map = new Map<string, Birth>();
    for (const birth of births) {
      map.set(birth.animalId, birth);
    }
    return map;
  }, [births]);

  const getBirthByAnimalId = (animalId: string): Birth | undefined => {
    return birthsByAnimalId.get(animalId);
  };

  const deleteHandler = useDeleteHandler({
    onDelete: async (animal: Animal) => {
      try {
        await deleteAnimal(animal.id);
        setAnimals(animals.filter((a) => a.id !== animal.id));
        return true;
      } catch (error) {
        console.error("Error deleting animal:", error);
        return false;
      }
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
    return createAnimalTableColumnsWithConfig({
      t,
      language,
      dateLocale,
      birthsMap: birthsByAnimalId,
      TooltipComponent: Tooltip,
      StatusBadgeComponent: StatusBadge,
      navigate: (path: string) => {
        navigate(path);
      },
      handleDeleteAnimalClick: deleteHandler.handleDeleteClick,
      canEdit,
      canRemove,
      includeProperties: true,
      includeActions: true,
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
  }, [t, language, dateLocale, navigate, canEdit, canRemove, deleteHandler, birthsByAnimalId]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading || "Carregando..."}</p>
        </div>
      </div>
    );
  }

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
