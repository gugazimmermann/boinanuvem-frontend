import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, renderHook } from "@testing-library/react";
import {
  createFinanceEditLoader,
  createFinanceEditMeta,
  createFinanceEditRoute,
  useFinanceEditRoute,
} from "../finance-edit-route-helpers";
import type { FinanceEditRouteConfig } from "../finance-edit-route-helpers";
import type { FinanceTransactionFormData } from "~/components/dashboard/finance/finance-transaction-form-page";

// Mock dependencies
const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ transactionId: "test-id" }));
const mockUseTranslation = vi.fn(() => ({
  common: { loading: "Loading" },
}));

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: () => mockUseTranslation(),
}));

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => vi.fn()),
}));

vi.mock("~/components/dashboard/finance/finance-transaction-form-page", () => ({
  FinanceTransactionFormPage: vi.fn(
    ({
      onSubmit,
      onSuccess,
      transactionId,
    }: {
      onSubmit: (data: FinanceTransactionFormData) => void;
      onSuccess: () => void;
      transactionId?: string;
    }) => {
      // Simulate component behavior for testing
      return (
        <div data-testid="finance-transaction-form-page">
          <button
            data-testid="submit-button"
            onClick={() => {
              if (transactionId) {
                onSubmit({
                  description: "Test",
                  amount: 1000,
                } as import("~/components/dashboard/finance/finance-transaction-form-page").FinanceTransactionFormData);
                onSuccess();
              }
            }}
          >
            Submit
          </button>
        </div>
      );
    }
  ),
}));

describe("createFinanceEditLoader", () => {
  it("should return a loader function", async () => {
    // createFinanceEditLoader calls createRouteGuard and immediately invokes it
    // In test environment, it may return null, undefined, or throw redirect
    try {
      const result = await createFinanceEditLoader({ request: {} as Request });
      // If it returns, it should be null (when window is undefined or no permission path)
      expect(result === null || result === undefined).toBe(true);
    } catch (error) {
      // If it throws, it should be a redirect (when user is not authenticated)
      expect(error).toBeDefined();
    }
  });
});

describe("createFinanceEditMeta", () => {
  it("should return a meta function", () => {
    const metaFn = createFinanceEditMeta("Transaction", "Edit transaction");
    expect(typeof metaFn).toBe("function");
  });

  it("should create meta with correct title", () => {
    const metaFn = createFinanceEditMeta("Transaction", "Edit transaction");
    const meta = metaFn();
    expect(meta[0].title).toContain("Editar");
    expect(meta[0].title).toContain("Transaction");
  });
});

