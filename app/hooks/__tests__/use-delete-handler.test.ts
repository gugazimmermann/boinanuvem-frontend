import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeleteHandler } from "../use-delete-handler";

describe("useDeleteHandler", () => {
  let mockShowAlert: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;
  let mockOnSuccess: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockShowAlert = vi.fn();
    mockOnDelete = vi.fn();
    mockOnSuccess = vi.fn();
    mockOnError = vi.fn();
  });

  it("should initialize with closed modal and no selected item", () => {
    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Error",
      })
    );

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should open modal and set selected item when handleDeleteClick is called", () => {
    const item = { id: "1", name: "Test Item" };
    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.handleDeleteClick(item);
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.selectedItem).toEqual(item);
  });

  it("should call onDelete and show success message when deletion succeeds", async () => {
    const item = { id: "1", name: "Test Item" };
    mockOnDelete.mockResolvedValue(true);

    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        onSuccess: mockOnSuccess,
        showAlert: mockShowAlert,
        successMessage: "Item deleted successfully",
        errorMessage: "Failed to delete",
      })
    );

    act(() => {
      result.current.handleDeleteClick(item);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalledWith(item);
    expect(mockShowAlert).toHaveBeenCalledWith("Item deleted successfully", "success");
    expect(mockOnSuccess).toHaveBeenCalledWith(item);
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should show error message when deletion returns false", async () => {
    const item = { id: "1", name: "Test Item" };
    mockOnDelete.mockResolvedValue(false);

    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        onError: mockOnError,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Failed to delete item",
      })
    );

    act(() => {
      result.current.handleDeleteClick(item);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Failed to delete item", "error");
    expect(mockOnError).toHaveBeenCalledWith(item);
    expect(result.current.isDeleteModalOpen).toBe(false);
  });

  it("should handle deletion errors", async () => {
    const item = { id: "1", name: "Test Item" };
    mockOnDelete.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        onError: mockOnError,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Failed to delete",
      })
    );

    act(() => {
      result.current.handleDeleteClick(item);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Failed to delete", "error");
    expect(mockOnError).toHaveBeenCalledWith(item);
    expect(result.current.isDeleteModalOpen).toBe(false);
  });

  it("should handle synchronous onDelete", async () => {
    const item = { id: "1", name: "Test Item" };
    mockOnDelete.mockReturnValue(true);

    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.handleDeleteClick(item);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalled();
    expect(result.current.isDeleteModalOpen).toBe(false);
  });

  it("should close modal when handleCloseModal is called", () => {
    const item = { id: "1", name: "Test Item" };
    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.handleDeleteClick(item);
    });

    expect(result.current.isDeleteModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should not delete when no item is selected", async () => {
    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Error",
      })
    );

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("should handle items without name property", () => {
    const item = { id: "1" };
    const { result } = renderHook(() =>
      useDeleteHandler({
        onDelete: mockOnDelete,
        showAlert: mockShowAlert,
        successMessage: "Deleted",
        errorMessage: "Error",
      })
    );

    act(() => {
      result.current.handleDeleteClick(item);
    });

    expect(result.current.selectedItem).toEqual(item);
  });
});
