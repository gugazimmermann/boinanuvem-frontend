import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { formatDateTime } from "~/utils/formatting";
import {
  Table,
  Alert,
  type TableColumn,
  type TableAction,
  type SortDirection,
} from "~/components/ui";
import { useLanguage } from "~/contexts/language-context";
import { useTranslation } from "~/i18n/use-translation";
import { getObservationViewRoute } from "~/routes.config";
import { ObservationForm } from "./observation-form";
import type { Observation } from "~/hooks/use-observation-management";
import { sortItems } from "~/utils/sorting";
import { paginateItems, handleSortChange, handleSearchChange } from "~/utils/table-helpers";

interface BaseObservationSectionProps<T extends Observation> {
  observations: T[];
  title: string;
  description?: string;
  searchPlaceholder: string;
  emptyStateTitle: string;
  emptyStateDescription: string | ((searchValue: string) => string);
  emptyStateDescriptionWithSearch?: string | ((searchValue: string) => string);
  translationKeys: {
    observationDate: string;
    observation: string;
    files: string;
    addObservation: string;
    newObservation?: string;
    observationPlaceholder?: string;
    filesHelper?: string;
    cancel?: string;
    save?: string;
    observationRequired?: string;
    observationAdded?: string;
    observationError?: string;
    clearSearch?: string;
  };
  entityId?: string;
  entityType?: string;
  onRowClick?: (row: T) => void;
}

interface SelfManagedObservationSectionProps<T extends Observation>
  extends BaseObservationSectionProps<T> {
  onAddObservation: (observation: string, files: File[]) => Promise<void>;
  useSelfManagedForm?: true;
}

interface ExternalManagedObservationSectionProps<T extends Observation>
  extends BaseObservationSectionProps<T> {
  onAddObservation: (e: React.FormEvent) => void;
  useSelfManagedForm?: false;
  showForm: boolean;
  onShowFormChange: (show: boolean) => void;
  observationText: string;
  onObservationTextChange: (value: string) => void;
  observationFiles: File[];
  onObservationFilesChange: (files: File[]) => void;
  isSubmitting: boolean;
  alert: { title: string; variant: "success" | "error" | "warning" | "info" } | null;
}

type ObservationSectionProps<T extends Observation> =
  | SelfManagedObservationSectionProps<T>
  | ExternalManagedObservationSectionProps<T>;

