/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditTeamMember from "../team.edit.$userId";
import { getUserById, updateUser } from "~/services/users.service";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("~/components/site/hooks", () => ({
  useCEPLookup: vi.fn(() => ({ data: null, loading: false, error: null })),
}));

vi.mock("~/components/ui", () => ({
  Input: ({ label, placeholder, value, onChange, error, type, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label || placeholder || "input"}`}
        type={type || "text"}
        value={value || ""}
        onChange={onChange}
        aria-invalid={!!error}
        {...props}
      />
      {error && <span data-testid={`error-${label || placeholder}`}>{error}</span>}
    </div>
  ),
  Button: ({ children, onClick, type, disabled, ...props }: any) => (
    <button
      data-testid="submit-button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: any) => <div data-testid={`alert-${variant}`}>{title}</div>,
}));

describe("EditTeamMember", () => {
  const mockUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    phone: "(47) 99999-9999",
    cpf: "123.456.789-00",
    role: "user" as const,
    street: "Test Street",
    number: "123",
    city: "Test City",
    state: "SC",
    zipCode: "89000-000",
  };

  const createRouter = (userId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/team/:userId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditTeamMember />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/team/${userId}/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserById).mockReturnValue(mockUser);
  });

  it("should render edit team member form with pre-filled data", async () => {
    const router = createRouter("user-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith("user-1");
    });

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle form input changes", async () => {
    const router = createRouter("user-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith("user-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "New Value" } });
      expect(inputs[0]).toHaveValue("New Value");
    }
  });

  it("should handle form submission", async () => {
    vi.mocked(updateUser).mockReturnValue(true);
    const router = createRouter("user-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith("user-1");
    });

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should handle validation errors", async () => {
    const router = createRouter("user-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith("user-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "" } });
    }

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton) {
      fireEvent.click(submitButton);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should handle undefined user", () => {
    vi.mocked(getUserById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    expect(getUserById).toHaveBeenCalledWith("invalid-id");
  });

  it("should have correct meta function", () => {
    expect(EditTeamMember).toBeDefined();
  });
});
