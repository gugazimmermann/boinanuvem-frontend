import { FixedAlert, Button } from "./index";
import type { AlertMessage } from "~/hooks/use-alert";

export interface FormPageLayoutProps {
  readonly title: string;
  readonly description?: string;
  readonly alert?: AlertMessage | null;
  readonly backButton?: {
    readonly label: string;
    readonly onClick: () => void;
    readonly disabled?: boolean;
  };
  readonly headerActions?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly footer?: {
    readonly cancelButton?: {
      readonly label: string;
      readonly onClick: () => void;
      readonly disabled?: boolean;
    };
    readonly submitButton: {
      readonly label: string;
      readonly loadingLabel?: string;
      readonly disabled?: boolean;
      readonly isLoading?: boolean;
    };
  };
  readonly formWrapperClassName?: string;
}

export function FormPageLayout({
  title,
  description,
  alert,
  backButton,
  headerActions,
  children,
  footer,
  formWrapperClassName = "",
}: FormPageLayoutProps) {
  return (
    <div className="space-y-6">
      <FixedAlert alertMessage={alert ?? null} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className="flex gap-3">
          {headerActions}
          {backButton && (
            <Button variant="outline" onClick={backButton.onClick} disabled={backButton.disabled}>
              {backButton.label}
            </Button>
          )}
        </div>
      </div>

      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 ${formWrapperClassName}`}
      >
        {children}
        {footer && (
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            {footer.cancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={footer.cancelButton.onClick}
                disabled={footer.cancelButton.disabled}
              >
                {footer.cancelButton.label}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={footer.submitButton.disabled || footer.submitButton.isLoading}
            >
              {(() => {
                if (footer.submitButton.isLoading) {
                  return footer.submitButton.loadingLabel || "Carregando...";
                }
                return footer.submitButton.label;
              })()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
