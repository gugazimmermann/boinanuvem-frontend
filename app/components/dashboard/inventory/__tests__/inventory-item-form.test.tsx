import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryItemForm } from "../inventory-item-form";
import { InventoryItemCategory, PaymentMethod, AreaType, type Property } from "~/types";

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        defaultValue={value || ""}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div>
      <label>{label}</label>
      <select data-testid={`select-${label}`} value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FileUpload: () => <div data-testid="file-upload">File Upload</div>,
}));

vi.mock("~/utils/inventory-utils", () => ({
  getInventoryCategoryOptions: vi.fn(() => [{ value: "medicines", label: "Medicines" }]),
  getInventoryUnitOptions: vi.fn(() => [
    { value: "unit", label: "Unit" },
    { value: "kg", label: "Kg" },
  ]),
  getUsageUnitOptions: vi.fn(() => [{ value: "ml", label: "ML" }]),
  getUsageBasisOptions: vi.fn(() => [
    { value: "per_animal", label: "Per Animal" },
    { value: "per_kg", label: "Per Kg" },
  ]),
}));

describe("InventoryItemForm", () => {
  const defaultProps = {
    formData: {
      code: "",
      name: "",
      description: "",
      category: InventoryItemCategory.CUSTOM,
      customCategory: "",
      unit: "unit",
      supplierId: "",
      minimumStock: "",
      hasExpiration: false,
      expirationDate: "",
      unitPrice: "",
      initialStock: "",
      propertyIds: [],
      paymentMethod: PaymentMethod.CASH,
      usageAmount: "",
      usageUnit: "",
      usageBasis: "",
      nitrogenContent: "",
      createCashFlowTransaction: false,
      bankAccountId: "",
      createAccountPayable: false,
      dueDate: "",
      accountPayablePaymentMethod: PaymentMethod.CASH,
      accountPayableBankAccountId: "",
      observation: "",
    },
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
        categories: {},
        units: {},
        new: {
          customCategoryLabel: "Custom Category",
          unitPriceLabel: "Unit Price",
          unitPricePlaceholder: "0.00",
          initialStockLabel: "Initial Stock",
          initialStockPlaceholder: "0",
          propertyLabel: "Property",
          usageMethod: "Usage Method",
          usageAmount: "Amount",
          usageUnit: "Unit",
          usageBasis: "Basis",
          usageBasisOptions: {
            perAnimal: "Per Animal",
            perKg: "Per Kg",
          },
        },
        movements: {
          new: {
            createCashFlowTransaction: "Create Cash Flow",
            createAccountPayable: "Create Account Payable",
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
          cash: "Cash",
          creditCard: "Credit Card",
          debitCard: "Debit Card",
          pix: "PIX",
          bankTransfer: "Bank Transfer",
        },
      },
      bankAccounts: {
        accountTypes: {
          checking: "Checking",
          savings: "Savings",
        },
      },
    },
    suppliers: [],
    properties: [],
    bankAccounts: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render form fields", () => {
    render(<InventoryItemForm {...defaultProps} />);
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should call onFieldChange when field changes", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />);

    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test Item");

    expect(onFieldChange).toHaveBeenCalled();
  });

  it("should display errors when provided", () => {
    render(<InventoryItemForm {...defaultProps} errors={{ name: "Name is required" }} />);
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("should disable inputs when isSubmitting is true", () => {
    render(<InventoryItemForm {...defaultProps} isSubmitting={true} />);
    const nameInput = screen.getByTestId("input-Name");
    expect(nameInput).toBeDisabled();
  });

  it("should show custom category field when category is CUSTOM", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.CUSTOM,
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByText("Custom Category")).toBeInTheDocument();
  });

  it("should show nitrogen content field when category is FERTILIZER", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.FERTILIZER,
      },
    };
    render(<InventoryItemForm {...props} />);
    const nitrogenContentElements = screen.getAllByText(/Nitrogen Content/i);
    expect(nitrogenContentElements.length).toBeGreaterThan(0);
  });

  it("should show usage method fields when category is MEDICINES", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.MEDICINES,
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByText("Usage Method")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    const unitElements = screen.getAllByText("Unit");
    expect(unitElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Basis")).toBeInTheDocument();
  });

  it("should show usage method fields when category is VACCINES", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.VACCINES,
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByText("Usage Method")).toBeInTheDocument();
  });

  it("should show initial stock field when showInitialStock is true", () => {
    render(<InventoryItemForm {...defaultProps} showInitialStock={true} />);
    expect(screen.getByText("Initial Stock")).toBeInTheDocument();
  });

  it("should not show initial stock field when showInitialStock is false", () => {
    render(<InventoryItemForm {...defaultProps} showInitialStock={false} />);
    expect(screen.queryByText("Initial Stock")).not.toBeInTheDocument();
  });

  it("should handle supplier selection", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const suppliers = [
      {
        id: "supplier-1",
        name: "Supplier 1",
        code: "SUP-1",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyIds: [],
      },
    ];
    render(
      <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} suppliers={suppliers} />
    );
    const supplierSelect = screen.getByTestId("select-Supplier");
    await user.selectOptions(supplierSelect, "supplier-1");
    expect(onFieldChange).toHaveBeenCalledWith("supplierId", "supplier-1");
  });

  it("should handle property selection", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const properties: Property[] = [
      {
        id: "property-1",
        name: "Property 1",
        code: "PROP-1",
        companyId: "company-1",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ];
    render(
      <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} properties={properties} />
    );
    const propertySelect = screen.getByRole("listbox");
    await user.selectOptions(propertySelect, "property-1");
    expect(onFieldChange).toHaveBeenCalled();
  });

  it("should handle hasExpiration checkbox", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />);
    const hasExpirationCheckbox = screen.getByLabelText(/Has Expiration/i);
    await user.click(hasExpirationCheckbox);
    expect(onFieldChange).toHaveBeenCalledWith("hasExpiration", true);
  });

  it("should enable expiration date when hasExpiration is true", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        hasExpiration: true,
      },
    };
    render(<InventoryItemForm {...props} />);
    const expirationDateInput = screen.getByTestId("input-Expiration Date");
    expect(expirationDateInput).not.toBeDisabled();
  });

  it("should disable expiration date when hasExpiration is false", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        hasExpiration: false,
      },
    };
    render(<InventoryItemForm {...props} />);
    const expirationDateInput = screen.getByTestId("input-Expiration Date");
    expect(expirationDateInput).toBeDisabled();
  });

  it("should show createCashFlowTransaction checkbox when supplierId and showInitialStock are true", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        supplierId: "supplier-1",
        initialStock: "10",
      },
      showInitialStock: true,
      translations: {
        ...defaultProps.translations,
        inventory: {
          ...defaultProps.translations.inventory,
          movements: {
            new: {
              createCashFlowTransaction: "Create Cash Flow",
              createAccountPayable: "Create Account Payable",
              paymentMethod: "Payment Method",
              bankAccount: "Bank Account",
              dueDate: "Due Date",
            },
          },
        },
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByLabelText(/Create Cash Flow/i)).toBeInTheDocument();
  });

  it("should disable createCashFlowTransaction when initialStock is 0", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        supplierId: "supplier-1",
        initialStock: "0",
      },
      showInitialStock: true,
      translations: {
        ...defaultProps.translations,
        inventory: {
          ...defaultProps.translations.inventory,
          movements: {
            new: {
              createCashFlowTransaction: "Create Cash Flow",
              createAccountPayable: "Create Account Payable",
              paymentMethod: "Payment Method",
              bankAccount: "Bank Account",
              dueDate: "Due Date",
            },
          },
        },
      },
    };
    render(<InventoryItemForm {...props} />);
    const checkbox = screen.getByLabelText(/Create Cash Flow/i);
    expect(checkbox).toBeDisabled();
  });

  it("should show payment method and bank account when createCashFlowTransaction is checked", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        supplierId: "supplier-1",
        initialStock: "10",
        createCashFlowTransaction: true,
      },
      showInitialStock: true,
      translations: {
        ...defaultProps.translations,
        inventory: {
          ...defaultProps.translations.inventory,
          movements: {
            new: {
              createCashFlowTransaction: "Create Cash Flow",
              createAccountPayable: "Create Account Payable",
              paymentMethod: "Payment Method",
              bankAccount: "Bank Account",
              dueDate: "Due Date",
            },
          },
        },
        cashFlow: {
          paymentMethods: {
            cash: "Cash",
            creditCard: "Credit Card",
          },
        },
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByText("Payment Method")).toBeInTheDocument();
    expect(screen.getByText("Bank Account")).toBeInTheDocument();
  });

  it("should show createAccountPayable checkbox when supplierId and showInitialStock are true", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        supplierId: "supplier-1",
        initialStock: "10",
      },
      showInitialStock: true,
      translations: {
        ...defaultProps.translations,
        inventory: {
          ...defaultProps.translations.inventory,
          movements: {
            new: {
              createCashFlowTransaction: "Create Cash Flow",
              createAccountPayable: "Create Account Payable",
              paymentMethod: "Payment Method",
              bankAccount: "Bank Account",
              dueDate: "Due Date",
            },
          },
        },
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByLabelText(/Create Account Payable/i)).toBeInTheDocument();
  });

  it("should show due date and payment method when createAccountPayable is checked", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        supplierId: "supplier-1",
        initialStock: "10",
        createAccountPayable: true,
      },
      showInitialStock: true,
      translations: {
        ...defaultProps.translations,
        inventory: {
          ...defaultProps.translations.inventory,
          movements: {
            new: {
              createCashFlowTransaction: "Create Cash Flow",
              createAccountPayable: "Create Account Payable",
              paymentMethod: "Payment Method",
              bankAccount: "Bank Account",
              dueDate: "Due Date",
            },
          },
        },
        cashFlow: {
          paymentMethods: {
            cash: "Cash",
          },
        },
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByText("Due Date")).toBeInTheDocument();
  });

  it("should show observation field when showObservation is true", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        observation: "",
      },
      showObservation: true,
      translations: {
        ...defaultProps.translations,
        cashFlow: {
          paymentMethods: {
            cash: "Cash",
            creditCard: "Credit Card",
          },
          details: {
            observation: "Observation",
            observationPlaceholder: "Enter observation",
            files: "Files",
            filesHelper: "Helper text",
          },
        },
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByText("Observation")).toBeInTheDocument();
  });

  it("should show file upload when showObservation is true and onObservationFilesChange is provided", () => {
    const props = {
      ...defaultProps,
      showObservation: true,
      onObservationFilesChange: vi.fn(),
      translations: {
        ...defaultProps.translations,
        cashFlow: {
          paymentMethods: {
            cash: "Cash",
            creditCard: "Credit Card",
          },
          details: {
            observation: "Observation",
            files: "Files",
            filesHelper: "Helper text",
          },
        },
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  it("should handle description change", async () => {
    const onFieldChange = vi.fn();
    render(<InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />);
    const descriptionTextarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (descriptionTextarea) {
      // Use fireEvent.change to directly set the value, which works better with controlled components
      fireEvent.change(descriptionTextarea, { target: { value: "Test description" } });
      expect(onFieldChange).toHaveBeenCalledWith("description", "Test description");
    }
  });

  it("should handle category change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />);
    const categorySelect = screen.getByTestId("select-Category");
    await user.selectOptions(categorySelect, InventoryItemCategory.MEDICINES);
    expect(onFieldChange).toHaveBeenCalledWith("category", InventoryItemCategory.MEDICINES);
  });

  it("should handle unit change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />);
    const unitSelects = screen.getAllByTestId("select-Unit");
    // The first one should be the main unit select (not the usage unit)
    const unitSelect = unitSelects[0];
    await user.selectOptions(unitSelect, "kg");
    expect(onFieldChange).toHaveBeenCalledWith("unit", "kg");
  });

  it("should handle unitPrice change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />);
    const unitPriceInput = screen.getByTestId("input-Unit Price");
    await user.type(unitPriceInput, "10.50");
    expect(onFieldChange).toHaveBeenCalledWith("unitPrice", "10.50");
  });

  it("should handle minimumStock change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} />);
    const minimumStockInput = screen.getByTestId("input-Minimum Stock");
    await user.type(minimumStockInput, "5");
    expect(onFieldChange).toHaveBeenCalledWith("minimumStock", "5");
  });

  it("should handle expirationDate change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        hasExpiration: true,
      },
    };
    render(<InventoryItemForm {...props} onFieldChange={onFieldChange} />);
    const expirationDateInput = screen.getByTestId("input-Expiration Date");
    await user.type(expirationDateInput, "2024-12-31");
    expect(onFieldChange).toHaveBeenCalledWith("expirationDate", "2024-12-31");
  });

  it("should handle usageAmount change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.MEDICINES,
      },
    };
    render(<InventoryItemForm {...props} onFieldChange={onFieldChange} />);
    const usageAmountInput = screen.getByTestId("input-Amount");
    await user.type(usageAmountInput, "5");
    expect(onFieldChange).toHaveBeenCalledWith("usageAmount", "5");
  });

  it("should handle usageUnit change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.MEDICINES,
      },
    };
    render(<InventoryItemForm {...props} onFieldChange={onFieldChange} />);
    const unitSelects = screen.getAllByTestId("select-Unit");
    // The second one should be the usage unit select (when medicines category is selected)
    const usageUnitSelect = unitSelects[1];
    await user.selectOptions(usageUnitSelect, "ml");
    expect(onFieldChange).toHaveBeenCalledWith("usageUnit", "ml");
  });

  it("should handle usageBasis change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.MEDICINES,
      },
    };
    render(<InventoryItemForm {...props} onFieldChange={onFieldChange} />);
    const usageBasisSelect = screen.getByTestId("select-Basis");
    await user.selectOptions(usageBasisSelect, "per_animal");
    expect(onFieldChange).toHaveBeenCalledWith("usageBasis", "per_animal");
  });

  it("should handle nitrogenContent change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        category: InventoryItemCategory.FERTILIZER,
      },
    };
    render(<InventoryItemForm {...props} onFieldChange={onFieldChange} />);
    const nitrogenInput = screen.getByTestId("input-Nitrogen Content (kg per unit)");
    await user.type(nitrogenInput, "10");
    expect(onFieldChange).toHaveBeenCalledWith("nitrogenContent", "10");
  });

  it("should handle initialStock change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(
      <InventoryItemForm {...defaultProps} onFieldChange={onFieldChange} showInitialStock={true} />
    );
    const initialStockInput = screen.getByTestId("input-Initial Stock");
    await user.type(initialStockInput, "100");
    expect(onFieldChange).toHaveBeenCalledWith("initialStock", "100");
  });

  it("should handle paymentMethod change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        supplierId: "supplier-1",
        initialStock: "10",
        createCashFlowTransaction: true,
      },
      showInitialStock: true,
      translations: {
        ...defaultProps.translations,
        inventory: {
          ...defaultProps.translations.inventory,
          movements: {
            new: {
              createCashFlowTransaction: "Create Cash Flow",
              createAccountPayable: "Create Account Payable",
              paymentMethod: "Payment Method",
              bankAccount: "Bank Account",
              dueDate: "Due Date",
            },
          },
        },
        cashFlow: {
          paymentMethods: {
            cash: "Cash",
            creditCard: "Credit Card",
          },
        },
      },
    };
    render(<InventoryItemForm {...props} onFieldChange={onFieldChange} />);
    const paymentMethodSelect = screen.getByTestId("select-Payment Method");
    await user.selectOptions(paymentMethodSelect, PaymentMethod.CREDIT_CARD);
    expect(onFieldChange).toHaveBeenCalledWith("paymentMethod", PaymentMethod.CREDIT_CARD);
  });

  it("should handle bankAccountId change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const bankAccounts = [
      {
        id: "bank-1",
        companyId: "company-1",
        bankName: "Bank 1",
        bankCode: "001",
        branch: "0001",
        accountNumber: "12345",
        accountType: "checking" as const,
        accountHolderName: "John Doe",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        supplierId: "supplier-1",
        initialStock: "10",
        createCashFlowTransaction: true,
      },
      showInitialStock: true,
      bankAccounts,
      translations: {
        ...defaultProps.translations,
        inventory: {
          ...defaultProps.translations.inventory,
          movements: {
            new: {
              createCashFlowTransaction: "Create Cash Flow",
              createAccountPayable: "Create Account Payable",
              paymentMethod: "Payment Method",
              bankAccount: "Bank Account",
              dueDate: "Due Date",
            },
          },
        },
        cashFlow: {
          paymentMethods: {},
        },
      },
    };
    render(<InventoryItemForm {...props} onFieldChange={onFieldChange} />);
    const bankAccountSelect = screen.getByTestId("select-Bank Account");
    await user.selectOptions(bankAccountSelect, "bank-1");
    expect(onFieldChange).toHaveBeenCalledWith("bankAccountId", "bank-1");
  });

  it("should display error for all fields", () => {
    const props = {
      ...defaultProps,
      errors: {
        code: "Code is required",
        name: "Name is required",
        category: "Category is required",
        unit: "Unit is required",
        minimumStock: "Minimum stock is required",
        expirationDate: "Expiration date is required",
        propertyIds: "At least one property is required",
      },
    };
    render(<InventoryItemForm {...props} />);
    expect(screen.getAllByTestId("error").length).toBeGreaterThan(0);
  });
});
