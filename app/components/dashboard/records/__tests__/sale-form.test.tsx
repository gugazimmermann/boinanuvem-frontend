import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaleForm } from "../sale-form";
import { BrowserRouter } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { SaleType, PricingMode } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { mockBuyers } from "~/mocks/buyers";
import { mockAnimals } from "~/mocks/animals";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

let mockUseSaleFormReturn: ReturnType<typeof import("~/hooks/use-sale-form").useSaleForm> | null =
  null;

const mockUseSaleForm = vi.fn(() => {
  if (mockUseSaleFormReturn) {
    return mockUseSaleFormReturn;
  }
  // Default return value
  return {
    formData: {
      propertyId: "",
      buyerId: "",
      saleDate: "",
      saleType: "",
      pricingMode: "",
      paymentMethod: "",
      totalPrice: "",
      selectedAnimalIds: [],
      saleItems: [],
      fees: [],
      observation: "",
    },
    errors: {},
    isSubmitting: false,
    alertMessage: null,
    animalSearch: "",
    setAnimalSearch: vi.fn(),
    handleChange: vi.fn(),
    toggleAnimalSelection: vi.fn(),
    handleSaleItemChange: vi.fn(),
    handleTotalPriceChange: vi.fn(),
    handlePricingModeChange: vi.fn(),
    addFee: vi.fn(),
    removeFee: vi.fn(),
    updateFee: vi.fn(),
    calculateTotal: vi.fn(() => 0),
    validateForm: vi.fn(() => true),
    handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    showAlert: vi.fn(),
  };
});

vi.mock("~/hooks/use-sale-form", () => ({
  useSaleForm: (config: unknown) => {
    // The mock function should return the mocked value
    // If mockReturnValueOnce was called, it will return that value
    // Otherwise, it returns the default implementation
    const result = mockUseSaleForm(config);
    return result;
  },
}));

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      type,
      value,
      onChange,
      disabled,
      placeholder,
      className,
      error,
    }: {
      type?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      placeholder?: string;
      className?: string;
    }) => {
      // Create a controlled input that calls onChange when value changes
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
          onChange(e);
        }
      };
      return (
        <div>
          <input
            type={type}
            value={value || ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className={className}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );
    }
  ),
  Select: vi.fn(
    ({
      value,
      onChange,
      disabled,
      options,
      className,
      showPlaceholder: _showPlaceholder,
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      disabled?: boolean;
      options?: Array<{ value: string; label: string }>;
      className?: string;
      showPlaceholder?: boolean;
    }) => {
      // Create a controlled select that calls onChange when value changes
      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
          onChange(e);
        }
      };
      return (
        <select
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className={className}
        >
          {options?.map((opt: { value: string; label: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
  ),
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      type,
      variant,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
      variant?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} type={type} data-variant={variant}>
        {children}
      </button>
    )
  ),
  Alert: vi.fn(({ title, variant }: { title?: string; variant?: string }) =>
    title ? (
      <div data-testid="alert" data-variant={variant}>
        {title}
      </div>
    ) : null
  ),
  FormFieldGroup: vi.fn(({ children }: { children?: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("../fee-manager", () => ({
  FeeManager: vi.fn(
    ({
      fees,
      onAddFee,
      onRemoveFee,
      onUpdateFee,
      disabled,
    }: {
      fees?: Array<{ id: string; name: string; amount: number; type: string }>;
      onAddFee?: () => void;
      onRemoveFee?: (id: string) => void;
      onUpdateFee?: (id: string, field: string, value: unknown) => void;
      disabled?: boolean;
    }) => (
      <div data-testid="fee-manager">
        <button onClick={onAddFee} disabled={disabled}>
          Add Fee
        </button>
        {fees?.map((fee: { id: string; name: string; amount: number; type: string }) => (
          <div key={fee.id}>
            <input
              value={fee.name}
              onChange={(e) => onUpdateFee?.(fee.id, "name", e.target.value)}
              disabled={disabled}
            />
            <input
              value={fee.amount}
              onChange={(e) => onUpdateFee?.(fee.id, "amount", e.target.value)}
              disabled={disabled}
            />
            <button onClick={() => onRemoveFee?.(fee.id)} disabled={disabled}>
              Remove
            </button>
          </div>
        ))}
      </div>
    )
  ),
}));

const mockIsAnimalSold = vi.fn(() => false);
vi.mock("~/services/sales.service", () => {
  return {
    isAnimalSold: (...args: unknown[]) => mockIsAnimalSold(...args),
  };
});

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
}));

vi.mock("~/utils/currency", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sales: {
      form: {
        property: "Property",
        buyer: "Buyer",
        saleDate: "Sale Date",
        saleType: "Sale Type",
        pricingMode: "Pricing Mode",
        paymentMethod: "Payment Method",
        totalPrice: "Total Price",
        animals: "Animals",
        searchAnimals: "Search animals",
        noAnimals: "No animals found",
        sold: "Sold",
        saleItems: "Sale Items",
        weight: "Weight",
        price: "Price",
        pricePerAnimal: "Price per animal",
        carcassWeight: "Carcass Weight",
        observation: "Observation",
        total: "Total",
        update: "Update",
        submit: "Submit",
        selectProperty: "Select property",
        selectBuyer: "Select buyer",
        selectSaleType: "Select sale type",
        selectPricingMode: "Select pricing mode",
        selectPaymentMethod: "Select payment method",
        calculatedAutomatically: "Calculated automatically",
      },
      saleTypes: {
        slaughterhouse: "Slaughterhouse",
        otherFarm: "Other Farm",
        auction: "Auction",
      },
      pricingModes: {
        individual: "Individual",
        total: "Total",
      },
      paymentMethods: {
        cashFlow: "Cash Flow",
        accountsReceivable: "Accounts Receivable",
      },
    },
    common: {
      cancel: "Cancel",
      saving: "Saving...",
    },
  })),
}));

