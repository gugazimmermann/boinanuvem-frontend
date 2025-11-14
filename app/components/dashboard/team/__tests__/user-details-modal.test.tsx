import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDetailsModal } from "../user-details-modal";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  status: "active" as const,
  lastAccess: new Date().toISOString(),
};

describe("UserDetailsModal", () => {
  it("should not render when isOpen is false", () => {
    render(<UserDetailsModal isOpen={false} onClose={vi.fn()} user={mockUser} />, { wrapper });
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("should render user details when isOpen is true", () => {
    render(<UserDetailsModal isOpen={true} onClose={vi.fn()} user={mockUser} />, { wrapper });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should display user status", () => {
    render(<UserDetailsModal isOpen={true} onClose={vi.fn()} user={mockUser} />, { wrapper });
    expect(screen.getByText(/active|ativo/i)).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserDetailsModal isOpen={true} onClose={onClose} user={mockUser} />, { wrapper });

    const closeButton = screen.getByText(/close|fechar/i);
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserDetailsModal isOpen={true} onClose={onClose} user={mockUser} />, { wrapper });

    const backdrop = document.querySelector(".fixed.inset-0.cursor-pointer");
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should display formatted phone number", () => {
    render(<UserDetailsModal isOpen={true} onClose={vi.fn()} user={mockUser} />, { wrapper });
    const phoneText = screen.getByText(/\(\d{2}\)\s\d{4,5}-\d{4}/);
    expect(phoneText).toBeInTheDocument();
  });

  it("should display formatted date for lastAccess", () => {
    const userWithDate = {
      ...mockUser,
      lastAccess: "2024-01-15T10:30:00Z",
    };
    render(<UserDetailsModal isOpen={true} onClose={vi.fn()} user={userWithDate} />, { wrapper });
    expect(screen.getByText(/15\/01\/2024|01\/15\/2024/)).toBeInTheDocument();
  });

  it("should display dash when lastAccess is not provided", () => {
    const userWithoutDate = {
      ...mockUser,
      lastAccess: undefined,
    };
    render(<UserDetailsModal isOpen={true} onClose={vi.fn()} user={userWithoutDate} />, {
      wrapper,
    });
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should display different status values", () => {
    const statuses: Array<"active" | "inactive" | "pending"> = ["active", "inactive", "pending"];

    statuses.forEach((status) => {
      const { unmount } = render(
        <UserDetailsModal isOpen={true} onClose={vi.fn()} user={{ ...mockUser, status }} />,
        { wrapper }
      );
      expect(screen.getByText(new RegExp(status, "i"))).toBeInTheDocument();
      unmount();
    });
  });

  it("should display personal info section", () => {
    render(<UserDetailsModal isOpen={true} onClose={vi.fn()} user={mockUser} />, { wrapper });
    expect(screen.getByText(/personal info|informações pessoais/i)).toBeInTheDocument();
  });

  it("should display account info section", () => {
    render(<UserDetailsModal isOpen={true} onClose={vi.fn()} user={mockUser} />, { wrapper });
    expect(screen.getByText(/account info|informações da conta/i)).toBeInTheDocument();
  });
});
