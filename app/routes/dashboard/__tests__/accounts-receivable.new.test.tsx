import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import NewAccountsReceivable from "../accounts-receivable.new";
import { addAccountsReceivable } from "~/services/accounts-receivable.service";
import { addAccountsReceivableObservation as _addAccountsReceivableObservation } from "~/services/accounts-receivable-observations.service";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal: () => Promise<typeof import("react-router")>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock("~/services/accounts-receivable.service", () => ({
  addAccountsReceivable: vi.fn(),
}));

vi.mock("~/services/accounts-receivable-observations.service", () => ({
  addAccountsReceivableObservation: vi.fn(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    accountsReceivable: {
      addTransaction: "Add Accounts Receivable",
      new: {
        description: "Add a new accounts receivable",
        addButton: "Add",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        dueDateLabel: "Due Date",
        propertyLabel: "Property",
        success: "Accounts receivable added successfully",
        error: "Failed to add accounts receivable",
      },
      details: {
        observation: "Observation",
        observationPlaceholder: "Add an observation (optional)",
        files: "Attachments",
        filesHelper: "You can attach multiple files to the observation",
      },
    },
    common: {
      loading: "Loading...",
      back: "Back",
      cancel: "Cancel",
    },
  }),
}));

vi.mock("~/components/dashboard/finance/finance-transaction-form-page", () => ({
  FinanceTransactionFormPage: vi.fn(
    ({
      onSubmit,
      onSuccess,
      title,
      description,
    }: {
      onSubmit: (data: unknown) => Promise<{ id: string } | void>;
      onSuccess?: () => void;
      title: string;
      description: string;
    }) => {
      const handleTestSubmit = async () => {
        const mockData = {
          amount: 1500,
          dueDate: "2024-02-15",
          description: "Test accounts receivable",
          category: "cattle_sales",
          paymentMethod: "cash",
        };
        const result = await onSubmit(mockData);
        if (result && "id" in result) {
          onSuccess?.();
        }
      };

      return (
        <div data-testid="finance-transaction-form-page">
          <h1>{title}</h1>
          <p>{description}</p>
          <button onClick={handleTestSubmit} data-testid="submit-button">
            Submit
          </button>
        </div>
      );
    }
  ),
}));

describe("accounts-receivable.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(addAccountsReceivable).mockResolvedValue({
      id: "ar-1",
      companyId: "company-1",
      amount: 1500,
      dueDate: "2024-02-15",
      description: "Test accounts receivable",
      category: "cattle_sales",
      paymentMethod: "cash",
      status: "unpaid",
      createdAt: "2024-01-01T00:00:00Z",
    });
  });

  it("should render the form page with correct title", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/accounts-receivable/new"]}>
        {children}
      </MemoryRouter>
    );
    render(<NewAccountsReceivable />, { wrapper });

    expect(screen.getByText("Add Accounts Receivable")).toBeInTheDocument();
    expect(screen.getByText("Add a new accounts receivable")).toBeInTheDocument();
  });

  it("should submit form and navigate on success", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/accounts-receivable/new"]}>
        {children}
      </MemoryRouter>
    );
    render(<NewAccountsReceivable />, { wrapper });

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addAccountsReceivable).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should call addAccountsReceivable with correct data", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/accounts-receivable/new"]}>
        {children}
      </MemoryRouter>
    );
    render(<NewAccountsReceivable />, { wrapper });

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addAccountsReceivable).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1500,
          dueDate: "2024-02-15",
          description: "Test accounts receivable",
        })
      );
    });
  });
});
