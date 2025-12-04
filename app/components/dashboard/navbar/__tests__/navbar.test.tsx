import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "../navbar";
import { BrowserRouter } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

vi.mock("../user-dropdown", () => ({
  UserDropdown: vi.fn(() => <div data-testid="user-dropdown">User Dropdown</div>),
}));

vi.mock("../../../routes.config", () => ({
  ROUTES: {
    DASHBOARD: "/dashboard",
  },
}));

describe("Navbar", () => {
  const defaultProps = {
    onToggleSidebar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navbar", () => {
    render(
      <TestWrapper>
        <Navbar {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render hamburger button", () => {
    render(
      <TestWrapper>
        <Navbar {...defaultProps} />
      </TestWrapper>
    );
    const hamburgerButton = document.querySelector("[data-hamburger-button]");
    expect(hamburgerButton).toBeInTheDocument();
  });

  it("should call onToggleSidebar when hamburger button is clicked", async () => {
    const onToggleSidebar = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Navbar onToggleSidebar={onToggleSidebar} />
      </TestWrapper>
    );
    const hamburgerButton = document.querySelector("[data-hamburger-button]") as HTMLButtonElement;
    await user.click(hamburgerButton);
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("should render UserDropdown", () => {
    render(
      <TestWrapper>
        <Navbar {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("user-dropdown")).toBeInTheDocument();
  });

  it("should render link to dashboard", () => {
    render(
      <TestWrapper>
        <Navbar {...defaultProps} />
      </TestWrapper>
    );
    const link = screen.getByText("Boi na Nuvem").closest("a");
    expect(link).toHaveAttribute("href", "/dashboard");
  });
});
