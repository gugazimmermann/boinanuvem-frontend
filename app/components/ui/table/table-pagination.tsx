import { useMemo } from "react";
import type { TablePagination as TablePaginationType } from "./types";

interface TablePaginationProps extends TablePaginationType {
  readonly slim?: boolean;
}

type PageNumber = number | "ellipsis";

function generatePagesForStart(
  currentPage: number,
  totalPages: number,
  showEllipsis: boolean
): PageNumber[] {
  const pages: PageNumber[] = [];
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    pages.push(i);
  }
  if (showEllipsis && totalPages > 6) {
    pages.push("ellipsis");
  }
  if (totalPages > 5) {
    pages.push(totalPages - 2, totalPages - 1, totalPages);
  }
  return pages;
}

function generatePagesForEnd(
  currentPage: number,
  totalPages: number,
  showEllipsis: boolean
): PageNumber[] {
  const pages: PageNumber[] = [1, 2, 3];
  if (showEllipsis && totalPages > 6) {
    pages.push("ellipsis");
  }
  const startPage = Math.max(4, totalPages - 4);
  for (let i = startPage; i <= totalPages; i++) {
    if (i > 3) {
      pages.push(i);
    }
  }
  return pages;
}

function generatePagesForMiddle(
  currentPage: number,
  totalPages: number,
  showEllipsis: boolean
): PageNumber[] {
  const pages: PageNumber[] = [1, 2, 3];
  if (showEllipsis) {
    pages.push("ellipsis");
  }
  pages.push(currentPage - 1, currentPage, currentPage + 1);
  if (showEllipsis) {
    pages.push("ellipsis");
  }
  pages.push(totalPages - 2, totalPages - 1, totalPages);
  return pages;
}

function removeDuplicates(pages: PageNumber[]): PageNumber[] {
  const seen = new Set<number | "ellipsis">();
  const cleaned: PageNumber[] = [];
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
}

function generatePageNumbers(currentPage: number, totalPages: number): PageNumber[] {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const showEllipsis = totalPages > 7;
  let pages: PageNumber[];

  if (currentPage <= 4) {
    pages = generatePagesForStart(currentPage, totalPages, showEllipsis);
  } else if (currentPage >= totalPages - 3) {
    pages = generatePagesForEnd(currentPage, totalPages, showEllipsis);
  } else {
    pages = generatePagesForMiddle(currentPage, totalPages, showEllipsis);
  }

  return removeDuplicates(pages);
}

interface PaginationButtonProps {
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly slim: boolean;
  readonly direction: "previous" | "next";
}

function PaginationButton({ onClick, disabled, slim, direction }: PaginationButtonProps) {
  const isPrevious = direction === "previous";
  const buttonClasses = `flex items-center ${slim ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} text-gray-700 dark:text-gray-300 capitalize transition-colors duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md gap-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`;

  return (
    <button onClick={onClick} disabled={disabled} className={buttonClasses}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`${slim ? "w-4 h-4" : "w-5 h-5"} rtl:-scale-x-100`}
      >
        {isPrevious ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
          />
        )}
      </svg>
      {isPrevious ? (
        <span className="hidden sm:inline">anterior</span>
      ) : (
        <span className="hidden sm:inline">Próximo</span>
      )}
    </button>
  );
}

interface PageNumberButtonProps {
  readonly page: number;
  readonly isActive: boolean;
  readonly onClick: () => void;
  readonly slim: boolean;
}

function PageNumberButton({ page, isActive, onClick, slim }: PageNumberButtonProps) {
  const sizeClasses = slim ? "px-2 py-1 text-xs min-w-[28px]" : "px-3 py-1.5 text-sm min-w-[36px]";
  const stateClasses = isActive
    ? "text-blue-500 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/30 font-medium"
    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} rounded-md transition-colors duration-200 cursor-pointer ${stateClasses}`}
    >
      {page}
    </button>
  );
}

function createPaginationHandlers(
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) {
  return {
    handlePrevious: () => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    },
    handleNext: () => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    },
  };
}

function renderSimplePagination(
  currentPage: number,
  totalPages: number,
  pageNumbers: PageNumber[],
  onPageChange: (page: number) => void,
  slim: boolean
) {
  const { handlePrevious, handleNext } = createPaginationHandlers(
    currentPage,
    totalPages,
    onPageChange
  );

  return (
    <div className={`${slim ? "mt-2" : "mt-4"} flex items-center justify-center gap-2`}>
      <PaginationButton
        onClick={handlePrevious}
        disabled={currentPage === 1}
        slim={slim}
        direction="previous"
      />
      <div className={`flex items-center ${slim ? "gap-x-1.5" : "gap-x-2"}`}>
        {pageNumbers.map((page) => {
          if (page === "ellipsis") {
            return (
              <span
                key="ellipsis"
                className={`${slim ? "px-2 py-1 text-xs min-w-[28px]" : "px-3 py-1.5 text-sm min-w-[36px]"} text-gray-500 dark:text-gray-400`}
              >
                ...
              </span>
            );
          }
          return (
            <PageNumberButton
              key={page}
              page={page}
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
              slim={slim}
            />
          );
        })}
      </div>
      <PaginationButton
        onClick={handleNext}
        disabled={currentPage === totalPages}
        slim={slim}
        direction="next"
      />
    </div>
  );
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo: _showInfo = true,
  slim = false,
}: TablePaginationProps) {
  const { handlePrevious, handleNext } = createPaginationHandlers(
    currentPage,
    totalPages,
    onPageChange
  );

  const pageNumbers = useMemo(() => {
    return generatePageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const showPagination = totalPages > 1;
  const hasLessThan10Pages = totalPages < 10;

  if (!showPagination) {
    return null;
  }

  if (hasLessThan10Pages) {
    return renderSimplePagination(currentPage, totalPages, pageNumbers, onPageChange, slim);
  }

  const showPageNumbers = totalPages > 1;
  const compactButtonClasses = `${slim ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"}`;

  return (
    <div className={`${slim ? "mt-2" : "mt-4"} flex items-center justify-between`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`flex items-center ${compactButtonClasses} text-gray-700 dark:text-gray-300 capitalize transition-colors duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md gap-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
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
                  key={`ellipsis-${index}-${pageNumbers.length}`}
                  className={`${slim ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"} text-gray-500 dark:text-gray-400 rounded-md`}
                >
                  ...
                </span>
              );
            }

            return (
              <PageNumberButton
                key={page}
                page={page}
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                slim={slim}
              />
            );
          })}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`flex items-center ${compactButtonClasses} text-gray-700 dark:text-gray-300 capitalize transition-colors duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md gap-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
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
