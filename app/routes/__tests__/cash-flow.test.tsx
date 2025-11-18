import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import CashFlow from "../dashboard/cash-flow";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

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

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
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
                <AuthProvider>
                  <CashFlow />
                </AuthProvider>
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

  beforeEach(() => {
    clearLocalStorage();
    vi.clearAllMocks();
    const mockUser = createMockMainUser();
    vi.mocked(getUserById).mockReturnValue(mockUser);
    setCurrentUserId(mockUser.id);
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });
  });

  it("should render cash flow table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
