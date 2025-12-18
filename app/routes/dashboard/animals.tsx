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
  Select,
  type TableColumn,
  type TableAction,
  type TableFilter,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { useAuth } from "~/contexts/auth-context";
import { deleteAnimal, getAnimalsByCompanyId } from "~/services/animals.service";
import { getAnimalsByLastMovementLocation } from "~/services/animal-movements.service";
import { getBirthsByCompanyId } from "~/services/births.service";
import { getAcquisitionsByCompanyId } from "~/services/acquisitions.service";
import { getWeighingsByCompanyId } from "~/services/weighings.service";
import { getBreedingsByCompanyId } from "~/services/breedings.service";
import { getProperties } from "~/services/properties.service";
import { getLocations } from "~/services/locations.service";
import type { Animal, Birth, Location } from "~/types";
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
  const { canAdd, canEdit, canRemove, canView } = usePermissions();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const canViewBirths = canView("records", "births");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [births, setBirths] = useState<Birth[]>([]);
  const [properties, setProperties] = useState<Awaited<ReturnType<typeof getProperties>>>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [animalIdsInSelectedLocation, setAnimalIdsInSelectedLocation] = useState<Set<string>>(
    new Set()
  );
  const [acquisitions, setAcquisitions] = useState<
    Awaited<ReturnType<typeof getAcquisitionsByCompanyId>>
  >([]);
  const [weighings, setWeighings] = useState<Awaited<ReturnType<typeof getWeighingsByCompanyId>>>(
    []
  );
  const [breedings, setBreedings] = useState<Awaited<ReturnType<typeof getBreedingsByCompanyId>>>(
    []
  );
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
        const [
          animalsData,
          birthsData,
          propertiesData,
          acquisitionsData,
          weighingsData,
          locationsData,
          breedingsData,
        ] = await Promise.all([
          getAnimalsByCompanyId(companyId),
          canViewBirths ? getBirthsByCompanyId(companyId) : Promise.resolve(undefined),
          getProperties(),
          getAcquisitionsByCompanyId(companyId),
          getWeighingsByCompanyId(companyId),
          getLocations(),
          getBreedingsByCompanyId(companyId),
        ]);
        setAnimals(animalsData || []);
        setBirths(birthsData || []);
        setProperties(propertiesData || []);
        setAcquisitions(acquisitionsData || []);
        setWeighings(weighingsData || []);
        setLocations((locationsData || []).filter((l) => l.companyId === companyId));
        setBreedings(breedingsData || []);

        // If the user should be able to view births but the API didn't return any,
        // show a helpful message (commonly caused by missing backend permissions).
        if (canViewBirths && birthsData === undefined) {
          showAlert(
            "Não foi possível carregar dados de nascimentos para completar a tabela",
            "warning"
          );
        }
      } catch (error) {
        console.error("Failed to load animals:", error);
        showAlert("Erro ao carregar animais", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [companyId, canViewBirths, showAlert]);

  useEffect(() => {
    let cancelled = false;
    const loadLocationAnimalIds = async () => {
      if (selectedLocationId === "all") {
        setAnimalIdsInSelectedLocation(new Set());
        return;
      }
      try {
        const ids = await getAnimalsByLastMovementLocation(selectedLocationId);
        if (cancelled) return;
        setAnimalIdsInSelectedLocation(new Set(ids));
      } catch (error) {
        console.error("Failed to load animals by location:", error);
        if (cancelled) return;
        setAnimalIdsInSelectedLocation(new Set());
      }
    };
    void loadLocationAnimalIds();
    return () => {
      cancelled = true;
    };
  }, [selectedLocationId]);

  // Create a map of births by animal ID for quick lookup
  const birthsByAnimalId = useMemo(() => {
    const map = new Map<string, Birth>();
    for (const birth of births) {
      map.set(birth.animalId, birth);
    }
    return map;
  }, [births]);

  const propertiesById = useMemo(() => {
    const map = new Map<string, (typeof properties)[number]>();
    for (const p of properties) {
      map.set(p.id, p);
    }
    return map;
  }, [properties]);

  const acquisitionItemsByAnimalId = useMemo(() => {
    const map = new Map<string, (typeof acquisitions)[number]["acquisitionItems"][number]>();
    for (const acq of acquisitions) {
      for (const item of acq.acquisitionItems || []) {
        if (item?.animalId) {
          map.set(item.animalId, item);
        }
      }
    }
    return map;
  }, [acquisitions]);

  const acquisitionDateByAnimalId = useMemo(() => {
    const map = new Map<string, string>();
    for (const acq of acquisitions) {
      for (const item of acq.acquisitionItems || []) {
        if (item?.animalId) {
          map.set(item.animalId, acq.acquisitionDate);
        }
      }
    }
    return map;
  }, [acquisitions]);

  const weighingsByAnimalId = useMemo(() => {
    const map = new Map<string, typeof weighings>();
    for (const w of weighings) {
      const existing = map.get(w.animalId) || [];
      existing.push(w);
      map.set(w.animalId, existing);
    }
    return map;
  }, [weighings]);

  const breedingsByAnimalId = useMemo(() => {
    const map = new Map<string, typeof breedings>();
    for (const b of breedings) {
      const existing = map.get(b.animalId) || [];
      existing.push(b);
      map.set(b.animalId, existing);
    }
    return map;
  }, [breedings]);

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

  const filteredAnimalsByLocation = useMemo(() => {
    if (selectedLocationId === "all") return animals;
    return animals.filter((a) => animalIdsInSelectedLocation.has(a.id));
  }, [animals, selectedLocationId, animalIdsInSelectedLocation]);

  const listPage = useListPage({
    data: filteredAnimalsByLocation,
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
      acquisitionItemsMap: acquisitionItemsByAnimalId,
      acquisitionDateByAnimalId,
      weighingsMap: weighingsByAnimalId,
      breedingsMap: breedingsByAnimalId,
      propertiesMap: propertiesById,
      TooltipComponent: Tooltip,
      StatusBadgeComponent: StatusBadge,
      navigate: (path: string) => {
        navigate(path);
      },
      handleDeleteAnimalClick: deleteHandler.handleDeleteClick,
      canEdit,
      canRemove,
      includeProperties: canViewBirths,
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
  }, [
    t,
    language,
    dateLocale,
    navigate,
    canEdit,
    canRemove,
    deleteHandler,
    birthsByAnimalId,
    acquisitionItemsByAnimalId,
    acquisitionDateByAnimalId,
    weighingsByAnimalId,
    breedingsByAnimalId,
    propertiesById,
    canViewBirths,
  ]);

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
        rightContent={
          <div className="w-72">
            <Select
              label="Localização"
              value={selectedLocationId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setSelectedLocationId(e.target.value);
                listPage.clearSearch();
              }}
              options={[
                { value: "all", label: "Todas" },
                ...locations.map((l) => ({ value: l.id, label: `${l.name} (${l.code})` })),
              ]}
            />
          </div>
        }
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
