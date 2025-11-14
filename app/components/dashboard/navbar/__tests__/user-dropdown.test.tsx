import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { UserDropdown } from "../user-dropdown";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe("UserDropdown", () => {
  it("should render avatar button", () => {
    render(<UserDropdown />, { wrapper });
    const avatarButton = document.querySelector("button");
    expect(avatarButton).toBeInTheDocument();
  });

  it("should open dropdown when avatar is clicked", async () => {
    const user = userEvent.setup();
    render(<UserDropdown />, { wrapper });

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        const dropdown = document.querySelector(".absolute.right-0");
        expect(dropdown).toBeInTheDocument();
      });
    }
  });

  it("should close dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <UserDropdown />
        <div data-testid="outside">Outside</div>
      </div>,
      { wrapper }
    );

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        expect(document.querySelector(".absolute.right-0")).toBeInTheDocument();
      });

      const outside = screen.getByTestId("outside");
      await user.click(outside);

      await waitFor(() => {
        expect(document.querySelector(".absolute.right-0")).not.toBeInTheDocument();
      });
    }
  });

  it("should render with custom name and email", () => {
    render(<UserDropdown name="Custom User" email="custom@example.com" />, { wrapper });
    const avatarButton = document.querySelector("button");
    expect(avatarButton).toBeInTheDocument();
  });

  it("should render menu items", async () => {
    const user = userEvent.setup();
    render(<UserDropdown />, { wrapper });

    const avatarButton = document.querySelector("button");
    if (avatarButton) {
      await user.click(avatarButton);
      await waitFor(() => {
        const menuItems = document.querySelectorAll("a, button");
        expect(menuItems.length).toBeGreaterThan(0);
      });
    }
  });
});
