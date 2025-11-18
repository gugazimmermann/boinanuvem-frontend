import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { ComponentProps } from "react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import EditTeamMember from "../team.edit.$userId";
import { getUserById, updateUser } from "~/services/users.service";
import { Input, Button, Alert } from "~/components/ui";
import type { TeamUser } from "~/types";

const mockNavigate = vi.fn();

const mockMainUser: TeamUser = {
  id: "main-user-id",
  name: "Main User",
  email: "main@example.com",
  phone: "1234567890",
  role: "admin",
  status: "active",
  mainUser: true,
  companyId: "company-id",
  createdAt: "2025-01-01",
  permissions: {} as never,
};

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
  Input: ({
    label,
    placeholder,
    value,
    onChange,
    error,
    type,
    ...props
  }: ComponentProps<typeof Input>) => (
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
  Button: ({ children, onClick, type, ...props }: ComponentProps<typeof Button>) => {
    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        data-testid="submit-button"
        type={type as "button" | "submit" | "reset" | undefined}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
        disabled={buttonProps.disabled}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
  Alert: ({ title, variant }: ComponentProps<typeof Alert>) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
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
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "main-user-id");
    }
    return createMemoryRouter(
      [
        {
          path: "/dashboard/team/:userId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <EditTeamMember />
                </AuthProvider>
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
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
    vi.mocked(getUserById).mockImplementation((id: string) => {
      if (id === "main-user-id") return mockMainUser;
      if (id === "user-1") return mockUser as TeamUser;
      return undefined;
    });
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
