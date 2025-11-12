import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { maskPhone } from "~/components/site/utils/masks";
import type { UserFormData } from "./user-form-modal";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserFormData & {
    id: string;
    status: "active" | "inactive" | "pending";
    lastAccess?: string;
  };
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const t = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-50 cursor-pointer"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
              {t.team.userDetails.title}
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.team.userDetails.personalInfo}
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t.team.table.name}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t.team.table.email}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t.team.addModal.fields.phone}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {maskPhone(user.phone)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.team.userDetails.accountInfo}
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t.team.table.status}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {t.team.status[user.status]}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t.team.table.lastAccess}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(user.lastAccess)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t.team.userDetails.close}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
