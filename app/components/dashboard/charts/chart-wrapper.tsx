import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

interface ChartWrapperProps {
  children: ReactNode;
  height?: number;
  title?: string;
  className?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function ChartWrapper({
  children,
  height = 300,
  title,
  className = "",
  emptyMessage,
  isEmpty = false,
}: ChartWrapperProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      )}
      {isEmpty ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}
