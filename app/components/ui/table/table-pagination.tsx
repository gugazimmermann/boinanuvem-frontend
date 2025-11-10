import { useMemo } from "react";
import type { TablePagination as TablePaginationType } from "./types";

interface TablePaginationProps extends TablePaginationType {}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
}: TablePaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 10) {
      return [];
    }

    const pages: (number | "ellipsis")[] = [];

    if (currentPage <= 4) {
      pages.push(1, 2, 3);
      if (totalPages > 6) {
        pages.push("ellipsis");
      }
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, 2, 3);
      if (totalPages > 6) {
        pages.push("ellipsis");
      }
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, 2, 3);
      pages.push("ellipsis");
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push("ellipsis");
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    }
    const seen = new Set<number | "ellipsis">();
    const cleaned: (number | "ellipsis")[] = [];
    
    for (const page of pages) {
      if (!seen.has(page)) {
        cleaned.push(page);
        seen.add(page);
      }
    }

    return cleaned;
  }, [currentPage, totalPages]);

  const showPageNumbers = totalPages > 10;

  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        </svg>
        <span>previous</span>
      </button>

      {showPageNumbers && (
        <div className="items-center hidden md:flex gap-x-3">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-sm text-gray-500 rounded-md dark:text-gray-300"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2 py-1 text-sm rounded-md transition-colors duration-200 ${
                  isActive
                    ? "text-blue-500 bg-blue-100/60 dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
          />
        </svg>
      </button>
    </div>
  );
}

