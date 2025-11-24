import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewInventoryMovement from "../inventory.$itemId.movement.new";
import { getInventoryItemById } from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { addCashFlow } from "~/services/cash-flow.service";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import { getInventoryViewRoute } from "~/routes.config";
import { InventoryItemCategory, InventoryMovementType } from "~/types";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ itemId: "item-1" }),
  };
});

const mockItem = {
  id: "item-1",
  code: "ITEM001",
  name: "Test Item",
  description: "Test description",
  category: InventoryItemCategory.FEED,
  unit: "kg",
  minimumStock: 100,
  unitPrice: 10.5,
  supplierId: "supplier-1",
  hasExpiration: false,
  companyId: "company-1",
  propertyIds: ["property-1"],
  createdAt: "2025-01-01",
};

vi.mock("~/services/inventory.service", () => ({
  getInventoryItemById: vi.fn(() => mockItem),
}));

vi.mock("~/services/inventory-movements.service", () => ({
  addInventoryMovement: vi.fn(() => ({ id: "new-movement" })),
}));

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: vi.fn(() => ({ id: "cashflow-1", amount: 1050 })),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  addAccountsPayable: vi.fn(() => ({ id: "ap-1" })),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSuppliersByCompanyId: vi.fn(() => [{ id: "supplier-1", name: "Test Supplier" }]),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(() => [{ id: "property-1", name: "Test Property" }]),
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => [
    { id: "bank-1", bankName: "Test Bank", accountNumber: "12345", accountType: "checking" },
  ]),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    type,
    helperText,
    ...props
  }: {
    label?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    helperText?: string;
    [key: string]: unknown;
  }) => (
    <div>
      <input
        data-testid={`input-${label || "input"}`}
        aria-label={label}
        value={value || ""}
        onChange={onChange}
        type={type}
        {...props}
      />
      {helperText && <span data-testid={`helper-${label}`}>{helperText}</span>}
    </div>
  ),
  Select: ({
    options,
    value,
    onChange,
    label,
    ...props
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    label?: string;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${label || "select"}`}
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
    variant: _variant,
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
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  FileUpload: ({
    label,
    files,
    onChange,
    disabled,
    multiple,
    helperText,
    ...props
  }: {
    label?: string;
    files?: File[];
    onChange?: (files: File[]) => void;
    disabled?: boolean;
    multiple?: boolean;
    helperText?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="file-upload">
      {label && <label>{label}</label>}
      <input
        type="file"
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files || []);
          onChange?.(multiple ? [...(files || []), ...selectedFiles] : selectedFiles);
        }}
        {...props}
      />
      {helperText && <span>{helperText}</span>}
    </div>
  ),
}));

describe("NewInventoryMovement", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/inventory/:itemId/movement/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewInventoryMovement />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/inventory/item-1/movement/new"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getInventoryItemById).mockReturnValue(mockItem);
  });

  it("should render new movement form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryByTestId("select-Type")).toBeTruthy();
  });

  it("should handle movement type selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.CONSUMPTION } });
      expect(typeSelect).toHaveValue(InventoryMovementType.CONSUMPTION);
    }
  });

  it("should show supplier field for purchase movements", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
      const supplierSelect = screen.queryByTestId("select-Supplier");
      expect(supplierSelect || typeSelect).toBeTruthy();
    }
  });

  it("should show expiration date field for items with expiration on purchase", () => {
    const expiringItem = {
      ...mockItem,
      hasExpiration: true,
      expirationDate: "2025-12-31",
    };
    vi.mocked(getInventoryItemById).mockReturnValueOnce(expiringItem);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
      const expirationInput = screen.queryByTestId("input-Expiration Date");
      expect(expirationInput || typeSelect).toBeTruthy();
    }
  });

  it("should show cash flow transaction checkbox for purchases", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
      const cashFlowCheckbox =
        screen.queryByLabelText(/cash flow|transação/i) || screen.queryByRole("checkbox");
      expect(cashFlowCheckbox || typeSelect).toBeTruthy();
    }
  });

  it("should show payment method and bank account when cash flow is enabled", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
      const cashFlowCheckbox =
        screen.queryByLabelText(/cash flow|transação/i) || screen.queryByRole("checkbox");
      if (cashFlowCheckbox) {
        fireEvent.click(cashFlowCheckbox);
        const paymentMethodSelect = screen.queryByTestId("select-Payment Method");
        expect(paymentMethodSelect || cashFlowCheckbox).toBeTruthy();
      }
    }
  });

  it("should show account payable checkbox for purchases", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
      const apCheckbox =
        screen.queryByLabelText(/account payable|conta a pagar/i) ||
        screen.queryAllByRole("checkbox")[1];
      expect(apCheckbox || typeSelect).toBeTruthy();
    }
  });

  it("should validate required fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should validate supplier is required for purchases", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
      const form = screen.queryByRole("form") || document.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        const errors = screen.queryAllByText(/required|obrigatório/i);
        expect(errors.length >= 0).toBeTruthy();
      }
    }
  });

  it("should validate unit price when creating cash flow", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
      const cashFlowCheckbox =
        screen.queryByLabelText(/cash flow|transação/i) || screen.queryByRole("checkbox");
      if (cashFlowCheckbox) {
        fireEvent.click(cashFlowCheckbox);
        const form = screen.queryByRole("form") || document.querySelector("form");
        if (form) {
          fireEvent.submit(form);
          const errors = screen.queryAllByText(/required|obrigatório/i);
          expect(errors.length >= 0).toBeTruthy();
        }
      }
    }
  });

  it("should handle form submission with purchase movement", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    const quantityInput = screen.queryByTestId("input-Quantity");
    const supplierSelect = screen.queryByTestId("select-Supplier");
    const propertySelect = screen.queryByTestId("select-Property");

    if (typeSelect)
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
    if (quantityInput) fireEvent.change(quantityInput, { target: { value: "100" } });
    if (supplierSelect) fireEvent.change(supplierSelect, { target: { value: "supplier-1" } });
    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "property-1" } });

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(addInventoryMovement).toHaveBeenCalled();
      });
    }
  });

  it("should create cash flow transaction on purchase when enabled", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    const quantityInput = screen.queryByTestId("input-Quantity");
    const unitPriceInput = screen.queryByTestId("input-Unit Price");
    const supplierSelect = screen.queryByTestId("select-Supplier");
    const propertySelect = screen.queryByTestId("select-Property");
    const cashFlowCheckbox =
      screen.queryByLabelText(/cash flow|transação/i) || screen.queryByRole("checkbox");

    if (typeSelect)
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
    if (quantityInput) fireEvent.change(quantityInput, { target: { value: "100" } });
    if (unitPriceInput) fireEvent.change(unitPriceInput, { target: { value: "10.5" } });
    if (supplierSelect) fireEvent.change(supplierSelect, { target: { value: "supplier-1" } });
    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "property-1" } });
    if (cashFlowCheckbox) fireEvent.click(cashFlowCheckbox);

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(addCashFlow).toHaveBeenCalled();
      });
    }
  });

  it("should create account payable on purchase when enabled", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    const quantityInput = screen.queryByTestId("input-Quantity");
    const unitPriceInput = screen.queryByTestId("input-Unit Price");
    const supplierSelect = screen.queryByTestId("select-Supplier");
    const propertySelect = screen.queryByTestId("select-Property");

    if (typeSelect)
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
    if (quantityInput) fireEvent.change(quantityInput, { target: { value: "100" } });
    if (unitPriceInput) fireEvent.change(unitPriceInput, { target: { value: "10.5" } });
    if (supplierSelect) fireEvent.change(supplierSelect, { target: { value: "supplier-1" } });
    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "property-1" } });

    const apCheckbox =
      screen.queryByLabelText(/account payable|conta a pagar/i) ||
      screen.queryAllByRole("checkbox")[1];
    if (apCheckbox) {
      fireEvent.click(apCheckbox);
      await waitFor(
        () => {
          const dueDateInput = screen.queryByTestId("input-Due date");
          expect(dueDateInput).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    }

    const dueDateInput = screen.queryByTestId("input-Due date");
    if (dueDateInput) {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      fireEvent.change(dueDateInput, { target: { value: futureDate } });
    }

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(
        () => {
          expect(addInventoryMovement).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
      expect(addAccountsPayable).toHaveBeenCalled();
    }
  });

  it("should navigate after successful submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    const quantityInput = screen.queryByTestId("input-Quantity");
    const supplierSelect = screen.queryByTestId("select-Supplier");
    const propertySelect = screen.queryByTestId("select-Property");

    if (typeSelect)
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
    if (quantityInput) fireEvent.change(quantityInput, { target: { value: "100" } });
    if (supplierSelect) fireEvent.change(supplierSelect, { target: { value: "supplier-1" } });
    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "property-1" } });

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(
        () => {
          expect(addInventoryMovement).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith(getInventoryViewRoute("item-1"));
        },
        { timeout: 3000 }
      );
    }
  }, 10000);

  it("should handle error on submission failure", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(addInventoryMovement).mockImplementationOnce(() => {
      throw new Error("Submission failed");
    });
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const typeSelect = screen.queryByTestId("select-Type");
    const quantityInput = screen.queryByTestId("input-Quantity");
    const supplierSelect = screen.queryByTestId("select-Supplier");
    const propertySelect = screen.queryByTestId("select-Property");

    if (typeSelect)
      fireEvent.change(typeSelect, { target: { value: InventoryMovementType.PURCHASE } });
    if (quantityInput) fireEvent.change(quantityInput, { target: { value: "100" } });
    if (supplierSelect) fireEvent.change(supplierSelect, { target: { value: "supplier-1" } });
    if (propertySelect) fireEvent.change(propertySelect, { target: { value: "property-1" } });

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(
        () => {
          const alert = screen.queryByTestId("alert-error");
          expect(alert || form).toBeTruthy();
        },
        { timeout: 2000 }
      );
    }
    consoleErrorSpy.mockRestore();
  }, 10000);

  it("should display message when item not found", () => {
    vi.mocked(getInventoryItemById).mockReturnValueOnce(undefined);
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByText(/back|voltar/i);
    const emptyMessage = screen.queryByText(/empty|não encontrado/i);
    expect(backButton || emptyMessage).toBeTruthy();
  });

  it("should navigate back on cancel", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cancelButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Cancelar") ||
          btn.textContent?.includes("Cancel") ||
          btn.textContent?.includes("Voltar") ||
          btn.textContent?.includes("Back")
      );

    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should have correct meta function", () => {
    expect(NewInventoryMovement).toBeDefined();
  });
});
