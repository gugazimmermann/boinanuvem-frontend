import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { useClickOutside } from "../use-click-outside";

describe("useClickOutside", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    mockOnClose = vi.fn();
    container = document.createElement("div");
    element = document.createElement("div");
    container.appendChild(element);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it("should call onClose when clicking outside the element", () => {
    const ref = { current: element };
    renderHook(
      ({ isOpen }) => {
        useClickOutside(ref, isOpen, mockOnClose);
      },
      { initialProps: { isOpen: true } }
    );

    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    const event = new MouseEvent("mousedown", { bubbles: true });
    outsideElement.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    document.body.removeChild(outsideElement);
  });

  it("should not call onClose when clicking inside the element", () => {
    const ref = { current: element };
    renderHook(() => {
      useClickOutside(ref, true, mockOnClose);
    });

    const event = new MouseEvent("mousedown", { bubbles: true });
    element.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should not attach event listener when isOpen is false", () => {
    const ref = { current: element };
    renderHook(() => {
      useClickOutside(ref, false, mockOnClose);
    });

    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    const event = new MouseEvent("mousedown", { bubbles: true });
    outsideElement.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();

    document.body.removeChild(outsideElement);
  });

  it("should remove event listener on cleanup", () => {
    const ref = { current: element };
    const { unmount } = renderHook(() => {
      useClickOutside(ref, true, mockOnClose);
    });

    unmount();

    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    const event = new MouseEvent("mousedown", { bubbles: true });
    outsideElement.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();

    document.body.removeChild(outsideElement);
  });

  it("should handle null ref gracefully", () => {
    const ref = { current: null } as unknown as RefObject<HTMLElement>;
    renderHook(() => {
      useClickOutside(ref, true, mockOnClose);
    });

    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    const event = new MouseEvent("mousedown", { bubbles: true });
    outsideElement.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();

    document.body.removeChild(outsideElement);
  });

  it("should update when isOpen changes", () => {
    const ref = { current: element };
    const { rerender } = renderHook(
      ({ isOpen }) => {
        useClickOutside(ref, isOpen, mockOnClose);
      },
      { initialProps: { isOpen: false } }
    );

    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    const event = new MouseEvent("mousedown", { bubbles: true });
    outsideElement.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();

    rerender({ isOpen: true });
    outsideElement.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    document.body.removeChild(outsideElement);
  });

  it("should handle multiple rapid clicks", () => {
    const ref = { current: element };
    renderHook(() => {
      useClickOutside(ref, true, mockOnClose);
    });

    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);

    for (let i = 0; i < 5; i++) {
      const event = new MouseEvent("mousedown", { bubbles: true });
      outsideElement.dispatchEvent(event);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(5);

    document.body.removeChild(outsideElement);
  });
});
