import type { ReactNode } from "react";
import { Button } from "../button";

interface TableEmptyStateProps {
  title?: string;
  description?: string;
  searchQuery?: string;
  onClearSearch?: () => void;
  clearSearchLabel?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  icon?: ReactNode;
}

export function TableEmptyState({
  title = "No vendors found",
  description,
  searchQuery,
  onClearSearch,
  clearSearchLabel = "Clear Search",
  onAddNew,
  addNewLabel = "Add vendor",
  icon,
}: TableEmptyStateProps) {
  const defaultDescription = searchQuery
    ? `Your search "${searchQuery}" did not match any vendors. Please try again or create add a new vendor.`
    : "No data available. Please try again or create add a new vendor.";

  const displayDescription = description || defaultDescription;

  const defaultIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );

  return (
    <div className="flex items-center mt-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg h-96 bg-white dark:bg-gray-800">
      <div className="flex flex-col w-full max-w-sm px-4 mx-auto">
        <div className="p-3 mx-auto text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          {icon || defaultIcon}
        </div>
        <h1 className="mt-3 text-lg text-gray-800 dark:text-gray-200">{title}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{displayDescription}</p>
        {(onClearSearch || onAddNew) && (
          <div className="flex items-center mt-4 sm:mx-auto gap-x-3">
            {onClearSearch && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSearch}
                className="w-1/2 sm:w-auto"
              >
                {clearSearchLabel}
              </Button>
            )}
            {onAddNew && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAddNew}
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
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                className="w-1/2 sm:w-auto"
              >
                {addNewLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
