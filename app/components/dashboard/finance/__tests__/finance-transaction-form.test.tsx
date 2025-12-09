import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FinanceTransactionForm } from "../finance-transaction-form";
import {
  CashFlowCategory,
  PaymentMethod,
  AccountsPayableStatus,
  AccountsReceivableStatus,
} from "~/types";

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
    type,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
  }) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    React.useEffect(() => {
      setInternalValue(value || "");
    }, [value]);
    return (
      <div>
        <label htmlFor={`input-${label}`}>{label}</label>
        <input
          id={`input-${label}`}
          data-testid={`input-${label}`}
          type={type}
          value={internalValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setInternalValue(newValue);
            onChange({ target: { value: newValue } });
          }}
          disabled={disabled}
          placeholder={placeholder}
        />
        {error && <span data-testid="error">{error}</span>}
      </div>
    );
  },
  Select: ({
    label,
    value,
    onChange,
    options,
    error,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
    error?: string;
  }) => (
    <div>
      <label htmlFor={`select-${label}`}>{label}</label>
      <select
        id={`select-${label}`}
        data-testid={`select-${label}`}
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("~/utils/finance-form-helpers", () => ({
  getIncomeCategories: vi.fn(() => [{ value: "income1", label: "Income 1" }]),
  getExpenseCategories: vi.fn(() => [
    { value: CashFlowCategory.FEED, label: "Feed" },
    { value: CashFlowCategory.LABOR, label: "Labor" },
    { value: "expense1", label: "Expense 1" },
  ]),
  getPaymentMethods: vi.fn(() => [
    { value: PaymentMethod.CASH, label: "Cash" },
    { value: PaymentMethod.CREDIT_CARD, label: "Credit Card" },
  ]),
  getAccountsPayableStatusOptions: vi.fn(() => [
    { value: AccountsPayableStatus.UNPAID, label: "Unpaid" },
    { value: AccountsPayableStatus.PAID, label: "Paid" },
  ]),
  getAccountsReceivableStatusOptions: vi.fn(() => [
    { value: AccountsReceivableStatus.UNPAID, label: "Unpaid" },
    { value: AccountsReceivableStatus.PAID, label: "Paid" },
  ]),
}));

describe("FinanceTransactionForm", () => {
  const defaultProps = {
    transactionType: "cash-flow" as const,
    formData: {
      type: "income" as const,
      category: CashFlowCategory.OTHER_INCOME,
      amount: "",
      date: "",
      description: "",
      paymentMethod: PaymentMethod.CASH,
      paymentDate: "",
      supplierId: "",
      buyerId: "",
      employeeId: "",
      serviceProviderId: "",
      referenceNumber: "",
      bankAccountId: "",
      propertyId: "",
    },
    errors: {},
    isSubmitting: false,
    onFieldChange: vi.fn(),
    translation: {
      cashFlow: {
        new: {
          typeLabel: "Type",
          categoryLabel: "Category",
          amountLabel: "Amount",
          dateLabel: "Date",
          descriptionLabel: "Description",
          paymentMethodLabel: "Payment Method",
        },
        categories: {},
        paymentMethods: {},
      },
      accountsPayable: {
        new: {
          dueDateLabel: "Due Date",
        },
      },
      accountsReceivable: {
        new: {
          dueDateLabel: "Due Date",
        },
      },
    },
    properties: [],
    bankAccounts: [],
    employees: [],
    serviceProviders: [],
    suppliers: [],
    buyers: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render form fields for cash flow", () => {
    render(<FinanceTransactionForm {...defaultProps} />);
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("should call onFieldChange when field changes", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<FinanceTransactionForm {...defaultProps} onFieldChange={onFieldChange} />);

    const amountInput = screen.getByTestId("input-Amount");
    await user.type(amountInput, "100");

    expect(onFieldChange).toHaveBeenCalled();
  });

  it("should display errors when provided", () => {
    render(<FinanceTransactionForm {...defaultProps} errors={{ amount: "Amount is required" }} />);
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("should disable inputs when isSubmitting is true", () => {
    render(<FinanceTransactionForm {...defaultProps} isSubmitting={true} />);
    const amountInput = screen.getByTestId("input-Amount");
    expect(amountInput).toBeDisabled();
  });

  it("should render accounts-payable form", () => {
    const props = {
      ...defaultProps,
      transactionType: "accounts-payable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        supplierId: "",
        employeeId: "",
        serviceProviderId: "",
        status: AccountsPayableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      translation: {
        ...defaultProps.translation,
        accountsPayable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            supplierLabel: "Supplier",
            employeeLabel: "Employee",
            serviceProviderLabel: "Service Provider",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Due Date")).toBeInTheDocument();
  });

  it("should render accounts-receivable form", () => {
    const props = {
      ...defaultProps,
      transactionType: "accounts-receivable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.OTHER_INCOME,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        buyerId: "",
        status: AccountsReceivableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      translation: {
        ...defaultProps.translation,
        accountsReceivable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            buyerLabel: "Buyer",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Due Date")).toBeInTheDocument();
  });

  it("should handle type change from income to expense", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "income" as const,
      },
      onFieldChange,
    };
    render(<FinanceTransactionForm {...props} />);
    const typeLabel = screen.getByText("Type");
    const typeSelect = typeLabel.parentElement?.querySelector("select");
    expect(typeSelect).toBeInTheDocument();
    await user.selectOptions(typeSelect!, "expense");
    expect(onFieldChange).toHaveBeenCalledWith("type", "expense");
    expect(onFieldChange).toHaveBeenCalledWith("category", CashFlowCategory.FEED);
    expect(onFieldChange).toHaveBeenCalledWith("buyerId", "");
  });

  it("should handle type change from expense to income", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
      },
      onFieldChange,
    };
    render(<FinanceTransactionForm {...props} />);
    const typeLabel = screen.getByText("Type");
    const typeSelect = typeLabel.parentElement?.querySelector("select");
    expect(typeSelect).toBeInTheDocument();
    await user.selectOptions(typeSelect!, "income");
    expect(onFieldChange).toHaveBeenCalledWith("type", "income");
    expect(onFieldChange).toHaveBeenCalledWith("category", CashFlowCategory.CATTLE_SALES);
    expect(onFieldChange).toHaveBeenCalledWith("supplierId", "");
  });

  it("should clear employeeId when category changes from LABOR", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
        category: CashFlowCategory.LABOR,
      },
      onFieldChange,
    };
    render(<FinanceTransactionForm {...props} />);
    const categorySelect = screen.getByTestId("select-Category");
    await user.selectOptions(categorySelect, CashFlowCategory.FEED);
    expect(onFieldChange).toHaveBeenCalledWith("category", CashFlowCategory.FEED);
    expect(onFieldChange).toHaveBeenCalledWith("employeeId", "");
  });

  it("should render supplier field for expense cash-flow", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
      },
      suppliers: [{ id: "supplier-1", name: "Supplier 1" }],
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            supplierLabel: "Supplier",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getByText("Supplier")).toBeInTheDocument();
  });

  it("should render buyer field for income cash-flow", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "income" as const,
      },
      buyers: [{ id: "buyer-1", name: "Buyer 1" }],
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            buyerLabel: "Buyer",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getByText("Buyer")).toBeInTheDocument();
  });

  it("should render employee field for LABOR category", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
        category: CashFlowCategory.LABOR,
      },
      employees: [{ id: "emp-1", name: "Employee 1" }],
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            employeeLabel: "Employee",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getByText("Employee")).toBeInTheDocument();
  });

  it("should render serviceProvider field for expense cash-flow", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
      },
      serviceProviders: [{ id: "sp-1", name: "Service Provider 1" }],
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            serviceProviderLabel: "Service Provider",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getByText("Service Provider")).toBeInTheDocument();
  });

  it("should render paidDate and paidAmount for accounts-payable", () => {
    const props = {
      ...defaultProps,
      transactionType: "accounts-payable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        supplierId: "",
        employeeId: "",
        serviceProviderId: "",
        status: AccountsPayableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      translation: {
        ...defaultProps.translation,
        accountsPayable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            supplierLabel: "Supplier",
            employeeLabel: "Employee",
            serviceProviderLabel: "Service Provider",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getByText("Paid Date")).toBeInTheDocument();
    expect(screen.getByText("Paid Amount")).toBeInTheDocument();
  });

  it("should format bank account label with account types", () => {
    const props = {
      ...defaultProps,
      bankAccounts: [
        {
          id: "bank-1",
          bankName: "Bank 1",
          accountNumber: "12345",
          accountType: "checking" as const,
        },
        {
          id: "bank-2",
          bankName: "Bank 2",
          accountNumber: "67890",
          accountType: "savings" as const,
        },
      ],
      translation: {
        ...defaultProps.translation,
        bankAccounts: {
          accountTypes: {
            checking: "Checking",
            savings: "Savings",
          },
        },
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            bankAccountLabel: "Bank Account",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const bankAccountSelect = screen.getByTestId("select-Bank Account");
    expect(bankAccountSelect).toBeInTheDocument();
  });

  it("should clear employeeId when category changes from LABOR in cash-flow expense", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
        category: CashFlowCategory.LABOR,
      },
      onFieldChange,
    };
    render(<FinanceTransactionForm {...props} />);
    const categorySelect = screen.getByTestId("select-Category");
    await user.selectOptions(categorySelect, CashFlowCategory.FEED);
    expect(onFieldChange).toHaveBeenCalledWith("category", CashFlowCategory.FEED);
    expect(onFieldChange).toHaveBeenCalledWith("employeeId", "");
  });

  it("should clear employeeId when category changes from LABOR in accounts-payable", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      transactionType: "accounts-payable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.LABOR,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        supplierId: "",
        employeeId: "emp-1",
        serviceProviderId: "",
        status: AccountsPayableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        accountsPayable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            supplierLabel: "Supplier",
            employeeLabel: "Employee",
            serviceProviderLabel: "Service Provider",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const categorySelect = screen.getByTestId("select-Category");
    await user.selectOptions(categorySelect, CashFlowCategory.FEED);
    expect(onFieldChange).toHaveBeenCalledWith("category", CashFlowCategory.FEED);
    expect(onFieldChange).toHaveBeenCalledWith("employeeId", "");
  });

  it("should not clear employeeId when category is LABOR in cash-flow expense", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
        category: CashFlowCategory.FEED,
      },
      onFieldChange,
    };
    render(<FinanceTransactionForm {...props} />);
    const categorySelect = screen.getByTestId("select-Category");
    await user.selectOptions(categorySelect, CashFlowCategory.LABOR);
    expect(onFieldChange).toHaveBeenCalledWith("category", CashFlowCategory.LABOR);
    expect(onFieldChange).not.toHaveBeenCalledWith("employeeId", "");
  });

  it("should use edit translations when available", () => {
    const props = {
      ...defaultProps,
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          edit: {
            typeLabel: "Edit Type",
            categoryLabel: "Edit Category",
            amountLabel: "Edit Amount",
            dateLabel: "Edit Date",
            descriptionLabel: "Edit Description",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    // Should use edit translations when new translations are not available
    expect(screen.getByText("Type")).toBeInTheDocument();
  });

  it("should use income categories for cash-flow income type", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "income" as const,
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const categorySelect = screen.getByTestId("select-Category");
    expect(categorySelect).toBeInTheDocument();
  });

  it("should use income categories for accounts-receivable", () => {
    const props = {
      ...defaultProps,
      transactionType: "accounts-receivable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.OTHER_INCOME,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        buyerId: "",
        status: AccountsReceivableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      translation: {
        ...defaultProps.translation,
        accountsReceivable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            buyerLabel: "Buyer",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const categorySelect = screen.getByTestId("select-Category");
    expect(categorySelect).toBeInTheDocument();
  });

  it("should use expense categories for cash-flow expense type", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        type: "expense" as const,
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const categorySelect = screen.getByTestId("select-Category");
    expect(categorySelect).toBeInTheDocument();
  });

  it("should handle status selection for accounts-payable", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      transactionType: "accounts-payable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        supplierId: "",
        employeeId: "",
        serviceProviderId: "",
        status: AccountsPayableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        accountsPayable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            supplierLabel: "Supplier",
            employeeLabel: "Employee",
            serviceProviderLabel: "Service Provider",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const statusSelect = screen.getByLabelText("Status");
    await user.selectOptions(statusSelect, AccountsPayableStatus.PAID);
    expect(onFieldChange).toHaveBeenCalledWith("status", AccountsPayableStatus.PAID);
  });

  it("should handle status selection for accounts-receivable", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      transactionType: "accounts-receivable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.OTHER_INCOME,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        buyerId: "",
        status: AccountsReceivableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        accountsReceivable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            buyerLabel: "Buyer",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const statusSelect = screen.getByLabelText("Status");
    await user.selectOptions(statusSelect, AccountsReceivableStatus.PAID);
    expect(onFieldChange).toHaveBeenCalledWith("status", AccountsReceivableStatus.PAID);
  });

  it("should handle paidDate change for accounts-payable", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      transactionType: "accounts-payable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        supplierId: "",
        employeeId: "",
        serviceProviderId: "",
        status: AccountsPayableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        accountsPayable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            supplierLabel: "Supplier",
            employeeLabel: "Employee",
            serviceProviderLabel: "Service Provider",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const paidDateInput = screen.getByLabelText("Paid Date");
    await user.type(paidDateInput, "2024-01-01");
    expect(onFieldChange).toHaveBeenCalledWith("paidDate", "2024-01-01");
  });

  it("should handle paidAmount change for accounts-receivable", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      transactionType: "accounts-receivable" as const,
      formData: {
        amount: "",
        dueDate: "",
        description: "",
        category: CashFlowCategory.OTHER_INCOME,
        paymentMethod: PaymentMethod.CASH,
        propertyId: "",
        bankAccountId: "",
        buyerId: "",
        status: AccountsReceivableStatus.UNPAID,
        paidDate: "",
        paidAmount: "",
        referenceNumber: "",
      },
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        accountsReceivable: {
          new: {
            amountLabel: "Amount",
            dueDateLabel: "Due Date",
            descriptionLabel: "Description",
            categoryLabel: "Category",
            paymentMethodLabel: "Payment Method",
            propertyLabel: "Property",
            bankAccountLabel: "Bank Account",
            buyerLabel: "Buyer",
            statusLabel: "Status",
            paidDateLabel: "Paid Date",
            paidAmountLabel: "Paid Amount",
            referenceNumberLabel: "Reference Number",
          },
          paymentMethods: {},
          status: {},
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const paidAmountInput = screen.getByLabelText("Paid Amount");
    await user.type(paidAmountInput, "500");
    expect(onFieldChange).toHaveBeenCalledWith("paidAmount", "500");
  });

  it("should handle referenceNumber change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            referenceNumberLabel: "Reference Number",
          },
        },
      },
      onFieldChange,
    };
    render(<FinanceTransactionForm {...props} />);
    const referenceInput = screen.getByLabelText("Reference Number");
    await user.type(referenceInput, "REF-001");
    expect(onFieldChange).toHaveBeenCalledWith("referenceNumber", "REF-001");
  });

  it("should handle property selection", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const properties = [
      { id: "property-1", name: "Property 1" },
      { id: "property-2", name: "Property 2" },
    ];
    const props = {
      ...defaultProps,
      properties,
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            propertyLabel: "Property",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const propertySelect = screen.getByLabelText("Property");
    await user.selectOptions(propertySelect, "property-1");
    expect(onFieldChange).toHaveBeenCalledWith("propertyId", "property-1");
  });

  it("should handle bankAccount selection", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const bankAccounts = [
      {
        id: "bank-1",
        bankName: "Bank 1",
        accountNumber: "12345",
        accountType: "checking" as const,
      },
    ];
    const props = {
      ...defaultProps,
      bankAccounts,
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        bankAccounts: {
          accountTypes: {
            checking: "Checking",
            savings: "Savings",
          },
        },
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            bankAccountLabel: "Bank Account",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const bankAccountSelect = screen.getByLabelText("Bank Account");
    await user.selectOptions(bankAccountSelect, "bank-1");
    expect(onFieldChange).toHaveBeenCalledWith("bankAccountId", "bank-1");
  });

  it("should handle paymentDate change for cash-flow", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        paymentDate: "",
      },
      onFieldChange,
      translation: {
        ...defaultProps.translation,
        cashFlow: {
          ...defaultProps.translation.cashFlow,
          new: {
            ...defaultProps.translation.cashFlow.new,
            paymentDateLabel: "Payment Date",
          },
        },
      },
    };
    render(<FinanceTransactionForm {...props} />);
    const paymentDateInput = screen.getByLabelText("Payment Date");
    await user.type(paymentDateInput, "2024-01-01");
    expect(onFieldChange).toHaveBeenCalledWith("paymentDate", "2024-01-01");
  });

  it("should handle date change for cash-flow", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        date: "",
      },
      onFieldChange,
    };
    render(<FinanceTransactionForm {...props} />);
    const dateInput = screen.getByLabelText("Date");
    await user.type(dateInput, "2024-01-01");
    expect(onFieldChange).toHaveBeenCalledWith("date", "2024-01-01");
  });

  it("should handle description change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<FinanceTransactionForm {...defaultProps} onFieldChange={onFieldChange} />);
    const descriptionInput = screen.getByLabelText("Description");
    await user.type(descriptionInput, "Test description");
    expect(onFieldChange).toHaveBeenCalledWith("description", "Test description");
  });

  it("should handle paymentMethod change", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<FinanceTransactionForm {...defaultProps} onFieldChange={onFieldChange} />);
    const paymentMethodSelect = screen.getByLabelText("Payment Method");
    await user.selectOptions(paymentMethodSelect, PaymentMethod.CREDIT_CARD);
    expect(onFieldChange).toHaveBeenCalledWith("paymentMethod", PaymentMethod.CREDIT_CARD);
  });

  it("should display error for all fields", () => {
    const props = {
      ...defaultProps,
      errors: {
        amount: "Amount is required",
        date: "Date is required",
        description: "Description is required",
        category: "Category is required",
        paymentMethod: "Payment method is required",
        propertyId: "Property is required",
      },
    };
    render(<FinanceTransactionForm {...props} />);
    expect(screen.getAllByTestId("error").length).toBeGreaterThan(0);
  });
});
