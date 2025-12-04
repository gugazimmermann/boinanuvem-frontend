import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useClickOutside } from "../use-click-outside";

describe("useClickOutside", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockRef: React.RefObject<HTMLElement>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockRef = { current: null } as unknown as React.RefObject<HTMLElement>;
    document.body.innerHTML = "";
  });

  it("should not call onClose when isOpen is false", () => {
    const div = document.createElement("div");
    mockRef.current = div;

    renderHook(() => useClickOutside(mockRef, false, mockOnClose));

    const event = new MouseEvent("mousedown", { bubbles: true });
    document.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should call onClose when clicking outside element", () => {
    const div = document.createElement("div");
    div.setAttribute("data-testid", "inside");
    document.body.appendChild(div);
    mockRef.current = div;

    renderHook(() => useClickOutside(mockRef, true, mockOnClose));

    const outsideDiv = document.createElement("div");
    outsideDiv.setAttribute("data-testid", "outside");
    document.body.appendChild(outsideDiv);

    const event = new MouseEvent("mousedown", {
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: outsideDiv, writable: false });
    document.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when clicking inside element", () => {
    const div = document.createElement("div");
    div.setAttribute("data-testid", "inside");
    const innerDiv = document.createElement("div");
    innerDiv.setAttribute("data-testid", "inner");
    div.appendChild(innerDiv);
    document.body.appendChild(div);
    mockRef.current = div;

    renderHook(() => useClickOutside(mockRef, true, mockOnClose));

    innerDiv.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should add event listener when isOpen becomes true", () => {
    const div = document.createElement("div");
    mockRef.current = div;
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    const { rerender } = renderHook(({ isOpen }) => useClickOutside(mockRef, isOpen, mockOnClose), {
      initialProps: { isOpen: false },
    });

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    rerender({ isOpen: true });

    expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it("should remove event listener when isOpen becomes false", () => {
    const div = document.createElement("div");
    mockRef.current = div;
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { rerender } = renderHook(({ isOpen }) => useClickOutside(mockRef, isOpen, mockOnClose), {
      initialProps: { isOpen: true },
    });

    rerender({ isOpen: false });

    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it("should remove event listener on unmount", () => {
    const div = document.createElement("div");
    mockRef.current = div;
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useClickOutside(mockRef, true, mockOnClose));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it("should handle null ref.current", () => {
    (mockRef as { current: HTMLElement | null }).current = null;

    renderHook(() => useClickOutside(mockRef, true, mockOnClose));

    const event = new MouseEvent("mousedown", { bubbles: true });
    document.body.dispatchEvent(event);

    // When ref.current is null, the hook should not call onClose
    // because there's no element to check containment against
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should update when onClose changes", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    mockRef.current = div;

    const newOnClose = vi.fn();

    const { rerender } = renderHook(({ onClose }) => useClickOutside(mockRef, true, onClose), {
      initialProps: { onClose: mockOnClose },
    });

    const outsideDiv = document.createElement("div");
    document.body.appendChild(outsideDiv);

    const event = new MouseEvent("mousedown", {
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: outsideDiv, writable: false });
    document.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    rerender({ onClose: newOnClose });

    const event2 = new MouseEvent("mousedown", {
      bubbles: true,
    });
    Object.defineProperty(event2, "target", { value: outsideDiv, writable: false });
    document.dispatchEvent(event2);

    expect(newOnClose).toHaveBeenCalledTimes(1);
  });

  it("should handle ref change", () => {
    const div1 = document.createElement("div");
    div1.setAttribute("data-testid", "ref1");
    document.body.appendChild(div1);

    const div2 = document.createElement("div");
    div2.setAttribute("data-testid", "ref2");
    document.body.appendChild(div2);

    const { rerender } = renderHook(({ ref }) => useClickOutside(ref, true, mockOnClose), {
      initialProps: { ref: { current: div1 } },
    });

    const outsideDiv = document.createElement("div");
    document.body.appendChild(outsideDiv);

    const event = new MouseEvent("mousedown", {
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: div2, writable: false });
    document.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    rerender({ ref: { current: div2 } });

    const event2 = new MouseEvent("mousedown", {
      bubbles: true,
    });
    Object.defineProperty(event2, "target", { value: div1, writable: false });
    document.dispatchEvent(event2);

    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
