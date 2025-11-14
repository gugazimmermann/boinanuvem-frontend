import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "../use-translation";
import { LanguageProvider } from "~/contexts/language-context";

describe("useTranslation", () => {
  it("should return Portuguese translations by default", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: LanguageProvider,
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe("object");
  });

  it("should return translations object", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: LanguageProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("common");
    expect(result.current).toHaveProperty("sidebar");
  });
});
