import type { TableHeaderProps } from "./types";
import { Button } from "../button";

const badgeVariants = {
  primary: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  secondary: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700",
  success: "text-emerald-500 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30",
  warning: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
  danger: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
};

export function TableHeader({ title, badge, description, actions = [] }: TableHeaderProps) {
  return (
    <div className="sm:flex sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-x-3">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">{title}</h2>
          {badge && (
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                badgeVariants[badge.variant || "primary"]
              }`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex items-center mt-4 gap-x-3 sm:mt-0">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              leftIcon={action.leftIcon || action.icon}
              rightIcon={action.rightIcon}
              className={action.variant === "primary" ? "" : "w-1/2 sm:w-auto"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
