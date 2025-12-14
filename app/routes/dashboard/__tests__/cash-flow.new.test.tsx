import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import NewCashFlow from "../cash-flow.new";
import { addCashFlow } from "~/services/cash-flow.service";
import { addCashFlowObservation as _addCashFlowObservation } from "~/services/cash-flow-observations.service";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal: () => Promise<typeof import("react-router")>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: vi.fn(),
}));

vi.mock("~/services/cash-flow-observations.service", () => ({
  addCashFlowObservation: vi.fn(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    cashFlow: {
      addTransaction: "Add Cash Flow Transaction",
      new: {
        description: "Add a new cash flow transaction",
        addButton: "Add Transaction",
        descriptionLabel: "Description",
        amountLabel: "Amount",
        dateLabel: "Date",
        propertyLabel: "Property",
        success: "Transaction added successfully",
        error: "Failed to add transaction",
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
          type: "income",
          amount: 1000,
          date: "2024-01-01",
          description: "Test transaction",
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

describe("cash-flow.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(addCashFlow).mockResolvedValue({
      id: "cf-1",
      companyId: "company-1",
      type: "income",
      amount: 1000,
      date: "2024-01-01",
      description: "Test transaction",
      category: "cattle_sales",
      paymentMethod: "cash",
      status: "completed",
      createdAt: "2024-01-01T00:00:00Z",
    });
  });

  it("should render the form page with correct title", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/cash-flow/new"]}>{children}</MemoryRouter>
    );
    render(<NewCashFlow />, { wrapper });

    expect(screen.getByText("Add Cash Flow Transaction")).toBeInTheDocument();
    expect(screen.getByText("Add a new cash flow transaction")).toBeInTheDocument();
  });

  it("should submit form and navigate on success", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/cash-flow/new"]}>{children}</MemoryRouter>
    );
    render(<NewCashFlow />, { wrapper });

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addCashFlow).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should call addCashFlow with correct data", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/cash-flow/new"]}>{children}</MemoryRouter>
    );
    render(<NewCashFlow />, { wrapper });

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addCashFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "income",
          amount: 1000,
          date: "2024-01-01",
          description: "Test transaction",
        })
      );
    });
  });
});
