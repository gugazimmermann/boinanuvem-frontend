import { formatRelativeTime, type FormatRelativeTimeOptions } from "~/utils/date";

interface ActivityItemProps {
  readonly icon: string;
  readonly title: string;
  readonly date: string;
  readonly color: "blue" | "purple" | "teal" | "pink" | "green" | "red";
  readonly formatRelativeTimeOptions: FormatRelativeTimeOptions;
  readonly isLast?: boolean;
}

export function ActivityItem({
  icon,
  title,
  date,
  color,
  formatRelativeTimeOptions,
  isLast = false,
}: ActivityItemProps) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    teal: "bg-teal-100 dark:bg-teal-900/30",
    pink: "bg-pink-100 dark:bg-pink-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
  };

  return (
    <div
      className={`flex items-center space-x-3 ${
        isLast ? "" : "pb-3 border-b border-gray-200 dark:border-gray-700"
      }`}
    >
      <div
        className={`w-8 h-8 ${colorClasses[color]} rounded-full flex items-center justify-center`}
      >
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatRelativeTime(date, formatRelativeTimeOptions)}
        </p>
      </div>
    </div>
  );
}
