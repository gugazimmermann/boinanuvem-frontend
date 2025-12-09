import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import { useAlert } from "../use-alert";

describe("useAlert", () => {
  beforeEach(() => {
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

  it("should set alert when showAlert is called", () => {
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

  it("should use default variant 'success' when variant not provided", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Test message");
    });

    expect(result.current.alert?.variant).toBe("success");
  });

  it("should set alert with specified variant", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Error message", "error");
    });

    expect(result.current.alert).toEqual({
      title: "Error message",
      variant: "error",
    });
  });

  it("should clear alert when clearAlert is called", () => {
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

  it("should auto-dismiss alert after 3 seconds", async () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Test message");
    });

    expect(result.current.alert).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.alert).toBeNull();
  });

  it("should clear timeout when alert is cleared manually", () => {
    const { result } = renderHook(() => useAlert());

    act(() => {
      result.current.showAlert("Test message");
    });

    act(() => {
      result.current.clearAlert();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.alert).toBeNull();
  });

  it("should clear timeout when new alert is shown", async () => {
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

    expect(result.current.alert?.title).toBe("Second message");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.alert).toBeNull();
  });

  it("should support all alert variants", () => {
    const { result } = renderHook(() => useAlert());
    const variants: Array<"success" | "error" | "warning" | "info"> = [
      "success",
      "error",
      "warning",
      "info",
    ];

    variants.forEach((variant) => {
      act(() => {
        result.current.showAlert(`Test ${variant}`, variant);
      });

      expect(result.current.alert?.variant).toBe(variant);
    });
  });

  describe("AlertDisplay", () => {
    it("should return null when no alert is set", () => {
      const { result } = renderHook(() => useAlert());

      const AlertDisplay = result.current.AlertDisplay;
      const { container } = render(<AlertDisplay />);

      expect(container.firstChild).toBeNull();
    });

    it("should render alert component when alert is set", () => {
      const { result } = renderHook(() => useAlert());

      act(() => {
        result.current.showAlert("Test message", "success");
      });

      const AlertDisplay = result.current.AlertDisplay;
      render(<AlertDisplay />);

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should render alert with correct variant", () => {
      const { result } = renderHook(() => useAlert());

      act(() => {
        result.current.showAlert("Error message", "error");
      });

      const AlertDisplay = result.current.AlertDisplay;
      const { container } = render(<AlertDisplay />);

      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(container.querySelector(".bg-red-500")).toBeInTheDocument();
    });

    it("should update when alert changes", () => {
      const { result, rerender: rerenderHook } = renderHook(() => useAlert());

      act(() => {
        result.current.showAlert("First message");
      });

      const AlertDisplay1 = result.current.AlertDisplay;
      const { rerender } = render(<AlertDisplay1 />);

      expect(screen.getByText("First message")).toBeInTheDocument();

      act(() => {
        result.current.showAlert("Second message", "error");
      });

      rerenderHook();
      const AlertDisplay2 = result.current.AlertDisplay;
      rerender(<AlertDisplay2 />);

      expect(screen.getByText("Second message")).toBeInTheDocument();
    });
  });
});
