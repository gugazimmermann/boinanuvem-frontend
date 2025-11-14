import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsDropdown } from "../actions-dropdown";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import type { TeamUser } from "~/routes/dashboard/team";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

const mockUser: TeamUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  status: "active",
  lastAccess: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

describe("ActionsDropdown", () => {
  it("should render actions button", () => {
    render(
      <ActionsDropdown user={mockUser} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper }
    );
    const button = screen.getByTitle(/actions|ações/i);
    expect(button).toBeInTheDocument();
  });

  it("should open dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(
      <ActionsDropdown user={mockUser} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper }
    );

    const button = screen.getByTitle(/actions|ações/i);
    await user.click(button);

    await waitFor(() => {
      const dropdown = document.querySelector(".absolute.right-0");
      expect(dropdown).toBeInTheDocument();
    });
  });

  it("should call onView when view is clicked", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionsDropdown user={mockUser} onView={onView} onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper }
    );

    const button = screen.getByTitle(/actions|ações/i);
    await user.click(button);

    await waitFor(() => {
      const viewButton = screen.getByText(/view|ver/i);
      expect(viewButton).toBeInTheDocument();
    });

    const viewButton = screen.getByText(/view|ver/i);
    await user.click(viewButton);

    expect(onView).toHaveBeenCalledWith(mockUser);
  });

  it("should call onEdit when edit is clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionsDropdown user={mockUser} onView={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />,
      { wrapper }
    );

    const button = screen.getByTitle(/actions|ações/i);
    await user.click(button);

    await waitFor(() => {
      const editButton = screen.getByText(/edit|editar/i);
      expect(editButton).toBeInTheDocument();
    });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it("should call onDelete when delete is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionsDropdown user={mockUser} onView={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />,
      { wrapper }
    );

    const button = screen.getByTitle(/actions|ações/i);
    await user.click(button);

    await waitFor(() => {
      const deleteButton = screen.getByText(/delete|deletar/i);
      expect(deleteButton).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(/delete|deletar/i);
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockUser);
  });

  it("should close dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ActionsDropdown user={mockUser} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
        <div data-testid="outside">Outside</div>
      </div>,
      { wrapper }
    );

    const button = screen.getByTitle(/actions|ações/i);
    await user.click(button);

    await waitFor(() => {
      expect(document.querySelector(".absolute.right-0")).toBeInTheDocument();
    });

    const outside = screen.getByTestId("outside");
    await user.click(outside);

    await waitFor(() => {
      expect(document.querySelector(".absolute.right-0")).not.toBeInTheDocument();
    });
  });
});
