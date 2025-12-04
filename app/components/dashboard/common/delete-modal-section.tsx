import { ConfirmationModal, FixedAlert } from "~/components/ui";
import type { AlertMessage } from "~/hooks/use-alert";

interface DeleteModalSectionProps {
  readonly alertMessage?: AlertMessage | null;
  readonly isDeleteModalOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
}

/**
 * Reusable component that combines FixedAlert and ConfirmationModal for delete operations.
 */
export function DeleteModalSection({
  alertMessage,
  isDeleteModalOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
}: DeleteModalSectionProps) {
  return (
    <>
      <FixedAlert alertMessage={alertMessage ?? null} />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant="danger"
      />
    </>
  );
}
