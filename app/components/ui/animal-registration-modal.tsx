import { Button } from "./button";
import { useTranslation } from "~/i18n";

interface AnimalRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBirth: () => void;
  onSelectAcquisition: () => void;
}

export function AnimalRegistrationModal({
  isOpen,
  onClose,
  onSelectBirth,
  onSelectAcquisition,
}: AnimalRegistrationModalProps) {
  const t = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black/5 dark:bg-black/10 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700 relative z-10">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  {t.animals.registrationModal.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.animals.registrationModal.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  onSelectBirth();
                  onClose();
                }}
                className="w-full"
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                {t.sidebar.births}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onSelectAcquisition();
                  onClose();
                }}
                className="w-full"
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                {t.sidebar.acquisitions}
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                {t.common.cancel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