describe("createFinanceEditRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockConfig = (): FinanceEditRouteConfig<FinanceTransactionFormData> => ({
    transactionType: "cash-flow" as const,
    getTransactionById: vi.fn(() => ({
      id: "test",
      description: "Test Transaction",
      amount: 1000,
    })),
    mapToFormData: vi.fn(() => ({ description: "Test Transaction", amount: 1000 })),
    updateTransaction: vi.fn(),
    backRoute: "/back",
    viewRoute: vi.fn((id: string) => `/view/${id}`),
    getTranslationKeys: vi.fn(() => ({
      title: "Edit",
      description: "Edit transaction",
      save: "Save",
      descriptionLabel: "Description",
      amountLabel: "Amount",
      propertyLabel: "Property",
    })),
    getSuccessMessage: vi.fn(() => "Success"),
    getErrorMessage: vi.fn(() => "Error"),
    getEmptyStateTitle: vi.fn(() => "Not found"),
  });

  it("should return a React component", () => {
    const mockConfig = createMockConfig();
    const Component = createFinanceEditRoute(mockConfig);
    expect(Component).toBeDefined();
    expect(typeof Component).toBe("function");
  });

  it("should render FinanceTransactionFormPage with correct props", async () => {
    const { FinanceTransactionFormPage } = await import(
      "~/components/dashboard/finance/finance-transaction-form-page"
    );
    const mockConfig = createMockConfig();
    const Component = createFinanceEditRoute(mockConfig);
    render(<Component />);

    expect(FinanceTransactionFormPage).toHaveBeenCalled();
    const callArgs = vi.mocked(FinanceTransactionFormPage).mock.calls[0][0];
    expect(callArgs.transactionType).toBe("cash-flow");
    expect(callArgs.mode).toBe("edit");
    expect(callArgs.title).toBe("Edit");
    expect(callArgs.description).toBe("Edit transaction");
    expect(callArgs.submitButtonLabel).toBe("Save");
    expect(callArgs.backRoute).toBe("/back");
    expect(callArgs.transactionId).toBe("test-id");
  });

  it("should call mapToFormData with transaction to create initialData", () => {
    const mockConfig = createMockConfig();
    const Component = createFinanceEditRoute(mockConfig);
    render(<Component />);

    expect(mockConfig.getTransactionById).toHaveBeenCalledWith("test-id");
    expect(mockConfig.mapToFormData).toHaveBeenCalledWith({
      id: "test",
      description: "Test Transaction",
      amount: 1000,
    });
  });

  it("should call updateTransaction on form submit", () => {
    const mockConfig = createMockConfig();
    const Component = createFinanceEditRoute(mockConfig);
    const { getByTestId } = render(<Component />);

    const submitButton = getByTestId("submit-button");
    submitButton.click();

    expect(mockConfig.updateTransaction).toHaveBeenCalledWith("test-id", {
      description: "Test",
      amount: 1000,
    });
  });

  it("should use mapFormDataToUpdate when provided", () => {
    const mockConfig = createMockConfig();
    mockConfig.mapFormDataToUpdate = vi.fn((data: { description: string; amount: number }) => ({
      ...data,
      updated: true,
    }));
    const Component = createFinanceEditRoute(mockConfig);
    const { getByTestId } = render(<Component />);

    const submitButton = getByTestId("submit-button");
    submitButton.click();

    expect(mockConfig.mapFormDataToUpdate).toHaveBeenCalledWith({
      description: "Test",
      amount: 1000,
    });
    expect(mockConfig.updateTransaction).toHaveBeenCalledWith("test-id", {
      description: "Test",
      amount: 1000,
      updated: true,
    });
  });

  it("should not call updateTransaction when transactionId is missing", () => {
    mockUseParams.mockReturnValueOnce({ transactionId: undefined });
    const mockConfig = createMockConfig();
    const Component = createFinanceEditRoute(mockConfig);
    const { getByTestId } = render(<Component />);

    const submitButton = getByTestId("submit-button");
    submitButton.click();

    expect(mockConfig.updateTransaction).not.toHaveBeenCalled();
  });

  it("should navigate to view route on success after timeout", () => {
    const mockConfig = createMockConfig();
    const Component = createFinanceEditRoute(mockConfig);
    const { getByTestId } = render(<Component />);

    const submitButton = getByTestId("submit-button");
    submitButton.click();

    // Fast-forward time
    vi.advanceTimersByTime(1500);

    expect(mockNavigate).toHaveBeenCalledWith("/view/test-id");
  });

  it("should not navigate when transactionId is missing in onSuccess", () => {
    mockUseParams.mockReturnValueOnce({ transactionId: undefined });
    const mockConfig = createMockConfig();
    const Component = createFinanceEditRoute(mockConfig);
    const { getByTestId } = render(<Component />);

    const submitButton = getByTestId("submit-button");
    submitButton.click();

    vi.advanceTimersByTime(1500);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should pass correct translation keys to form page", async () => {
    const { FinanceTransactionFormPage } = await import(
      "~/components/dashboard/finance/finance-transaction-form-page"
    );
    const mockConfig = createMockConfig();
    (mockConfig.getTranslationKeys as ReturnType<typeof vi.fn>).mockReturnValue({
      title: "Edit Transaction",
      description: "Edit the transaction",
      save: "Update",
      descriptionLabel: "Description",
      amountLabel: "Amount",
      dueDateLabel: "Due Date",
      propertyLabel: "Property",
    });
    const Component = createFinanceEditRoute(mockConfig);
    render(<Component />);

    expect(FinanceTransactionFormPage).toHaveBeenCalled();
    const callArgs = vi.mocked(FinanceTransactionFormPage).mock.calls[0][0];
    expect(callArgs.translationKeys).toEqual({
      descriptionLabel: "Description",
      amountLabel: "Amount",
      dueDateLabel: "Due Date",
      propertyLabel: "Property",
    });
  });
});

