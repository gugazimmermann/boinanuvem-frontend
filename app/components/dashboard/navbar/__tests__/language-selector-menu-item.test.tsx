import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSelectorMenuItem } from "../language-selector-menu-item";
import { useLanguage, LANGUAGES } from "~/contexts/language-context";
import { useTranslation } from "~/i18n";
import { useClickOutside } from "~/hooks/use-click-outside";

vi.mock("~/contexts/language-context");
vi.mock("~/i18n");
vi.mock("~/hooks/use-click-outside");

describe("LanguageSelectorMenuItem", () => {
  const mockUseLanguage = vi.mocked(useLanguage);
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseClickOutside = vi.mocked(useClickOutside);
  const mockSetLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      language: "pt",
      setLanguage: mockSetLanguage,
      languageInfo: LANGUAGES.pt,
    });
    mockUseTranslation.mockReturnValue({
      common: { language: "Idioma" },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseClickOutside.mockImplementation(() => {});
  });

  it("should render language selector button", () => {
    render(<LanguageSelectorMenuItem />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should display current language name", () => {
    render(<LanguageSelectorMenuItem />);
    expect(screen.getByText(LANGUAGES.pt.name)).toBeInTheDocument();
  });

  it("should toggle dropdown when button is clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const languageButtons = screen.getAllByRole("button");
      expect(languageButtons.length).toBeGreaterThan(1);
    });
  });

  it("should render all available languages when open", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      Object.values(LANGUAGES).forEach((lang) => {
        const elements = screen.getAllByText(lang.name);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  it("should call setLanguage when language is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const enButton = screen.getByText(LANGUAGES.en.name).closest("button");
      if (enButton) {
        user.click(enButton);
      }
    });

    await waitFor(() => {
      expect(mockSetLanguage).toHaveBeenCalledWith("en");
    });
  });

  it("should show checkmark for current language", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />);

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    await waitFor(() => {
      screen.getAllByText(LANGUAGES.pt.name);
      // Find the button in the dropdown (not the toggle button)
      const dropdownButtons = screen.getAllByRole("button");
      const currentLangButton = dropdownButtons.find(
        (btn) => btn.textContent?.includes(LANGUAGES.pt.name) && btn !== toggleButton
      );
      expect(currentLangButton).toHaveClass("bg-gray-100", "dark:bg-gray-700");
    });
  });
});
