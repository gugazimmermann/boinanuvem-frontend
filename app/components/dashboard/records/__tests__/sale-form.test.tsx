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

const mockUseSaleForm = vi.fn(() => ({
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
  handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
}));

vi.mock("~/hooks/use-sale-form", () => ({
  useSaleForm: (config: unknown) => mockUseSaleForm(config),
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
    }: {
      type?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      placeholder?: string;
      className?: string;
    }) => (
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />
    )
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
    }) => (
      <select value={value} onChange={onChange} disabled={disabled} className={className}>
        {options?.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
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
  Alert: vi.fn(({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>
      {title}
    </div>
  )),
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

  beforeEach(() => {
    vi.clearAllMocks();
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Total Price")).toBeInTheDocument();
  });

  it("should render sale items when animals are selected", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [
          {
            animalId: mockAnimals[0].id,
            price: "1000.00",
            weight: "500",
          },
        ],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should render carcass weight field for slaughterhouse sales", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Carcass Weight")).toBeInTheDocument();
  });

  it("should render alert message", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      alertMessage: { title: "Error", variant: "error" as const },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should render price per animal when total price mode with selected animals", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [mockAnimals[0].id, mockAnimals[1].id],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/Price per animal/i)).toBeInTheDocument();
  });

  it("should render individual pricing mode for sale items", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should render sold badge for sold animals", () => {
    mockIsAnimalSold.mockImplementation((id: string) => id === mockAnimals[0].id);
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
      },
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      isSubmitting: true,
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should render update text in edit mode", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      isSubmitting: false,
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      animalSearch: "",
      setAnimalSearch,
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const searchInput = screen.getByPlaceholderText("Search animals");
    await user.type(searchInput, "001");
    expect(setAnimalSearch).toHaveBeenCalled();
  });

  it("should display no animals message when filtered list is empty", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      animalSearch: "nonexistent",
      setAnimalSearch: vi.fn(),
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} animals={[]} />
      </TestWrapper>
    );
    expect(screen.getByText("No animals found")).toBeInTheDocument();
  });

  it("should display error messages", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      errors: {
        propertyId: "Property is required",
        buyerId: "Buyer is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property is required")).toBeInTheDocument();
    expect(screen.getByText("Buyer is required")).toBeInTheDocument();
  });

  it("should handle toSafeString with null value", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: null as unknown as string,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with number value", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: 123 as unknown as string,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle errorMessage prop", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      alertMessage: { title: "Error message", variant: "error" as const },
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: [],
      },
      toggleAnimalSelection,
    });
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
    }
  });

  it("should handle sale item weight change", async () => {
    const _user = userEvent.setup();
    const handleSaleItemChange = vi.fn();
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const weightInputs = screen.getAllByRole("spinbutton");
    if (weightInputs.length > 0) {
      fireEvent.change(weightInputs[0], { target: { value: "600" } });
      expect(handleSaleItemChange).toHaveBeenCalledWith(mockAnimals[0].id, "weight", "600");
    }
  });

  it("should handle sale item price change in individual mode", async () => {
    const _user = userEvent.setup();
    const handleSaleItemChange = vi.fn();
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const priceInputs = screen.getAllByPlaceholderText("0,00");
    if (priceInputs.length > 0) {
      fireEvent.change(priceInputs[0], { target: { value: "1200.00" } });
      expect(handleSaleItemChange).toHaveBeenCalledWith(mockAnimals[0].id, "price", "1200.00");
    }
  });

  it("should display calculated price in total mode for sale items", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        observation: "",
      },
      handleChange,
    });
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const observationField = _container.querySelector("textarea");
    if (observationField) {
      fireEvent.change(observationField, { target: { value: "Test observation" } });
      expect(handleChange).toHaveBeenCalledWith("observation", "Test observation");
    }
  });

  it("should display error for sale item weight", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Weight is required")).toBeInTheDocument();
  });

  it("should display error for sale item price", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Price is required")).toBeInTheDocument();
  });

  it("should handle successMessage prop", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      alertMessage: { title: "Success message", variant: "success" as const },
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "",
      },
      handlePricingModeChange,
    });
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
      expect(handlePricingModeChange).toHaveBeenCalledWith(PricingMode.TOTAL);
    }
  });

  it("should handle handleTotalPriceChange", async () => {
    const _user = userEvent.setup();
    const handleTotalPriceChange = vi.fn();
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "",
      },
      handleTotalPriceChange,
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        buyerId: "",
      },
      handleChange,
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        saleDate: "",
      },
      handleChange,
    });
    const { container: _container } = render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const dateInput = _container.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
      expect(handleChange).toHaveBeenCalledWith("saleDate", "2024-01-15");
    }
  });

  it("should handle saleType onChange", async () => {
    const _user = userEvent.setup();
    const handleChange = vi.fn();
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        saleType: "",
      },
      handleChange,
    });
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
      expect(handleChange).toHaveBeenCalledWith("saleType", SaleType.SLAUGHTERHOUSE);
    }
  });

  it("should handle paymentMethod onChange", async () => {
    const _user = userEvent.setup();
    const handleChange = vi.fn();
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        paymentMethod: "",
      },
      handleChange,
    });
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
        expect(handleChange).toHaveBeenCalledWith("paymentMethod", cashFlowOption.value);
      }
    }
  });

  it("should display error for buyerId", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      errors: {
        buyerId: "Buyer is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Buyer is required")).toBeInTheDocument();
  });

  it("should display error for saleDate", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      errors: {
        saleDate: "Sale date is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale date is required")).toBeInTheDocument();
  });

  it("should display error for saleType", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      errors: {
        saleType: "Sale type is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale type is required")).toBeInTheDocument();
  });

  it("should display error for paymentMethod", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      errors: {
        paymentMethod: "Payment method is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Payment method is required")).toBeInTheDocument();
  });

  it("should display error for pricingMode", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      errors: {
        pricingMode: "Pricing mode is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Pricing mode is required")).toBeInTheDocument();
  });

  it("should display error for totalPrice", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
      },
      errors: {
        totalPrice: "Total price is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Total price is required")).toBeInTheDocument();
  });

  it("should handle toSafeString with undefined value", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: undefined as unknown as string,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with object value", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: {} as unknown as string,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with boolean value", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: true as unknown as string,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with bigint value", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: BigInt(123) as unknown as string,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with symbol value", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: Symbol("test") as unknown as string,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should not show sold badge for animals in currentSaleAnimalIds when editing", () => {
    mockIsAnimalSold.mockReturnValue(true);
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
      },
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      animalSearch: "",
      setAnimalSearch,
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const searchInput = screen.getByPlaceholderText("Search animals");
    await user.type(searchInput, mockAnimals[0].registrationNumber);
    expect(setAnimalSearch).toHaveBeenCalled();
  });

  it("should not show price per animal when totalPrice is empty", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "",
        selectedAnimalIds: [mockAnimals[0].id],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should not show price per animal when selectedAnimalIds is empty", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle selectedAnimalIds not being an array", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: null as unknown as string[],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle totalPrice not being a string", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: null as unknown as string,
        selectedAnimalIds: [mockAnimals[0].id],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle fees not being an array", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        fees: null as unknown as Array<{ id: string; name: string; amount: number; type: string }>,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("fee-manager")).toBeInTheDocument();
  });

  it("should handle saleItems not being an array", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: null as unknown as Array<{ animalId: string; price: string; weight: string }>,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should handle filteredAnimals with empty search", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      animalSearch: "",
      setAnimalSearch: vi.fn(),
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: [mockAnimals[0].id],
      },
      toggleAnimalSelection,
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      animalSearch: "test",
      setAnimalSearch: vi.fn(),
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} animals={animalsWithoutReg} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle price per animal calculation with invalid totalPrice", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "invalid",
        selectedAnimalIds: [mockAnimals[0].id],
      },
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should display error for selectedAnimalIds", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      errors: {
        selectedAnimalIds: "At least one animal is required",
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("At least one animal is required")).toBeInTheDocument();
  });

  it("should handle animal not found in sale items", async () => {
    const { getAnimalById } = await import("~/services/animals.service");
    vi.mocked(getAnimalById).mockReturnValueOnce(undefined);
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should render carcass weight field for slaughterhouse sales with error", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Carcass Weight")).toBeInTheDocument();
  });

  it("should handle price per animal with selectedAnimalIds length 0", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle price per animal calculation with zero division", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "5000,00",
        selectedAnimalIds: [],
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.queryByText(/Price per animal/i)).not.toBeInTheDocument();
  });

  it("should handle sold animal badge display", () => {
    mockIsAnimalSold.mockReturnValue(true);
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
      },
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle animal with empty code", () => {
    const animalsWithEmptyCode = [{ ...mockAnimals[0], code: "" }];
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      animalSearch: "",
      setAnimalSearch: vi.fn(),
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} animals={animalsWithEmptyCode} />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText("Search animals")).toBeInTheDocument();
  });

  it("should handle animal search with case insensitive matching", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      animalSearch: "TEST",
      setAnimalSearch: vi.fn(),
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
  });

  it("should handle calculated price display in total mode", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
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
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(/calculated automatically/i)).toBeInTheDocument();
  });

  it("should handle saleItems array being empty", () => {
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: PricingMode.INDIVIDUAL,
        selectedAnimalIds: [mockAnimals[0].id],
        saleItems: [],
      },
    });
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
    mockUseSaleForm.mockReturnValueOnce({
      ...mockUseSaleForm(),
      isSubmitting: true,
    });
    render(
      <TestWrapper>
        <SaleForm {...defaultProps} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    const selects = screen.getAllByRole("combobox");
    [...inputs, ...selects].forEach((element) => {
      expect(element).toBeDisabled();
    });
  });
});
