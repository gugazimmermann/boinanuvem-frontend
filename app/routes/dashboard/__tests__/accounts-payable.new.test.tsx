import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import NewAccountsPayable from "../accounts-payable.new";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import { addAccountsPayableObservation as _addAccountsPayableObservation } from "~/services/accounts-payable-observations.service";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal: () => Promise<typeof import("react-router")>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock("~/services/accounts-payable.service", () => ({
  addAccountsPayable: vi.fn(),
}));

vi.mock("~/services/accounts-payable-observations.service", () => ({
  addAccountsPayableObservation: vi.fn(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    accountsPayable: {
      addTransaction: "Add Accounts Payable",
      new: {
        description: "Add a new accounts payable",
        addButton: "Add",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        dueDateLabel: "Due Date",
        propertyLabel: "Property",
        success: "Accounts payable added successfully",
        error: "Failed to add accounts payable",
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
          amount: 1000,
          dueDate: "2024-02-01",
          description: "Test accounts payable",
          category: "feed",
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

describe("accounts-payable.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(addAccountsPayable).mockResolvedValue({
      id: "ap-1",
      companyId: "company-1",
      amount: 1000,
      dueDate: "2024-02-01",
      description: "Test accounts payable",
      category: "feed",
      paymentMethod: "cash",
      status: "unpaid",
      createdAt: "2024-01-01T00:00:00Z",
    });
  });

  it("should render the form page with correct title", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/accounts-payable/new"]}>{children}</MemoryRouter>
    );
    render(<NewAccountsPayable />, { wrapper });

    expect(screen.getByText("Add Accounts Payable")).toBeInTheDocument();
    expect(screen.getByText("Add a new accounts payable")).toBeInTheDocument();
  });

  it("should submit form and navigate on success", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/accounts-payable/new"]}>{children}</MemoryRouter>
    );
    render(<NewAccountsPayable />, { wrapper });

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addAccountsPayable).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should call addAccountsPayable with correct data", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/accounts-payable/new"]}>{children}</MemoryRouter>
    );
    render(<NewAccountsPayable />, { wrapper });

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addAccountsPayable).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000,
          dueDate: "2024-02-01",
          description: "Test accounts payable",
        })
      );
    });
  });
});
