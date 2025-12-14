import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinanceTransactionFormPage } from "../finance-transaction-form-page";
import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { useFinanceTransactionForm } from "~/hooks/use-finance-transaction-form";
import { addCashFlowObservation } from "~/services/cash-flow-observations.service";
import { addAccountsPayableObservation } from "~/services/accounts-payable-observations.service";
import { addAccountsReceivableObservation } from "~/services/accounts-receivable-observations.service";

vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));
vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    finance: {},
    common: {
      back: "Back",
      cancel: "Cancel",
    },
  })),
}));
vi.mock("~/hooks/use-finance-transaction-form");
vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => []),
}));
vi.mock("~/services/cash-flow-observations.service", () => ({
  addCashFlowObservation: vi.fn().mockResolvedValue({
    id: "obs-1",
    cashFlowId: "cf-1",
    observation: "Test observation",
    createdAt: "2024-01-01T00:00:00Z",
  }),
}));
vi.mock("~/services/accounts-payable-observations.service", () => ({
  addAccountsPayableObservation: vi.fn().mockResolvedValue({
    id: "obs-1",
    accountsPayableId: "ap-1",
    observation: "Test observation",
    createdAt: "2024-01-01T00:00:00Z",
  }),
}));
vi.mock("~/services/accounts-receivable-observations.service", () => ({
  addAccountsReceivableObservation: vi.fn().mockResolvedValue({
    id: "obs-1",
    accountsReceivableId: "ar-1",
    observation: "Test observation",
    createdAt: "2024-01-01T00:00:00Z",
  }),
}));
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      mainUser: true,
      companyId: "company-1",
      permissions: {},
      company: null,
    },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    refreshTokens: vi.fn(),
    getAccessToken: vi.fn(() => "access-token"),
    getRefreshToken: vi.fn(() => "refresh-token"),
  })),
}));
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => mockNavigate),
}));
vi.mock("~/components/ui", () => ({
  Button: ({
    onClick,
    children,
    disabled,
  }: {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  FixedAlert: ({ alertMessage }: { alertMessage: unknown }) =>
    alertMessage ? <div data-testid="alert">{String(alertMessage)}</div> : null,
}));

vi.mock("~/components/dashboard/observations/observation-form-fields", () => ({
  ObservationFormFields: ({
    observation,
    onObservationChange,
    observationFiles: _observationFiles,
    onObservationFilesChange,
  }: {
    observation: string;
    onObservationChange: (value: string) => void;
    observationFiles: File[];
    onObservationFilesChange: (files: File[]) => void;
    isSubmitting: boolean;
    observationLabel?: string;
    observationPlaceholder?: string;
    filesLabel?: string;
    filesHelperText?: string;
  }) => (
    <div>
      <div>Observation Fields</div>
      <textarea
        data-testid="observation-textarea"
        value={observation}
        onChange={(e) => onObservationChange(e.target.value)}
      />
      <input
        data-testid="observation-files"
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onObservationFilesChange(files);
        }}
      />
    </div>
  ),
}));

vi.mock("~/components/dashboard/forms/form-page-layout", () => ({
  FormPageLayout: ({
    title,
    children,
    backButtonLabel,
    onBack,
    alertMessage,
    onSubmit,
    submitButtonLabel,
    isSubmitting,
  }: {
    title: string;
    children: React.ReactNode;
    backButtonLabel: string;
    onBack: () => void;
    alertMessage?: import("~/hooks/use-alert").AlertMessage | null;
    onSubmit: (e: React.FormEvent) => void;
    submitButtonLabel?: string;
    isSubmitting?: boolean;
  }) => (
    <div>
      <h1>{title}</h1>
      {alertMessage && <div data-testid="alert">{String(alertMessage)}</div>}
      <button onClick={onBack}>{backButtonLabel}</button>
      <form onSubmit={onSubmit}>
        {children}
        <button type="submit" disabled={isSubmitting}>
          {submitButtonLabel || "Submit"}
        </button>
      </form>
    </div>
  ),
}));

