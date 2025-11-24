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
import { useTableFilters } from "~/hooks/use-table-filters";
import { usePermissions } from "~/utils/permissions";
import type { Language } from "~/types";

export interface RegistrationListPageConfig<
  T extends { id: string; name?: string; status?: "active" | "inactive" },
> {
  data: T[];
  columns: TableColumn<T>[];

  title: string;
  description: string;
  badgeLabel: (count: number) => string;
  searchPlaceholder: string;
  emptyStateTitle: string;
  emptyStateDescription: (searchValue: string) => string;
  emptyStateDescriptionWithoutSearch: string;
  addButtonLabel: string;

  newRoute: string;
  viewRoute: (id: string) => string;
  editRoute?: (id: string) => string;

  deleteService: (item: T) => boolean;
  deleteSuccessMessage: string;
  deleteErrorMessage: string;
  deleteModalTitle: string;
  deleteModalMessage: (name: string) => string;
  deleteModalConfirm: string;
  deleteModalCancel: string;
  onDeleteSuccess?: (item: T) => void;
  onDeleteClick?: (item: T) => void;

  permissionSection: "registration" | "records" | "breedings" | "finances";
  permissionResource: string;

  language?: Language;
  itemsPerPage?: number;
  initialSortColumn?: string;
  initialSortDirection?: SortDirection;
  searchFields?: Array<keyof T | ((item: T) => string)>;
  customFilter?: (item: T, searchValue: string, activeFilter: string) => boolean;
  filterOptions?: Array<{ label: string; value: string }>;
  onRowClick?: (item: T) => void;
  headerActions?: TableAction[];
  additionalFilters?: TableFilter[];
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
          onClick: () => navigate(newRoute),
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
          onAddNew: () => navigate(newRoute),
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
