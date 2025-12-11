import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  Button,
  FixedAlert,
  ConfirmationModal,
  type TableColumn,
  type TableAction,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { translations } from "~/i18n/translations";
import { mockCompanies } from "~/mocks/companies";
import {
  getUnconfirmedBreedings,
  confirmBreeding,
  deleteBreeding,
  enrichBreedingWithAnimalData,
} from "~/services/breedings.service";
import { useListPage } from "~/hooks/use-list-page";
import { useAlert } from "~/hooks/use-alert";
import { PropertyFilterDropdown } from "~/components/dashboard/breedings/property-filter-dropdown";
import { AnimalCodeDisplay } from "~/components/dashboard/breedings/animal-code-display";
import { BreedingMethodBadge } from "~/components/dashboard/breedings/breeding-method-badge";
import { formatBreedingDate } from "~/utils/breeding";
import { getProperties } from "~/services/properties.service";
import type { Property } from "~/types";
import { getAnimalViewRoute } from "~/routes.config";
import { getStringValue } from "~/utils/string-helpers";

export function meta() {
  const t = translations.pt;
  return [
    { title: t.breedings.meta.unconfirmed.title },
    {
      name: "description",
      content: t.breedings.meta.unconfirmed.description,
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function UnconfirmedBreedings() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const { showAlert, alertMessage } = useAlert();

  useEffect(() => {
    const fetchProperties = async () => {
      if (company) {
        try {
          const propertiesData = await getProperties();
          setProperties(propertiesData.filter((prop) => prop.companyId === company.id));
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      }
    };
    fetchProperties();
  }, [company]);

  const unconfirmedBreedings = getUnconfirmedBreedings(companyId);
  const propertiesMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const [enrichedBreedings, setEnrichedBreedings] = useState<
    Awaited<ReturnType<typeof enrichBreedingWithAnimalData>>[]
  >([]);

  useEffect(() => {
    const loadEnrichedBreedings = async () => {
      const enriched = await Promise.all(
        unconfirmedBreedings.map(async (breeding) => {
          const enriched = await enrichBreedingWithAnimalData(breeding);
          // Add property from map if available
          if (enriched.animal?.propertyId) {
            enriched.property = propertiesMap.get(enriched.animal.propertyId);
          }
          return enriched;
        })
      );
      setEnrichedBreedings(enriched);
    };
    loadEnrichedBreedings();
  }, [unconfirmedBreedings, propertiesMap]);

  type EnrichedBreeding = (typeof enrichedBreedings)[0];
  const [selectedBreeding, setSelectedBreeding] = useState<EnrichedBreeding | null>(null);

  const searchFields: Array<keyof EnrichedBreeding | ((item: EnrichedBreeding) => string)> = [
    (breeding) => breeding.animal?.code || "",
    (breeding) => breeding.animal?.registrationNumber || "",
    (breeding) => breeding.bull?.code || "",
    (breeding) => breeding.semenCode || "",
  ];

  const checkBreedingFieldMatch = (
    field: keyof EnrichedBreeding | ((item: EnrichedBreeding) => string),
    breeding: EnrichedBreeding,
    searchValue: string
  ): boolean => {
    if (typeof field === "function") {
      return field(breeding).toLowerCase().includes(searchValue.toLowerCase());
    }
    const value = breeding[field];
    if (!value) return false;
    return getStringValue(value).toLowerCase().includes(searchValue.toLowerCase());
  };

  const listPage = useListPage({
    data: enrichedBreedings,
    itemsPerPage: 10,
    initialSortColumn: "date",
    initialSortDirection: "desc",
    language,
    searchFields,
    customFilter: (breeding, searchValue, activeFilter) => {
      const matchesSearch = searchFields.some((field) =>
        checkBreedingFieldMatch(field, breeding, searchValue)
      );
      const matchesFilter = activeFilter === "all" || breeding.animal?.propertyId === activeFilter;
      return matchesSearch && matchesFilter;
    },
    dateFields: ["date"],
  });

  const handleConfirm = (breeding: EnrichedBreeding) => {
    setSelectedBreeding(breeding);
    setConfirmModalOpen(true);
  };

  const handleDelete = (breeding: EnrichedBreeding) => {
    setSelectedBreeding(breeding);
    setDeleteModalOpen(true);
  };

  const handleConfirmBreeding = async () => {
    if (!selectedBreeding) return;

    try {
      const success = confirmBreeding(selectedBreeding.id);
      if (success) {
        showAlert(t.breedings.unconfirmed.confirmSuccess, "success");
        setConfirmModalOpen(false);
        setSelectedBreeding(null);
      } else {
        showAlert(t.breedings.unconfirmed.confirmError, "error");
      }
    } catch (error) {
      console.error("Error confirming breeding:", error);
      showAlert(t.breedings.unconfirmed.confirmError, "error");
    }
  };

  const handleDeleteBreeding = async () => {
    if (!selectedBreeding) return;

    try {
      const success = deleteBreeding(selectedBreeding.id);
      if (success) {
        showAlert(t.breedings.unconfirmed.deleteSuccess, "success");
        setDeleteModalOpen(false);
        setSelectedBreeding(null);
      } else {
        showAlert(t.breedings.unconfirmed.deleteError, "error");
      }
    } catch (error) {
      console.error("Error deleting breeding:", error);
      showAlert(t.breedings.unconfirmed.deleteError, "error");
    }
  };

  const columns: TableColumn<(typeof enrichedBreedings)[0]>[] = [
    {
      key: "animalCode",
      label: t.breedings.unconfirmed.table.animal,
      sortable: true,
      render: (_, row) => {
        if (!row.animal) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return <AnimalCodeDisplay animal={row.animal} />;
      },
    },
    {
      key: "property",
      label: t.animals.table.properties,
      sortable: false,
      render: (_, row) => {
        return (
          <span className="text-gray-700 dark:text-gray-300">{row.property?.name || "-"}</span>
        );
      },
    },
    {
      key: "date",
      label: t.breedings.unconfirmed.table.date,
      sortable: true,
      render: (_, row) => {
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {formatBreedingDate(row.date, language)}
          </span>
        );
      },
    },
    {
      key: "method",
      label: t.breedings.unconfirmed.table.method,
      sortable: true,
      render: (_, row) => {
        return <BreedingMethodBadge method={row.method} />;
      },
    },
    {
      key: "details",
      label: t.breedings.unconfirmed.table.details,
      sortable: false,
      render: (_, row) => {
        if (row.method === "natural" && row.bull) {
          return <span className="text-gray-700 dark:text-gray-300">{row.bull.code}</span>;
        } else if (row.method === "artificial_insemination") {
          return (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {row.attemptNumber && (
                <div>
                  {t.breedings.new.attemptNumberLabel}: {row.attemptNumber}
                </div>
              )}
              {row.semenCode && (
                <div>
                  {t.breedings.new.semenCodeLabel}: {row.semenCode}
                </div>
              )}
            </div>
          );
        }
        return <span className="text-gray-700 dark:text-gray-300">-</span>;
      },
    },
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm(row);
            }}
          >
            {t.breedings.unconfirmed.confirmButton}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            {t.breedings.unconfirmed.discardButton}
          </Button>
        </div>
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.breedings.unconfirmed.confirmAll,
      variant: "primary",
      onClick: () => {
        const promises = listPage.paginatedData.map((breeding) =>
          Promise.resolve(confirmBreeding(breeding.id))
        );
        Promise.all(promises)
          .then(() => {
            showAlert(t.breedings.unconfirmed.confirmAllSuccess, "success");
          })
          .catch(() => {
            showAlert(t.breedings.unconfirmed.confirmAllError, "error");
          });
      },
    },
  ];

  return (
    <div>
      <FixedAlert alertMessage={alertMessage} />

      <Table<(typeof enrichedBreedings)[0]>
        columns={columns}
        data={listPage.paginatedData}
        header={{
          title: t.breedings.unconfirmed.title,
          badge: {
            label: t.breedings.unconfirmed.badge.breedings(listPage.filteredData.length),
            variant: "warning",
          },
          description: t.breedings.unconfirmed.description,
          actions: headerActions,
        }}
        search={{
          placeholder: t.breedings.unconfirmed.searchPlaceholder,
          value: listPage.searchValue,
          onChange: listPage.setSearchValue,
        }}
        rightContent={
          <PropertyFilterDropdown
            value={listPage.activeFilter}
            onChange={(value) => {
              listPage.setActiveFilter(value);
            }}
            properties={properties}
          />
        }
        pagination={{
          currentPage: listPage.currentPage,
          totalPages: listPage.totalPages || 1,
          onPageChange: listPage.setCurrentPage,
          showInfo: false,
        }}
        sortState={listPage.sortState}
        onSort={listPage.handleSort}
        onRowClick={(row) => row.animal && navigate(getAnimalViewRoute(row.animal.id))}
        emptyState={{
          title: t.breedings.unconfirmed.emptyState.title,
          description: listPage.searchValue
            ? t.breedings.unconfirmed.emptyState.descriptionWithSearch(listPage.searchValue)
            : t.breedings.unconfirmed.emptyState.description,
          onClearSearch: listPage.clearSearch,
          clearSearchLabel: t.common.clearSearch,
        }}
      />

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedBreeding(null);
        }}
        onConfirm={handleConfirmBreeding}
        title={t.breedings.unconfirmed.confirmModal.title}
        message={
          selectedBreeding && selectedBreeding.animal?.code
            ? t.breedings.unconfirmed.confirmModal.message(selectedBreeding.animal.code)
            : ""
        }
        confirmLabel={t.breedings.unconfirmed.confirmModal.confirm}
        cancelLabel={t.breedings.unconfirmed.confirmModal.cancel}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBreeding(null);
        }}
        onConfirm={handleDeleteBreeding}
        title={t.breedings.unconfirmed.deleteModal.title}
        message={
          selectedBreeding && selectedBreeding.animal?.code
            ? t.breedings.unconfirmed.deleteModal.message(selectedBreeding.animal.code)
            : ""
        }
        confirmLabel={t.breedings.unconfirmed.deleteModal.confirm}
        cancelLabel={t.breedings.unconfirmed.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
