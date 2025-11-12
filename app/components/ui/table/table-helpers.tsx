import type { ReactNode } from "react";
import { COLORS } from "../../site/constants";

interface StatusBadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

const statusBadgeVariants = {
  success: "",
  warning: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
  danger: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  info: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  default: "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 gap-x-2",
};

export function StatusBadge({ label, variant = "default" }: StatusBadgeProps) {
  const isSuccess = variant === "success";
  const successStyle = isSuccess
    ? {
        color: "white",
        backgroundColor: COLORS.primary,
      }
    : {};

  return (
    <div
      className={`inline px-3 py-1 text-sm font-normal rounded-full ${
        isSuccess ? "" : statusBadgeVariants[variant]
      }`}
      style={successStyle}
    >
      {label}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  barClassName = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`w-48 h-1.5 bg-blue-200 dark:bg-blue-900/30 overflow-hidden rounded-full ${className}`}
    >
      <div
        className={`bg-blue-500 dark:bg-blue-600 h-1.5 transition-all duration-300 ${barClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface UserAvatarsProps {
  users: Array<{ name: string; avatar?: string }>;
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
}

const avatarSizes = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function UserAvatars({ users, maxVisible = 4, size = "md" }: UserAvatarsProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);
  const sizeClass = avatarSizes[size];

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, index) => (
        <img
          key={index}
          src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
          }
          alt={user.name}
          className={`object-cover ${sizeClass} -mx-1 border-2 border-white dark:border-gray-800 rounded-full shrink-0`}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`flex items-center justify-center ${sizeClass} -mx-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-800 rounded-full`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  className?: string;
}

export function ActionButton({ onClick, icon, label, className = "" }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-1 py-1 text-gray-500 dark:text-gray-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${className}`}
      aria-label={label || "Actions"}
    >
      {icon || (
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
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
      )}
    </button>
  );
}

interface TableActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function TableActionButtons({
  onView,
  onEdit,
  onDelete,
  className = "",
}: TableActionButtonsProps) {
  return (
    <div className={`flex items-center gap-x-6 ${className}`}>
      {onView && (
        <button
          type="button"
          className="text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none cursor-pointer"
          onClick={onView}
          aria-label="View"
        >
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
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          className="text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-yellow-500 dark:hover:text-yellow-400 focus:outline-none cursor-pointer"
          onClick={onEdit}
          aria-label="Edit"
        >
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
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          className="text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:text-red-500 dark:hover:text-red-400 focus:outline-none cursor-pointer"
          onClick={onDelete}
          aria-label="Delete"
        >
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
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
