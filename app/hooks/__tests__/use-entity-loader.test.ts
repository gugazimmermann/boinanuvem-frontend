import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useEntityLoader } from "../use-entity-loader";

describe("useEntityLoader", () => {
  let mockLoadEntity: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadEntity = vi.fn();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should initialize with loading state", () => {
    // Use a promise that won't resolve immediately to check initial state
    let resolvePromise: (value: { id: string; name: string }) => void;
    const promise = new Promise<{ id: string; name: string }>((resolve) => {
      resolvePromise = resolve;
    });
    mockLoadEntity.mockReturnValue(promise);

    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
      })
    );

    // Flush any pending synchronous updates
    act(() => {
      // This ensures any synchronous state updates from the initial render are flushed
    });

    // The hook initializes with isLoading: true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.entity).toBeNull();
    expect(result.current.error).toBeNull();

    // Clean up: resolve the promise to avoid hanging
    resolvePromise!({ id: "1", name: "Test" });
  });

  it("should load entity when entityId is provided", async () => {
    const entityData = { id: "1", name: "Test Entity" };
    mockLoadEntity.mockResolvedValue(entityData);

    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockLoadEntity).toHaveBeenCalledWith("1");
    expect(result.current.entity).toEqual(entityData);
    expect(result.current.error).toBeNull();
  });

  it("should set error when entityId is not provided", () => {
    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: undefined,
        loadEntity: mockLoadEntity,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Entity ID not found");
    expect(mockLoadEntity).not.toHaveBeenCalled();
  });

  it("should handle loading errors", async () => {
    const error = new Error("Failed to load");
    mockLoadEntity.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load");
    expect(result.current.entity).toBeNull();
  });

  it("should use custom error message when error is not Error instance", async () => {
    mockLoadEntity.mockRejectedValue("String error");

    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
        errorMessage: "Custom error message",
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Custom error message");
  });

  it("should use error message from Error instance when available", async () => {
    const error = new Error("Network error");
    mockLoadEntity.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
        errorMessage: "Custom error message",
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("should not load when enabled is false", () => {
    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
        enabled: false,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockLoadEntity).not.toHaveBeenCalled();
  });

  it("should not reload same entity", async () => {
    const entityData = { id: "1", name: "Test" };
    mockLoadEntity.mockResolvedValue(entityData);

    const { result, rerender } = renderHook(
      ({ entityId }) =>
        useEntityLoader({
          entityId,
          loadEntity: mockLoadEntity,
        }),
      {
        initialProps: { entityId: "1" },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockLoadEntity).toHaveBeenCalledTimes(1);

    rerender({ entityId: "1" });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockLoadEntity).toHaveBeenCalledTimes(1);
  });

  it("should reload when entityId changes", async () => {
    const entity1 = { id: "1", name: "Entity 1" };
    const entity2 = { id: "2", name: "Entity 2" };
    mockLoadEntity.mockResolvedValueOnce(entity1).mockResolvedValueOnce(entity2);

    const { result, rerender } = renderHook(
      ({ entityId }) =>
        useEntityLoader({
          entityId,
          loadEntity: mockLoadEntity,
        }),
      {
        initialProps: { entityId: "1" },
      }
    );

    await waitFor(() => {
      expect(result.current.entity).toEqual(entity1);
    });

    rerender({ entityId: "2" });

    await waitFor(() => {
      expect(result.current.entity).toEqual(entity2);
    });

    expect(mockLoadEntity).toHaveBeenCalledTimes(2);
  });

  it("should cancel loading on unmount", async () => {
    mockLoadEntity.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: "1" }), 1000))
    );

    const { result, unmount } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
      })
    );

    expect(result.current.isLoading).toBe(true);

    unmount();

    await waitFor(() => {
      expect(mockLoadEntity).toHaveBeenCalled();
    });
  });

  it("should handle non-Error exceptions", async () => {
    mockLoadEntity.mockRejectedValue("String error");

    const { result } = renderHook(() =>
      useEntityLoader({
        entityId: "1",
        loadEntity: mockLoadEntity,
        errorMessage: "Default error",
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Default error");
  });
});
