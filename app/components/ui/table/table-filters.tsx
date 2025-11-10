import type { TableFilter } from "./types";
import { Input } from "../input";

interface TableFiltersProps {
  filters?: TableFilter[];
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };
}

export function TableFilters({ filters = [], search }: TableFiltersProps) {
  const hasFilters = filters.length > 0;
  const hasSearch = Boolean(search);

  if (!hasFilters && !hasSearch) {
    return null;
  }

  return (
    <div className="mt-6 md:flex md:items-center md:justify-between">
      {hasFilters && (
        <div className="inline-flex overflow-hidden bg-white border divide-x rounded-lg rtl:flex-row-reverse">
          {filters.map((filter, index) => (
            <button
              key={filter.value}
              onClick={filter.onClick}
              className={`px-5 py-2 text-xs font-medium transition-colors duration-200 sm:text-sm ${
                filter.active
                  ? "text-gray-600 bg-gray-100"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {hasSearch && (
        <div className="relative flex items-center mt-4 md:mt-0">
          <span className="absolute">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mx-3 text-gray-400"
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
            className="block w-full py-1.5 pr-5 text-gray-700 bg-white border border-gray-200 rounded-lg md:w-80 placeholder-gray-400/70 pl-11 rtl:pr-11 rtl:pl-5 focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
          />
        </div>
      )}
    </div>
  );
}

