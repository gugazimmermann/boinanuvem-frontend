import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDetailsModal } from "../user-details-modal";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
      className,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
      className?: string;
    }) => (
      <button onClick={onClick} data-variant={variant} className={className}>
        {children}
      </button>
    )
  ),
}));

vi.mock("~/components/site/utils/masks", () => ({
  maskPhone: vi.fn((phone: string) => phone),
}));

describe("UserDetailsModal", () => {
  const defaultUser = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    status: "active" as const,
    lastAccess: "2024-01-01T00:00:00Z",
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    user: defaultUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    expect(screen.queryByText(/user details/i)).not.toBeInTheDocument();
  });

  it("should render modal when isOpen is true", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/user details/i)).toBeInTheDocument();
  });

  it("should display user name", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should display user email", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should display user phone", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  it("should display user status", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("should display formatted last access date", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    // Date should be formatted - check for date pattern (contains digits and date separators)
    const lastAccessLabel = screen.getByText(/last access/i);
    expect(lastAccessLabel).toBeInTheDocument();
    // The formatted date should be in the same parent as the label
    const dateText = lastAccessLabel.parentElement?.querySelector("p");
    expect(dateText).toBeInTheDocument();
    expect(dateText?.textContent).toMatch(/\d/); // Should contain at least one digit
  });

  it("should display '-' when lastAccess is undefined", () => {
    const userWithoutAccess = {
      ...defaultUser,
      lastAccess: undefined,
    };

    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} user={userWithoutAccess} />
      </TestWrapper>
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    // Get all buttons and find the one that's not the backdrop (which has aria-label)
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find((btn) => btn.getAttribute("aria-label") !== "Close modal");
    expect(closeButton).toBeDefined();
    if (closeButton) {
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    const backdrop = screen.getByLabelText("Close modal");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should display personal info section", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/personal info/i)).toBeInTheDocument();
  });

  it("should display account info section", () => {
    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/account info/i)).toBeInTheDocument();
  });

  it("should handle different status values", () => {
    const inactiveUser = {
      ...defaultUser,
      status: "inactive" as const,
    };

    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} user={inactiveUser} />
      </TestWrapper>
    );

    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it("should handle pending status", () => {
    const pendingUser = {
      ...defaultUser,
      status: "pending" as const,
    };

    render(
      <TestWrapper>
        <UserDetailsModal {...defaultProps} user={pendingUser} />
      </TestWrapper>
    );

    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });
});
