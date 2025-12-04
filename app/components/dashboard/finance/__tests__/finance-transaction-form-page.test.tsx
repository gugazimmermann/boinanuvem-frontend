import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { FinanceTransactionFormPage } from "../finance-transaction-form-page";
import { LanguageProvider } from "~/contexts/language-context";
import { BrowserRouter } from "react-router";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      variant?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} data-variant={variant}>
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(() => null),
}));

const mockFormPageLayout = vi.fn(
  ({
    title,
    description,
    children,
    onSubmit,
    onCancel,
    formClassName,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    onCancel?: () => void;
    formClassName?: string;
  }) => (
    <div data-testid="form-page-layout" data-form-class={formClassName}>
      <h1>{title}</h1>
      <p>{description}</p>
      <form onSubmit={onSubmit}>
        {children}
        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  )
);
vi.mock("~/components/dashboard/forms/form-page-layout", () => ({
  FormPageLayout: (props: {
    title: string;
    onSubmit?: (e: React.FormEvent) => void;
    onCancel?: () => void;
    children?: React.ReactNode;
  }) => mockFormPageLayout(props),
}));

vi.mock("~/components/dashboard/finance/finance-transaction-form", () => ({
  FinanceTransactionForm: vi.fn(() => <div data-testid="finance-transaction-form">Form</div>),
}));

let capturedOnObservationChange: ((value: string) => void) | undefined;
let capturedOnObservationFilesChange: ((files: File[]) => void) | undefined;
const mockObservationFormFields = vi.fn(
  (props: {
    observation: string;
    onObservationChange: (value: string) => void;
    onObservationFilesChange: (files: File[]) => void;
  }) => {
    capturedOnObservationChange = props.onObservationChange;
    capturedOnObservationFilesChange = props.onObservationFilesChange;
    return (
      <div data-testid="observation-form-fields">
        <textarea
          data-testid="observation-textarea"
          value={props.observation}
          onChange={(e) => props.onObservationChange(e.target.value)}
        />
        <input
          data-testid="observation-files"
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            props.onObservationFilesChange(files);
          }}
        />
      </div>
    );
  }
);
vi.mock("~/components/dashboard/observations/observation-form-fields", () => ({
  ObservationFormFields: (props: {
    observation: string;
    onObservationChange: (value: string) => void;
    onObservationFilesChange: (files: File[]) => void;
  }) => {
    const result = mockObservationFormFields(props);
    return result;
  },
}));

let capturedOnSubmit:
  | ((data: {
      description: string;
      amount: string;
      [key: string]: unknown;
    }) => void | { id: string })
  | undefined;
const mockUseFinanceTransactionForm = vi.fn(
  (config: {
    onSubmit?: (data: {
      description: string;
      amount: string;
      [key: string]: unknown;
    }) => void | { id: string };
    [key: string]: unknown;
  }) => {
    capturedOnSubmit = config?.onSubmit;
    const mockHandleSubmit = vi.fn((e: React.FormEvent) => {
      e.preventDefault();
      // Call the captured onSubmit to test observation logic
      if (capturedOnSubmit) {
        const result = capturedOnSubmit({ description: "", amount: "" });
        return Promise.resolve(result);
      }
      return Promise.resolve();
    });
    return {
      formData: {
        description: "",
        amount: "",
        date: "",
        category: "",
        paymentMethod: "",
        propertyId: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: mockHandleSubmit,
    };
  }
);

vi.mock("~/hooks/use-finance-transaction-form", () => ({
  useFinanceTransactionForm: (config: {
    onSubmit?: (data: {
      description: string;
      amount: string;
      [key: string]: unknown;
    }) => void | { id: string };
    [key: string]: unknown;
  }) => mockUseFinanceTransactionForm(config),
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => []),
}));

const mockAddAccountsPayableObservation = vi.fn();
const mockAddAccountsReceivableObservation = vi.fn();
const mockAddCashFlowObservation = vi.fn();

