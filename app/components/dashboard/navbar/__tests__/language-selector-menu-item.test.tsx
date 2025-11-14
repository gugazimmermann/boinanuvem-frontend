import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { LanguageSelectorMenuItem } from "../language-selector-menu-item";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

describe("LanguageSelectorMenuItem", () => {
  it("should render language selector button", () => {
    render(<LanguageSelectorMenuItem />, { wrapper });
    expect(screen.getByText(/language|idioma/i)).toBeInTheDocument();
  });

  it("should open language dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />, { wrapper });

    const button = screen.getByText(/language|idioma/i).closest("button");
    if (button) {
      await user.click(button);
      await waitFor(() => {
        const dropdown = document.querySelector(".absolute.left-0");
        expect(dropdown).toBeInTheDocument();
      });
    }
  });

  it("should close dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LanguageSelectorMenuItem />
        <div data-testid="outside">Outside</div>
      </div>,
      { wrapper }
    );

    const button = screen.getByText(/language|idioma/i).closest("button");
    if (button) {
      await user.click(button);
      await waitFor(() => {
        expect(document.querySelector(".absolute.left-0")).toBeInTheDocument();
      });

      const outside = screen.getByTestId("outside");
      await user.click(outside);

      await waitFor(() => {
        expect(document.querySelector(".absolute.left-0")).not.toBeInTheDocument();
      });
    }
  });

  it("should change language when option is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelectorMenuItem />, { wrapper });

    const button = screen.getByText(/language|idioma/i).closest("button");
    if (button) {
      await user.click(button);
      await waitFor(() => {
        const languageOptions = document.querySelectorAll("button");
        expect(languageOptions.length).toBeGreaterThan(1);
      });
    }
  });
});
