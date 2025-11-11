import { useMemo } from "react";
import type { TablePagination as TablePaginationType } from "./types";

interface TablePaginationProps extends TablePaginationType {
  slim?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  slim = false,
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
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (currentPage <= 4) {
      for (let i = 1; i <= Math.min(5, totalPages); i++) {
        pages.push(i);
      }
      if (showEllipsis && totalPages > 6) {
        pages.push("ellipsis");
      }
      if (totalPages > 5) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      }
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, 2, 3);
      if (showEllipsis && totalPages > 6) {
        pages.push("ellipsis");
      }
      const startPage = Math.max(4, totalPages - 4);
      for (let i = startPage; i <= totalPages; i++) {
        if (i > 3) {
          pages.push(i);
        }
      }
    } else {
      pages.push(1, 2, 3);
      if (showEllipsis) {
        pages.push("ellipsis");
      }
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      if (showEllipsis) {
        pages.push("ellipsis");
      }
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    }
    
    const seen = new Set<number | "ellipsis">();
    const cleaned: (number | "ellipsis")[] = [];
    let lastWasEllipsis = false;
    
    for (const page of pages) {
      if (page === "ellipsis") {
        if (!lastWasEllipsis) {
          cleaned.push(page);
          lastWasEllipsis = true;
        }
      } else if (!seen.has(page)) {
        cleaned.push(page);
        seen.add(page);
        lastWasEllipsis = false;
      }
    }

    return cleaned;
  }, [currentPage, totalPages]);

  const showPageNumbers = totalPages > 1;

  return (
    <div className={`${slim ? "mt-3" : "mt-6"} flex items-center justify-between`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`flex items-center ${slim ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"} text-gray-700 dark:text-gray-300 capitalize transition-colors duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md gap-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`${slim ? "w-4 h-4" : "w-5 h-5"} rtl:-scale-x-100`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        </svg>
        <span>anterior</span>
      </button>

      {showPageNumbers && (
        <div className={`items-center hidden md:flex ${slim ? "gap-x-2" : "gap-x-3"}`}>
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={`${slim ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"} text-gray-500 dark:text-gray-400 rounded-md`}
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
                className={`${slim ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"} rounded-md transition-colors duration-200 ${
                  isActive
                    ? "text-blue-500 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/30"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
        className={`flex items-center ${slim ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"} text-gray-700 dark:text-gray-300 capitalize transition-colors duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md gap-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span>Próximo</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`${slim ? "w-4 h-4" : "w-5 h-5"} rtl:-scale-x-100`}
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

