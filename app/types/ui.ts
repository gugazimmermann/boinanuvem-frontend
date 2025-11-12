/**
 * UI component-related types
 */

import type { ReactNode } from "react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  icon?: ReactNode;
  isLoading?: boolean;
}
