import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import AccountsReceivable from "../dashboard/accounts-receivable";
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

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
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
                <AuthProvider>
                  <AccountsReceivable />
                </AuthProvider>
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

  it("should render accounts receivable table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
