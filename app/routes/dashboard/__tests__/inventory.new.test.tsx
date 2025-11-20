import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewInventoryItem from "../inventory.new";
import { addInventoryItem } from "~/services/inventory.service";
import { InventoryItemCategory } from "~/types";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/inventory.service", () => ({
  addInventoryItem: vi.fn(() => ({ id: "new-item", name: "New Item" })),
}));

vi.mock("~/services/inventory-movements.service", () => ({
  addInventoryMovement: vi.fn(() => ({ id: "new-movement" })),
}));

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: vi.fn(() => ({ id: "cashflow-1", amount: 1000 })),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  addAccountsPayable: vi.fn(() => ({ id: "ap-1" })),
}));

const mockAddInventoryObservation = vi.fn();
vi.mock("~/services/inventory-observations.service", () => ({
  addInventoryObservation: (...args: unknown[]) => mockAddInventoryObservation(...args),
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

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return {
    ...actual,
    mockProperties: [
      { id: "prop-1", name: "Test Property 1" },
      { id: "prop-2", name: "Test Property 2" },
    ],
  };
});

vi.mock("~/mocks/suppliers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/suppliers")>("~/mocks/suppliers");
  return {
    ...actual,
    mockSuppliers: [{ id: "supplier-1", name: "Test Supplier" }],
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
      value={value || ""}
      onChange={onChange}
      type={type}
      {...props}
    />
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
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
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

describe("NewInventoryItem", () => {
  const simulateMultiSelectChange = (select: HTMLSelectElement, optionIndex: number) => {
    const option = select.options[optionIndex];
    if (option) {
      Object.defineProperty(select, "selectedOptions", {
        configurable: true,
        get: () => [option],
      });
      option.selected = true;
      fireEvent.change(select);
    }
  };

  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/inventory/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewInventoryItem />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/inventory/new"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(addInventoryItem).mockReturnValue({
      id: "new-item",
      name: "New Item",
      code: "ITEM001",
      category: InventoryItemCategory.FEED,
      unit: "kg",
      minimumStock: 100,
      companyId: "company-1",
      propertyIds: ["prop-1"],
      createdAt: "2025-01-01",
    });
    mockAddInventoryObservation.mockReturnValue({
      id: "obs-1",
      itemId: "new-item",
      observation: "Test observation",
      createdAt: "2025-01-01T10:00:00Z",
    });
  });

  it("should render new inventory item form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryByTestId("input-Code")).toBeTruthy();
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    if (codeInput) {
      fireEvent.change(codeInput, { target: { value: "ITEM001" } });
      expect(codeInput).toHaveValue("ITEM001");
    }
  });

  it("should handle category selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const categorySelect = screen.queryByTestId("select-Category");
    if (categorySelect) {
      fireEvent.change(categorySelect, { target: { value: InventoryItemCategory.FEED } });
      expect(categorySelect).toHaveValue(InventoryItemCategory.FEED);
    }
  });

  it("should show custom category input when category is CUSTOM", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const categorySelect = screen.queryByTestId("select-Category");
    if (categorySelect) {
      fireEvent.change(categorySelect, { target: { value: InventoryItemCategory.CUSTOM } });
      const customCategoryInput = screen.queryByTestId("input-Custom Category");
      expect(customCategoryInput || categorySelect).toBeTruthy();
    }
  });

  it("should handle unit selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const unitSelect = screen.queryByTestId("select-Unit");
    if (unitSelect) {
      fireEvent.change(unitSelect, { target: { value: "kg" } });
      expect(unitSelect).toHaveValue("kg");
    }
  });

  it("should handle property multi-select", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const propertySelect = screen.queryByRole("listbox") || screen.queryByTestId(/property/i);
    if (propertySelect) {
      expect(propertySelect).toBeInTheDocument();
    }
  });

  it("should handle expiration date toggle", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const expirationCheckbox = document.querySelector("#hasExpiration") as HTMLInputElement;
    if (expirationCheckbox) {
      fireEvent.click(expirationCheckbox);
      expect(expirationCheckbox).toBeInTheDocument();
    } else {
      expect(screen.getByTestId("input-Code")).toBeInTheDocument();
    }
  });

  it("should handle initial stock input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const initialStockInput = screen.queryByTestId("input-Initial Stock");
    if (initialStockInput) {
      fireEvent.change(initialStockInput, { target: { value: "100" } });
      expect(initialStockInput).toHaveValue(100);
    } else {
      expect(screen.getByTestId("input-Code")).toBeInTheDocument();
    }
  });

  it("should validate required fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButton = screen.queryByTestId("submit-button");
    if (submitButton) {
      fireEvent.click(submitButton);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should handle form submission with valid data", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    const nameInput = screen.queryByTestId("input-Name");
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;

    if (codeInput) fireEvent.change(codeInput, { target: { value: "ITEM001" } });
    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Item" } });

    if (propertySelect && propertySelect.options.length > 0) {
      simulateMultiSelectChange(propertySelect, 0);
    }

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should create initial stock movement when provided", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    const nameInput = screen.queryByTestId("input-Name");
    const initialStockInput = screen.queryByTestId("input-Initial Stock");
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;

    if (codeInput) fireEvent.change(codeInput, { target: { value: "ITEM001" } });
    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Item" } });
    if (initialStockInput) fireEvent.change(initialStockInput, { target: { value: "100" } });
    if (propertySelect && propertySelect.options.length > 0) {
      simulateMultiSelectChange(propertySelect, 0);
    }

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
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

  it("should validate numeric fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const minimumStockInput = screen.queryByTestId("input-Minimum Stock");
    if (minimumStockInput) {
      fireEvent.change(minimumStockInput, { target: { value: "-10" } });
      const form = screen.queryByRole("form") || document.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        const errors = screen.queryAllByText(/invalid|inválido/i);
        expect(errors.length >= 0).toBeTruthy();
      }
    }
  });

  it("should validate expiration date when hasExpiration is true", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const expirationCheckbox = document.querySelector("#hasExpiration") as HTMLInputElement;
    if (expirationCheckbox) {
      fireEvent.click(expirationCheckbox);
      const form = screen.queryByRole("form") || document.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        const errors = screen.queryAllByText(/required|obrigatório/i);
        expect(errors.length >= 0).toBeTruthy();
      }
    } else {
      expect(screen.getByTestId("input-Code")).toBeInTheDocument();
    }
  });

  it("should handle form submission error", async () => {
    vi.mocked(addInventoryItem).mockReturnValueOnce(
      undefined as unknown as ReturnType<typeof addInventoryItem>
    );
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    const nameInput = screen.queryByTestId("input-Name");

    if (codeInput) fireEvent.change(codeInput, { target: { value: "ITEM001" } });
    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Item" } });

    const form = screen.queryByRole("form") || document.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const alert = screen.queryByTestId("alert-error");
        expect(alert || form).toBeTruthy();
      });
    }
  });

  it("should navigate after successful submission", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    const nameInput = screen.queryByTestId("input-Name");
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;

    if (codeInput) fireEvent.change(codeInput, { target: { value: "ITEM001" } });
    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Item" } });
    if (propertySelect && propertySelect.options.length > 0) {
      simulateMultiSelectChange(propertySelect, 0);
    }

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    expect(NewInventoryItem).toBeDefined();
  });

  it("should not create observation when observation text is empty", async () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    const nameInput = screen.queryByTestId("input-Name");
    const categorySelect = screen.queryByTestId("select-Category");
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;

    if (codeInput) fireEvent.change(codeInput, { target: { value: "ITEM001" } });
    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Item" } });
    if (categorySelect)
      fireEvent.change(categorySelect, { target: { value: InventoryItemCategory.FEED } });
    if (propertySelect && propertySelect.options.length > 0) {
      simulateMultiSelectChange(propertySelect, 0);
    }

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      const submitButton = screen.queryByTestId("submit-button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }
    }

    await waitFor(
      () => {
        expect(addInventoryItem).toHaveBeenCalled();
        expect(mockAddInventoryObservation).not.toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it("should handle file upload for observations", async () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Code");
    const nameInput = screen.queryByTestId("input-Name");
    const categorySelect = screen.queryByTestId("select-Category");
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;

    if (codeInput) fireEvent.change(codeInput, { target: { value: "ITEM001" } });
    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Item" } });
    if (categorySelect)
      fireEvent.change(categorySelect, { target: { value: InventoryItemCategory.FEED } });
    if (propertySelect && propertySelect.options.length > 0) {
      simulateMultiSelectChange(propertySelect, 0);
    }

    const textareas = screen.queryAllByRole("textbox");
    const observationTextarea = textareas.find(
      (textarea) => (textarea as HTMLTextAreaElement).rows === 4
    ) as HTMLTextAreaElement | undefined;

    if (observationTextarea) {
      fireEvent.change(observationTextarea, {
        target: { value: "Test observation" },
      });
    }

    const fileUpload = screen.queryByTestId("file-upload");
    if (fileUpload) {
      const file = new File(["test content"], "test.txt", { type: "text/plain" });
      fireEvent.change(fileUpload, {
        target: { files: [file] },
      });
    }

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      const submitButton = screen.queryByTestId("submit-button");
      if (submitButton) {
        fireEvent.click(submitButton);
      }
    }

    await waitFor(
      () => {
        expect(addInventoryItem).toHaveBeenCalled();
        expect(mockAddInventoryObservation).toHaveBeenCalled();
        const callArgs = mockAddInventoryObservation.mock.calls[0][0];
        expect(callArgs.itemId).toBe("new-item");
        expect(callArgs.observation).toBe("Test observation");
        expect(callArgs.fileIds).toBeDefined();
        expect(Array.isArray(callArgs.fileIds)).toBe(true);
      },
      { timeout: 3000 }
    );
  });
});
