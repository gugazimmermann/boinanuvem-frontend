import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsDropdown } from "../actions-dropdown";
import { useTranslation } from "~/i18n";
import { useClickOutside } from "~/hooks/use-click-outside";
import type { TeamUser } from "~/types";

vi.mock("~/i18n");
vi.mock("~/hooks/use-click-outside");

describe("ActionsDropdown", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseClickOutside = vi.mocked(useClickOutside);

  const mockUser: TeamUser = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
  } as TeamUser;

  const defaultProps = {
    user: mockUser,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      team: {
        table: {
          actions: "Actions",
          view: "View",
          edit: "Edit",
          delete: "Delete",
        },
        viewUser: "View",
        editUser: "Edit",
        deleteUser: "Delete",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseClickOutside.mockImplementation(() => {});
  });

  it("should render actions button", () => {
    render(<ActionsDropdown {...defaultProps} />);
    const button = screen.getByTitle("Actions");
    expect(button).toBeInTheDocument();
  });

  it("should open dropdown when button is clicked", async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown {...defaultProps} />);

    const button = screen.getByTitle("Actions");
    await user.click(button);

    await waitFor(
      () => {
        expect(screen.getByText("View")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should call onView when view is clicked", async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    render(<ActionsDropdown {...defaultProps} onView={onView} />);

    const button = screen.getByTitle("Actions");
    await user.click(button);

    await waitFor(
      async () => {
        const viewButton = screen.getByText("View");
        await user.click(viewButton);
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(onView).toHaveBeenCalledWith(mockUser);
      },
      { timeout: 2000 }
    );
  });

  it("should call onEdit when edit is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ActionsDropdown {...defaultProps} onEdit={onEdit} />);

    const button = screen.getByTitle("Actions");
    await user.click(button);

    await waitFor(
      async () => {
        const editButton = screen.getByText("Edit");
        await user.click(editButton);
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(onEdit).toHaveBeenCalledWith(mockUser);
      },
      { timeout: 2000 }
    );
  });

  it("should call onDelete when delete is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<ActionsDropdown {...defaultProps} onDelete={onDelete} />);

    const button = screen.getByTitle("Actions");
    await user.click(button);

    await waitFor(
      async () => {
        const deleteButton = screen.getByText("Delete");
        await user.click(deleteButton);
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(onDelete).toHaveBeenCalledWith(mockUser);
      },
      { timeout: 2000 }
    );
  });
});