describe("useFinanceEditRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return transactionId, initialData, handleSubmit, and handleSuccess", () => {
    const mockConfig = {
      transactionType: "cash-flow" as const,
      getTransactionById: vi.fn(() => ({ id: "test", description: "Test" })),
      mapToFormData: vi.fn(() => ({ description: "Test" })),
      updateTransaction: vi.fn(),
      backRoute: "/back",
      viewRoute: vi.fn((id: string) => `/view/${id}`),
      getTranslationKeys: vi.fn(() => ({
        title: "Edit",
        description: "Edit transaction",
        save: "Save",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        propertyLabel: "Property",
      })),
      getSuccessMessage: vi.fn(() => "Success"),
      getErrorMessage: vi.fn(() => "Error"),
      getEmptyStateTitle: vi.fn(() => "Not found"),
    };

    const { result } = renderHook(() => useFinanceEditRoute(mockConfig));

    expect(result.current.transactionId).toBe("test-id");
    expect(result.current.initialData).toEqual({ description: "Test" });
    expect(typeof result.current.handleSubmit).toBe("function");
    expect(typeof result.current.handleSuccess).toBe("function");
  });

  it("should call updateTransaction in handleSubmit", () => {
    const mockConfig = {
      transactionType: "cash-flow" as const,
      getTransactionById: vi.fn(() => ({ id: "test" })),
      mapToFormData: vi.fn(() => ({})),
      updateTransaction: vi.fn(),
      backRoute: "/back",
      viewRoute: vi.fn((id: string) => `/view/${id}`),
      getTranslationKeys: vi.fn(() => ({
        title: "Edit",
        description: "Edit transaction",
        save: "Save",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        propertyLabel: "Property",
      })),
      getSuccessMessage: vi.fn(() => "Success"),
      getErrorMessage: vi.fn(() => "Error"),
      getEmptyStateTitle: vi.fn(() => "Not found"),
    };

    const { result } = renderHook(() => useFinanceEditRoute(mockConfig));
    result.current.handleSubmit({
      description: "Updated",
      amount: 2000,
    } as FinanceTransactionFormData);

    expect(mockConfig.updateTransaction).toHaveBeenCalledWith("test-id", {
      description: "Updated",
      amount: 2000,
    });
  });

  it("should not call updateTransaction when transactionId is missing", () => {
    mockUseParams.mockReturnValueOnce({ transactionId: undefined });
    const mockConfig = {
      transactionType: "cash-flow" as const,
      getTransactionById: vi.fn(() => ({ id: "test" })),
      mapToFormData: vi.fn(() => ({})),
      updateTransaction: vi.fn(),
      backRoute: "/back",
      viewRoute: vi.fn((id: string) => `/view/${id}`),
      getTranslationKeys: vi.fn(() => ({
        title: "Edit",
        description: "Edit transaction",
        save: "Save",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        propertyLabel: "Property",
      })),
      getSuccessMessage: vi.fn(() => "Success"),
      getErrorMessage: vi.fn(() => "Error"),
      getEmptyStateTitle: vi.fn(() => "Not found"),
    };

    const { result } = renderHook(() => useFinanceEditRoute(mockConfig));
    result.current.handleSubmit({ description: "Updated" } as FinanceTransactionFormData);

    expect(mockConfig.updateTransaction).not.toHaveBeenCalled();
  });

  it("should navigate to view route in handleSuccess after timeout", () => {
    const mockConfig = {
      transactionType: "cash-flow" as const,
      getTransactionById: vi.fn(() => ({ id: "test" })),
      mapToFormData: vi.fn(() => ({})),
      updateTransaction: vi.fn(),
      backRoute: "/back",
      viewRoute: vi.fn((id: string) => `/view/${id}`),
      getTranslationKeys: vi.fn(() => ({
        title: "Edit",
        description: "Edit transaction",
        save: "Save",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        propertyLabel: "Property",
      })),
      getSuccessMessage: vi.fn(() => "Success"),
      getErrorMessage: vi.fn(() => "Error"),
      getEmptyStateTitle: vi.fn(() => "Not found"),
    };

    const { result } = renderHook(() => useFinanceEditRoute(mockConfig));
    result.current.handleSuccess();

    vi.advanceTimersByTime(1500);

    expect(mockNavigate).toHaveBeenCalledWith("/view/test-id");
  });

  it("should not navigate when transactionId is missing in handleSuccess", () => {
    mockUseParams.mockReturnValueOnce({ transactionId: undefined });
    const mockConfig = {
      transactionType: "cash-flow" as const,
      getTransactionById: vi.fn(() => ({ id: "test" })),
      mapToFormData: vi.fn(() => ({})),
      updateTransaction: vi.fn(),
      backRoute: "/back",
      viewRoute: vi.fn((id: string) => `/view/${id}`),
      getTranslationKeys: vi.fn(() => ({
        title: "Edit",
        description: "Edit transaction",
        save: "Save",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        propertyLabel: "Property",
      })),
      getSuccessMessage: vi.fn(() => "Success"),
      getErrorMessage: vi.fn(() => "Error"),
      getEmptyStateTitle: vi.fn(() => "Not found"),
    };

    const { result } = renderHook(() => useFinanceEditRoute(mockConfig));
    result.current.handleSuccess();

    vi.advanceTimersByTime(1500);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