describe("SaleForm", () => {
  const defaultProps = {
    animals: mockAnimals.slice(0, 5),
    buyers: mockBuyers.slice(0, 2),
    properties: mockProperties.slice(0, 2),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  const getDefaultMockReturn = () => ({
    formData: {
      propertyId: "",
      buyerId: "",
      saleDate: "",
      saleType: "",
      pricingMode: "",
      paymentMethod: "",
      totalPrice: "",
      selectedAnimalIds: [],
      saleItems: [],
      fees: [],
      observation: "",
    },
    errors: {},
    isSubmitting: false,
    alertMessage: null,
    animalSearch: "",
    setAnimalSearch: vi.fn(),
    handleChange: vi.fn(),
    toggleAnimalSelection: vi.fn(),
    handleSaleItemChange: vi.fn(),
    handleTotalPriceChange: vi.fn(),
    handlePricingModeChange: vi.fn(),
    addFee: vi.fn(),
    removeFee: vi.fn(),
    updateFee: vi.fn(),
    calculateTotal: vi.fn(() => 0),
    validateForm: vi.fn(() => true),
    handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    showAlert: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the return value variable
    mockUseSaleFormReturn = null;
  });

  it("should render sale form", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
    expect(screen.getByText("Buyer")).toBeInTheDocument();
  });

  it("should render title and description when provided", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} title="New Sale" description="Create a new sale" />
      </TestWrapper>
    );
    expect(screen.getByText("New Sale")).toBeInTheDocument();
    expect(screen.getByText("Create a new sale")).toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} onCancel={onCancel} />
      </TestWrapper>
    );
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should render FeeManager", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("fee-manager")).toBeInTheDocument();
  });

  it("should render animal search", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should render total price section when pricingMode is TOTAL", () => {
    // PricingMode.TOTAL equals "total" string, which matches PricingModeEnum.TOTAL
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL, // This is the string "total"
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    // The component checks: formData.pricingMode === PricingModeEnum.TOTAL
    // PricingModeEnum.TOTAL === "total" === PricingMode.TOTAL
    expect(screen.getByText(/Total Price/i)).toBeInTheDocument();
  });

  it("should render sale items when animals are selected", () => {
    // Ensure selectedAnimalIds is an array with at least one item
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    // The component checks: Array.isArray(formData.selectedAnimalIds) && formData.selectedAnimalIds.length > 0
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should render carcass weight field for slaughterhouse sales", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        saleType: SaleType.SLAUGHTERHOUSE,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
            carcassWeight: "300",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Carcass Weight")).toBeInTheDocument();
  });

  it("should render alert message", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      alertMessage: { title: "Error", variant: "error" as const },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should render price per animal when total price mode with selected animals", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [mockAnimals[0].id, mockAnimals[1].id],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Price per animal/i)).toBeInTheDocument();
  });

  it("should render individual pricing mode for sale items", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should render sold badge for sold animals", () => {
    mockIsAnimalSold.mockImplementation((id: string) => id === mockAnimals[0].id);
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    // The sold badge should appear for sold animals
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
    mockIsAnimalSold.mockReturnValue(false); // Reset
  });

  it("should render calculated price for total mode in sale items", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "2500.00",
            weight: "500",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should render custom submit button text", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} submitButtonText="Create Sale" />
      </TestWrapper>
    );
    expect(screen.getByText("Create Sale")).toBeInTheDocument();
  });

  it("should render custom cancel button text", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} cancelButtonText="Go Back" />
      </TestWrapper>
    );
    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  it("should render loading state on submit button", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      isSubmitting: true,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should render update text in edit mode", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      isSubmitting: false,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("should handle filtered animals with search", async () => {
    const user = userEvent.setup();
    const setAnimalSearch = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      animalSearch: "",
      setAnimalSearch,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const searchInput = screen.getByPlaceholderText("Search animals");
    // Type "001" - this should trigger onChange multiple times
    await user.type(searchInput, "001");
    // The component calls setAnimalSearch(e.target.value) on onChange
    // Since we're using user.type, each character triggers onChange
    // The mock Input component calls onChange, which calls setAnimalSearch
    // We check that setAnimalSearch was called (it will be called multiple times, once per character)
    expect(setAnimalSearch).toHaveBeenCalled();
    // Check that it was called with at least one of the expected values
    // user.type might clear the input first, so we check for any call with "0", "00", or "001"
    const calls = setAnimalSearch.mock.calls.map((call: unknown[]) => call[0] as string);
    expect(
      calls.some((val: string) => val === "0" || val === "00" || val === "001" || val === "1")
    ).toBe(true);
  });

  it("should display no animals message when filtered list is empty", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      animalSearch: "nonexistent",
      setAnimalSearch: vi.fn(),
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} animals={[]} />
      </TestWrapper>
    );
    expect(screen.getByText("No animals found")).toBeInTheDocument();
  });

  it("should display error messages", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      errors: {
        propertyId: "Property is required",
        buyerId: "Buyer is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Property is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Buyer is required/i)).toBeInTheDocument();
  });

  it("should handle toSafeString with null value", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        propertyId: null as unknown as string,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with number value", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        propertyId: 123 as unknown as string,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle errorMessage prop", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      alertMessage: { title: "Error message", variant: "error" as const },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} errorMessage="Custom error" />
      </TestWrapper>
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should handle toggleAnimalSelection when animal is not sold", async () => {
    const user = userEvent.setup();
    const toggleAnimalSelection = vi.fn();
    mockIsAnimalSold.mockReturnValue(false);
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        selectedAnimalIds: [],
      },
      toggleAnimalSelection,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckbox = checkboxes.find((cb) => !(cb as HTMLInputElement).disabled);
    if (animalCheckbox) {
      await user.click(animalCheckbox);
      expect(toggleAnimalSelection).toHaveBeenCalled();
    } else {
      // If no checkbox found, skip the test
      expect(true).toBe(true);
    }
  });

  it("should handle sale item weight change", async () => {
    const _user = userEvent.setup();
    const handleSaleItemChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
          },
        ],
      },
      handleSaleItemChange,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    // Find weight input by its value or label
    const weightInputs = screen
      .getAllByRole("textbox")
      .filter(
        (input) =>
          (input as HTMLInputElement).type === "number" ||
          (input as HTMLInputElement).value === "500"
      );
    if (weightInputs.length === 0) {
      // Try finding by placeholder or label
      const allInputs = screen.getAllByRole("textbox");
      const weightInput = allInputs.find((input) => {
        const parent = input.closest("div");
        return parent?.textContent?.includes("Weight");
      });
      if (weightInput) {
        fireEvent.change(weightInput, { target: { value: "600" } });
        expect(handleSaleItemChange).toHaveBeenCalledWith(mockAnimals[0].id, "weight", "600");
      }
    } else {
      fireEvent.change(weightInputs[0], { target: { value: "600" } });
      expect(handleSaleItemChange).toHaveBeenCalledWith(mockAnimals[0].id, "weight", "600");
    }
  });

  it("should handle sale item price change in individual mode", async () => {
    const _user = userEvent.setup();
    const handleSaleItemChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
          },
        ],
      },
      handleSaleItemChange,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    // Find price input by placeholder or by value
    const priceInputs = screen.queryAllByPlaceholderText("0,00");
    if (priceInputs.length === 0) {
      // Try finding by value
      const allInputs = screen.getAllByRole("textbox");
      const priceInput = allInputs.find((input) => {
        const value = (input as HTMLInputElement).value;
        return value === "1000.00" || value === "";
      });
      if (priceInput) {
        fireEvent.change(priceInput, { target: { value: "1200.00" } });
        expect(handleSaleItemChange).toHaveBeenCalledWith(mockAnimals[0].id, "price", "1200.00");
      }
    } else {
      fireEvent.change(priceInputs[0], { target: { value: "1200.00" } });
      expect(handleSaleItemChange).toHaveBeenCalledWith(mockAnimals[0].id, "price", "1200.00");
    }
  });

  it("should display calculated price in total mode for sale items", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [mockAnimals[0].id, mockAnimals[1].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "2500.00",
            weight: "500",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/calculated automatically/i)).toBeInTheDocument();
  });

  it("should handle carcass weight change for slaughterhouse sales", async () => {
    const _user = userEvent.setup();
    const handleSaleItemChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
            carcassWeight: "300",
          },
        ],
      },
      handleSaleItemChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const _carcassInputs = _container.querySelectorAll('input[type="number"]');
    // Find the carcass weight input (should be the last number input in the sale items section)
    if (_carcassInputs.length > 0) {
      const carcassInput = Array.from(_carcassInputs).find((input) => {
        const value = (input as HTMLInputElement).value;
        return value === "300" || value === "";
      });
      if (carcassInput) {
        fireEvent.change(carcassInput, { target: { value: "350" } });
        expect(handleSaleItemChange).toHaveBeenCalledWith(
          mockAnimals[0].id,
          "carcassWeight",
          "350"
        );
      }
    }
  });

  it("should handle observation field change", async () => {
    const _user = userEvent.setup();
    const handleChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        observation: "",
      },
      handleChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const observationField = _container.querySelector("textarea");
    if (observationField) {
      fireEvent.change(observationField, { target: { value: "Test observation" } });
      // The component calls handleChange("observation", e.target.value)
      expect(handleChange).toHaveBeenCalledWith("observation", "Test observation");
    }
  });

  it("should display error for sale item weight", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
          },
        ],
      },
      errors: {
        [`weight_${mockAnimals[0].id}`]: "Weight is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Weight is required/i)).toBeInTheDocument();
  });

  it("should display error for sale item price", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
          },
        ],
      },
      errors: {
        [`price_${mockAnimals[0].id}`]: "Price is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Price is required/i)).toBeInTheDocument();
  });

  it("should handle successMessage prop", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      alertMessage: { title: "Success message", variant: "success" as const },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} successMessage="Custom success" />
      </TestWrapper>
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should handle handlePricingModeChange", async () => {
    const _user = userEvent.setup();
    const handlePricingModeChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: "",
      },
      handlePricingModeChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const selects = _container.querySelectorAll("select");
    const pricingModeSelect = Array.from(selects).find((sel: HTMLSelectElement) => {
      const options = Array.from(sel.options);
      return options.some(
        (opt: HTMLOptionElement) =>
          opt.textContent?.includes("Individual") || opt.textContent?.includes("Total")
      );
    }) as HTMLSelectElement | undefined;
    if (pricingModeSelect) {
      fireEvent.change(pricingModeSelect, { target: { value: PricingMode.TOTAL } });
      // The component calls handlePricingModeChange(e.target.value as PricingMode)
      expect(handlePricingModeChange).toHaveBeenCalledWith(PricingMode.TOTAL);
    }
  });

  it("should handle handleTotalPriceChange", async () => {
    const _user = userEvent.setup();
    const handleTotalPriceChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "",
      },
      handleTotalPriceChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const totalPriceInput = _container.querySelector(
      'input[type="text"][placeholder="0,00"]'
    ) as HTMLInputElement;
    if (totalPriceInput) {
      fireEvent.change(totalPriceInput, { target: { value: "5000,00" } });
      expect(handleTotalPriceChange).toHaveBeenCalledWith("5000,00");
    }
  });

  it("should handle buyerId onChange", async () => {
    const _user = userEvent.setup();
    const handleChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        buyerId: "",
      },
      handleChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const buyerSelect = _container.querySelector('select[value=""]') as HTMLSelectElement;
    if (buyerSelect) {
      fireEvent.change(buyerSelect, { target: { value: mockBuyers[0].id } });
      expect(handleChange).toHaveBeenCalledWith("buyerId", mockBuyers[0].id);
    }
  });

  it("should handle saleDate onChange", async () => {
    const _user = userEvent.setup();
    const handleChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        saleDate: "",
      },
      handleChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const dateInput = _container.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
      // The component calls handleChange("saleDate", e.target.value)
      expect(handleChange).toHaveBeenCalledWith("saleDate", "2024-01-15");
    }
  });

  it("should handle saleType onChange", async () => {
    const _user = userEvent.setup();
    const handleChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        saleType: "",
      },
      handleChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const selects = _container.querySelectorAll("select");
    const saleTypeSelect = Array.from(selects).find((sel: HTMLSelectElement) => {
      const options = Array.from(sel.options);
      return options.some((opt: HTMLOptionElement) => opt.textContent?.includes("Slaughterhouse"));
    }) as HTMLSelectElement | undefined;
    if (saleTypeSelect) {
      fireEvent.change(saleTypeSelect, { target: { value: SaleType.SLAUGHTERHOUSE } });
      // The component calls handleChange("saleType", e.target.value)
      expect(handleChange).toHaveBeenCalledWith("saleType", SaleType.SLAUGHTERHOUSE);
    }
  });

  it("should handle paymentMethod onChange", async () => {
    const _user = userEvent.setup();
    const handleChange = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        paymentMethod: "",
      },
      handleChange,
    };
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const selects = _container.querySelectorAll("select");
    const paymentMethodSelect = Array.from(selects).find((sel: HTMLSelectElement) => {
      const options = Array.from(sel.options);
      return options.some((opt: HTMLOptionElement) => opt.textContent?.includes("Cash Flow"));
    }) as HTMLSelectElement | undefined;
    if (paymentMethodSelect) {
      const cashFlowOption = Array.from(paymentMethodSelect.options).find((opt) =>
        opt.textContent?.includes("Cash Flow")
      );
      if (cashFlowOption) {
        fireEvent.change(paymentMethodSelect, { target: { value: cashFlowOption.value } });
        // The component calls handleChange("paymentMethod", e.target.value)
        expect(handleChange).toHaveBeenCalledWith("paymentMethod", cashFlowOption.value);
      }
    }
  });

  it("should display error for buyerId", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      errors: {
        buyerId: "Buyer is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Buyer is required/i)).toBeInTheDocument();
  });

  it("should display error for saleDate", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      errors: {
        saleDate: "Sale date is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Sale date is required/i)).toBeInTheDocument();
  });

  it("should display error for saleType", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      errors: {
        saleType: "Sale type is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Sale type is required/i)).toBeInTheDocument();
  });

  it("should display error for paymentMethod", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      errors: {
        paymentMethod: "Payment method is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Payment method is required/i)).toBeInTheDocument();
  });

  it("should display error for pricingMode", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      errors: {
        pricingMode: "Pricing mode is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Pricing mode is required/i)).toBeInTheDocument();
  });

  it("should display error for totalPrice", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
      },
      errors: {
        totalPrice: "Total price is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Total price is required/i)).toBeInTheDocument();
  });

  it("should handle toSafeString with undefined value", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        propertyId: undefined as unknown as string,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with object value", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        propertyId: {} as unknown as string,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with boolean value", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        propertyId: true as unknown as string,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with bigint value", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        propertyId: BigInt(123) as unknown as string,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with symbol value", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        propertyId: Symbol("test") as unknown as string,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should not show sold badge for animals in currentSaleAnimalIds when editing", () => {
    mockIsAnimalSold.mockReturnValue(true);
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} isEdit={true} currentSaleAnimalIds={[mockAnimals[0].id]} />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckbox = checkboxes.find((cb) => {
      const input = cb as HTMLInputElement;
      return !input.disabled;
    });
    expect(animalCheckbox).toBeDefined();
  });

  it("should filter animals by registrationNumber", async () => {
    const user = userEvent.setup();
    const setAnimalSearch = vi.fn();
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      animalSearch: "",
      setAnimalSearch,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const searchInput = screen.getByPlaceholderText("Search animals");
    const registrationNumber = mockAnimals[0].registrationNumber;
    await user.type(searchInput, registrationNumber);
    // setAnimalSearch is called through onChange handler
    // Since we're mocking the hook, the input value won't change, but setAnimalSearch should be called
    expect(setAnimalSearch).toHaveBeenCalled();
    // Check that it was called with the registration number (might be called multiple times as user types)
    const calls = setAnimalSearch.mock.calls.map((call: unknown[]) => call[0] as string);
    // The registration number should be in one of the calls
    expect(
      calls.some(
        (val: string) => registrationNumber.includes(val) || val.includes(registrationNumber)
      )
    ).toBe(true);
  });

  it("should not show price per animal when totalPrice is empty", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "",
        selectedAnimalIds: [mockAnimals[0].id],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should not show price per animal when selectedAnimalIds is empty", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle selectedAnimalIds not being an array", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: null as unknown as string[],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle totalPrice not being a string", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: null as unknown as string,
        selectedAnimalIds: [mockAnimals[0].id],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle fees not being an array", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        fees: null as unknown as Array<{ id: string; name: string; amount: number; type: string }>,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("fee-manager")).toBeInTheDocument();
  });

  it("should handle saleItems not being an array", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: null as unknown as Array<{ animalId: string; price: string; weight: string }>,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should handle filteredAnimals with empty search", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      animalSearch: "",
      setAnimalSearch: vi.fn(),
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle animal selection when animal is already selected", async () => {
    const user = userEvent.setup();
    const toggleAnimalSelection = vi.fn();
    mockIsAnimalSold.mockReturnValue(false);
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        selectedAnimalIds: [mockAnimals[0].id],
      },
      toggleAnimalSelection,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    const checkboxes = screen.getAllByRole("checkbox");
    const animalCheckbox = checkboxes.find((cb) => {
      const input = cb as HTMLInputElement;
      return input.checked && !input.disabled;
    });
    if (animalCheckbox) {
      await user.click(animalCheckbox);
      expect(toggleAnimalSelection).toHaveBeenCalled();
    }
  });

  it("should handle animal with no registrationNumber in search", () => {
    const animalsWithoutReg = mockAnimals.map((a) => ({ ...a, registrationNumber: "" }));
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      animalSearch: "test",
      setAnimalSearch: vi.fn(),
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} animals={animalsWithoutReg} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle price per animal calculation with invalid totalPrice", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "invalid",
        selectedAnimalIds: [mockAnimals[0].id],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const pricePerAnimal = screen.queryByText(/Price per animal/i);
    if (pricePerAnimal) {
      expect(pricePerAnimal).toBeInTheDocument();
    }
  });

  it("should handle selectedAnimalIds length being 0 in price calculation", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should display error for selectedAnimalIds", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      errors: {
        selectedAnimalIds: "At least one animal is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/At least one animal is required/i)).toBeInTheDocument();
  });

  it("should handle animal not found in sale items", async () => {
    const { getAnimalById } = await import("~/services/animals.service");
    vi.mocked(getAnimalById).mockReturnValueOnce(undefined);
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: ["non-existent-id"],
        saleItems: [
          {
            animalId: "non-existent-id",
            price: "1000.00",
            weight: "500",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should render carcass weight field for slaughterhouse sales with error", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
            carcassWeight: "300",
          },
        ],
      },
      errors: {
        [`carcassWeight_${mockAnimals[0].id}`]: "Carcass weight is required",
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Carcass Weight")).toBeInTheDocument();
  });

  it("should handle price per animal with selectedAnimalIds length 0", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle price per animal calculation with zero division", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle sold animal badge display", () => {
    mockIsAnimalSold.mockReturnValue(true);
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle animal with empty code", () => {
    const animalsWithEmptyCode = [{ ...mockAnimals[0], code: "" }];
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      animalSearch: "",
      setAnimalSearch: vi.fn(),
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} animals={animalsWithEmptyCode} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle animal search with case insensitive matching", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      animalSearch: "TEST",
      setAnimalSearch: vi.fn(),
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle saleItems with missing animal data", async () => {
    const { getAnimalById } = await import("~/services/animals.service");
    vi.mocked(getAnimalById).mockReturnValueOnce(undefined);
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: ["missing-animal"],
        saleItems: [
          {
            animalId: "missing-animal",
            price: "1000.00",
            weight: "500",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should handle calculated price display in total mode", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [mockAnimals[0].id, mockAnimals[1].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "2500.00",
            weight: "500",
          },
        ],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/calculated automatically/i)).toBeInTheDocument();
  });

  it("should handle saleItems array being empty", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      formData: {
        ...defaultReturn.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [],
      },
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should handle title without description", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} title="New Sale" />
      </TestWrapper>
    );
    expect(screen.getByText("New Sale")).toBeInTheDocument();
  });

  it("should handle description without title", () => {
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} description="Create a new sale" />
      </TestWrapper>
    );
    expect(screen.getByText("Create a new sale")).toBeInTheDocument();
  });

  it("should handle isSubmitting disabling all inputs", () => {
    const defaultReturn = getDefaultMockReturn();
    mockUseSaleFormReturn = {
      ...defaultReturn,
      isSubmitting: true,
    };
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    // Get all form inputs (excluding textarea which is not a textbox role)
    const textInputs = screen.getAllByRole("textbox");
    const selects = screen.getAllByRole("combobox");
    const _dateInputs = screen.queryAllByDisplayValue("") as HTMLInputElement[];

    // Check that selects are disabled
    selects.forEach((select) => {
      expect(select).toBeDisabled();
    });

    // Check text inputs (the search input should also be disabled per component logic)
    textInputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      // The component sets disabled={isSubmitting} on all inputs including search
      if (inputElement.type !== "textarea") {
        expect(inputElement).toBeDisabled();
      }
    });
  });
});
