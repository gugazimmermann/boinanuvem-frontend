import { Button } from "~/components/ui";
import type { ReactNode } from "react";

interface EmptyStateProps {
  readonly message: string;
  readonly backLabel: string;
  readonly onBack: () => void;
}

/**
 * Common empty state component for detail pages.
 */
export function DetailPageEmptyState({ message, backLabel, onBack }: EmptyStateProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        <Button variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </div>
  );
}

interface DetailPageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
}

/**
 * Common header component for detail pages.
 */
export function DetailPageHeader({ title, subtitle, actions }: DetailPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
