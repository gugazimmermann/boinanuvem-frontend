import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsDropdown } from "../actions-dropdown";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const mockUseClickOutside = vi.fn();
vi.mock("~/hooks/use-click-outside", () => ({
  useClickOutside: () => mockUseClickOutside(),
}));

describe("ActionsDropdown", () => {
  const mockUser = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    status: "active" as const,
    createdAt: "2024-01-01T00:00:00Z",
    mainUser: false,
    companyId: "company-1",
  };

  const defaultProps = {
    user: mockUser,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseClickOutside.mockImplementation(() => {});
  });

  it("should render dropdown button", () => {
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should open dropdown when button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(screen.getByText(/view details/i)).toBeInTheDocument();
    expect(screen.getByText(/edit user/i)).toBeInTheDocument();
    expect(screen.getByText(/delete user/i)).toBeInTheDocument();
  });

  it("should call onView when view is clicked", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} onView={onView} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    const viewButton = screen.getByText(/view details/i);
    await user.click(viewButton);

    expect(onView).toHaveBeenCalledWith(mockUser);
  });

  it("should call onEdit when edit is clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} onEdit={onEdit} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    const editButton = screen.getByText(/edit user/i);
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it("should call onDelete when delete is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} onDelete={onDelete} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    const deleteButton = screen.getByText(/delete user/i);
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockUser);
  });

  it("should close dropdown after action is clicked", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} onView={onView} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    const viewButton = screen.getByText(/view details/i);
    await user.click(viewButton);

    // Dropdown should be closed
    expect(screen.queryByText(/edit user/i)).not.toBeInTheDocument();
  });

  it("should toggle dropdown on button click", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");

    // Open dropdown
    await user.click(button);
    expect(screen.getByText(/view details/i)).toBeInTheDocument();

    // Close dropdown
    await user.click(button);
    expect(screen.queryByText(/view details/i)).not.toBeInTheDocument();
  });

  it("should render icons for actions", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    const { container } = render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} />
      </TestWrapper>
    );
    await user.click(container.querySelector("button")!);

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("should apply danger styling to delete button", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ActionsDropdown {...defaultProps} />
      </TestWrapper>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    const deleteButton = screen.getByText(/delete user/i);
    expect(deleteButton).toHaveClass("text-red-600");
  });
});
