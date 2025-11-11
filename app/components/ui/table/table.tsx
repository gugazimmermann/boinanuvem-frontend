import type { ReactNode } from "react";
import type { TableProps, SortDirection } from "./types";
import { TableHeader } from "./table-header";
import { TableFilters } from "./table-filters";
import { TablePagination } from "./table-pagination";
import { TableSortIcon } from "./table-sort-icon";
import { TableEmptyState } from "./table-empty-state";
import { Button } from "../button";

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
  emptyMessage,
  className = "",
  rowClassName = "",
  loading = false,
  slim = false,
}: TableProps<T>) {
  const getRowClassName = (row: T, index: number): string => {
    if (typeof rowClassName === "function") {
      return rowClassName(row, index);
    }
    return rowClassName;
  };

  const handleSort = (columnKey: string) => {
    if (!onSort || !sortState) return;

    const currentDirection = sortState.column === columnKey ? sortState.direction : null;
    let newDirection: SortDirection = "asc";

    if (currentDirection === "asc") {
      newDirection = "desc";
    } else if (currentDirection === "desc") {
      newDirection = null;
    }

    onSort(columnKey, newDirection);
  };

  const getColumnValue = (column: typeof columns[0], row: T, index: number): ReactNode => {
    if (column.render) {
      return column.render((row as Record<string, unknown>)[column.key], row, index);
    }
    return (row as Record<string, unknown>)[column.key] as ReactNode;
  };

  return (
    <section className={className || "container px-4 mx-auto"}>
      {header && search ? (
        <>
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-x-3">
                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {header.title}
                </h2>
                {header.badge && (
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      header.badge.variant === "primary"
                        ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
                        : header.badge.variant === "secondary"
                        ? "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700"
                        : header.badge.variant === "success"
                        ? "text-emerald-500 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30"
                        : header.badge.variant === "warning"
                        ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
                        : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {header.badge.label}
                  </span>
                )}
              </div>
              {header.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {header.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {header.actions && header.actions.length > 0 && (
                <div className="flex items-center gap-x-3">
                  {header.actions.map((action, index) => (
                    <Button
                      key={index}
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
              )}
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
            </div>
          </div>
          {filters && filters.length > 0 && (
            <div className="mt-3">
              <TableFilters filters={filters} />
            </div>
          )}
        </>
      ) : (
        <>
          {header && <TableHeader {...header} />}
          <TableFilters filters={filters} search={search} />
        </>
      )}

      {loading ? (
        <div className={`flex items-center justify-center ${slim ? "py-6 mt-3" : "py-8 mt-4"}`}>
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      ) : data.length === 0 ? (
        <TableEmptyState
          title={emptyState?.title}
          description={emptyState?.description}
          searchQuery={search?.value}
          onClearSearch={emptyState?.onClearSearch || (search?.value ? () => search.onChange("") : undefined)}
          onAddNew={emptyState?.onAddNew}
          addNewLabel={emptyState?.addNewLabel}
          icon={emptyState?.icon}
        />
      ) : (
        <div className={`flex flex-col ${slim ? "mt-3" : "mt-4"}`}>
          <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className={`inline-block min-w-full ${slim ? "py-1" : "py-2"} align-middle px-4 sm:px-6 lg:px-8`}>
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
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
                    {data.map((row, index) => (
                      <tr
                        key={index}
                        className={getRowClassName(row, index)}
                      >
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {pagination && <TablePagination {...pagination} slim={slim} />}
    </section>
  );
}

