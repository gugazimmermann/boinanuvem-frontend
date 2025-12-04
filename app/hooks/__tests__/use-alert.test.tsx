import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { render } from "@testing-library/react";
import { useAlert } from "../use-alert";
import * as AlertComponent from "~/components/ui";

vi.mock("~/components/ui", () => ({
  Alert: vi.fn(({ title, variant }: { title: string; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>
      {title}
    </div>
  )),
}));

describe("useAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with null alert", () => {
    const { result } = renderHook(() => useAlert());

    expect(result.current.alert).toBeNull();
    expect(result.current.alertMessage).toBeNull();
  });

  it("should show alert with default variant 'success'", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Test message");
    });

    expect(result.current.alert).toEqual({
      title: "Test message",
      variant: "success",
    });
    expect(result.current.alertMessage).toEqual({
      title: "Test message",
      variant: "success",
    });
  });

  it("should show alert with specified variant", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Error message", "error");
    });

    expect(result.current.alert).toEqual({
      title: "Error message",
      variant: "error",
    });
  });

  it("should show alert with 'warning' variant", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Warning message", "warning");
    });

    expect(result.current.alert).toEqual({
      title: "Warning message",
      variant: "warning",
    });
  });

  it("should show alert with 'info' variant", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Info message", "info");
    });

    expect(result.current.alert).toEqual({
      title: "Info message",
      variant: "info",
    });
  });

  it("should clear alert", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Test message");
    });

    expect(result.current.alert).not.toBeNull();

    act(() => {
      result.current.clearAlert();
    });

    expect(result.current.alert).toBeNull();
    expect(result.current.alertMessage).toBeNull();
  });

  it("should auto-clear alert after 3000ms", async () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Test message");
    });

    expect(result.current.alert).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(3001);
    });

    expect(result.current.alert).toBeNull();
  });

  it("should clear timeout when alert is cleared manually", () => {
    const { result } = renderHook(() => useAlert());
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    act(() => {
      result.current.showAlert("Test message");
    });

    act(() => {
      result.current.clearAlert();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("should clear timeout when new alert is shown", () => {
    const { result } = renderHook(() => useAlert());
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    act(() => {
      result.current.showAlert("First message");
    });

    act(() => {
      result.current.showAlert("Second message");
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("should render AlertDisplay component when alert exists", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Test message", "error");
    });

    const AlertDisplay = result.current.AlertDisplay;
    const { container } = render(<AlertDisplay />);

    expect(container.querySelector('[data-testid="alert"]')).toBeInTheDocument();
    expect(container.querySelector('[data-variant="error"]')).toBeInTheDocument();
  });

  it("should return null from AlertDisplay when no alert", () => {
    const { result } = renderHook(() => useAlert());

    const AlertDisplay = result.current.AlertDisplay;
    const { container } = render(<AlertDisplay />);

    expect(container.firstChild).toBeNull();
  });

  it("should pass correct props to Alert component", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Success message", "success");
    });

    const AlertDisplay = result.current.AlertDisplay;
    render(<AlertDisplay />);

    expect(AlertComponent.Alert).toHaveBeenCalled();
    const callArgs = vi.mocked(AlertComponent.Alert).mock.calls[0];
    expect(callArgs?.[0]).toEqual({
      title: "Success message",
      variant: "success",
    });
  });

  it("should update alertMessage when alert changes", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("First message");
    });

    expect(result.current.alertMessage?.title).toBe("First message");

    act(() => {
      result.current.showAlert("Second message", "error");
    });

    expect(result.current.alertMessage?.title).toBe("Second message");
    expect(result.current.alertMessage?.variant).toBe("error");
  });

  it("should handle multiple showAlert calls", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("First");
    });

    act(() => {
      result.current.showAlert("Second", "warning");
    });

    act(() => {
      result.current.showAlert("Third", "info");
    });

    expect(result.current.alert?.title).toBe("Third");
    expect(result.current.alert?.variant).toBe("info");
  });

  it("should reset timeout when alert is updated", async () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("First message");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.showAlert("Second message");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.alert).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1001);
    });

    expect(result.current.alert).toBeNull();
  });
});
