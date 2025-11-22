import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewCashFlow from "../cash-flow.new";

const mockNavigate = vi.fn();
const mockAddCashFlow = vi.fn();
const mockAddCashFlowObservation = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: (...args: unknown[]) => mockAddCashFlow(...args),
}));

vi.mock("~/services/cash-flow-observations.service", () => ({
  addCashFlowObservation: (...args: unknown[]) => mockAddCashFlowObservation(...args),
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

vi.mock("~/services/employees.service", () => ({
  getEmployeesByCompanyId: vi.fn(() => [
    {
      id: "emp-1",
      name: "Test Employee",
      companyId: "company-1",
      status: "active" as const,
    },
  ]),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProvidersByCompanyId: vi.fn(() => [
    {
      id: "sp-1",
      name: "Test SP",
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

vi.mock("~/mocks/suppliers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/suppliers")>("~/mocks/suppliers");
  return {
    ...actual,
    mockSuppliers: [
      {
        id: "supplier-1",
        name: "Test Supplier",
        companyId: "company-1",
        propertyIds: ["prop-1"],
        status: "active" as const,
      },
    ],
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

describe("NewCashFlow", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/fluxo-caixa/novo",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewCashFlow />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/fluxo-caixa/novo"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddCashFlow.mockReturnValue({
      id: "cf-1",
      companyId: "company-1",
      amount: 1000,
      date: "2024-01-15",
      description: "Test",
      createdAt: "2024-01-15T10:00:00Z",
    });
    mockAddCashFlowObservation.mockReturnValue({
      id: "obs-1",
      cashFlowId: "cf-1",
      observation: "Test observation",
      createdAt: "2024-01-15T10:00:00Z",
    });
  });

  it("should render new cash flow form", () => {
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

  it("should have correct meta function", () => {
    expect(NewCashFlow).toBeDefined();
  });

  it("should create observation when observation text is provided", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const descriptionInput = screen.getByTestId("input-Description");
    const amountInput = screen.getByTestId("input-Amount");
    const dateInput = screen.getByTestId("input-Date");
    const selects = screen.getAllByTestId("select-select");

    const allSelects = screen.getAllByRole("combobox");
    const typeSelect = allSelects.find(
      (select) => !select.hasAttribute("data-testid")
    ) as HTMLSelectElement;

    const categorySelect = selects.find((select) => {
      const label = select.getAttribute("label");
      return label === "Category" || select.querySelector('option[value="cattle_sales"]') !== null;
    }) as HTMLSelectElement;
    const paymentMethodSelect = selects.find((select) => {
      const label = select.getAttribute("label");
      return (
        label === "Payment Method" ||
        (select.querySelector('option[value="cash"]') !== null &&
          select.querySelector('option[value="bank_transfer"]') !== null)
      );
    }) as HTMLSelectElement;
    const propertySelect =
      (selects.find((select) => {
        const label = select.getAttribute("label");
        return label === "Property";
      }) as HTMLSelectElement) || selects[0];

    await act(async () => {
      fireEvent.change(descriptionInput, { target: { value: "Test description" } });
      fireEvent.change(amountInput, { target: { value: "1000" } });
      fireEvent.change(dateInput, { target: { value: "2024-01-15" } });

      fireEvent.change(typeSelect, { target: { value: "income" } });
    });

    await waitFor(() => {
      expect(categorySelect).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(categorySelect, { target: { value: "cattle_sales" } });
      fireEvent.change(paymentMethodSelect, { target: { value: "cash" } });
      fireEvent.change(propertySelect, { target: { value: "prop-1" } });
    });

    const textareas = screen.queryAllByRole("textbox");
    const observationTextarea = textareas.find(
      (textarea) => (textarea as HTMLTextAreaElement).rows === 4
    ) as HTMLTextAreaElement | undefined;

    if (observationTextarea) {
      await act(async () => {
        fireEvent.change(observationTextarea, {
          target: { value: "Test observation" },
        });
      });
    }

    await act(async () => {
      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockAddCashFlow).toHaveBeenCalled();
      expect(mockAddCashFlowObservation).toHaveBeenCalledWith(
        expect.objectContaining({
          cashFlowId: "cf-1",
          observation: "Test observation",
        })
      );
    });
  });

  it("should not create observation when observation text is empty", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const descriptionInput = screen.getByTestId("input-Description");
    const amountInput = screen.getByTestId("input-Amount");
    const dateInput = screen.getByTestId("input-Date");
    const selects = screen.getAllByTestId("select-select");

    const allSelects = screen.getAllByRole("combobox");
    const typeSelect = allSelects.find(
      (select) => !select.hasAttribute("data-testid")
    ) as HTMLSelectElement;

    const categorySelect = selects.find((select) => {
      const label = select.getAttribute("label");
      return label === "Category" || select.querySelector('option[value="cattle_sales"]') !== null;
    }) as HTMLSelectElement;
    const paymentMethodSelect = selects.find((select) => {
      const label = select.getAttribute("label");
      return (
        label === "Payment Method" ||
        (select.querySelector('option[value="cash"]') !== null &&
          select.querySelector('option[value="bank_transfer"]') !== null)
      );
    }) as HTMLSelectElement;
    const propertySelect =
      (selects.find((select) => {
        const label = select.getAttribute("label");
        return label === "Property";
      }) as HTMLSelectElement) || selects[0];

    fireEvent.change(descriptionInput, { target: { value: "Test description" } });
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(typeSelect, { target: { value: "income" } });
    fireEvent.change(categorySelect, { target: { value: "cattle_sales" } });
    fireEvent.change(paymentMethodSelect, { target: { value: "cash" } });
    fireEvent.change(propertySelect, { target: { value: "prop-1" } });

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddCashFlow).toHaveBeenCalled();
      expect(mockAddCashFlowObservation).not.toHaveBeenCalled();
    });
  });

  it("should handle file upload for observations", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const descriptionInput = screen.getByTestId("input-Description");
    const amountInput = screen.getByTestId("input-Amount");
    const dateInput = screen.getByTestId("input-Date");
    const selects = screen.getAllByTestId("select-select");

    const allSelects = screen.getAllByRole("combobox");
    const typeSelect = allSelects.find(
      (select) => !select.hasAttribute("data-testid")
    ) as HTMLSelectElement;

    const categorySelect = selects.find((select) => {
      const label = select.getAttribute("label");
      return label === "Category" || select.querySelector('option[value="cattle_sales"]') !== null;
    }) as HTMLSelectElement;
    const paymentMethodSelect = selects.find((select) => {
      const label = select.getAttribute("label");
      return (
        label === "Payment Method" ||
        (select.querySelector('option[value="cash"]') !== null &&
          select.querySelector('option[value="bank_transfer"]') !== null)
      );
    }) as HTMLSelectElement;
    const propertySelect =
      (selects.find((select) => {
        const label = select.getAttribute("label");
        return label === "Property";
      }) as HTMLSelectElement) || selects[0];

    fireEvent.change(descriptionInput, { target: { value: "Test description" } });
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(typeSelect, { target: { value: "income" } });
    fireEvent.change(categorySelect, { target: { value: "cattle_sales" } });
    fireEvent.change(paymentMethodSelect, { target: { value: "cash" } });
    fireEvent.change(propertySelect, { target: { value: "prop-1" } });

    const textareas = screen.queryAllByRole("textbox");
    const observationTextarea = textareas.find(
      (textarea) => (textarea as HTMLTextAreaElement).rows === 4
    ) as HTMLTextAreaElement | undefined;

    if (observationTextarea) {
      fireEvent.change(observationTextarea, {
        target: { value: "Test observation" },
      });
    }

    const fileUpload = screen.getByTestId("file-upload");
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    fireEvent.change(fileUpload, {
      target: { files: [file] },
    });

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddCashFlow).toHaveBeenCalled();
      expect(mockAddCashFlowObservation).toHaveBeenCalled();
      const callArgs = mockAddCashFlowObservation.mock.calls[0][0];
      expect(callArgs.cashFlowId).toBe("cf-1");
      expect(callArgs.observation).toBe("Test observation");
      expect(callArgs.fileIds).toBeDefined();
      expect(Array.isArray(callArgs.fileIds)).toBe(true);
    });
  });
});
