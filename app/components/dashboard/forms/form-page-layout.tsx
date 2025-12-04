import { Button, FixedAlert } from "~/components/ui";
import type { ReactNode } from "react";

import type { AlertMessage } from "~/hooks/use-alert";

interface FormPageLayoutProps {
  readonly alertMessage?: AlertMessage | null;
  readonly title: string;
  readonly description?: string;
  readonly backButtonLabel: string;
  readonly onBack: () => void;
  readonly isSubmitting: boolean;
  readonly children: ReactNode;
  readonly submitButtonLabel: string;
  readonly cancelButtonLabel: string;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel?: () => void;
  readonly formClassName?: string;
  readonly containerClassName?: string;
  readonly formSpacing?: string;
  readonly titleSize?: "2xl" | "3xl";
}

export function FormPageLayout({
  alertMessage,
  title,
  description,
  backButtonLabel,
  onBack,
  isSubmitting,
  children,
  submitButtonLabel,
  cancelButtonLabel,
  onSubmit,
  onCancel,
  formClassName = "bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700",
  containerClassName = "space-y-6",
  formSpacing = "space-y-6",
  titleSize = "2xl",
}: FormPageLayoutProps) {
  const titleClass = titleSize === "3xl" ? "text-3xl" : "text-2xl";
  return (
    <div className={containerClassName}>
      <FixedAlert alertMessage={alertMessage ?? null} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${titleClass} font-bold text-gray-900 dark:text-gray-100`}>{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          {backButtonLabel}
        </Button>
      </div>

      <div className={formClassName}>
        <form onSubmit={onSubmit} className={formSpacing}>
          <div className="space-y-4">{children}</div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || onBack}
              disabled={isSubmitting}
            >
              {cancelButtonLabel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {submitButtonLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
