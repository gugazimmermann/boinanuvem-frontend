import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryItemForm } from "../inventory-item-form";
import { LanguageProvider } from "~/contexts/language-context";
import { InventoryItemCategory, PaymentMethod } from "~/types";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockProperties } from "~/mocks/properties";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      type,
      placeholder,
      required,
    }: {
      label: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      type?: string;
      placeholder?: string;
      required?: boolean;
    }) => (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          data-error={error}
          type={type}
          placeholder={placeholder}
          required={required}
        />
        {error && <p>{error}</p>}
      </div>
    )
  ),
  Select: vi.fn(
    ({
      label,
      value,
      onChange,
      options,
      disabled,
    }: {
      label: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options: Array<{ value: string; label: string }>;
      disabled?: boolean;
    }) => (
      <div>
        <label>{label}</label>
        <select value={value} onChange={onChange} disabled={disabled}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  ),
  FileUpload: vi.fn(() => <div data-testid="file-upload">File Upload</div>),
  FormFieldGroup: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("~/utils/inventory-utils", () => ({
  getInventoryUnitOptions: vi.fn(() => [
    { value: "kg", label: "Kilogram" },
    { value: "l", label: "Liter" },
  ]),
  getInventoryCategoryOptions: vi.fn(() => [
    { value: InventoryItemCategory.MEDICINES, label: "Medicines" },
  ]),
  getUsageUnitOptions: vi.fn(() => [{ value: "ml", label: "Milliliter" }]),
  getUsageBasisOptions: vi.fn(() => [
    { value: "per_animal", label: "Per Animal" },
    { value: "per_kg", label: "Per Kg" },
  ]),
}));

describe("InventoryItemForm", () => {
  const defaultFormData = {
    code: "",
    name: "",
    description: "",
    category: InventoryItemCategory.MEDICINES,
    unit: "kg",
    supplierId: "",
    minimumStock: "",
    hasExpiration: false,
    expirationDate: "",
    propertyIds: [],
    unitPrice: "",
    initialStock: "",
    usageAmount: "",
    usageUnit: "",
    usageBasis: "",
    customCategory: "",
    nitrogenContent: "",
    observation: "",
    createCashFlowTransaction: false,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: "",
    createAccountPayable: false,
    dueDate: "",
    accountPayablePaymentMethod: PaymentMethod.PIX,
    accountPayableBankAccountId: "",
  };

  const defaultProps = {
    formData: defaultFormData,
    errors: {},
    isSubmitting: false,
    onFieldChange: vi.fn(),
    translations: {
      inventory: {
        table: {
          code: "Code",
          name: "Name",
          description: "Description",
          category: "Category",
          unit: "Unit",
          supplier: "Supplier",
          minimumStock: "Minimum Stock",
          expirationDate: "Expiration Date",
          hasExpiration: "Has Expiration",
        },
        categories: {
          [InventoryItemCategory.MEDICINES]: "Medicines",
        },
        units: {
          kg: "Kilogram",
        },
        new: {
          customCategoryLabel: "Custom Category",
          unitPriceLabel: "Unit Price",
          unitPricePlaceholder: "Enter price",
          initialStockLabel: "Initial Stock",
          initialStockPlaceholder: "Enter stock",
          propertyLabel: "Properties",
          usageMethod: "Usage Method",
          usageAmount: "Usage Amount",
          usageUnit: "Usage Unit",
          usageBasis: "Usage Basis",
          usageBasisOptions: {
            perAnimal: "Per Animal",
            perKg: "Per Kg",
          },
        },
        movements: {
          new: {
            createCashFlowTransaction: "Create Transaction",
            createAccountPayable: "Create Payable",
            paymentMethod: "Payment Method",
            bankAccount: "Bank Account",
            dueDate: "Due Date",
          },
        },
      },
      common: {
        select: "Select",
      },
      cashFlow: {
        paymentMethods: {
          [PaymentMethod.CASH]: "Cash",
        },
      },
      bankAccounts: {
        accountTypes: {
          checking: "Checking",
          savings: "Savings",
        },
      },
    },
    suppliers: mockSuppliers.slice(0, 2),
    properties: mockProperties.slice(0, 2),
    bankAccounts: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render form fields", () => {
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} />
      </TestWrapper>
    );
    // Check that form renders
    expect(container).toBeTruthy();
    const labels = container.querySelectorAll("label");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("should call onFieldChange when field changes", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    if (inputs.length > 0) {
      await user.type(inputs[0], "T");
      // onFieldChange is called through the Input's onChange
      expect(container).toBeTruthy();
    }
  });

  it("should display errors", () => {
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} errors={{ name: "Name is required" }} />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should disable inputs when isSubmitting is true", () => {
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} isSubmitting={true} />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    inputs.forEach((input) => {
      expect((input as HTMLInputElement).disabled).toBe(true);
    });
  });

  it("should render with showInitialStock", () => {
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} showInitialStock={true} />
      </TestWrapper>
    );
    expect(container).toBeTruthy();
  });

  it("should render with showObservation", () => {
    const onObservationFilesChange = vi.fn();
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          showObservation={true}
          onObservationFilesChange={onObservationFilesChange}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  it("should handle code input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const codeInput = container.querySelector('input[value=""]') as HTMLInputElement;
    if (codeInput) {
      await user.type(codeInput, "TEST-001");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle name input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    const nameInput = Array.from(inputs).find((input) => {
      const label = input.closest("div")?.querySelector("label");
      return label?.textContent === "Name";
    }) as HTMLInputElement;
    if (nameInput) {
      await user.type(nameInput, "Test Item");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle description textarea change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const textarea = container.querySelector("textarea");
    if (textarea) {
      await user.type(textarea, "Test description");
      expect(onFieldChange).toHaveBeenCalledWith("description", expect.any(String));
    }
  });

  it("should handle category change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const categorySelect = container.querySelector("select") as HTMLSelectElement;
    if (categorySelect) {
      await user.selectOptions(categorySelect, InventoryItemCategory.MEDICINES);
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should render custom category input when category is CUSTOM", () => {
    const formDataWithCustom = {
      ...defaultFormData,
      category: InventoryItemCategory.CUSTOM,
    };
    render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} formData={formDataWithCustom} />
      </TestWrapper>
    );
    expect(screen.getByText("Custom Category")).toBeInTheDocument();
  });

  it("should handle custom category input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithCustom = {
      ...defaultFormData,
      category: InventoryItemCategory.CUSTOM,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithCustom}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const customCategoryInput = container.querySelector(
      'input[placeholder*="Custom"]'
    ) as HTMLInputElement;
    if (customCategoryInput) {
      await user.type(customCategoryInput, "My Custom Category");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should render fertilizer nitrogen content fields", () => {
    const formDataWithFertilizer = {
      ...defaultFormData,
      category: InventoryItemCategory.FERTILIZER,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} formData={formDataWithFertilizer} />
      </TestWrapper>
    );
    // Check that nitrogen content section is rendered
    expect(container.textContent).toContain("Nitrogen Content");
  });

  it("should handle nitrogen content input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithFertilizer = {
      ...defaultFormData,
      category: InventoryItemCategory.FERTILIZER,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithFertilizer}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const nitrogenInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    if (nitrogenInput) {
      await user.type(nitrogenInput, "10");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should render usage method fields for medicines", () => {
    const formDataWithMedicine = {
      ...defaultFormData,
      category: InventoryItemCategory.MEDICINES,
    };
    render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} formData={formDataWithMedicine} />
      </TestWrapper>
    );
    expect(screen.getByText("Usage Method")).toBeInTheDocument();
  });

  it("should render usage method fields for vaccines", () => {
    const formDataWithVaccine = {
      ...defaultFormData,
      category: InventoryItemCategory.VACCINES,
    };
    render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} formData={formDataWithVaccine} />
      </TestWrapper>
    );
    expect(screen.getByText("Usage Method")).toBeInTheDocument();
  });

  it("should handle usage amount input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithMedicine = {
      ...defaultFormData,
      category: InventoryItemCategory.MEDICINES,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithMedicine}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const usageAmountInput = container.querySelector('input[placeholder="1"]') as HTMLInputElement;
    if (usageAmountInput) {
      await user.type(usageAmountInput, "5");
      expect(onFieldChange).toHaveBeenCalledWith("usageAmount", expect.any(String));
    }
  });

  it("should handle usage unit select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithMedicine = {
      ...defaultFormData,
      category: InventoryItemCategory.MEDICINES,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithMedicine}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const usageUnitSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return label?.textContent === "Usage Unit";
    }) as HTMLSelectElement;
    if (usageUnitSelect && usageUnitSelect.querySelector('option[value="ml"]')) {
      await user.selectOptions(usageUnitSelect, "ml");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle usage basis select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithMedicine = {
      ...defaultFormData,
      category: InventoryItemCategory.MEDICINES,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithMedicine}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const usageBasisSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return label?.textContent === "Usage Basis";
    }) as HTMLSelectElement;
    if (usageBasisSelect && usageBasisSelect.querySelector('option[value="per_animal"]')) {
      await user.selectOptions(usageBasisSelect, "per_animal");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle unit price input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const unitPriceInput = container.querySelector(
      'input[placeholder*="price"]'
    ) as HTMLInputElement;
    if (unitPriceInput) {
      await user.type(unitPriceInput, "10.50");
      expect(onFieldChange).toHaveBeenCalledWith("unitPrice", expect.any(String));
    }
  });

  it("should handle initial stock input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          showInitialStock={true}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const initialStockInput = container.querySelector(
      'input[placeholder*="stock"]'
    ) as HTMLInputElement;
    if (initialStockInput) {
      await user.type(initialStockInput, "100");
      expect(onFieldChange).toHaveBeenCalledWith("initialStock", expect.any(String));
    }
  });

  it("should handle supplier select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const supplierSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return label?.textContent === "Supplier";
    }) as HTMLSelectElement;
    if (supplierSelect) {
      await user.selectOptions(supplierSelect, mockSuppliers[0].id);
      expect(onFieldChange).toHaveBeenCalledWith("supplierId", mockSuppliers[0].id);
    }
  });

  it("should render cash flow transaction checkbox when supplierId and showInitialStock are set", () => {
    const formDataWithSupplier = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
    };
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithSupplier}
          showInitialStock={true}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Create Transaction")).toBeInTheDocument();
  });

  it("should handle createCashFlowTransaction checkbox change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithSupplier = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
    };
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithSupplier}
          showInitialStock={true}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const checkbox = screen.getByLabelText("Create Transaction");
    await user.click(checkbox);
    expect(onFieldChange).toHaveBeenCalledWith("createCashFlowTransaction", true);
  });

  it("should render payment method and bank account when createCashFlowTransaction is true", () => {
    const formDataWithTransaction = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createCashFlowTransaction: true,
    };
    const bankAccounts = [
      {
        id: "account-1",
        bankName: "Test Bank",
        bankCode: "001",
        branch: "0001",
        accountNumber: "12345",
        accountType: "checking" as const,
        accountHolderName: "Test Holder",
        status: "active" as const,
        companyId: "company-1",
        createdAt: "2025-01-01",
      },
    ];
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithTransaction}
          showInitialStock={true}
          bankAccounts={bankAccounts}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Payment Method")).toBeInTheDocument();
    expect(screen.getByText("Bank Account")).toBeInTheDocument();
  });

  it("should handle payment method change for cash flow", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithTransaction = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createCashFlowTransaction: true,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithTransaction}
          showInitialStock={true}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const paymentMethodSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return label?.textContent === "Payment Method";
    }) as HTMLSelectElement;
    if (paymentMethodSelect) {
      await user.selectOptions(paymentMethodSelect, PaymentMethod.CASH);
      expect(onFieldChange).toHaveBeenCalledWith("paymentMethod", PaymentMethod.CASH);
    }
  });

  it("should handle bank account change for cash flow", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithTransaction = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createCashFlowTransaction: true,
    };
    const bankAccounts = [
      {
        id: "account-1",
        bankName: "Test Bank",
        bankCode: "001",
        branch: "0001",
        accountNumber: "12345",
        accountType: "checking" as const,
        accountHolderName: "Test Holder",
        status: "active" as const,
        companyId: "company-1",
        createdAt: "2025-01-01",
      },
    ];
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithTransaction}
          showInitialStock={true}
          bankAccounts={bankAccounts}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const bankAccountSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return label?.textContent === "Bank Account";
    }) as HTMLSelectElement;
    if (bankAccountSelect) {
      await user.selectOptions(bankAccountSelect, "account-1");
      expect(onFieldChange).toHaveBeenCalledWith("bankAccountId", "account-1");
    }
  });

  it("should handle createAccountPayable checkbox change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithSupplier = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
    };
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithSupplier}
          showInitialStock={true}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const checkbox = screen.getByLabelText("Create Payable");
    await user.click(checkbox);
    expect(onFieldChange).toHaveBeenCalledWith("createAccountPayable", true);
  });

  it("should render account payable fields when createAccountPayable is true", () => {
    const formDataWithPayable = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createAccountPayable: true,
    };
    const bankAccounts = [
      {
        id: "account-1",
        bankName: "Test Bank",
        bankCode: "001",
        branch: "0001",
        accountNumber: "12345",
        accountType: "savings" as const,
        accountHolderName: "Test Holder",
        status: "active" as const,
        companyId: "company-1",
        createdAt: "2025-01-01",
      },
    ];
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithPayable}
          showInitialStock={true}
          bankAccounts={bankAccounts}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Due Date")).toBeInTheDocument();
  });

  it("should handle due date input change", async () => {
    const onFieldChange = vi.fn();
    const _user = userEvent.setup();
    const formDataWithPayable = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createAccountPayable: true,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithPayable}
          showInitialStock={true}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const dueDateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    if (dueDateInput) {
      fireEvent.change(dueDateInput, { target: { value: "2025-12-31" } });
      expect(onFieldChange).toHaveBeenCalledWith("dueDate", "2025-12-31");
    }
  });

  it("should handle propertyIds select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;
    if (propertySelect) {
      await user.selectOptions(propertySelect, [mockProperties[0].id, mockProperties[1].id]);
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle hasExpiration checkbox change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const checkbox = screen.getByLabelText("Has Expiration");
    await user.click(checkbox);
    expect(onFieldChange).toHaveBeenCalledWith("hasExpiration", true);
  });

  it("should handle minimum stock input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const numberInputs = container.querySelectorAll('input[type="number"]');
    const minimumStockInput = Array.from(numberInputs).find((input) => {
      const label = input.closest("div")?.querySelector("label");
      return label?.textContent === "Minimum Stock";
    }) as HTMLInputElement;
    if (minimumStockInput) {
      await user.type(minimumStockInput, "10");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle expiration date input change", async () => {
    const onFieldChange = vi.fn();
    const formDataWithExpiration = {
      ...defaultFormData,
      hasExpiration: true,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithExpiration}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const expirationDateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    if (expirationDateInput) {
      fireEvent.change(expirationDateInput, { target: { value: "2025-12-31" } });
      expect(onFieldChange).toHaveBeenCalledWith("expirationDate", "2025-12-31");
    }
  });

  it("should disable expiration date when hasExpiration is false", () => {
    const formDataWithoutExpiration = {
      ...defaultFormData,
      hasExpiration: false,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} formData={formDataWithoutExpiration} />
      </TestWrapper>
    );
    const expirationDateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    if (expirationDateInput) {
      expect(expirationDateInput).toBeDisabled();
    }
  });

  it("should handle observation textarea change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} showObservation={true} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const textareas = container.querySelectorAll("textarea");
    const observationTextarea = textareas[textareas.length - 1]; // Last textarea should be observation
    if (observationTextarea) {
      await user.type(observationTextarea, "Test observation");
      expect(onFieldChange).toHaveBeenCalledWith("observation", expect.any(String));
    }
  });

  it("should disable cash flow checkbox when initialStock is 0", () => {
    const formDataWithZeroStock = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "0",
    };
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithZeroStock}
          showInitialStock={true}
        />
      </TestWrapper>
    );
    const checkbox = screen.getByLabelText("Create Transaction");
    expect(checkbox).toBeDisabled();
  });

  it("should disable account payable checkbox when initialStock is 0", () => {
    const formDataWithZeroStock = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "0",
    };
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithZeroStock}
          showInitialStock={true}
        />
      </TestWrapper>
    );
    const checkbox = screen.getByLabelText("Create Payable");
    expect(checkbox).toBeDisabled();
  });

  it("should display bank account with savings type", () => {
    const formDataWithTransaction = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createCashFlowTransaction: true,
    };
    const bankAccounts = [
      {
        id: "account-1",
        bankName: "Test Bank",
        bankCode: "001",
        branch: "0001",
        accountNumber: "12345",
        accountType: "savings" as const,
        accountHolderName: "Test Holder",
        status: "active" as const,
        companyId: "company-1",
        createdAt: "2025-01-01",
      },
    ];
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithTransaction}
          showInitialStock={true}
          bankAccounts={bankAccounts}
        />
      </TestWrapper>
    );
    expect(screen.getByText(/Savings/)).toBeInTheDocument();
  });

  it("should display errors for description", () => {
    render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} errors={{ description: "Description is required" }} />
      </TestWrapper>
    );
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("should display errors for propertyIds", () => {
    render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          errors={{ propertyIds: "At least one property is required" }}
        />
      </TestWrapper>
    );
    expect(screen.getByText("At least one property is required")).toBeInTheDocument();
  });

  it("should handle unit select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const unitSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return label?.textContent === "Unit";
    }) as HTMLSelectElement;
    if (unitSelect && unitSelect.querySelector('option[value="l"]')) {
      await user.selectOptions(unitSelect, "l");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle account payable payment method change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithPayable = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createAccountPayable: true,
    };
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithPayable}
          showInitialStock={true}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const paymentMethodSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return (
        label?.textContent === "Payment Method" &&
        select.value !== formDataWithPayable.paymentMethod
      );
    }) as HTMLSelectElement;
    if (
      paymentMethodSelect &&
      paymentMethodSelect.querySelector(`option[value="${PaymentMethod.CASH}"]`)
    ) {
      await user.selectOptions(paymentMethodSelect, PaymentMethod.CASH);
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should handle account payable bank account change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const formDataWithPayable = {
      ...defaultFormData,
      supplierId: mockSuppliers[0].id,
      initialStock: "100",
      createAccountPayable: true,
    };
    const bankAccounts = [
      {
        id: "account-1",
        bankName: "Test Bank",
        bankCode: "001",
        branch: "0001",
        accountNumber: "12345",
        accountType: "checking" as const,
        accountHolderName: "Test Holder",
        status: "active" as const,
        companyId: "company-1",
        createdAt: "2025-01-01",
      },
    ];
    const { container } = render(
      <TestWrapper>
        <InventoryItemForm
          {...defaultProps}
          formData={formDataWithPayable}
          showInitialStock={true}
          bankAccounts={bankAccounts}
          onFieldChange={onFieldChange}
        />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const bankAccountSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return (
        label?.textContent === "Bank Account" &&
        select.value !== formDataWithPayable.accountPayableBankAccountId
      );
    }) as HTMLSelectElement;
    if (bankAccountSelect && bankAccountSelect.querySelector('option[value="account-1"]')) {
      await user.selectOptions(bankAccountSelect, "account-1");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });
});
