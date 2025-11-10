import type { ReactNode } from "react";

interface StatusBadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

const statusBadgeVariants = {
  success: "text-emerald-500 bg-emerald-100/60 dark:bg-gray-800",
  warning: "text-yellow-600 bg-yellow-100 dark:bg-gray-800 dark:text-yellow-400",
  danger: "text-red-600 bg-red-100 dark:bg-gray-800 dark:text-red-400",
  info: "text-blue-600 bg-blue-100 dark:bg-gray-800 dark:text-blue-400",
  default: "text-gray-500 bg-gray-100 dark:text-gray-400 gap-x-2 dark:bg-gray-800",
};

export function StatusBadge({ label, variant = "default" }: StatusBadgeProps) {
  return (
    <div
      className={`inline px-3 py-1 text-sm font-normal rounded-full ${statusBadgeVariants[variant]}`}
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
    <div className={`w-48 h-1.5 bg-blue-200 overflow-hidden rounded-full ${className}`}>
      <div
        className={`bg-blue-500 h-1.5 transition-all duration-300 ${barClassName}`}
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

export function UserAvatars({
  users,
  maxVisible = 4,
  size = "md",
}: UserAvatarsProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);
  const sizeClass = avatarSizes[size];

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, index) => (
        <img
          key={index}
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
          alt={user.name}
          className={`object-cover ${sizeClass} -mx-1 border-2 border-white rounded-full dark:border-gray-700 shrink-0`}
        />
      ))}
      {remainingCount > 0 && (
        <div className={`flex items-center justify-center ${sizeClass} -mx-1 text-xs text-blue-600 bg-blue-100 border-2 border-white rounded-full`}>
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
      className={`px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg dark:text-gray-300 hover:bg-gray-100 ${className}`}
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

