import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteUserModal } from "../delete-user-modal";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

describe("DeleteUserModal", () => {
  it("should not render when isOpen is false", () => {
    render(
      <DeleteUserModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} userName="John Doe" />,
      { wrapper }
    );
    expect(screen.queryByText(/delete|deletar/i)).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <DeleteUserModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} userName="John Doe" />,
      { wrapper }
    );
    const deleteTexts = screen.getAllByText(/delete|deletar/i);
    expect(deleteTexts.length).toBeGreaterThan(0);
  });

  it("should render confirm button", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn().mockResolvedValue(undefined)}
        userName="John Doe"
      />,
      { wrapper }
    );
    const confirmButtons = screen.getAllByText(/confirm|confirmar/i);
    expect(confirmButtons.length).toBeGreaterThan(0);
  });

  it("should call onClose when cancelled", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteUserModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} userName="John Doe" />,
      { wrapper }
    );

    const cancelButton = screen.getByText(/cancel|cancelar/i);
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
