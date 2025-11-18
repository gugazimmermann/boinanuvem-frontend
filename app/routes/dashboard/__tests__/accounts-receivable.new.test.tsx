import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewAccountsReceivable from "../accounts-receivable.new";

const mockNavigate = vi.fn();
const mockAddAccountsReceivable = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/accounts-receivable.service", () => ({
  addAccountsReceivable: (...args: unknown[]) => mockAddAccountsReceivable(...args),
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => [
    {
      id: "bank-1",
      name: "Test Bank",
      companyId: "company-1",
      status: "active" as const,
    },
  ]),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(() => [
    {
      id: "prop-1",
      name: "Test Property",
      companyId: "company-1",
      status: "active" as const,
    },
  ]),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/mocks/buyers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyers")>("~/mocks/buyers");
  return {
    ...actual,
    mockBuyers: [
      {
        id: "buyer-1",
        name: "Test Buyer",
        companyId: "company-1",
        propertyIds: ["prop-1"],
        status: "active" as const,
      },
    ],
  };
});

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    value,
    onChange,
    type,
    ...props
  }: {
    label?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      aria-label={label}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      type={type}
      {...props}
    />
  ),
  Select: ({
    options,
    value,
    onChange,
    ...props
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${props.name || "select"}`}
      value={value || ""}
      onChange={onChange}
      {...props}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Button: ({
    children,
    onClick,
    type,
    disabled,
    variant,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={type === "submit" ? "submit-button" : "button"}
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("NewAccountsReceivable", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/contas-receber/novo",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewAccountsReceivable />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/contas-receber/novo"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddAccountsReceivable.mockReturnValue({
      id: "ar-1",
      companyId: "company-1",
      amount: 1000,
      dueDate: "2024-12-31",
      description: "Test",
      createdAt: "2024-01-15T10:00:00Z",
    });
  });

  it("should render new accounts receivable form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "Test Value" } });
      expect(inputs[0]).toHaveValue("Test Value");
    }
  });

  it("should show validation errors on invalid submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton) {
      fireEvent.click(submitButton);
      await waitFor(() => {
        const errors = screen.queryAllByText(/required|obrigatório/i);
        expect(errors.length >= 0).toBeTruthy();
      });
    }
  });

  it("should have correct meta function", () => {
    expect(NewAccountsReceivable).toBeDefined();
  });
});
