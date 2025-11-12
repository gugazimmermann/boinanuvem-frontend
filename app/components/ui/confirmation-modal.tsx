import { useState } from "react";
import { Button } from "./button";
import type { ConfirmationModalProps } from "~/types";

export type { ConfirmationModalProps };

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  isLoading = false,
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error in confirmation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      buttonBg: "#ef4444",
      buttonHover: "#dc2626",
    },
    warning: {
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      buttonBg: "#f59e0b",
      buttonHover: "#d97706",
    },
    info: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      buttonBg: "#3b82f6",
      buttonHover: "#2563eb",
    },
  };

  const styles = variantStyles[variant];
  const defaultIcon = (
    <svg
      className={`h-6 w-6 ${styles.iconColor}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  const displayIcon = icon || defaultIcon;
  const isDisabled = isLoading || isProcessing;

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
              <div
                className={`mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}
              >
                {displayIcon}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                <div className="mt-2">
                  {typeof message === "string" ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                  ) : (
                    message
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isDisabled}
              style={{
                backgroundColor: styles.buttonBg,
                borderColor: styles.buttonBg,
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = styles.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = styles.buttonBg;
                }
              }}
            >
              {isDisabled ? "Loading..." : confirmLabel}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isDisabled}>
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
