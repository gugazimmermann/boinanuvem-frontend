import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scrollToSection, useSmoothScroll } from "../utils";

describe("scrollToSection", () => {
  const originalScrollTo = globalThis.window.scrollTo;
  const mockScrollTo = vi.fn();

  beforeEach(() => {
    globalThis.window.scrollTo = mockScrollTo;
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.window.scrollTo = originalScrollTo;
    document.body.innerHTML = "";
  });

  it("should scroll to section with valid element and default offset", () => {
    const element = document.createElement("div");
    element.id = "test-section";
    document.body.appendChild(element);

    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({
        top: 100,
        left: 0,
        bottom: 200,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    Object.defineProperty(globalThis.window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 50,
    });

    scrollToSection("test-section");

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 70, // 100 + 50 - 80 (default offset)
      behavior: "smooth",
    });
  });

  it("should scroll to section with custom offset", () => {
    const element = document.createElement("div");
    element.id = "test-section";
    document.body.appendChild(element);

    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({
        top: 200,
        left: 0,
        bottom: 300,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    Object.defineProperty(globalThis.window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 100,
    });

    scrollToSection("test-section", 50);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 250, // 200 + 100 - 50 (custom offset)
      behavior: "smooth",
    });
  });

  it("should not scroll when element does not exist", () => {
    scrollToSection("non-existent-section");

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should handle zero offset", () => {
    const element = document.createElement("div");
    element.id = "test-section";
    document.body.appendChild(element);

    Object.defineProperty(element, "getBoundingClientRect", {
      value: () => ({
        top: 100,
        left: 0,
        bottom: 200,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    Object.defineProperty(globalThis.window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 50,
    });

    scrollToSection("test-section", 0);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 150, // 100 + 50 - 0
      behavior: "smooth",
    });
  });
});

describe("useSmoothScroll", () => {
  const originalScrollTo = globalThis.window.scrollTo;
  const mockScrollTo = vi.fn();

  beforeEach(() => {
    globalThis.window.scrollTo = mockScrollTo;
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.window.scrollTo = originalScrollTo;
    document.body.innerHTML = "";
  });

  it("should return undefined when window is undefined (SSR)", () => {
    // Temporarily remove window
    const originalWindowValue = globalThis.window;
    // @ts-expect-error - intentionally setting to undefined for SSR test
    globalThis.window = undefined;

    const result = useSmoothScroll();

    expect(result).toBeUndefined();

    // Restore window
    globalThis.window = originalWindowValue;
  });

  it("should set up click event listener", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    useSmoothScroll();

    expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it("should handle click on anchor with valid hash href", () => {
    const targetElement = document.createElement("div");
    targetElement.id = "test-section";
    document.body.appendChild(targetElement);

    const anchor = document.createElement("a");
    anchor.href = "#test-section";
    document.body.appendChild(anchor);

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

    Object.defineProperty(globalThis.window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 50,
    });

    useSmoothScroll();

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    Object.defineProperty(clickEvent, "preventDefault", {
      value: vi.fn(),
      writable: true,
    });
    anchor.dispatchEvent(clickEvent);

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });

  it("should not handle click on anchor with only hash (#)", () => {
    const anchor = document.createElement("a");
    anchor.href = "#";
    document.body.appendChild(anchor);

    useSmoothScroll();

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should not handle click on anchor without hash href", () => {
    const anchor = document.createElement("a");
    anchor.href = "/some-page";
    document.body.appendChild(anchor);

    useSmoothScroll();

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should return cleanup function that removes event listener", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const cleanup = useSmoothScroll();

    expect(typeof cleanup).toBe("function");

    if (cleanup) {
      cleanup();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    }

    removeEventListenerSpy.mockRestore();
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

    Object.defineProperty(globalThis.window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 50,
    });

    useSmoothScroll();

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    Object.defineProperty(clickEvent, "preventDefault", {
      value: vi.fn(),
      writable: true,
    });
    span.dispatchEvent(clickEvent);

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(mockScrollTo).toHaveBeenCalled();
  });

  it("should not scroll if target element does not exist", () => {
    const anchor = document.createElement("a");
    anchor.href = "#non-existent";
    document.body.appendChild(anchor);

    useSmoothScroll();

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    Object.defineProperty(clickEvent, "preventDefault", {
      value: vi.fn(),
      writable: true,
    });
    anchor.dispatchEvent(clickEvent);

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should not handle click on non-anchor elements", () => {
    const button = document.createElement("button");
    button.textContent = "Click me";
    document.body.appendChild(button);

    useSmoothScroll();

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    button.dispatchEvent(clickEvent);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});
