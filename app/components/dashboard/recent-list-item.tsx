import { parseISO } from "date-fns";
import { format } from "date-fns";
import { formatRelativeTime, type FormatRelativeTimeOptions } from "~/utils/date";

interface RecentListItemProps {
  icon: string;
  date: string;
  title: string;
  subtitle?: string;
  color?: "purple" | "pink" | "emerald";
  formatRelativeTimeOptions: FormatRelativeTimeOptions;
}

export function RecentListItem({
  icon,
  date,
  title,
  subtitle,
  color = "purple",
  formatRelativeTimeOptions,
}: RecentListItemProps) {
  const colorClasses = {
    purple: "bg-purple-100 dark:bg-purple-900/30",
    pink: "bg-pink-100 dark:bg-pink-900/30",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30",
  };

  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-8 h-8 ${colorClasses[color]} rounded-full flex items-center justify-center`}
      >
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle || format(parseISO(date), "dd/MM/yyyy")} •{" "}
          {formatRelativeTime(date, formatRelativeTimeOptions)}
        </p>
      </div>
    </div>
  );
}
