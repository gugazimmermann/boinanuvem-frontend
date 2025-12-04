import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";

export interface FormActionsProps {
  readonly onCancel: () => void;
  readonly isSubmitting?: boolean;
  readonly cancelLabel?: string;
  readonly submitLabel?: string;
  readonly loadingLabel?: string;
  readonly submitVariant?: "primary" | "outline" | "danger";
  readonly showCancel?: boolean;
  readonly showSubmit?: boolean;
  readonly className?: string;
}

export function FormActions({
  onCancel,
  isSubmitting = false,
  cancelLabel,
  submitLabel,
  loadingLabel,
  submitVariant = "primary",
  showCancel = true,
  showSubmit = true,
  className = "",
}: FormActionsProps) {
  const t = useTranslation();

  const finalCancelLabel = cancelLabel || t.common.cancel;
  const finalSubmitLabel = submitLabel || t.common.save;
  const finalLoadingLabel = loadingLabel || t.common.loading;

  return (
    <div
      className={`flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      {showCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {finalCancelLabel}
        </Button>
      )}
      {showSubmit && (
        <Button type="submit" variant={submitVariant} disabled={isSubmitting}>
          {isSubmitting ? finalLoadingLabel : finalSubmitLabel}
        </Button>
      )}
    </div>
  );
}
