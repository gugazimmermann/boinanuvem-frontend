import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Navbar } from "../navbar";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import type { TeamUser } from "~/types";

const mockUser: TeamUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  role: "user",
  status: "active",
  mainUser: false,
  companyId: "company-id",
  createdAt: "2025-01-01",
  permissions: {} as never,
};

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn((id: string) => {
    if (id === "test-user-id") return mockUser;
    return null;
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("currentUserId", "test-user-id");
  }
  return (
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("Navbar", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
  });

  it("should render brand link", () => {
    render(<Navbar />, { wrapper });
    const brandLink = screen.getByText("Boi na Nuvem");
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("should render user dropdown", () => {
    const { container } = render(<Navbar />, { wrapper });
    const userDropdown = container.querySelector('[class*="relative"]');
    expect(userDropdown).toBeInTheDocument();
  });
});