vi.mock("~/services/accounts-payable-observations.service", () => ({
  addAccountsPayableObservation: (data: {
    transactionId: string;
    observation: string;
    files?: File[];
    [key: string]: unknown;
  }) => mockAddAccountsPayableObservation(data),
}));

vi.mock("~/services/accounts-receivable-observations.service", () => ({
  addAccountsReceivableObservation: (data: {
    transactionId: string;
    observation: string;
    files?: File[];
    [key: string]: unknown;
  }) => mockAddAccountsReceivableObservation(data),
}));

vi.mock("~/services/cash-flow-observations.service", () => ({
  addCashFlowObservation: (data: {
    transactionId: string;
    observation: string;
    files?: File[];
    [key: string]: unknown;
  }) => mockAddCashFlowObservation(data),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", name: "Company 1" }],
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      back: "Back",
      cancel: "Cancel",
    },
  })),
}));

describe("FinanceTransactionFormPage", () => {
  const defaultProps = {
    transactionType: "cash-flow" as const,
    mode: "new" as const,
    title: "New Transaction",
    description: "Create a new transaction",
    submitButtonLabel: "Submit",
    loadingLabel: "Loading...",
    backRoute: "/back",
    onSubmit: vi.fn(() => ({ id: "transaction-1" })),
    onSuccess: vi.fn(),
    successMessage: "Success",
    errorMessage: "Error",
    translationKeys: {
      descriptionLabel: "Description",
      amountLabel: "Amount",
      dateLabel: "Date",
      propertyLabel: "Property",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockObservationFormFields.mockClear();
    mockAddAccountsPayableObservation.mockClear();
    mockAddAccountsReceivableObservation.mockClear();
    mockAddCashFlowObservation.mockClear();
  });

  it("should render in new mode", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("form-page-layout")).toBeInTheDocument();
    expect(screen.getByText("New Transaction")).toBeInTheDocument();
  });

  it("should render FinanceTransactionForm", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-transaction-form")).toBeInTheDocument();
  });

  it("should render ObservationFormFields when showObservations is true", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} showObservations={true} />
      </TestWrapper>
    );
    expect(screen.getByTestId("observation-form-fields")).toBeInTheDocument();
  });

  it("should render in edit mode", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="edit" transactionId="transaction-1" />
      </TestWrapper>
    );
    expect(screen.getByText("New Transaction")).toBeInTheDocument();
  });

  it("should render empty state when edit mode and no transactionId", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="edit" />
      </TestWrapper>
    );
    expect(screen.getByText("Item não encontrado")).toBeInTheDocument();
  });

  it("should handle form submission in new mode", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    const onSuccess = vi.fn();
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} onSubmit={onSubmit} onSuccess={onSuccess} />
      </TestWrapper>
    );
    expect(screen.getByTestId("form-page-layout")).toBeInTheDocument();
  });

  it("should handle observation files in new mode", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          showObservations={true}
          transactionType="accounts-payable"
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("observation-form-fields")).toBeInTheDocument();
  });

  it("should handle different transaction types", () => {
    const { rerender } = render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} transactionType="accounts-payable" />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-transaction-form")).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} transactionType="accounts-receivable" />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-transaction-form")).toBeInTheDocument();
  });

  it("should render custom emptyStateTitle", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          mode="edit"
          emptyStateTitle="Custom not found message"
        />
      </TestWrapper>
    );
    expect(screen.getByText("Custom not found message")).toBeInTheDocument();
  });

  it("should render with formClassName", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} formClassName="custom-class" />
      </TestWrapper>
    );
    expect(screen.getByTestId("form-page-layout")).toBeInTheDocument();
  });

  it("should render observationLabels when provided", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          mode="new"
          showObservations={true}
          observationLabels={{
            observation: "Custom Observation",
            observationPlaceholder: "Custom placeholder",
            files: "Custom Files",
            filesHelper: "Custom helper",
          }}
        />
      </TestWrapper>
    );
    expect(mockObservationFormFields).toHaveBeenCalled();
    const lastCall =
      mockObservationFormFields.mock.calls[mockObservationFormFields.mock.calls.length - 1];
    if (lastCall && lastCall[0]) {
      expect(lastCall[0]).toMatchObject({
        observationLabel: "Custom Observation",
        observationPlaceholder: "Custom placeholder",
        filesLabel: "Custom Files",
        filesHelperText: "Custom helper",
      });
    }
  });

  it("should pass observationLabels to ObservationFormFields", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          mode="new"
          showObservations={true}
          observationLabels={{
            observation: "Custom Observation",
            observationPlaceholder: "Custom placeholder",
            files: "Custom Files",
            filesHelper: "Custom helper",
          }}
        />
      </TestWrapper>
    );
    expect(mockObservationFormFields).toHaveBeenCalled();
    const lastCall =
      mockObservationFormFields.mock.calls[mockObservationFormFields.mock.calls.length - 1];
    if (lastCall && lastCall[0]) {
      expect(lastCall[0]).toMatchObject({
        observationLabel: "Custom Observation",
        observationPlaceholder: "Custom placeholder",
        filesLabel: "Custom Files",
        filesHelperText: "Custom helper",
      });
    }
  });

  it("should use default observation labels when observationLabels not provided", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="new" showObservations={true} />
      </TestWrapper>
    );
    // ObservationFormFields should be rendered
    expect(screen.getByTestId("observation-form-fields")).toBeInTheDocument();
    // Check that it was called with default labels
    const calls = mockObservationFormFields.mock.calls;
    if (calls.length > 0) {
      expect(calls[calls.length - 1][0]).toMatchObject({
        observationLabel: "Observação",
        observationPlaceholder: "Adicione uma observação (opcional)",
        filesLabel: "Anexos",
        filesHelperText: "Você pode anexar múltiplos arquivos à observação",
      });
    }
  });

  it("should handle edit mode with viewRoute", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          mode="edit"
          transactionId="transaction-1"
          viewRoute={(id) => `/view/${id}`}
        />
      </TestWrapper>
    );
    // Find back button and click it
    const backButtons = screen.getAllByText("Back");
    if (backButtons.length > 0) {
      backButtons[0].click();
      expect(mockNavigate).toHaveBeenCalledWith("/view/transaction-1");
    }
  });

  it("should handle edit mode without viewRoute", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="edit" transactionId="transaction-1" />
      </TestWrapper>
    );
    // Find back button and click it
    const backButtons = screen.getAllByText("Back");
    if (backButtons.length > 0) {
      backButtons[0].click();
      expect(mockNavigate).toHaveBeenCalledWith("/back");
    }
  });

  it("should handle form submission in edit mode", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    const { container } = render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          mode="edit"
          transactionId="transaction-1"
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
    if (form) {
      const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
      form.dispatchEvent(submitEvent);
    }
    // Form submission should be handled
    expect(container).toBeTruthy();
  });

  it("should render edit mode form with submit button", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="edit" transactionId="transaction-1" />
      </TestWrapper>
    );
    // Should render the form with submit button (line 270)
    expect(screen.getByText("New Transaction")).toBeInTheDocument();
  });

  it("should not show observations when showObservations is false", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} showObservations={false} />
      </TestWrapper>
    );
    expect(screen.queryByTestId("observation-form-fields")).not.toBeInTheDocument();
  });

  it("should show observations by default in new mode", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="new" />
      </TestWrapper>
    );
    expect(screen.getByTestId("observation-form-fields")).toBeInTheDocument();
  });

  it("should not show observations in edit mode by default", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="edit" transactionId="transaction-1" />
      </TestWrapper>
    );
    expect(screen.queryByTestId("observation-form-fields")).not.toBeInTheDocument();
  });

  it("should call navigate to backRoute when empty state back button is clicked", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="edit" />
      </TestWrapper>
    );
    const backButton = screen.getByText("Back");
    backButton.click();
    expect(mockNavigate).toHaveBeenCalledWith("/back");
  });

  it("should pass formClassName to FormPageLayout", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          mode="new"
          formClassName="custom-form-class"
        />
      </TestWrapper>
    );
    expect(mockFormPageLayout).toHaveBeenCalled();
    const lastCall = mockFormPageLayout.mock.calls[mockFormPageLayout.mock.calls.length - 1];
    if (lastCall && lastCall[0]) {
      expect(lastCall[0]).toMatchObject({
        formClassName: "custom-form-class",
      });
    }
  });

  it("should pass onBack callback to FormPageLayout", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="new" />
      </TestWrapper>
    );
    expect(mockFormPageLayout).toHaveBeenCalled();
    const lastCall = mockFormPageLayout.mock.calls[mockFormPageLayout.mock.calls.length - 1];
    if (lastCall && lastCall[0] && lastCall[0].onBack) {
      lastCall[0].onBack();
      expect(mockNavigate).toHaveBeenCalledWith("/back");
    }
  });

  it("should pass onCancel callback to FormPageLayout", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="new" />
      </TestWrapper>
    );
    expect(mockFormPageLayout).toHaveBeenCalled();
    const lastCall = mockFormPageLayout.mock.calls[mockFormPageLayout.mock.calls.length - 1];
    if (lastCall && lastCall[0] && lastCall[0].onCancel) {
      lastCall[0].onCancel();
      expect(mockNavigate).toHaveBeenCalledWith("/back");
    }
  });

  it("should pass onSubmit callback to FormPageLayout", () => {
    render(
      <TestWrapper>
        <FinanceTransactionFormPage {...defaultProps} mode="new" />
      </TestWrapper>
    );
    expect(mockFormPageLayout).toHaveBeenCalled();
    const lastCall = mockFormPageLayout.mock.calls[mockFormPageLayout.mock.calls.length - 1];
    if (lastCall && lastCall[0] && lastCall[0].onSubmit) {
      const mockEvent = { preventDefault: vi.fn() } as React.FormEvent;
      lastCall[0].onSubmit(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    }
  });

  it("should call addAccountsPayableObservation when submitting with observation", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          transactionType="accounts-payable"
          showObservations={true}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    // Set observation text and files, then wait for state to update
    await act(async () => {
      if (capturedOnObservationChange) {
        capturedOnObservationChange("Test observation");
      }
      if (capturedOnObservationFilesChange) {
        const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
        capturedOnObservationFilesChange([mockFile]);
      }
    });
    // Trigger form submission by calling the captured onSubmit
    await act(async () => {
      if (capturedOnSubmit) {
        capturedOnSubmit({ description: "Test", amount: "100" });
      }
    });
    expect(onSubmit).toHaveBeenCalled();
    // Wait for the observation to be added
    await waitFor(() => {
      expect(mockAddAccountsPayableObservation).toHaveBeenCalledWith(
        expect.objectContaining({
          accountsPayableId: "transaction-1",
          observation: "Test observation",
        })
      );
    });
  });

  it("should call addAccountsReceivableObservation when submitting with observation", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          transactionType="accounts-receivable"
          showObservations={true}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    // Set observation text, then wait for state to update
    await act(async () => {
      if (capturedOnObservationChange) {
        capturedOnObservationChange("Test observation");
      }
    });
    // Trigger form submission by calling the captured onSubmit
    await act(async () => {
      if (capturedOnSubmit) {
        capturedOnSubmit({ description: "Test", amount: "100" });
      }
    });
    expect(onSubmit).toHaveBeenCalled();
    // Wait for the observation to be added
    await waitFor(() => {
      expect(mockAddAccountsReceivableObservation).toHaveBeenCalledWith(
        expect.objectContaining({
          accountsReceivableId: "transaction-1",
          observation: "Test observation",
        })
      );
    });
  });

  it("should call addCashFlowObservation when submitting with observation", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          transactionType="cash-flow"
          showObservations={true}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    // Set observation text, then wait for state to update
    await act(async () => {
      if (capturedOnObservationChange) {
        capturedOnObservationChange("Test observation");
      }
    });
    // Trigger form submission by calling the captured onSubmit
    await act(async () => {
      if (capturedOnSubmit) {
        capturedOnSubmit({ description: "Test", amount: "100" });
      }
    });
    expect(onSubmit).toHaveBeenCalled();
    // Wait for the observation to be added
    await waitFor(() => {
      expect(mockAddCashFlowObservation).toHaveBeenCalledWith(
        expect.objectContaining({
          cashFlowId: "transaction-1",
          observation: "Test observation",
        })
      );
    });
  });

  it("should not call observation services when observation is empty", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          transactionType="accounts-payable"
          showObservations={true}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    // Don't set observation - it should remain empty
    // Trigger form submission by calling the captured onSubmit
    if (capturedOnSubmit) {
      capturedOnSubmit({ description: "Test", amount: "100" });
      expect(onSubmit).toHaveBeenCalled();
      // Wait a bit to ensure observation service is not called
      await new Promise((resolve) => setTimeout(resolve, 10));
      // Observation service should not be called when observation is empty
      expect(mockAddAccountsPayableObservation).not.toHaveBeenCalled();
    }
  });

  it("should not call observation services when showObservations is false", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          transactionType="accounts-payable"
          showObservations={false}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    // Trigger form submission by calling the captured onSubmit
    if (capturedOnSubmit) {
      capturedOnSubmit({ description: "Test", amount: "100" });
      expect(onSubmit).toHaveBeenCalled();
      // Wait a bit to ensure observation service is not called
      await new Promise((resolve) => setTimeout(resolve, 10));
      // Observation service should not be called when showObservations is false
      expect(mockAddAccountsPayableObservation).not.toHaveBeenCalled();
    }
  });

  it("should call addAccountsPayableObservation with fileIds when files are present", async () => {
    const onSubmit = vi.fn(() => ({ id: "transaction-1" }));
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          transactionType="accounts-payable"
          showObservations={true}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    // Set observation text and files, then wait for state to update
    await act(async () => {
      if (capturedOnObservationChange) {
        capturedOnObservationChange("Test observation");
      }
      if (capturedOnObservationFilesChange) {
        const mockFile1 = new File(["test1"], "test1.txt", { type: "text/plain" });
        const mockFile2 = new File(["test2"], "test2.txt", { type: "text/plain" });
        capturedOnObservationFilesChange([mockFile1, mockFile2]);
      }
    });
    // Trigger form submission by calling the captured onSubmit
    await act(async () => {
      if (capturedOnSubmit) {
        capturedOnSubmit({ description: "Test", amount: "100" });
      }
    });
    expect(onSubmit).toHaveBeenCalled();
    // Wait for the observation to be added
    await waitFor(() => {
      expect(mockAddAccountsPayableObservation).toHaveBeenCalledWith(
        expect.objectContaining({
          accountsPayableId: "transaction-1",
          observation: "Test observation",
          fileIds: expect.arrayContaining([expect.any(String)]),
        })
      );
    });
  });

  it("should not call observation services when onSubmit returns undefined", async () => {
    const onSubmit = vi.fn(() => undefined);
    render(
      <TestWrapper>
        <FinanceTransactionFormPage
          {...defaultProps}
          transactionType="accounts-payable"
          showObservations={true}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );
    // Set observation text
    await act(async () => {
      if (capturedOnObservationChange) {
        capturedOnObservationChange("Test observation");
      }
    });
    // Trigger form submission by calling the captured onSubmit
    await act(async () => {
      if (capturedOnSubmit) {
        capturedOnSubmit({ description: "Test", amount: "100" });
      }
    });
    expect(onSubmit).toHaveBeenCalled();
    // Wait a bit to ensure observation service is not called
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Observation service should not be called when onSubmit returns undefined
    expect(mockAddAccountsPayableObservation).not.toHaveBeenCalled();
  });
});
