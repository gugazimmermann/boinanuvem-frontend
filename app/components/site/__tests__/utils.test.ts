import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scrollToSection, useSmoothScroll } from "../utils";

describe("site/utils", () => {
  beforeEach(() => {
    // Mock window.scrollTo
    globalThis.window.scrollTo = vi.fn();
    globalThis.window.pageYOffset = 0;

    // Create a mock element
    const mockElement = document.createElement("div");
    mockElement.id = "test-section";
    mockElement.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 0,
      bottom: 200,
      right: 0,
      width: 100,
      height: 100,
      x: 0,
      y: 100,
      toJSON: vi.fn(),
    }));
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  describe("scrollToSection", () => {
    it("should scroll to element when element exists", () => {
      scrollToSection("test-section");

      expect(globalThis.window.scrollTo).toHaveBeenCalledWith({
        top: 20, // 100 (top) + 0 (pageYOffset) - 80 (default offset)
        behavior: "smooth",
      });
    });

    it("should use custom offset when provided", () => {
      scrollToSection("test-section", 50);

      expect(globalThis.window.scrollTo).toHaveBeenCalledWith({
        top: 50, // 100 (top) + 0 (pageYOffset) - 50 (custom offset)
        behavior: "smooth",
      });
    });

    it("should handle pageYOffset in calculation", () => {
      globalThis.window.pageYOffset = 200;

      scrollToSection("test-section", 80);

      expect(globalThis.window.scrollTo).toHaveBeenCalledWith({
        top: 220, // 100 (top) + 200 (pageYOffset) - 80 (offset)
        behavior: "smooth",
      });
    });

    it("should not scroll when element does not exist", () => {
      scrollToSection("non-existent-section");

      expect(globalThis.window.scrollTo).not.toHaveBeenCalled();
    });

    it("should handle zero offset", () => {
      scrollToSection("test-section", 0);

      expect(globalThis.window.scrollTo).toHaveBeenCalledWith({
        top: 100, // 100 (top) + 0 (pageYOffset) - 0 (offset)
        behavior: "smooth",
      });
    });

    it("should handle negative offset", () => {
      scrollToSection("test-section", -20);

      expect(globalThis.window.scrollTo).toHaveBeenCalledWith({
        top: 120, // 100 (top) + 0 (pageYOffset) - (-20) (negative offset)
        behavior: "smooth",
      });
    });
  });

  describe("useSmoothScroll", () => {
    it("should return undefined when window is undefined", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - testing undefined window
      globalThis.window = undefined;

      const result = useSmoothScroll();

      expect(result).toBeUndefined();
      globalThis.window = originalWindow;
    });

    it("should add click event listener", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      useSmoothScroll();

      expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("should handle anchor click and scroll to section", () => {
      const cleanup = useSmoothScroll();

      // Create an anchor element
      const anchor = document.createElement("a");
      anchor.href = "#test-section";
      document.body.appendChild(anchor);

      // Create the target section
      const section = document.createElement("div");
      section.id = "test-section";
      section.getBoundingClientRect = vi.fn(() => ({
        top: 200,
        left: 0,
        bottom: 300,
        right: 0,
        width: 100,
        height: 100,
        x: 0,
        y: 200,
        toJSON: vi.fn(),
      }));
      document.body.appendChild(section);

      // Simulate click
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: anchor,
        enumerable: true,
      });
      anchor.dispatchEvent(clickEvent);

      expect(globalThis.window.scrollTo).toHaveBeenCalled();

      if (cleanup) cleanup();
    });

    it("should prevent default on anchor click", () => {
      useSmoothScroll();

      const anchor = document.createElement("a");
      anchor.href = "#test-section";
      document.body.appendChild(anchor);

      const section = document.createElement("div");
      section.id = "test-section";
      section.getBoundingClientRect = vi.fn(() => ({
        top: 200,
        left: 0,
        bottom: 300,
        right: 0,
        width: 100,
        height: 100,
        x: 0,
        y: 200,
        toJSON: vi.fn(),
      }));
      document.body.appendChild(section);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: anchor,
        enumerable: true,
      });

      const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");
      anchor.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should not handle clicks on non-anchor elements", () => {
      useSmoothScroll();

      const button = document.createElement("button");
      document.body.appendChild(button);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: button,
        enumerable: true,
      });
      button.dispatchEvent(clickEvent);

      expect(globalThis.window.scrollTo).not.toHaveBeenCalled();
    });

    it("should not handle clicks on anchors without hash href", () => {
      useSmoothScroll();

      const anchor = document.createElement("a");
      anchor.href = "https://example.com";
      document.body.appendChild(anchor);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: anchor,
        enumerable: true,
      });
      anchor.dispatchEvent(clickEvent);

      expect(globalThis.window.scrollTo).not.toHaveBeenCalled();
    });

    it("should not handle clicks on anchors with only hash", () => {
      useSmoothScroll();

      const anchor = document.createElement("a");
      anchor.href = "#";
      document.body.appendChild(anchor);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: anchor,
        enumerable: true,
      });
      anchor.dispatchEvent(clickEvent);

      expect(globalThis.window.scrollTo).not.toHaveBeenCalled();
    });

    it("should handle clicks on nested elements within anchor", () => {
      const cleanup = useSmoothScroll();

      const anchor = document.createElement("a");
      anchor.href = "#test-section";
      const span = document.createElement("span");
      span.textContent = "Click me";
      anchor.appendChild(span);
      document.body.appendChild(anchor);

      const section = document.createElement("div");
      section.id = "test-section";
      section.getBoundingClientRect = vi.fn(() => ({
        top: 200,
        left: 0,
        bottom: 300,
        right: 0,
        width: 100,
        height: 100,
        x: 0,
        y: 200,
        toJSON: vi.fn(),
      }));
      document.body.appendChild(section);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, "target", {
        value: span,
        enumerable: true,
      });
      span.dispatchEvent(clickEvent);

      expect(globalThis.window.scrollTo).toHaveBeenCalled();

      if (cleanup) cleanup();
    });

    it("should return cleanup function that removes event listener", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const cleanup = useSmoothScroll();

      expect(cleanup).toBeInstanceOf(Function);

      if (cleanup) {
        cleanup();
        expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
      }
    });
  });
});