export function ObservationSection<T extends Observation>(props: ObservationSectionProps<T>) {
  const {
    observations: initialObservations,
    title,
    description,
    searchPlaceholder,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateDescriptionWithSearch,
    translationKeys,
    onAddObservation,
    entityId,
    entityType,
    onRowClick,
  } = props;

  const isSelfManaged = "useSelfManagedForm" in props && props.useSelfManagedForm !== false;

  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslation();
  const [observations, setObservations] = useState<T[]>(initialObservations);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const itemsPerPage = 10;

  // Self-managed form state
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);

  // External-managed form state
  let externalFormState:
    | {
        showForm: boolean;
        onShowFormChange: (show: boolean) => void;
        observationText: string;
        onObservationTextChange: (value: string) => void;
        observationFiles: File[];
        onObservationFilesChange: (files: File[]) => void;
        isSubmitting: boolean;
        alert: { title: string; variant: "success" | "error" | "warning" | "info" } | null;
      }
    | undefined;

  if (!isSelfManaged && "showForm" in props) {
    externalFormState = {
      showForm: props.showForm,
      onShowFormChange: props.onShowFormChange,
      observationText: props.observationText,
      onObservationTextChange: props.onObservationTextChange,
      observationFiles: props.observationFiles,
      onObservationFilesChange: props.onObservationFilesChange,
      isSubmitting: props.isSubmitting,
      alert: props.alert,
    };
  }

  useEffect(() => {
    setObservations(initialObservations);
  }, [initialObservations]);

  const handleSelfManagedSubmit = async () => {
    if (!observationText.trim()) {
      setObservationAlert({
        title: translationKeys.observationRequired || "Por favor, insira uma observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      await (onAddObservation as (observation: string, files: File[]) => Promise<void>)(
        observationText.trim(),
        observationFiles
      );
      setObservationAlert({
        title: translationKeys.observationAdded || "Observação adicionada com sucesso!",
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: translationKeys.observationError || "Erro ao adicionar observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  const _handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelfManaged) {
      await handleSelfManagedSubmit();
      return;
    }
    if (!isSelfManaged && "onAddObservation" in props) {
      (props.onAddObservation as (e: React.FormEvent) => void)(e);
    }
  };

  const filteredObservations = useMemo(() => {
    return observations.filter((observation) => {
      if (!searchValue) return true;

      const searchLower = searchValue.toLowerCase();

      if (observation.observation.toLowerCase().includes(searchLower)) return true;

      const dateText = formatDateTime(observation.createdAt, language);
      if (dateText.toLowerCase().includes(searchLower)) return true;

      return false;
    });
  }, [observations, searchValue, language]);

  const sortedObservations = useMemo(() => {
    return sortItems({
      items: filteredObservations,
      sortState,
      getValue: (item, column) => {
        if (column === "date") {
          return new Date(item.createdAt).getTime();
        } else if (column === "observation") {
          return item.observation;
        }
        return item[column as keyof T] as string | number | undefined;
      },
      defaultSortColumn: "date",
      defaultSortDirection: "desc",
    });
  }, [filteredObservations, sortState]);

  const { paginatedItems: paginatedObservations, totalPages } = paginateItems(
    sortedObservations,
    currentPage,
    itemsPerPage
  );

  const columns: TableColumn<T>[] = [
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
      onClick: () => formState.setShowForm(true),
    },
  ];

  const getEmptyStateDescription = () => {
    if (!searchValue) {
      if (typeof emptyStateDescription === "function") {
        return emptyStateDescription("");
      }
      return emptyStateDescription;
    }

    if (typeof emptyStateDescriptionWithSearch === "function") {
      return emptyStateDescriptionWithSearch(searchValue);
    }
    return emptyStateDescriptionWithSearch || `Nenhuma observação encontrada para "${searchValue}"`;
  };

  const getFormState = () => {
    if (isSelfManaged) {
      return {
        showForm: showObservationForm,
        setShowForm: setShowObservationForm,
        observationText,
        setObservationText: setObservationText,
        observationFiles,
        setObservationFiles: setObservationFiles,
        isSubmitting: isSubmittingObservation,
        alert: observationAlert,
      };
    }
    return {
      showForm: externalFormState!.showForm,
      setShowForm: externalFormState!.onShowFormChange,
      observationText: externalFormState!.observationText,
      setObservationText: externalFormState!.onObservationTextChange,
      observationFiles: externalFormState!.observationFiles,
      setObservationFiles: externalFormState!.onObservationFilesChange,
      isSubmitting: externalFormState!.isSubmitting,
      alert: externalFormState!.alert,
    };
  };

  const getRowClickHandler = () => {
    if (onRowClick) {
      return onRowClick;
    }
    if (entityId && entityType) {
      return (row: T) =>
        navigate(`${getObservationViewRoute(row.id)}?from${entityType}=${entityId}`);
    }
    return undefined;
  };

  const formState = getFormState();

  return (
    <div className="space-y-8">
      {formState.alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={formState.alert.title} variant={formState.alert.variant} />
        </div>
      )}

      {formState.showForm && (
        <ObservationForm
          title={translationKeys.newObservation || ""}
          observationText={formState.observationText}
          onObservationTextChange={formState.setObservationText}
          observationFiles={formState.observationFiles}
          onObservationFilesChange={formState.setObservationFiles}
          isSubmitting={formState.isSubmitting}
          onSubmit={onAddObservation as (e: React.FormEvent) => void}
          onCancel={() => formState.setShowForm(false)}
          translationKeys={{
            observation: translationKeys.observation,
            files: translationKeys.files,
            filesHelper: translationKeys.filesHelper,
            observationPlaceholder: translationKeys.observationPlaceholder,
            cancel: translationKeys.cancel || "Cancelar",
            save: translationKeys.save || "Salvar",
          }}
        />
      )}

      {!formState.showForm && (
        <Table<T & Record<string, unknown>>
          columns={columns}
          data={paginatedObservations as (T & Record<string, unknown>)[]}
          header={{
            title,
            badge: {
              label: `${filteredObservations.length} ${filteredObservations.length === 1 ? translationKeys.observation : title}`,
              variant: "primary",
            },
            description: description || `Gerencie as observações`,
            actions: headerActions,
          }}
          search={{
            placeholder: searchPlaceholder,
            value: searchValue,
            onChange: (value) => {
              handleSearchChange(value, setSearchValue, setCurrentPage);
            },
          }}
          pagination={{
            currentPage,
            totalPages: totalPages || 1,
            onPageChange: (page) => {
              setCurrentPage(page);
            },
            showInfo: false,
          }}
          sortState={sortState}
          onSort={(column, direction) => {
            handleSortChange(
              column,
              direction,
              (col, dir) => setSortState({ column: col, direction: dir }),
              setCurrentPage
            );
          }}
          emptyState={{
            title: emptyStateTitle,
            description: getEmptyStateDescription(),
            onClearSearch: searchValue
              ? () => {
                  setSearchValue("");
                  setCurrentPage(1);
                }
              : undefined,
            clearSearchLabel: searchValue
              ? translationKeys.clearSearch || t.common.clearSearch
              : undefined,
            onAddNew: () => formState.setShowForm(true),
            addNewLabel: translationKeys.addObservation,
          }}
          onRowClick={getRowClickHandler()}
        />
      )}
    </div>
  );
}
