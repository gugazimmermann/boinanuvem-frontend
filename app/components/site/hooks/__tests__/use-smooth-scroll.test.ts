import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSmoothScroll } from "../use-smooth-scroll";

describe("useSmoothScroll", () => {
  const originalScrollTo = window.scrollTo;
  const mockScrollTo = vi.fn();

  beforeEach(() => {
    window.scrollTo = mockScrollTo;
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    document.body.innerHTML = "";
  });

  it("should add click event listener on mount", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() => useSmoothScroll());

    expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
  });

  it("should remove click event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useSmoothScroll());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
  });

  it("should scroll to element when clicking anchor with hash href", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    targetElement.style.height = "1000px";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    document.body.appendChild(anchor);

    const getBoundingClientRectSpy = vi.spyOn(targetElement, "getBoundingClientRect");
    getBoundingClientRectSpy.mockReturnValue({
      top: 500,
      left: 0,
      bottom: 1500,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 0,
    });

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 420, // 500 - 80 (HEADER_HEIGHT)
      behavior: "smooth",
    });
  });

  it("should not scroll when clicking anchor with href='#'", () => {
    const anchor = document.createElement("a");
    anchor.href = "#";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should not scroll when clicking anchor without hash", () => {
    const anchor = document.createElement("a");
    anchor.href = "/test";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should not scroll when target element does not exist", () => {
    const anchor = document.createElement("a");
    anchor.href = "#non-existent";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should prevent default when scrolling", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    document.body.appendChild(anchor);

    const getBoundingClientRectSpy = vi.spyOn(targetElement, "getBoundingClientRect");
    getBoundingClientRectSpy.mockReturnValue({
      top: 500,
      left: 0,
      bottom: 500,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 0,
    });

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    anchor.dispatchEvent(clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should handle nested elements inside anchor", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    const span = document.createElement("span");
    span.textContent = "Click me";
    anchor.appendChild(span);
    document.body.appendChild(anchor);

    const getBoundingClientRectSpy = vi.spyOn(targetElement, "getBoundingClientRect");
    getBoundingClientRectSpy.mockReturnValue({
      top: 500,
      left: 0,
      bottom: 500,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 0,
    });

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    span.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalled();
  });

  it("should calculate correct scroll position with pageYOffset", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    document.body.appendChild(anchor);

    const getBoundingClientRectSpy = vi.spyOn(targetElement, "getBoundingClientRect");
    getBoundingClientRectSpy.mockReturnValue({
      top: 1000,
      left: 0,
      bottom: 2000,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 500,
    });

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 1420, // 1000 + 500 - 80 (HEADER_HEIGHT)
      behavior: "smooth",
    });
  });

  it("should not scroll when clicking non-anchor elements", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    button.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});
