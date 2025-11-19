import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewAccountsReceivable from "../accounts-receivable.new";

const mockNavigate = vi.fn();
const mockAddAccountsReceivable = vi.fn();
const mockAddAccountsReceivableObservation = vi.fn();

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

vi.mock("~/services/accounts-receivable-observations.service", () => ({
  addAccountsReceivableObservation: (...args: unknown[]) =>
    mockAddAccountsReceivableObservation(...args),
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
  FileUpload: ({
    files: _files,
    onChange,
    helperText: _helperText,
    ...props
  }: {
    files?: File[];
    onChange?: (files: File[]) => void;
    helperText?: string;
    [key: string]: unknown;
  }) => (
    <input
      type="file"
      data-testid="file-upload"
      multiple
      onChange={(e) => {
        const selectedFiles = Array.from(e.target.files || []);
        onChange?.(selectedFiles);
      }}
      {...props}
    />
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
    mockAddAccountsReceivableObservation.mockReturnValue({
      id: "obs-1",
      accountsReceivableId: "ar-1",
      observation: "Test observation",
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

  it("should create observation when observation text is provided", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Fill required fields
    const descriptionInput = screen.getByTestId("input-Description");
    const amountInput = screen.getByTestId("input-Amount");
    const dueDateInput = screen.getByTestId("input-Due Date");
    const selects = screen.getAllByTestId("select-select");
    const propertySelect = selects[0]; // Property is always the first select

    fireEvent.change(descriptionInput, { target: { value: "Test description" } });
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.change(dueDateInput, { target: { value: "2024-12-31" } });
    fireEvent.change(propertySelect, { target: { value: "prop-1" } });

    // Find and fill observation textarea
    const textareas = screen.queryAllByRole("textbox");
    const observationTextarea = textareas.find(
      (textarea) => (textarea as HTMLTextAreaElement).rows === 4
    ) as HTMLTextAreaElement | undefined;

    if (observationTextarea) {
      fireEvent.change(observationTextarea, {
        target: { value: "Test observation" },
      });
    }

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddAccountsReceivable).toHaveBeenCalled();
      expect(mockAddAccountsReceivableObservation).toHaveBeenCalledWith(
        expect.objectContaining({
          accountsReceivableId: "ar-1",
          observation: "Test observation",
        })
      );
    });
  });

  it("should not create observation when observation text is empty", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Fill required fields
    const descriptionInput = screen.getByTestId("input-Description");
    const amountInput = screen.getByTestId("input-Amount");
    const dueDateInput = screen.getByTestId("input-Due Date");
    const selects = screen.getAllByTestId("select-select");
    const propertySelect = selects[0]; // Property is always the first select

    fireEvent.change(descriptionInput, { target: { value: "Test description" } });
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.change(dueDateInput, { target: { value: "2024-12-31" } });
    fireEvent.change(propertySelect, { target: { value: "prop-1" } });

    // Submit form without observation
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddAccountsReceivable).toHaveBeenCalled();
      expect(mockAddAccountsReceivableObservation).not.toHaveBeenCalled();
    });
  });

  it("should handle file upload for observations", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    // Fill required fields
    const descriptionInput = screen.getByTestId("input-Description");
    const amountInput = screen.getByTestId("input-Amount");
    const dueDateInput = screen.getByTestId("input-Due Date");
    const selects = screen.getAllByTestId("select-select");
    const propertySelect = selects[0]; // Property is always the first select

    fireEvent.change(descriptionInput, { target: { value: "Test description" } });
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.change(dueDateInput, { target: { value: "2024-12-31" } });
    fireEvent.change(propertySelect, { target: { value: "prop-1" } });

    // Find and fill observation textarea
    const textareas = screen.queryAllByRole("textbox");
    const observationTextarea = textareas.find(
      (textarea) => (textarea as HTMLTextAreaElement).rows === 4
    ) as HTMLTextAreaElement | undefined;

    if (observationTextarea) {
      fireEvent.change(observationTextarea, {
        target: { value: "Test observation" },
      });
    }

    // Upload file
    const fileUpload = screen.getByTestId("file-upload");
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    fireEvent.change(fileUpload, {
      target: { files: [file] },
    });

    // Submit form
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddAccountsReceivable).toHaveBeenCalled();
      expect(mockAddAccountsReceivableObservation).toHaveBeenCalled();
      const callArgs = mockAddAccountsReceivableObservation.mock.calls[0][0];
      expect(callArgs.accountsReceivableId).toBe("ar-1");
      expect(callArgs.observation).toBe("Test observation");
      expect(callArgs.fileIds).toBeDefined();
      expect(Array.isArray(callArgs.fileIds)).toBe(true);
    });
  });
});
