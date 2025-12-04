import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFinanceTransactionRoute } from "../use-finance-transaction-route";
import * as reactRouter from "react-router";

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));

describe("useFinanceTransactionRoute", () => {
  const mockNavigate = vi.fn();
  const mockOnAddObservation = vi.fn();
  const mockGenerateFileId = vi.fn((index: number) => `file-${index}`);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(reactRouter.useNavigate).mockReturnValue(mockNavigate);
  });

  it("should initialize with empty observation and files", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    expect(result.current.observation).toBe("");
    expect(result.current.observationFiles).toEqual([]);
  });

  it("should update observation", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    act(() => {
      result.current.setObservation("Test observation");
    });

    expect(result.current.observation).toBe("Test observation");
  });

  it("should update observation files", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    const mockFile = new File(["content"], "test.txt", { type: "text/plain" });

    act(() => {
      result.current.setObservationFiles([mockFile]);
    });

    expect(result.current.observationFiles).toEqual([mockFile]);
  });

  it("should submit observation with trimmed text", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    act(() => {
      result.current.setObservation("  Test observation  ");
    });

    act(() => {
      result.current.handleObservationSubmit("transaction-1");
    });

    expect(mockOnAddObservation).toHaveBeenCalledWith(
      "transaction-1",
      "Test observation",
      undefined
    );
  });

  it("should submit observation with file IDs when files are present", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    const mockFile1 = new File(["content1"], "test1.txt", { type: "text/plain" });
    const mockFile2 = new File(["content2"], "test2.txt", { type: "text/plain" });

    act(() => {
      result.current.setObservation("Test observation");
      result.current.setObservationFiles([mockFile1, mockFile2]);
    });

    act(() => {
      result.current.handleObservationSubmit("transaction-1");
    });

    expect(mockOnAddObservation).toHaveBeenCalledWith("transaction-1", "Test observation", [
      "file-0",
      "file-1",
    ]);
  });

  it("should not submit observation when observation is empty", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    act(() => {
      result.current.handleObservationSubmit("transaction-1");
    });

    expect(mockOnAddObservation).not.toHaveBeenCalled();
  });

  it("should not submit observation when observation is only whitespace", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    act(() => {
      result.current.setObservation("   ");
    });

    act(() => {
      result.current.handleObservationSubmit("transaction-1");
    });

    expect(mockOnAddObservation).not.toHaveBeenCalled();
  });

  it("should navigate after success with delay", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard/finances",
        onAddObservation: mockOnAddObservation,
        generateFileId: mockGenerateFileId,
      })
    );

    act(() => {
      result.current.handleSuccess();
    });

    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1501);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/finances");

    vi.useRealTimers();
  });

  it("should generate file IDs correctly", () => {
    const customGenerateFileId = vi.fn((index: number) => `custom-file-${index}`);

    const { result } = renderHook(() =>
      useFinanceTransactionRoute({
        onSuccessNavigate: "/dashboard",
        onAddObservation: mockOnAddObservation,
        generateFileId: customGenerateFileId,
      })
    );

    const mockFile = new File(["content"], "test.txt", { type: "text/plain" });

    act(() => {
      result.current.setObservation("Test");
      result.current.setObservationFiles([mockFile]);
    });

    act(() => {
      result.current.handleObservationSubmit("transaction-1");
    });

    expect(customGenerateFileId).toHaveBeenCalledWith(0);
    expect(mockOnAddObservation).toHaveBeenCalledWith("transaction-1", "Test", ["custom-file-0"]);
  });
});
