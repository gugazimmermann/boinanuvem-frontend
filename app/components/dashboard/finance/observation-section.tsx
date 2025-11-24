import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  FileUpload,
  Alert,
  type TableColumn,
  type SortDirection,
  type TableAction,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { formatDateTime } from "~/utils/formatting";

export interface Observation {
  id: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
}

export interface ObservationSectionProps<T extends Observation> {
  observations: T[];
  onAddObservation: (observation: string, files: File[]) => Promise<void>;
  translationKeys: {
    title: string;
    description: string;
    addObservation: string;
    observation: string;
    observationPlaceholder: string;
    observationRequired: string;
    observationAdded: string;
    observationError: string;
    files: string;
    filesHelper: string;
    searchObservations: string;
    noObservations: string;
    noObservationsWithSearch: string | ((search: string) => string);
    noObservationsDescription: string;
    observationDate: string;
  };
}

export function ObservationSection<T extends Observation>({
  observations: initialObservations,
  onAddObservation,
  translationKeys,
}: ObservationSectionProps<T>) {
  const t = useTranslation();
  const { language } = useLanguage();
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);
  const [observations, setObservations] = useState<T[]>(initialObservations);
  const [observationsCurrentPage, setObservationsCurrentPage] = useState(1);
  const [observationsSearchValue, setObservationsSearchValue] = useState("");
  const [observationsSortState, setObservationsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const itemsPerPage = 10;

  useEffect(() => {
    setObservations(initialObservations);
  }, [initialObservations]);

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim()) {
      setObservationAlert({
        title: translationKeys.observationRequired,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      await onAddObservation(observationText.trim(), observationFiles);
      setObservationAlert({
        title: translationKeys.observationAdded,
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: translationKeys.observationError,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  const filteredObservations = useMemo(() => {
    return observations.filter((observation) => {
      if (!observationsSearchValue) return true;

      const searchLower = observationsSearchValue.toLowerCase();

      if (observation.observation.toLowerCase().includes(searchLower)) return true;

      const dateText = formatDateTime(observation.createdAt, language);
      if (dateText.toLowerCase().includes(searchLower)) return true;

      return false;
    });
  }, [observations, observationsSearchValue, language]);

  const sortedObservations = useMemo(() => {
    return [...filteredObservations].sort((a, b) => {
      if (!observationsSortState.column || !observationsSortState.direction) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      let aValue: string | number | undefined;
      let bValue: string | number | undefined;

      if (observationsSortState.column === "date") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (observationsSortState.column === "observation") {
        aValue = a.observation;
        bValue = b.observation;
      } else {
        aValue = a[observationsSortState.column as keyof T] as string | number | undefined;
        bValue = b[observationsSortState.column as keyof T] as string | number | undefined;
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      const locale = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue, locale, {
          sensitivity: "base",
        });
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), locale);
      }

      return observationsSortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredObservations, observationsSortState, language]);

  const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
  const paginatedObservations = sortedObservations.slice(
    (observationsCurrentPage - 1) * itemsPerPage,
    observationsCurrentPage * itemsPerPage
  );

  const columns: TableColumn<T & Record<string, unknown>>[] = [
    {
      key: "date",
      label: translationKeys.observationDate,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDateTime(row.createdAt, language)}
        </span>
      ),
    },
    {
      key: "observation",
      label: translationKeys.observation,
      sortable: true,
      render: (_, row) => {
        const truncated =
          row.observation.length > 100
            ? `${row.observation.substring(0, 100)}...`
            : row.observation;
        return (
          <span className="text-gray-700 dark:text-gray-300" title={row.observation}>
            {truncated}
          </span>
        );
      },
    },
    {
      key: "files",
      label: translationKeys.files,
      sortable: false,
      render: (_, row) => {
        if (!row.fileIds || row.fileIds.length === 0) {
          return <span className="text-gray-400 dark:text-gray-500">-</span>;
        }
        return (
          <div className="flex items-center space-x-1">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">{row.fileIds.length}</span>
          </div>
        );
      },
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: translationKeys.addObservation,
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
      onClick: () => setShowObservationForm(true),
    },
  ];

  return (
    <div className="space-y-8">
      {observationAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={observationAlert.title} variant={observationAlert.variant} />
        </div>
      )}

      {showObservationForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
              {translationKeys.addObservation}
            </h3>
            <button
              onClick={() => {
                setShowObservationForm(false);
                setObservationText("");
                setObservationFiles([]);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmitObservation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translationKeys.observation} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={observationText}
                onChange={(e) => setObservationText(e.target.value)}
                disabled={isSubmittingObservation}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                placeholder={translationKeys.observationPlaceholder}
                required
              />
            </div>

            <FileUpload
              label={translationKeys.files}
              files={observationFiles}
              onChange={setObservationFiles}
              disabled={isSubmittingObservation}
              multiple={true}
              helperText={translationKeys.filesHelper}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowObservationForm(false);
                  setObservationText("");
                  setObservationFiles([]);
                }}
                disabled={isSubmittingObservation}
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmittingObservation}>
                {t.common.save}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!showObservationForm && (
        <Table<T & Record<string, unknown>>
          columns={columns}
          data={paginatedObservations as (T & Record<string, unknown>)[]}
          header={{
            title: translationKeys.title,
            badge: {
              label: `${filteredObservations.length} ${
                filteredObservations.length !== 1
                  ? translationKeys.title
                  : translationKeys.observation
              }`,
              variant: "primary",
            },
            description: translationKeys.description,
            actions: headerActions,
          }}
          search={{
            placeholder: translationKeys.searchObservations,
            value: observationsSearchValue,
            onChange: (value) => {
              setObservationsSearchValue(value);
              setObservationsCurrentPage(1);
            },
          }}
          pagination={{
            currentPage: observationsCurrentPage,
            totalPages: totalPages || 1,
            onPageChange: (page) => {
              setObservationsCurrentPage(page);
            },
            showInfo: false,
          }}
          sortState={observationsSortState}
          onSort={(column, direction) => {
            setObservationsSortState({ column, direction });
            setObservationsCurrentPage(1);
          }}
          emptyState={{
            title: translationKeys.noObservations,
            description: observationsSearchValue
              ? typeof translationKeys.noObservationsWithSearch === "function"
                ? translationKeys.noObservationsWithSearch(observationsSearchValue)
                : translationKeys.noObservationsWithSearch
              : translationKeys.noObservationsDescription,
            onClearSearch: observationsSearchValue
              ? () => {
                  setObservationsSearchValue("");
                  setObservationsCurrentPage(1);
                }
              : undefined,
            clearSearchLabel: observationsSearchValue ? t.common.clearSearch : undefined,
            onAddNew: () => setShowObservationForm(true),
            addNewLabel: translationKeys.addObservation,
          }}
        />
      )}
    </div>
  );
}
