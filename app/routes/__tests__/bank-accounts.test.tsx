import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import BankAccounts from "../dashboard/bank-accounts";

vi.mock("~/components/ui", () => ({
  Table: () => <div data-testid="table">Table</div>,
  StatusBadge: () => <div data-testid="status-badge">StatusBadge</div>,
  TableActionButtons: () => <div data-testid="table-action-buttons">TableActionButtons</div>,
  ConfirmationModal: () => <div data-testid="confirmation-modal">ConfirmationModal</div>,
  Alert: () => <div data-testid="alert">Alert</div>,
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Company",
    },
  ],
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(() => []),
  deleteBankAccount: vi.fn(() => true),
}));

describe("BankAccounts", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/bank-accounts",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <BankAccounts />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/bank-accounts"],
      }
    );
  };

  it("should render bank accounts table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
