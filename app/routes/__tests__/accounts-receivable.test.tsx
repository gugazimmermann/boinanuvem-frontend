import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import AccountsReceivable from "../dashboard/accounts-receivable";

vi.mock("~/components/ui", () => ({
  Table: () => <div data-testid="table">Table</div>,
  StatusBadge: () => <div data-testid="status-badge">StatusBadge</div>,
  TableActionButtons: () => <div data-testid="table-action-buttons">TableActionButtons</div>,
  ConfirmationModal: () => <div data-testid="confirmation-modal">ConfirmationModal</div>,
  Alert: () => <div data-testid="alert">Alert</div>,
  Select: () => <div data-testid="select">Select</div>,
}));

vi.mock("~/mocks/accounts-receivable", () => ({
  mockAccountsReceivable: [],
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Company",
    },
  ],
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByCompanyId: vi.fn(() => []),
  deleteAccountsReceivable: vi.fn(() => true),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn(() => null),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => null),
}));

describe("AccountsReceivable", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/accounts-receivable",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AccountsReceivable />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/accounts-receivable"],
      }
    );
  };

  it("should render accounts receivable table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
