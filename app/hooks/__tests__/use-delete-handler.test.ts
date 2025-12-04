import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeleteHandler } from "../use-delete-handler";

describe("useDeleteHandler", () => {
  const mockItem = {
    id: "item-1",
    name: "Test Item",
  };

  const mockShowAlert = vi.fn();
  const defaultOptions = {
    onDelete: vi.fn(),
    showAlert: mockShowAlert,
    successMessage: "Success",
    errorMessage: "Error",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with closed modal", () => {
    const { result } = renderHook(() => useDeleteHandler(defaultOptions));

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should open modal and set selected item when handleDeleteClick is called", () => {
    const { result } = renderHook(() => useDeleteHandler(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.selectedItem).toEqual(mockItem);
  });

  it("should handle successful deletion", async () => {
    const mockOnDelete = vi.fn().mockResolvedValue(true);
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() =>
      useDeleteHandler({
        ...defaultOptions,
        onDelete: mockOnDelete,
        onSuccess: mockOnSuccess,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalledWith(mockItem);
    expect(mockShowAlert).toHaveBeenCalledWith("Success", "success");
    expect(mockOnSuccess).toHaveBeenCalledWith(mockItem);
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should handle failed deletion", async () => {
    const mockOnDelete = vi.fn().mockResolvedValue(false);
    const mockOnError = vi.fn();

    const { result } = renderHook(() =>
      useDeleteHandler({
        ...defaultOptions,
        onDelete: mockOnDelete,
        onError: mockOnError,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalledWith(mockItem);
    expect(mockShowAlert).toHaveBeenCalledWith("Error", "error");
    expect(mockOnError).toHaveBeenCalledWith(mockItem);
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should handle deletion error", async () => {
    const mockError = new Error("Delete failed");
    const mockOnDelete = vi.fn().mockRejectedValue(mockError);
    const mockOnError = vi.fn();

    const { result } = renderHook(() =>
      useDeleteHandler({
        ...defaultOptions,
        onDelete: mockOnDelete,
        onError: mockOnError,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalledWith(mockItem);
    expect(mockShowAlert).toHaveBeenCalledWith("Error", "error");
    expect(mockOnError).toHaveBeenCalledWith(mockItem);
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should not call onDelete when no item is selected", async () => {
    const mockOnDelete = vi.fn();

    const { result } = renderHook(() =>
      useDeleteHandler({
        ...defaultOptions,
        onDelete: mockOnDelete,
      })
    );

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("should close modal when handleCloseModal is called", () => {
    const { result } = renderHook(() => useDeleteHandler(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    expect(result.current.isDeleteModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  it("should handle synchronous onDelete", async () => {
    const mockOnDelete = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() =>
      useDeleteHandler({
        ...defaultOptions,
        onDelete: mockOnDelete,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Success", "success");
  });

  it("should not call onSuccess when not provided", async () => {
    const mockOnDelete = vi.fn().mockResolvedValue(true);

    const { result } = renderHook(() =>
      useDeleteHandler({
        ...defaultOptions,
        onDelete: mockOnDelete,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Success", "success");
  });

  it("should not call onError when not provided", async () => {
    const mockOnDelete = vi.fn().mockResolvedValue(false);

    const { result } = renderHook(() =>
      useDeleteHandler({
        ...defaultOptions,
        onDelete: mockOnDelete,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockItem);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Error", "error");
  });

  it("should handle item without name property", () => {
    const itemWithoutName = {
      id: "item-2",
    };

    const { result } = renderHook(() => useDeleteHandler(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(itemWithoutName);
    });

    expect(result.current.selectedItem).toEqual(itemWithoutName);
  });

  it("should handle multiple delete clicks", () => {
    const item1 = { id: "item-1", name: "Item 1" };
    const item2 = { id: "item-2", name: "Item 2" };

    const { result } = renderHook(() => useDeleteHandler(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(item1);
    });

    expect(result.current.selectedItem).toEqual(item1);

    act(() => {
      result.current.handleDeleteClick(item2);
    });

    expect(result.current.selectedItem).toEqual(item2);
  });
});
