import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSmoothScroll } from "../use-smooth-scroll";

describe("useSmoothScroll", () => {
  let mockScrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockScrollTo = vi.fn();
    window.scrollTo = mockScrollTo;
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should set up click event listener", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() => useSmoothScroll());

    expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
  });

  it("should handle anchor click with valid target", () => {
    const targetId = "test-section";
    const element = document.createElement("div");
    element.id = targetId;
    document.body.appendChild(element);

    const getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 0,
      bottom: 200,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 100,
      toJSON: vi.fn(),
    }));
    element.getBoundingClientRect = getBoundingClientRect;

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 0,
    });

    const anchor = document.createElement("a");
    anchor.href = `#${targetId}`;
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 20,
      behavior: "smooth",
    });
  });

  it("should not scroll if target element does not exist", () => {
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

  it("should not scroll for anchor with only #", () => {
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

  it("should not scroll for non-anchor elements", () => {
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

  it("should handle nested elements inside anchor", () => {
    const targetId = "test-section";
    const element = document.createElement("div");
    element.id = targetId;
    document.body.appendChild(element);

    const getBoundingClientRect = vi.fn(() => ({
      top: 200,
      left: 0,
      bottom: 300,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 200,
      toJSON: vi.fn(),
    }));
    element.getBoundingClientRect = getBoundingClientRect;

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 50,
    });

    const anchor = document.createElement("a");
    anchor.href = `#${targetId}`;
    const span = document.createElement("span");
    span.textContent = "Click me";
    anchor.appendChild(span);
    document.body.appendChild(anchor);

    renderHook(() => useSmoothScroll());

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    span.dispatchEvent(clickEvent);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 170,
      behavior: "smooth",
    });
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useSmoothScroll());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
  });
});
