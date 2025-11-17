import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import CashFlow from "../dashboard/cash-flow";

vi.mock("~/components/ui", () => ({
  Table: () => <div data-testid="table">Table</div>,
  StatusBadge: () => <div data-testid="status-badge">StatusBadge</div>,
  TableActionButtons: () => <div data-testid="table-action-buttons">TableActionButtons</div>,
  ConfirmationModal: () => <div data-testid="confirmation-modal">ConfirmationModal</div>,
  Alert: () => <div data-testid="alert">Alert</div>,
  Select: () => <div data-testid="select">Select</div>,
}));

vi.mock("~/mocks/cash-flow", () => ({
  mockCashFlow: [],
}));

vi.mock("~/mocks/suppliers", () => ({
  mockSuppliers: [],
}));

vi.mock("~/mocks/buyers", () => ({
  mockBuyers: [],
}));

vi.mock("~/services/cash-flow.service", () => ({
  deleteCashFlow: vi.fn(() => true),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn(() => null),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn(() => null),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn(() => null),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(() => null),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => null),
}));

describe("CashFlow", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/cash-flow",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <CashFlow />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/cash-flow"],
      }
    );
  };

  it("should render cash flow table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
