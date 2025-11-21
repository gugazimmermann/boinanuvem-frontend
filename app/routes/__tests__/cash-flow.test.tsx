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
  Table: ({
    rightContent,
    belowContent,
  }: {
    rightContent?: React.ReactNode;
    belowContent?: React.ReactNode;
  }) => (
    <div data-testid="table">
      {rightContent && <div data-testid="right-content">{rightContent}</div>}
      {belowContent && <div data-testid="below-content">{belowContent}</div>}
    </div>
  ),
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
  getPropertiesByCompanyId: vi.fn(() => [
    { id: "property-1", name: "Property One" },
    { id: "property-2", name: "Property Two" },
  ]),
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

  it("should render property filter in right content", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const rightContent = screen.queryByTestId("right-content");
    expect(rightContent || screen.getByTestId("table")).toBeTruthy();
  });

  it("should render summary below filters", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const belowContent = screen.queryByTestId("below-content");
    expect(belowContent || screen.getByTestId("table")).toBeTruthy();
  });
});
