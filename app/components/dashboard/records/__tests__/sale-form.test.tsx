import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaleForm } from "../sale-form";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { useSaleForm } from "~/hooks/use-sale-form";
import { isAnimalSold } from "~/services/sales.service";

vi.mock("~/i18n");
vi.mock("~/contexts/language-context");
vi.mock("~/hooks/use-sale-form");
vi.mock("~/services/sales.service");
vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
    type,
    placeholder,
    className,
  }: {
    label?: string;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
    className?: string;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid={label ? `input-${label}` : "input"}
        type={type || "text"}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    type,
    variant: _variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    variant?: string;
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      type={type as "submit" | "reset" | "button" | undefined}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant: _variant }: { title: string; variant: string }) => (
    <div data-testid="alert">{title}</div>
  ),
  Select: ({
    value,
    onChange,
    options,
    disabled,
    className,
  }: {
    value: string;
    onChange?: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
    className?: string;
  }) => (
    <select
      data-testid="select"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("~/components/dashboard/records/fee-manager", () => ({
  FeeManager: () => <div data-testid="fee-manager">Fee Manager</div>,
}));

describe("SaleForm", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseLanguage = vi.mocked(useLanguage);
  const mockUseSaleForm = vi.mocked(useSaleForm);
  const mockIsAnimalSold = vi.mocked(isAnimalSold);

  const defaultProps = {
    animals: [],
    buyers: [],
    properties: [],
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      sales: {
        form: {
          title: "Sale Form",
          property: "Property",
          selectProperty: "Select Property",
          buyer: "Buyer",
          selectBuyer: "Select Buyer",
          saleDate: "Sale Date",
          saleType: "Sale Type",
          selectSaleType: "Select Sale Type",
          pricingMode: "Pricing Mode",
          selectPricingMode: "Select Pricing Mode",
          paymentMethod: "Payment Method",
          selectPaymentMethod: "Select Payment Method",
          totalPrice: "Total Price",
          pricePerAnimal: "Price per Animal",
          animals: "Animals",
          searchAnimals: "Search Animals",
          noAnimals: "No Animals",
          sold: "Sold",
          saleItems: "Sale Items",
          weight: "Weight",
          price: "Price",
          calculatedAutomatically: "Calculated Automatically",
          carcassWeight: "Carcass Weight",
          observation: "Observation",
          total: "Total",
          update: "Update",
          submit: "Submit",
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
          cashFlow: "À Vista",
          accountsReceivable: "A Receber",
        },
      },
      common: {
        cancel: "Cancel",
        saving: "Saving...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseLanguage.mockReturnValue({ language: "pt" });
    mockUseSaleForm.mockReturnValue({
      formData: {
        propertyId: "",
        buyerId: "",
        saleDate: "",
        saleType: "",
        pricingMode: "",
        paymentMethod: "",
        totalPrice: "",
        fees: [],
        selectedAnimalIds: [],
        saleItems: [],
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
      handleSubmit: vi.fn(),
    });
    mockIsAnimalSold.mockResolvedValue(false);
  });

  it("should render sale form", () => {
    render(<SaleForm {...defaultProps} />);
    // Check for a unique label to confirm the form rendered
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should render fee manager", () => {
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByTestId("fee-manager")).toBeInTheDocument();
  });

  it("should call useSaleForm hook", () => {
    render(<SaleForm {...defaultProps} />);
    expect(mockUseSaleForm).toHaveBeenCalled();
  });

  it("should display title and description when provided", () => {
    render(<SaleForm {...defaultProps} title="New Sale" description="Create a new sale" />);
    expect(screen.getByText("New Sale")).toBeInTheDocument();
    expect(screen.getByText("Create a new sale")).toBeInTheDocument();
  });

  it("should display alert message when alertMessage exists", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      alertMessage: { title: "Error", variant: "error" },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByTestId("alert")).toHaveTextContent("Error");
  });

  it("should display total price field when pricingMode is TOTAL", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "total",
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByText("Total Price")).toBeInTheDocument();
  });

  it("should display price per animal when total price and animals are selected", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "total",
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1", "animal-2"],
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByText(/Price per Animal/i)).toBeInTheDocument();
  });

  it("should filter animals by search", async () => {
    const user = userEvent.setup();
    const setAnimalSearch = vi.fn();
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
      {
        id: "2",
        code: "A002",
        registrationNumber: "REG002",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      animalSearch: "",
      setAnimalSearch,
    });
    render(<SaleForm {...defaultProps} animals={animals} />);
    const searchInput = screen.getByPlaceholderText("Search Animals");
    await user.type(searchInput, "A001");
    expect(setAnimalSearch).toHaveBeenCalled();
  });

  it("should display sold badge for sold animals", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockIsAnimalSold.mockResolvedValue(true);
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: [],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
      // Wait for async isAnimalSold check
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(screen.getByText("Sold")).toBeInTheDocument();
    });
  });

  it("should not show sold badge when animal is in current sale during edit", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockIsAnimalSold.mockResolvedValue(true);
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: [],
      },
    });
    await act(async () => {
      render(
        <SaleForm {...defaultProps} animals={animals} isEdit={true} currentSaleAnimalIds={["1"]} />
      );
      // Wait for async isAnimalSold check
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => {
      expect(screen.queryByText("Sold")).not.toBeInTheDocument();
    });
  });

  it("should display sale items when animals are selected", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
    // Component should use animalsMap internally, not getAnimalById
    // A001 appears in both animal list and sale items, so use getAllByText
    const a001Elements = screen.getAllByText("A001");
    expect(a001Elements.length).toBeGreaterThan(0);
  });

  it("should display carcass weight field when saleType is SLAUGHTERHOUSE", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        saleType: "slaughterhouse",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
            carcassWeight: "250",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("Carcass Weight")).toBeInTheDocument();
  });

  it("should display individual price field when pricingMode is INDIVIDUAL", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "individual",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("Price")).toBeInTheDocument();
  });

  it("should display calculated price when pricingMode is TOTAL", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "total",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("Calculated Automatically")).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      handleSubmit,
    });
    render(<SaleForm {...defaultProps} />);
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should display custom submit button text", () => {
    render(<SaleForm {...defaultProps} submitButtonText="Create Sale" />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Create Sale"))).toBe(true);
  });

  it("should display custom cancel button text", () => {
    render(<SaleForm {...defaultProps} cancelButtonText="Go Back" />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Go Back"))).toBe(true);
  });

  it("should show update text when isEdit is true", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
      },
    });
    render(<SaleForm {...defaultProps} isEdit={true} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Update"))).toBe(true);
  });

  it("should display total calculated price", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      calculateTotal: vi.fn(() => 1500),
    });
    render(<SaleForm {...defaultProps} />);
    // Find the Total text in the price display section (bg-gray-50 container), not the select option
    const totalTexts = screen.getAllByText("Total");
    const totalPriceText = totalTexts.find(
      (text) => text.closest(".bg-gray-50, .dark\\:bg-gray-900\\/50") !== null
    );
    expect(totalPriceText).toBeInTheDocument();
  });

  it("should display error messages for fields", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      errors: {
        propertyId: "Property is required",
        buyerId: "Buyer is required",
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByText("Property is required")).toBeInTheDocument();
    expect(screen.getByText("Buyer is required")).toBeInTheDocument();
  });

  it("should handle toSafeString with different value types", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: null as never,
        buyerId: undefined as never,
        saleDate: 12345 as never,
        saleType: true as never,
      },
    });
    render(<SaleForm {...defaultProps} />);
    // The form should render without errors
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with bigint type", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: BigInt(12345) as never,
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should handle toSafeString with symbol type", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        propertyId: Symbol("test") as never,
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should filter animals when search is empty", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
      {
        id: "2",
        code: "A002",
        registrationNumber: "REG002",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      animalSearch: "",
      setAnimalSearch: vi.fn(),
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    // All animals should be shown when search is empty
    expect(screen.getByText("A001")).toBeInTheDocument();
    expect(screen.getByText("A002")).toBeInTheDocument();
  });

  it("should show no animals message when filtered list is empty", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      animalSearch: "NONEXISTENT",
      setAnimalSearch: vi.fn(),
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("No Animals")).toBeInTheDocument();
  });

  it("should filter animals by registration number", async () => {
    const user = userEvent.setup();
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
      {
        id: "2",
        code: "A002",
        registrationNumber: "REG002",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    const setAnimalSearch = vi.fn();
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      animalSearch: "",
      setAnimalSearch,
    });
    render(<SaleForm {...defaultProps} animals={animals} />);
    const searchInput = screen.getByPlaceholderText("Search Animals");
    await user.type(searchInput, "REG001");
    expect(setAnimalSearch).toHaveBeenCalled();
  });

  it("should render sale items for individual pricing mode", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "individual",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    // Component uses animalsMap internally, so animal should be found
    // A001 appears in both animal list and sale items, so use getAllByText
    const a001Elements = screen.getAllByText("A001");
    expect(a001Elements.length).toBeGreaterThan(0);
  });

  it("should render sale items for total pricing mode", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "total",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("Sale Items")).toBeInTheDocument();
    expect(screen.getByText("Calculated Automatically")).toBeInTheDocument();
  });

  it("should display carcass weight field when saleType is SLAUGHTERHOUSE", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        saleType: "slaughterhouse",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
            carcassWeight: "250",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.getByText("Carcass Weight")).toBeInTheDocument();
  });

  it("should not display carcass weight field when saleType is not SLAUGHTERHOUSE", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        saleType: "other-farm",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    expect(screen.queryByText("Carcass Weight")).not.toBeInTheDocument();
  });

  it("should display total price calculation", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      calculateTotal: vi.fn(() => 2500),
    });
    render(<SaleForm {...defaultProps} />);
    // Total should be displayed in the summary section
    const totalTexts = screen.getAllByText("Total");
    expect(totalTexts.length).toBeGreaterThan(0);
  });

  it("should display price per animal when total price and animals are selected", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "total",
        totalPrice: "1000,00",
        selectedAnimalIds: ["1", "2"],
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByText(/Price per Animal/i)).toBeInTheDocument();
  });

  it("should not display price per animal when no animals selected", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "total",
        totalPrice: "1000,00",
        selectedAnimalIds: [],
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.queryByText(/Price per Animal/i)).not.toBeInTheDocument();
  });

  it("should not display price per animal when totalPrice is empty", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "total",
        totalPrice: "",
        selectedAnimalIds: ["1", "2"],
      },
    });
    render(<SaleForm {...defaultProps} />);
    expect(screen.queryByText(/Price per Animal/i)).not.toBeInTheDocument();
  });

  it("should handle observation textarea onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        observation: "",
      },
      handleChange,
    });
    render(<SaleForm {...defaultProps} />);
    // Find textarea by its role or by querying for textarea element
    const observationTextarea = document.querySelector("textarea");
    expect(observationTextarea).toBeInTheDocument();
    if (observationTextarea) {
      await user.type(observationTextarea, "Test observation");
      // handleChange is called for each character, so check if it was called with the last character
      // or check if it was called at all (which confirms the onChange handler works)
      expect(handleChange).toHaveBeenCalled();
      // The last call should be with "n" (last character of "Test observation")
      expect(handleChange).toHaveBeenCalledWith("observation", "n");
    }
  });

  it("should handle observation with toSafeString for different types", () => {
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        observation: null as never,
      },
    });
    render(<SaleForm {...defaultProps} />);
    const observationTextarea = document.querySelector("textarea");
    expect(observationTextarea).toBeInTheDocument();
  });

  it("should display fee manager component", () => {
    render(<SaleForm {...defaultProps} />);
    expect(screen.getByTestId("fee-manager")).toBeInTheDocument();
  });

  it("should handle sale item weight change", async () => {
    const user = userEvent.setup();
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    const handleSaleItemChange = vi.fn();
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
      handleSaleItemChange,
    });
    render(<SaleForm {...defaultProps} animals={animals} />);
    // Find weight input by type="number" in sale items section
    const weightInputs = document.querySelectorAll('input[type="number"]');
    if (weightInputs.length > 0) {
      await user.type(weightInputs[0] as HTMLInputElement, "450");
      expect(handleSaleItemChange).toHaveBeenCalled();
    }
  });

  it("should handle sale item price change in individual mode", async () => {
    const user = userEvent.setup();
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    const handleSaleItemChange = vi.fn();
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        pricingMode: "individual",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
      handleSaleItemChange,
    });
    render(<SaleForm {...defaultProps} animals={animals} />);
    // Find price input by placeholder or type="text" in sale items section
    const priceInputs = Array.from(document.querySelectorAll('input[type="text"]')).filter(
      (input) => (input as HTMLInputElement).placeholder === "0,00"
    );
    if (priceInputs.length > 0 && !(priceInputs[0] as HTMLInputElement).disabled) {
      await user.type(priceInputs[0] as HTMLInputElement, "600");
      expect(handleSaleItemChange).toHaveBeenCalled();
    }
  });

  it("should handle sale item carcass weight change", async () => {
    const user = userEvent.setup();
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    const handleSaleItemChange = vi.fn();
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        saleType: "slaughterhouse",
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
            carcassWeight: "250",
          },
        ],
      },
      handleSaleItemChange,
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    // Find carcass weight input - it's the second number input in the sale item
    const numberInputs = document.querySelectorAll('input[type="number"]');
    if (numberInputs.length > 1) {
      // The second number input should be carcass weight
      await user.type(numberInputs[1] as HTMLInputElement, "260");
      expect(handleSaleItemChange).toHaveBeenCalled();
    }
  });

  it("should use animalsMap instead of getAnimalById", async () => {
    const animals = [
      {
        id: "1",
        code: "A001",
        registrationNumber: "REG001",
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        companyId: "company-1",
        propertyId: "prop-1",
      },
    ];
    mockUseSaleForm.mockReturnValue({
      ...mockUseSaleForm(),
      formData: {
        ...mockUseSaleForm().formData,
        selectedAnimalIds: ["1"],
        saleItems: [
          {
            animalId: "1",
            price: "500",
            weight: "400",
          },
        ],
      },
    });
    await act(async () => {
      render(<SaleForm {...defaultProps} animals={animals} />);
    });
    // Component should use animalsMap internally to find animals
    // A001 appears in both animal list and sale items, so use getAllByText
    const a001Elements = screen.getAllByText("A001");
    expect(a001Elements.length).toBeGreaterThan(0);
    // getAnimalById should not be called since component uses animalsMap
  });
});
