import type { ReactNode } from "react";
import { Link } from "react-router";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  link?: {
    to: string;
    text: string;
  };
  className?: string;
  valueColor?: "default" | "green" | "red" | "blue" | "orange" | "purple";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  link,
  className = "",
  valueColor = "default",
}: StatCardProps) {
  const valueColorClasses = {
    default: "text-gray-900 dark:text-gray-100",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    orange: "text-orange-600 dark:text-orange-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  const trendColorClasses = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  const getTrendColor = () => {
    if (trend?.isPositive === true) return trendColorClasses.positive;
    if (trend?.isPositive === false) return trendColorClasses.negative;
    return trendColorClasses.neutral;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-xl font-bold mt-1 ${valueColorClasses[valueColor]}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${getTrendColor()}`}>
              <span>{trend.isPositive ? "↑" : trend.isPositive === false ? "↓" : "→"}</span>
              <span>
                {Math.abs(trend.value).toFixed(1)}%{trend.label && ` ${trend.label}`}
              </span>
            </div>
          )}
          {link && (
            <Link
              to={link.to}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              {link.text}
            </Link>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