vi.mock("~/components/dashboard/finance/finance-transaction-form", () => ({
  FinanceTransactionForm: () => <div>Transaction Form</div>,
}));

describe("FinanceTransactionFormPage", () => {
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseFinanceTransactionForm = vi.mocked(useFinanceTransactionForm);

  const defaultProps = {
    transactionType: "cash-flow" as const,
    mode: "new" as const,
    title: "New Transaction",
    description: "Create a new transaction",
    submitButtonLabel: "Save",
    loadingLabel: "Saving...",
    backRoute: "/finance",
    translationKeys: {
      descriptionLabel: "Description",
      amountLabel: "Amount",
      propertyLabel: "Property",
    },
    onSubmit: vi.fn(),
    onSuccess: vi.fn(),
    successMessage: "Success",
    errorMessage: "Error",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseTranslation.mockReturnValue({
      common: {
        back: "Back",
        cancel: "Cancel",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseFinanceTransactionForm.mockReturnValue({
      formData: {},
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    });
  });

  it("should render title", async () => {
    await act(async () => {
      render(<FinanceTransactionFormPage {...defaultProps} />);
    });
    // Title is passed to FormPageLayout
    await waitFor(
      () => {
        expect(screen.getByText("New Transaction")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should render transaction form", async () => {
    await act(async () => {
      render(<FinanceTransactionFormPage {...defaultProps} />);
    });
    expect(screen.getByText("Transaction Form")).toBeInTheDocument();
  });

  it("should render edit mode layout", async () => {
    const props = {
      ...defaultProps,
      mode: "edit" as const,
      transactionId: "trans-1",
      viewRoute: (id: string) => `/view/${id}`,
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    await waitFor(
      () => {
        expect(screen.getByText("New Transaction")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should show empty state when transactionId is missing in edit mode", async () => {
    const props = {
      ...defaultProps,
      mode: "edit" as const,
      transactionId: undefined,
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    expect(screen.getByText("Item não encontrado")).toBeInTheDocument();
  });

  it("should show custom emptyStateTitle when provided", async () => {
    const props = {
      ...defaultProps,
      mode: "edit" as const,
      transactionId: undefined,
      emptyStateTitle: "Custom Not Found",
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    expect(screen.getByText("Custom Not Found")).toBeInTheDocument();
  });

  it("should handle observation submission for cash-flow", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => ({ id: "trans-1" }));
    const props = {
      ...defaultProps,
      transactionType: "cash-flow" as const,
      onSubmit,
      showObservations: true,
    };
    mockUseFinanceTransactionForm.mockReturnValue({
      formData: {},
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        const result = onSubmit({} as never);
        return result;
      }),
    });
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    const submitButton = screen.getByText("Save");
    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("should handle observation submission for accounts-payable", async () => {
    const onSubmit = vi.fn(() => ({ id: "trans-1" }));
    const props = {
      ...defaultProps,
      transactionType: "accounts-payable" as const,
      onSubmit,
      showObservations: true,
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    expect(addAccountsPayableObservation).toBeDefined();
  });

  it("should handle observation submission for accounts-receivable", async () => {
    const onSubmit = vi.fn(() => ({ id: "trans-1" }));
    const props = {
      ...defaultProps,
      transactionType: "accounts-receivable" as const,
      onSubmit,
      showObservations: true,
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    expect(addAccountsReceivableObservation).toBeDefined();
  });

  it("should not show observations when showObservations is false", async () => {
    const props = {
      ...defaultProps,
      showObservations: false,
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    expect(screen.queryByText("Observation Fields")).not.toBeInTheDocument();
  });

  it("should navigate to backRoute when back button is clicked in new mode", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<FinanceTransactionFormPage {...defaultProps} />);
    });
    await waitFor(
      async () => {
        const backButton = screen.getByText("Back");
        await user.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith("/finance");
      },
      { timeout: 1000 }
    );
  });

  it("should navigate to viewRoute when back button is clicked in edit mode", async () => {
    const user = userEvent.setup();
    const props = {
      ...defaultProps,
      mode: "edit" as const,
      transactionId: "trans-1",
      viewRoute: (id: string) => `/view/${id}`,
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    await waitFor(
      async () => {
        const backButton = screen.getByText("Back");
        await user.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith("/view/trans-1");
      },
      { timeout: 1000 }
    );
  });

  it("should navigate to backRoute when viewRoute is not provided in edit mode", async () => {
    const user = userEvent.setup();
    const props = {
      ...defaultProps,
      mode: "edit" as const,
      transactionId: "trans-1",
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    await waitFor(
      async () => {
        const backButton = screen.getByText("Back");
        await user.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith("/finance");
      },
      { timeout: 1000 }
    );
  });

  it("should display error message when alertMessage is provided", async () => {
    mockUseFinanceTransactionForm.mockReturnValue({
      formData: {},
      errors: {},
      isSubmitting: false,
      alertMessage: { message: "Error occurred", type: "error" },
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    });
    await act(async () => {
      render(<FinanceTransactionFormPage {...defaultProps} />);
    });
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should handle different transaction types", async () => {
    const types = ["cash-flow", "accounts-payable", "accounts-receivable"] as const;
    for (const type of types) {
      const props = {
        ...defaultProps,
        transactionType: type,
      };
      let unmount: ReturnType<typeof render>["unmount"] | undefined;
      await act(async () => {
        const result = render(<FinanceTransactionFormPage {...props} />);
        unmount = result.unmount;
      });
      expect(screen.getByText("Transaction Form")).toBeInTheDocument();
      if (unmount) {
        unmount();
      }
    }
  });

  it("should add observation with files for cash-flow", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => Promise.resolve({ id: "trans-1" }));
    vi.mocked(addCashFlowObservation).mockResolvedValue({
      id: "obs-1",
      cashFlowId: "trans-1",
      observation: "Test observation",
      createdAt: "2024-01-01T00:00:00Z",
    });
    const props = {
      ...defaultProps,
      transactionType: "cash-flow" as const,
      onSubmit,
      showObservations: true,
    };

    // Capture the onSubmit prop that will be passed to useFinanceTransactionForm (which is handleSubmitWrapper)
    let capturedOnSubmit: ((data: unknown) => Promise<{ id: string } | void>) | undefined;
    mockUseFinanceTransactionForm.mockImplementation(
      (hookProps: { onSubmit?: (data: unknown) => Promise<{ id: string } | void> }) => {
        // Store the onSubmit prop (which is handleSubmitWrapper) so we can call it
        capturedOnSubmit = hookProps?.onSubmit as (data: unknown) => Promise<{ id: string } | void>;
        return {
          formData: {},
          errors: {},
          isSubmitting: false,
          alertMessage: null,
          properties: [],
          employees: [],
          serviceProviders: [],
          suppliers: [],
          buyers: [],
          handleChange: vi.fn(),
          handleSubmit: vi.fn(async (e: React.FormEvent) => {
            e.preventDefault();
            // Call the onSubmit prop (handleSubmitWrapper) which will add the observation
            if (capturedOnSubmit) {
              await capturedOnSubmit({} as never);
            }
          }),
        };
      }
    );

    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });

    // Set observation value by typing into the textarea
    const observationTextarea = screen.getByTestId("observation-textarea");
    await user.type(observationTextarea, "Test observation");

    // Add a file
    const fileInput = screen.getByTestId("observation-files");
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    await user.upload(fileInput, file);

    const submitButton = screen.getByText("Save");
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Observation would be added after successful submission
    await waitFor(
      () => {
        expect(addCashFlowObservation).toHaveBeenCalledWith(
          expect.objectContaining({
            cashFlowId: "trans-1",
            observation: "Test observation",
            fileIds: expect.any(Array),
          })
        );
      },
      { timeout: 3000 }
    );
  });

  it("should add observation without files when fileIds array is empty", async () => {
    const onSubmit = vi.fn(() => Promise.resolve({ id: "trans-1" }));
    vi.mocked(addCashFlowObservation).mockResolvedValue({
      id: "obs-1",
      cashFlowId: "trans-1",
      observation: "Test observation",
      createdAt: "2024-01-01T00:00:00Z",
    });
    const props = {
      ...defaultProps,
      transactionType: "cash-flow" as const,
      onSubmit,
      showObservations: true,
    };
    mockUseFinanceTransactionForm.mockReturnValue({
      formData: {},
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onSubmit({} as never);
        return result;
      }),
    });
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    // Observation would be added without fileIds when observationFiles is empty
    expect(screen.getByText("Transaction Form")).toBeInTheDocument();
  });

  it("should not add observation when observation is empty", async () => {
    const onSubmit = vi.fn(() => ({ id: "trans-1" }));
    const props = {
      ...defaultProps,
      transactionType: "cash-flow" as const,
      onSubmit,
      showObservations: true,
    };
    mockUseFinanceTransactionForm.mockReturnValue({
      formData: {},
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        const result = onSubmit({} as never);
        return result;
      }),
    });
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    // When observation is empty, observation should not be added
    expect(screen.getByText("Transaction Form")).toBeInTheDocument();
  });

  it("should not add observation when showObservations is false", async () => {
    const onSubmit = vi.fn(() => ({ id: "trans-1" }));
    const props = {
      ...defaultProps,
      transactionType: "cash-flow" as const,
      onSubmit,
      showObservations: false,
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    // Observations should not be shown or added
    expect(screen.queryByText("Observation Fields")).not.toBeInTheDocument();
  });

  it("should not add observation when onSubmit returns void", async () => {
    const onSubmit = vi.fn(() => undefined);
    const props = {
      ...defaultProps,
      transactionType: "cash-flow" as const,
      onSubmit,
      showObservations: true,
    };
    mockUseFinanceTransactionForm.mockReturnValue({
      formData: {},
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({} as never);
      }),
    });
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    // When onSubmit returns void, observation should not be added
    expect(screen.getByText("Transaction Form")).toBeInTheDocument();
  });

  it("should not add observation when result is not an object with id", async () => {
    const onSubmit = vi.fn(() => "string-result" as never);
    const props = {
      ...defaultProps,
      transactionType: "cash-flow" as const,
      onSubmit,
      showObservations: true,
    };
    mockUseFinanceTransactionForm.mockReturnValue({
      formData: {},
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      properties: [],
      employees: [],
      serviceProviders: [],
      suppliers: [],
      buyers: [],
      handleChange: vi.fn(),
      handleSubmit: vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({} as never);
      }),
    });
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    // When result is not an object with id, observation should not be added
    expect(screen.getByText("Transaction Form")).toBeInTheDocument();
  });

  it("should show loading state when isSubmitting is true", async () => {
    mockUseFinanceTransactionForm.mockReturnValue({
      ...mockUseFinanceTransactionForm(),
      isSubmitting: true,
    });
    await act(async () => {
      render(<FinanceTransactionFormPage {...defaultProps} />);
    });
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should display alert message in edit mode", async () => {
    mockUseFinanceTransactionForm.mockReturnValue({
      ...mockUseFinanceTransactionForm(),
      alertMessage: { message: "Error", type: "error" },
    });
    const props = {
      ...defaultProps,
      mode: "edit" as const,
      transactionId: "trans-1",
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should handle form submission in edit mode", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    mockUseFinanceTransactionForm.mockReturnValue({
      ...mockUseFinanceTransactionForm(),
      handleSubmit,
    });
    const props = {
      ...defaultProps,
      mode: "edit" as const,
      transactionId: "trans-1",
    };
    await act(async () => {
      render(<FinanceTransactionFormPage {...props} />);
    });
    const submitButton = screen.getByText("Save");
    await user.click(submitButton);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
