import { useState, useCallback } from "react";
import type { useAlert } from "./use-alert";

export interface UseDeleteHandlerOptions<T> {
  onDelete: (item: T) => boolean | Promise<boolean>;
  onSuccess?: (item: T) => void;
  onError?: (item: T) => void;
  showAlert: ReturnType<typeof useAlert>["showAlert"];
  successMessage: string;
  errorMessage: string;
}

export function useDeleteHandler<T extends { id: string; name?: string }>(
  options: UseDeleteHandlerOptions<T>
) {
  const { onDelete, onSuccess, onError, showAlert, successMessage, errorMessage } = options;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const handleDeleteClick = useCallback((item: T) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedItem) return;

    try {
      const success = await onDelete(selectedItem);
      if (success) {
        showAlert(successMessage, "success");
        onSuccess?.(selectedItem);
      } else {
        showAlert(errorMessage, "error");
        onError?.(selectedItem);
      }
    } catch {
      showAlert(errorMessage, "error");
      onError?.(selectedItem);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    }
  }, [selectedItem, onDelete, onSuccess, onError, showAlert, successMessage, errorMessage]);

  const handleCloseModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  }, []);

  return {
    isDeleteModalOpen,
    selectedItem,
    handleDeleteClick,
    handleDelete,
    handleCloseModal,
  };
}
