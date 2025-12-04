import { ConfirmationModal } from "~/components/ui";
import { useTranslation } from "~/i18n";

interface DeleteUserModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void>;
  readonly userName: string;
}

export function DeleteUserModal({ isOpen, onClose, onConfirm, userName }: DeleteUserModalProps) {
  const t = useTranslation();

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t.team.deleteModal.title}
      message={t.team.deleteModal.message(userName)}
      confirmLabel={t.team.deleteModal.confirm}
      cancelLabel={t.team.deleteModal.cancel}
      variant="danger"
    />
  );
}
