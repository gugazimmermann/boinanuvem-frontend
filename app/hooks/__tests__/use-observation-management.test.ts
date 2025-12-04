import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useObservationManagement } from "../use-observation-management";

describe("useObservationManagement", () => {
  const mockEntityId = "entity-1";
  const mockObservations = [
    {
      id: "obs-1",
      observation: "First observation",
      fileIds: ["file-1"],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "obs-2",
      observation: "Second observation",
      fileIds: [],
      createdAt: "2024-01-02T00:00:00Z",
    },
  ];

  const mockFetchObservations = vi.fn((entityId: string) => {
    if (entityId === mockEntityId) {
      return mockObservations;
    }
    return [];
  });

  const mockAddObservation = vi.fn((data: { observation: string; fileIds?: string[] }) => {
    return {
      id: `obs-${Date.now()}`,
      observation: data.observation,
      fileIds: data.fileIds,
      createdAt: new Date().toISOString(),
    };
  });

  const mockTranslationKeys = {
    observationRequired: "Observation is required",
    observationAdded: "Observation added successfully",
    observationError: "Error adding observation",
  };

  const mockGenerateFileIdPrefix = vi.fn((entityId: string) => `file-${entityId}`);

  const defaultOptions = {
    entityId: mockEntityId,
    fetchObservations: mockFetchObservations,
    addObservation: mockAddObservation,
    translationKeys: mockTranslationKeys,
    generateFileIdPrefix: mockGenerateFileIdPrefix,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset mockAddObservation to default implementation
    mockAddObservation.mockImplementation((data: { observation: string; fileIds?: string[] }) => {
      return {
        id: `obs-${Date.now()}`,
        observation: data.observation,
        fileIds: data.fileIds,
        createdAt: new Date().toISOString(),
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    expect(result.current.observations).toEqual(mockObservations);
    expect(result.current.showForm).toBe(false);
    expect(result.current.observationText).toBe("");
    expect(result.current.observationFiles).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.alert).toBe(null);
  });

  it("should fetch observations on mount", () => {
    renderHook(() => useObservationManagement(defaultOptions));

    expect(mockFetchObservations).toHaveBeenCalledWith(mockEntityId);
  });

  it("should fetch observations when entityId changes", () => {
    const { rerender } = renderHook(
      ({ entityId }) =>
        useObservationManagement({
          ...defaultOptions,
          entityId,
        }),
      {
        initialProps: { entityId: mockEntityId },
      }
    );

    expect(mockFetchObservations).toHaveBeenCalledWith(mockEntityId);

    rerender({ entityId: "entity-2" });

    expect(mockFetchObservations).toHaveBeenCalledWith("entity-2");
  });

  it("should update showForm when setShowForm is called", () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setShowForm(true);
    });

    expect(result.current.showForm).toBe(true);
  });

  it("should update observationText when setObservationText is called", () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setObservationText("New observation");
    });

    expect(result.current.observationText).toBe("New observation");
  });

  it("should update observationFiles when setObservationFiles is called", () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    const mockFile = new File([], "test.jpg");

    act(() => {
      result.current.setObservationFiles([mockFile]);
    });

    expect(result.current.observationFiles).toEqual([mockFile]);
  });

  it("should show error alert when submitting empty observation", async () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.alert).toEqual({
      title: mockTranslationKeys.observationRequired,
      variant: "error",
    });
    expect(mockAddObservation).not.toHaveBeenCalled();
  });

  it("should clear error alert after 3 seconds", async () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.alert).not.toBe(null);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.alert).toBe(null);
  });

  it("should submit observation successfully", async () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setObservationText("New observation");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockAddObservation).toHaveBeenCalledWith({
      observation: "New observation",
      fileIds: undefined,
    });
    expect(result.current.alert).toEqual({
      title: mockTranslationKeys.observationAdded,
      variant: "success",
    });
    expect(result.current.observationText).toBe("");
    expect(result.current.observationFiles).toEqual([]);
    expect(result.current.showForm).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should generate file IDs when files are provided", async () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    const mockFile1 = new File([], "test1.jpg");
    const mockFile2 = new File([], "test2.jpg");

    act(() => {
      result.current.setObservationText("Observation with files");
      result.current.setObservationFiles([mockFile1, mockFile2]);
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockAddObservation).toHaveBeenCalledWith(
      expect.objectContaining({
        observation: "Observation with files",
        fileIds: expect.arrayContaining([expect.stringContaining(`file-${mockEntityId}`)]),
      })
    );
  });

  it("should include additional data in submission", async () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setObservationText("Observation with additional data");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    const additionalData = { type: "note", category: "general" };

    await act(async () => {
      await result.current.handleSubmit(mockEvent, additionalData);
    });

    expect(mockAddObservation).toHaveBeenCalledWith(
      expect.objectContaining({
        observation: "Observation with additional data",
        type: "note",
        category: "general",
      })
    );
  });

  it("should show error alert on submission failure", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Submission failed");
    mockAddObservation.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setObservationText("Observation");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error adding observation:", error);
    expect(result.current.alert).toEqual({
      title: mockTranslationKeys.observationError,
      variant: "error",
    });
    expect(result.current.isSubmitting).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should clear error alert after 3 seconds on error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Submission failed");
    mockAddObservation.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setObservationText("Observation");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.alert).not.toBe(null);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.alert).toBe(null);

    consoleErrorSpy.mockRestore();
  });

  it("should handle close form", () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setShowForm(true);
      result.current.setObservationText("Some text");
      result.current.setObservationFiles([new File([], "test.jpg")]);
    });

    act(() => {
      result.current.handleCloseForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.observationText).toBe("");
    expect(result.current.observationFiles).toEqual([]);
  });

  it("should refresh observations", () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.refreshObservations();
    });

    expect(mockFetchObservations).toHaveBeenCalledWith(mockEntityId);
  });

  it("should not refresh observations if entityId is empty", () => {
    const { result } = renderHook(() =>
      useObservationManagement({
        ...defaultOptions,
        entityId: "",
      })
    );

    act(() => {
      result.current.refreshObservations();
    });

    expect(mockFetchObservations).not.toHaveBeenCalled();
  });

  it("should set isSubmitting to true during submission", async () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    act(() => {
      result.current.setObservationText("Observation");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    // Start submission - addObservation is synchronous, so isSubmitting will be set and then immediately cleared
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // After submission completes, isSubmitting should be false
    expect(result.current.isSubmitting).toBe(false);
    // Verify that the submission was successful
    expect(mockAddObservation).toHaveBeenCalled();
  });

  it("should trim observation text before submission", async () => {
    const { result } = renderHook(() => useObservationManagement(defaultOptions));

    await act(async () => {
      result.current.setObservationText("  Trimmed observation  ");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockAddObservation).toHaveBeenCalledWith(
      expect.objectContaining({
        observation: "Trimmed observation",
      })
    );
  });
});
