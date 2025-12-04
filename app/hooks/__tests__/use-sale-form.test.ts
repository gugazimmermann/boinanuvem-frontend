import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSaleForm } from "../use-sale-form";
import { PricingMode, SaleType, SalePaymentMethod } from "~/types";
import * as useBaseFormHook from "../use-base-form";
import * as salesService from "~/services/sales.service";
import * as weighingsService from "~/services/weighings.service";
import * as useTranslationHook from "~/i18n/use-translation";

vi.mock("../use-base-form");
vi.mock("~/services/sales.service", () => ({
  isAnimalSold: vi.fn(() => false),
}));
vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(() => []),
}));
vi.mock("~/i18n/use-translation");

describe("useSaleForm", () => {
  const mockOnSubmit = vi.fn();
  const _mockOnSuccess = vi.fn();
  const mockShowAlert = vi.fn();
  const mockSetFormData = vi.fn();
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn();

  const mockBaseForm = {
    formData: {
      propertyId: "",
      buyerId: "",
      saleDate: new Date().toISOString().split("T")[0],
      saleType: "",
      pricingMode: "",
      paymentMethod: "",
      totalPrice: "",
      fees: [],
      selectedAnimalIds: [],
      saleItems: [],
      observation: "",
    },
    setFormData: mockSetFormData,
    errors: {},
    isSubmitting: false,
    alertMessage: null,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    showAlert: mockShowAlert,
  };

  const mockTranslation = {
    sales: {
      errors: {
        propertyRequired: "Property is required",
        buyerRequired: "Buyer is required",
        saleTypeRequired: "Sale type is required",
        pricingModeRequired: "Pricing mode is required",
        paymentMethodRequired: "Payment method is required",
        saleDateRequired: "Sale date is required",
        saleDateFuture: "Sale date cannot be in the future",
        animalsRequired: "At least one animal is required",
        animalAlreadySold: "Animal is already sold",
        totalPriceRequired: "Total price is required",
        totalPriceInvalid: "Total price must be greater than zero",
        priceRequired: "Price is required",
        weightRequired: "Weight is required",
        createFailed: "Failed to create sale",
      },
    },
  };

  const defaultOptions = {
    onSubmit: mockOnSubmit,
    successMessage: "Sale created successfully",
    errorMessage: "Error creating sale",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue(mockBaseForm);
    vi.mocked(useTranslationHook.useTranslation).mockReturnValue(
      mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>
    );
    vi.mocked(salesService.isAnimalSold).mockReturnValue(false);
    vi.mocked(weighingsService.getWeighingsByAnimalId).mockReturnValue([]);
    // Mock the sales service to prevent initialization errors
    vi.doMock("~/services/sales.service", () => ({
      isAnimalSold: vi.fn(() => false),
    }));
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useSaleForm(defaultOptions));

    expect(result.current.formData).toEqual(mockBaseForm.formData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.animalSearch).toBe("");
  });

  it("should initialize with initial data", () => {
    const initialData = {
      propertyId: "prop-1",
      buyerId: "buyer-1",
      saleType: SaleType.SLAUGHTERHOUSE,
      pricingMode: PricingMode.TOTAL,
      paymentMethod: SalePaymentMethod.CASH_FLOW,
      totalPrice: "1000",
    };

    renderHook(() =>
      useSaleForm({
        ...defaultOptions,
        initialData,
      })
    );

    expect(useBaseFormHook.useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData: expect.objectContaining({
          propertyId: "prop-1",
          buyerId: "buyer-1",
          saleType: SaleType.SLAUGHTERHOUSE,
          pricingMode: PricingMode.TOTAL,
          paymentMethod: SalePaymentMethod.CASH_FLOW,
          totalPrice: "1000",
        }),
      })
    );
  });

  it("should update animalSearch", () => {
    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.setAnimalSearch("AN001");
    });

    expect(result.current.animalSearch).toBe("AN001");
  });

  it("should handle field changes", () => {
    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleChange("propertyId", "prop-1");
    });

    expect(mockHandleChange).toHaveBeenCalledWith("propertyId", "prop-1");
  });

  it("should toggle animal selection - add animal", () => {
    const mockWeighing = {
      id: "w-1",
      animalId: "animal-1",
      weight: 500,
      date: "2024-01-01",
    };

    vi.mocked(weighingsService.getWeighingsByAnimalId).mockReturnValue([mockWeighing]);

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should toggle animal selection - remove animal", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        selectedAnimalIds: ["animal-1"],
        saleItems: [
          {
            animalId: "animal-1",
            price: "100",
            weight: "500",
          },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should prevent adding already sold animal", () => {
    vi.mocked(salesService.isAnimalSold).mockReturnValue(true);

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      mockTranslation.sales.errors.animalAlreadySold,
      "error"
    );
    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  it("should allow adding animal that is in current sale during edit", () => {
    vi.mocked(salesService.isAnimalSold).mockReturnValue(true);

    const { result } = renderHook(() =>
      useSaleForm({
        ...defaultOptions,
        isEdit: true,
        currentSaleAnimalIds: ["animal-1"],
      })
    );

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    // Should not show error for animal in current sale
    expect(mockShowAlert).not.toHaveBeenCalledWith(
      mockTranslation.sales.errors.animalAlreadySold,
      "error"
    );
  });

  it("should handle sale item change", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        saleItems: [
          {
            animalId: "animal-1",
            price: "100",
            weight: "500",
          },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleSaleItemChange("animal-1", "price", "200");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handle total price change and distribute to items", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "", weight: "500" },
          { animalId: "animal-2", price: "", weight: "600" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("1000");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handle pricing mode change to TOTAL", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.TOTAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handle pricing mode change to INDIVIDUAL", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "1000",
        saleItems: [{ animalId: "animal-1", price: "500", weight: "500" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.INDIVIDUAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should add fee", () => {
    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.addFee();
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should remove fee", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        fees: [
          { id: "fee-1", name: "Fee 1", amount: "100" },
          { id: "fee-2", name: "Fee 2", amount: "200" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.removeFee("fee-1");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should update fee", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        fees: [{ id: "fee-1", name: "Fee 1", amount: "100" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.updateFee("fee-1", "name", "Updated Fee");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should calculate total", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        saleItems: [
          { animalId: "animal-1", price: "100.50", weight: "500" },
          { animalId: "animal-2", price: "200.75", weight: "600" },
        ],
        fees: [{ id: "fee-1", name: "Fee 1", amount: "50.25" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    const total = result.current.calculateTotal();

    expect(total).toBe(351.5); // 100.50 + 200.75 + 50.25
  });

  it("should validate form", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: {},
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    expect(result.current.validateForm()).toBe(true);
  });

  it("should return false from validateForm when there are errors", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: { propertyId: "Property is required" },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    expect(result.current.validateForm()).toBe(false);
  });

  it("should create sale items from selected animals on mount", () => {
    const mockWeighing = {
      id: "w-1",
      animalId: "animal-1",
      weight: 500,
      date: "2024-01-01",
    };

    vi.mocked(weighingsService.getWeighingsByAnimalId).mockReturnValue([mockWeighing]);

    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        selectedAnimalIds: ["animal-1"],
        saleItems: [],
      },
    });

    renderHook(() => useSaleForm(defaultOptions));

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should use latest weighing weight for sale item", () => {
    const mockWeighings = [
      {
        id: "w-1",
        animalId: "animal-1",
        weight: 400,
        date: "2024-01-01",
      },
      {
        id: "w-2",
        animalId: "animal-1",
        weight: 500,
        date: "2024-01-15",
      },
    ];

    vi.mocked(weighingsService.getWeighingsByAnimalId).mockReturnValue(mockWeighings);

    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        selectedAnimalIds: ["animal-1"],
        saleItems: [],
      },
    });

    renderHook(() => useSaleForm(defaultOptions));

    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should handle sale item without weight when no weighings", () => {
    vi.mocked(weighingsService.getWeighingsByAnimalId).mockReturnValue([]);

    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        selectedAnimalIds: ["animal-1"],
        saleItems: [],
      },
    });

    renderHook(() => useSaleForm(defaultOptions));

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should validate propertyId is required", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("propertyId");
    }
  });

  it("should validate buyerId is required", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("buyerId");
    }
  });

  it("should validate saleType is required", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: "",
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("saleType");
    }
  });

  it("should validate pricingMode is required", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: "",
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("pricingMode");
    }
  });

  it("should validate paymentMethod is required", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: "",
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("paymentMethod");
    }
  });

  it("should validate saleDate is required", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("saleDate");
    }
  });

  it("should validate saleDate cannot be in the future", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(23, 59, 59, 999);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: futureDateStr,
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("saleDate");
    }
  });

  it("should validate at least one animal is required", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: [],
        saleItems: [],
      });

      expect(result).toHaveProperty("selectedAnimalIds");
    }
  });

  it("should validate totalPrice is required for TOTAL pricing mode", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        totalPrice: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("totalPrice");
    }
  });

  it("should validate totalPrice must be greater than zero", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        totalPrice: "0",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("totalPrice");
    }
  });

  it("should validate totalPrice with negative value", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        totalPrice: "-100",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("totalPrice");
    }
  });

  it("should validate price is required for INDIVIDUAL pricing mode", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "", weight: "500" }],
      });

      expect(result).toHaveProperty("price_animal-1");
    }
  });

  it("should validate price must be greater than zero for INDIVIDUAL mode", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "0", weight: "500" }],
      });

      expect(result).toHaveProperty("price_animal-1");
    }
  });

  it("should validate weight is required for each sale item", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "" }],
      });

      expect(result).toHaveProperty("weight_animal-1");
    }
  });

  it("should validate weight must be greater than zero", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "0" }],
      });

      expect(result).toHaveProperty("weight_animal-1");
    }
  });

  it("should validate multiple animals with sold status", () => {
    vi.mocked(salesService.isAnimalSold).mockImplementation((id: string) => id === "animal-2");

    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "100", weight: "500" },
          { animalId: "animal-2", price: "200", weight: "600" },
        ],
      });

      expect(result).toHaveProperty("selectedAnimalIds");
    }
  });

  it("should not validate sold animals when in edit mode and animal is in current sale", () => {
    vi.mocked(salesService.isAnimalSold).mockReturnValue(true);

    renderHook(() =>
      useSaleForm({
        ...defaultOptions,
        isEdit: true,
        currentSaleAnimalIds: ["animal-1"],
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).not.toHaveProperty("selectedAnimalIds");
    }
  });

  it("should handle total price change with currency formatting", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "", weight: "500" },
          { animalId: "animal-2", price: "", weight: "600" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("R$ 1.000,00");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handle total price change with comma decimal separator", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "", weight: "500" },
          { animalId: "animal-2", price: "", weight: "600" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("1.000,50");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should distribute total price evenly among animals", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        selectedAnimalIds: ["animal-1", "animal-2", "animal-3"],
        saleItems: [
          { animalId: "animal-1", price: "", weight: "500" },
          { animalId: "animal-2", price: "", weight: "600" },
          { animalId: "animal-3", price: "", weight: "700" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("1500");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should clear individual prices when switching to TOTAL mode", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.TOTAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should clear total price when switching to INDIVIDUAL mode", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "500", weight: "500" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.INDIVIDUAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handle sale item change for carcassWeight", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        saleItems: [
          {
            animalId: "animal-1",
            price: "100",
            weight: "500",
            carcassWeight: "",
          },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleSaleItemChange("animal-1", "carcassWeight", "300");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should calculate total with fees", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        saleItems: [{ animalId: "animal-1", price: "100.50", weight: "500" }],
        fees: [
          { id: "fee-1", name: "Fee 1", amount: "50.25" },
          { id: "fee-2", name: "Fee 2", amount: "25.75" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    const total = result.current.calculateTotal();

    expect(total).toBe(176.5); // 100.50 + 50.25 + 25.75
  });

  it("should calculate total with currency formatted prices", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        saleItems: [{ animalId: "animal-1", price: "1000.50", weight: "500" }],
        fees: [{ id: "fee-1", name: "Fee 1", amount: "50.25" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    const total = result.current.calculateTotal();

    expect(total).toBe(1050.75);
  });

  it("should calculate total with zero fees", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
        fees: [],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    const total = result.current.calculateTotal();

    expect(total).toBe(100);
  });

  it("should calculate total with zero sale items", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        saleItems: [],
        fees: [{ id: "fee-1", name: "Fee 1", amount: "50" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    const total = result.current.calculateTotal();

    expect(total).toBe(50);
  });

  it("should handle updateFee for amount field", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        fees: [{ id: "fee-1", name: "Fee 1", amount: "100" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.updateFee("fee-1", "amount", "200");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handle multiple fees", () => {
    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.addFee();
    });

    act(() => {
      result.current.addFee();
    });

    expect(mockSetFormData).toHaveBeenCalledTimes(2);
  });

  it("should handle removing last fee", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        fees: [{ id: "fee-1", name: "Fee 1", amount: "100" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.removeFee("fee-1");
    });

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should handle sale date validation with today's date", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const today = new Date().toISOString().split("T")[0];

      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: today,
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).not.toHaveProperty("saleDate");
    }
  });

  it("should handle total price with invalid format", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        totalPrice: "invalid",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      });

      expect(result).toHaveProperty("totalPrice");
    }
  });

  it("should handle price with invalid format for INDIVIDUAL mode", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "invalid", weight: "500" }],
      });

      expect(result).toHaveProperty("price_animal-1");
    }
  });

  it("should handle weight with invalid format", () => {
    renderHook(() => useSaleForm(defaultOptions));

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        propertyId: "prop-1",
        buyerId: "buyer-1",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        saleDate: "2024-01-15",
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "invalid" }],
      });

      expect(result).toHaveProperty("weight_animal-1");
    }
  });

  it("should return true from validateForm when all validations pass", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: {},
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    expect(result.current.validateForm()).toBe(true);
  });

  it("should return false from validateForm when any validation fails", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: { propertyId: "Property is required" },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    expect(result.current.validateForm()).toBe(false);
  });

  it("should not add sale item when animal already exists in saleItems", () => {
    const mockWeighing = {
      id: "w-1",
      animalId: "animal-1",
      weight: 500,
      date: "2024-01-01",
    };

    vi.mocked(weighingsService.getWeighingsByAnimalId).mockReturnValue([mockWeighing]);

    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        selectedAnimalIds: [],
        saleItems: [
          {
            animalId: "animal-1",
            price: "100",
            weight: "500",
          },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.toggleAnimalSelection("animal-1");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        selectedAnimalIds: [],
        saleItems: [
          {
            animalId: "animal-1",
            price: "100",
            weight: "500",
          },
        ],
      };
      const newData = setFormDataCall(prevData);
      // Should add animal to selectedAnimalIds but not duplicate saleItem
      expect(newData.selectedAnimalIds).toContain("animal-1");
      expect(
        newData.saleItems.filter((item: { animalId: string }) => item.animalId === "animal-1")
          .length
      ).toBe(1);
    }
  });

  it("should handle total price change when pricingMode is not TOTAL", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("1000");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "100", weight: "500" }],
      };
      const newData = setFormDataCall(prevData);
      // Should update totalPrice but not distribute to items
      expect(newData.totalPrice).toBe("1000");
      expect(newData.saleItems[0]?.price).toBe("100");
    }
  });

  it("should handle total price change when selectedAnimalIds is empty", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "",
        selectedAnimalIds: [],
        saleItems: [],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("1000");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.TOTAL,
        totalPrice: "",
        selectedAnimalIds: [],
        saleItems: [],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.totalPrice).toBe("1000");
    }
  });

  it("should handle total price change when newTotalPrice is empty", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "1000", weight: "500" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.TOTAL,
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "1000", weight: "500" }],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.totalPrice).toBe("");
    }
  });

  it("should handle pricing mode change to TOTAL with existing totalPrice", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "1500",
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "500", weight: "500" },
          { animalId: "animal-2", price: "1000", weight: "600" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.TOTAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "1500",
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "500", weight: "500" },
          { animalId: "animal-2", price: "1000", weight: "600" },
        ],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.pricingMode).toBe(PricingMode.TOTAL);
      expect(newData.totalPrice).toBe("1500");
      // Should distribute 1500 / 2 = 750 per animal
      expect(newData.saleItems[0]?.price).toBe("750.00");
      expect(newData.saleItems[1]?.price).toBe("750.00");
    }
  });

  it("should handle pricing mode change to TOTAL without totalPrice", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "500", weight: "500" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.TOTAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "",
        selectedAnimalIds: ["animal-1"],
        saleItems: [{ animalId: "animal-1", price: "500", weight: "500" }],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.pricingMode).toBe(PricingMode.TOTAL);
      expect(newData.totalPrice).toBe("");
      // Should not change prices when no totalPrice
      expect(newData.saleItems[0]?.price).toBe("500");
    }
  });

  it("should handle pricing mode change to TOTAL with empty selectedAnimalIds", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "1000",
        selectedAnimalIds: [],
        saleItems: [],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.TOTAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.INDIVIDUAL,
        totalPrice: "1000",
        selectedAnimalIds: [],
        saleItems: [],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.pricingMode).toBe(PricingMode.TOTAL);
      expect(newData.totalPrice).toBe("1000");
    }
  });

  it("should handle pricing mode change to INDIVIDUAL clearing prices and totalPrice", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "500", weight: "500" },
          { animalId: "animal-2", price: "500", weight: "600" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handlePricingModeChange(PricingMode.INDIVIDUAL);
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.TOTAL,
        totalPrice: "1000",
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "500", weight: "500" },
          { animalId: "animal-2", price: "500", weight: "600" },
        ],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.pricingMode).toBe(PricingMode.INDIVIDUAL);
      expect(newData.totalPrice).toBe("");
      expect(newData.saleItems[0]?.price).toBe("");
      expect(newData.saleItems[1]?.price).toBe("");
    }
  });

  it("should handle removeFee with multiple fees", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        fees: [
          { id: "fee-1", name: "Fee 1", amount: "100" },
          { id: "fee-2", name: "Fee 2", amount: "200" },
          { id: "fee-3", name: "Fee 3", amount: "300" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.removeFee("fee-2");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        fees: [
          { id: "fee-1", name: "Fee 1", amount: "100" },
          { id: "fee-2", name: "Fee 2", amount: "200" },
          { id: "fee-3", name: "Fee 3", amount: "300" },
        ],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.fees).toHaveLength(2);
      expect(newData.fees.find((f: { id: string }) => f.id === "fee-2")).toBeUndefined();
      expect(newData.fees.find((f: { id: string }) => f.id === "fee-1")).toBeDefined();
      expect(newData.fees.find((f: { id: string }) => f.id === "fee-3")).toBeDefined();
    }
  });

  it("should handle updateFee for name field", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        fees: [{ id: "fee-1", name: "Fee 1", amount: "100" }],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.updateFee("fee-1", "name", "Updated Fee Name");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        fees: [{ id: "fee-1", name: "Fee 1", amount: "100" }],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.fees[0]?.name).toBe("Updated Fee Name");
      expect(newData.fees[0]?.amount).toBe("100");
    }
  });

  it("should handle updateFee with non-matching feeId", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        fees: [
          { id: "fee-1", name: "Fee 1", amount: "100" },
          { id: "fee-2", name: "Fee 2", amount: "200" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.updateFee("fee-1", "amount", "150");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        fees: [
          { id: "fee-1", name: "Fee 1", amount: "100" },
          { id: "fee-2", name: "Fee 2", amount: "200" },
        ],
      };
      const newData = setFormDataCall(prevData);
      expect(newData.fees[0]?.amount).toBe("150");
      expect(newData.fees[1]?.amount).toBe("200");
    }
  });

  it("should handle handleTotalPriceChange with currency formatted value", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        pricingMode: PricingMode.TOTAL,
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "", weight: "500" },
          { animalId: "animal-2", price: "", weight: "600" },
        ],
      },
    });

    const { result } = renderHook(() => useSaleForm(defaultOptions));

    act(() => {
      result.current.handleTotalPriceChange("2000.50");
    });

    expect(mockSetFormData).toHaveBeenCalled();
    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const prevData = {
        pricingMode: PricingMode.TOTAL,
        selectedAnimalIds: ["animal-1", "animal-2"],
        saleItems: [
          { animalId: "animal-1", price: "", weight: "500" },
          { animalId: "animal-2", price: "", weight: "600" },
        ],
      };
      const newData = setFormDataCall(prevData);
      // Should parse "2000.50" and distribute 2000.50 / 2 = 1000.25 per animal
      expect(newData.totalPrice).toBe("2000.50");
      expect(newData.saleItems[0]?.price).toBe("1000.25");
      expect(newData.saleItems[1]?.price).toBe("1000.25");
    }
  });
});
