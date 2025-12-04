import type { ReactNode } from "react";
import { Button } from "~/components/ui";

export interface PropertyFormLayoutProps {
  readonly title: string;
  readonly description: string;
  readonly backButtonLabel: string;
  readonly onBack: () => void;
  readonly cancelButtonLabel: string;
  readonly onCancel: () => void;
  readonly submitButtonLabel: string;
  readonly loadingLabel?: string;
  readonly isSubmitting: boolean;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly formContent: ReactNode;
  readonly alertDisplay: () => React.ReactElement | null;
}

export function PropertyFormLayout({
  title,
  description,
  backButtonLabel,
  onBack,
  cancelButtonLabel,
  onCancel,
  submitButtonLabel,
  loadingLabel = "Carregando...",
  isSubmitting,
  onSubmit,
  formContent,
  alertDisplay: AlertDisplay,
}: PropertyFormLayoutProps) {
  return (
    <div className="space-y-6">
      <AlertDisplay />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          {backButtonLabel}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <form onSubmit={onSubmit} className="space-y-6">
          {formContent}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {cancelButtonLabel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? loadingLabel : submitButtonLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
