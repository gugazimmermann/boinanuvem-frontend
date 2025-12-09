import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

  it("should set up click event listener", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    renderHook(() => useSmoothScroll());

    expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it("should handle click on anchor with hash href", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });

  it("should prevent default on hash link click", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");
    anchor.dispatchEvent(clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should not handle click on anchor without hash", () => {
    const anchor = document.createElement("a");
    anchor.href = "/test";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should not handle click on anchor with only hash", () => {
    const anchor = document.createElement("a");
    anchor.href = "#";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should handle click on nested element inside anchor", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    const span = document.createElement("span");
    span.textContent = "Click me";
    anchor.appendChild(span);
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    span.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalled();
  });

  it("should calculate correct scroll position with header offset", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    Object.defineProperty(targetElement, "getBoundingClientRect", {
      value: () => ({
        top: 100,
        left: 0,
        bottom: 200,
        right: 100,
        width: 100,
        height: 100,
      }),
    });
    document.body.appendChild(targetElement);

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 50,
    });

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });

  it("should not scroll if target element does not exist", () => {
    const anchor = document.createElement("a");
    anchor.href = "#non-existent";
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useSmoothScroll());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
