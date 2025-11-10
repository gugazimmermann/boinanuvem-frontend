import type { ReactNode } from "react";
import type { TableProps, SortDirection } from "./types";
import { TableHeader } from "./table-header";
import { TableFilters } from "./table-filters";
import { TablePagination } from "./table-pagination";
import { TableSortIcon } from "./table-sort-icon";
import { TableEmptyState } from "./table-empty-state";

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
    <section className={`container px-4 mx-auto ${className}`}>
      {header && <TableHeader {...header} />}

      <TableFilters filters={filters} search={search} />

      {loading ? (
        <div className="flex items-center justify-center py-12 mt-6">
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
        <div className="flex flex-col mt-6">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          scope="col"
                          className={`py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400 ${
                            column.headerClassName || ""
                          }`}
                        >
                          {column.sortable && onSort ? (
                            <button
                              onClick={() => handleSort(column.key)}
                              className="flex items-center gap-x-3 focus:outline-none"
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
                  <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
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
                              className={`px-4 py-4 text-sm whitespace-nowrap ${column.className || ""}`}
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

      {pagination && <TablePagination {...pagination} />}
    </section>
  );
}

