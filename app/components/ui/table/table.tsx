import type { ReactNode } from "react";
import React from "react";
import type { TableProps, SortDirection } from "./types";
import { TableHeader } from "./table-header";
import { TableFilters } from "./table-filters";
import { TablePagination } from "./table-pagination";
import { TableSortIcon } from "./table-sort-icon";
import { TableEmptyState } from "./table-empty-state";
import { Button } from "../button";

function getClearSearchHandler<T extends Record<string, unknown>>(
  emptyState: TableProps<T>["emptyState"],
  search: TableProps<T>["search"]
): (() => void) | undefined {
  if (emptyState?.onClearSearch) {
    return emptyState.onClearSearch;
  }
  if (search?.value) {
    return () => search.onChange("");
  }
  return undefined;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  header,
  filters,
  search,
  pagination,
  sortState,
  onSort,
  emptyState,
  emptyMessage: _emptyMessage,
  className = "",
  rowClassName = "",
  loading = false,
  slim = false,
  onRowClick,
  selectable,
  selectedCountLabel,
  selectedActionButton,
  additionalContent,
  middleContent,
  rightContent,
  belowContent,
}: Readonly<TableProps<T>>) {
  const getRowClassName = (row: T, index: number): string => {
    if (typeof rowClassName === "function") {
      return rowClassName(row, index);
    }
    return rowClassName;
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectable) return;
    const newSelection = new Set<string | number>();
    if (checked) {
      const dataToSelect = selectable.allData || data;
      for (const row of dataToSelect) {
        newSelection.add(selectable.getRowId(row));
      }
    }
    selectable.onSelectionChange(newSelection);
  };

  const handleRowSelect = (
    row: T,
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent
  ) => {
    if (!selectable) return;
    if ("stopPropagation" in event) {
      event.stopPropagation();
    }
    const newSelection = new Set(selectable.selectedRows);
    const rowId = selectable.getRowId(row);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    selectable.onSelectionChange(newSelection);
  };

  const selectableData = selectable?.allData || data;
  const allSelected =
    selectable &&
    selectableData.length > 0 &&
    selectableData.every((row) => selectable.selectedRows.has(selectable.getRowId(row)));
  const someSelected = selectable
    ? selectableData.some((row) => selectable.selectedRows.has(selectable.getRowId(row)))
    : false;

  const getNextSortDirection = (columnKey: string): SortDirection => {
    if (sortState?.column !== columnKey) {
      return "asc";
    }
    if (sortState.direction === "asc") {
      return "desc";
    }
    return null;
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    const newDirection = getNextSortDirection(columnKey);
    onSort(columnKey, newDirection);
  };

  const getColumnValue = (column: (typeof columns)[0], row: T, index: number): ReactNode => {
    if (column.render) {
      return column.render((row as Record<string, unknown>)[column.key], row, index);
    }
    return (row as Record<string, unknown>)[column.key] as ReactNode;
  };

  const getBadgeClassName = (variant: string): string => {
    switch (variant) {
      case "primary":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "secondary":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
      case "success":
        return "text-emerald-500 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      default:
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
    }
  };

  const renderHeaderActions = () => {
    if (!header?.actions || header.actions.length === 0) return null;

    return (
      <div className="flex items-center gap-x-3">
        {header.actions.map((action, index) => (
          <Button
            key={action.label || (action.onClick ? action.onClick.toString() : `action-${index}`)}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            leftIcon={action.leftIcon || action.icon}
            rightIcon={action.rightIcon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    );
  };

  const renderSearchInput = () => {
    if (!search) return null;

    return (
      <div className="relative flex items-center">
        <span className="absolute">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mx-3 text-gray-400 dark:text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </span>
        <input
          type="text"
          placeholder={search.placeholder || "Search"}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="block w-full py-1.5 pr-5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg md:w-80 placeholder-gray-400/70 dark:placeholder-gray-500/70 pl-11 rtl:pr-11 rtl:pl-5 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-300 dark:focus:ring-blue-600 focus:outline-none focus:ring focus:ring-opacity-40"
        />
      </div>
    );
  };

  const hasFiltersOrContent = () => {
    return (
      (filters && filters.length > 0) ||
      rightContent ||
      additionalContent ||
      middleContent ||
      belowContent
    );
  };

  const renderHeaderWithSearch = () => {
    if (!header || !search) return null;

    return (
      <>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-x-3">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {header.title}
              </h2>
              {header.badge && (
                <span
                  className={`px-3 py-1 text-xs rounded-full ${getBadgeClassName(header.badge.variant || "default")}`}
                >
                  {header.badge.label}
                </span>
              )}
            </div>
            {header.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{header.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {renderHeaderActions()}
            {renderSearchInput()}
          </div>
        </div>
        {hasFiltersOrContent() && (
          <div className="mt-3">
            <TableFilters
              filters={filters}
              selectedCountLabel={selectedCountLabel}
              selectedActionButton={selectedActionButton}
              additionalContent={additionalContent}
              middleContent={middleContent}
              rightContent={rightContent}
              belowContent={belowContent}
            />
          </div>
        )}
      </>
    );
  };

  const renderHeaderWithoutSearch = () => {
    if (header && search) return null;

    return (
      <>
        {header && <TableHeader {...header} />}
        <TableFilters
          filters={filters}
          search={search}
          selectedCountLabel={selectedCountLabel}
          selectedActionButton={selectedActionButton}
          additionalContent={additionalContent}
          middleContent={middleContent}
          rightContent={rightContent}
          belowContent={belowContent}
        />
      </>
    );
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <div className={`flex items-center justify-center ${slim ? "py-6 mt-3" : "py-8 mt-4"}`}>
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <TableEmptyState
          title={emptyState?.title}
          description={emptyState?.description}
          searchQuery={search?.value}
          onClearSearch={getClearSearchHandler(emptyState, search)}
          clearSearchLabel={emptyState?.clearSearchLabel}
          onAddNew={emptyState?.onAddNew}
          addNewLabel={emptyState?.addNewLabel}
          icon={emptyState?.icon}
        />
      );
    }

    return (
      <div className={`flex flex-col ${slim ? "mt-3" : "mt-4"}`}>
        <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            className={`inline-block min-w-full ${slim ? "py-1" : "py-2"} align-middle px-4 sm:px-6 lg:px-8`}
          >
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {selectable && (
                      <th
                        scope="col"
                        className={`${slim ? "py-2 px-3 text-xs" : "py-3.5 px-4 text-sm"} font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400`}
                      >
                        <input
                          type="checkbox"
                          checked={allSelected || false}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = someSelected && !allSelected;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
                          style={{
                            accentColor: "#2563eb",
                          }}
                        />
                      </th>
                    )}
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`${slim ? "py-2 px-3 text-xs" : "py-3.5 px-4 text-sm"} font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400 ${
                          column.headerClassName || ""
                        }`}
                      >
                        {column.sortable && onSort ? (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="flex items-center gap-x-3 focus:outline-none cursor-pointer"
                          >
                            <span>{column.label}</span>
                            {sortState?.column === column.key && sortState.direction && (
                              <TableSortIcon />
                            )}
                          </button>
                        ) : (
                          <span>{column.label}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.map((row, index) => {
                    const rowId = selectable ? selectable.getRowId(row) : null;
                    const isSelected =
                      rowId === null || !selectable ? false : selectable.selectedRows.has(rowId);
                    const key = rowId === null ? `row-${index}` : String(rowId);
                    return (
                      <tr
                        key={key}
                        className={`${getRowClassName(row, index)} ${onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" : ""} ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        onClick={() => onRowClick?.(row, index)}
                      >
                        {selectable && (
                          <td
                            className={`${slim ? "px-3 py-2 text-xs" : "px-4 py-4 text-sm"} whitespace-nowrap`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleRowSelect(row, e.target.checked, e)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
                              style={{
                                accentColor: "#2563eb",
                              }}
                            />
                          </td>
                        )}
                        {columns.map((column) => {
                          const value = getColumnValue(column, row, index);
                          return (
                            <td
                              key={column.key}
                              className={`${slim ? "px-3 py-2 text-xs" : "px-4 py-4 text-sm"} whitespace-nowrap ${column.className || ""}`}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={className || "container px-4 mx-auto"}>
      {renderHeaderWithSearch()}
      {renderHeaderWithoutSearch()}
      {renderTableContent()}
      {pagination && <TablePagination {...pagination} slim={slim} />}
    </section>
  );
}
