import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import {
  Table,
  Button,
  Alert,
  ConfirmationModal,
  type TableColumn,
  type SortDirection,
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
} from "~/services/breedings.service";
import { getAnimalById } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getPropertyById } from "~/services/properties.service";
import { getAnimalViewRoute } from "~/routes.config";

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

export default function UnconfirmedBreedings() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const dateLocale = useMemo(() => {
    switch (language) {
      case "en":
        return enUS;
      case "es":
        return es;
      default:
        return ptBR;
    }
  }, [language]);

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [_refreshKey, setRefreshKey] = useState(0);

  const unconfirmedBreedings = useMemo(() => getUnconfirmedBreedings(companyId), [companyId]);

  const enrichedBreedings = useMemo(() => {
    return unconfirmedBreedings.map((breeding) => {
      const animal = getAnimalById(breeding.animalId);
      const birth = getBirthByAnimalId(breeding.animalId);
      const property = animal ? getPropertyById(animal.propertyId) : null;
      const bull = breeding.bullId ? getAnimalById(breeding.bullId) : null;

      return {
        ...breeding,
        animal,
        property,
        bull,
        breed: birth?.breed,
      };
    });
  }, [unconfirmedBreedings]);

  type EnrichedBreeding = (typeof enrichedBreedings)[0];
  const [selectedBreeding, setSelectedBreeding] = useState<EnrichedBreeding | null>(null);

  const filteredData = useMemo(() => {
    let filtered = enrichedBreedings;

    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (breeding) =>
          breeding.animal?.code.toLowerCase().includes(searchLower) ||
          breeding.animal?.registrationNumber.toLowerCase().includes(searchLower) ||
          breeding.bull?.code.toLowerCase().includes(searchLower) ||
          breeding.semenCode?.toLowerCase().includes(searchLower)
      );
    }

    if (sortState.column) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        switch (sortState.column) {
          case "date":
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case "animalCode":
            aValue = a.animal?.code || "";
            bValue = b.animal?.code || "";
            break;
          case "method":
            aValue = a.method;
            bValue = b.method;
            break;
          default:
            return 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortState.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortState.direction === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return filtered;
  }, [enrichedBreedings, searchValue, sortState]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

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

        setRefreshKey((prev) => prev + 1);
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

        setRefreshKey((prev) => prev + 1);
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
        return (
          <div>
            <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.animal.code}</h2>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              {row.animal.registrationNumber}
            </p>
          </div>
        );
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
        const date = new Date(row.date);
        const formattedDate = format(date, "dd/MM/yyyy", { locale: dateLocale });
        return <span className="text-gray-700 dark:text-gray-300">{formattedDate}</span>;
      },
    },
    {
      key: "method",
      label: t.breedings.unconfirmed.table.method,
      sortable: true,
      render: (_, row) => {
        const methodLabel =
          row.method === "natural" ? t.breedings.new.methodNatural : t.breedings.new.methodAI;
        return <span className="text-gray-700 dark:text-gray-300">{methodLabel}</span>;
      },
    },
    {
      key: "details",
      label: t.breedings.unconfirmed.table.details,
      sortable: false,
      render: (_, row) => {
        if (row.method === "natural" && row.bull) {
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {t.breedings.unconfirmed.table.bull}: {row.bull.code}
            </span>
          );
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

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  const headerActions: TableAction[] = [
    {
      label: t.breedings.unconfirmed.confirmAll,
      variant: "primary",
      onClick: () => {
        const promises = paginatedData.map((breeding) => confirmBreeding(breeding.id));
        Promise.all(promises)
          .then(() => {
            showAlert(t.breedings.unconfirmed.confirmAllSuccess, "success");

            setRefreshKey((prev) => prev + 1);
          })
          .catch(() => {
            showAlert(t.breedings.unconfirmed.confirmAllError, "error");
          });
      },
    },
  ];

  return (
    <div>
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <Table<(typeof enrichedBreedings)[0]>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.breedings.unconfirmed.title,
          badge: {
            label: t.breedings.unconfirmed.badge.breedings(filteredData.length),
            variant: "warning",
          },
          description: t.breedings.unconfirmed.description,
          actions: headerActions,
        }}
        search={{
          placeholder: t.breedings.unconfirmed.searchPlaceholder,
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
        onRowClick={(row) => row.animal && navigate(getAnimalViewRoute(row.animal.id))}
        emptyState={{
          title: t.breedings.unconfirmed.emptyState.title,
          description: searchValue
            ? t.breedings.unconfirmed.emptyState.descriptionWithSearch(searchValue)
            : t.breedings.unconfirmed.emptyState.description,
          onClearSearch: () => {
            setSearchValue("");
          },
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
