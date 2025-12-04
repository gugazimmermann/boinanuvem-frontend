import { cloneElement, isValidElement } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  Alert,
  ConfirmationModal,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { useListPage } from "~/hooks/use-list-page";
import { useAlert } from "~/hooks/use-alert";
import { useDeleteHandler } from "~/hooks/use-delete-handler";
import { useTableFilters, type FilterValue } from "~/hooks/use-table-filters";
import { usePermissions } from "~/utils/permissions";
import type { Language } from "~/types";

export interface RegistrationListPageConfig<
  T extends { id: string; name?: string; status?: "active" | "inactive" },
> {
  readonly data: T[];
  readonly columns: TableColumn<T>[];

  readonly title: string;
  readonly description: string;
  readonly badgeLabel: (count: number) => string;
  readonly searchPlaceholder: string;
  readonly emptyStateTitle: string;
  readonly emptyStateDescription: (searchValue: string) => string;
  readonly emptyStateDescriptionWithoutSearch: string;
  readonly addButtonLabel: string;

  readonly newRoute: string;
  readonly viewRoute: (id: string) => string;
  readonly editRoute?: (id: string) => string;

  readonly deleteService: (item: T) => boolean;
  readonly deleteSuccessMessage: string;
  readonly deleteErrorMessage: string;
  readonly deleteModalTitle: string;
  readonly deleteModalMessage: (name: string) => string;
  readonly deleteModalConfirm: string;
  readonly deleteModalCancel: string;
  readonly onDeleteSuccess?: (item: T) => void;
  readonly onDeleteClick?: (item: T) => void;

  readonly permissionSection: "registration" | "records" | "breedings" | "finances";
  readonly permissionResource: string;

  readonly language?: Language;
  readonly itemsPerPage?: number;
  readonly initialSortColumn?: string;
  readonly initialSortDirection?: SortDirection;
  readonly searchFields?: Array<keyof T | ((item: T) => string)>;
  readonly customFilter?: (item: T, searchValue: string, activeFilter: string) => boolean;
  readonly filterOptions?: Array<{ label: string; value: FilterValue }>;
  readonly onRowClick?: (item: T) => void;
  readonly headerActions?: TableAction[];
  readonly additionalFilters?: TableFilter[];
}

export function RegistrationListPage<
  T extends { id: string; name?: string; status?: "active" | "inactive" },
>(config: RegistrationListPageConfig<T>) {
  const {
    data,
    columns,
    title,
    description,
    badgeLabel,
    searchPlaceholder,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateDescriptionWithoutSearch,
    addButtonLabel,
    newRoute,
    viewRoute,
    editRoute: _editRoute,
    deleteService,
    deleteSuccessMessage,
    deleteErrorMessage,
    deleteModalTitle,
    deleteModalMessage,
    deleteModalConfirm,
    deleteModalCancel,
    onDeleteSuccess,
    onDeleteClick,
    permissionSection,
    permissionResource,
    language = "pt",
    itemsPerPage = 10,
    initialSortColumn,
    initialSortDirection = "asc",
    searchFields,
    customFilter,
    filterOptions,
    onRowClick,
    headerActions: customHeaderActions,
    additionalFilters,
  } = config;

  const navigate = useNavigate();
  const { canAdd } = usePermissions();
  const { alertMessage, showAlert } = useAlert();
  const { filters } = useTableFilters({ filterOptions });

  const listPage = useListPage({
    data,
    itemsPerPage,
    initialSortColumn,
    initialSortDirection,
    language,
    searchFields,
    customFilter,
  });

  const deleteHandler = useDeleteHandler({
    onDelete: deleteService,
    onSuccess: onDeleteSuccess,
    showAlert,
    successMessage: deleteSuccessMessage,
    errorMessage: deleteErrorMessage,
  });

  const columnsWithDelete = columns.map((col) => {
    if (col.key === "actions" && col.render) {
      return {
        ...col,
        render: (value: unknown, row: T, index: number) => {
          const element = col.render!(value, row, index);
          if (isValidElement(element)) {
            return cloneElement(element, {
              ...(typeof element.props === "object" && element.props !== null ? element.props : {}),
              onDelete: onDeleteClick || (() => deleteHandler.handleDeleteClick(row)),
            } as Record<string, unknown>);
          }
          return element;
        },
      };
    }
    return col;
  });

  const allFilters = additionalFilters ? [...filters, ...additionalFilters] : filters;

  const defaultHeaderActions: TableAction[] = canAdd(permissionSection, permissionResource)
    ? [
        {
          label: addButtonLabel,
          variant: "primary" as const,
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
          onClick: () => {
            navigate(newRoute);
          },
        },
      ]
    : [];

  const headerActions = customHeaderActions || defaultHeaderActions;

  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    } else {
      navigate(viewRoute(item.id));
    }
  };

  return (
    <div>
      <Table<T>
        columns={columnsWithDelete}
        data={listPage.paginatedData}
        header={{
          title,
          badge: {
            label: badgeLabel(listPage.filteredData.length),
            variant: "primary",
          },
          description,
          actions: headerActions,
        }}
        filters={allFilters}
        search={{
          placeholder: searchPlaceholder,
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
        onRowClick={handleRowClick}
        emptyState={{
          title: emptyStateTitle,
          description: listPage.searchValue
            ? emptyStateDescription(listPage.searchValue)
            : emptyStateDescriptionWithoutSearch,
          onClearSearch: listPage.clearSearch,
          clearSearchLabel: "Clear search",
          onAddNew: () => {
            navigate(newRoute);
          },
          addNewLabel: addButtonLabel,
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
        title={deleteModalTitle}
        message={deleteModalMessage(deleteHandler.selectedItem?.name || "")}
        confirmLabel={deleteModalConfirm}
        cancelLabel={deleteModalCancel}
        variant="danger"
      />
    </div>
  );
}
