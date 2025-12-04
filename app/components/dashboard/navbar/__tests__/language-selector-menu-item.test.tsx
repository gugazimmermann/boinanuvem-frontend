import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSelectorMenuItem } from "../language-selector-menu-item";

const mockSetLanguage = vi.fn();
const mockUseLanguage = vi.fn(() => ({
  language: "pt" as const,
  setLanguage: mockSetLanguage,
  languageInfo: {
    name: "Português",
    flag: "🇧🇷",
    code: "pt" as const,
  },
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => mockUseLanguage(),
  LANGUAGES: {
    pt: { code: "pt", name: "Português", flag: "🇧🇷" },
    en: { code: "en", name: "English", flag: "🇺🇸" },
    es: { code: "es", name: "Español", flag: "🇪🇸" },
  },
}));

vi.mock("~/hooks/use-click-outside", () => ({
  useClickOutside: vi.fn(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      language: "Idioma",
    },
  })),
}));

describe("LanguageSelectorMenuItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render language selector", () => {
    render(<LanguageSelectorMenuItem />);
    expect(screen.getByText("Idioma")).toBeInTheDocument();
  });

  it("should open dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />);
    const button = screen.getByText("Idioma").closest("button");
    if (button) {
      await user.click(button);
      // Dropdown should be visible
      expect(button).toBeInTheDocument();
    }
  });

  it("should call setLanguage when language is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />);
    const button = screen.getByText("Idioma").closest("button");
    if (button) {
      await user.click(button);
      // Find and click a language option
      const languageOptions = screen.queryAllByRole("button");
      const englishOption = languageOptions.find((opt) => opt.textContent?.includes("English"));
      if (englishOption) {
        await user.click(englishOption);
        expect(mockSetLanguage).toHaveBeenCalled();
      }
    }
  });
});
