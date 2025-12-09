import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDetailsModal } from "../user-details-modal";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";

vi.mock("~/i18n");
vi.mock("~/contexts/language-context");
vi.mock("~/components/ui", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("UserDetailsModal", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseLanguage = vi.mocked(useLanguage);

  const mockUser = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    status: "active" as const,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      team: {
        userDetails: {
          title: "User Details",
          personalInfo: "Personal Information",
          accountInfo: "Account Information",
          close: "Close",
        },
        table: {
          name: "Name",
          email: "Email",
          status: "Status",
          lastAccess: "Last Access",
        },
        addModal: {
          fields: {
            phone: "Phone",
          },
        },
        status: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseLanguage.mockReturnValue({ language: "pt" });
  });

  it("should render modal when open", () => {
    render(<UserDetailsModal {...defaultProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should not render modal when closed", () => {
    const { container } = render(<UserDetailsModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should display user information", () => {
    render(<UserDetailsModal {...defaultProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UserDetailsModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByText("Close");
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UserDetailsModal {...defaultProps} onClose={onClose} />);

    // Find the backdrop button by its aria-label
    const backdrop = screen.getByLabelText("Close modal");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should format date when lastAccess is provided", () => {
    const userWithLastAccess = {
      ...mockUser,
      lastAccess: "2024-01-15T10:30:00Z",
    };
    render(<UserDetailsModal {...defaultProps} user={userWithLastAccess} />);
    // The formatted date should be displayed
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it("should display '-' when lastAccess is not provided", () => {
    const userWithoutLastAccess = {
      ...mockUser,
      lastAccess: undefined,
    };
    render(<UserDetailsModal {...defaultProps} user={userWithoutLastAccess} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should display inactive status", () => {
    const inactiveUser = {
      ...mockUser,
      status: "inactive" as const,
    };
    mockUseTranslation.mockReturnValue({
      team: {
        userDetails: {
          title: "User Details",
          personalInfo: "Personal Information",
          accountInfo: "Account Information",
          close: "Close",
        },
        table: {
          name: "Name",
          email: "Email",
          status: "Status",
          lastAccess: "Last Access",
        },
        addModal: {
          fields: {
            phone: "Phone",
          },
        },
        status: {
          active: "Active",
          inactive: "Inactive",
          pending: "Pending",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<UserDetailsModal {...defaultProps} user={inactiveUser} />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should display pending status", () => {
    const pendingUser = {
      ...mockUser,
      status: "pending" as const,
    };
    mockUseTranslation.mockReturnValue({
      team: {
        userDetails: {
          title: "User Details",
          personalInfo: "Personal Information",
          accountInfo: "Account Information",
          close: "Close",
        },
        table: {
          name: "Name",
          email: "Email",
          status: "Status",
          lastAccess: "Last Access",
        },
        addModal: {
          fields: {
            phone: "Phone",
          },
        },
        status: {
          active: "Active",
          inactive: "Inactive",
          pending: "Pending",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<UserDetailsModal {...defaultProps} user={pendingUser} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should use English locale for date formatting", () => {
    mockUseLanguage.mockReturnValue({ language: "en" });
    const userWithLastAccess = {
      ...mockUser,
      lastAccess: "2024-01-15T10:30:00Z",
    };
    render(<UserDetailsModal {...defaultProps} user={userWithLastAccess} />);
    // Date should be formatted
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it("should use Spanish locale for date formatting", () => {
    mockUseLanguage.mockReturnValue({ language: "es" });
    const userWithLastAccess = {
      ...mockUser,
      lastAccess: "2024-01-15T10:30:00Z",
    };
    render(<UserDetailsModal {...defaultProps} user={userWithLastAccess} />);
    // Date should be formatted
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it("should display masked phone number", () => {
    render(<UserDetailsModal {...defaultProps} />);
    // Phone should be masked (maskPhone function should format it)
    // maskPhone formats "1234567890" as "(12) 3456-7890"
    expect(screen.getByText("(12) 3456-7890")).toBeInTheDocument();
  });
});
